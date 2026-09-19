// MARK: - Constants & Book Mappings
/**
 * Utilitário para detecção e transformação de referências bíblicas em links interativos.
 */

// Lista normalizada de abreviações e nomes de livros bíblicos conhecidos
export const BIBLE_BOOK_PATTERNS = [
  // Antigo Testamento
  'gênesis', 'genesis', 'gn',
  'êxodo', 'exodo', 'ex',
  'levítico', 'levitico', 'lv',
  'números', 'numeros', 'nm',
  'deuteronômio', 'deuteronomio', 'dt',
  'josué', 'josue', 'js',
  'juízes', 'juizes', 'jz',
  'rute', 'rt',
  '1\\s*samuel', '2\\s*samuel', '1\\s*sm', '2\\s*sm',
  '1\\s*reis', '2\\s*reis', '1\\s*rs', '2\\s*rs',
  '1\\s*crônicas', '1\\s*cronicas', '2\\s*crônicas', '2\\s*cronicas', '1\\s*cr', '2\\s*cr',
  'esdras', 'ed',
  'neemias', 'ne',
  'ester', 'et',
  'jó', 'job',
  'salmos', 'salmo', 'sl',
  'provérbios', 'proverbios', 'pv',
  'eclesiastes', 'ec',
  'cânticos', 'canticos', 'cantares', 'ct',
  'isaías', 'isaias', 'is',
  'jeremias', 'jr',
  'lamentações', 'lamentacoes', 'lm',
  'ezequiel', 'ez',
  'daniel', 'dn',
  'oséias', 'oseias', 'os',
  'joel', 'jl',
  'amós', 'amos', 'am',
  'obadias', 'ob',
  'jonas', 'jn',
  'miquéias', 'miqueias', 'mq',
  'naum', 'na',
  'habacuque', 'hc',
  'sofonias', 'sf',
  'ageu', 'ag',
  'zacarias', 'zc',
  'malaquias', 'ml',

  // Novo Testamento
  'mateus', 'mt',
  'marcos', 'mc',
  'lucas', 'lc',
  'joão', 'joao', 'jo',
  'atos', 'at',
  'romanos', 'rm',
  '1\\s*coríntios', '1\\s*corintios', '2\\s*coríntios', '2\\s*corintios', '1\\s*co', '2\\s*co',
  'gálatas', 'galatas', 'gl',
  'efésios', 'efesios', 'ef',
  'filipenses', 'fp',
  'colossenses', 'cl',
  '1\\s*tessalonicenses', '2\\s*tessalonicenses', '1\\s*ts', '2\\s*ts',
  '1\\s*timóteo', '1\\s*timoteo', '2\\s*timóteo', '2\\s*timoteo', '1\\s*tm', '2\\s*tm',
  'tito', 'tt',
  'filemom', 'filemon', 'fm',
  'hebreus', 'hb',
  'tiago', 'tg',
  '1\\s*pedro', '2\\s*pedro', '1\\s*pe', '2\\s*pe',
  '1\\s*joão', '1\\s*joao', '2\\s*joão', '2\\s*joao', '3\\s*joão', '3\\s*joao', '1\\s*jo', '2\\s*jo', '3\\s*jo',
  'judas', 'jd',
  'apocalipse', 'ap',
].join('|');

// MARK: - Regular Expressions
// Regex para capturar livros + capítulo + versículo opcional/intervalo
// Ex: "João 3:16", "Rm 8:28", "Sl 23:1-4", "1 Coríntios 13:4-7", "Gênesis 1:1"
const BIBLE_REF_REGEX = new RegExp(
  `(?:\\[)?\\b(${BIBLE_BOOK_PATTERNS})\\s+(\\d+)(?:[:.,\\s](\\d+)(?:[-–—](\\d+))?)?(?:\\])?`,
  'gi',
);

// MARK: - Transformations & HTML Linkification
/**
 * Escaneia HTML ou texto e adiciona tags de referência bíblica clicáveis
 * apenas fora de tags HTML existentes (ex: sem estragar <a>, <img> ou atributos).
 *
 * @param htmlContent Conteúdo HTML ou texto original a ser processado.
 * @returns String HTML com as referências envolvidas por spans interativos.
 */
export function linkifyScriptures(htmlContent: string): string {
  if (!htmlContent) return '';

  // Divide o conteúdo em tags HTML e nós de texto
  const parts = htmlContent.split(/(<[^>]*>)/g);

  return parts
    .map((part) => {
      // Se for tag HTML (começa com '<'), retorna sem modificar
      if (part.startsWith('<')) {
        return part;
      }

      // No texto plano, substitui referências bíblicas
      return part.replace(
        BIBLE_REF_REGEX,
        (fullMatch, book, chapter, startV, endV) => {
          // Limpa colchetes ou caracteres pontuais
          const cleanRef = fullMatch.replace(/[\[\]]/g, '').trim();
          return `<span class="lamed-bible-ref" data-bible-ref="${cleanRef}" role="button" tabindex="0" title="Ler passagem bíblica">${cleanRef}</span>`;
        },
      );
    })
    .join('');
}

