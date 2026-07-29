from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timezone
from google.cloud.firestore import Query as FirestoreQuery, FieldFilter
from models import Article, ArticleCreate
from config import db
from api.dependencies import get_admin

router = APIRouter()

ARTICLES_COLLECTION = "articles"

@router.get("/", response_model=List[Article])
def get_articles(
    limit: int = 10,
    start_after_id: Optional[str] = None,
    only_active: bool = True
):
    query = db.collection(ARTICLES_COLLECTION)
    
    if only_active:
        query = query.where(filter=FieldFilter("is_active", "==", True))
    
    # Use server-side ordering (Requires Composite Index)
    query = query.order_by("published_at", direction=FirestoreQuery.DESCENDING)
    
    if start_after_id:
        last_doc = db.collection(ARTICLES_COLLECTION).document(start_after_id).get()
        if last_doc.exists:
            query = query.start_after(last_doc)
            
    query = query.limit(limit)
    
    docs = query.stream()
    articles = []
    for doc in docs:
        data = doc.to_dict()
        data['id'] = doc.id
        articles.append(data)
    
    return articles

@router.get("/{article_id}", response_model=Article)
def get_article(article_id: str):
    doc_ref = db.collection(ARTICLES_COLLECTION).document(article_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Article not found")
        
    data = doc.to_dict()
    data['id'] = doc.id
    return data

@router.post("/", response_model=Article)
def create_article(article_in: ArticleCreate, _admin=Depends(get_admin)):
    data = article_in.model_dump()
    data['created_at'] = datetime.now(timezone.utc)
    data['updated_at'] = datetime.now(timezone.utc)
    
    # If published_at is not set, set it to now if active
    if not data.get('published_at') and data.get('is_active'):
        data['published_at'] = datetime.now(timezone.utc)

    update_time, doc_ref = db.collection(ARTICLES_COLLECTION).add(data)
    
    data['id'] = doc_ref.id
    return data

@router.put("/{article_id}", response_model=Article)
def update_article(article_id: str, article_in: ArticleCreate, _admin=Depends(get_admin)):
    doc_ref = db.collection(ARTICLES_COLLECTION).document(article_id)
    
    data = article_in.model_dump()
    data['updated_at'] = datetime.now(timezone.utc)
    
    try:
        doc_ref.update(data)
    except Exception:
         raise HTTPException(status_code=404, detail="Article not found")
    
    updated_doc = doc_ref.get().to_dict()
    updated_doc['id'] = article_id
    return updated_doc

@router.delete("/{article_id}")
def delete_article(article_id: str, _admin=Depends(get_admin)):
    doc_ref = db.collection(ARTICLES_COLLECTION).document(article_id)
    # Deleting a non-existent document in Firestore is a no-op and costs nothing extra
    doc_ref.delete()
    return {"message": "Article deleted successfully"}
