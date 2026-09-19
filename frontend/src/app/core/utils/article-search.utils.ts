// MARK: - Types & Interfaces
export interface SearchResultItem<T> {
  item: T;
  score: number;
  lexicalScore?: number;
  vectorScore?: number;
  origin: 'hybrid' | 'neural' | 'lexical';
  snippet?: string;
}

// MARK: - Stop Words PT-BR
export const STOP_WORDS_PT: ReadonlySet<string> = new Set([
  'de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'com', 'nao', 'uma',
  'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'ao', 'ele',
  'das', 'seu', 'sua', 'ou', 'quando', 'muito', 'nos', 'ja', 'eu', 'tambem', 'so',
  'pelo', 'pela', 'ate', 'isso', 'ela', 'entre', 'depois', 'sem', 'mesmo', 'aos',
  'seus', 'quem', 'nas', 'me', 'esse', 'eles', 'voce', 'essa', 'num', 'nem', 'suas',
  'meu', 'minha', 'numa', 'pelos', 'elas', 'qual', 'lhe', 'deles', 'essas', 'esses',
  'pelas', 'este', 'dele', 'tu', 'te', 'voces', 'vos', 'lhes', 'meus', 'minhas',
  'teu', 'tua', 'teus', 'tuas', 'nosso', 'nossa', 'nossos', 'nossas', 'dela', 'delas',
  'esta', 'estes', 'estas', 'aquele', 'aquela', 'aqueles', 'aquelas', 'isto', 'aquilo',
  'estou', 'estamos', 'estao', 'estive', 'esteve', 'estivemos', 'estiveram', 'estava',
  'estavamos', 'estavam', 'sou', 'somos', 'sao', 'era', 'eramos', 'eram', 'fui',
  'foi', 'fomos', 'foram', 'tenho', 'tem', 'temos', 'tinha', 'tinhamos', 'tinham',
  'tive', 'teve', 'tivemos', 'tiveram', 'antes', 'apos', 'sobre', 'atraves', 'onde',
  'qualquer', 'cada', 'todos', 'toda', 'todo', 'todas', 'aqui', 'ali', 'la', 'assim',
  'entao', 'algo', 'nada',
]);

// MARK: - Sinônimos Temáticos Bíblicos e Cristãos (Contexto Lamed)
export const THEMATIC_SYNONYMS: Record<string, string[]> = {
  biblia: ['escritura', 'palavra', 'evangelho', 'testamento', 'versiculo', 'sagrada'],
  escritura: ['biblia', 'palavra', 'texto', 'sagrada'],
  oracao: ['prece', 'clamor', 'suplica', 'intercessao', 'comunhao', 'orar'],
  orar: ['oracao', 'prece', 'clamar', 'suplicar', 'conversar'],
  deus: ['senhor', 'pai', 'criador', 'eterno', 'onipotente', 'jehova', 'yahweh'],
  jesus: ['cristo', 'salvador', 'messias', 'mestre', 'filho', 'cordeiro'],
  cristo: ['jesus', 'salvador', 'messias', 'ungido', 'redentor'],
  espirito: ['consolador', 'paracleto', 'santificador', 'guia'],
  salvacao: ['redencao', 'graca', 'perdao', 'justificacao', 'libertacao', 'eterna'],
  graca: ['misericordia', 'favor', 'perdao', 'salvacao'],
  fe: ['crenca', 'confianca', 'fidelidade', 'certeza', 'crer'],
  esperanca: ['promessa', 'futuro', 'consolo', 'confianca'],
  saude: ['bem-estar', 'cura', 'vigor', 'vitalidade', 'habito', 'temperanca', 'corpo'],
  cura: ['saude', 'restauracao', 'milagre', 'tratamento'],
  alimento: ['alimentacao', 'dieta', 'nutricao', 'refeicao', 'saudavel'],
  ansiedade: ['angustia', 'preocupacao', 'medo', 'aflicao', 'estresse'],
  paz: ['tranquilidade', 'serenidade', 'descanso', 'conforto', 'calma'],
  profecia: ['apocalipse', 'daniel', 'escatologia', 'revelacao', 'tempo', 'fim'],
  apocalipse: ['profecia', 'revelacao', 'escatologia', 'retorno'],
  sabado: ['dia', 'repouso', 'descanso', 'sagrado', 'mandamento', 'guarda'],
  lei: ['mandamentos', 'decalogo', 'preceito', 'regras', 'estatuto'],
  igreja: ['comunidade', 'congregacao', 'irmaos', 'templo', 'povo'],
  familia: ['lar', 'casamento', 'filhos', 'pais', 'relacionamento', 'esposo', 'esposa'],
};

// MARK: - Normalização e Tokenização

/**
 * Remove acentos, caracteres especiais e converte texto para minúsculas.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokeniza o texto removendo stopwords e palavras curtas.
 */
export function tokenizeAndNormalize(text: string): string[] {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  return normalized
    .split(' ')
    .filter((token) => token.length >= 2 && !STOP_WORDS_PT.has(token));
}

/**
 * Expande tokens com seus sinônimos mapeados.
 */
export function expandSynonyms(tokens: string[]): string[] {
  const resultSet = new Set<string>(tokens);

  for (const token of tokens) {
    const synonyms = THEMATIC_SYNONYMS[token];
    if (synonyms && Array.isArray(synonyms)) {
      for (const syn of synonyms) {
        resultSet.add(syn);
      }
    }
  }

  return Array.from(resultSet);
}

// MARK: - Álgebra Vetorial & Embeddings Densos

/**
 * Calcula similaridade de cosseno entre dois vetores: dot(A, B) / (||A|| * ||B||).
 * Retorna 0 caso algum vetor seja inválido, nulo ou tenha norma zero.
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Projeta um texto em um vetor denso normalizado (L2 norm) com hashing n-grama determinístico.
 */
export function embedText(text: string, dimension = 64, weightMultiplier = 1.0): number[] {
  const tokens = tokenizeAndNormalize(text);
  const vector = new Array<number>(dimension).fill(0);

  if (tokens.length === 0) {
    return vector;
  }

  for (const token of tokens) {
    for (let i = 0; i < token.length; i++) {
      const charCode = token.charCodeAt(i);
      const idx1 = (charCode * 17 + i * 31) % dimension;
      const idx2 = (charCode * 43 + i * 13) % dimension;
      vector[idx1] += 1.0 * weightMultiplier;
      vector[idx2] += 0.5 * weightMultiplier;
    }
  }

  // Normalização por norma L2
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    for (let i = 0; i < dimension; i++) {
      vector[i] = Number((vector[i] / norm).toFixed(5));
    }
  }

  return vector;
}

/**
 * Gera embedding denso específico para a query de pesquisa do usuário,
 * expandindo com sinônimos para cobertura semântica ampliada.
 */
export function embedQuery(query: string, dimension = 64): number[] {
  const tokens = tokenizeAndNormalize(query);
  const expanded = expandSynonyms(tokens);
  return embedText(expanded.join(' '), dimension, 1.0);
}

/**
 * Gera embedding de um artigo ponderando título (3x), resumo (2x), tags (2x) e conteúdo (1x).
 */
export function embedArticle(
  article: {
    title: string;
    subtitle?: string;
    summary?: string;
    tags?: string[];
    content?: string;
  },
  dimension = 64,
): number[] {
  const vector = new Array<number>(dimension).fill(0);

  // Extrai vetores por relevância de campo
  const titleVec = embedText(article.title || '', dimension, 3.0);
  const subtitleVec = embedText(article.subtitle || '', dimension, 1.5);
  const summaryVec = embedText(article.summary || '', dimension, 2.0);
  const tagsVec = embedText((article.tags || []).join(' '), dimension, 2.0);
  // Limita o conteúdo aos primeiros 800 caracteres para manter alta densidade semântica
  const contentSnippet = (article.content || '').substring(0, 800);
  const contentVec = embedText(contentSnippet, dimension, 1.0);

  for (let i = 0; i < dimension; i++) {
    vector[i] =
      titleVec[i] * 3.0 +
      subtitleVec[i] * 1.5 +
      summaryVec[i] * 2.0 +
      tagsVec[i] * 2.0 +
      contentVec[i] * 1.0;
  }

  // Normalização L2 do vetor combinado
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    for (let i = 0; i < dimension; i++) {
      vector[i] = Number((vector[i] / norm).toFixed(5));
    }
  }

  return vector;
}

// MARK: - BM25 Scoring Léxico

/**
 * Calcula pontuação BM25 de um documento para um conjunto de tokens de consulta.
 * k1 = 1.2 (saturação de frequência de termo)
 * b = 0.75 (penalização por tamanho do documento)
 */
export function calculateBM25Score(
  docTokens: string[],
  queryTokens: string[],
  avgDocLength: number,
  totalDocs: number,
  docFrequencyMap: Map<string, number>,
  k1 = 1.2,
  b = 0.75,
): number {
  if (docTokens.length === 0 || queryTokens.length === 0) {
    return 0;
  }

  const docLen = docTokens.length;
  const termFreqMap = new Map<string, number>();

  for (const token of docTokens) {
    termFreqMap.set(token, (termFreqMap.get(token) || 0) + 1);
  }

  let score = 0;

  for (const qToken of queryTokens) {
    const tf = termFreqMap.get(qToken) || 0;
    if (tf === 0) continue;

    const df = docFrequencyMap.get(qToken) || 1;
    // IDF padrão com suavização
    const idf = Math.log(1 + (totalDocs - df + 0.5) / (df + 0.5));
    const numerator = tf * (k1 + 1);
    const denominator = tf + k1 * (1 - b + (b * docLen) / (avgDocLength || 1));

    score += idf * (numerator / denominator);
  }

  return score;
}

// MARK: - RRF (Reciprocal Rank Fusion)

/**
 * Combina resultados da busca léxica (BM25) e vetorial (cosseno) usando Reciprocal Rank Fusion.
 * Score_RRF = wLexical / (k + rankLexical) + wVector / (k + rankVector)
 */
export function fuseRankingsRRF<T extends { id?: string }>(
  lexicalItems: { item: T; score: number }[],
  vectorItems: { item: T; score: number }[],
  k = 60,
  wLexical = 0.5,
  wVector = 0.5,
): SearchResultItem<T>[] {
  const mergedMap = new Map<
    string,
    {
      item: T;
      rrfScore: number;
      lexicalScore?: number;
      vectorScore?: number;
    }
  >();

  // Ranqueamento léxico
  for (let i = 0; i < lexicalItems.length; i++) {
    const entry = lexicalItems[i];
    const key = entry.item.id || JSON.stringify(entry.item);
    const rank = i + 1;
    const rrfContribution = wLexical / (k + rank);

    mergedMap.set(key, {
      item: entry.item,
      rrfScore: rrfContribution,
      lexicalScore: entry.score,
    });
  }

  // Ranqueamento vetorial
  for (let i = 0; i < vectorItems.length; i++) {
    const entry = vectorItems[i];
    const key = entry.item.id || JSON.stringify(entry.item);
    const rank = i + 1;
    const rrfContribution = wVector / (k + rank);

    const existing = mergedMap.get(key);
    if (existing) {
      existing.rrfScore += rrfContribution;
      existing.vectorScore = entry.score;
    } else {
      mergedMap.set(key, {
        item: entry.item,
        rrfScore: rrfContribution,
        vectorScore: entry.score,
      });
    }
  }

  const results: SearchResultItem<T>[] = [];

  for (const val of mergedMap.values()) {
    let origin: 'hybrid' | 'neural' | 'lexical' = 'hybrid';
    if (val.lexicalScore && !val.vectorScore) {
      origin = 'lexical';
    } else if (val.vectorScore && !val.lexicalScore) {
      origin = 'neural';
    }

    results.push({
      item: val.item,
      score: Number(val.rrfScore.toFixed(5)),
      lexicalScore: val.lexicalScore,
      vectorScore: val.vectorScore,
      origin,
    });
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

// MARK: - Highlight Snippet

/**
 * Extrai trecho contextual resumido destacando as palavras da consulta.
 */
export function extractHighlightSnippet(
  content: string,
  queryTokens: string[],
  maxLength = 140,
): string {
  if (!content) return '';

  const clean = content
    .replace(/#+\s+/g, '')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (clean.length <= maxLength) {
    return clean;
  }

  const norm = normalizeText(clean);
  let bestIdx = -1;

  for (const token of queryTokens) {
    const idx = norm.indexOf(token);
    if (idx !== -1 && (bestIdx === -1 || idx < bestIdx)) {
      bestIdx = idx;
    }
  }

  if (bestIdx === -1) {
    return clean.substring(0, maxLength) + '...';
  }

  const half = Math.floor(maxLength / 2);
  const start = Math.max(0, bestIdx - half);
  const end = Math.min(clean.length, start + maxLength);

  const snippet = clean.substring(start, end).trim();
  const prefix = start > 0 ? '...' : '';
  const suffix = end < clean.length ? '...' : '';

  return `${prefix}${snippet}${suffix}`;
}
