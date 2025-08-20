import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

/**
 * Interface para tipar os metadados de um artigo.
 * Baseado na estrutura do `articles.json`.
 */
export interface Article {
  id: string;
  title: string;
  dateISO: string;
  displayDate: string;
  link: string;
  contentPath: string;
  bannerImage: string;
  description: string;
  author: string;
  tags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {

  // Caminho para o arquivo JSON dentro da pasta 'assets' do Angular.
  private articlesUrl = 'assets/articles.json';

  constructor(private http: HttpClient) { }

  /**
   * Busca a lista de todos os artigos publicados.
   * Filtra os artigos para garantir que a data de publicação não seja no futuro.
   * @returns Um Observable com um array de artigos.
   */
  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(this.articlesUrl).pipe(
      map(articles => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return articles.filter(article => {
          if (!article.dateISO) return false;
          const articleDate = new Date(article.dateISO);
          return articleDate <= today;
        });
      })
    );
  }

  /**
   * Busca os metadados de um único artigo pelo seu ID.
   * @param id O ID do artigo a ser encontrado.
   * @returns Um Observable com o artigo encontrado ou `undefined`.
   */
  getArticleById(id: string): Observable<Article | undefined> {
    return this.getArticles().pipe(
      map(articles => articles.find(article => article.id === id))
    );
  }

  /**
   * Busca o conteúdo HTML de um arquivo de artigo.
   * @param contentPath O caminho para o arquivo HTML do artigo (ex: 'Artigos/artigo1.html').
   * @returns Um Observable com o conteúdo do arquivo como uma string de texto.
   */
  getArticleContent(contentPath: string): Observable<string> {
    // É crucial usar { responseType: 'text' } para buscar arquivos HTML/texto.
    return this.http.get(`assets/${contentPath}`, { responseType: 'text' });
  }
}
