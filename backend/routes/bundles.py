from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from google.cloud.firestore import Query as FirestoreQuery
from ..models import Bundle, BundleCreate
from ..config import db

router = APIRouter()

BUNDLES_COLLECTION = "bundles"

@router.get("/", response_model=List[Bundle])
def get_bundles(
    limit: int = 10,
    offset: int = 0,
    only_active: bool = True
):
    query = db.collection(BUNDLES_COLLECTION)
    
    if only_active:
        query = query.where(field_path="is_active", op_string="==", value=True)
    
    # Ordering by week_number descending (newest first)
    query = query.order_by("week_number", direction=FirestoreQuery.DESCENDING)
    query = query.limit(limit).offset(offset)
    
    docs = query.stream()
    bundles = []
    for doc in docs:
        data = doc.to_dict()
        data['id'] = doc.id
        bundles.append(data)
        
    return bundles

@router.get("/latest", response_model=Optional[Bundle])
def get_latest_bundle():
    try:
        query = db.collection(BUNDLES_COLLECTION)\
            .where(field_path="is_active", op_string="==", value=True)\
            .order_by("week_number", direction=FirestoreQuery.DESCENDING)\
            .limit(1)
            
        docs = list(query.stream())
        if not docs:
            return None
            
        data = docs[0].to_dict()
        data['id'] = docs[0].id
        return data
    except Exception as e:
        print(f"Error fetching latest bundle: {e}")
        # Return 500 but log the error which likely contains the Index Creation URL
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{bundle_id}", response_model=Bundle)
def get_bundle(bundle_id: str):
    doc_ref = db.collection(BUNDLES_COLLECTION).document(bundle_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Bundle not found")
        
    data = doc.to_dict()
    data['id'] = doc.id
    return data

@router.post("/", response_model=Bundle)
def create_bundle(bundle_in: BundleCreate):
    # TODO: Add Authentication check here
    
    data = bundle_in.model_dump()
    data['created_at'] = datetime.utcnow()
    data['updated_at'] = datetime.utcnow()
    
    # Auto-assign generic thumbnail if missing
    if not data.get('thumbnail_url'):
        data['thumbnail_url'] = "https://placehold.co/600x400?text=Bundle"

    update_time, doc_ref = db.collection(BUNDLES_COLLECTION).add(data)
    
    # Fetch back to return complete object
    data['id'] = doc_ref.id
    return data

@router.put("/{bundle_id}", response_model=Bundle)
def update_bundle(bundle_id: str, bundle_in: BundleCreate):
    # TODO: Add Authentication check here
    
    doc_ref = db.collection(BUNDLES_COLLECTION).document(bundle_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Bundle not found")
        
    data = bundle_in.model_dump()
    data['updated_at'] = datetime.utcnow()
    
    doc_ref.update(data)
    
    data['id'] = bundle_id
    # Note: 'created_at' might be missing in 'data' if strictly following BundleCreate,
    # but for response model Pydantic is lenient or we should fetch existing.
    # For now, simplest path: fetch updated
    updated_doc = doc_ref.get().to_dict()
    updated_doc['id'] = bundle_id
    return updated_doc
