import os
import logging
from datetime import datetime
from googleapiclient.discovery import build
from models import BundleCreate, VideoData
from config import db

# Settings
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
CHANNEL_ID = "UC2PYvVmcJBLt9ymvBpnXO9A"  # Lamed Channel
BUNDLES_COLLECTION = "bundles"
VIDEOS_COLLECTION = "videos"

logger = logging.getLogger("uvicorn")

def get_youtube_service():
    if not YOUTUBE_API_KEY:
        logger.error("YOUTUBE_API_KEY not set!")
        return None
    return build("youtube", "v3", developerKey=YOUTUBE_API_KEY)

def fetch_latest_videos_from_youtube(limit=20):
    """
    Fetches the latest interactions (videos) from the channel.
    """
    service = get_youtube_service()
    if not service:
        return []

    try:
        # Search for latest videos in the channel
        request = service.search().list(
            part="snippet",
            channelId=CHANNEL_ID,
            maxResults=limit,
            order="date",
            type="video"
        )
        response = request.execute()

        videos = []
        for item in response.get("items", []):
            video_id = item["id"]["videoId"]
            snippet = item["snippet"]
            
            videos.append({
                "id": video_id,
                "title": snippet["title"],
                "description": snippet["description"],
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "thumbnail": snippet["thumbnails"]["high"]["url"],
                "published_at": snippet["publishedAt"]  # ISO format string
            })
        return videos

    except Exception as e:
        logger.error(f"Error fetching YouTube videos: {e}")
        return []

def sync_videos():
    """
    Orchestrates the sync process.
    """
    logger.info("Starting YouTube Sync...")
    videos = fetch_latest_videos_from_youtube(limit=20)
    synced_count = 0
    errors = 0
    
    for vid in videos:
        try:
            video_id = vid['id']
            
            # 1. Save to VIDEOS Collection (Upsert)
            video_ref = db.collection(VIDEOS_COLLECTION).document(video_id)
            v_doc = video_ref.get()
            
            now = datetime.utcnow()
            video_data = {
                "title": vid['title'],
                "description": vid['description'],
                "url": vid['url'],
                "provider": "youtube",
                "thumbnail_url": vid['thumbnail'],
                "published_at": datetime.strptime(vid['published_at'].replace("Z", "+00:00"), "%Y-%m-%dT%H:%M:%S%z") if 'Z' in vid['published_at'] else now,
                "is_active": True,
                "author": "Lamed (YouTube)",
                "updated_at": now
            }
            
            if not v_doc.exists:
                video_data["created_at"] = now
                video_ref.set(video_data)
                logger.info(f"Created video: {vid['title']}")
            else:
                video_ref.update(video_data)
                logger.info(f"Updated video info: {vid['title']}")

            # 2. Check and Create Bundle (Draft)
            # We check if a bundle already points to this video_id
            bundle_query = db.collection(BUNDLES_COLLECTION).where("video_id", "==", video_id).limit(1)
            bundle_docs = list(bundle_query.stream())
            
            if not bundle_docs:
                pub_date = video_data["published_at"]
                
                new_bundle = {
                    "title": vid['title'],
                    "description": vid['description'][:200] + "...",
                    "week_number": 0,
                    "author": "Lamed (YouTube)",
                    "published_at": pub_date,
                    "video_id": video_id,
                    "thumbnail_url": vid['thumbnail'],
                    "is_active": False, # Draft
                    "created_at": now,
                    "updated_at": now,
                    "resources": []
                }
                
                db.collection(BUNDLES_COLLECTION).add(new_bundle)
                logger.info(f"Created draft bundle for video: {vid['title']}")
                synced_count += 1
            else:
                logger.debug(f"Bundle already exists for video {video_id}")

        except Exception as e:
            logger.error(f"Failed to process video {vid['id']}: {e}")
            errors += 1

    return {"status": "completed", "imported": synced_count, "errors": errors}
