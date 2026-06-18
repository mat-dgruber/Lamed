# Etapa 1: Build
FROM node:20-alpine AS development

# Definir o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Instalar dependências do sistema necessárias para o Puppeteer (Chrome Headless) no Alpine.
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ttf-freefont

# Instalar o Angular CLI globalmente correspondente à versão do projeto.
RUN npm install -g @angular/cli@^20.1.6

# Copiar os arquivos de definição de dependências
COPY package.json package-lock.json ./

# Instalar as dependências do projeto
RUN npm install

# Copiar o restante dos arquivos da aplicação
COPY . .

# Expor a porta 4200 para desenvolvimento
EXPOSE 4200

# Executar o servidor de desenvolvimento do Angular
CMD ["ng", "serve", "--host", "0.0.0.0"]
