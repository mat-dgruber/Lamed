import json
import logging
import os
import re
import unicodedata
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("uvicorn.error")

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "bible")

# MARK: - Normalização de Texto
def normalize_key(text: str) -> str:
    """Normaliza texto para lookup (minúsculo, sem acentos, sem pontuação, sem espaços extras)."""
    if not text:
        return ""
    text = text.lower().strip()
    text = "".join(
        c for c in unicodedata.normalize("NFD", text)
        if unicodedata.category(c) != "Mn"
    )
    return re.sub(r"[^a-z0-9]", "", text)

# MARK: - Mapeamento Canônico de Livros e Abreviações
CANONICAL_BOOK_ALIASES: Dict[str, str] = {
    # Antigo Testamento
    "gn": "gn", "gen": "gn", "genesis": "gn",
    "ex": "ex", "exo": "ex", "exodo": "ex",
    "lv": "lv", "lev": "lv", "levitico": "lv",
    "nm": "nm", "num": "nm", "numeros": "nm",
    "dt": "dt", "deu": "dt", "deut": "dt", "deuteronomio": "dt",
    "js": "js", "jos": "js", "josue": "js",
    "jz": "jz", "jui": "jz", "juizes": "jz",
    "rt": "rt", "rut": "rt", "rute": "rt",
    "1sm": "1sm", "1sam": "1sm", "1samuel": "1sm", "isamuel": "1sm",
    "2sm": "2sm", "2sam": "2sm", "2samuel": "2sm", "iisamuel": "2sm",
    "1rs": "1rs", "1re": "1rs", "1reis": "1rs", "ireis": "1rs",
    "2rs": "2rs", "2re": "2rs", "2reis": "2rs", "iireis": "2rs",
    "1cr": "1cr", "1cro": "1cr", "1cronicas": "1cr", "icronicas": "1cr",
    "2cr": "2cr", "2cro": "2cr", "2cronicas": "2cr", "iicronicas": "2cr",
    "ed": "ed", "esd": "ed", "esdras": "ed",
    "ne": "ne", "nee": "ne", "neemias": "ne",
    "et": "et", "est": "et", "ester": "et",
    "job": "jó", "jo": "jó", "jó": "jó",
    "sl": "sl", "sal": "sl", "salmo": "sl", "salmos": "sl", "ps": "sl",
    "pv": "pv", "pro": "pv", "prov": "pv", "proverbios": "pv",
    "ec": "ec", "ecl": "ec", "eclesiastes": "ec",
    "ct": "ct", "cantares": "ct", "canticos": "ct", "canticodosscanticos": "ct",
    "is": "is", "isa": "is", "isaias": "is",
    "jr": "jr", "jer": "jr", "jeremias": "jr",
    "lm": "lm", "lam": "lm", "lamentacoes": "lm", "lamentacoesdejeremias": "lm",
    "ez": "ez", "eze": "ez", "ezequiel": "ez",
    "dn": "dn", "dan": "dn", "daniel": "dn",
    "os": "os", "ose": "os", "oseias": "os",
    "jl": "jl", "joe": "jl", "joel": "jl",
    "am": "am", "amo": "am", "amos": "am",
    "ob": "ob", "oba": "ob", "obadias": "ob",
    "jn": "jn", "jon": "jn", "jonas": "jn",
    "mq": "mq", "miq": "mq", "miqueias": "mq",
    "na": "na", "nau": "na", "naum": "na",
    "hc": "hc", "hab": "hc", "habacuque": "hc",
    "sf": "sf", "sof": "sf", "sofonias": "sf",
    "ag": "ag", "age": "ag", "ageu": "ag",
    "zc": "zc", "zac": "zc", "zacarias": "zc",
    "ml": "ml", "mal": "ml", "malaquias": "ml",

    # Novo Testamento
    "mt": "mt", "mat": "mt", "mateus": "mt", "saomateus": "mt",
    "mc": "mc", "mar": "mc", "marcos": "mc", "saomarcos": "mc",
    "lc": "lc", "luc": "lc", "lucas": "lc", "saolucas": "lc",
    "joao": "jo", "saojoao": "jo", "joh": "jo", "john": "jo",
    "at": "atos", "atos": "atos", "act": "atos", "atosdosapostolos": "atos",
    "rm": "rm", "rom": "rm", "romanos": "rm",
    "1co": "1co", "1cor": "1co", "1corintios": "1co", "icorintios": "1co",
    "2co": "2co", "2cor": "2co", "2corintios": "2co", "iicorintios": "2co",
    "gl": "gl", "gal": "gl", "galatas": "gl",
    "ef": "ef", "efe": "ef", "efesios": "ef",
    "fp": "fp", "fil": "fp", "filipenses": "fp",
    "cl": "cl", "col": "cl", "colossenses": "cl",
    "1ts": "1ts", "1tes": "1ts", "1tessalonicenses": "1ts", "itessalonicenses": "1ts",
    "2ts": "2ts", "2tes": "2ts", "2tessalonicenses": "2ts", "iitessalonicenses": "2ts",
    "1tm": "1tm", "1tim": "1tm", "1timoteo": "1tm", "itimoteo": "1tm",
    "2tm": "2tm", "2tim": "2tm", "2timoteo": "2tm", "iitimoteo": "2tm",
    "tt": "tt", "tit": "tt", "tito": "tt",
    "fm": "fm", "flm": "fm", "filemom": "fm", "filemon": "fm",
    "hb": "hb", "heb": "hb", "hebreus": "hb",
    "tg": "tg", "tia": "tg", "tiago": "tg",
    "1pe": "1pe", "1ped": "1pe", "1pedro": "1pe", "ipedro": "1pe",
    "2pe": "2pe", "2ped": "2pe", "2pedro": "2pe", "iipedro": "2pe",
    "1jo": "1jo", "1joao": "1jo", "1saojoao": "1jo",
    "2jo": "2jo", "2joao": "2jo", "2saojoao": "2jo",
    "3jo": "3joao", "3joao": "3jo", "3saojoao": "3jo",
    "jd": "jd", "jud": "jd", "judas": "jd",
    "ap": "ap", "apo": "ap", "apoc": "ap", "apocalipse": "ap", "revelacao": "ap",
}

class BibleService:
    def __init__(self):
        self._versions: Dict[str, List[Dict[str, Any]]] = {}
        self._books_map: Dict[str, Dict[str, Dict[str, Any]]] = {}
        self._initialized = False

    def initialize(self):
        """Carrega os datasets bíblicos sob demanda uma única vez."""
        if self._initialized:
            return

        for version_id, filename in [("nvi", "pt_nvi.json"), ("aa", "pt_aa.json")]:
            filepath = os.path.join(DATA_DIR, filename)
            if not os.path.exists(filepath):
                logger.warning(f"Arquivo bíblico não encontrado: {filepath}")
                continue

            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self._versions[version_id] = data
                    self._books_map[version_id] = {
                        book["abbrev"].lower(): book for book in data
                    }
                    logger.info(f"Bíblia [{version_id.upper()}] carregada com sucesso: {len(data)} livros.")
            except Exception as e:
                logger.error(f"Erro ao carregar Bíblia {version_id}: {e}")

        self._initialized = True

    def _resolve_book_abbrev(self, query: str) -> Optional[str]:
        """Resolve um nome ou abreviação de livro para a chave canônica."""
        norm = normalize_key(query)
        if not norm:
            return None

        # Tratamento especial para Jó vs João: se a busca literal tiver 'ó' ou for 'job', é Jó; caso contrário 'jo' -> 'jo' (João)
        if norm in ("jo", "joao"):
            if "ó" in query.lower() or "job" in query.lower():
                return "jó"
            return "jo"

        return CANONICAL_BOOK_ALIASES.get(norm)

    def parse_reference(self, ref_str: str) -> Optional[Dict[str, Any]]:
        """
        Interpreta referências como:
        - "João 3:16"
        - "João 3:16-18"
        - "Sl 23:1-4"
        - "1 Coríntios 13:4"
        - "Romanos 8"
        """
        clean_ref = ref_str.strip()
        # Regex flexível para referências bíblicas em português (versículo único, intervalo ou capítulo)
        pattern = r"^(?P<book>(?:[1-3]\s*)?[a-zA-ZÀ-ÿ]+(?:\s+dos\s+[a-zA-ZÀ-ÿ]+|\s+de\s+[a-zA-ZÀ-ÿ]+)?)\s+(?P<chapter>\d+)(?:[:,\.\s]+(?P<start_verse>\d+)(?:[-–—](?P<end_verse>\d+))?)?$"
        match = re.match(pattern, clean_ref, re.IGNORECASE)

        if not match:
            return None

        groups = match.groupdict()
        book_raw = groups["book"]
        chapter = int(groups["chapter"])
        start_verse = int(groups["start_verse"]) if groups.get("start_verse") else None
        end_verse = int(groups["end_verse"]) if groups.get("end_verse") else start_verse

        abbrev = self._resolve_book_abbrev(book_raw)
        if not abbrev:
            return None

        return {
            "abbrev": abbrev,
            "raw_book": book_raw,
            "chapter": chapter,
            "start_verse": start_verse,
            "end_verse": end_verse,
            "is_range": (start_verse is not None and end_verse is not None and end_verse > start_verse)
        }

    def get_books(self, version: str = "nvi") -> List[Dict[str, Any]]:
        """Retorna lista dos 66 livros com nome, abreviação e contagem de capítulos."""
        self.initialize()
        ver = version.lower()
        if ver not in self._versions:
            ver = "nvi" if "nvi" in self._versions else list(self._versions.keys())[0]

        data = self._versions.get(ver, [])
        return [
            {
                "abbrev": b["abbrev"],
                "name": b["name"],
                "total_chapters": len(b["chapters"]),
            }
            for b in data
        ]

    def get_verse_or_passage(
        self,
        ref_query: Optional[str] = None,
        book: Optional[str] = None,
        chapter: Optional[int] = None,
        verse: Optional[int] = None,
        end_verse: Optional[int] = None,
        version: str = "nvi"
    ) -> Optional[Dict[str, Any]]:
        """
        Retorna um versículo ou passagem a partir de uma string de referência (ex: 'João 3:16')
        ou de parâmetros estruturados (book='jo', chapter=3, verse=16).
        """
        self.initialize()
        ver = version.lower()
        if ver not in self._books_map:
            ver = "nvi"

        books_lookup = self._books_map.get(ver, {})

        # 1. Se query fornecida, parseia
        if ref_query:
            parsed = self.parse_reference(ref_query)
            if not parsed:
                return None
            abbrev = parsed["abbrev"]
            chapter = parsed["chapter"]
            start_verse = parsed["start_verse"]
            end_verse = parsed["end_verse"]
        else:
            if not book or not chapter:
                return None
            abbrev = self._resolve_book_abbrev(book)
            if not abbrev:
                return None
            start_verse = verse
            end_verse = end_verse or verse

        book_data = books_lookup.get(abbrev)
        if not book_data:
            return None

        chapters = book_data["chapters"]
        if chapter < 1 or chapter > len(chapters):
            return None

        chapter_verses = chapters[chapter - 1]
        total_verses_in_chapter = len(chapter_verses)

        # Se nenhum versículo foi especificado, retorna o capítulo completo
        if not start_verse:
            return {
                "book": book_data["name"],
                "abbrev": book_data["abbrev"],
                "chapter": chapter,
                "version": ver.upper(),
                "reference": f"{book_data['name']} {chapter}",
                "total_verses": total_verses_in_chapter,
                "verses": [
                    {"number": i + 1, "text": chapter_verses[i]}
                    for i in range(total_verses_in_chapter)
                ]
            }

        # Validação de versículos
        if start_verse < 1 or start_verse > total_verses_in_chapter:
            return None

        end_v = end_verse if end_verse else start_verse
        end_v = min(end_v, total_verses_in_chapter)

        # Passagem ou versículo único
        verses_list = [
            {"number": v_idx + 1, "text": chapter_verses[v_idx]}
            for v_idx in range(start_verse - 1, end_v)
        ]

        # Texto concatenado fluído
        combined_text = " ".join(item["text"] for item in verses_list)

        ref_label = f"{book_data['name']} {chapter}:{start_verse}"
        if end_v > start_verse:
            ref_label += f"-{end_v}"

        return {
            "book": book_data["name"],
            "abbrev": book_data["abbrev"],
            "chapter": chapter,
            "start_verse": start_verse,
            "end_verse": end_v,
            "version": ver.upper(),
            "reference": ref_label,
            "text": combined_text,
            "verses": verses_list,
            "total_verses_in_chapter": total_verses_in_chapter
        }

    def get_chapter(self, book: str, chapter: int, version: str = "nvi") -> Optional[Dict[str, Any]]:
        """Retorna todos os versículos de um capítulo para leitura de contexto expandido."""
        return self.get_verse_or_passage(
            book=book,
            chapter=chapter,
            verse=None,
            version=version
        )


# Instância Singleton global
bible_service = BibleService()
