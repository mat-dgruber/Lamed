
import os
import firebase_admin
from firebase_admin import auth, credentials
from rest_framework import authentication
from rest_framework import exceptions
from django.contrib.auth.models import User
from django.conf import settings

# Initialize Firebase Admin SDK if not already initialized
# Initialize Firebase Admin SDK if not already initialized
if not firebase_admin._apps:
    # Path to the service account key file
    base_dir = settings.BASE_DIR
    local_cred_path = os.path.join(base_dir, 'certs', 'serviceAccountKey.json')
    env_cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH')

    if env_cred_path:
        cred = credentials.Certificate(env_cred_path)
        firebase_admin.initialize_app(cred)
    elif os.path.exists(local_cred_path):
        cred = credentials.Certificate(local_cred_path)
        firebase_admin.initialize_app(cred)
    else:
        # Fallback for environments where GOOGLE_APPLICATION_CREDENTIALS is set
        try:
             firebase_admin.initialize_app()
        except ValueError:
            pass

class FirebaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None

        id_token = auth_header.split(' ').pop()
        decoded_token = None
        
        try:
            decoded_token = auth.verify_id_token(id_token)
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Invalid Firebase token: {e}')

        if not decoded_token:
            return None

        uid = decoded_token.get('uid')
        email = decoded_token.get('email')
        
        if not email:
             raise exceptions.AuthenticationFailed('Firebase token has no email')

        # Get or create the user
        # Get or create the user
        try:
            user = User.objects.get(username=uid)
        except User.DoesNotExist:
            try:
                # Handle race condition where another request might create the user
                user = User.objects.create_user(username=uid, email=email)
            except Exception:
                # If create fails (e.g. IntegrityError), the user must have been created by another request
                user = User.objects.get(username=uid)

        return (user, None)
