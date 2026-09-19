import sys
import os
import unittest
from unittest.mock import MagicMock, patch

# Add backend root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from main import app
from api.dependencies import get_admin

class TestAnalyticsApi(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Override get_admin for test client
        app.dependency_overrides[get_admin] = lambda: {"uid": "admin-test", "admin": True}
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        app.dependency_overrides.pop(get_admin, None)

    def test_analytics_status(self):
        response = self.client.get("/admin/analytics/status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("configured", data)

    def test_analytics_overview(self):
        response = self.client.get("/admin/analytics/overview?days=30")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("summary", data)
        self.assertIn("active_users", data["summary"])
        self.assertIn("sessions", data["summary"])

    def test_analytics_realtime(self):
        response = self.client.get("/admin/analytics/realtime")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("active_users_now", data)

    def test_analytics_top_content(self):
        response = self.client.get("/admin/analytics/top-content?limit=5")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)

    def test_analytics_traffic_sources(self):
        response = self.client.get("/admin/analytics/traffic-sources")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
