# Use uma imagem Python oficial segura e leve
FROM python:3.12-slim

# Define o diretório de trabalho
WORKDIR /app

# Instala o 'uv' para gerenciamento rápido de dependências
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copia os arquivos de definição de projeto
COPY pyproject.toml uv.lock ./

# Instala as dependências do projeto no ambiente do sistema
# --system: não cria venv, instala direto no python do container
# --deploy: garante que o lockfile está sincronizado
RUN uv sync --frozen --no-cache

# Copia o código fonte da aplicação
COPY . .

# Expõe a porta que o Cloud Run espera (padrão 8080 ou via variável PORT)
ENV PORT=8080
EXPOSE 8080

# Comando de execução usando o Uvicorn direto (já instalado pelo uv)
# Bind na porta definida pela variável de ambiente $PORT
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
