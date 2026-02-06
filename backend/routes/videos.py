from fastapi import APIRouter, HTTPException
from typing import List
from models import Video
from config import db
from datetime import datetime

router = APIRouter()
VIDEOS_COLLECTION = "videos"

@router.get("/", response_model=List[Video])
def get_videos(limit: int = 50, offset: int = 0):
    """
    Returns a list of videos from the independent collection.
    """
    try:
        query = db.collection(VIDEOS_COLLECTION).order_by("published_at", direction="DESCENDING").limit(limit).offset(offset)
        docs = query.stream()
        
        videos = []
        for doc in docs:
            v_data = doc.to_dict()
            v_data["id"] = doc.id
            videos.append(v_data)
        return videos
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{video_id}", response_model=Video)
def get_video(video_id: str):
    """
    Returns details of a specific video.
    """
    doc = db.collection(VIDEOS_COLLECTION).document(video_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Video not found")
    
    v_data = doc.to_dict()
    v_data["id"] = doc.id
    return v_data
