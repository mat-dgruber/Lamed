from config import db
from google.cloud.firestore import Query as FirestoreQuery
import firebase_admin
import traceback

print("🔍 Capturing Index URL...")

try:
    query = db.collection("articles")
    query = query.where(field_path="is_active", op_string="==", value=True)
    query = query.order_by("published_at", direction=FirestoreQuery.DESCENDING)
    list(query.stream()) # Trigger the error
except Exception:
    error_msg = traceback.format_exc()
    if "https://console.firebase.google.com" in error_msg:
        start = error_msg.find("https://console.firebase.google.com")
        end = error_msg.find("\n", start)
        if end == -1: end = len(error_msg)
        print("\n👇 CLICK THIS LINK TO FIX THE DATABASE 👇")
        print(error_msg[start:end])
        print("👆 CLICK THIS LINK 👆")
    else:
        print("Could not find link in error.")
        print(error_msg)
