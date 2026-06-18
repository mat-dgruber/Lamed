import logging
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from google.cloud.firestore import Query as FirestoreQuery, FieldFilter
from models import Video
from config import db

router = APIRouter()
VIDEOS_COLLECTION = "videos"
logger = logging.getLogger(__name__)


def _map_video_response(doc_id: str, data: dict) -> dict:
    data["id"] = doc_id
    now_utc = datetime.now(timezone.utc)
    
    pub_at = data.get("published_at")
    if not pub_at:
        pub_at = now_utc
    elif isinstance(pub_at, datetime) and pub_at.tzinfo is None:
        pub_at = pub_at.replace(tzinfo=timezone.utc)
        
    if not data.get("created_at"):
        data["created_at"] = pub_at
    elif isinstance(data["created_at"], datetime) and data["created_at"].tzinfo is None:
        data["created_at"] = data["created_at"].replace(tzinfo=timezone.utc)
        
    if not data.get("updated_at"):
        data["updated_at"] = pub_at
    elif isinstance(data["updated_at"], datetime) and data["updated_at"].tzinfo is None:
        data["updated_at"] = data["updated_at"].replace(tzinfo=timezone.utc)
        
    if isinstance(pub_at, datetime):
        data["published_at"] = pub_at
        
    return data


@router.get("/", response_model=List[Video])
def get_videos(
    limit: int = 50,
    start_after_id: Optional[str] = None,
    only_active: bool = True,
):
    """
    Returns a list of videos from the independent collection using cursor pagination.
    """
    # Prevent DoS
    limit = min(limit, 100)
    
    try:
        query = db.collection(VIDEOS_COLLECTION)
        
        if only_active:
            query = query.where(filter=FieldFilter("is_active", "==", True))
            
        query = query.order_by("published_at", direction=FirestoreQuery.DESCENDING)
        
        if start_after_id:
            last_doc = db.collection(VIDEOS_COLLECTION).document(start_after_id).get()
            if last_doc.exists:
                query = query.start_after(last_doc)
                
        query = query.limit(limit)
        docs = query.stream()
        
        videos = []
        for doc in docs:
            v_data = doc.to_dict()
            mapped = _map_video_response(doc.id, v_data)
            videos.append(mapped)
        return videos
    except Exception as e:
        logger.error(f"Error fetching videos list: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{video_id}", response_model=Video)
def get_video(video_id: str):
    """
    Returns details of a specific video.
    """
    try:
        doc = db.collection(VIDEOS_COLLECTION).document(video_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Video not found")
        
        v_data = doc.to_dict()
        return _map_video_response(doc.id, v_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching video details for {video_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

