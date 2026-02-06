import os
import sys
import logging
from datetime import datetime

# Add root folder to path to import config/models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import db
from models import VideoCreate, Video

# Collections
BUNDLES_COLLECTION = "bundles"
VIDEOS_COLLECTION = "videos"

logger = logging.getLogger("migration")
logging.basicConfig(level=logging.INFO)

def migrate_structure():
    """
    Iterates over bundles, extracts video_data, creates video docs, 
    and updates bundles with video_id.
    """
    logger.info("Starting refactor migration: Bundles -> Videos...")
    
    bundles_ref = db.collection(BUNDLES_COLLECTION)
    bundles = list(bundles_ref.stream())
    
    migrated_count = 0
    updated_count = 0
    
    for doc in bundles:
        data = doc.to_dict()
        video_data = data.get("video_data")
        
        if not video_data:
            continue
            
        # 1. Extract info for Video
        url = video_data.get("url", "")
        if not url:
            continue
            
        # Deduce ID from URL (consistent with youtube_sync logic)
        video_id = ""
        if "v=" in url:
            video_id = url.split("v=")[1].split("&")[0]
        elif "be/" in url:
            video_id = url.split("be/")[1].split("?")[0]
            
        if not video_id:
            # Fallback to doc ID if we can't parse
            video_id = f"gen_{doc.id}"

        # 2. Create Video document
        # Check if already exists
        v_doc = db.collection(VIDEOS_COLLECTION).document(video_id).get()
        
        if not v_doc.exists:
            now = datetime.utcnow()
            new_video = {
                "title": data.get("title", "Sem Título"),
                "description": data.get("description", ""),
                "url": url,
                "provider": video_data.get("provider", "youtube"),
                "thumbnail_url": data.get("thumbnail_url"),
                "published_at": data.get("published_at") or now,
                "is_active": data.get("is_active", True),
                "author": data.get("author", "Lamed"),
                "created_at": now,
                "updated_at": now
            }
            db.collection(VIDEOS_COLLECTION).document(video_id).set(new_video)
            migrated_count += 1
            logger.info(f"Created video doc: {video_id}")
            
        # 3. Update Bundle
        # Remove video_data, add video_id
        db.collection(BUNDLES_COLLECTION).document(doc.id).update({
            "video_id": video_id,
            "video_data": None # Or delete field
        })
        updated_count += 1
        logger.info(f"Updated bundle {doc.id} with video_id {video_id}")

    logger.info(f"Migration complete! {migrated_count} videos created, {updated_count} bundles updated.")

if __name__ == "__main__":
    migrate_structure()
