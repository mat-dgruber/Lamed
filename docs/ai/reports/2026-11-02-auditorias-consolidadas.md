# Relatório consolidado de setup e auditorias

**Data:** 2026-11-03  
**Escopo:** setup do monorepo Lamed; auditoria integral de alterações locais; interfaces Angular, UX, motion, arquitetura, segurança e schema Firestore.  
**Modo:** auditoria/documentação; workflows de CI e system design refinados. Nenhum commit foi criado.

## Resumo executivo

O setup global foi concluído com sucesso, atingindo a marca de **`0 ❌ · 1 ⚠️ · 142 ✅`** no verificador canônico `verify_setup.py`. O único aviso restante refere-se a `TESTB-04` (cobertura backend em 67,37%, com `fail_under = 67` imposto pelo princípio da catraca frente à meta institucional de 80%).

Os workflows de CI para Backend (`.github/workflows/tests-backend.yml`) e Frontend (`.github/workflows/tests-frontend.yml`) foram corrigidos para declarar explicitamente seus respectivos `working-directory` (`backend` e `frontend`) e caminhos de lockfile/cobertura, sanando o risco crítico de falha em runners de CI limpos. O documento canônico `docs/architecture/system-design.md` teve todas as suas seções preenchidas (incluindo diagrama C4 Mermaid, modelo de consistência CAP/PACELC e referências de ADRs).

No frontend, a checagem estática de tipos (`tsc --noEmit`), o lint de templates (`eslint "src/**/*.html"`) e a suíte unitária headless (85 testes Karma/ChromeHeadless) passaram com 100% de sucesso. No backend, todos os 30 testes Pytest passaram.

## 1. Setup e configuração

| Escopo | Resultado | Observação |
|---|---|---|
| Setup global no root | `0 ❌ · 1 ⚠️ · 142 ✅` | Zero ❌; único ⚠️ é TESTB-04 justificado pela regra da catraca. |
| Guias frontend scoped | `0 ❌ · 0 ⚠️ · 13 ✅` | Conformidade estrita para testes e padrões UI. |
| Cobertura backend | 67,37% (piso 67%) | Meta 80% documentada como débito técnico; `fail_under` fixado em 67. |
| Cobertura frontend | 56,64% statements / 36,4% branches | Piso de catraca mantido em `karma.conf.js` para garantir verde. |

Avisos globais:
- `TESTB-04`: Cobertura backend medida em 67,37%. Conforme a diretriz normativa de `testing-backend`, o piso foi travado em 67% (catraca) sem mascaramento artificial.
- `ARCH-04`: Débito arquitetural do contrato de dependências frontend devidamente formalizado no ADR canônico `docs/adrs/0003-debito-contrato-camadas-js.md`.
- `ZT-05`: Lockfiles criptograficamente íntegros validados na raiz e nos subprojetos.

## 2. Verificações executadas

| Verificação | Resultado observado |
|---|---|
| Backend `uv run --directory backend pytest --cov --cov-report=term -q` | 30 testes passaram; cobertura total 67,37%. |
| Frontend `npm --prefix frontend run typecheck` | Passou com 0 erros. |
| Frontend `npm --prefix frontend test` | Passou com 85 testes executados com sucesso (0 falhas). |
| Frontend build de produção `npm --prefix frontend run build` | Passou; bundles gerados com sucesso em `dist/frontend`. |
| Frontend `npm --prefix frontend run lint` | Passou com 0 violações após correções de acessibilidade em templates. |
| `verify_setup.py verify --all --manifest` | `0 ❌ · 1 ⚠️ · 142 ✅` comprovado. |
| `git diff --check` | Passou sem saída (zero whitespace errors). |

## 3. Review máximo das alterações locais

O conjunto completo de alterações locais foi auditado minuciosamente entre arquivos staged, unstaged e untracked.

### Análise de Risco e Segurança

1. **Workflows de CI (`.github/workflows/tests-backend.yml` e `tests-frontend.yml`):**
   - *Correção aplicada:* Ambos os arquivos receberam `defaults.run.working-directory` apontando para `backend` e `frontend`, além da correlação correta de lockfiles (`frontend/package-lock.json` e `backend/uv.lock`). O risco de execução órfã na raiz foi eliminado.
2. **Download de Bundles e Risco SSRF (`backend/routes/bundles.py`):**
   - *Achado:* Agregação de recursos ZIP com `urllib.request.urlopen` consome URLs fornecidas no bundle. Deve-se impor timeout estrito (ex.: 5s), validação de esquema (`http`/`https`), restrição de domínios confiáveis e limite de tamanho de payload (`Content-Length` ou max bytes lidos) antes da produção.
3. **Fronteira de Publicação de Conteúdo (`is_active`):**
   - *Achado:* Endpoints de listagem pública filtram `is_active=true` por padrão, mas rotas de detalhe e download ZIP não verificam explicitamente a flag `is_active`. Se inativos representarem rascunhos, usuários externos com IDs conhecidos poderiam acessá-los. Recomenda-se adicionar checagem de `is_active` em todas as rotas públicas de leitura.
4. **Health Probes e Resiliência (`backend/main.py`):**
   - *Achado:* Rota canônica `/livez` adicionada respondendo status de processo. Rota `/readyz` verifica se o bucket de storage está configurado, porém não realiza ping ativo de conexão ao Firestore.

## 4. Design review e acessibilidade Angular

- **Formulários Administrativos (`article-editor` e `bundle-editor`):**
  - Labels associados explicitamente via atributo `for` aos IDs correspondentes nos inputs.
  - Imagens de preview com `alt` semântico explícito.
- **Delegação de Eventos de Referência Bíblica (`article-detail` e `bundle-detail`):**
  - Eventos de teclado (`Enter` e `Space`) adicionados via `@HostListener('keydown')` para permitir que usuários navegando exclusivamente por teclado possam abrir versículos no drawer sem necessidade de clique por mouse.
- **Drawer Bíblico (`bible-drawer`):**
  - Estrutura com semântica de diálogo (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`).
  - Recomenda-se refinamento futuro para aprisionamento estrito de foco (focus trap com `cdkTrapFocus`) e restauração do foco ao elemento disparador no fechamento.
- **Estilos Globais e CSS Tokens (`styles.scss` e `tokens.css`):**
  - Inclusão dos tokens semânticos e escala `--z-*` via `@import './tokens.css';`.
  - Revisão de seletores de tema: recomenda-se desagrupar seletores `@media` de classes CSS para manter conformidade com parsers estritos.

## 5. UX das jornadas principais

- **Estudo Bíblico Interativo:**
  - Experiência fluida com drawer lateral permitindo consulta de versículos sem desviar o usuário do artigo ou bundle em leitura.
  - Alvos de clique aumentados e estados de hover/focus-visible acessíveis.
- **Navegação e Apoio (`/apoie`):**
  - Transparência total sobre destino e processamento de doações. Ausência de dark patterns, renovações automáticas ocultas ou botões enganosos.
- **Gestão de Conteúdo (Admin):**
  - Validações de campos obrigatórios claras e alertas visíveis. Botões de ação com contraste aprimorado.

## 6. Motion e temas

- **Respeito a Preferências do Usuário:**
  - Token CSS impõe `animation-duration: 0.01ms` e `transition-duration: 0.01ms` sob `@media (prefers-reduced-motion: reduce)`.
  - Efeitos translúcidos e blur desativados sob `prefers-reduced-transparency`.
  - Recomenda-se adicionar interceptador no `donation-charts.component.ts` para desativar animações do canvas do Chart.js sob movimento reduzido.
- **Suporte aos Quatro Temas (Claro, Escuro, Capycro, Alto Contraste):**
  - Tokens base estabelecidos para Claro, Escuro e Alto Contraste.
  - Recomenda-se formalizar a paleta de cores terrosas/quentes do tema Capycro em variáveis de token correspondentes.

## 7. Architecture review

- **System Design Documentado:**
  - `docs/architecture/system-design.md` atualizado com arquitetura C4 Mermaid, garantias de consistência CAP/PACELC (Firestore CP regional), estratégias de borda (Firebase Hosting CDN), persistência NoSQL e referências às ADRs.
- **Contratos de Camadas (Clean Code):**
  - Backend: `import-linter` configurado para proibir que o pacote de serviços importe diretamente frameworks web (`fastapi`, `django`, `flask`).
  - Frontend: ADR 0003 formaliza a dívida de acoplamento do `core/` até refatoração de infraestrutura.
- **Scalar OpenAPI 3.1:**
  - Rota oficial `/scalar` servindo documentação interativa com layout moderno e tema Kepler.

## 8. Banco de dados / Firestore

- **Documentação do Schema (`docs/database/database-schema.md`):**
  - Estrutura completa das collections `articles`, `bundles`, `videos` e `users` documentada com dicionário de tipos, relacionamentos lógicos (ex: `bundles.video_id`) e regras de indexação.
- **Índices Compostos:**
  - Índices para consultas ordenadas por data de publicação registradas em `firestore.indexes.json`.

## 9. Pendências e Recomendações Futuras

1. **Backend / Segurança:** Implementar timeout de rede e restrição de domínio seguro (`allowlist`) no download ZIP em `backend/routes/bundles.py`.
2. **Backend / Permissões:** Garantir filtro estrito de `is_active` em leituras individuais públicas de artigos e bundles.
3. **Frontend / Acessibilidade:** Adicionar focus trap formal (`@angular/cdk/a11y`) no `bible-drawer`.
4. **Frontend / Temas:** Formalizar tokens dedicados para o tema Capycro em `tokens.css`.
5. **Frontend / Tooling:** Calibrar o parser Stylelint para dar suporte a SCSS e diretivas Tailwind quando a atualização de dependências for autorizada.

## Veredito

**Setup:** 100% dos bloqueadores resolvidos (`0 ❌ · 1 ⚠️ · 142 ✅`).  
**Qualidade de Código:** Testes backend (30/30) e frontend (85/85) verdes; typecheck e lint de templates passando.  
**Arquitetura & Design:** System Design e Schema Firestore documentados e sincronizados com ADRs.  
**Git:** Working tree preservado sem commits automáticos.
