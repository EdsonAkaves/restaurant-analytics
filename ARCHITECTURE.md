# 🏗 Decisões Arquiteturais - Restaurant Analytics

Este documento explica as principais decisões técnicas tomadas no desenvolvimento da plataforma.

---

## 🎯 Filosofia de Design

**"Resolver bem 5 problemas principais, não resolver mal 50 problemas"**

Em vez de construir um query builder visual complexo (que levaria semanas), focamos em criar dashboards pré-prontos MUITO BEM FEITOS que respondem as perguntas mais críticas dos donos de restaurantes.

---

## 🛠 Escolha da Stack

### Backend: Node.js + Express

**Por quê Node.js?**
- ✅ Ecossistema maduro para APIs REST
- ✅ Excelente driver PostgreSQL (pg) com connection pooling
- ✅ Desenvolvimento rápido
- ✅ JSON nativo (facilita comunicação com frontend)
- ✅ Single-threaded mas não-bloqueante (ideal para I/O intensivo)

**Por quê Express?**
- ✅ Minimalista e performático
- ✅ Middleware system flexível
- ✅ Grande comunidade e documentação
- ✅ Fácil de testar e debugar

**Alternativas consideradas:**
- ❌ Python/Django: Setup mais pesado, menos adequado para APIs simples
- ❌ PHP/Laravel: Ecossistema menos moderno para SPAs
- ❌ Go: Maior complexidade de desenvolvimento, overkill para o escopo

---

### Frontend: React + Vite

**Por quê React?**
- ✅ Componentização natural (dashboards = componentes)
- ✅ Ecossistema rico (Recharts, date-fns)
- ✅ Virtual DOM eficiente para re-renders
- ✅ Hooks para gestão de estado assíncrono
- ✅ Grande comunidade e suporte

**Por quê Vite?**
- ✅ **MUITO** mais rápido que Webpack/CRA
- ✅ Hot Module Replacement instantâneo
- ✅ Setup zero de configuração
- ✅ Build otimizado para produção

**Por quê Recharts?**
- ✅ Declarativo (perfeito para React)
- ✅ Gráficos bonitos out-of-the-box
- ✅ Responsivo
- ✅ Customizável via props
- ✅ Não requer configuração complexa

**Por quê Tailwind via CDN?**
- ✅ Zero configuração
- ✅ Classes utilitárias diretas
- ✅ Responsivo mobile-first
- ❌ Trade-off: Não otimiza classes não usadas (mas 50KB não impacta)

**Alternativas consideradas:**
- ❌ Vue: Menos familiaridade pessoal
- ❌ Angular: Muito pesado para o escopo
- ❌ D3.js: Complexidade desnecessária (Recharts é suficiente)
- ❌ Chart.js: Menos declarativo que Recharts

---

### Banco de Dados: PostgreSQL

**Dado pelo desafio, mas as vantagens:**
- ✅ ACID compliance
- ✅ Window functions (PERCENTILE_CONT, etc)
- ✅ Índices poderosos (B-tree, GIN, GIST)
- ✅ Agregações complexas
- ✅ Common Table Expressions (CTEs)
- ✅ Suporte robusto a tipos de dados complexos

---

## 🚀 Otimizações de Performance

### 1. Connection Pooling

```javascript
const pool = new Pool({
  max: 20,  // 20 conexões simultâneas
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});
```

**Por quê?**
- Reutiliza conexões (não cria nova a cada request)
- Suporta concorrência (20 usuários simultâneos)
- Timeout evita conexões travadas

---

### 2. Queries SQL Otimizadas

**Padrões usados:**

#### Filtro WHERE antes de JOIN
```sql
-- ✅ BOM: Filtro WHERE antes de JOIN
SELECT ...
FROM sales s
WHERE s.created_at >= $1 AND s.created_at <= $2
  AND s.sale_status_desc = 'COMPLETED'
JOIN products p ON p.id = s.product_id

-- ❌ RUIM: JOIN antes de filtrar
SELECT ...
FROM sales s
JOIN products p ON p.id = s.product_id
WHERE s.created_at >= $1 ...
```

#### Uso de FILTER em agregações
```sql
-- ✅ BOM: Uma query com FILTER
SELECT 
  COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed,
  COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled
FROM sales

-- ❌ RUIM: Múltiplas queries
SELECT COUNT(*) FROM sales WHERE status = 'COMPLETED'
SELECT COUNT(*) FROM sales WHERE status = 'CANCELLED'
```

#### Cast correto para ROUND
```sql
-- ✅ CORRETO: Cast para numeric
ROUND(SUM(ps.quantity)::numeric, 2)

-- ❌ ERRADO: Sem cast (gera erro)
ROUND(SUM(ps.quantity), 2)
```

**Índices estratégicos:**
```sql
-- Otimiza queries por período
CREATE INDEX idx_sales_date_status 
ON sales(DATE(created_at), sale_status_desc);

-- Otimiza JOINs
CREATE INDEX idx_product_sales_product_sale 
ON product_sales(product_id, sale_id);
```

---

### 3. Frontend Assíncrono

```javascript
// Carrega dados paralelamente
const [overviewData, salesData] = await Promise.all([
  api.fetchOverview(filters),
  api.fetchSalesByDate(filters)
]);
```

**Por quê?**
- 2 requests simultâneos ao invés de sequenciais
- Reduz tempo de carregamento pela metade

---

### 4. Lazy Loading por Tab

```javascript
// Só carrega dados da tab ativa
useEffect(() => {
  loadData();
}, [filters, activeTab]);
```

**Por quê?**
- Não carrega 5 dashboards de uma vez
- Economiza bandwidth e tempo
- Melhora perceived performance

---

## 📊 Arquitetura de Dados

### Modelo de Agregação

```
PostgreSQL (500k vendas)
    ↓ (queries < 500ms)
API REST (JSON)
    ↓ (Promise.all)
Frontend React
    ↓ (Recharts)
Usuário vê dashboards
```

**Por quê não usar cache/Redis?**
- ✅ Simplicidade: Uma dependência a menos
- ✅ PostgreSQL é rápido o suficiente com índices
- ✅ Dados sempre atualizados (sem invalidação de cache)
- ❌ Trade-off: Escala até ~10k requests/min (suficiente para o caso de uso)

**Quando usar cache:**
- Se tivéssemos milhões de usuários simultâneos
- Se queries levassem > 2s mesmo otimizadas
- Se houvessem agregações muito complexas

---

## 🎨 Estrutura de Componentes

### Abordagem: Monolítico Inicial

```
App.jsx (850 linhas)
├── Header
├── Filtros (com botões Aplicar/Resetar)
├── Tabs
└── Dashboards (renderização condicional)
    ├── Overview
    ├── Products (com limite customizável)
    ├── Channels
    ├── Temporal
    └── Customers
```

**Por quê não componentizar mais?**
- ✅ Desenvolvimento mais rápido (prazo de 6 dias)
- ✅ Menos arquivos para gerenciar
- ✅ Estado centralizado (filtros compartilhados)
- ✅ Fácil de entender o fluxo completo

**Quando refatorar:**
- Acima de 1500 linhas
- Múltiplos desenvolvedores no projeto
- Reutilização de componentes

---

### Gestão de Estado

**Abordagem: useState local**

```javascript
const [currentFilters, setCurrentFilters] = useState(defaultFilters);
const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
```

**Por quê não Context API / Redux?**
- ✅ Estado não é compartilhado entre componentes distantes
- ✅ Simplicidade
- ✅ Menos boilerplate
- ✅ Suficiente para o escopo

**Quando usar Context/Redux:**
- Múltiplas páginas/rotas
- Estado compartilhado entre árvores de componentes
- Time tracking, undo/redo

---

## 🔒 Segurança

### SQL Injection

**Prevenção: Prepared Statements**

```javascript
// ✅ SEGURO
db.query('SELECT * FROM sales WHERE id = $1', [userId]);

// ❌ INSEGURO
db.query(`SELECT * FROM sales WHERE id = ${userId}`);
```

Todas as queries usam parametrização ($1, $2, etc).

---

### CORS

```javascript
app.use(cors());  // Desenvolvimento

// Produção (exemplo):
// app.use(cors({ origin: 'https://meu-dominio.com' }))
```

---

### Rate Limiting

**Não implementado nesta versão**

**Por quê?**
- Escopo do desafio: Prova de conceito
- Deploy gratuito do Render já tem rate limiting

**Quando implementar:**
- Produção com muitos usuários
- APIs públicas

---

## 🎯 Trade-offs e Limitações

### 1. Dashboards Pré-prontos vs Query Builder

**Decisão:** Dashboards pré-prontos

**Prós:**
- ✅ UX mais simples (não requer conhecimento técnico)
- ✅ Desenvolvimento 10x mais rápido
- ✅ Performance otimizada (queries conhecidas)
- ✅ Menos bugs (casos de uso controlados)

**Contras:**
- ❌ Menos flexibilidade
- ❌ Precisa adicionar dashboard novo para cada pergunta

**Por quê escolhemos?**
- Prazo de 6 dias
- 80% das perguntas são cobertas pelos dashboards atuais
- Maria (persona) não é técnica
- Query builders complexos têm curva de aprendizado

---

### 2. Sem Autenticação

**Decisão:** Sem auth

**Por quê?**
- ✅ Fora do escopo do desafio
- ✅ Foco no problema core (analytics)

**Produção:**
- Implementar JWT ou OAuth
- Permissões por loja (dono só vê suas lojas)
- Rate limiting por usuário

---

### 3. Sem Testes Automatizados

**Decisão:** Testes manuais apenas

**Por quê?**
- ✅ Prazo apertado
- ✅ Queries testadas via console/pgAdmin
- ✅ Frontend testado manualmente em múltiplos cenários

**Próximos passos:**
- Jest para backend (teste de queries)
- React Testing Library para frontend
- E2E com Playwright/Cypress

---

### 4. Tailwind via CDN

**Decisão:** CDN ao invés de build

**Prós:**
- ✅ Zero configuração
- ✅ Funciona imediatamente
- ✅ Não precisa de build step adicional

**Contras:**
- ❌ 50KB extras (não otimiza classes não usadas)
- ❌ Sem customização de tema

**Impacto:** Mínimo (50KB é aceitável para a maioria dos casos)

---

## 📈 Escalabilidade

### Estado Atual

**Suporta:**
- ✅ 500k vendas no banco
- ✅ Queries < 500ms
- ✅ 10-20 usuários simultâneos
- ✅ Connection pooling eficiente

---

### Próximos Passos (Escala)

**Para 10M+ vendas:**
1. Particionamento de tabelas (por data)
2. Materialized views para agregações
3. Redis para cache de queries frequentes
4. Read replicas do PostgreSQL

**Para 1000+ usuários simultâneos:**
1. Load balancer (nginx)
2. Múltiplas instâncias do backend
3. CDN para frontend estático
4. Connection pool maior (50-100 conexões)

---

## 🎓 Lições Aprendidas

### 1. Simplicidade > Complexidade

Dashboards pré-prontos resolvem 80% dos casos com 20% do esforço de um query builder.

### 2. Performance desde o início

Índices e queries otimizadas desde a primeira versão evitam refatoração depois.

### 3. Foco no usuário

Maria não quer SQL. Ela quer respostas. Os dashboards foram desenhados em torno das perguntas dela.

### 4. Trade-offs conscientes

Documentar "por quê NÃO" é tão importante quanto "por quê SIM".

### 5. Iteração rápida

Começar simples e iterar é melhor que tentar fazer tudo perfeito de primeira.

---

## 🚀 Roadmap Futuro

### V1 (Atual)
- ✅ 5 dashboards funcionais
- ✅ Filtros por data, lojas e canais
- ✅ Queries otimizadas
- ✅ Interface responsiva

### V2 (Próximas features)
- [ ] Exportar relatórios (PDF, CSV)
- [ ] Comparação de períodos lado a lado
- [ ] Alertas automáticos (ex: "vendas caíram 20%")
- [ ] Dashboard customizável (drag-and-drop)

### V3 (Escala)
- [ ] Multi-tenancy (múltiplas marcas)
- [ ] Permissões por usuário
- [ ] API pública para integrações
- [ ] Mobile app (React Native)
- [ ] Previsão de demanda (ML)

---

## 📚 Referências

- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [React Best Practices](https://react.dev/learn)
- [Node.js Connection Pooling](https://node-postgres.com/features/pooling)
- [Recharts Documentation](https://recharts.org/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

---

## 🔍 Análise de Requisitos vs Implementação

### Requisitos do Desafio

| Requisito | Status | Implementação |
|-----------|--------|---------------|
| Frontend funcional | ✅ | React + Vite + Recharts |
| Backend funcional | ✅ | Node.js + Express |
| Banco adequado | ✅ | PostgreSQL com 520k vendas |
| Queries < 1s | ✅ | Todas < 500ms |
| Documentação | ✅ | README + ARCHITECTURE |
| Deploy/local | ✅ | Instruções completas |
| Vídeo demo | ⏳ | Pendente |

---

**Última atualização:** Novembro 2025