import json
import os
import sys
from datetime import datetime
from bs4 import BeautifulSoup

# Add backend root to sys.path to allow importing config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import firebase_admin
from firebase_admin import credentials, firestore

# Add backend root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Initialize Firebase directly to avoid config.py mismatch issues
# We found a key at ../certs/serviceAccountKey
import firebase_admin
from firebase_admin import credentials, firestore
import traceback

# Add backend root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

print("Initializing Firebase...", flush=True)

try:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    KEY_PATH = os.path.join(BASE_DIR, 'certs', 'serviceAccountKey')
    
    if os.path.exists(KEY_PATH):
        print(f"[Key] Loading Credential from {KEY_PATH}", flush=True)
        cred = credentials.Certificate(KEY_PATH)
        # Check project ID from cert
        try:
            # pydantic/json load might be safe
            with open(KEY_PATH, 'r') as kf:
                key_data = json.load(kf)
                print(f"[Info] Certified Project ID: {key_data.get('project_id')}", flush=True)
        except:
            pass
            
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred, {
                 'storageBucket': 'novo-lamed-angular.firebasestorage.app'
            })
            print("[OK] App Initialized", flush=True)
        
        db = firestore.client()
        print("[OK] Firestore Client Created", flush=True)
    else:
        print("[Warning] Key not found, trying config...", flush=True)
        from config import db

except Exception as e:
    print("[Error] CRITICAL INIT ERROR:", flush=True)
    traceback.print_exc()
    sys.exit(1)

def migrate_articles():
    print("[Start] Starting Articles Migration...")
    
    # Paths
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    FRONTEND_ASSETS_DIR = os.path.join(BASE_DIR, 'frontend', 'public', 'assets')
    JSON_PATH = os.path.join(FRONTEND_ASSETS_DIR, 'articles.json')
    
    print(f"[Dir] Assets Directory: {FRONTEND_ASSETS_DIR}")
    
    if not os.path.exists(JSON_PATH):
        print(f"[Error] articles.json not found at {JSON_PATH}")
        return

    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        articles_data = json.load(f)
        
    print(f"[File] Found {len(articles_data)} articles to migrate.")
    
    batch = db.batch()
    count = 0
    
    for item in articles_data:
        article_id = item.get('id')
        title = item.get('title')
        content_path_ref = item.get('contentPath') # e.g. assets/Artigos/file.html
        
        # Resolve HTML file path
        # The JSON points to assets/Artigos/ but files seem to be in assets/ based on analysis
        filename = os.path.basename(content_path_ref)
        html_file_path = os.path.join(FRONTEND_ASSETS_DIR, filename)
        
        content_html = ""
        try:
            if not os.path.exists(html_file_path):
                print(f"[Warning] Content file not found for '{title}' ({article_id})")
                print(f"   Expected at: {html_file_path}")
                continue
                
            with open(html_file_path, 'r', encoding='utf-8') as html_file:
                raw_html = html_file.read()
                
            # Parse HTML to extract only the content
            soup = BeautifulSoup(raw_html, 'html.parser')
            
            # Try to find .article-content
            content_div = soup.find('div', class_='article-content')
            if content_div:
                # Fix image paths inside the content
                for img in content_div.find_all('img'):
                    src = img.get('src')
                    if src:
                        # Fix relative paths
                        # If src is simply "Imagens-artigos/foo.png", it should be "/assets/Imagens-artigos/foo.png"
                        # If src is "../Imagens/foo.png", it should be "/assets/Imagens/foo.png"
                        
                        new_src = src
                        if 'Imagens-artigos' in src:
                            filename = src.split('/')[-1]
                            new_src = f"/assets/Imagens-artigos/{filename}"
                        elif 'Imagens' in src:
                            filename = src.split('/')[-1]
                            new_src = f"/assets/Imagens/{filename}"
                        
                        img['src'] = new_src
                
                # Get the inner HTML of the content div
                # decode_contents() returns the inner HTML string
                content_html = content_div.decode_contents().strip()
            else:
                print(f"Warning: .article-content not found in {article_id}, using raw body")
                # Fallback: try body
                if soup.body:
                    content_html = soup.body.decode_contents().strip()
                else:
                    content_html = raw_html

        except FileNotFoundError:
            print(f"Error: Content file not found at {html_file_path}")
            continue
            
        # Prepare Firestore Data
        doc_ref = db.collection('articles').document(article_id)
        
        # Parse Date
        try:
            published_at = datetime.fromisoformat(item.get('dateISO'))
        except ValueError:
            published_at = datetime.now() # Fallback

        banner_image = item.get('bannerImage', '')
        # Fix banner image path
        # Old: assets/Artigos/Imagens-artigos/...
        # New: assets/Imagens-artigos/...
        if 'assets/Artigos/Imagens-artigos/' in banner_image:
            banner_image = banner_image.replace('assets/Artigos/Imagens-artigos/', '/assets/Imagens-artigos/')
        elif 'assets/Imagens-artigos/' in banner_image and not banner_image.startswith('/'):
             banner_image = '/' + banner_image
        
        doc_data = {
            'id': article_id,
            'title': title,
            'description': item.get('description', ''),
            'content': content_html,
            'author': item.get('author', 'Lamed'),
            'published_at': published_at,
            'tags': item.get('tags', []),
            'banner_image_url': banner_image,
            'is_active': True,
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP
        }
        
        
        doc_data['created_at'] = firestore.SERVER_TIMESTAMP
        doc_data['updated_at'] = firestore.SERVER_TIMESTAMP

        batch.set(doc_ref, doc_data)
        count += 1
        print(f"[OK] Prepared: {title}")

        # Commit every 400 items (limit is 500)
        if count % 400 == 0:
            batch.commit()
            print(f"[Save] Committed batch of {count} articles.")
            batch = db.batch()

    if count > 0:
        batch.commit()
        print(f"[Save] Final commit completed.")
        
    print(f"[Done] Migration Complete! {count} articles uploaded.")

if __name__ == "__main__":
    migrate_articles()
