import logging
import os
from datetime import datetime

from config import db
from googleapiclient.discovery import build
from models import BundleCreate, VideoData

# Settings
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
CHANNEL_ID = "UC2PYvVmcJBLt9ymvBpnXO9A"  # Lamed Channel
BUNDLES_COLLECTION = "bundles"
VIDEOS_COLLECTION = "videos"

logger = logging.getLogger("uvicorn")

def get_youtube_service():
    if not YOUTUBE_API_KEY:
        raise ValueError("YOUTUBE_API_KEY environment variable is not set")
    return build("youtube", "v3", developerKey=YOUTUBE_API_KEY)

def fetch_latest_videos_from_youtube(limit=20):
    """
    Fetches the latest videos from the channel's 'uploads' playlist.
    This is more reliable than the search API.
    """
    service = get_youtube_service()
    if not service:
        return []

    try:
        # 1. Get the 'uploads' playlist ID for the channel
        channel_response = service.channels().list(
            part="contentDetails",
            id=CHANNEL_ID
        ).execute()

        if not channel_response.get("items"):
            logger.error(f"Channel {CHANNEL_ID} not found")
            return []

        uploads_playlist_id = channel_response["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]

        # 2. Get the latest videos from that playlist
        request = service.playlistItems().list(
            part="snippet",
            playlistId=uploads_playlist_id,
            maxResults=limit
        )
        response = request.execute()

        videos = []
        for item in response.get("items", []):
            snippet = item["snippet"]
            video_id = snippet["resourceId"]["videoId"]
            
            videos.append({
                "id": video_id,
                "title": snippet["title"],
                "description": snippet["description"],
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "thumbnail": snippet["thumbnails"].get("high", snippet["thumbnails"].get("default"))["url"],
                "published_at": snippet["publishedAt"]  # ISO format string
            })
        return videos

    except Exception as e:
        logger.error(f"Error fetching YouTube videos: {e}")
        raise e

def sync_videos():
    """
    Orchestrates the sync process.
    """
    logger.info("Starting YouTube Sync...")
    try:
        videos = fetch_latest_videos_from_youtube(limit=20)
    except Exception as e:
        logger.error(f"Sync failed during fetch: {e}")
        return {"status": "error", "message": f"Failed to fetch videos from YouTube: {str(e)}"}
        
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
                    "created_at": pub_date, # Use video publish date for sorting
                    "updated_at": now,
                    "resources": []
                }
                
                db.collection(BUNDLES_COLLECTION).add(new_bundle)
                logger.info(f"Created draft bundle for video: {vid['title']}")
                synced_count += 1
            else:
                logger.debug(f"Bundle already exists for video {video_id}")
                # Optional: Update existing bundle if needed
                # doc = bundle_docs[0]
                # doc.reference.update({"video_id": video_id})
            else:
                logger.debug(f"Bundle already exists for video {video_id}")

        except Exception as e:
            logger.error(f"Failed to process video {vid['id']}: {e}")
            errors += 1

    return {"status": "completed", "imported": synced_count, "errors": errors}
