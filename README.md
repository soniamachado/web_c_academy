# Web C Academy — API de Utilizadores

API REST em Node.js/Express com autenticação JWT, MongoDB (Mongoose) e servir de ficheiros estáticos a partir de `public/`.

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [MongoDB](https://www.mongodb.com/) a correr localmente ou uma connection string do MongoDB Atlas

## Instalação

Antes de iniciar o programa, instala as dependências do projeto:

```bash
npm install
```

Este comando lê o `package.json` e descarrega todos os pacotes necessários (Express, Mongoose, JWT, bcrypt, etc.) para a pasta `node_modules/`.

## Configuração

Copia o ficheiro de exemplo e preenche com os teus valores:

```bash
cp .env.example .env
```

Variáveis necessárias no `.env`:

| Variável           | Descrição                                      |
| ------------------ | ---------------------------------------------- |
| `JWT_SECRET`       | Segredo forte usado para assinar os tokens JWT |
| `TOKEN_EXPIRATION` | Tempo de expiração do token (ex.: `1h`)        |
| `ADMIN_PASSWORD`   | Password do administrador criado no arranque   |
| `MONGO_URI`        | (Opcional) String de ligação ao MongoDB        |
| `PORT`             | (Opcional) Porta do servidor (por defeito 3000)|

> Se `MONGO_URI` não for definida, é usada `mongodb://localhost:27017/projeto-db`.

## Iniciar o programa

```bash
npm start
```

O servidor arranca em `http://localhost:3000`. Ao iniciar, liga-se ao MongoDB e cria o administrador (caso ainda não exista).

## Endpoints principais

- `GET  /` — verificação de estado da API
- `/api/auth` — rotas de autenticação (login, etc.)
- `/api/users` — rotas de gestão de utilizadores

## Docker (opcional)

O projeto inclui `Dockerfile` e `docker-compose.yml`:

```bash
docker-compose up
```
