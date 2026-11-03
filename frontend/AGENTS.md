# Diretrizes Frontend

- **Design & UI/UX:** Siga os guias em `.agents/ai-guides/guides/design-ui-ux/` — `guia-universal-design-ui-ux-acessibilidade.md` (5 Lentes, WCAG 2.2, tokens, `--z-*`, `prefers-reduced-motion`); checklists em `.agents/rules/`.
- **Suíte de Testes Frontend:** Siga `.agents/ai-guides/guides/testing/frontend/README.md` (AAA, specs co-localizadas, Signals/HTTP/Guards, cobertura ≥ 80%, E2E Playwright).
- **CI Frontend:** `.github/workflows/tests-frontend.yml` executa typecheck, testes headless com cobertura e Playwright E2E.
