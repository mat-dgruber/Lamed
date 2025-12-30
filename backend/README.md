# Planejamento do Backend: Lamed (Django + FastAPI)

Este documento descreve o plano de implementação para o backend do projeto Novo Lamed. O objetivo é criar uma arquitetura híbrida robusta que aproveite o melhor de dois mundos:
*   **Django:** Para gerenciamento de banco de dados (ORM), migrações e, principalmente, o painel administrativo (Django Admin) para gerenciar Artigos e Materiais.
*   **FastAPI:** Para criar uma API REST de alta performance, moderna e assíncrona que servirá o frontend Angular.

## 1. Estrutura do Projeto

A estrutura de pastas proposta será:

```text
backend/
├── config/              # Configurações do projeto Django (settings, asgi, wsgi)
├── content/             # App Django contendo os modelos (Artigos, Guias)
├── api/                 # Rotas e lógica da API com FastAPI
├── main.py              # Ponto de entrada para rodar a aplicação (FastAPI + Django montado)
├── manage.py            # Utilitário de comando do Django
└── pyproject.toml       # Gerenciamento de dependências
```

## 2. Configuração Inicial

Como as dependências já estão no `pyproject.toml` (`django`, `fastapi`, `uvicorn`), siga os passos abaixo para inicializar a estrutura.

### Passo 1: Inicializar o Projeto Django
No diretório `backend`, crie o projeto Django chamado `config` e um app chamado `content`.

```bash
# Inicializa o projeto Django no diretório atual (.)
django-admin startproject config .

# Cria o app onde ficarão os modelos
python manage.py startapp content
```

### Passo 2: Configurar o `main.py` (Integração)
O arquivo `main.py` será o ponto de entrada. Ele deve inicializar o Django para que o FastAPI possa usar o ORM e montar a aplicação Django (para o Admin) sob uma rota específica.

Exemplo de estrutura para o `main.py`:

```python
import os
import django
from django.core.asgi import get_asgi_application
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

# 1. Configurar Django antes de tudo
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

# 2. Inicializar Apps
app = FastAPI(title="Lamed API", version="1.0.0")
django_app = get_asgi_application()

# 3. Rotas da API (Importar de api/routes.py futuramente)
@app.get("/api/health")
def health_check():
    return {"status": "ok", "frameworks": "FastAPI + Django"}

# 4. Montar o Django (Admin e Arquivos Estáticos)
# Necessário configurar STATIC_ROOT e STATIC_URL no settings.py do Django
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/", django_app)  # O Django captura tudo que não for pego pelo FastAPI
```

## 3. Definição dos Modelos (Django)

No arquivo `content/models.py`, definiremos as estruturas de dados conforme os requisitos (Artigos e Guias de Estudo com título, data e download).

```python
from django.db import models
from django.utils import timezone

class Categoria(models.Model):
    nome = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.nome

class Artigo(models.Model):
    titulo = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    conteudo = models.TextField() # Pode ser HTML ou Markdown
    resumo = models.TextField(blank=True)
    imagem_capa = models.URLField(blank=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True)
    publicado = models.BooleanField(default=False)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)
    # Sugestão futura: audio_url = models.URLField(blank=True, verbose_name="Áudio do Artigo")

    def __str__(self):
        return self.titulo

class MaterialEstudo(models.Model):
    # Campos solicitados: Título, Data e Material de Download
    titulo = models.CharField(max_length=200, verbose_name="Título")
    data_publicacao = models.DateField(default=timezone.now, verbose_name="Data de Publicação")
    arquivo_url = models.URLField(verbose_name="Link para Download") # Link para o arquivo (PDF, ZIP, etc.)
    
    # Campos extras úteis
    descricao = models.TextField(blank=True, verbose_name="Descrição (Opcional)")
    ativo = models.BooleanField(default=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Guia de Estudo"
        verbose_name_plural = "Guias de Estudo"
        ordering = ['-data_publicacao']

    def __str__(self):
        return self.titulo
```

## 4. Banco de Dados e Migrações

Com os modelos criados, registre o app `content` no `INSTALLED_APPS` em `config/settings.py` e execute:

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser # Para acessar o admin
```

## 5. API Endpoints (FastAPI)

Crie um diretório `api` e use o ORM do Django dentro das rotas do FastAPI (usando `sync_to_async` se necessário).

Exemplo (`api/artigos.py`):
```python
from fastapi import APIRouter
from content.models import Artigo
from asgiref.sync import sync_to_async

router = APIRouter()

@router.get("/artigos")
async def listar_artigos():
    # Uso do ORM do Django de forma assíncrona
    artigos = await sync_to_async(list)(Artigo.objects.filter(publicado=True).values())
    return artigos
```

## 6. Execução

Para rodar o servidor de desenvolvimento (Admin em `/admin` e API em `/api`):

```bash
uv run uvicorn main:app --reload
```

## 7. Considerações sobre Produção (SQLite)

O uso do SQLite é recomendado e viável para este projeto, dado o perfil de leitura intensiva. No entanto, em ambientes de produção (especialmente conteinerizados como Docker, Railway, etc.), os seguintes cuidados são **obrigatórios**:

### 1. Persistência de Dados (Volumes)
Em serviços de nuvem modernos, o sistema de arquivos do container é efêmero (tudo é apagado ao reiniciar/atualizar).
*   **Ação Necessária:** Você deve configurar um **Volume Persistente** (Persistent Disk/Volume) e montar o arquivo do banco de dados (`db.sqlite3`) nesse volume.
*   Sem isso, todos os artigos e guias cadastrados serão perdidos a cada novo deploy.

### 2. Modo WAL (Write-Ahead Logging)
Para melhorar a concorrência (evitar erros de "database is locked" durante acessos simultâneos) e performance.
*   **Ação Necessária:** Adicione ou certifique-se de que a configuração do banco de dados no `settings.py` inclua ou ative o modo WAL, ou execute o comando PRAGMA na inicialização da conexão.
*   Exemplo simples via SQL: `PRAGMA journal_mode=WAL;`

---

## 8. Roteiro de Melhorias Futuras e Otimizações

Abaixo estão sugestões para elevar o nível do projeto em performance, SEO e engajamento.

### Frontend (Angular)
1.  **SEO e Performance:**
    *   **SSR / Hydration:** Ativar a hidratação do Angular (versão 17+) para renderização instantânea e melhor indexação no Google.
    *   **Imagens Otimizadas:** Utilizar a diretiva `NgOptimizedImage` (`ngSrc`) em vez da tag `<img>` padrão para carregamento inteligente e formatos WebP.
2.  **UX (Experiência do Usuário):**
    *   **Barra de Busca Global:** Implementar busca no header que consulta Artigos e Vídeos simultaneamente na API.
    *   **Acessibilidade:** Botões de controle de fonte e alto contraste na leitura de artigos.

### Backend (FastAPI + Django)
1.  **Performance:**
    *   **Cache de API:** Implementar cache simples (memória ou Redis) para rotas de leitura frequente (ex: detalhes de artigo).
2.  **Engajamento e Conteúdo:**
    *   **Tags e Relacionados:** Implementar sistema de Tags (Many-to-Many) para sugerir automaticamente "Conteúdos Relacionados" (ex: ao ler um artigo sobre "História", sugerir vídeos do mesmo tema).
    *   **Versão em Áudio:** Adicionar campo `audio_url` nos Artigos para permitir que usuários ouçam o conteúdo (estilo podcast).
    *   **Trilhas de Conhecimento:** Criar estrutura para agrupar Vídeo + Artigo + Guia em uma sequência lógica de aprendizado.
    *   **Captura de Leads:** Endpoint simples para cadastro em Newsletter.

---

**Próximos Passos Imediatos:**
1.  Executar `django-admin startproject config .`
2.  Configurar o `INSTALLED_APPS`.
3.  Criar os modelos.
