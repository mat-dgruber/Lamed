# 🎨 Lamed Frontend

![Angular](https://img.shields.io/badge/Angular-20%2B-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![PrimeNG](https://img.shields.io/badge/UI-PrimeNG-blue?style=for-the-badge)
![Tailwind](https://img.shields.io/badge/CSS-Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

Aplicação Web Client-Side do projeto Lamed, construída com **Angular 20+** e **Standalone Components**.

---

## 🏗️ Estrutura e Práticas

### Diretórios Chave (`src/app`)

| Pasta         | Responsabilidade                                     |
| :------------ | :--------------------------------------------------- |
| **`api/`**    | Interfaces e Serviços de comunicação com Backend.    |
| **`core/`**   | Interceptors, Guards e Serviços Globais (Singleton). |
| **`pages/`**  | Componentes de página (Roteados).                    |
| **`shared/`** | Componentes reutilizáveis (UI) e Pipes.              |

### Tecnologias

- **Componentes**: Standalone (sem NgModules).
- **Gerenciamento de Estado**: Signals (`signal`, `computed`, `effect`).
- **Estilização**: Tailwind CSS + PrimeNG (Lara Theme).
- **Ícones**: Lucide Icons.

---

## 🚀 Comandos Úteis

> [!TIP]
> Use `npm` ou `ng` diretamente nesta pasta.

### Desenvolvimento

```bash
# Iniciar servidor local (HMR ativo)
npm start
# ou
ng serve
```

### Build

```bash
# Produção (Otimizado)
ng build --configuration=production

# QA/Homologação
ng build --configuration=staging
```

### Testes

```bash
# Unitários (Karma/Jasmine)
ng test

# End-to-End
ng e2e
```

---

## 📦 Deploy

O deploy é automatizado para o **Firebase Hosting**.

```bash
# Deploy manual (requer login)
npx firebase deploy --only hosting
```

> [!WARNING]
> Verifique o arquivo `firebase.json` na raiz para regras de rewrite e headers de cache.
