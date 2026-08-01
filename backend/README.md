# 🐍 Lamed Backend Service

![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Admin-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

API RESTful responsável pela lógica de negócios, validação de dados e integração com o Firestore.

---

## 📂 Arquitetura

O backend segue uma arquitetura simplificada baseada em serviços.

| Arquivo/Pasta           | Descrição                                                        |
| :---------------------- | :----------------------------------------------------------------- |
| **`main.py`**   | **Entrypoint**. Configuração do App FastAPI, CORS e Rotas. |
| **`models.py`** | **Schema Source**. Modelos Pydantic compartilhados.          |
| **`services/`** | Lógica de negócios isolada (ex:`youtube_sync.py`).             |
| **`scripts/`**  | Ferramentas de manutenção (migrações, verificação).          |

---

## 🛠️ Gerenciamento (UV)

Utilizamos o **[uv](https://github.com/astral-sh/uv)** para gerenciamento de dependências e ambiente virtual, por ser extremamente rápido.

### Instalação e Setup

```bash
# Instalar dependências
uv sync
```

### Rodando o Servidor

```bash
# Desenvolvimento (Hot Reload)
uv run uvicorn main:app --reload
```

---

## 🔑 Autenticação e Permissões

A API utiliza o **Firebase Admin SDK**.

> [!IMPORTANT]
> Para rodar localmente, você precisa da credencial de conta de serviço (JSON) configurada na variável de ambiente `GOOGLE_APPLICATION_CREDENTIALS` ou autenticada via `gcloud auth application-default login`.

### Permissão de Admin (mutating endpoints)

Os endpoints `POST/PUT/DELETE` em `/admin`, `/articles` e `/bundles` exigem **Bearer Firebase ID Token** com custom claim `admin: True`.

Para promover um usuário a admin (via Firebase Admin SDK):

```python
from firebase_admin import auth
auth.set_custom_user_claims("<UID_DO_USUARIO>", {"admin": True})
```

Após definir o claim, force um refresh no frontend (`user.getIdToken(true)`) para que o novo token seja emitido.

### Variáveis sensíveis do servidor

| Env var                     | Uso                                                                                                                                            |
| :-------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| `SYNC_TOKEN`              | Token enviado em`X-Sync-Token` no POST `/api/sync-videos` (GitHub Actions). **Obrigatório** — sem ele o endpoint responde `503`. |
| `FIREBASE_STORAGE_BUCKET` | Bucket do Firebase Storage (default:`lamed-148.firebasestorage.app`).                                                                        |

### Probes

- `GET /healthz` — liveness (sempre `200`).
- `GET /readyz` — readiness (Firestore + Storage; `503` se Storage indisponível).

---

## 🚀 Deploy (Cloud Run)

O serviço é stateless e containerizado via Docker.

```bash
# Build e Deploy Manual (Google Cloud CLI)
gcloud run deploy lamed-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```
