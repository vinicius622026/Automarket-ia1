# AutoMarket AI - TODO List

## Fase 1: MVP (Core Functionality)

### Database & Schema
- [x] Criar tabela profiles (extensão de auth.users)
- [x] Criar tabela stores (lojas)
- [x] Criar tabela cars (anúncios de veículos)
- [x] Criar tabela car_photos (fotos dos veículos)
- [x] Criar tabela messages (sistema de mensagens em tempo real)
- [x] Criar tabela reviews (avaliações de vendedores)
- [x] Criar tabela transactions (transações)
- [x] Criar enums (user_role, transmission_type, fuel_type, car_status)
- [x] Criar índices para performance
- [ ] Criar trigger para search_vector (busca textual)
- [ ] Implementar políticas RLS (Row Level Security)

### Backend API
- [x] Configurar Fastify como servidor API
- [x] Implementar autenticação OAuth Supabase
- [x] Criar middleware de autenticação e autorização
- [x] Criar middleware de validação de roles (admin/user/store_owner)
- [x] Implementar endpoints de autenticação (register, login, logout, me)
- [x] Implementar CRUD completo de anúncios (cars)
- [x] Implementar upload e processamento de imagens com Sharp
- [x] Implementar busca avançada com filtros (marca, modelo, ano, preço, localização)
- [x] Implementar sistema de mensagens em tempo real
- [x] Implementar endpoints de lojas (stores)
- [x] Implementar endpoints de fotos (upload, delete, reorder)
- [x] Implementar endpoints de reviews (avaliações)
- [ ] Implementar endpoints de integração (bulk-import)
- [x] Implementar endpoints admin (moderação, dashboard)
- [x] Implementar validações de negócio (limites por role, year_model >= year_fab)
- [ ] Implementar notificações por email

### Frontend React
- [x] Definir paleta de cores e design system
- [x] Criar layout principal com navegação
- [x] Criar página Home (landing page)
- [x] Criar página de listagem de veículos com filtros
- [x] Criar página de detalhes do veículo
- [ ] Criar formulário de cadastro de anúncio
- [ ] Criar formulário de upload de fotos
- [ ] Criar dashboard do usuário
- [ ] Criar dashboard administrativo
- [ ] Criar sistema de mensagens (chat)
- [ ] Criar página de perfil do usuário
- [ ] Criar página de perfil da loja
- [ ] Criar sistema de avaliações
- [x] Implementar autenticação (login/logout)
- [x] Implementar busca e filtros avançados
- [x] Implementar responsividade mobile
- [x] Implementar estados de loading e error

### Storage & Upload
- [x] Configurar S3 para armazenamento de imagens
- [x] Implementar processamento de imagens (thumbnail, medium, large)
- [ ] Implementar upload múltiplo de fotos (max 15)

## Fase 2: Professional Features

### Lojas e Integração
- [ ] CRUD completo de stores para STORE_OWNER
- [ ] Endpoint de bulk-import para lojas
- [ ] Sistema de API key para integração externa
- [ ] Dashboard de analytics para lojas

### Moderação e Admin
- [ ] Painel administrativo completo
- [ ] Sistema de moderação de anúncios
- [ ] Sistema de moderação de usuários
- [ ] Estatísticas gerais da plataforma

## Fase 3: AI-First & Scale

### Servidor MCP
- [x] Configurar servidor MCP
- [x] Implementar ferramenta estimate_car_value
- [x] Implementar ferramenta generate_ad_copy
- [x] Implementar ferramenta analyze_market_trends

### Features Avançadas
- [ ] Sistema de busca semântica/fuzzy search
- [ ] Notificações push
- [ ] Sistema de favoritos
- [ ] Comparador de veículos
- [ ] Histórico de preços

## Testes e Deploy
- [ ] Criar testes unitários para backend
- [ ] Criar testes de integração
- [ ] Documentação da API (OpenAPI/Swagger)
- [ ] Configurar CI/CD
- [ ] Deploy em produção


## Fase 4: Admin & Moderação (Em Desenvolvimento)

### Painel Administrativo
- [x] Criar página de dashboard admin com estatísticas
- [x] Criar página de moderação de anúncios
- [x] Criar página de gerenciamento de usuários
- [x] Criar página de gerenciamento de lojas
- [ ] Implementar gráficos e visualizações de dados

### Sistema de Moderação
- [x] Implementar aprovação/rejeição de anúncios
- [x] Implementar sistema de banimento de usuários
- [x] Implementar sistema de verificação de lojas
- [x] Implementar logs de moderação
- [ ] Implementar notificações de moderação

### Supabase Storage
- [x] Configurar cliente Supabase
- [x] Criar helper para upload de imagens no Supabase Storage
- [x] Migrar processamento de imagens para Supabase
- [x] Atualizar endpoints de upload para usar Supabase
- [x] Testar upload e download de imagens


## Fase 5: Autenticação e Páginas de Usuário

### Sistema de Autenticação
- [x] Criar página de Login
- [x] Criar página de Cadastro (Sign Up)
- [x] Integrar autenticação Supabase Auth
- [x] Adicionar botões de Login/Cadastro na Home
- [x] Implementar fluxo de logout
- [ ] Adicionar proteção de rotas para páginas autenticadas
- [ ] Implementar recuperação de senha

### Dashboard do Usuário
- [ ] Criar página de perfil do usuário
- [ ] Criar página "Meus Anúncios"
- [ ] Criar página "Minhas Mensagens"
- [ ] Criar página "Favoritos"
- [ ] Implementar edição de perfil

### Formulário de Cadastro de Veículos
- [ ] Criar página de cadastro de veículo
- [ ] Implementar upload de fotos com drag-and-drop
- [ ] Adicionar validações de formulário
- [ ] Implementar preview de fotos antes do upload
- [ ] Adicionar opção de editar anúncio existente
