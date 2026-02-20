import json
import os
import sys
from datetime import datetime
from google.cloud import firestore

# Add parent dir to path to import models if needed, though we can use dicts for speed
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Mocking a basic config if not running in full backend env
# But better use the same config logic
from config import db

JSON_PATH = "../frontend/src/assets/videos.json"
COLLECTION = "bundles"

def migrate():
    print(f"Absolute path to JSON: {os.path.abspath(JSON_PATH)}")
    if not os.path.exists(JSON_PATH):
        print(f"Error: {JSON_PATH} not found.")
        return

    try:
        # Some files might have BOM or specific encodings in Windows
        with open(JSON_PATH, 'r', encoding='utf-8-sig') as f:
            videos = json.load(f)
    except Exception as e:
        print(f"Error loading JSON: {e}")
        return

    total_in_json = len(videos)
    print(f"Loaded {total_in_json} videos from JSON.")
    
    count = 0
    skipped = 0
    errors = 0
    
    for i, item in enumerate(videos):
        try:
            snippet = item.get("snippet", {})
            video_id = item.get("id", {}).get("videoId")
            
            if not video_id: 
                # print(f"Item {i} missing ID")
                continue
            
            url = f"https://www.youtube.com/watch?v={video_id}"
            
            # Check if already exists in Firestore
            exists = list(db.collection(COLLECTION).where("video_data.url", "==", url).limit(1).stream())
            if exists:
                skipped += 1
                continue

            # Parse date
            try:
                date_str = snippet.get("publishedAt")
                if date_str:
                    pub_date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                else:
                    pub_date = datetime.utcnow()
            except:
                pub_date = datetime.utcnow()

            # Create Bundle document
            doc = {
                "title": snippet.get("title", "Sem Título"),
                "description": snippet.get("description", "")[:1000],
                "week_number": 0,
                "author": "Lamed (YouTube Archiver)",
                "published_at": pub_date,
                "video_data": {
                    "url": url,
                    "provider": "youtube",
                    "duration": 0
                },
                "thumbnail_url": snippet.get("thumbnails", {}).get("high", {}).get("url") or \
                                snippet.get("thumbnails", {}).get("medium", {}).get("url") or \
                                snippet.get("thumbnails", {}).get("default", {}).get("url"),
                "is_active": True, # Historical videos are active for the gallery
                "resources": [],
                "article_content": "",
                "category": "video",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }

            db.collection(COLLECTION).add(doc)
            count += 1
            if count % 10 == 0:
                print(f"Migrated {count}...")
        
        except Exception as e:
            print(f"Error processing item {i}: {e}")
            errors += 1

    print(f"Migration completed!")
    print(f"Total processed: {total_in_json}")
    print(f"Migrated: {count}")
    print(f"Skipped (already exists): {skipped}")
    print(f"Errors: {errors}")

if __name__ == "__main__":
    migrate()
