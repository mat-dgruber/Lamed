from config import db
from models import Article
import firebase_admin
from pydantic import ValidationError

print("🔍 Starting full database verification...")

# Fetch all articles
docs = list(db.collection('articles').stream())
print(f"found {len(docs)} articles.")

success_count = 0
failure_count = 0

for doc in docs:
    data = doc.to_dict()
    data['id'] = doc.id
    
    try:
        Article(**data)
        success_count += 1
    except ValidationError as e:
        failure_count += 1
        print(f"\n❌ Error in article {doc.id}:")
        print(f"Title: {data.get('title', 'NO TITLE')}")
        print(e)
    except Exception as e:
        failure_count += 1
        print(f"\n❌ Unexpected error in article {doc.id}:")
        print(e)

print("\n" + "="*30)
print(f"✅ Successful: {success_count}")
print(f"❌ Failed:     {failure_count}")
print("="*30)
