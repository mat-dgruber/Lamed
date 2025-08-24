# Etapa 1: Build
# Usar uma imagem oficial do Node.js como base. A versão LTS (Long Term Support) é uma boa escolha.
FROM node:20-alpine AS development

# Definir o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Instalar dependências do sistema necessárias para o Puppeteer (que executa o Chrome Headless) funcionar no Alpine.
# O Chromium é o navegador que será usado para os testes.
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ttf-freefont

# Instalar o Angular CLI globalmente na imagem para que o comando 'ng' esteja disponível.
# A versão é fixada para corresponder à do projeto, garantindo consistência.
RUN npm install -g @angular/cli@^20.1.6

# Copiar os arquivos de definição de dependências (package.json e package-lock.json)
# Isso aproveita o cache de camadas do Docker. A reinstalação do npm só ocorrerá se estes arquivos mudarem.
COPY package.json package-lock.json ./

# Instalar as dependências do projeto
RUN npm install

# Copiar o restante dos arquivos da aplicação para o diretório de trabalho no container
COPY . .

# Expor a porta 4200, que é a porta padrão usada pelo comando 'ng serve' do Angular
EXPOSE 4200

# Definir o comando padrão para ser executado quando o container iniciar.
# O '--host 0.0.0.0' é essencial para que o servidor de desenvolvimento seja acessível
# a partir do seu navegador fora do container.
CMD ["ng", "serve", "--host", "0.0.0.0"]
