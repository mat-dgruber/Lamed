<!--
================================================================================
LOG DE MANUTENÇÃO DE DOCUMENTAÇÃO
--------------------------------------------------------------------------------
Data       | Autor          | Descrição
--------------------------------------------------------------------------------
2026-09-18 | Antigravity AI | Registro consolidado da sessão de triple audit e
           |                | aplicação das melhorias de Design, Mobile e SEO.
================================================================================
-->

# Registro de Desenvolvimento — 2026-09-18

| Metadado | Detalhe |
| :--- | :--- |
| **Escopo Principal** | `triple-audit / seo-mobile-ui` |
| **Commits Gerados** | `3` |
| **Arquivos Modificados** | `7` |
| **ADRs Vinculadas / Geradas** | Nenhuma (mudanças cosméticas e de configuração) |

---

## 1. Visão Geral das Alterações

Sessão de auditoria tripla (Design Review · Mobile Design · SEO/AEO/GEO) na plataforma Lamed,
executada sobre o frontend Angular 20 + Firebase Hosting. As melhorias foram agrupadas em três
commits atômicos por camada técnica, cobrindo 10 bloqueadores e pontos de atenção identificados
no scorecard 66/100. A sessão eliminou os 3 bloqueadores críticos de P0 (iOS parallax crash,
logo LCP, headers MIME), 3 itens de P1 (SEO/GEO/AEO), e 4 itens de P2 (polish e acessibilidade).

---

## 2. Arquitetura Afetada & Decisões (ADRs)

- **Decisões Registradas:** Nenhuma (nenhum dos 6 gatilhos arquiteturais ativado)

---

## 3. Mapa de Arquivos Modificados

| Arquivo | Camada Técnica | Resumo da Modificação |
| :--- | :--- | :--- |
| `firebase.json` | Infra / Hosting | Headers MIME text/plain + CORS para llms.txt, robots.txt, llms-full.txt; application/xml para sitemap.xml |
| `frontend/src/index.html` | Apresentação / SEO | meta robots com max-snippet/-1, preconnect Typekit, link rel=describedby GEO |
| `frontend/src/app/core/services/seo.service.ts` | Service / SEO | @id anchors no @graph, SoftwareApplication, publisher por referencia, SearchAction corrigida |
| `frontend/src/styles.scss` | Estilos Globais | prefers-reduced-motion, background-attachment:scroll, sombra layered, token duplicado removido |
| `frontend/src/app/componentes/shared/header/header.html` | Componente / Header | logo eager+fetchpriority+dimensions, dropdown href+ARIA completo |
| `frontend/src/app/componentes/shared/header/header.scss` | Componente / Header | touch target 48px hamburger, menu mobile max-height animation |
| `frontend/src/app/componentes/home/home.scss` | Componente / Home | :focus-visible e :active em botoes custom |

---

## 4. Detalhamento por Commit

### `perf(hosting)` — Hash: 15df4ba
- Firebase Hosting agora serve llms.txt, robots.txt e llms-full.txt com MIME text/plain e CORS aberto
- sitemap.xml servido como application/xml

### `fix(seo)` — Hash: 81e9d0e
- meta robots com max-snippet:-1, max-image-preview:large, max-video-preview:-1
- preconnect para use.typekit.net e p.typekit.net antes do stylesheet
- GEO: <link rel="describedby" href="/llms.txt">
- Schema.org @graph: @id anchors, SoftwareApplication (EducationApplication), publisher ref
- SearchAction target corrigido para /artigos?q=

### `fix(ui)` — Hash: 276a75d
- background-attachment:scroll (fix iOS Safari crash, Android repaints)
- logo: loading=eager, fetchpriority=high, width/height explicitos
- prefers-reduced-motion global em styles.scss
- sombra header: layered rgba(0,0,0,0.04-0.06)
- token --footer-bg-color duplicado removido
- dropdown: href real + aria-haspopup + aria-expanded + aria-controls + role=menu
- hamburger: min 48px touch target + feedback :active
- menu mobile: display:none/block -> max-height+opacity transition
- botoes: :focus-visible + :active states

---

## 5. Divida Tecnica & Proximos Passos

- [ ] Migrar header para position:sticky com backdrop-filter:blur (elimina JS is-hidden)
- [ ] Adicionar letter-spacing:-0.02em aos headings display grandes
- [ ] Remover margin-bottom:-30px fragil do header
- [ ] Executar /ux-reviewer para auditoria de psicologia de decisao
- [ ] Submeter sitemap no Google Search Console apos deploy
- [ ] Validar JSON-LD com Google Rich Results Test apos deploy
