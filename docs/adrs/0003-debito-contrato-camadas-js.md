<!--
================================================================================
LOG DE MANUTENÇÃO DE DOCUMENTAÇÃO
--------------------------------------------------------------------------------
Data       | Autor          | Descrição
--------------------------------------------------------------------------------
2026-11-01 | Matheus Diniz  | Registro da dívida ARCH-04 após pre-flight com violações preexistentes.
================================================================================
-->

# ADR 0003: Adiar a aplicação do contrato de dependências do frontend

| Metadado | Detalhe |
| :--- | :--- |
| **Status** | **Proposta** (2026-11-01) |
| **Decisores** | Matheus Diniz |
| **Tags** | `[architecture]`, `[frontend]`, `[dependency-cruiser]` |
| **Impacto Sistêmico** | Baixo (frontend Angular) |
| **ADRs Relacionadas** | N/A |

## Contexto

O frontend ainda não possui separação explícita entre domínio e infraestrutura. O diretório `src/app/core/` contém serviços que importam APIs de framework e bibliotecas externas, então a regra arquitetural proposta não corresponde às fronteiras atuais. O pre-flight oficial `npx depcruise src` também sinalizou dependências circulares e módulos órfãos preexistentes.

### Riscos Identificados e Problemas a Resolver:
1. **Regra de camadas incorreta:** bloquear todos os imports do `core/` para frameworks, Firebase e RxJS produziria violações imediatas porque `core/services/bible.service.ts` importa Angular, HttpClient e RxJS por definição.
2. **Ciclo entre componentes:** o pre-flight identificou ciclo `team-modal.component.ts → sobre.ts → team-modal.component.ts`.
3. **Falsos positivos de módulos órfãos:** `environment.prod.ts` e `environment.development.ts` são referenciados pelo sistema de build do Angular, não por imports diretos no grafo analisado.

---

## 2. Decisão de Arquitetura

Não ligar `lint:deps` ao lint/CI enquanto o repositório não definir fronteiras de domínio e infraestrutura adequadas e resolver ou classificar as violações apontadas pelo pre-flight. Manter `dependency-cruiser` e a configuração inicializada para permitir evolução do contrato; corrigir a regra de camadas para refletir somente limites reais antes de exigir sua conformidade. A configuração não deve bloquear o CI com dívida preexistente.

### Contrato proposto

A regra atualmente em avaliação considera `src/app/core/` como domínio, o que é incorreto neste código. Após definir limites reais, substituir por uma regra cujo `from` identifique apenas o pacote de domínio e cujo `to` identifique adapters/infraestrutura e dependências de framework/HTTP que o domínio não deve importar. Até lá, não tratar essa regra como contrato aprovado.

### Evidências do pre-flight

```text
warn no-orphans: src/environments/environment.prod.ts
warn no-orphans: src/environments/environment.development.ts
warn no-circular: src/app/componentes/shared/team-modal/team-modal.component.ts →
    src/app/componentes/sobre/sobre.ts →
    src/app/componentes/shared/team-modal/team-modal.component.ts
```

---

## 7. Consequências e Resultados

### Positivas
- Evita ativar um lint que não representa as fronteiras arquiteturais reais e que reporta problemas preexistentes.
- Mantém evidências reproduzíveis e documenta as condições necessárias para reavaliar o contrato.

### Mitigações e Desafios Gerenciados
- O `dependency-cruiser` permanece disponível, mas o script `lint:deps` **não deve ser usado como gate** enquanto o pre-flight reportar violações. Antes de concluir esta heurística, remova esse script e exclua `dependency-cruiser` das devDependencies; a configuração gerada pode permanecer para reavaliação posterior, sem regras de domínio ativadas. Reavaliar após definir fronteiras de camadas reais e obter pre-flight sem violações não aceitas.
