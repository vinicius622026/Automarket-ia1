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
- [x] Criar trigger para search_vector (busca textual)
- [x] Implementar políticas RLS (Row Level Security)

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
- [x] Implementar endpoints de reviews (avalia- [x] Implementar endpoints de integração (bulk-import)
- [x] Implementar notificações por email(moderação, dashboard)
- [x] Implementar validações de negócio (limites por role, year_model >= year_fab)
- [ ] Implementar notificações por email

### Frontend React
- [x] Definir paleta de cores e design system
- [x] Criar layout principal com navegação
- [x] Criar página Home (landing page)
- [x] Criar página de listagem de veículos com filtros
- [x] Criar página de detalhes do veículo
- [x] Criar formulário de cadastro de anúncio
- [x] Criar formulário de upload de fotos
- [x] Criar dashboard do usuário
- [x] Criar dashboard administrativo
- [x] Criar sistema de mensagens (chat)
- [x] Criar página de perfil do usuário
- [x] Criar página de perfil da loja
- [x] Criar sistema de avaliações
- [x] Implementar autenticação (login/logout)
- [x] Implementar busca e filtros avançados
- [x] Implementar responsividade mobile
- [x] Implementar estados de loading e error

### Storage & Upload
- [x] Configurar S3 para armazenamento de imagens
- [x] Implementar processamento de imagens (thumbnail, medium, large)
- [x] Implementar upload múltiplo de fotos (max 15)

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


## Fase 6: Completar Frontend

### Páginas Principais
- [x] Corrigir botões Login/Cadastro na Home
- [x] Criar Dashboard do Usuário com visão geral
- [x] Criar página "Meus Anúncios" com listagem e ações
- [ ] Criar página "Favoritos"
- [ ] Criar página de Perfil do Usuário
- [x] Adicionar navegação entre páginas autenticadas

### Formulário de Veículos
- [x] Criar página de cadastro de veículo (/cars/new)
- [x] Implementar upload de múltiplas fotos
- [x] Adicionar preview de fotos
- [x] Implementar validações do formulário
- [ ] Adicionar página de edição de veículo (/cars/:id/edit)

### Melhorias de UX
- [x] Adicionar loading states em todas as páginas
- [x] Implementar mensagens de erro amigáveis
- [x] Adicionar confirmações para ações destrutivas
- [x] Melhorar responsividade mobile


## Fase 7: Correções de Autenticação
- [x] Corrigir conflito entre Manus OAuth e Supabase Auth
- [x] Fazer botões Login/Cadastro aparecerem quando usuário não autenticado
- [x] Garantir que auth.me retorne null quando não há sessão Supabase


## Fase 8: Funcionalidades Restantes do Frontend

### Sistema de Mensagens
- [x] Criar backend de mensagens (endpoints CRUD)
- [x] Criar página de chat/mensagens
- [x] Implementar listagem de conversas
- [x] Implementar envio e recebimento de mensagens
- [ ] Adicionar notificações de novas mensagens

### Perfil de Usuário
- [x] Criar página de perfil do usuário
- [x] Implementar edição de dados pessoais
- [ ] Implementar upload de avatar
- [x] Adicionar edição de telefone e localização

### Perfil de Loja
- [x] Criar página de perfil da loja
- [x] Implementar visualização pública da loja
- [ ] Implementar edição de dados da loja (apenas owner)
- [x] Adicionar listagem de veículos da loja

### Sistema de Avaliações
- [x] Criar backend de reviews (endpoints CRUD)
- [x] Implementar formulário de avaliação
- [x] Exibir avaliações na página do vendedor/loja
- [x] Calcular e exibir média de avaliações
- [ ] Adicionar filtros e ordenação de reviews


## Fase 9: Completar Itens Pendentes da Fase 1

### Database & Schema
- [x] Implementar trigger para search_vector (busca textual)
- [x] Implementar políticas RLS (Row Level Security)

### Backend API
- [x] Implementar endpoint de bulk-import para lojas
- [x] Implementar sistema de notificações por email


## Fase 10: Correções de Bugs

### HTML/React
- [x] Corrigir TODOS os erros de nested anchor tags

- [x] Corrigir erro 503 Service Unavailable na autenticação Supabase

- [x] Atualizar drop_all_tables.sql para incluir schema completo existente no Supabase

- [x] Corrigir scripts SQL para sintaxe PostgreSQL (remover backticks, ajustar tipos)

- [x] Corrigir erro JSONB no trigger search_vector (add_search_and_rls.sql)

- [x] Corrigir nomes de colunas (snake_case → camelCase) em add_search_and_rls.sql

- [x] Corrigir ordem de execução SQL (mover funções helper antes das políticas RLS)

- [x] Criar checkpoint do projeto
- [ ] Fazer commit e push para GitHub (https://github.com/AdrianoGouveia/Automarket)


## Fase 11: Completar Fase 2 (20% restante)

### Sistema de API Key
- [x] Criar middleware validateApiKey no backend
- [x] Adicionar validação de API key nos endpoints de integração
- [x] Documentar uso da API key para lojas

### Dashboard de Analytics para Lojas
- [x] Criar página /store/analytics
- [x] Implementar métricas: visualizações, leads, mensagens recebidas
- [x] Adicionar gráficos de tendências (últimos 30 dias)
- [x] Mostrar veículos mais visualizados

### Gráficos no Admin Dashboard
- [x] Instalar biblioteca de gráficos (Recharts)
- [x] Adicionar gráfico de novos usuários por dia
- [x] Adicionar gráfico de anúncios criados por dia
- [x] Adicionar gráfico de distribuição por marca/modelo


## Fase 12: Correção de Deploy no Vercel
- [x] Corrigir vercel.json para projeto Express + tRPC
- [x] Adicionar favicon.svg
- [ ] Testar deploy no Vercel
