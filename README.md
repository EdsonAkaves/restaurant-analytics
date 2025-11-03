# 🍔 Restaurant Analytics Platform

Plataforma de analytics customizável para donos de restaurantes explorarem dados operacionais.

**God Level Coder Challenge - Nola**

---

## 📋 Sobre o Projeto

Este projeto resolve o problema de donos de restaurantes que possuem dados de vendas, produtos, clientes e operações através de múltiplos canais (presencial, iFood, Rappi, WhatsApp, app próprio), mas não conseguem extrair insights personalizados para tomar decisões de negócio.

### Problema Resolvido

Maria, dona de 3 restaurantes, não conseguia responder perguntas como:
- "Qual produto vende mais na quinta à noite no iFood?"
- "Meu tempo de entrega piorou. Em quais regiões?"
- "Quais clientes compraram 3+ vezes mas não voltam há 30 dias?"

Esta plataforma permite que ela explore seus dados de forma intuitiva e visual.

---

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** + **Express**: API REST rápida e eficiente
- **PostgreSQL**: Banco de dados robusto com queries otimizadas
- **pg**: Driver nativo PostgreSQL com connection pooling

### Frontend
- **React 18**: Interface moderna e reativa
- **Vite**: Build tool ultra-rápido
- **Recharts**: Biblioteca de gráficos declarativa
- **Tailwind CSS**: Estilização responsiva via CDN
- **date-fns**: Manipulação de datas

---

## 📊 Funcionalidades

### 1. Dashboard Overview
- Total de vendas e receita
- Ticket médio
- Taxa de cancelamento
- Gráfico de vendas ao longo do tempo

### 2. Análise de Produtos
- Top N produtos mais vendidos (customizável)
- Receita total por produto
- Quantidade vendida
- Tabela detalhada com métricas

### 3. Performance por Canal
- Distribuição de receita por canal (gráfico pizza)
- Vendas por canal (gráfico barras)
- Tempo médio de entrega
- Ticket médio por canal

### 4. Análise Temporal
- Vendas por horário do dia
- Vendas por dia da semana
- Identificação de picos de demanda

### 5. Análise de Clientes
- Top 20 clientes por lifetime value
- Clientes inativos (não compram há 30+ dias)
- Métricas de frequência e ticket médio

### 6. Filtros Avançados
- Período customizável
- Filtro por múltiplas lojas
- Filtro por múltiplos canais
- Aplicação instantânea de filtros

---

## 🛠 Setup e Instalação

### Pré-requisitos
- Node.js 18+ instalado
- PostgreSQL rodando com os dados do desafio
- Git

### 1. Clone o repositório
```bash
git clone https://github.com/SEU-USUARIO/restaurant-analytics
cd restaurant-analytics
```

### 2. Configure o Backend
```bash
cd backend
npm install
```

Crie o arquivo `.env` baseado no `.env.example`:
```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais do PostgreSQL.

Inicie o servidor:
```bash
npm run dev
```

O backend estará rodando em `http://localhost:3001`

### 3. Configure o Frontend

Em outro terminal:
```bash
cd frontend
npm install
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

### 4. Acesse a aplicação

Abra o navegador em: **http://localhost:3000**

---

## 📁 Estrutura do Projeto
```
restaurant-analytics/
├── backend/
│   ├── server.js          # Servidor Express
│   ├── db.js              # Conexão PostgreSQL
│   ├── queries.js         # Queries SQL otimizadas
│   ├── .env.example       # Template de variáveis
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Componente principal
│   │   ├── api.js         # Cliente API
│   │   ├── main.jsx       # Entry point
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── README.md
├── ARCHITECTURE.md
└── .gitignore
```

---

## 🎯 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/overview` | Métricas gerais |
| GET | `/api/sales-by-date` | Vendas ao longo do tempo |
| GET | `/api/top-products` | Top produtos |
| GET | `/api/sales-by-channel` | Performance por canal |
| GET | `/api/sales-by-hour` | Vendas por horário |
| GET | `/api/sales-by-weekday` | Vendas por dia da semana |
| GET | `/api/top-customers` | Top clientes |
| GET | `/api/inactive-customers` | Clientes inativos |
| GET | `/api/stores` | Lista de lojas |
| GET | `/api/channels` | Lista de canais |

### Parâmetros de Query Suportados

- `startDate`: Data inicial (YYYY-MM-DD)
- `endDate`: Data final (YYYY-MM-DD)
- `storeIds`: IDs das lojas (separados por vírgula)
- `channelIds`: IDs dos canais (separados por vírgula)
- `limit`: Limite de resultados (onde aplicável)

**Exemplo:**
```
http://localhost:3001/api/top-products?startDate=2025-05-01&endDate=2025-10-31&limit=10
```

---

## 📈 Performance

- ✅ Queries otimizadas com **< 500ms** de resposta
- ✅ Connection pooling no PostgreSQL (20 conexões simultâneas)
- ✅ Índices estratégicos nas tabelas principais
- ✅ Carregamento assíncrono de dados
- ✅ Lazy loading por dashboard (só carrega dados da tab ativa)

---

## 🎓 Decisões Arquiteturais

Veja o arquivo [ARCHITECTURE.md](./ARCHITECTURE.md) para detalhes sobre:
- Escolha da stack (Node.js vs Python, React vs Vue)
- Otimizações de queries SQL
- Estrutura de componentes
- Trade-offs e limitações conhecidas
- Escalabilidade e próximos passos

---

## 🚀 Deploy

### Opção 1: Deploy no Render

#### Backend:
1. Crie um PostgreSQL no Render (free tier)
2. Gere os dados no banco
3. Crie um Web Service apontando para o repositório
4. Configure variável `DATABASE_URL`

#### Frontend:
1. Crie um Static Site no Render
2. Build command: `cd frontend && npm run build`
3. Publish directory: `frontend/dist`

### Opção 2: Rodar localmente

Siga as instruções de [Setup e Instalação](#-setup-e-instalação) acima.

---

## 👨‍💻 Autor

**Edson Alves da Silva Júnior**
- Email: edson.akaves@gmail.com
- GitHub: [@EdsonAkaves](https://github.com/EdsonAkaves)
- LinkedIn: [Edson Alves](https://www.linkedin.com/in/edsonakaves/)

---

## 📝 Licença

Este projeto foi desenvolvido como parte do **God Level Coder Challenge** da **Nola/Arcca**.

---

## 🙏 Agradecimentos

- Nola e Arcca pelo desafio incrível
- Comunidade open-source pelas ferramentas (React, Node.js, PostgreSQL, Recharts)
- Todos que contribuíram com feedback durante o desenvolvimento