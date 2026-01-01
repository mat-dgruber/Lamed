import os
import sys
import django
import json
import re
from pathlib import Path

# Setup Django environment
sys.path.append(str(Path(__file__).parent.parent))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from content.models import Artigo, MaterialEstudo, Categoria
from django.utils.dateparse import parse_datetime

def migrate_articles():
    print("Migrating Articles...")
    base_dir = Path(__file__).parent.parent.parent
    assets_dir = base_dir / 'frontend' / 'src' / 'assets'
    articles_json_path = assets_dir / "articles.json"

    if not articles_json_path.exists():
        print(f"Error: {articles_json_path} not found.")
        return

    with open(articles_json_path, 'r', encoding='utf-8') as f:
        articles_data = json.load(f)

    for item in articles_data:
        slug = item.get('id')
        title = item.get('title')
        # bannerImage in JSON is "assets/...", we want relative or absolute url?
        # Let's keep it as is, frontend can handle it or we strip "assets/" if needed.
        # Frontend likely runs from root, so "assets/..." is correct for <img src>.
        banner_path = item.get('bannerImage')
        summary = item.get('description', '')
        
        # Tags
        tags = item.get('tags', [])
        
        # Date
        date_iso = item.get('dateISO')
        # Ensure timezone aware if possible, or naive
        published_date = parse_datetime(f"{date_iso}T12:00:00Z") if date_iso else None

        # Content - Read HTML file
        content_path_rel = item.get('contentPath')
        content = ""
        if content_path_rel:
            # contentPath in JSON is "assets/Artigos/artigo20.html"
            # Actual file is in frontend/src/assets/Artigos/artigo20.html
            html_path = base_dir / 'frontend' / 'src' / content_path_rel
            if html_path.exists():
                with open(html_path, 'r', encoding='utf-8') as html_f:
                    content = html_f.read()
            else:
                print(f"Warning: Content file {html_path} not found for {slug}")

        # Create or Update
        start_marker = "<!-- CONTEUDO DO ARTIGO -->"
        end_marker = "<!-- FIM DO CONTEUDO -->"
        
        if start_marker in content and end_marker in content:
            start_index = content.find(start_marker) + len(start_marker)
            end_index = content.find(end_marker)
            cleaned_content = content[start_index:end_index].strip()
        else:
             cleaned_content = content

        Artigo.objects.update_or_create(
            slug=slug,
            defaults={
                'titulo': title,
                'banner_path': banner_path,
                'resumo': summary,
                'tags': tags,
                'conteudo': cleaned_content,
                'publicado': True,
                'data_publicado': published_date
            }
        )
        print(f"Processed: {title}")

def migrate_guides():
    print("Migrating Guides...")
    # These are hardcoded in the Typescript file, so we hardcode them here for migration
    # Based on the file viewed: guia-de-estudos.ts
    
    # 3Tri25
    guides_3tri = [
      { 'id': 9, 'title': 'COMO CRIANÇAS', 'downloadUrl': 'assets/Downloads/GuiasDeEstudo/3Tri25/L9.pdf' },
      { 'id': 10, 'title': 'ACORDE!', 'downloadUrl': 'assets/Downloads/GuiasDeEstudo/3Tri25/L10.pdf' },
      { 'id': 11, 'title': 'EM CIMA DA ÁRVORE', 'downloadUrl': 'assets/Downloads/GuiasDeEstudo/3Tri25/L11.pdf' },
      { 'id': 12, 'title': 'O VASO DE ALABASTRO', 'downloadUrl': 'assets/Downloads/GuiasDeEstudo/3Tri25/L12.pdf' },
      { 'id': 13, 'title': 'O PRIMEIRO LUGAR', 'downloadUrl': 'assets/Downloads/GuiasDeEstudo/3Tri25/L13.pdf'},
    ]

    # 4Tri25
    guides_4tri = [
      { 'id': 1, 'title': 'REALIDADE OU FACHADA', 'downloadUrl': 'assets/Downloads/GuiasDeEstudo/4Tri25/L1.pdf'},
      { 'id': 2, 'title': 'DUAS CARAS, UM CORAÇÃO', 'downloadUrl': 'assets/Downloads/GuiasDeEstudo/4Tri25/L2.pdf' },
      { 'id': 3, 'title': 'PREPARANDO-SE PARA O AMANHÃ... HOJE', 'downloadUrl': 'assets/Downloads/GuiasDeEstudo/4Tri25/L3.pdf' },
      { 'id': 4, 'title': 'VIVENDO PARA SERVIR', 'downloadUrl': 'assets/Downloads/GuiasDeEstudo/4Tri25/L4.pdf' },
      { 'id': 5, 'title': 'O TRAIDOR', 'downloadUrl': 'assets/Downloads/GuiasDeEstudo/4Tri25/L5.pdf' },
      { 'id': 6, 'title': 'A ESCOLHA', 'downloadUrl': 'assets/Downloads/GuiasDeEstudo/4Tri25/L6.pdf' },
    ]
    
    all_guides = [('3Tri25', guides_3tri), ('4Tri25', guides_4tri)]
    
    for trimestre, lessons in all_guides:
        for lesson in lessons:
            MaterialEstudo.objects.update_or_create(
                titulo=lesson['title'],
                defaults={
                    'arquivo_url': lesson['downloadUrl'],
                    'trimestre': trimestre,
                    'licao_numero': lesson['id'], # id here seems to correspond to lesson number
                    'publicado': True,
                    # We can use slug as unique identifier if needed, or title
                    # Let's generate a basic slug
                    'slug': f"{trimestre}-l{lesson['id']}".lower()
                }
            )
            print(f"Processed Guide: {lesson['title']}")

if __name__ == "__main__":
    migrate_articles()
    migrate_guides()
