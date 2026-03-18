import sys
import os

# Add project root to path
sys.path.append(os.getcwd())

# Add current directory to path
sys.path.append(os.getcwd())

try:
    try:
        from main import app
    except ImportError:
        from backend.main import app
    print("SUCCESS: FastAPI app imported successfully.")
except Exception as e:
    print(f"ERROR: Could not import app. {e}")
    sys.exit(1)
