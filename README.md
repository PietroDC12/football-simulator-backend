# ⚽ Football Simulator — Backend

API REST responsável pela simulação de partidas de futebol, gerenciamento de campeonatos, times e jogadores.

---

## 🚀 Tecnologias

- **Node.js** — ambiente de execução JavaScript
- **Express** — framework para criação da API REST
- **PostgreSQL** — banco de dados relacional
- **Prisma ORM** — modelagem e acesso ao banco de dados
- **dotenv** — gerenciamento de variáveis de ambiente
- **nodemon** — reinicialização automática em desenvolvimento

---

## 📁 Estrutura do projeto

```
football-simulator-backend/
├── prisma/
│   ├── schema.prisma       # Modelagem das tabelas
│   └── seed.js             # População inicial do banco
├── src/
│   ├── data/
│   │   └── simulator.js    # Motor de simulação das partidas
│   ├── routes/
│   │   └── match.js        # Rotas da API
│   ├── prisma.js           # Instância do Prisma Client
│   └── server.js           # Entrada do servidor
├── prisma.config.ts        # Configuração do Prisma 7
├── .env.example            # Exemplo de variáveis de ambiente
└── package.json
```

---

## ⚙️ Instalação

**Pré-requisitos:** Node.js 18+, PostgreSQL instalado e rodando.

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/football-simulator-backend.git
cd football-simulator-backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com sua senha do PostgreSQL
```

**Configure o banco de dados:**

```bash
# Crie o banco no PostgreSQL
psql -U postgres -c "CREATE DATABASE football_simulator;"

# Gere o Prisma Client
npx prisma generate

# Rode as migrations
npx prisma migrate dev --name init
```

---

## ▶️ Rodando o projeto

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

O servidor sobe em `http://localhost:3001`

---

## 📡 Rotas da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/competitions` | Lista todos os campeonatos |
| GET | `/api/competitions/:id/teams` | Times de um campeonato |
| POST | `/api/match` | Simula uma partida |

### Exemplo — Simular partida

**POST** `/api/match`

```json
{
  "homeTeamId": "time-brasil",
  "awayTeamId": "time-mexico",
  "format": "90"
}
```

`format` aceita `"90"` (regulamentar) ou `"120"` (com prorrogação e pênaltis).

---

## 🗃️ Variáveis de ambiente

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/football_simulator"
PORT=3001
```

---

## 📄 Licença

MIT
