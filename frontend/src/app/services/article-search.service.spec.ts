import { TestBed } from '@angular/core/testing';
import { ArticleSearchService } from './article-search.service';
import { Article } from './article.service';

describe('ArticleSearchService', () => {
  let service: ArticleSearchService;

  const mockArticles: Article[] = [
    {
      id: 'art-1',
      title: 'A Importância da Oração Diária',
      summary: 'Descubra como a prece e a comunhão transformam o coração e trazem paz interior.',
      cover_image: '',
      content: 'A oração é a respiração da alma. Quando nos ajoelhamos, encontramos forças e consolo.',
      highlights: [],
      tags: ['oração', 'vida cristã', 'comunhão'],
      is_active: true,
      author: 'Redação Lamed',
    },
    {
      id: 'art-2',
      title: 'Alimentação e Saúde do Corpo',
      summary: 'Princípios bíblicos para uma vida com mais vigor físico e saúde equilibrada.',
      cover_image: '',
      content: 'O corpo é templo do Espírito. Escolhas alimentares conscientes promovem vitalidade.',
      highlights: [],
      tags: ['saúde', 'estilo de vida', 'nutrição'],
      is_active: true,
      author: 'Dr. Lucas',
    },
    {
      id: 'art-3',
      title: 'Entendendo as Profecias do Apocalipse',
      summary: 'Um panorama bíblico sobre esperança e o retorno de Cristo.',
      cover_image: '',
      content: 'O livro de Apocalipse revela a vitória final de Jesus sobre as aflições deste mundo.',
      highlights: [],
      tags: ['profecia', 'escatologia', 'apocalipse'],
      is_active: true,
      author: 'Teólogo Marcos',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArticleSearchService);
  });

  it('deve ser criado com sucesso', () => {
    expect(service).toBeTruthy();
  });

  it('deve retornar lista vazia para busca vazia', () => {
    const results = service.searchArticles('', mockArticles);
    expect(results).toEqual([]);
  });

  it('deve encontrar artigo sobre oração mesmo pesquisando por sinônimo (prece e paz)', () => {
    const results = service.searchArticles('prece e paz', mockArticles);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.id).toBe('art-1');
  });

  it('deve encontrar artigo de profecias ao pesquisar por "Jesus Cristo e escatologia"', () => {
    const results = service.searchArticles('Jesus Cristo e escatologia', mockArticles);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.id).toBe('art-3');
  });

  it('deve encontrar artigo de saúde ao pesquisar por "nutrição e corpo"', () => {
    const results = service.searchArticles('nutrição e corpo', mockArticles);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.id).toBe('art-2');
  });
});
