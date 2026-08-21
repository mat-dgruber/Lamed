import logging
import os
import re
from datetime import datetime, timezone
from config import db
from google.cloud.firestore import FieldFilter
from googleapiclient.discovery import build
from models import BundleCreate, VideoData


def parse_iso_duration(duration_str: str) -> int:
    if not duration_str:
        return 0
    try:
        import isodate
        return int(isodate.parse_duration(duration_str).total_seconds())
    except Exception:
        pass
    match = re.match(r"^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$", duration_str)
    if not match:
        return 0
    days = int(match.group(1) or 0)
    hours = int(match.group(2) or 0)
    minutes = int(match.group(3) or 0)
    seconds = int(match.group(4) or 0)
    return days * 86400 + hours * 3600 + minutes * 60 + seconds

# Settings
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY") or os.getenv("GOOGLE_API_KEY")
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
        channel_response = (
            service.channels().list(part="contentDetails", id=CHANNEL_ID).execute()
        )

        if not channel_response.get("items"):
            logger.error(f"Channel {CHANNEL_ID} not found")
            return []

        uploads_playlist_id = channel_response["items"][0]["contentDetails"][
            "relatedPlaylists"
        ]["uploads"]

        # 2. Get the latest videos from that playlist
        request = service.playlistItems().list(
            part="snippet", playlistId=uploads_playlist_id, maxResults=limit
        )
        response = request.execute()

        items = response.get("items", [])
        if not items:
            return []

        video_ids = [item["snippet"]["resourceId"]["videoId"] for item in items]
        video_ids_str = ",".join(video_ids)

        # Fetch video contentDetails for duration
        details_by_id = {}
        try:
            videos_detail_response = (
                service.videos()
                .list(part="contentDetails,snippet", id=video_ids_str)
                .execute()
            )
            for item in videos_detail_response.get("items", []):
                vid_id = item.get("id")
                if vid_id:
                    details_by_id[vid_id] = item
        except Exception as e:
            logger.warning(f"Could not fetch video details for duration: {e}")

        videos = []
        for item in items:
            snippet = item["snippet"]
            video_id = snippet["resourceId"]["videoId"]

            title = snippet.get("title", "")
            description = snippet.get("description", "")
            url = f"https://www.youtube.com/watch?v={video_id}"

            detail = details_by_id.get(video_id, {})
            duration_str = detail.get("contentDetails", {}).get("duration", "")
            duration_sec = parse_iso_duration(duration_str)

            title_lower = title.lower()
            desc_lower = description.lower()
            url_lower = url.lower()

            contains_shorts_keyword = (
                "shorts" in title_lower
                or "#shorts" in title_lower
                or "shorts" in desc_lower
                or "#shorts" in desc_lower
                or "shorts" in url_lower
                or "#shorts" in url_lower
            )

            is_short = (0 < duration_sec <= 60) or contains_shorts_keyword

            thumbnail_info = snippet.get("thumbnails", {})
            thumb_url = (
                thumbnail_info.get("high")
                or thumbnail_info.get("default")
                or {}
            ).get("url", "")

            videos.append(
                {
                    "id": video_id,
                    "title": title,
                    "description": description,
                    "url": url,
                    "thumbnail": thumb_url,
                    "published_at": snippet.get("publishedAt", ""),
                    "is_short": is_short,
                    "duration": duration_sec,
                }
            )
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
        return {
            "status": "error",
            "message": f"Failed to fetch videos from YouTube: {str(e)}",
        }

    synced_count = 0
    errors = 0

    for vid in videos:
        try:
            video_id = vid["id"]

            # 1. Save to VIDEOS Collection (Upsert)
            video_ref = db.collection(VIDEOS_COLLECTION).document(video_id)
            v_doc = video_ref.get()

            now = datetime.now(timezone.utc)
            video_data = {
                "title": vid["title"],
                "description": vid["description"],
                "url": vid["url"],
                "provider": "youtube",
                "thumbnail_url": vid["thumbnail"],
                "published_at": (
                    datetime.strptime(
                        vid["published_at"].replace("Z", "+00:00"),
                        "%Y-%m-%dT%H:%M:%S%z",
                    )
                    if "Z" in vid["published_at"]
                    else now
                ),
                "is_active": True,
                "is_short": vid.get("is_short", False),
                "author": "Lamed",
                "updated_at": now,
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
            bundle_query = (
                db.collection(BUNDLES_COLLECTION)
                .where(filter=FieldFilter("video_id", "==", video_id))
                .limit(1)
            )
            bundle_docs = list(bundle_query.stream())

            if not bundle_docs:
                pub_date = video_data["published_at"]

                new_bundle = {
                    "title": vid["title"],
                    "description": vid["description"][:200] + "...",
                    "week_number": 0,
                    "author": "Lamed",
                    "published_at": pub_date,
                    "video_id": video_id,
                    "thumbnail_url": vid["thumbnail"],
                    "is_active": False,  # Draft
                    "created_at": pub_date,  # Use video publish date for sorting
                    "updated_at": now,
                    "resources": [
                        {"title": "PDF Geral da Lição", "type": "pdf", "url": ""},
                        {"title": "Apresentação PowerPoint / Slides", "type": "slides", "url": ""},
                        {"title": "Infográfico Principal", "type": "infografico", "url": ""},
                        {"title": "Infográfico Secundário", "type": "infografico", "url": ""},
                        {"title": "Vídeo Extra Complementar", "type": "video", "url": ""},
                        {"title": "Podcast / Áudio de Estudo", "type": "audio", "url": ""}
                    ],
                    "related_video_urls": []
                }

                db.collection(BUNDLES_COLLECTION).add(new_bundle)
                logger.info(f"Created draft bundle for video: {vid['title']}")
                synced_count += 1
            else:
                logger.debug(f"Bundle already exists for video {video_id}")
                # Optional: Update existing bundle if needed
                # doc = bundle_docs[0]
                # doc.reference.update({"video_id": video_id})

        except Exception as e:
            logger.error(f"Failed to process video {vid['id']}: {e}")
            errors += 1

    # Soft-delete auto-deactivation: query active YouTube videos in Firestore
    # and deactivate any video missing from the fetched list only if confirmed deleted/missing on YouTube
    fetched_ids = {v["id"] for v in videos}
    try:
        active_videos_query = db.collection(VIDEOS_COLLECTION).where(
            filter=FieldFilter("is_active", "==", True)
        )
        active_docs = list(active_videos_query.stream())
        candidate_missing_docs = [
            doc for doc in active_docs if doc.id not in fetched_ids
        ]
        if candidate_missing_docs:
            try:
                service = get_youtube_service()
                if service:
                    still_existing_ids = set()
                    missing_ids = [doc.id for doc in candidate_missing_docs]
                    for i in range(0, len(missing_ids), 50):
                        chunk_ids = missing_ids[i : i + 50]
                        response = (
                            service.videos()
                            .list(part="id,status", id=",".join(chunk_ids))
                            .execute()
                        )
                        for item in response.get("items", []):
                            if item.get("id"):
                                still_existing_ids.add(item["id"])

                    now = datetime.now(timezone.utc)
                    for doc in candidate_missing_docs:
                        if doc.id not in still_existing_ids:
                            doc.reference.update(
                                {"is_active": False, "updated_at": now}
                            )
                            logger.info(
                                f"Deactivated video {doc.id} as it was removed from YouTube"
                            )
            except Exception as service_err:
                logger.error(
                    f"Failed to verify video status with YouTube API: {service_err}"
                )
    except Exception as e:
        logger.error(f"Failed to auto-deactivate missing videos: {e}")

    return {"status": "completed", "imported": synced_count, "errors": errors}
