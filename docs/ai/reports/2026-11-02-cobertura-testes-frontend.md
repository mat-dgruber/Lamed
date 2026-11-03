# Relatório de cobertura dos testes frontend

A execução de `make -C frontend test-cov` em 2026-11-02 completou os 85 testes em ChromeHeadless com sucesso. O relatório HTML gerado pelo Karma registrou:

| Métrica | Cobertura observada | Piso configurado |
| :-- | --: | --: |
| Statements | 56,58% | 56% |
| Branches | 36,52% | 36% |
| Functions | 47,38% | 47% |
| Lines | 57,43% | 57% |

Os pisos usam a cobertura observada arredondada para baixo, conforme a regra de catraca do guia; não elevam artificialmente a meta para 80% enquanto isso faria a suíte atual falhar. Meta pendente: atingir pelo menos 80% nas quatro métricas.

`⚠️ TESTF-04: cobertura atual 36%, threshold = 36 (meta 80%)` — a heurística reporta o menor indicador observado, Branches, arredondado para baixo; os demais pisos também permanecem configurados individualmente no Karma.

Relatório detalhado HTML: `frontend/coverage/frontend/index.html` (artefato gerado localmente pela suíte).
