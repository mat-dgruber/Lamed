import sys
import os
import unittest

# Add backend root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from main import app

class TestBibleApi(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_get_verse_by_ref_single(self):
        response = self.client.get("/bible/verse", params={"ref": "João 3:16", "version": "nvi"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["reference"], "João 3:16")
        self.assertEqual(data["version"], "NVI")
        self.assertIn("Porque Deus tanto amou o mundo", data["text"])
        self.assertEqual(len(data["verses"]), 1)

    def test_get_verse_by_ref_range(self):
        response = self.client.get("/bible/verse", params={"ref": "Sl 23:1-4", "version": "nvi"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["reference"], "Salmos 23:1-4")
        self.assertEqual(len(data["verses"]), 4)

    def test_get_verse_by_structured_params(self):
        response = self.client.get(
            "/bible/verse",
            params={"book": "rm", "chapter": 8, "verse": 28, "version": "nvi"}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["reference"], "Romanos 8:28")
        self.assertIn("todas as coisas para o bem", data["text"])

    def test_get_verse_version_aa(self):
        response = self.client.get("/bible/verse", params={"ref": "João 3:16", "version": "aa"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["version"], "AA")
        self.assertIn("de tal maneira que deu o seu Filho unigênito", data["text"])

    def test_get_full_chapter(self):
        response = self.client.get("/bible/chapter", params={"book": "sl", "chapter": 23, "version": "nvi"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["reference"], "Salmos 23")
        self.assertEqual(data["total_verses"], 6)
        self.assertEqual(len(data["verses"]), 6)

    def test_get_books_list(self):
        response = self.client.get("/bible/books")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 66)
        self.assertEqual(data[0]["abbrev"], "gn")
        self.assertEqual(data[0]["name"], "Gênesis")
        self.assertEqual(data[0]["total_chapters"], 50)
        self.assertEqual(data[-1]["abbrev"], "ap")
        self.assertEqual(data[-1]["name"], "Apocalipse")

    def test_parse_reference(self):
        response = self.client.get("/bible/parse", params={"ref": "1 Coríntios 13:4-7"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["abbrev"], "1co")
        self.assertEqual(data["chapter"], 13)
        self.assertEqual(data["start_verse"], 4)
        self.assertEqual(data["end_verse"], 7)
        self.assertTrue(data["is_range"])

    def test_invalid_reference(self):
        response = self.client.get("/bible/verse", params={"ref": "LivroInexistente 99:99"})
        self.assertEqual(response.status_code, 404)

if __name__ == "__main__":
    unittest.main()
