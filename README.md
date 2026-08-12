# 🦁 Lamed — Plataforma de Estudos Bíblicos

![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![Angular](https://img.shields.io/badge/Angular-20%2B-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Hosting%20%7C%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Bem-vindo ao repositório do **Lamed**, a plataforma moderna de estudos bíblicos, bundles semanais, artigos e integração com acervo em vídeo.

---

## 📑 Conteúdo

- [🚀 Como Executar (Docker - Recomendado)](#-como-executar-docker---recomendado)
- [🛠️ Desenvolvimento Local (Manual)](#️-desenvolvimento-local-manual)
- [⚙️ Variáveis de Ambiente](#️-variáveis-de-ambiente)
- [📂 Estrutura do Projeto](#-estrutura-do-projeto)
- [🤖 Rotinas & Automações Backend](#-rotinas--automações-backend)
- [🧪 Testes e Qualidade](#-testes-e-qualidade)
- [📚 Documentações Adicionais](#-documentações-adicionais)

---

## 🚀 Como Executar (Docker - Recomendado)

A maneira mais simples de rodar o projeto é via **Docker Compose**, garantindo isolamento e ambiente pronto para desenvolvimento.

> [!IMPORTANT]
> Certifique-se de ter o **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** instalado e em execução.

### 🏁 Passo a Passo

1. **Clone o Repositório**
   ```bash
   git clone https://github.com/Novo_Lamed_Angular.git
   cd Novo_Lamed_Angular
   ```

2. **Inicie os Containers**
   ```bash
   docker-compose up -d
   ```

   > [!NOTE]
   > O primeiro build compila o frontend Angular e prepara a API Python FastAPI automaticamente.

3. **Acesse os Serviços**
   - **Frontend App**: [http://localhost:4200](http://localhost:4200)
   - **API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **API Health Check**: [http://localhost:8000/healthz](http://localhost:8000/healthz)

4. **Para Parar**
   ```bash
   docker-compose down
   ```

---

## 🛠️ Desenvolvimento Local (Manual)

Caso prefira executar cada serviço separadamente em sua máquina local:

<details>
<summary><strong>Expandir Instruções de Execução Manual</strong></summary>

### 🅰️ Frontend (Angular 20+)

```bash
cd frontend
npm install
npm run start
```
Acesse [http://localhost:4200](http://localhost:4200).

### 🐍 Backend (Python 3.14 + FastAPI)

Recomendamos o uso da ferramenta **[uv](https://github.com/astral-sh/uv)** para gerenciamento ultra-rápido de dependências e ambiente Python:

```bash
cd backend
uv sync
uv run main.py
```
A API iniciará em [http://127.0.0.1:8000](http://127.0.0.1:8000).

</details>

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` dentro de `backend/` (ou configure no seu ambiente/Docker) com as seguintes chaves principais:

| Variável | Descrição | Obrigatório |
| :--- | :--- | :---: |
| `FIREBASE_CREDENTIALS` | JSON ou caminho para chave de serviço do Firebase/Firestore | Sim |
| `YOUTUBE_API_KEY` | Chave de API do Data API v3 para sincronização de vídeos | Não |
| `SYNC_TOKEN` | Token secreto para autorizar rotinas de sync ativadas via webhook/cron | Sim (prod) |
| `RESEND_API_KEY` | Chave de envio de e-mails de notificação de pendências | Não |

---

## 📂 Estrutura do Projeto

```
Lamed/
├── 📂 backend/               # API FastAPI & Lógicas de Servidor
│   ├── main.py              # Ponto de entrada FastAPI e middlewares
│   ├── config.py            # Configurações de ambiente e Firestore
│   ├── models.py            # Modelos Pydantic (Single Source of Truth)
│   ├── routes/              # Handlers HTTP (bundles, videos, articles, admin)
│   ├── services/            # Serviços (youtube_sync, videos, etc.)
│   └── scripts/             # Verificações e utilitários CLI
├── 📂 frontend/              # Aplicação Web (Angular 20+)
│   ├── src/app/             # Components (Standalone), Services, Signals
│   └── public/              # Assets estáticos e imagens
├── 📂 .github/workflows/    # CI/CD Workflows (Deploy, Sync Cron, Checks)
├── 🐳 docker-compose.yml     # Orquestração local de containers
├── 📄 ARCHITECTURE.md       # Arquitetura e diagramas de fluxo de dados
└── 📄 FIRESTORE_SCHEMA.md   # Documentação de coleções e schemas do banco
```

---

## 🤖 Rotinas & Automações Backend

A API expõe endpoints protegidos para acionamento via tarefas agendadas (GitHub Actions / Cron Jobs):

- `POST /api/sync-videos`: Força a sincronização dos canais do YouTube cadastrados com a coleção de vídeos no Firestore.
- `POST /api/check-pending-bundle`: Verifica se o estudo da semana vigente foi publicado e envia e-mail de alerta caso pendente.

> Todas as requisições para estas rotas exigem o cabeçalho `X-Sync-Token` correspondente à variável `SYNC_TOKEN`.

---

## 🧪 Testes e Qualidade

Você pode executar as suítes de testes localmente ou via container:

```bash
# Executar testes unitários do Frontend
cd frontend && npm test

# Executar testes via Docker
docker-compose exec app npm test
docker-compose exec api pytest
```

---

## 📚 Documentações Adicionais

- [📐 Arquitetura do Sistema](ARCHITECTURE.md)
- [🔥 Schema do Firestore](FIRESTORE_SCHEMA.md)
