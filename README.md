# 🦁 AngularLamed

![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![Angular](https://img.shields.io/badge/Angular-20%2B-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Hosting%20%7C%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Bem-vindo ao repositório do **Novo Lamed**, a plataforma de estudos bíblicos modernos.

---

## 🚀 Como Executar (Recomendado)

A maneira mais simples de rodar o projeto é via **Docker**. Isso garante que todas as dependências (Node, Python, Database tools) estejam isoladas e configuradas.

> [!IMPORTANT]
> Certifique-se de ter o **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** instalado e rodando.

### 🏁 Passo a Passo

1. **Clone o Repositório**

   ```bash
   git clone https://github.com/Novo_Lamed_Angular.git
   cd Novo_Lamed_Angular
   ```
2. **Inicie o Ambiente**
   Execute na raiz do projeto:

   ```bash
   docker-compose up -d
   ```

   > [!NOTE]
   > O primeiro build pode levar alguns minutos. O Docker irá configurar o frontend Angular e a API Python automaticamente.
   >
3. **Acesse a Aplicação**

   - **Frontend**: [http://localhost:4200](http://localhost:4200)
   - **API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛠️ Desenvolvimento Local (Legado)

Caso prefira rodar sem Docker, você precisará configurar os ambientes individualmente.

<details>
<summary><strong>Expandir Instruções Manuais</strong></summary>

### Frontend (Angular)

```bash
cd frontend
npm install
ng serve
```

### Backend (Python/FastAPI)

Recomendamos usar o `uv` para gerenciamento.

```bash
cd backend
uv sync
uv run main.py
```

</details>

---

## 📂 Estrutura do Projeto

```
Novo_Lamed_Angular/
├── 📂 backend/         # API FastAPI e Scripts
│   ├── models.py      # Modelos Pydantic (A Verdade do Banco)
│   ├── routes/        # Roteamento (Bundles, Vídeos, Artigos)
│   └── services/       # YouTube Sync e Lógica
├── 📂 frontend/        # Aplicação Angular 20+
│   ├── src/app/       # Componentes (Standalone), Signals, Services
│   └── public/        # Assets estáticos
├── 🐳 docker-compose.yml
└── 📄 FIRESTORE_SCHEMA.md
```

## 🧪 Testes

Você pode rodar comandos dentro do container para garantir a integridade do código.

```bash
# Rodar testes do Angular
docker-compose exec app npm test

# Rodar testes do Backend (se configurado)
docker-compose exec api pytest
```

---

> [!TIP]
> Para parar o ambiente e economizar recursos, rode `docker-compose down`.
