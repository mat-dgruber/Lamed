import { Injectable } from '@angular/core';
import { Article } from './article.service';
import {
  SearchResultItem,
  embedArticle,
  embedQuery,
  calculateCosineSimilarity,
  calculateBM25Score,
  fuseRankingsRRF,
  tokenizeAndNormalize,
  extractHighlightSnippet,
} from '../core/utils/article-search.utils';

interface IndexedArticle {
  article: Article;
  embedding: number[];
  tokens: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ArticleSearchService {
  private cache = new Map<string, IndexedArticle>();
  private docFrequencyMap = new Map<string, number>();
  private avgDocLength = 0;
  private indexedCount = 0;

  /**
   * Indexa uma lista de artigos em memória gerando seus embeddings e estatísticas léxicas.
   * Executa em poucos milissegundos para dezenas/centenas de artigos.
   */
  public indexArticles(articles: Article[]): void {
    if (!articles || articles.length === 0) return;

    let totalTokens = 0;
    const tempDocFreq = new Map<string, number>();

    for (const article of articles) {
      const key = article.id || article.title;
      const existing = this.cache.get(key);

      // Constrói texto unificado do artigo
      const combinedText = [
        article.title,
        article.subtitle || '',
        article.summary || '',
        (article.tags || []).join(' '),
        (article.content || '').substring(0, 800),
      ].join(' ');

      const tokens = tokenizeAndNormalize(combinedText);
      totalTokens += tokens.length;

      // Frequência de documentos contendo cada termo
      const uniqueTokens = new Set(tokens);
      for (const t of uniqueTokens) {
        tempDocFreq.set(t, (tempDocFreq.get(t) || 0) + 1);
      }

      if (!existing) {
        const embedding = embedArticle(article, 64);
        this.cache.set(key, {
          article,
          embedding,
          tokens,
        });
      } else {
        existing.article = article;
        existing.tokens = tokens;
      }
    }

    this.docFrequencyMap = tempDocFreq;
    this.indexedCount = articles.length;
    this.avgDocLength = totalTokens / (this.indexedCount || 1);
  }

  /**
   * Executa busca híbrida (neural vetorial + BM25 léxica com RRF) sobre os artigos fornecidos.
   */
  public searchArticles(
    query: string,
    articles: Article[],
    options?: { limit?: number; minSimilarity?: number },
  ): SearchResultItem<Article>[] {
    const rawTrim = (query || '').trim();
    if (!rawTrim || !articles || articles.length === 0) {
      return [];
    }

    // Garante que os artigos estão indexados
    if (this.cache.size < articles.length) {
      this.indexArticles(articles);
    }

    const queryTokens = tokenizeAndNormalize(rawTrim);
    const queryEmbedding = embedQuery(rawTrim, 64);
    const minSim = options?.minSimilarity ?? 0.04;

    const lexicalScored: { item: Article; score: number }[] = [];
    const vectorScored: { item: Article; score: number }[] = [];

    for (const article of articles) {
      const key = article.id || article.title;
      let indexed = this.cache.get(key);

      if (!indexed) {
        const embedding = embedArticle(article, 64);
        const tokens = tokenizeAndNormalize(
          `${article.title} ${article.summary || ''} ${(article.tags || []).join(' ')}`,
        );
        indexed = { article, embedding, tokens };
        this.cache.set(key, indexed);
      }

      // 1. Similaridade de Cosseno (Busca Neural Vetorial)
      const cosineSim = calculateCosineSimilarity(queryEmbedding, indexed.embedding);
      if (cosineSim > minSim) {
        vectorScored.push({ item: article, score: cosineSim });
      }

      // 2. Pontuação BM25 (Busca Léxica)
      const bm25Score = calculateBM25Score(
        indexed.tokens,
        queryTokens,
        this.avgDocLength,
        this.indexedCount || articles.length,
        this.docFrequencyMap,
      );

      // Bônus se o termo digitado estiver no título
      let finalBm25 = bm25Score;
      const lowerTitle = (article.title || '').toLowerCase();
      if (lowerTitle.includes(rawTrim.toLowerCase())) {
        finalBm25 += 2.0;
      }

      if (finalBm25 > 0.01) {
        lexicalScored.push({ item: article, score: finalBm25 });
      }
    }

    // Ordena listas preliminares
    lexicalScored.sort((a, b) => b.score - a.score);
    vectorScored.sort((a, b) => b.score - a.score);

    // 3. Fusão RRF (Reciprocal Rank Fusion)
    const fused = fuseRankingsRRF(lexicalScored, vectorScored, 60, 0.5, 0.5);

    // Adiciona snippet de contexto
    for (const res of fused) {
      const textToExtract = `${res.item.summary || ''} ${res.item.content || ''}`;
      res.snippet = extractHighlightSnippet(textToExtract, queryTokens, 140);
    }

    if (options?.limit) {
      return fused.slice(0, options.limit);
    }

    return fused;
  }
}
