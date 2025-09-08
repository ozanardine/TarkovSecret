# Configuração do Supabase - Secret Tarkov

Este documento contém todas as instruções necessárias para configurar o banco de dados Supabase para o Secret Tarkov.

## 1. Configuração do Projeto Supabase

### 1.1 Criar Projeto
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Escolha sua organização
5. Preencha os dados do projeto:
   - Name: `secret-tarkov`
   - Database Password: (escolha uma senha forte)
   - Region: `South America (São Paulo)` (recomendado para Brasil)

### 1.2 Obter Chaves de API
1. No dashboard do projeto, vá para Settings > API
2. Copie as seguintes chaves:
   - `Project URL` (SUPABASE_URL)
   - `anon public` key (SUPABASE_ANON_KEY)
   - `service_role` key (SUPABASE_SERVICE_ROLE_KEY)

## 2. Configuração do Banco de Dados

### 2.1 Executar SQL de Criação das Tabelas

Execute o seguinte SQL no SQL Editor do Supabase:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_subscriptions table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('FREE', 'PLUS')),
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE', 'CANCELLED', 'EXPIRED', 'PAST_DUE', 'UNPAID')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT false,
  payment_method TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  level INTEGER,
  experience INTEGER,
  favorite_map TEXT,
  main_weapon TEXT,
  play_style TEXT CHECK (play_style IN ('AGGRESSIVE', 'PASSIVE', 'BALANCED', 'SUPPORT')),
  region TEXT,
  timezone TEXT,
  discord_username TEXT,
  twitch_username TEXT,
  youtube_channel TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'DARK' CHECK (theme IN ('DARK', 'LIGHT', 'AUTO')),
  language TEXT DEFAULT 'PT' CHECK (language IN ('PT', 'EN', 'RU', 'ES', 'FR', 'DE')),
  currency TEXT DEFAULT 'BRL' CHECK (currency IN ('RUB', 'USD', 'EUR')),
  notifications JSONB DEFAULT '{}',
  privacy JSONB DEFAULT '{}',
  display JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_stats table
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_logins INTEGER DEFAULT 0,
  last_login TIMESTAMP WITH TIME ZONE,
  total_searches INTEGER DEFAULT 0,
  favorite_items TEXT[] DEFAULT '{}',
  watched_items TEXT[] DEFAULT '{}',
  completed_quests TEXT[] DEFAULT '{}',
  hideout_progress JSONB DEFAULT '{}',
  achievements JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create watchlists table
CREATE TABLE watchlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create watchlist_items table
CREATE TABLE watchlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  watchlist_id UUID REFERENCES watchlists(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  target_price DECIMAL,
  price_direction TEXT CHECK (price_direction IN ('ABOVE', 'BELOW')),
  notify_on_change BOOLEAN DEFAULT false,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  item_data JSONB
);

-- Create price_alerts table
CREATE TABLE price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  target_price DECIMAL NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('ABOVE', 'BELOW', 'EQUAL')),
  is_active BOOLEAN DEFAULT true,
  triggered BOOLEAN DEFAULT false,
  triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_activities table
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('SEARCH', 'VIEW_ITEM', 'ADD_WATCHLIST', 'PRICE_ALERT', 'QUEST_COMPLETE', 'ACHIEVEMENT_UNLOCK')),
  data JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create item_prices table
CREATE TABLE item_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id TEXT NOT NULL,
  price DECIMAL NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('flea', 'trader')),
  currency TEXT NOT NULL CHECK (currency IN ('RUB', 'USD', 'EUR')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  volume INTEGER
);

-- Create user_notifications table
CREATE TABLE user_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('PRICE_ALERT', 'QUEST_UPDATE', 'MARKET_UPDATE', 'NEWS_UPDATE', 'SYSTEM')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stripe_products table
CREATE TABLE stripe_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_product_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stripe_prices table
CREATE TABLE stripe_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_price_id TEXT UNIQUE NOT NULL,
  product_id UUID REFERENCES stripe_products(id) ON DELETE CASCADE,
  unit_amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  recurring_interval TEXT,
  recurring_interval_count INTEGER,
  active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_watchlists_user_id ON watchlists(user_id);
CREATE INDEX idx_watchlist_items_watchlist_id ON watchlist_items(watchlist_id);
CREATE INDEX idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_item_id ON price_alerts(item_id);
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_timestamp ON user_activities(timestamp);
CREATE INDEX idx_item_prices_item_id ON item_prices(item_id);
CREATE INDEX idx_item_prices_timestamp ON item_prices(timestamp);
CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_read ON user_notifications(read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_watchlists_updated_at BEFORE UPDATE ON watchlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stripe_products_updated_at BEFORE UPDATE ON stripe_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stripe_prices_updated_at BEFORE UPDATE ON stripe_prices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2.2 Configurar Row Level Security (RLS)

Execute o seguinte SQL para configurar as políticas de segurança:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- User subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON user_subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- User stats policies
CREATE POLICY "Users can view own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);

-- Watchlists policies
CREATE POLICY "Users can view own watchlists" ON watchlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own watchlists" ON watchlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own watchlists" ON watchlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own watchlists" ON watchlists FOR DELETE USING (auth.uid() = user_id);

-- Watchlist items policies
CREATE POLICY "Users can view own watchlist items" ON watchlist_items FOR SELECT USING (
  watchlist_id IN (SELECT id FROM watchlists WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert own watchlist items" ON watchlist_items FOR INSERT WITH CHECK (
  watchlist_id IN (SELECT id FROM watchlists WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update own watchlist items" ON watchlist_items FOR UPDATE USING (
  watchlist_id IN (SELECT id FROM watchlists WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete own watchlist items" ON watchlist_items FOR DELETE USING (
  watchlist_id IN (SELECT id FROM watchlists WHERE user_id = auth.uid())
);

-- Price alerts policies
CREATE POLICY "Users can view own price alerts" ON price_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own price alerts" ON price_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own price alerts" ON price_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own price alerts" ON price_alerts FOR DELETE USING (auth.uid() = user_id);

-- User activities policies
CREATE POLICY "Users can view own activities" ON user_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User notifications policies
CREATE POLICY "Users can view own notifications" ON user_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON user_notifications FOR UPDATE USING (auth.uid() = user_id);

-- Public tables (no RLS needed)
-- item_prices, stripe_products, stripe_prices are public
```

## 3. Configuração da Autenticação

### 3.1 Configurar Google OAuth
1. Vá para Authentication > Providers no dashboard do Supabase
2. Ative o Google provider
3. Configure as credenciais do Google OAuth:
   - Client ID: (obtenha do Google Cloud Console)
   - Client Secret: (obtenha do Google Cloud Console)

### 3.2 Configurar Google Cloud Console
1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Ative a Google+ API
4. Vá para Credentials > Create Credentials > OAuth 2.0 Client ID
5. Configure:
   - Application type: Web application
   - Authorized redirect URIs: `https://your-project-ref.supabase.co/auth/v1/callback`
6. Copie o Client ID e Client Secret

## 4. Configuração do Stripe

### 4.1 Criar Conta Stripe
1. Acesse [stripe.com](https://stripe.com)
2. Crie uma conta ou faça login
3. Complete a configuração da conta

### 4.2 Criar Produtos e Preços
1. No dashboard do Stripe, vá para Products
2. Crie um novo produto:
   - Name: `Secret Tarkov PLUS`
   - Description: `Ferramentas avançadas para Escape from Tarkov`
3. Adicione preços:
   - Monthly: R$ 19,90/mês
   - Yearly: R$ 199,00/ano
4. Copie os Price IDs

### 4.3 Configurar Webhooks
1. Vá para Developers > Webhooks
2. Adicione endpoint: `https://your-domain.com/api/stripe/webhooks`
3. Selecione os eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copie o webhook secret

## 5. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Stripe Product and Price IDs
STRIPE_PRODUCT_ID_PLUS=prod_plus
STRIPE_PRICE_ID_PLUS_MONTHLY=price_plus_monthly
STRIPE_PRICE_ID_PLUS_YEARLY=price_plus_yearly
```

## 6. Testando a Configuração

### 6.1 Testar Conexão com Supabase
```bash
npm run dev
```
Acesse `http://localhost:3000` e verifique se não há erros no console.

### 6.2 Testar Autenticação Google
1. Clique em "Entrar"
2. Selecione "Continuar com Google"
3. Complete o login
4. Verifique se o usuário foi criado no Supabase

### 6.3 Testar Assinatura Stripe
1. Faça login
2. Vá para `/subscription`
3. Clique em "Assinar PLUS"
4. Complete o processo de pagamento
5. Verifique se a assinatura foi criada no Supabase

## 7. Monitoramento

### 7.1 Logs do Supabase
- Vá para Logs no dashboard do Supabase
- Monitore erros de autenticação e banco de dados

### 7.2 Logs do Stripe
- Vá para Developers > Logs no dashboard do Stripe
- Monitore webhooks e transações

### 7.3 Logs da Aplicação
- Monitore o console do navegador
- Monitore os logs do servidor Next.js

## 8. Troubleshooting

### 8.1 Problemas de Autenticação
- Verifique se as credenciais do Google estão corretas
- Verifique se o redirect URI está configurado corretamente
- Verifique se o NEXTAUTH_SECRET está definido

### 8.2 Problemas de Banco de Dados
- Verifique se as políticas RLS estão configuradas corretamente
- Verifique se as tabelas foram criadas
- Verifique se as chaves do Supabase estão corretas

### 8.3 Problemas do Stripe
- Verifique se as chaves do Stripe estão corretas
- Verifique se os webhooks estão configurados
- Verifique se os Price IDs estão corretos

## 9. Próximos Passos

Após a configuração completa:
1. Teste todas as funcionalidades
2. Configure monitoramento e alertas
3. Configure backup do banco de dados
4. Configure CDN para assets estáticos
5. Configure SSL/TLS
6. Configure domínio personalizado
7. Configure analytics e métricas
8. Configure testes automatizados
9. Configure CI/CD
10. Configure monitoramento de performance
