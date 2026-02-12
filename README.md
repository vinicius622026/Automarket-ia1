# AutoMarket AI

Marketplace inteligente de veículos com IA, desenvolvido para compra e venda com máxima automação e performance.

## 🚀 Visão Geral

O AutoMarket AI é uma plataforma completa de marketplace de veículos que combina:
- **API RESTful** de alta performance com tRPC
- **Frontend React** moderno e responsivo
- **Servidor MCP** com ferramentas de IA para análise de mercado
- **Processamento de imagens** automático com Sharp
- **Sistema de mensagens** em tempo real
- **Avaliações e reviews** de vendedores
- **Busca avançada** com filtros inteligentes

## 📋 Funcionalidades

### Para Usuários
- ✅ Busca avançada de veículos com múltiplos filtros
- ✅ Visualização detalhada de anúncios com galeria de fotos
- ✅ Sistema de mensagens diretas com vendedores
- ✅ Avaliação de vendedores
- ✅ Histórico de transações
- ✅ Limite de 1 anúncio ativo para usuários gratuitos

### Para Lojas (Store Owners)
- ✅ Anúncios ilimitados
- ✅ Painel de gerenciamento de loja
- ✅ API key para integração externa
- ✅ Importação em massa de veículos (bulk import)
- ✅ Analytics e estatísticas

### Para Administradores
- ✅ Dashboard administrativo completo
- ✅ Moderação de anúncios
- ✅ Gestão de usuários
- ✅ Estatísticas da plataforma

### Ferramentas de IA (MCP Server)
- 🤖 **estimate_car_value**: Estimativa de valor de mercado baseada em dados históricos
- 🤖 **generate_ad_copy**: Geração automática de descrições otimizadas para SEO
- 🤖 **analyze_market_trends**: Análise de tendências de mercado e recomendações

## 🛠️ Stack Tecnológica

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4 + Vite
- **Backend**: Node.js + Express + tRPC 11 + TypeScript
- **Banco de Dados**: MySQL/TiDB (via Drizzle ORM)
- **Autenticação**: Supabase Auth
- **Storage**: S3 (via Supabase Storage)
- **Processamento de Imagem**: Sharp
- **MCP Server**: Model Context Protocol SDK

## 📦 Estrutura do Projeto

```
automarket-ai/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── lib/           # Utilitários e configurações
│   │   └── index.css      # Estilos globais
│   └── public/            # Assets estáticos
├── server/                # Backend API
│   ├── routers.ts         # Definição de rotas tRPC
│   ├── db.ts              # Funções de banco de dados
│   └── _core/             # Infraestrutura do servidor
├── drizzle/               # Schema e migrations do banco
│   └── schema.ts          # Definição das tabelas
├── mcp-server/            # Servidor MCP com ferramentas de IA
│   ├── index.ts           # Implementação das ferramentas
│   └── package.json       # Configuração do MCP
└── shared/                # Tipos e constantes compartilhadas
```

## 🗄️ Schema do Banco de Dados

### Tabelas Principais

- **users**: Usuários do sistema (integração com Supabase Auth)
- **profiles**: Perfis estendidos dos usuários
- **stores**: Lojas/revendas
- **cars**: Anúncios de veículos
- **car_photos**: Fotos dos veículos (thumb, medium, large)
- **messages**: Sistema de mensagens
- **reviews**: Avaliações de vendedores
- **transactions**: Transações e propostas
- **bulk_import_jobs**: Jobs de importação em massa

## 🚦 Como Usar

### Desenvolvimento

```bash
# Instalar dependências
pnpm install

# Rodar migrations
pnpm db:push

# Iniciar servidor de desenvolvimento
pnpm dev

# Rodar testes
pnpm test
```

### Produção

```bash
# Build
pnpm build

# Iniciar servidor
pnpm start
```

### MCP Server

```bash
# Navegar para o diretório do MCP
cd mcp-server

# Executar servidor MCP
pnpm start
```

## 🔑 Variáveis de Ambiente

As seguintes variáveis devem ser configuradas no ambiente:

### Banco de Dados
- `DATABASE_URL`: String de conexão MySQL/TiDB

### Autenticação (Supabase)
- `VITE_SUPABASE_URL`: URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave pública (anon) do Supabase
- `SUPABASE_SERVICE_ROLE_KEY` (opcional): Chave de serviço para operações administrativas

### Segurança
- `JWT_SECRET`: Segredo para assinatura de tokens de sessão

### APIs Internas
- `BUILT_IN_FORGE_API_KEY`: Chave para APIs internas
- `BUILT_IN_FORGE_API_URL`: URL das APIs internas

### Configuração do Proprietário
- `OWNER_OPEN_ID`: OpenID do proprietário/admin do sistema

## 📡 API Endpoints

### Autenticação
- `POST /api/trpc/auth.me` - Dados do usuário atual
- `POST /api/trpc/auth.signUp` - Criar nova conta
- `POST /api/trpc/auth.signIn` - Login com email/senha
- `POST /api/trpc/auth.logout` - Logout

### Perfis
- `POST /api/trpc/profile.get` - Obter perfil
- `POST /api/trpc/profile.create` - Criar perfil
- `POST /api/trpc/profile.update` - Atualizar perfil

### Lojas
- `POST /api/trpc/stores.create` - Criar loja
- `POST /api/trpc/stores.getById` - Obter loja por ID
- `POST /api/trpc/stores.getMy` - Minhas lojas
- `POST /api/trpc/stores.update` - Atualizar loja
- `POST /api/trpc/stores.list` - Listar todas as lojas

### Veículos
- `POST /api/trpc/cars.create` - Criar anúncio
- `POST /api/trpc/cars.getById` - Obter anúncio
- `POST /api/trpc/cars.update` - Atualizar anúncio
- `POST /api/trpc/cars.delete` - Deletar anúncio
- `POST /api/trpc/cars.updateStatus` - Alterar status
- `POST /api/trpc/cars.getMyCars` - Meus anúncios
- `POST /api/trpc/cars.search` - Buscar com filtros

### Fotos
- `POST /api/trpc/photos.upload` - Upload de foto
- `POST /api/trpc/photos.list` - Listar fotos
- `POST /api/trpc/photos.delete` - Deletar foto
- `POST /api/trpc/photos.reorder` - Reordenar fotos

### Mensagens
- `POST /api/trpc/messages.send` - Enviar mensagem
- `POST /api/trpc/messages.getConversation` - Obter conversa
- `POST /api/trpc/messages.getMyConversations` - Minhas conversas
- `POST /api/trpc/messages.markAsRead` - Marcar como lida

### Reviews
- `POST /api/trpc/reviews.create` - Criar avaliação
- `POST /api/trpc/reviews.getBySeller` - Avaliações do vendedor

### Transações
- `POST /api/trpc/transactions.create` - Criar transação
- `POST /api/trpc/transactions.updateStatus` - Atualizar status
- `POST /api/trpc/transactions.getMy` - Minhas transações

### Admin
- `POST /api/trpc/admin.dashboard` - Dashboard stats
- `POST /api/trpc/admin.moderateCar` - Moderar anúncio
- `POST /api/trpc/admin.getAllCars` - Listar todos os carros

## 🤖 Ferramentas MCP

### estimate_car_value

Estima o valor de mercado de um veículo baseado em dados históricos.

```json
{
  "brand": "Toyota",
  "model": "Corolla",
  "year_model": 2023,
  "mileage": 15000
}
```

**Retorno:**
```json
{
  "estimated_price": 125000,
  "price_range": { "min": 118000, "max": 132000 },
  "confidence": 0.87,
  "similar_cars_analyzed": 45
}
```

### generate_ad_copy

Gera descrição otimizada para anúncios.

```json
{
  "car_id": 123,
  "tone": "professional",
  "max_length": 500
}
```

**Retorno:**
```json
{
  "ad_copy": "Toyota Corolla 2.0 XEI 2023: a combinação perfeita...",
  "seo_keywords": ["Toyota", "Corolla", "2023"],
  "seo_score": 0.92
}
```

### analyze_market_trends

Analisa tendências de mercado para marca/modelo.

```json
{
  "brand": "Toyota",
  "model": "Corolla",
  "timeframe_days": 30
}
```

**Retorno:**
```json
{
  "avg_price_trend_percent": "+2.5%",
  "avg_days_to_sell": 12,
  "demand_level": "high",
  "recommendations": ["Aumentar preço em 3% para maximizar lucro."]
}
```

## 🎨 Design System

### Paleta de Cores

- **Primary**: Deep Blue (oklch(45% 0.15 250)) - Luxo automotivo
- **Accent**: Orange (oklch(65% 0.18 40)) - Performance/Energia
- **Secondary**: Silver/Gray - Metálico
- **Background**: Clean White/Dark

### Componentes

Utiliza **shadcn/ui** para componentes consistentes e acessíveis:
- Buttons, Cards, Badges
- Forms, Inputs, Selects
- Dialogs, Toasts, Tooltips
- Skeletons para loading states

## 🔒 Segurança

- ✅ Autenticação OAuth com JWT
- ✅ Validação de roles (user, store_owner, admin)
- ✅ Proteção de rotas no backend
- ✅ Validação de dados com Zod
- ✅ Limites de upload (15 fotos por anúncio)
- ✅ Sanitização de inputs

## 📊 Performance

- ✅ Índices otimizados no banco de dados
- ✅ Lazy loading de imagens
- ✅ Processamento de imagens em 3 tamanhos (thumb, medium, large)
- ✅ Cache de queries com tRPC
- ✅ Paginação em listagens

## 🧪 Testes

```bash
# Rodar todos os testes
pnpm test

# Exemplo de teste
# Ver: server/auth.logout.test.ts
```

## 📝 TODO

Ver arquivo `todo.md` para lista completa de funcionalidades implementadas e pendentes.

## 🤝 Contribuindo

Este projeto foi desenvolvido seguindo as especificações do PRD (Product Requirements Document).

## 📄 Licença

MIT

---

**AutoMarket AI** - O marketplace mais inteligente para compra e venda de veículos.
