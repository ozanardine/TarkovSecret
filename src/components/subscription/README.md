# Componentes de Subscription

Este diretório contém todos os componentes relacionados à funcionalidade de subscription do Secret Tarkov.

## Estrutura

### Componentes

- **PlanCard**: Card individual para cada plano de subscription
- **BillingIntervalSelector**: Seletor de intervalo de cobrança (mensal/anual)
- **FeaturesComparison**: Tabela comparativa de recursos entre planos

### Hooks

- **useSubscriptionPlans**: Hook para buscar planos do banco de dados
- **useCheckout**: Hook para gerenciar checkout com Stripe

### Tipos

- **SubscriptionPlan**: Interface para planos de subscription
- **SubscriptionFeature**: Interface para features dos planos
- **BillingInterval**: Tipo para intervalos de cobrança

## Como usar

### 1. Página de Subscription

A página `/subscription` é pública e pode ser acessada por qualquer usuário, logado ou não.

```tsx
// A página carrega automaticamente os planos do banco de dados
// e permite visualização sem necessidade de login
```

### 2. Gerenciamento de Planos

Os planos são gerenciados diretamente no banco de dados Supabase através das tabelas:
- `subscription_plans`: Planos principais
- `subscription_features`: Features de cada plano

### 3. Checkout

Quando um usuário não logado tenta assinar:
1. É redirecionado para `/auth/signin`
2. Após login, é redirecionado para o checkout do Stripe

Quando um usuário logado assina:
1. É redirecionado diretamente para o checkout do Stripe

## Configuração do Banco de Dados

Execute a migration `20250108000003_subscription_plans.sql` para criar as tabelas necessárias.

## Planos Disponíveis

### Free
- Acesso básico ao aplicativo
- Busca básica de itens
- Visualização de quests
- Informações de munição

### Secret Plus
- Todos os recursos do Free
- Busca avançada
- Alertas de preço
- Analytics avançados
- Exportar dados
- Cupons de desconto
- Suporte prioritário

## Preços

Os preços são configurados no banco de dados e podem ser alterados sem necessidade de deploy:

- **Free**: R$ 0,00
- **Secret Plus**: R$ 9,99/mês ou R$ 99,99/ano

## Integração com Stripe

Os planos são integrados com o Stripe através dos campos:
- `stripe_price_id_monthly`: ID do preço mensal no Stripe
- `stripe_price_id_yearly`: ID do preço anual no Stripe

## Personalização

Para adicionar novos planos ou modificar features:

1. Adicione o plano na tabela `subscription_plans`
2. Adicione as features na tabela `subscription_features`
3. Configure os preços no Stripe
4. Atualize os IDs dos preços no banco de dados

A página será atualizada automaticamente sem necessidade de alterações no código.
