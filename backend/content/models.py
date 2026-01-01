from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

# Create your models here.

class Artigo(models.Model):
     titulo = models.CharField(max_length=255)
     slug = models.SlugField(max_length=255, unique=True)
     conteudo = models.TextField()
     resumo = models.TextField(blank=True)
     banner_path = models.CharField(max_length=500, blank=True, null=True)
     tags = models.JSONField(default=list, blank=True)
     data_publicado = models.DateTimeField(default=timezone.now)
     autor = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
     publicado = models.BooleanField(default=False)

     def __str__(self):
          return self.titulo


class Categoria(models.Model):
     nome = models.CharField(max_length=100)
     slug = models.SlugField(max_length=100, unique=True)

     def __str__(self):
          return self.nome

class MaterialEstudo(models.Model):
     titulo = models.CharField(max_length=255)
     # slug not strictly needed if we list by trimester, but good to have
     slug = models.CharField(max_length=255, unique=True, blank=True, null=True) 
     descricao = models.TextField(blank=True)
     data_publicado = models.DateTimeField(default=timezone.now)
     arquivo_url = models.URLField(verbose_name="Link de Download")
     publicado = models.BooleanField(default=False)
     categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, null=True, blank=True)
     
     # New fields
     trimestre = models.CharField(max_length=20, help_text="Ex: 3Tri25")
     licao_numero = models.IntegerField(help_text="Número da lição (1-13)")

     class Meta:
          verbose_name = "Guia de Estudo"
          verbose_name_plural = "Guias de Estudo"
          ordering = ['-data_publicado']

     def __str__(self):
          return self.titulo