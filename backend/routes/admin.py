import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Body
from pydantic import BaseModel
from google.cloud.firestore import Query as FirestoreQuery
from config import db, settings
from models import Video
from routes.videos import _map_video_response
from api.dependencies import get_admin, get_storage_bucket
import shutil
import os

logger = logging.getLogger(__name__)

router = APIRouter(dependencies=[Depends(get_admin)])


class VideoPatchRequest(BaseModel):
    is_active: Optional[bool] = None
    is_short: Optional[bool] = None


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


@router.get("/videos/", response_model=List[Video])
def get_admin_videos(limit: int = 100, _admin=Depends(get_admin)):
    """
    Returns a list of all videos (including inactive ones) ordered by published_at DESC.
    """
    limit = min(limit, 100)
    try:
        query = db.collection("videos").order_by("published_at", direction=FirestoreQuery.DESCENDING).limit(limit)
        docs = query.stream()
        videos = []
        for doc in docs:
            v_data = doc.to_dict()
            mapped = _map_video_response(doc.id, v_data)
            videos.append(mapped)
        return videos
    except Exception as e:
        logger.error(f"Error fetching admin videos list: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.patch("/videos/{video_id}", response_model=Video)
def update_video_status(
    video_id: str,
    body: Optional[VideoPatchRequest] = Body(None),
    is_active: Optional[bool] = None,
    is_short: Optional[bool] = None,
    _admin=Depends(get_admin),
):
    """
    Updates a video's status (is_active, is_short). Accepts body or query params.
    """
    try:
        doc_ref = db.collection("videos").document(video_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Video not found")

        update_data = {}
        if body:
            if body.is_active is not None:
                update_data["is_active"] = body.is_active
            if body.is_short is not None:
                update_data["is_short"] = body.is_short

        if is_active is not None:
            update_data["is_active"] = is_active
        if is_short is not None:
            update_data["is_short"] = is_short

        data = doc.to_dict() or {}
        if update_data:
            update_data["updated_at"] = datetime.now(timezone.utc)
            doc_ref.update(update_data)
            data.update(update_data)

        return _map_video_response(video_id, data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating video {video_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
