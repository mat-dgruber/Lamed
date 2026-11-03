openapi:
	cd backend && uv run python -c 'import json; from main import app; print(json.dumps(app.openapi(), ensure_ascii=False))' 2>/dev/null | sed -n '/^{/,$$p' > ../docs/api/openapi.json

# ai-guides: suíte de testes (guides/testing/backend)
test: ## Executar testes unitários e de integração
	cd backend && uv run pytest

# ai-guides: cobertura (guides/testing/backend)
test-cov: ## Executar testes com relatório de cobertura
	cd backend && uv run pytest --cov --cov-report=term-missing

test-e2e: ## Executar testes End-to-End com Playwright
	npx playwright test

# ai-guides: memória dos agentes (guia-construcao-harness §5)
pull-memory: ## Sincronizar memória global para o repositório local
	@./.claude/sync-claude-memory.sh pull; ./.gemini/sync-memory.sh pull

push-memory: ## Sincronizar memória local para o sistema global
	@./.claude/sync-claude-memory.sh push; ./.gemini/sync-memory.sh push

setup-gemini-hook: ## Instalar pre-commit de auto-staging de memórias
	@cp ".agents/ai-guides/templates/pre-commit-memory.sh" "$$(git rev-parse --git-path hooks)/pre-commit" && chmod +x "$$(git rev-parse --git-path hooks)/pre-commit"

# ai-guides: sandbox ai-jail (guia-ai-jail-sandbox)
jail-setup: ## Instalar e configurar o ai-jail
	@command -v ai-jail >/dev/null || (command -v brew >/dev/null && brew tap akitaonrails/tap && brew trust --formula akitaonrails/tap/ai-jail && brew install ai-jail) || cargo install ai-jail

jail-openclaude: ## Iniciar OpenClaude isolado no sandbox
	@ai-jail openclaude

jail-gemini: ## Iniciar Gemini CLI isolado no sandbox
	@ai-jail gemini
