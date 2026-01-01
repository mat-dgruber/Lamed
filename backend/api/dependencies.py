from fastapi import Header, HTTPException, Depends
from firebase_admin import auth
from django.contrib.auth.models import User
from asgiref.sync import sync_to_async
from config import authentificator  # Allow init to run

async def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authentication header")
    
    token = authorization.split(" ")[1]
    
    try:
        # Verify token synchronously (firebase-admin is sync)
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token.get("uid")
        email = decoded_token.get("email")
        
        if not email:
            raise HTTPException(status_code=401, detail="Token missing email")

        # Get Django user (async wrapper needed for ORM access in async context)
        # Note: If running FastAPI in sync mode (def instead of async def), sync_to_async matches.
        # But we will use async endpoints.
        
        return await get_django_user(uid, email)
        
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@sync_to_async
def get_django_user(uid, email):
    # Reusing logic from authentificator but simpler
    try:
        user = User.objects.get(username=uid)
    except User.DoesNotExist:
        try:
             user = User.objects.create_user(username=uid, email=email)
        except:
             user = User.objects.get(username=uid)
    return user
