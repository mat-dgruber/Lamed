from fastapi import APIRouter, HTTPException, UploadFile, File
from ..config import settings
import shutil
import os

router = APIRouter()

# For now, we will simulate storage upload by returning a fake URL or 
# if possible, implement proper Firebase Storage Signed URLs later.
# This implementation assumes we might want to just "sign" a URL for the frontend 
# to upload directly, which is best practice.

@router.post("/upload-url")
def generate_upload_url(filename: str, content_type: str):
    """
    Generates a Signed URL so the frontend can upload directly to Firebase Storage.
    (Mocked for initial implementation to allow progress without Service Account Key)
    """
    # In a real scenario with proper Admin SDK creds:
    # bucket = storage.bucket()
    # blob = bucket.blob(f"uploads/{filename}")
    # url = blob.generate_signed_url(...)
    
    # For prototype/dev without key:
    return {
        "upload_url": f"https://mock-upload.com/{filename}", # Frontend would PUT here
        "public_url": f"https://firebasestorage.googleapis.com/v0/b/novo-lamed-angular.firebasestorage.app/o/uploads%2F{filename}?alt=media"
    }

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Simple direct upload endpoint (Development only, generally avoiding passing files through backend in Serverless)
    """
    return {"filename": file.filename, "url": f"https://storage.googleapis.com/mock-bucket/{file.filename}"}

@router.post("/sync-youtube")
def trigger_sync():
    """
    Manually triggers the YouTube Sync process.
    """
    from ..services.youtube_sync import sync_videos
    result = sync_videos()
    return {"status": "success", "data": result}
