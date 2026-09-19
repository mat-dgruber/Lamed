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
| **Escopo Principal** | Motor Bíblico Server-Side & Drawer Interativo de Estudo |
| **Commits Gerados** | 3 micro-commits atômicos |
| **Arquivos Modificados** | 16 arquivos (criação de serviços, rotas, testes, drawer e ADR) |
| **ADRs Vinculadas / Geradas** | `docs/adr/0002-motor-biblico-e-drawer-de-estudo-interativo.md` |

---

## 1. Visão Geral das Alterações
> Implementação ponta a ponta do sistema de consulta bíblica e imersão de estudo no Lamed. O backend em FastAPI passou a expor rotas REST de alta performance para resolução de versículos, capítulos e 66 livros bíblicos em português (NVI e AA), apoiado por uma suíte completa de testes unitários. No frontend Angular 20, foi construído um componente de Drawer lateral reativo (`BibleDrawerComponent`) com controle via Signals, cache in-memory e conversão automática de referências bíblicas em links clicáveis nos artigos e bundles semanais.

---

## 2. Arquitetura Afetada & Decisões (ADRs)
- **Decisões Registradas:**
  - `docs/adr/0002-motor-biblico-e-drawer-de-estudo-interativo.md`: Padronização do motor bíblico local em JSON no backend com resolução em O(1) e Drawer reativo no frontend para leitura de contexto expandido sem quebra de fluxo do leitor.
- **Diagrama de Relações e Fluxos:**

```mermaid
graph TD
    Reader[Artigos & Bundles] -->|linkifyScriptures| Badge[Span .lamed-bible-ref]
    Badge -->|Clique| FrontService[BibleService (Angular Signals)]
    FrontService -->|Cache Hit| MemoryCache[(In-Memory Cache)]
    FrontService -->|Cache Miss: HTTP GET| API[FastAPI /bible]
    API --> BackService[BibleService (Python)]
    BackService --> Datasets[(pt_nvi.json / pt_aa.json)]
    BackService -->|Passagem Estruturada| API
    API -->|JSON| FrontService
    FrontService --> Drawer[BibleDrawerComponent]
```

---

## 3. Mapa de Arquivos Modificados

| Arquivo | Camada Técnica | Resumo da Modificação |
| :--- | :--- | :--- |
| `backend/services/bible_service.py` | Backend / Core Service | Motor bíblico com normalização NFD, aliases e carregamento lazy |
| `backend/routes/bible.py` | Backend / API Routes | Endpoints REST (`/verse`, `/chapter`, `/books`, `/parse`) |
| `backend/main.py` | Backend / Infra | Registro do roteador de Bíblia na aplicação FastAPI |
| `backend/tests/test_bible_api.py` | Backend / Testes | 8 testes unitários cobrindo consultas e erros |
| `docs/adr/0002-motor-biblico-e-drawer-de-estudo-interativo.md` | Governança | ADR formalizando a decisão do motor bíblico e drawer |
| `frontend/src/app/core/services/bible.service.ts` | Frontend / Core Service | Estado reativo (Signals), cache local e métodos de consulta |
| `frontend/src/app/core/utils/bible-reference.utils.ts` | Frontend / Utilitários | Parser semântico e conversão segura para tags clicáveis |
| `frontend/src/app/componentes/shared/bible-drawer/*` | Frontend / UI Compartilhada | Drawer lateral responsivo, atalhos de teclado e alternância de versões |
| `frontend/src/app/app.html` & `app.ts` | Frontend / Layout Raiz | Inclusão global do Drawer na aplicação |
| `frontend/src/app/pages/article-detail/*` | Frontend / Páginas | Linkificação de citações e delegação de eventos nos artigos |
| `frontend/src/app/pages/bundle-detail/*` | Frontend / Páginas | Linkificação nos blocos de estudo e versículos-chave dos bundles |

---

## 4. Detalhamento por Commit

### `feat(backend): implementar motor biblico e rotas de consulta com testes` (Hash: `cb2fabe`)
- **Razão da alteração:** Necessidade de prover uma fonte bíblica confiável, rápida e local para os estudos.
- **Comportamento atual:** A API responde em `/bible/verse` e `/bible/chapter` retornando textos estruturados para NVI e AA.
- **Decisões técnicas & ADRs:** Vinculado à ADR 0002.
- **Arquivos envolvidos:**
  - `backend/services/bible_service.py`: Motor de indexação e parsing.
  - `backend/routes/bible.py`: Endpoints HTTP com validação FastAPI.
  - `backend/main.py`: Inclusão da rota no app.
  - `backend/tests/test_bible_api.py`: Suíte de testes automatizados com Pytest.
  - `docs/adr/0002-motor-biblico-e-drawer-de-estudo-interativo.md`: Registro da decisão arquitetural.

### `feat(bible): adicionar servico de biblia reativo e componente bible-drawer` (Hash: `92dc9ba`)
- **Razão da alteração:** Prover interface de leitura lateral não intrusiva com suporte a alternância de versões e visualização de capítulos inteiros.
- **Comportamento atual:** Ao acionar qualquer citação bíblica, um drawer lateral desliza suavemente com texto, opções de cópia e controle de leitura.
- **Decisões técnicas & ADRs:** Padrão Signals do Angular 20, WCAG 2.2 AA (fechamento por ESC e backdrop click).
- **Arquivos envolvidos:**
  - `frontend/src/app/core/services/bible.service.ts`: Gestão de estado reativo.
  - `frontend/src/app/core/utils/bible-reference.utils.ts`: Utilitário de parsing e regex.
  - `frontend/src/app/componentes/shared/bible-drawer/*`: Template, estilos e componente do drawer.
  - `frontend/src/app/app.html` & `app.ts`: Registro global.

### `feat(pages): integrar linkificacao de referencias biblicas em artigos e bundles` (Hash: `4385b6e`)
- **Razão da alteração:** Conectar os conteúdos teológicos já existentes à experiência interativa da Bíblia.
- **Comportamento atual:** Qualquer referência citada nos artigos ou estudos é automaticamente destacada e se torna clicável.
- **Decisões técnicas & ADRs:** Preservação de atributos HTML sem sobrecarga no ciclo de vida do Angular.
- **Arquivos envolvidos:**
  - `frontend/src/app/pages/article-detail/*`: Sanitização, parsing e escuta de eventos.
  - `frontend/src/app/pages/bundle-detail/*`: Integração no guia de estudos.

---

## 5. Dívida Técnica & Próximos Passos

- [ ] Implementar histórico de leituras recentes no próprio drawer bíblico via LocalStorage.
- [ ] Avaliar inclusão de uma ferramenta de busca direta no drawer por texto ou palavra-chave.
- [ ] Explorar modo tela cheia de leitura bíblica para leitura contínua de livros inteiros.
