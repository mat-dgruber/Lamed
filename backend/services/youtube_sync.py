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

logger = logging.getLogger("uvicorn")

def get_youtube_service():
    if not YOUTUBE_API_KEY:
        logger.error("YOUTUBE_API_KEY not set!")
        return None
    return build("youtube", "v3", developerKey=YOUTUBE_API_KEY)

def fetch_latest_videos_from_youtube(limit=5):
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
    videos = fetch_latest_videos_from_youtube()
    synced_count = 0
    errors = 0
    
    for vid in videos:
        try:
            # 1. Check if bundle exists with this video URL
            # Note: Ideally we should have an index on 'video_data.url'
            # For now, we do a client-side filter or simple query if index exists.
            # To avoid index requirement errors on init, we'll scan recent documents or rely on a known ID pattern if possible.
            # A safer check without composite index:
            
            # Efficient duplication check: Query by exact field if possible.
            # We will use the video ID as part of a unique check if we stored it separately, 
            # but here we check the URL inside the map (requires index usually).
            
            # Alternative: Search by title (less reliable) or assume we won't import duplicates often.
            # Let's try the query. If it fails due to missing index, we catch it.
            
            query = db.collection(BUNDLES_COLLECTION).where("video_data.url", "==", vid['url']).limit(1)
            docs = list(query.stream())
            
            if docs:
                logger.info(f"Video already exists: {vid['title']}")
                continue
            
            # 2. Parse Date
            try:
                # YouTube API: 2026-01-07T15:59:06Z
                pub_date = datetime.strptime(vid['published_at'].replace("Z", "+00:00"), "%Y-%m-%dT%H:%M:%S%z")
            except ValueError:
                pub_date = datetime.utcnow()

            # 3. Create Bundle Object
            new_bundle = BundleCreate(
                title=vid['title'],
                description=vid['description'][:200] + "...", # Truncate desc for summary
                week_number=0, # To be filled by Admin
                author="Lamed (YouTube)",
                published_at=pub_date,
                video_data=VideoData(
                    url=vid['url'],
                    provider='youtube',
                    duration=0
                ),
                thumbnail_url=vid['thumbnail'],
                is_active=False # Imported as Draft
            )

            # 4. Save to Firestore
            db.collection(BUNDLES_COLLECTION).add(new_bundle.model_dump())
            logger.info(f"Imported new bundle: {vid['title']}")
            synced_count += 1
            
        except Exception as e:
            logger.error(f"Failed to process video {vid['id']}: {e}")
            errors += 1

    return {"status": "completed", "imported": synced_count, "errors": errors}
