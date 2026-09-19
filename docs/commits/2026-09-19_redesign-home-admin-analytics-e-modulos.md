<!--
================================================================================
LOG DE MANUTENÇÃO DE DOCUMENTAÇÃO
--------------------------------------------------------------------------------
Data       | Autor          | Descrição
--------------------------------------------------------------------------------
2026-09-19 | Antigravity AI | Registro consolidado de desenvolvimento da sessão.
================================================================================
-->

# Registro de Desenvolvimento — 2026-09-19

| Metadado | Detalhe |
| :--- | :--- |
| **Escopo Principal** | Redesign Completo da Home, Painel Admin com Analytics, Busca de Artigos e Modernização de Módulos |
| **Commits Gerados** | 10 commits atômicos |
| **Arquivos Modificados** | ~45 arquivos (backend, frontend e governança) |
| **ADRs Vinculadas / Geradas** | `docs/adr/0001-integracao-google-analytics-data-api.md` |

---

## 1. Visão Geral das Alterações
Nesta sessão foi realizada uma modernização abrangente no ecossistema do Lamed, cobrindo tanto a experiência do usuário final quanto a infraestrutura do painel administrativo. A página inicial (`/`) foi reconstruída com base nos três pilares de estudo (Lições, Artigos e Vídeos), destaque dinâmico da lição semanal e seções de apoio e identidade hebraica do Lamed (letra ל). No backend, foi integrado o cliente oficial do Google Analytics Data API protegido por autenticação administrativa com cobertura de testes unitários. Os módulos de Artigos (com busca reativa e normalização textual), Vídeos, Sobre Nós, Contato e Bundles foram harmonizados sob o novo design system corporativo (paleta `#f8941b`, `#940312`, tipografia Caecilia e acessibilidade WCAG 2.2 AA).

---

## 2. Arquitetura Afetada & Decisões (ADRs)
- **Decisões Registradas:**
  - [`docs/adr/0001-integracao-google-analytics-data-api.md`](file:///Users/matheus.diniz_1/Documents/GitHub/Lamed/docs/adr/0001-integracao-google-analytics-data-api.md): Arquitetura BFF para telemetria administrativa via Google Analytics Data API v1beta com fallback seguro e bloqueio estrito `get_admin`.
- **Diagrama de Relações e Fluxos:**

```mermaid
graph TD
    subgraph Frontend [Angular 18+ Client]
        Home[Página Home /] --> Pillars[3 Pilares de Estudo]
        Home --> LatestBundle[Lição Semanal em Destaque]
        Home --> LatestArticles[Artigos Recentes]
        Articles[Catálogo de Artigos] --> SearchSvc[ArticleSearchService]
        AdminDash[Admin Dashboard] --> AdminSvc[AdminAnalyticsService]
    end

    subgraph Backend [FastAPI Server]
        AdminSvc -->|JWT Auth Bearer| AnalyticsRouter[/admin/analytics/*]
        AnalyticsRouter --> AuthDep[Depends: get_admin]
        AuthDep --> AnalyticsSvc[AnalyticsService]
        AnalyticsSvc --> GA4[(Google Analytics Data API)]
        AnalyticsSvc -.-> FallbackMock[Mock de Desenvolvimento]
    end
```

---

## 3. Mapa de Arquivos Modificados

| Arquivo | Camada Técnica | Resumo da Modificação |
| :--- | :--- | :--- |
| `backend/services/analytics_service.py` | Backend / Service | Cliente do Google Analytics Data API com métodos para overview, realtime e top content |
| `backend/routes/analytics.py` | Backend / Router | Rotas HTTP protegidas por `get_admin` sob o prefixo `/admin/analytics` |
| `backend/tests/test_analytics_api.py` | Backend / Test | Suíte com 5 testes unitários de integração analítica |
| `docs/adr/0001-integracao-google-analytics-data-api.md` | Governança / ADR | Decisão arquitetural formal para integração server-side com GA4 |
| `frontend/src/app/services/admin-analytics.service.ts` | Frontend / Service | Serviço Angular tipado para consumo de métricas analíticas |
| `frontend/src/app/admin/dashboard/` | Frontend / UI | Dashboard enriquecido com KPIs de audiência, gráficos e rankings |
| `frontend/src/app/core/utils/article-search.utils.ts` | Frontend / Utils | Normalização de diacríticos e ranqueamento de relevância para busca |
| `frontend/src/app/services/article-search.service.ts` | Frontend / Service | Busca reativa com debounce, paginação e filtragem por tema |
| `frontend/src/app/componentes/home/` | Frontend / UI | Nova página inicial com pilares, lição em destaque e identidade Lamed |
| `frontend/src/app/componentes/artigos/` | Frontend / UI | Catálogo e leitor de artigos modernizados com design system Lamed |
| `frontend/src/app/componentes/videos/` | Frontend / UI | Grid de vídeos e player responsivo com paleta harmonizada |
| `frontend/src/app/componentes/sobre/` | Frontend / UI | Redesign institucional com TeamModalComponent acessível |
| `frontend/src/app/componentes/contato/` | Frontend / UI | Formulário acessível com acordeão de FAQ e seletor de assunto |
| `frontend/src/app/componentes/bundle-list/` | Frontend / UI | Harmonização visual de lições semanais |
| `frontend/src/styles.scss` | Frontend / Global CSS | Ajustes de variáveis, espaçamentos do hero e remoção de margens negativas |

---

## 4. Detalhamento por Commit

### `864b62c` — `feat(backend): implementar servico e rotas para google analytics data api`
- **Razão:** Centralizar métricas de acesso sem expor Service Accounts no client-side.
- **Comportamento:** O backend consulta a API v1beta do GA4 ou retorna dados de mock se não configurado.
- **Decisões técnicas:** Vinculado à ADR 0001.

### `6d5024a` — `feat(admin): integrar metricas de audiencia e telemetria no dashboard`
- **Razão:** Fornecer aos administradores visibilidade de tráfego, usuários ativos e páginas populares.
- **Comportamento:** Novos cards interativos de métricas e gráficos de doação responsivos.

### `905bff6` — `feat(artigos): implementar busca reativa e novo design de catalogo e detalhes`
- **Razão:** Facilitar a localização de estudos e aprofundamento teológico.
- **Comportamento:** Busca instantânea com remoção de acentos e ordenação inteligente.

### `49d95db` — `refactor(videos): modernizar catalogo e reprodutor de videos com novo design system`
- **Razão:** Alinhar o módulo de vídeos com a identidade visual da plataforma.

### `595548a` — `refactor(sobre): atualizar pagina sobre e modal de equipe com padroes de acessibilidade`
- **Razão:** Garantir foco acessível (WCAG 2.2) e navegação mobile ergonômica.

### `f31c283` — `refactor(bundles): padronizar listagem e visualizacao de licoes semanais`
- **Razão:** Melhorar legibilidade de materiais de estudo e downloads em PDF.

### `b56acbb` — `test(apoie): prover icones lucide no modulo de testes da pagina de apoio`
- **Razão:** Corrigir provedor de ícones Lucide no TestBed do módulo de apoio.

### `933424b` — `refactor(home): renovar pagina inicial com pilares de estudo e hero aprimorado`
- **Razão:** Criar primeira dobra impactante e destacar os conteúdos principais do portal.

### `8fd26a5` — `chore(icons): adicionar SendHorizontal e MessageSquare aos icones globais`
- **Razão:** Suporte a ícones de contato e envio de mensagens.

### `0843411` — `refactor(contato): modernizar formulario de contato com faq e feedback acessivel`
- **Razão:** Melhorar conversão de contato com FAQ interativa e validações em tempo real.

---

## 5. Dívida Técnica & Próximos Passos
- [ ] Implementar cache in-memory com TTL de 5 minutos no backend para respostas do Google Analytics Data API.
- [ ] Adicionar testes E2E com Playwright cobrindo o fluxo completo da Home até a leitura de Artigos e Bundles.
- [ ] Avaliar pré-renderização estática (SSG) para artigos teológicos de alto tráfego orgânico.
