import os
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin
# Assumes GOOGLE_APPLICATION_CREDENTIALS env var is set OR default creds are available
# For local dev, you might need to point to a serviceAccountKey.json
# Initialize Firebase Admin
if not firebase_admin._apps:
    try:
        # 1. Try Service Account Key first (Preferred for local dev if present)
        # Note: We check for 'certs/serviceAccountKey' assuming running from project root
        key_path = os.path.join(os.path.dirname(__file__), 'certs', 'serviceAccountKey.json')
        
        if os.path.exists(key_path):
            print(f"🔑 Loading Firebase credentials from: {key_path}")
            cred = credentials.Certificate(key_path)
            firebase_admin.initialize_app(cred, {
                'projectId': 'lamed-148',
                'storageBucket': 'lamed-148.firebasestorage.app'
            })
        else:
            # 2. Fallback to Application Default Credentials (gcloud auth application-default login)
            print("☁️  Loading Google Application Default Credentials...")
            cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred, {
                'projectId': 'lamed-148',
                'storageBucket': 'lamed-148.firebasestorage.app'
            })
            
    except Exception as e:
        print(f"❌ CRITICAL ERROR: Could not connect to Firebase: {e}")
        # Re-raising ensures we don't startup with a broken DB connection
        raise e

db = firestore.client()

class Settings:
    PROJECT_NAME: str = "Lamed Bundle API"
    API_V1_STR: str = "/api/v1"

settings = Settings()
