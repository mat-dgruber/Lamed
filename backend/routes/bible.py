# MARK: - Imports & Router Setup
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from services.bible_service import bible_service

router = APIRouter()

# MARK: - Verses & Passages Endpoints
@router.get("/verse", summary="Busca versículo ou passagem por referência ou parâmetros")
def get_bible_verse(
    ref: Optional[str] = Query(None, description="Referência bíblica em texto, ex: 'João 3:16', 'Rm 8:28', 'Sl 23:1-4'"),
    book: Optional[str] = Query(None, description="Nome ou abreviação do livro, ex: 'gn', 'jo', 'romanos'"),
    chapter: Optional[int] = Query(None, description="Número do capítulo"),
    verse: Optional[int] = Query(None, description="Número do versículo inicial"),
    end_verse: Optional[int] = Query(None, description="Número do versículo final (opcional para intervalos)"),
    version: str = Query("nvi", description="Versão da Bíblia ('nvi' ou 'aa')")
):
    """Retorna o texto de um versículo bíblico ou passagem formatada.

    Args:
        ref: Referência em texto livre (ex: 'João 3:16').
        book: Código ou nome do livro bíblico.
        chapter: Número do capítulo.
        verse: Número do versículo inicial.
        end_verse: Versículo final para intervalos.
        version: Sigla da tradução bíblica ('nvi' ou 'aa').

    Returns:
        Dicionário com referência canônica, texto e metadados.

    Raises:
        HTTPException: Se os parâmetros forem inválidos (400) ou não encontrados (404).
    """
    if not ref and (not book or not chapter):
        raise HTTPException(
            status_code=400,
            detail="Informe o parâmetro 'ref' (ex: 'João 3:16') ou ambos 'book' e 'chapter'."
        )

    result = bible_service.get_verse_or_passage(
        ref_query=ref,
        book=book,
        chapter=chapter,
        verse=verse,
        end_verse=end_verse,
        version=version
    )

    if not result:
        search_target = ref or f"{book} {chapter}:{verse}"
        raise HTTPException(
            status_code=404,
            detail=f"Passagem bíblica não encontrada para: '{search_target}' na versão {version.upper()}."
        )

    return result

# MARK: - Full Chapter Endpoint
@router.get("/chapter", summary="Retorna todos os versículos de um capítulo completo")
def get_bible_chapter(
    book: str = Query(..., description="Nome ou abreviação do livro, ex: 'gn', 'jo', 'salmos'"),
    chapter: int = Query(..., description="Número do capítulo"),
    version: str = Query("nvi", description="Versão da Bíblia ('nvi' ou 'aa')")
):
    """Retorna o capítulo bíblico completo para leitura de contexto expandido.

    Args:
        book: Código ou nome do livro bíblico.
        chapter: Número do capítulo.
        version: Sigla da tradução bíblica ('nvi' ou 'aa').

    Returns:
        Dicionário contendo lista de versículos e contagem do capítulo.

    Raises:
        HTTPException: Se o capítulo ou livro não for encontrado (404).
    """
    result = bible_service.get_chapter(book=book, chapter=chapter, version=version)
    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Capítulo não encontrado para {book} {chapter} na versão {version.upper()}."
        )
    return result

# MARK: - Books & Reference Parsing Endpoints
@router.get("/books", summary="Lista os 66 livros da Bíblia")
def get_bible_books(
    version: str = Query("nvi", description="Versão da Bíblia ('nvi' ou 'aa')")
):
    """Retorna a lista canônica dos 66 livros da Bíblia com contagem de capítulos.

    Args:
        version: Sigla da tradução bíblica ('nvi' ou 'aa').

    Returns:
        Lista com os 66 livros e seus metadados estruturados.
    """
    return bible_service.get_books(version=version)

@router.get("/parse", summary="Parseia e valida uma referência bíblica em texto")
def parse_bible_reference(
    ref: str = Query(..., description="Texto da referência, ex: 'João 3:16'")
):
    """Analisa sintaticamente uma referência textual e retorna sua estrutura canônica.

    Args:
        ref: Texto livre contendo citação bíblica.

    Returns:
        Dicionário com livro, capítulo, versículos e formato canônico.

    Raises:
        HTTPException: Se a referência não puder ser reconhecida (400).
    """
    parsed = bible_service.parse_reference(ref)
    if not parsed:
        raise HTTPException(
            status_code=400,
            detail=f"Não foi possível reconhecer uma referência bíblica válida em: '{ref}'."
        )
    return parsed

