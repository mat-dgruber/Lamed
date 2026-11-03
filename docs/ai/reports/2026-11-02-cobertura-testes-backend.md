# Relatório de cobertura dos testes backend

Em 2026-11-02, `uv run --directory backend pytest --cov --cov-report=term -q` executou 30 testes com sucesso. A cobertura total foi **67,37%** (1.649 instruções, 538 não cobertas). O `backend/pyproject.toml` já declara `fail_under = 67` e `show_missing = true`; a medição fica acima do piso vigente, que não foi reduzido.

`⚠️ TESTB-04: cobertura atual 67%, fail_under = 67 (meta 80%)` — o total medido ainda não alcança a meta de 80%; elevar o piso agora faria a suíte atual falhar. Aumentar cobertura até 80% continua sendo trabalho pendente, não uma meta já atingida.
