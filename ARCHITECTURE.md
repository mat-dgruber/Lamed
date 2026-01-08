# Arquitetura do Projeto

## Visão Geral

Este projeto é uma aplicação full-stack que consiste em um frontend Angular e um backend Python (FastAPI). O objetivo é fornecer uma plataforma para visualização de conteúdo, como artigos e vídeos, e materiais de estudo.

## Frontend (Angular)

- **Framework:** Angular 20+
- **Componentes:** Standalone Components
- **UI Kit:** PrimeNG 21+ (Lara Theme) + Tailwind CSS 3.4+
- **Reatividade:** Signals
- **Features:**
  - Visualização de Artigos e Vídeos
  - Download de "Bundles" de estudo
  - Autenticação de Usuário (a ser implementado)

## Backend (Python/FastAPI)

- **Framework:** FastAPI
- **Gerenciamento de Pacotes:** UV
- **Banco de Dados:** Firebase Firestore
- **Features:**
  - API para servir conteúdo (artigos, vídeos, bundles)
  - Autenticação e Autorização
  - Geração de "Bundles" de estudo

## Banco de Dados (Firebase Firestore)

O Firestore é usado como o banco de dados principal da aplicação. As coleções e seus schemas estão documentados em `FIRESTORE_SCHEMA.md`.
