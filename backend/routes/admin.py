from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from config import settings
from api.dependencies import get_admin, get_storage_bucket
import shutil
import os

router = APIRouter(dependencies=[Depends(get_admin)])


@router.post("/upload-url")
def generate_upload_url(filename: str, content_type: str, _admin=Depends(get_admin)):
    """
    Gera Signed URL do Firebase Storage para o frontend fazer upload direto.
    Requer Bearer ID Token com custom claim `admin: True`.
    """
    if not filename or "/" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="invalid filename")
    bucket = get_storage_bucket()
    blob = bucket.blob(f"uploads/{filename}")
    url = blob.generate_signed_url(
        version="v4",
        expiration=timedelta(minutes=15),
        method="PUT",
        content_type=content_type or "application/octet-stream",
    )
    public_url = (
        f"https://firebasestorage.googleapis.com/v0/b/{bucket.name}/o/"
        f"uploads%2F{filename}?alt=media"
    )
    return {"upload_url": url, "public_url": public_url}


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Endpoint de upload direto (legado, dev only). Mantido por compatibilidade."""
    return {"filename": file.filename, "url": f"https://storage.googleapis.com/mock-bucket/{file.filename}"}


@router.post("/sync-youtube")
def trigger_sync(_admin=Depends(get_admin)):
    """Aciona manualmente o sync do YouTube. Requer admin."""
    from services.youtube_sync import sync_videos
    result = sync_videos()
    return {"status": "success", "data": result}
