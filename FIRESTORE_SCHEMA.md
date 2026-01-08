# Schema do Firebase Firestore

Este documento descreve o schema das coleções utilizadas no Firebase Firestore.

## Coleção: `bundles`

Esta coleção armazena os "bundles" de estudo, que são pacotes de materiais para cada lição.

| Campo                  | Tipo      | Descrição                                                                 |
| ---------------------- | --------- | ------------------------------------------------------------------------- |
| `id`                   | `Number`  | Identificador único do bundle.                                            |
| `title`                | `String`  | Título do bundle.                                                         |
| `slug`                 | `String`  | Slug amigável para URLs.                                                  |
| `trimester`            | `String`  | Trimestre a que o bundle pertence (ex: "1º Trimestre de 2024").           |
| `lesson_number`        | `Number`  | Número da lição.                                                          |
| `youtube_link`         | `String`  | Link para o vídeo da lição no YouTube.                                    |
| `article_link`         | `String`  | Link para o artigo relacionado à lição.                                   |
| `file_guide_url`       | `String`  | URL para o arquivo do guia de estudo (PDF).                               |
| `file_slides_url`      | `String`  | URL para o arquivo dos slides (PDF/PPTX).                                 |
| `file_map_url`         | `String`  | URL para o arquivo do mapa mental.                                        |
| `file_infographic_url` | `String`  | URL para o arquivo do infográfico.                                        |
| `file_flashcards_url`  | `String`  | URL para o arquivo dos flashcards.                                        |
| `published_date`       | `String`  | Data de publicação do bundle (formato ISO).                               |
