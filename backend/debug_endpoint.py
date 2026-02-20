from config import db
from models import Article
from google.cloud.firestore import Query as FirestoreQuery
import firebase_admin

print("🔍 Simulating API Endpoint Logic...")

ARTICLES_COLLECTION = "articles"

try:
    print("Step 1: Building Query...")
    query = db.collection(ARTICLES_COLLECTION)
    
    # Simulate the default filters
    query = query.where(field_path="is_active", op_string="==", value=True)
    query = query.order_by("published_at", direction=FirestoreQuery.DESCENDING)
    query = query.limit(10).offset(0)
    
    print("Step 2: Executing Query...")
    docs = list(query.stream())
    print(f"✅ Query executed. Found {len(docs)} documents.")

    print("Step 3: validating documents...")
    articles = []
    for doc in docs:
        data = doc.to_dict()
        data['id'] = doc.id
        print(f"   Processing: {doc.id}")
        articles.append(Article(**data))
        
    print("✅ All steps completed successfully!")

except Exception as e:
    print("\n❌ CRASHED DURING SIMULATION:")
    print(e)
