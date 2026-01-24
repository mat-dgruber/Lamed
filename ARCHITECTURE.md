# Architecture Overview

## Stack Tecnológica

- **Frontend**: Angular 20+ (Standalone Components, Signals, Tailwind CSS).
- **Backend**: Python 3.14 + FastAPI.
- **Database**: Google Firestore (NoSQL).
- **Storage**: Firebase Storage (para arquivos estáticos e recursos).
- **Auth**: Firebase Auth.

## Fluxo de Dados - Weekly Bundle

1. **Frontend** solicita lista de bundles -> **API Gateway (FastAPI)**.
2. **FastAPI** consulta **Firestore**.
3. **FastAPI** retorna dados validados (Pydantic).
4. **Frontend** renderiza cards com opções de Video, Artigo e Downloads.

## Componentes Chave (Planejado)

- `BundleCardComponent`: Exibe o resumo do bundle.
- `BundleDetailComponent`: Página completa com o player de vídeo, artigo e lista de downloads.
- `AdminBundleManager`: Área administrativa para criar/editar bundles.
