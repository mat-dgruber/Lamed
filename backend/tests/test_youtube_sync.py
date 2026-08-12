import sys
import os
import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone

# Add backend root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import Video, VideoBase
from services.youtube_sync import sync_videos, fetch_latest_videos_from_youtube


class TestYouTubeSync(unittest.TestCase):
    def test_video_model_supports_is_short(self):
        v = Video(
            id="test1",
            title="Test Video",
            url="https://youtube.com/watch?v=test1",
            provider="youtube",
            is_active=True,
            is_short=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        self.assertTrue(v.is_short)

        v_default = Video(
            id="test2",
            title="Test Video 2",
            url="https://youtube.com/watch?v=test2",
            provider="youtube",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        self.assertFalse(v_default.is_short)

    @patch("services.youtube_sync.db")
    @patch("services.youtube_sync.fetch_latest_videos_from_youtube")
    def test_sync_videos_deactivates_missing_videos(self, mock_fetch, mock_db):
        # YouTube returns 1 video: vid-1
        mock_fetch.return_value = [
            {
                "id": "vid-1",
                "title": "Video 1",
                "description": "Desc 1",
                "url": "https://www.youtube.com/watch?v=vid-1",
                "thumbnail": "https://img.youtube.com/1.jpg",
                "published_at": "2026-08-01T12:00:00Z",
                "is_short": False,
                "duration": 120,
            }
        ]

        # Firestore mock for videos collection
        mock_videos_coll = MagicMock()
        mock_bundles_coll = MagicMock()

        def collection_side_effect(name):
            if name == "videos":
                return mock_videos_coll
            if name == "bundles":
                return mock_bundles_coll
            return MagicMock()

        mock_db.collection.side_effect = collection_side_effect

        # Mock existing document for vid-1
        mock_doc1_ref = MagicMock()
        mock_doc1_snap = MagicMock()
        mock_doc1_snap.exists = True
        mock_doc1_ref.get.return_value = mock_doc1_snap

        # Mock existing active videos in Firestore: vid-1 and vid-deleted
        doc_active_1 = MagicMock()
        doc_active_1.id = "vid-1"

        doc_active_deleted = MagicMock()
        doc_active_deleted.id = "vid-deleted"
        doc_active_deleted_ref = MagicMock()
        doc_active_deleted.reference = doc_active_deleted_ref

        # where("is_active", "==", True) query stream
        mock_active_query = MagicMock()
        mock_active_query.stream.return_value = [doc_active_1, doc_active_deleted]

        mock_videos_coll.where.return_value = mock_active_query
        mock_videos_coll.document.side_effect = lambda doc_id: mock_doc1_ref if doc_id == "vid-1" else MagicMock()

        # Bundle check query
        mock_bundle_query = MagicMock()
        mock_bundle_query.limit.return_value = mock_bundle_query
        mock_bundle_query.stream.return_value = [MagicMock()]  # bundle exists
        mock_bundles_coll.where.return_value = mock_bundle_query

        res = sync_videos()

        self.assertEqual(res["status"], "completed")

        # Verify vid-deleted was updated to is_active=False
        doc_active_deleted_ref.update.assert_called_once()
        update_args = doc_active_deleted_ref.update.call_args[0][0]
        self.assertFalse(update_args["is_active"])

    @patch("services.youtube_sync.get_youtube_service")
    def test_fetch_latest_videos_is_short_detection(self, mock_get_service):
        mock_service = MagicMock()
        mock_get_service.return_value = mock_service

        # Mock channels API
        mock_channels = MagicMock()
        mock_service.channels.return_value = mock_channels
        mock_channels.list.return_value.execute.return_value = {
            "items": [
                {"contentDetails": {"relatedPlaylists": {"uploads": "UU123"}}}
            ]
        }

        # Mock playlistItems API
        mock_playlist_items = MagicMock()
        mock_service.playlistItems.return_value = mock_playlist_items
        mock_playlist_items.list.return_value.execute.return_value = {
            "items": [
                {
                    "snippet": {
                        "resourceId": {"videoId": "short-1"},
                        "title": "Short Video",
                        "description": "A quick short",
                        "thumbnails": {"default": {"url": "http://img/1.jpg"}},
                        "publishedAt": "2026-08-12T10:00:00Z",
                    }
                },
                {
                    "snippet": {
                        "resourceId": {"videoId": "long-1"},
                        "title": "Long Video",
                        "description": "Full study",
                        "thumbnails": {"default": {"url": "http://img/2.jpg"}},
                        "publishedAt": "2026-08-12T09:00:00Z",
                    }
                },
                {
                    "snippet": {
                        "resourceId": {"videoId": "long-with-keyword"},
                        "title": "Long study #shorts",
                        "description": "Full lesson",
                        "thumbnails": {"default": {"url": "http://img/3.jpg"}},
                        "publishedAt": "2026-08-12T08:00:00Z",
                    }
                },
            ]
        }

        # Mock videos API
        mock_videos = MagicMock()
        mock_service.videos.return_value = mock_videos
        mock_videos.list.return_value.execute.return_value = {
            "items": [
                {
                    "id": "short-1",
                    "contentDetails": {"duration": "PT45S"},
                },
                {
                    "id": "long-1",
                    "contentDetails": {"duration": "PT10M"},
                },
                {
                    "id": "long-with-keyword",
                    "contentDetails": {"duration": "PT5M"},
                },
            ]
        }

        res = fetch_latest_videos_from_youtube(limit=10)

        self.assertEqual(len(res), 3)
        self.assertTrue(res[0]["is_short"])
        self.assertEqual(res[0]["duration"], 45)

        self.assertFalse(res[1]["is_short"])
        self.assertEqual(res[1]["duration"], 600)

        self.assertTrue(res[2]["is_short"])
        self.assertEqual(res[2]["duration"], 300)


if __name__ == "__main__":
    unittest.main()
