import sys
import os
import unittest
from unittest.mock import MagicMock, patch

# Add backend root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from main import app

class TestBundlesApi(unittest.TestCase):
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
        self.patcher = patch("routes.bundles.db", self.mock_db)
        self.patcher.start()

    def tearDown(self):
        self.patcher.stop()

    def test_get_bundles(self):
        doc1 = MagicMock()
        doc1.id = "1"
        doc1.to_dict.return_value = {
            "title": "Bundle 1",
            "description": "Desc 1",
            "week_number": 1,
            "is_active": True,
            "resources": [],
            "created_at": "2026-06-18T10:00:00",
            "updated_at": "2026-06-18T10:00:00"
        }
        self.mock_query.stream.return_value = [doc1]

        response = self.client.get("/bundles/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["title"], "Bundle 1")
        self.assertEqual(data[0]["id"], "1")

    def test_get_bundle_not_found(self):
        self.mock_doc_snapshot.exists = False
        response = self.client.get("/bundles/invalid_id")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "Bundle not found")

    def test_get_bundle_success(self):
        self.mock_doc_snapshot.exists = True
        self.mock_doc_snapshot.id = "test-id"
        self.mock_doc_snapshot.to_dict.return_value = {
            "title": "Test Bundle",
            "description": "Desc",
            "week_number": 3,
            "is_active": True,
            "resources": [],
            "created_at": "2026-06-18T10:00:00",
            "updated_at": "2026-06-18T10:00:00"
        }

        response = self.client.get("/bundles/test-id")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["title"], "Test Bundle")
        self.assertEqual(data["id"], "test-id")

if __name__ == "__main__":
    unittest.main()
