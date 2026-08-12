import json
import urllib.request
from fastapi import APIRouter, Response
from xml.sax.saxutils import escape
from datetime import datetime
from config import db
from google.cloud.firestore import FieldFilter

router = APIRouter()

BASE_URL = "https://lamed148.com.br"
INDEXNOW_KEY = "b749f26556ab49f9a4f8409c5c88f525"
INDEXNOW_KEY_LOCATION = f"{BASE_URL}/{INDEXNOW_KEY}.txt"

STATIC_PAGES = [
    {"path": "", "changefreq": "daily", "priority": "1.0"},
    {"path": "artigos", "changefreq": "daily", "priority": "0.9"},
    {"path": "materiais-extras", "changefreq": "weekly", "priority": "0.9"},
    {"path": "videos", "changefreq": "weekly", "priority": "0.8"},
    {"path": "sobre", "changefreq": "monthly", "priority": "0.7"},
    {"path": "apoie", "changefreq": "monthly", "priority": "0.6"},
    {"path": "contato", "changefreq": "monthly", "priority": "0.5"},
    {"path": "siga-nos", "changefreq": "monthly", "priority": "0.5"},
]

def _format_iso(val) -> str:
    if not val:
        return ""
    if hasattr(val, "isoformat"):
        return val.isoformat()
    if isinstance(val, str):
        return val
    return ""

def _format_rss(val) -> str:
    if not val:
        return ""
    if hasattr(val, "strftime"):
        return val.strftime("%a, %d %b %Y %H:%M:%S GMT")
    if isinstance(val, str):
        return val
    return ""

def notify_indexnow(url_list: list) -> bool:
    if not url_list:
        return False
    payload = {
        "host": "lamed148.com.br",
        "key": INDEXNOW_KEY,
        "keyLocation": INDEXNOW_KEY_LOCATION,
        "urlList": url_list,
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        "https://api.indexnow.org/IndexNow",
        data=data,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status in (200, 202)
    except Exception:
        return False


@router.get("/sitemap.xml", response_class=Response)
def get_sitemap():
    url_nodes = []

    # 1. Páginas Estáticas
    for page in STATIC_PAGES:
        loc = escape(f"{BASE_URL}/{page['path']}".rstrip("/"))
        if loc == BASE_URL:
            loc = f"{BASE_URL}/"
        url_nodes.append(f"""  <url>
    <loc>{loc}</loc>
    <changefreq>{page['changefreq']}</changefreq>
    <priority>{page['priority']}</priority>
  </url>""")

    # 2. Artigos Dinâmicos
    try:
        articles_ref = db.collection("articles").where(filter=FieldFilter("is_active", "==", True)).stream()
        for doc in articles_ref:
            try:
                data = doc.to_dict() or {}
                loc = escape(f"{BASE_URL}/article/{doc.id}")

                raw_date = data.get("updated_at") or data.get("published_at")
                iso_date = _format_iso(raw_date)
                last_mod = f"\n    <lastmod>{escape(iso_date)}</lastmod>" if iso_date else ""

                url_nodes.append(f"""  <url>
    <loc>{loc}</loc>{last_mod}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>""")
            except Exception:
                continue
    except Exception:
        pass

    # 3. Bundles Dinâmicos
    try:
        bundles_ref = db.collection("bundles").where(filter=FieldFilter("is_active", "==", True)).stream()
        for doc in bundles_ref:
            try:
                data = doc.to_dict() or {}
                loc = escape(f"{BASE_URL}/bundle/{doc.id}")

                raw_date = data.get("updated_at") or data.get("created_at")
                iso_date = _format_iso(raw_date)
                last_mod = f"\n    <lastmod>{escape(iso_date)}</lastmod>" if iso_date else ""

                url_nodes.append(f"""  <url>
    <loc>{loc}</loc>{last_mod}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>""")
            except Exception:
                continue
    except Exception:
        pass

    sitemap_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(url_nodes)}
</urlset>"""

    return Response(content=sitemap_xml, media_type="application/xml")


@router.get("/rss.xml", response_class=Response)
def get_rss():
    items_xml = []

    try:
        articles_ref = db.collection("articles").where(filter=FieldFilter("is_active", "==", True)).limit(20).stream()
        for doc in articles_ref:
            try:
                data = doc.to_dict() or {}
                article_id = doc.id
                title = escape(str(data.get("title", "Artigo Lamed")))
                summary = escape(str(data.get("summary", "")))
                author = escape(str(data.get("author", "Lamed")))
                link = escape(f"{BASE_URL}/article/{article_id}")

                pub_date_str = _format_rss(data.get("published_at"))

                items_xml.append(f"""    <item>
      <title>{title}</title>
      <link>{link}</link>
      <guid>{link}</guid>
      <description>{summary}</description>
      <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">{author}</dc:creator>
      {f'<pubDate>{escape(pub_date_str)}</pubDate>' if pub_date_str else ''}
    </item>""")
            except Exception:
                continue
    except Exception:
        pass

    rss_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Lamed - Estudos Bíblicos Profundos</title>
    <link>{BASE_URL}</link>
    <description>Artigos e exegeses teológicas para aprofundamento bíblico e lição da Escola Sabatina.</description>
    <language>pt-BR</language>
{chr(10).join(items_xml)}
  </channel>
</rss>"""

    return Response(content=rss_xml, media_type="application/xml")


@router.post("/indexnow/ping-all")
def ping_indexnow_all():
    urls = [f"{BASE_URL}/"] + [f"{BASE_URL}/{p['path']}" for p in STATIC_PAGES if p['path']]

    try:
        articles_ref = db.collection("articles").where(filter=FieldFilter("is_active", "==", True)).stream()
        for doc in articles_ref:
            urls.append(f"{BASE_URL}/article/{doc.id}")
    except Exception:
        pass

    try:
        bundles_ref = db.collection("bundles").where(filter=FieldFilter("is_active", "==", True)).stream()
        for doc in bundles_ref:
            urls.append(f"{BASE_URL}/bundle/{doc.id}")
    except Exception:
        pass

    success = notify_indexnow(urls)
    return {"status": "success" if success else "failed", "submitted_urls_count": len(urls)}
