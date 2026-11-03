"""Fixtures globais da suíte (db_session, app client). Ver guides/testing/backend/test-writing-standards.md."""

from unittest.mock import MagicMock, patch
import google.auth

# Mock defensivo para CI / ambientes sem credenciais Google Cloud ADC
try:
    google.auth.default()
except Exception:
    patch("google.auth.default", return_value=(MagicMock(), "lamed-148")).start()
    patch("firebase_admin.firestore.client", return_value=MagicMock()).start()

