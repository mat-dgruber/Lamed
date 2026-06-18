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
        self.mock_query.order_by.return_value = self.mock_query
        self.mock_query.limit.return_value = self.mock_query
        self.mock_collection.order_by.return_value = self.mock_query

        self.mock_collection.document.return_value = self.mock_doc
        self.mock_doc.get.return_value = self.mock_doc_snapshot

        # Start patcher
        self.patcher = patch("routes.videos.db", self.mock_db)
        self.patcher.start()

    def tearDown(self):
        self.patcher.stop()

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

if __name__ == "__main__":
    unittest.main()
