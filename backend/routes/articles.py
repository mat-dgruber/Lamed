from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from google.cloud.firestore import Query as FirestoreQuery
from models import Article, ArticleCreate
from config import db

router = APIRouter()

ARTICLES_COLLECTION = "articles"

@router.get("/", response_model=List[Article])
def get_articles(
    limit: int = 10,
    offset: int = 0,
    only_active: bool = True
):
    query = db.collection(ARTICLES_COLLECTION)
    
    if only_active:
        query = query.where(field_path="is_active", op_string="==", value=True)
    
    # Sort in memory to avoid Composite Index requirement
    docs = query.stream()
    articles = []
    for doc in docs:
        data = doc.to_dict()
        data['id'] = doc.id
        articles.append(data)
    
    # Sort by published_at descending (handle None values: put them last or treat as old)
    articles.sort(key=lambda x: x.get('published_at') or datetime.min.replace(tzinfo=None), reverse=True)
    
    # Apply pagination in memory
    start = offset
    end = offset + limit
    return articles[start:end]

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
def create_article(article_in: ArticleCreate):
    data = article_in.model_dump()
    data['created_at'] = datetime.utcnow()
    data['updated_at'] = datetime.utcnow()
    
    # If published_at is not set, set it to now if active
    if not data.get('published_at') and data.get('is_active'):
        data['published_at'] = datetime.utcnow()

    update_time, doc_ref = db.collection(ARTICLES_COLLECTION).add(data)
    
    data['id'] = doc_ref.id
    return data

@router.put("/{article_id}", response_model=Article)
def update_article(article_id: str, article_in: ArticleCreate):
    doc_ref = db.collection(ARTICLES_COLLECTION).document(article_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Article not found")
        
    data = article_in.model_dump()
    data['updated_at'] = datetime.utcnow()
    
    doc_ref.update(data)
    
    updated_doc = doc_ref.get().to_dict()
    updated_doc['id'] = article_id
    return updated_doc

@router.delete("/{article_id}")
def delete_article(article_id: str):
    doc_ref = db.collection(ARTICLES_COLLECTION).document(article_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Article not found")
        
    doc_ref.delete()
    return {"message": "Article deleted successfully"}
