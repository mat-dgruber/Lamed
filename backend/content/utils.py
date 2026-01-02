import io
import os
import zipfile
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from django.conf import settings

def generate_readme_pdf():
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    y = height - 50
    
    # Simple text drawing - ideally use Paragraph/Flowables for complex text
    text = """
    ================================================================
              OBRIGADO POR BAIXAR O KIT DE APOIO LAMED!
    ================================================================
    
    Olá! Ficamos muito felizes que você tenha baixado este material.
    Este conteúdo foi preparado com muita dedicação para enriquecer seu estu-
    do pessoal, sua classe de Escola Sabatina ou seu Pequeno Grupo.
    
    1. O QUE SIGNIFICA "LAMED" (ל)?
    O nome do nosso canal vem da letra hebraica que significa "aprender" e 
    "ensinar". Simboliza nossa busca por elevação espiritual e direção.
    
    2. NOSSA IDENTIDADE
    Nosso foco é fornecer estudos bíblicos academicamente informados e 
    criativos. Nossa missão é equipar pessoas a experimentar a Bíblia.
    
    3. POR QUE GRATUITO?
    Acreditamos que o conhecimento bíblico deve ser acessível a todos.
    
    4. TRANSPARÊNCIA (PARA ONDE VAI O RECURSO?)
    45% Manutenção e Expansão
    55% Projetos Sociais e Missionários (ADRA, Missão Global)
    
    5. COMO NOS APOIAR?
    - Ore e Compartilhe
    - Seja Membro no YouTube
    - Use o "Valeu Demais" nos vídeos
    
    Acesse: lamed148.com.br
    YouTube: youtube.com/@Lamed148
    Instagram: @lamed148
    ================================================================
    """
    
    textobject = p.beginText()
    textobject.setTextOrigin(50, y)
    textobject.setFont("Helvetica", 11)
    
    for line in text.splitlines():
        textobject.textLine(line)
        
    p.drawText(textobject)
    p.showPage()
    p.save()
    
    buffer.seek(0)
    return buffer

def create_bundle_zip(bundle):
    # bundle is a LessonBundle instance
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        # Add Readme
        readme_pdf = generate_readme_pdf()
        zf.writestr(f"Leia-me - {bundle.title}.pdf", readme_pdf.getvalue())
        
        # Add Files
        files = [
            ('Guia de Estudo.pdf', bundle.file_guide),
            ('Slides.pptx', bundle.file_slides),
            ('Mapa Mental.png', bundle.file_map),
            ('Infografico.png', bundle.file_infographic),
            ('Flashcards.pdf', bundle.file_flashcards),
        ]
        
        for custom_name, file_field in files:
            if file_field and file_field.name:
                try:
                    # Depending on storage, file_field.path might be needed, or read()
                    # For local storage:
                    file_path = file_field.path
                    if os.path.exists(file_path):
                        zf.write(file_path, arcname=custom_name)
                except Exception as e:
                    print(f"Error adding file {custom_name}: {e}")
                    
    zip_buffer.seek(0)
    return zip_buffer
