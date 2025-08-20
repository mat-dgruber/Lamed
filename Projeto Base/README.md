# Lamed Website

Este é o repositório para o site da Lamed, um projeto focado em fornecer conteúdo em vídeo e artigos. O site é construído como um site estático e hospedado no Firebase. Ele usa scripts Node.js para buscar os vídeos mais recentes de um canal do YouTube e para gerar um arquivo JSON a partir de artigos em HTML.

## Features

- **Busca de Vídeos do YouTube**: Busca automaticamente os vídeos mais recentes de um canal específico do YouTube e os exibe no site.
- **Geração de Artigos Dinâmicos**: Gera uma lista de artigos a partir de arquivos HTML, facilitando a adição de novos conteúdos.
- **Hospedagem no Firebase**: O site é hospedado na plataforma Firebase, garantindo alta disponibilidade e desempenho.
- **Fluxo de CI/CD com GitHub Actions**: Usa GitHub Actions para automatizar o processo de atualização de vídeos.

## Pré-requisitos

Antes de começar, certifique-se de ter o seguinte instalado:

- [Node.js](https://nodejs.org/) (versão 14 ou superior)
- [npm](https://www.npmjs.com/) (geralmente vem com o Node.js)

## Instalação

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/seu-usuario/seu-repositorio.git
   cd seu-repositorio
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**

   O script para buscar vídeos do YouTube requer uma chave de API do YouTube. Você pode obter uma no [Google Cloud Console](https://console.cloud.google.com/).

   Crie um arquivo `.env` na raiz do projeto e adicione sua chave de API:

   ```
   YOUTUBE_API_KEY=sua_chave_de_api_aqui
   ```

## Uso

Para trabalhar com o projeto localmente, você pode usar os seguintes scripts:

### Buscar Vídeos do YouTube

Para executar o script que busca os vídeos mais recentes do YouTube e atualiza o arquivo `public/videos.json`, execute:

```bash
npm start
```

### Atualizar JSON de Artigos

Para executar o script que lê os arquivos de artigo HTML e atualiza o arquivo `public/articles.json`, execute:

```bash
npm run update-articles
```

## Scripts

- **`npm start`**: Executa `node fetch-videos.js` para buscar vídeos do YouTube.
- **`npm run update-articles`**: Executa `node update-articles-json.js` para atualizar o JSON de artigos.

## Implantação

O site está configurado para ser implantado no Firebase Hosting. Qualquer push para o branch `main` acionará uma implantação automática.

Para implantar manualmente, você pode usar a CLI do Firebase:

1. **Instale a CLI do Firebase:**

   ```bash
   npm install -g firebase-tools
   ```

2. **Faça login na sua conta do Firebase:**

   ```bash
   firebase login
   ```

3. **Implante no Firebase Hosting:**

   ```bash
   firebase deploy --only hosting
   ```

## Estrutura do Projeto

```
.
├── .github/              # Configurações do GitHub Actions
├── public/               # Arquivos públicos do site
│   ├── Artigos/          # Arquivos HTML dos artigos
│   ├── Imagens/          # Imagens usadas no site
│   ├── articles.json     # JSON gerado com a lista de artigos
│   ├── videos.json       # JSON gerado com a lista de vídeos
│   ├── index.html        # Página inicial
│   └── ...
├── .firebaserc           # Configuração do Firebase
├── firebase.json         # Configuração do Firebase Hosting
├── fetch-videos.js       # Script para buscar vídeos do YouTube
├── update-articles-json.js # Script para atualizar o JSON de artigos
├── package.json          # Dependências e scripts do Node.js
└── README.md             # Este arquivo
```
