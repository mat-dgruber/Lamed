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

    def test_analytics_cache_hit_and_clear(self):
        from services.analytics_service import analytics_service, SimpleMemoryCache

        # Limpa cache inicial
        analytics_service.clear_cache()
        self.assertEqual(analytics_service._cache.size(), 0)

        # Primeira chamada popula o cache
        res1 = self.client.get("/admin/analytics/overview?days=7")
        self.assertEqual(res1.status_code, 200)
        self.assertGreater(analytics_service._cache.size(), 0)

        # Segunda chamada busca do cache
        res2 = self.client.get("/admin/analytics/overview?days=7")
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(res1.json(), res2.json())

        # Chamada com refresh=True força reprocessamento
        res3 = self.client.get("/admin/analytics/overview?days=7&refresh=true")
        self.assertEqual(res3.status_code, 200)

        # Endpoint de limpeza de cache
        clear_res = self.client.post("/admin/analytics/cache/clear")
        self.assertEqual(clear_res.status_code, 200)
        self.assertIn("limpo com sucesso", clear_res.json().get("message", ""))
        self.assertEqual(analytics_service._cache.size(), 0)

    def test_simple_memory_cache_ttl_expiration(self):
        import time
        from services.analytics_service import SimpleMemoryCache

        cache = SimpleMemoryCache(default_ttl_seconds=1)
        cache.set("foo", "bar", ttl_seconds=1)
        self.assertEqual(cache.get("foo"), "bar")

        # Aguarda expirar TTL
        time.sleep(1.1)
        self.assertIsNone(cache.get("foo"))
        self.assertEqual(cache.size(), 0)

