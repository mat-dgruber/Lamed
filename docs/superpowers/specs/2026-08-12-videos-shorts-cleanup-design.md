# Design Doc: Melhorias na Tela de Vídeos, Detecção de Shorts e Inativação de Vídeos Apagados

**Data**: 2026-08-12
**Autor**: Matheus Diniz & Claude
**Status**: Aprovado

---

## 1. Visão Geral
Atualmente, a tela de vídeos do Lamed exibe conteúdos vindos da coleção de vídeos do Firestore, sincronizados com a API do YouTube. No entanto:
1. Vídeos do tipo YouTube Shorts e cortes não possuem uma diferenciação clara no banco de dados e acabam sendo listados misturados com vídeos longos de estudo.
2. Vídeos excluídos/privados no YouTube permanecem com `is_active: true` no Firestore após sincronizações anteriores, poluindo a galeria pública.

Este documento especifica a solução para classificar automaticamente o tipo de vídeo (`is_short`), inativar automaticamente conteúdos deletados no YouTube, disponibilizar o controle de vídeos no painel administrativo e fornecer uma interface moderna com abas no frontend.

---

## 2. Arquitetura & Mudanças no Backend

### 2.1. Modelo de Dados (`backend/models.py`)
No modelo `VideoBase` e `Video`, adicionamos o campo:
- `is_short: bool = False`

### 2.2. Sincronização do YouTube (`backend/services/youtube_sync.py`)
- **Consulta de Detalhes do Vídeo (`contentDetails`)**:
  Ao buscar os vídeos do canal via YouTube Data API v3, consultamos a duração (`duration` no formato ISO 8601, ex: `PT45S`, `PT1M2S`).
  - Se a duração for $\le 60$ segundos, ou se a URL contiver `/shorts/`, ou o título/descrição contiver a hashtag `#shorts`, o vídeo é marcado como `is_short = True`.
- **Inativação Automática (Soft Delete)**:
  Buscamos todos os vídeos atualmente com `is_active = True` do provedor `youtube` no Firestore. Se algum vídeo do banco não estiver mais listado no canal do YouTube retornado pela API, seu status é automaticamente atualizado para `is_active = False`.

### 2.3. Rotas da API (`backend/routes/videos.py` & `backend/routes/admin.py`)
- **GET `/videos/`**:
  Adicionado filtro opcional `is_short: Optional[bool] = None`.
  - Se `is_short=True`, retorna apenas Shorts.
  - Se `is_short=False`, retorna apenas vídeos de estudo longos.
  - Se omitido, retorna todos os vídeos ativos.
- **PATCH `/admin/videos/{video_id}`**:
  Permite alterar manualmente o estado `is_active` e `is_short` de um vídeo específico.
- **GET `/admin/videos/`**:
  Retorna todos os vídeos (ativos e inativos) para a listagem no painel do administrador.

---

## 3. Mudanças no Frontend

### 3.1. Servicos Angular (`frontend/src/app/services/video.service.ts` & `videos.service.ts`)
- Interface `Video` estendida com `is_short?: boolean`.
- `VideoService.getVideos()` aceita os parâmetros `onlyActive` e `isShort`.
- `VideosService` provê métodos reativos para a galeria:
  - `getVideos(isShort: boolean)`: Filtra vídeos longos ou shorts.

### 3.2. Galeria de Vídeos Pública (`/videos`)
- **Navegação por Abas**:
  - **Aba "Estudos Bíblicos"**: Exibe a lista de vídeos longos em formato 16:9 (`aspect-video`), destaque para o mais recente.
  - **Aba "Shorts & Cortes"**: Exibe a lista em formato vertical 9:16 (`aspect-[9/16]`), otimizada para vídeos curtos.
- Utilização de `signal< 'long' | 'shorts' >` no Angular 19 para troca instantânea de abas.

### 3.3. Painel Administrativo (`/admin/videos`)
- Tela de gerenciamento com tabela/cards contendo:
  - Destaque da thumbnail, título e data de publicação.
  - Badge identificador (`Vídeo Longo` / `Short`).
  - Interruptor (Toggle) para ativar/desativar `is_active`.
  - Botão de acionamento manual do `Sincronizar com YouTube`.

---

## 4. Testes e Qualidade
- **Backend (Pytest)**:
  - Teste unitário para `sync_videos` verificando se vídeos excluídos ficam com `is_active = False`.
  - Teste de filtragem por `is_short` nas rotas `/videos/`.
- **Frontend (Jasmine/Karma)**:
  - Teste de troca de abas no componente de Vídeos (`videos.spec.ts`).
  - Teste de ordenação e carregamento no `videos.service.spec.ts`.
