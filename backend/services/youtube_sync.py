from datetime import datetime
from ..models import BundleCreate, VideoData
from ..config import db

BUNDLES_COLLECTION = "bundles"

def fetch_latest_videos_from_youtube(channel_id: str):
    """
    Mock function. In production, use 'google-api-python-client' to fetch data.
    """
    # TODO: Implement actual YouTube API call
    return [
        {
            "id": "mock_vid_1",
            "title": "Semana X: Estudo da Torá (Automático)",
            "description": "Vídeo importado automaticamente.",
            "url": "https://youtube.com/watch?v=mock_vid_1",
            "published_at": datetime.utcnow()
        }
    ]

def sync_videos():
    """
    Fetches videos and creates Draft Bundles if they don't exist.
    """
    videos = fetch_latest_videos_from_youtube("YOUR_CHANNEL_ID")
    results = []

    for vid in videos:
        # Check if bundle with this video URL already exists
        # Note: In real app, querying by video_data.url might need an index
        # Or we store 'youtube_id' field.
        
        # For prototype, we just skip check or assume check:
        # existing = db.collection(BUNDLES_COLLECTION).where("video_data.url", "==", vid['url']).get()
        # if existing: continue
        
        new_bundle = BundleCreate(
            title=vid['title'],
            description=vid['description'],
            week_number=0, # Needs manual assignment
            author="YouTube Sync",
            published_at=vid['published_at'],
            video_data=VideoData(
                url=vid['url'],
                provider='youtube',
                duration=0
            ),
            is_active=False # Draft mode
        )
        
        # Add to Firestore
        update_time, doc_ref = db.collection(BUNDLES_COLLECTION).add(new_bundle.model_dump())
        results.append(doc_ref.id)
        
    return {"synced_count": len(results), "ids": results}
