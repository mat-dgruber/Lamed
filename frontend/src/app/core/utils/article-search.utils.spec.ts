import {
  normalizeText,
  tokenizeAndNormalize,
  calculateCosineSimilarity,
  embedText,
  embedQuery,
  embedArticle,
  calculateBM25Score,
  fuseRankingsRRF,
  extractHighlightSnippet,
  expandSynonyms,
} from './article-search.utils';

describe('article-search.utils', () => {
  describe('normalizeText', () => {
    it('deve remover acentos e caracteres especiais e passar para minúsculas', () => {
      const input = 'Bíblia Sagrada & Oração: Fé em Jesus!';
      const output = normalizeText(input);
      expect(output).toBe('biblia sagrada oracao fe em jesus');
    });

    it('deve retornar vazio para strings nulas ou vazias', () => {
      expect(normalizeText('')).toBe('');
      expect(normalizeText(null as unknown as string)).toBe('');
    });
  });

  describe('tokenizeAndNormalize', () => {
    it('deve remover stopwords em português e tokens curtos', () => {
      const tokens = tokenizeAndNormalize('a oração de um justo para a cura e a salvação');
      expect(tokens).toContain('oracao');
      expect(tokens).toContain('justo');
      expect(tokens).toContain('cura');
      expect(tokens).toContain('salvacao');
      expect(tokens).not.toContain('de');
      expect(tokens).not.toContain('um');
      expect(tokens).not.toContain('para');
    });
  });

  describe('expandSynonyms', () => {
    it('deve incluir sinônimos bíblicos e conceituais mapeados', () => {
      const expanded = expandSynonyms(['oracao', 'fe']);
      expect(expanded).toContain('oracao');
      expect(expanded).toContain('prece');
      expect(expanded).toContain('clamor');
      expect(expanded).toContain('fe');
      expect(expanded).toContain('confianca');
    });
  });

  describe('calculateCosineSimilarity', () => {
    it('deve retornar 1.0 para vetores idênticos', () => {
      const v1 = [0.5, 0.5, 0.5, 0.5];
      const similarity = calculateCosineSimilarity(v1, v1);
      expect(similarity).toBeCloseTo(1.0);
    });

    it('deve retornar 0.0 para vetores ortogonais', () => {
      const v1 = [1, 0, 0];
      const v2 = [0, 1, 0];
      expect(calculateCosineSimilarity(v1, v2)).toBeCloseTo(0.0);
    });

    it('deve retornar 0 para vetores nulos ou de tamanhos diferentes', () => {
      expect(calculateCosineSimilarity([], [])).toBe(0);
      expect(calculateCosineSimilarity([1, 2], [1, 2, 3])).toBe(0);
    });
  });

  describe('embedText & embedQuery & embedArticle', () => {
    it('deve gerar vetor com norma próxima a 1.0 e dimensão esperada', () => {
      const vec = embedText('Jesus Cristo é a salvação e esperança', 64);
      expect(vec.length).toBe(64);
      const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
      expect(norm).toBeCloseTo(1.0, 3);
    });

    it('deve gerar alta similaridade de cosseno entre texto e query semanticamente correlata', () => {
      const doc = {
        title: 'Como vencer a ansiedade com oração e fé',
        summary: 'Um guia prático sobre encontrar a paz de Deus em tempos de aflição',
        tags: ['oração', 'fé', 'saúde mental'],
        content: 'Quando as tempestades chegam, a prece diária traz serenidade ao coração.',
      };

      const docEmbedding = embedArticle(doc, 64);
      const queryEmbedding = embedQuery('paz angustia e calma', 64);

      const sim = calculateCosineSimilarity(docEmbedding, queryEmbedding);
      expect(sim).toBeGreaterThan(0.2);
    });
  });

  describe('calculateBM25Score', () => {
    it('deve pontuar mais alto quando o termo da busca aparece mais no documento', () => {
      const docFreq = new Map<string, number>([['biblia', 2]]);
      const scoreHigh = calculateBM25Score(['biblia', 'biblia', 'estudo'], ['biblia'], 3, 10, docFreq);
      const scoreLow = calculateBM25Score(['biblia', 'outro', 'texto'], ['biblia'], 3, 10, docFreq);

      expect(scoreHigh).toBeGreaterThan(scoreLow);
    });
  });

  describe('fuseRankingsRRF', () => {
    it('deve combinar e re-ranquear itens presentes nas duas listas com maior pontuação', () => {
      const itemA = { id: '1', title: 'Artigo A' };
      const itemB = { id: '2', title: 'Artigo B' };

      const lexical = [
        { item: itemA, score: 5.2 },
        { item: itemB, score: 2.1 },
      ];
      const vector = [
        { item: itemA, score: 0.88 },
        { item: itemB, score: 0.45 },
      ];

      const fused = fuseRankingsRRF(lexical, vector);
      expect(fused.length).toBe(2);
      expect(fused[0].item.id).toBe('1');
      expect(fused[0].origin).toBe('hybrid');
    });
  });

  describe('extractHighlightSnippet', () => {
    it('deve extrair trecho contendo os termos de busca', () => {
      const text = 'Este é um artigo longo sobre oração e comunhão que transforma a vida diária das pessoas.';
      const snippet = extractHighlightSnippet(text, ['oracao', 'comunhao'], 50);
      expect(snippet.toLowerCase()).toContain('oração');
    });
  });
});
