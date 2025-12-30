from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

# Create your models here.

class Artigo(models.Model):
     titulo = models.CharField(max_length=255)
     slug = models.SlugField(max_length=255, unique=True)
     conteudo = models.TextField()
     resumo = models.TextField(blank=True)
     imagem_capa = models.ImageField(upload_to='imagens/artigos', blank=True, null=True)
     data_publicado = models.DateTimeField(default=timezone.now)
     autor = models.ForeignKey(User, on_delete=models.CASCADE, default="Lamed")
     publicado = models.BooleanField(default=False)

     def __str__(self):
          return self.titulo


class Categoria(models.Model):
     nome = models.CharField(max_length=100)
     slug = models.SlugField(max_length=100, unique=True)

     def __str__(self):
          return self.nome

class MaterialEstudo(model.Model):
     titulo = models.CharField(max_length=255)
     slug = modelds.CharField(max_length=255, unique=True)
     descricao = models.TextField()
     data_publicado = models.DateTimeField(default=timezone.now)
     arquivo_url = models.URLField(verbose_name="Link de Download")
     publicado = models.BooleanField(default=False)
     cateogoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)

     class Meta:
          verbose_name = "Guia de Estudo"
          verbose_name_plural = "Guias de Estudo"
          ordering = ['-data_publicado']

     def __str__(self):
          return self.titulo