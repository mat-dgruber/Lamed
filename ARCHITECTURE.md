# 🏗️ Architecture Overview

Este documento descreve as decisões técnicas e o fluxo de dados do **Lamed**.

---

## ⚡ Tech Stack

| Camada       | Tecnologia                                                                                 | Detalhes                                 |
| :----------- | :----------------------------------------------------------------------------------------- | :--------------------------------------- |
| **Frontend** | ![Angular](https://img.shields.io/badge/-Angular_20+-DD0031?logo=angular&logoColor=white)  | Standalone Components, Signals, PrimeNG. |
| **Backend**  | ![FastAPI](https://img.shields.io/badge/-FastAPI-009688?logo=fastapi&logoColor=white)      | Python 3.14, Pydantic v2.                |
| **Database** | ![Firestore](https://img.shields.io/badge/-Firestore-FFCA28?logo=firebase&logoColor=black) | NoSQL, realtime updates.                 |
| **Build**    | ![Docker](https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white)         | Docker Compose para orquestração local.  |

---

## 🔄 Fluxo de Dados: "Weekly Bundle"

O diagrama abaixo ilustra como o conteúdo de estudo (Bundle) viaja do banco de dados até a tela do usuário.

```mermaid
sequenceDiagram
    participant User as 👤 Usuário
    participant App as 🅰️ Angular App
    participant API as 🐍 FastAPI
    participant DB as 🔥 Firestore

    User->>App: Acessa /bundle/:id
    App->>API: GET /bundles/:id
    API->>DB: collection("bundles").doc(:id).get()
    DB-->>API: JSON Document
    Note over API: Validação Pydantic<br/>(Garante Schema)
    API-->>App: Typed Response (Bundle)
    App-->>User: Renderiza Vídeo + Artigo + Downloads
```

---

## 🧩 Componentes Chave

### Frontend (`/src/app`)

- **`BundleCardComponent`**:
  - _Responsabilidade_: Exibir resumo em cards nas listagens.
  - _Input_: `Bundle` object.
- **`BundleDetailComponent`**:
  - _Responsabilidade_: Página principal do estudo.
  - _Features_: Player de vídeo (YouTube Embed), Renderizador de HTML seguro, Lista de Downloads.

- **`AdminBundleManager`**:
  - _Responsabilidade_: CRUD de conteúdos.
  - _Acesso_: Protegido por Guard de Admin.

### Backend (`/backend`)

- **`main.py`**: Ponto de entrada da aplicação FastAPI.
- **`models.py`**: Definições de tipos compartilhados (Single Source of Truth).
- **`services/`**: Lógica de negócios (ex: sincronização com YouTube).

---

## 🔒 Segurança e Regras

> [!WARNING]
> **Firestore Rules**: O acesso direto ao Firestore pelo Frontend deve ser restrito a leitura de documentos públicos. Escritas complexas devem passar pela API Python para validação.
