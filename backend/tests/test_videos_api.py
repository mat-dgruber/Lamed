import sys
import os
import unittest
from unittest.mock import MagicMock, patch

# Add backend root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from main import app
from datetime import datetime, timezone

class TestVideosApi(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def setUp(self):
        # Create mocks
        self.mock_db = MagicMock()
        self.mock_collection = MagicMock()
        self.mock_query = MagicMock()
        self.mock_doc = MagicMock()
        self.mock_doc_snapshot = MagicMock()

        self.mock_db.collection.return_value = self.mock_collection
        self.mock_collection.where.return_value = self.mock_query
        self.mock_query.where.return_value = self.mock_query
        self.mock_query.order_by.return_value = self.mock_query
        self.mock_query.limit.return_value = self.mock_query
        self.mock_collection.order_by.return_value = self.mock_query

        self.mock_collection.document.return_value = self.mock_doc
        self.mock_doc.get.return_value = self.mock_doc_snapshot

        # Start patchers
        self.patcher = patch("routes.videos.db", self.mock_db)
        self.patcher_admin = patch("routes.admin.db", self.mock_db)
        self.patcher.start()
        self.patcher_admin.start()

    def tearDown(self):
        self.patcher.stop()
        self.patcher_admin.stop()

    def test_get_videos(self):
        doc1 = MagicMock()
        doc1.id = "vid-1"
        doc1.to_dict.return_value = {
            "title": "Video Test 1",
            "url": "https://youtube.com/watch?v=vid-1",
            "provider": "youtube",
            "is_active": True,
            "published_at": datetime(2026, 6, 18, 10, 0, 0, tzinfo=timezone.utc),
            "created_at": datetime(2026, 6, 18, 10, 0, 0, tzinfo=timezone.utc),
            "updated_at": datetime(2026, 6, 18, 10, 0, 0, tzinfo=timezone.utc)
        }
        self.mock_query.stream.return_value = [doc1]

        response = self.client.get("/videos/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["title"], "Video Test 1")
        self.assertEqual(data[0]["id"], "vid-1")

    def test_get_video_not_found(self):
        self.mock_doc_snapshot.exists = False
        response = self.client.get("/videos/invalid_id")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "Video not found")

    def test_get_video_success(self):
        self.mock_doc_snapshot.exists = True
        self.mock_doc_snapshot.id = "vid-2"
        self.mock_doc_snapshot.to_dict.return_value = {
            "title": "Video Test 2",
            "url": "https://youtube.com/watch?v=vid-2",
            "provider": "youtube",
            "is_active": True,
            "published_at": datetime(2026, 6, 18, 11, 0, 0, tzinfo=timezone.utc),
            "created_at": datetime(2026, 6, 18, 11, 0, 0, tzinfo=timezone.utc),
            "updated_at": datetime(2026, 6, 18, 11, 0, 0, tzinfo=timezone.utc)
        }

        response = self.client.get("/videos/vid-2")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["title"], "Video Test 2")
        self.assertEqual(data["id"], "vid-2")

    def test_get_videos_filter_is_short(self):
        doc1 = MagicMock()
        doc1.id = "vid-short-1"
        doc1.to_dict.return_value = {
            "title": "Short Video",
            "url": "https://youtube.com/watch?v=vid-short-1",
            "provider": "youtube",
            "is_active": True,
            "is_short": True,
            "published_at": datetime(2026, 6, 18, 10, 0, 0, tzinfo=timezone.utc),
            "created_at": datetime(2026, 6, 18, 10, 0, 0, tzinfo=timezone.utc),
            "updated_at": datetime(2026, 6, 18, 10, 0, 0, tzinfo=timezone.utc)
        }
        self.mock_query.stream.return_value = [doc1]

        response = self.client.get("/videos/?is_short=true")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["id"], "vid-short-1")
        self.assertTrue(data[0]["is_short"])

    def test_admin_get_videos(self):
        doc1 = MagicMock()
        doc1.id = "vid-inactive"
        doc1.to_dict.return_value = {
            "title": "Inactive Video",
            "url": "https://youtube.com/watch?v=vid-inactive",
            "provider": "youtube",
            "is_active": False,
            "is_short": False,
            "published_at": datetime(2026, 6, 18, 10, 0, 0, tzinfo=timezone.utc),
            "created_at": datetime(2026, 6, 18, 10, 0, 0, tzinfo=timezone.utc),
            "updated_at": datetime(2026, 6, 18, 10, 0, 0, tzinfo=timezone.utc)
        }
        self.mock_query.stream.return_value = [doc1]

        from api.dependencies import get_admin
        app.dependency_overrides[get_admin] = lambda: {"uid": "admin", "admin": True}
        try:
            response = self.client.get("/admin/videos/")
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(len(data), 1)
            self.assertEqual(data[0]["id"], "vid-inactive")
            self.assertFalse(data[0]["is_active"])
        finally:
            app.dependency_overrides.clear()

    def test_admin_patch_video(self):
        doc_snap = MagicMock()
        doc_snap.exists = True
        doc_snap.id = "vid-patch"
        doc_snap.to_dict.return_value = {
            "title": "Patchable Video",
            "url": "https://youtube.com/watch?v=vid-patch",
            "provider": "youtube",
            "is_active": True,
            "is_short": False,
            "published_at": datetime(2026, 6, 18, 10, 0, 0, tzinfo=timezone.utc),
            "created_at": datetime(2026, 6, 18, 10, 0, 0, tzinfo=timezone.utc),
            "updated_at": datetime(2026, 6, 18, 10, 0, 0, tzinfo=timezone.utc)
        }
        self.mock_doc.get.return_value = doc_snap

        from api.dependencies import get_admin
        app.dependency_overrides[get_admin] = lambda: {"uid": "admin", "admin": True}
        try:
            response = self.client.patch("/admin/videos/vid-patch", json={"is_short": True, "is_active": False})
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["id"], "vid-patch")
            self.assertTrue(data["is_short"])
            self.assertFalse(data["is_active"])
            self.mock_doc.update.assert_called()
        finally:
            app.dependency_overrides.clear()

    def test_admin_patch_video_not_found(self):
        doc_snap = MagicMock()
        doc_snap.exists = False
        self.mock_doc.get.return_value = doc_snap

        from api.dependencies import get_admin
        app.dependency_overrides[get_admin] = lambda: {"uid": "admin", "admin": True}
        try:
            response = self.client.patch("/admin/videos/nonexistent", json={"is_short": True})
            self.assertEqual(response.status_code, 404)
        finally:
            app.dependency_overrides.clear()

if __name__ == "__main__":
    unittest.main()
