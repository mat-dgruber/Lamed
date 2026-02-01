import os
import sys

# Add backend root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

print("Path setup.")
try:
    from config import db
    print("Imported db.")
    doc_ref = db.collection('test').document('check')
    print("Created ref.")
    print("Testing connection...")
    docs = list(db.collection('bundles').limit(1).stream())
    print(f"Connection success. Found {len(docs)} bundles.")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
