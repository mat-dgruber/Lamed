# AngularLamed

## Como Executar com Docker (Método Recomendado)

Esta é a maneira mais simples e recomendada de executar o projeto para desenvolvimento. Você não precisa instalar Node.js ou qualquer outra dependência diretamente na sua máquina. Tudo é executado dentro de containers Docker, garantindo um ambiente consistente para todos os desenvolvedores.

### Pré-requisitos

- **Docker Desktop**: Certifique-se de que você tem o Docker Desktop instalado e em execução na sua máquina. Ele inclui tanto o Docker quanto o Docker Compose.
  - [Faça o download aqui](https://www.docker.com/products/docker-desktop/)

### Passos para Iniciar o Ambiente

1.  **Clone o Repositório**: Se você ainda não o fez, clone este projeto para a sua máquina local.

2.  **Inicie o Ambiente**: Abra um terminal na raiz do projeto (onde o arquivo `docker-compose.yml` está localizado) e execute o seguinte comando:

    ```bash
    docker-compose up -d
    ```
    - O Docker irá construir a imagem da aplicação (isso pode levar alguns minutos na primeira vez).
    - Após o build, ele iniciará o container em modo "detached" (`-d`), ou seja, rodando em segundo plano.

3.  **Acesse a Aplicação**: Abra seu navegador e acesse [http://localhost:4200/](http://localhost:4200/). A aplicação estará rodando.

### Desenvolvimento

Com o container em execução, você pode simplesmente editar os arquivos do projeto (na pasta `src/`, por exemplo) no seu editor de código preferido (VS Code, etc.). O servidor de desenvolvimento do Angular dentro do Docker detectará as alterações automaticamente e recarregará a página no seu navegador.

### Como Parar o Ambiente

Para parar os containers, execute o seguinte comando no seu terminal (na mesma pasta):

```bash
docker-compose down
```

### Executando Outros Comandos (Testes, etc.)

Se precisar executar outros comandos `ng` ou `npm` (como os testes), você pode fazê-lo dentro do container em execução com o comando `docker-compose exec`.

Por exemplo, para rodar os testes unitários:
```bash
docker-compose exec app npm test
```

---

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.6.

## Development server (Método Antigo/Local)

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
