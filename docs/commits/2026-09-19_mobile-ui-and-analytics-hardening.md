<!--
================================================================================
LOG DE MANUTENÇÃO DE DOCUMENTAÇÃO
--------------------------------------------------------------------------------
Data       | Autor          | Descrição
--------------------------------------------------------------------------------
2026-09-19 | Antigravity AI | Registro consolidado de desenvolvimento da sessão (Mobile UI, Router Scroll, Smart Header, Apoie e Hardening Backend).
================================================================================
-->

# Registro de Desenvolvimento — 2026-09-19

| Metadado | Detalhe |
| :--- | :--- |
| **Escopo Principal** | Otimização Mobile, Router Scroll Restoration, Smart Sticky Header & Bottom Nav, Ajustes de Busca, Gráficos de Apoio e Cache In-Memory Backend |
| **Commits Gerados** | 7 commits atômicos |
| **Arquivos Modificados** | 16 arquivos (backend, frontend core, UI components, testes e segurança) |
| **ADRs Vinculadas / Geradas** | `docs/adr/0001-integracao-google-analytics-data-api.md` (extensão com cache in-memory) |

---

## 1. Visão Geral das Alterações
Nesta sessão foi realizada uma série de refinamentos críticos de usabilidade, layout mobile e segurança operacional. No backend, implementou-se um cache in-memory com TTL determinístico de 5 minutos (`SimpleMemoryCache`) para mitigar o consumo de cotas da Google Analytics Data API v1beta, além de proteção com token de sincronização contra timing attacks e cabeçalhos estritos de segurança (`CSP`, `HSTS`, `X-Frame-Options`) no `firebase.json`. No frontend, sanou-se a persistência indevida de posição de rolagem em trocas de rota com restauração instantânea ao topo (`scrollPositionRestoration: 'top'`), eliminou-se a verificação frágil de modo embutido (`inIframe`), desenvolveu-se um Smart Sticky Header com animação fluida baseada em direção de rolagem e uma barra de navegação inferior nativa (`bottom navigation bar`) com gaveta modal (`bottom sheet`), aprimorou-se a legibilidade e proporção dos gráficos de doação no mobile e removeu-se o duplo botão de exclusão (`::-webkit-search-cancel-button`) na busca de artigos.

---

## 2. Arquitetura Afetada & Decisões (ADRs)
- **Decisões Vinculadas:**
  - [`docs/adr/0001-integracao-google-analytics-data-api.md`](file:///Users/matheus.diniz_1/Documents/GitHub/Lamed/docs/adr/0001-integracao-google-analytics-data-api.md): Otimização com padrão Cache-Aside in-memory (TTL 300s) mitigando quotas diárias do GA4 e endpoint administrativo autenticado para expurgo manual de cache.
- **Diagrama de Relações e Fluxos:**

```mermaid
graph TD
    subgraph Client [Angular Client - Mobile & Desktop]
        Router[Router NavigationEnd] -->|Instant Scroll| ScrollTop[window.scrollTo 0, 0]
        Header[Smart Sticky Header] -->|Scroll Down > 400px| HideHeader[Transform translateY -100%]
        Header -->|Scroll Up / Top <= 25px| ShowHeader[Transform translateY 0]
        BottomNav[Mobile Bottom Nav] -->|Toque Menu| BottomSheet[Bottom Sheet + Accordion]
        Articles[Busca de Artigos] -->|CSS Webkit Reset| SingleClearBtn[Apenas Ícone Lucide 'X']
        Apoie[Apoie & Doações] -->|Responsive Legend/Height| ChartJs[Donut Charts Auditados]
    end

    subgraph Backend [FastAPI Backend]
        ReqAnalytics[/admin/analytics/overview] --> CacheCheck{Cache Válido? < 5 min}
        CacheCheck -- Sim --> ReturnCached[Resposta Imediata Cacheada]
        CacheCheck -- Não --> FetchGA4[Google Analytics Data API]
        FetchGA4 --> SaveCache[Armazenar em SimpleMemoryCache]
        SaveCache --> ReturnFresh[Resposta Atualizada]
        AdminFlush[/admin/analytics/cache/clear] --> FlushMemory[Esvaziar Cache]
    end
```

---

## 3. Mapa de Arquivos Modificados

| Arquivo | Camada Técnica | Resumo da Modificação |
| :--- | :--- | :--- |
| `backend/services/analytics_service.py` | Backend / Service | Implementação de `SimpleMemoryCache` com TTL de 300s e métodos `clear_cache` e `get_cache_stats` |
| `backend/routes/analytics.py` | Backend / Router | Adição do endpoint administrativo `POST /admin/analytics/cache/clear` |
| `backend/main.py` | Backend / Security | Comparação segura de tokens via `secrets.compare_digest` contra timing attacks |
| `backend/tests/test_analytics_api.py` | Backend / Test | Adição de 2 testes unitários para verificação de hit de cache e expurgo |
| `firebase.json` | Infraestrutura / Config | Configuração de cabeçalhos de segurança estritos (`HSTS`, `CSP`, `X-Content-Type-Options`) |
| `firestore.rules` | Infraestrutura / DB Rules | Remoção de regra redundante para a coleção de artigos |
| `frontend/src/app/app.config.ts` | Frontend / Core | Habilitação de `withInMemoryScrolling({ scrollPositionRestoration: 'top' })` |
| `frontend/src/app/app.ts` | Frontend / Core | Fallback de restauração instantânea de scroll no evento `NavigationEnd` |
| `frontend/src/app/app.scss` | Frontend / Layout | Ajuste de espaçamento global inferior para acomodar a barra de navegação mobile |
| `frontend/src/app/componentes/shared/header/*` | Frontend / UI Component | Smart Header responsivo com direção de rolagem, Bottom Nav fixa e Bottom Sheet modal |
| `frontend/src/app/componentes/home/home.scss` | Frontend / Home | Otimização do hero (`min-height: 520px`), tipografia fluida e expansão das seções Apoio e Sobre |
| `frontend/src/app/componentes/artigos/artigos.scss` | Frontend / Artigos | Supressão do botão de limpeza nativo de navegadores WebKit (`::-webkit-search-cancel-button`) |
| `frontend/src/app/componentes/artigos/artigos.html` | Frontend / Artigos | Modernização do badge de contagem de resultados da busca |
| `frontend/src/app/componentes/apoie/apoie.scss` | Frontend / Apoie | Formatação do badge principal em linha única com espaçamento harmonioso |
| `frontend/src/app/componentes/donation-charts/*` | Frontend / Apoie | Altura e legendas responsivas no Chart.js para evitar cortes ou quebras em telas menores |

---

## 4. Detalhamento por Commit

### `feat(analytics): implementar cache in-memory com ttl e endurecimento de seguranca` (Hash `1c615fb`)
- **Razão da alteração:** Proteger as cotas da Google Analytics Data API e eliminar vulnerabilidades de segurança estática.
- **Comportamento atual:** Respostas dos endpoints analíticos são servidas da memória por até 5 minutos com fallback resiliente; verificação de token de sincronização imune a timing attacks.
- **Arquivos envolvidos:**
  - `backend/services/analytics_service.py`, `backend/routes/analytics.py`, `backend/main.py`, `backend/tests/test_analytics_api.py`, `firebase.json`, `firestore.rules`.

### `fix(router): restaurar scroll ao topo em mudancas de rota e corrigir verificacao de modo embutido` (Hash `82edd4b`)
- **Razão da alteração:** Usuários relatavam que ao navegar entre páginas a visualização permanecia na altura da página anterior e o cabeçalho/rodapé desaparecia no mobile.
- **Comportamento atual:** Toda mudança de rota reinicia instantaneamente o scroll para o topo absoluto (`top: 0, left: 0`); remoção da regra frágil de `inIframe`.
- **Arquivos envolvidos:**
  - `frontend/src/app/app.config.ts`, `frontend/src/app/app.ts`.

### `feat(ui): implementar smart sticky header com deteccao de rolagem e animacao suave` (Hash `d32ebce`)
- **Razão da alteração:** O cabeçalho ocupava espaço de tela durante a rolagem contínua para baixo, prejudicando a leitura no mobile e desktop.
- **Comportamento atual:** Cabeçalho recolhe suavemente via CSS `transform: translateY(-100%)` ao rolar para baixo após 400px e reaparece imediatamente ao rolar para cima ou ao retornar ao topo.
- **Arquivos envolvidos:**
  - `frontend/src/app/componentes/shared/header/header.ts`, `frontend/src/app/componentes/shared/header/header.scss`, `frontend/src/app/componentes/shared/header/header.html`.

### `style(home): otimizar proporcoes do hero e ampliar espacamento de apoio e sobre no mobile` (Hash `f7be7f3`)
- **Razão da alteração:** No mobile o hero estava com altura insuficiente para o texto e as seções finais (Apoio e Sobre Nós) apresentavam margens apertadas.
- **Comportamento atual:** Altura mínima do hero calibrada para 520px com tipografia clamp harmônica e seções inferiores ocupando a largura total de forma arejada.
- **Arquivos envolvidos:**
  - `frontend/src/app/componentes/home/home.scss`.

### `fix(artigos): remover duplo botao de limpar na busca e aprimorar badge de resultados` (Hash `e4ba32d`)
- **Razão da alteração:** O campo de busca de artigos apresentava dois 'X' para limpeza (o nativo do WebKit e o ícone Lucide customizado).
- **Comportamento atual:** O botão nativo foi suprimido via CSS e o badge de contagem de resultados foi estilizado de forma minimalista e elegante.
- **Arquivos envolvidos:**
  - `frontend/src/app/componentes/artigos/artigos.scss`, `frontend/src/app/componentes/artigos/artigos.html`.

### `fix(apoie): ajustar proporcoes dos graficos de doacao e espacamento do badge principal` (Hash `dc2c8dc`)
- **Razão da alteração:** Os gráficos em rosca do Chart.js ficavam comprimidos no mobile e o badge 'Principal Forma de Apoio' quebrava desajeitadamente.
- **Comportamento atual:** Gráficos com alturas calibradas (320px/275px), tamanhos e paddings de legenda reduzidos responsivamente e badge em linha única com margem inferior antes do título.
- **Arquivos envolvidos:**
  - `frontend/src/app/componentes/apoie/apoie.scss`, `frontend/src/app/componentes/donation-charts/donation-charts.component.*`.

### `feat(ui): implementar barra de navegacao inferior e menu modal bottom-sheet no mobile` (Hash `fb88ae2`)
- **Razão da alteração:** Proporcionar navegação móvel de padrão nativo (*Apple Fluid / Modern Material*) com ergonomia de alcance pelo polegar (*Thumb Zone*).
- **Comportamento atual:** Barra fixa na parte inferior da tela com 4 rotas prioritárias e botão de menu que abre uma gaveta inferior deslizante com accordion de materiais e redes sociais.
- **Arquivos envolvidos:**
  - `frontend/src/app/app.scss`, `frontend/src/app/componentes/shared/header/header.*`.

---

## 5. Dívida Técnica & Próximos Passos

- [ ] Executar auditoria automatizada de acessibilidade via `/a11y-debugging` em dispositivos Android e iOS reais.
- [ ] Avaliar persistência distribuída de cache (Redis ou Cloud Memorystore) caso o backend FastAPI seja escalado horizontalmente em múltiplos containers Cloud Run.
