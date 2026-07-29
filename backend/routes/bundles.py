import concurrent.futures
from datetime import datetime, timezone
import io
import re
from typing import List, Optional
import urllib.request
import zipfile

from config import db
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from google.cloud.firestore import Query as FirestoreQuery, FieldFilter
from models import Bundle, BundleCreate
from api.dependencies import get_admin

router = APIRouter()

BUNDLES_COLLECTION = "bundles"


@router.get("/", response_model=List[Bundle])
def get_bundles(
    limit: int = 10, start_after_id: Optional[str] = None, only_active: bool = True
):
    query = db.collection(BUNDLES_COLLECTION)

    if only_active:
        query = query.where(filter=FieldFilter("is_active", "==", True))

    # Ordering by published_at descending (newest first), then by week_number
    query = query.order_by("published_at", direction=FirestoreQuery.DESCENDING).order_by(
        "week_number", direction=FirestoreQuery.DESCENDING
    )
    
    if start_after_id:
        last_doc = db.collection(BUNDLES_COLLECTION).document(start_after_id).get()
        if last_doc.exists:
            query = query.start_after(last_doc)

    query = query.limit(limit)

    try:
        docs = query.stream()
        bundles = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            bundles.append(data)

        return bundles
    except Exception as e:
        print(f"Error fetching bundles: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/latest", response_model=Optional[Bundle])
def get_latest_bundle():
    try:
        query = (
            db.collection(BUNDLES_COLLECTION)
            .where(filter=FieldFilter("is_active", "==", True))
            .order_by("published_at", direction=FirestoreQuery.DESCENDING)
            .order_by("week_number", direction=FirestoreQuery.DESCENDING)
            .limit(1)
        )

        docs = list(query.stream())
        if not docs:
            return None

        data = docs[0].to_dict()
        data["id"] = docs[0].id
        return data
    except Exception as e:
        print(f"Error fetching latest bundle: {e}")
        # Return 500 but log the error which likely contains the Index Creation URL
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{bundle_id}", response_model=Bundle)
def get_bundle(bundle_id: str):
    doc_ref = db.collection(BUNDLES_COLLECTION).document(bundle_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Bundle not found")

    data = doc.to_dict()
    data["id"] = doc.id
    return data


@router.post("/", response_model=Bundle)
def create_bundle(bundle_in: BundleCreate, _admin=Depends(get_admin)):
    # Auth via Depends(get_admin); token validated, admin claim enforced.

    data = bundle_in.model_dump()
    data["created_at"] = datetime.now(timezone.utc)
    data["updated_at"] = datetime.now(timezone.utc)

    # Default published_at to current time if missing/None
    if not data.get("published_at"):
        data["published_at"] = datetime.now(timezone.utc)

    # Auto-assign generic thumbnail if missing
    if not data.get("thumbnail_url"):
        data["thumbnail_url"] = "https://placehold.co/600x400?text=Bundle"

    update_time, doc_ref = db.collection(BUNDLES_COLLECTION).add(data)

    # Fetch back to return complete object
    data["id"] = doc_ref.id
    return data


@router.put("/{bundle_id}", response_model=Bundle)
def update_bundle(bundle_id: str, bundle_in: BundleCreate, _admin=Depends(get_admin)):
    doc_ref = db.collection(BUNDLES_COLLECTION).document(bundle_id)
    
    data = bundle_in.model_dump()
    data["updated_at"] = datetime.now(timezone.utc)

    try:
        doc_ref.update(data)
    except Exception:
        raise HTTPException(status_code=404, detail="Bundle not found")

    updated_doc = doc_ref.get().to_dict()
    updated_doc["id"] = bundle_id
    return updated_doc


@router.delete("/{bundle_id}", status_code=204)
def delete_bundle(bundle_id: str, _admin=Depends(get_admin)):
    doc_ref = db.collection(BUNDLES_COLLECTION).document(bundle_id)
    doc_ref.delete()
    return None


def get_google_drive_file_id(url: str) -> Optional[str]:
    if not url or "drive.google.com" not in url:
        return None
    d_match = re.search(r"/d/([a-zA-Z0-9_-]+)", url)
    if d_match:
        return d_match.group(1)
    id_match = re.search(r"[?&]id=([a-zA-Z0-9_-]+)", url)
    if id_match:
        return id_match.group(1)
    return None


def download_file_content(url: str) -> bytes:
    file_id = get_google_drive_file_id(url)
    if file_id:
        # Google Drive Download
        download_url = f"https://drive.google.com/uc?export=download&id={file_id}"
        req = urllib.request.Request(
            download_url,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        )
        with urllib.request.urlopen(req, timeout=20) as response:
            content = response.read()
            # Handle large file confirm page
            if b"confirm=" in content:
                confirm_match = re.search(r'confirm=([a-zA-Z0-9_]+)', content.decode('utf-8', errors='ignore'))
                if confirm_match:
                    confirm_token = confirm_match.group(1)
                    confirm_url = f"https://drive.google.com/uc?export=download&id={file_id}&confirm={confirm_token}"
                    req_confirm = urllib.request.Request(
                        confirm_url,
                        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
                    )
                    with urllib.request.urlopen(req_confirm, timeout=20) as response_confirm:
                        return response_confirm.read()
            return content
    else:
        # Standard HTTP Download
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        )
        with urllib.request.urlopen(req, timeout=20) as response:
            return response.read()


@router.get("/{bundle_id}/download-zip")
def download_bundle_zip(bundle_id: str):
    doc_ref = db.collection(BUNDLES_COLLECTION).document(bundle_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Bundle not found")

    bundle_data = doc.to_dict()
    resources = bundle_data.get("resources", [])
    if not resources:
        raise HTTPException(status_code=400, detail="No resources in this bundle")

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        # Add LEIA-ME.txt
        readme_content = (
            f"Estudos Bíblicos - Lamed\n\n"
            f"Lição: {bundle_data.get('title')}\n"
            f"Número: {bundle_data.get('week_number')}\n"
            f"Autor: {bundle_data.get('author', 'Lamed')}\n\n"
            f"Este arquivo compactado contém os materiais de apoio para o seu estudo.\n"
            f"Agradecemos por usar o Lamed para crescer no conhecimento da Bíblia!\n\n"
            f"---------------------------------------------------------\n"
            f"🌱 SOBRE O LAMED & NOSSO PROPÓSITO\n"
            f"---------------------------------------------------------\n"
            f"O Lamed é uma associação sem fins lucrativos dedicada a compartilhar\n"
            f"o conhecimento bíblico de forma acessível e transformadora. Nosso foco\n"
            f"é produzir conteúdo de qualidade que edifique e transforma vidas.\n\n"
            f"---------------------------------------------------------\n"
            f"🤝 TRANSPARÊNCIA E DESTINAÇÃO DOS RECURSOS\n"
            f"---------------------------------------------------------\n"
            f"Cada doação recebida é utilizada de forma consciente e auditada:\n"
            f"- 55% dos recursos são direcionados a projetos sociais e missionários.\n"
            f"- 45% permanecem em caixa para o desenvolvimento de novos conteúdos,\n"
            f"  manutenção da plataforma e despesas operacionais.\n\n"
            f"---------------------------------------------------------\n"
            f"💖 COMO APOIAR O NOSSO MINISTÉRIO\n"
            f"---------------------------------------------------------\n"
            f"Se este material tem abençoado sua vida e você deseja nos apoiar para\n"
            f"que possamos alcançar ainda mais pessoas, veja como ajudar:\n\n"
            f"1. COMPARTILHE: Espalhe a Palavra compartilhando este estudo!\n"
            f"   Acesse a lição online em: https://lamed148.com.br/bundle/{bundle_id}\n\n"
            f"2. SEJA MEMBRO NO YOUTUBE: Com uma pequena contribuição mensal,\n"
            f"   você nos ajuda a manter a produção semanal ativa. Acesse nosso canal\n"
            f"   e clique em \"Seja Membro\":\n"
            f"   https://www.youtube.com/channel/UC2PYvVmcJBLt9ymvBpnXO9A/join\n\n"
            f"3. VALEU DEMAIS!: Faça uma contribuição única no YouTube usando o botão\n"
            f"   \"Valeu demais!\" abaixo de qualquer um dos nossos vídeos.\n\n"
            f"Sua generosidade é o que nos move. Obrigado por fazer parte desta missão!"
        )
        zip_file.writestr("LEIA-ME.txt", readme_content)

        def download_resource(res):
            url = res.get("url")
            title = res.get("title")
            res_type = res.get("type", "file")
            if not url:
                return None
            try:
                # Fetch file content
                file_data = download_file_content(url)

                # Get filename and extension
                res_type_lower = res_type.lower()
                extension = "bin"
                
                if "pdf" in res_type_lower:
                    extension = "pdf"
                elif "audio" in res_type_lower or "mp3" in res_type_lower:
                    extension = "mp3"
                elif "video" in res_type_lower or "mp4" in res_type_lower:
                    extension = "mp4"
                elif "slides" in res_type_lower or "pptx" in res_type_lower or "presentation" in res_type_lower:
                    extension = "pptx"
                elif "infografico" in res_type_lower or "infographic" in res_type_lower or "image" in res_type_lower:
                    extension = "png"
                elif "mapa_mental" in res_type_lower or "map" in res_type_lower:
                    extension = "pdf"
                elif "guia" in res_type_lower or "doc" in res_type_lower:
                    extension = "pdf"

                # Extract from URL if present
                url_path = url.split("?")[0]
                last_segment = url_path.split("/")[-1]
                if "." in last_segment:
                    ext_candidate = last_segment.split(".")[-1].lower()
                    if len(ext_candidate) >= 2 and len(ext_candidate) <= 4:
                        extension = ext_candidate

                filename = f"{title}.{extension}"
                # Sanitize filename
                for char in ['/', '\\', '?', '%', '*', ':', '|', '"', '<', '>', ' ']:
                    filename = filename.replace(char, '_')

                return filename, file_data
            except Exception as e:
                print(f"Error downloading resource {url}: {e}")
                return None

        # Download resources concurrently in up to 5 threads
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            results = list(executor.map(download_resource, resources))

        for result in results:
            if result:
                filename, file_data = result
                zip_file.writestr(filename, file_data)

    zip_buffer.seek(0)
    safe_title = "".join([c if c.isalnum() else "_" for c in bundle_data.get("title", "bundle")])
    
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename={safe_title}_resources.zip",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )
