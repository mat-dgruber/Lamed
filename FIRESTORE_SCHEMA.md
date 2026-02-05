# FIRESTORE SCHEMA

## Collections

### `bundles`

Representa um pacote semanal de conteúdo de estudo.

- **id** (Document ID): Auto-generated string.
- **title** (string): Título do bundle (ex: "Semana 1: Introdução à Torá").
- **description** (string): Breve resumo do conteúdo.
- **week_number** (number): Número sequencial da semana (para ordenação).
- **author** (string): Nome do autor do artigo/estudo.
- **published_at** (timestamp): Data de publicação exibida no artigo.
- **video_data** (map):
  - **url** (string): Link do YouTube ou Storage.
  - **provider** (string): 'youtube' | 'storage'.
  - **duration** (number, optional): Duração em segundos.
- **thumbnail_url** (string): Capa do vídeo/bundle.
- **article_content** (string): Conteúdo do artigo em HTML (suporta tags `<img>`).
- **resources** (array of maps):
  - **title** (string): Nome do recurso (ex: "Mapa Mental").
  - **type** (string): 'pdf' | 'pptx' | 'infographic' | 'doc'.
  - **url** (string): Link para download (Firebase Storage).
- **is_active** (boolean): Se o bundle está visível.
- **created_at** (timestamp): Data de criação sistema.
- **updated_at** (timestamp): Última atualização.

### `articles`

Representa artigos individuais ou estudos migrados do sistema antigo.

- **id** (Document ID): Slug ou ID único (ex: `do-fracasso-a-vitoria`).
- **title** (string)
- **subtitle** (string, optional)
- **summary** (string): Resumo curto para cards.
- **content** (string): Conteúdo HTML completo do artigo.
- **cover_image** (string): URL da imagem de capa.
- **highlights** (array of strings): Pontos de destaque do artigo.
- **tags** (array of strings): Tags para categorização.
- **author** (string): Nome do autor.
- **published_at** (timestamp): Data de publicação.
- **is_active** (boolean): Default true.
- **created_at** (timestamp)
- **updated_at** (timestamp)

### `users`

- **uid** (string): Firebase Auth UID.
- **subscription_status** (string): 'active' | 'inactive'.
