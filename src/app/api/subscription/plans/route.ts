import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Dados mock para quando o Supabase não estiver disponível
const mockPlans = [
  {
    id: 'free-plan',
    name: 'Free',
    description: 'Acesso básico ao aplicativo',
    price: {
      monthly: 0.00,
      yearly: 0.00,
    },
    stripe: {
      priceIdMonthly: null,
      priceIdYearly: null,
    },
    isPopular: false,
    features: [
      {
        key: 'basic_search',
        title: 'Busca básica de itens',
        description: 'Pesquise itens do jogo com filtros básicos',
      },
      {
        key: 'basic_quests',
        title: 'Visualização de quests',
        description: 'Veja informações básicas das quests',
      },
      {
        key: 'basic_ammo',
        title: 'Informações de munição',
        description: 'Dados básicos sobre munições',
      },
    ],
  },
  {
    id: 'secret-plus-plan',
    name: 'Secret Plus',
    description: 'Recursos avançados para jogadores sérios',
    price: {
      monthly: 9.99,
      yearly: 99.99,
    },
    stripe: {
      priceIdMonthly: 'price_monthly_plus',
      priceIdYearly: 'price_yearly_plus',
    },
    isPopular: true,
    features: [
      {
        key: 'advanced_search',
        title: 'Busca avançada',
        description: 'Filtros avançados e busca inteligente',
      },
      {
        key: 'price_alerts',
        title: 'Alertas de preço',
        description: 'Receba notificações quando preços mudarem',
      },
      {
        key: 'analytics',
        title: 'Analytics avançados',
        description: 'Gráficos e estatísticas detalhadas',
      },
      {
        key: 'export_data',
        title: 'Exportar dados',
        description: 'Exporte suas listas e dados',
      },
      {
        key: 'coupons',
        title: 'Cupons de desconto',
        description: 'Acesso a cupons exclusivos',
      },
      {
        key: 'priority_support',
        title: 'Suporte prioritário',
        description: 'Atendimento prioritário via chat',
      },
      {
        key: 'ad_free',
        title: 'Experiência sem anúncios',
        description: 'Navegue sem interrupções',
      },
    ],
  },
];

export async function GET() {
  try {
    // Verificar se as variáveis de ambiente do Supabase estão configuradas
    const hasSupabaseConfig = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                             process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://temp.supabase.co';

    if (!hasSupabaseConfig) {
      console.log('Supabase não configurado, retornando dados mock');
      return NextResponse.json({ plans: mockPlans });
    }

    // Buscar planos ativos com suas features
    const { data: plans, error: plansError } = await supabaseAdmin
      .from('subscription_plans')
      .select(`
        id,
        name,
        description,
        price_monthly,
        price_yearly,
        stripe_price_id_monthly,
        stripe_price_id_yearly,
        is_popular,
        sort_order,
        subscription_features (
          id,
          feature_key,
          feature_title,
          feature_description,
          is_included,
          sort_order
        )
      `)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (plansError) {
      console.error('Erro ao buscar planos:', plansError);
      console.log('Retornando dados mock devido ao erro do Supabase');
      return NextResponse.json({ plans: mockPlans });
    }

    // Se não há planos no banco, retornar dados mock
    if (!plans || plans.length === 0) {
      console.log('Nenhum plano encontrado no banco, retornando dados mock');
      return NextResponse.json({ plans: mockPlans });
    }

    // Organizar os dados para retorno
    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: {
        monthly: plan.price_monthly,
        yearly: plan.price_yearly,
      },
      stripe: {
        priceIdMonthly: plan.stripe_price_id_monthly,
        priceIdYearly: plan.stripe_price_id_yearly,
      },
      isPopular: plan.is_popular,
      features: plan.subscription_features
        ?.filter(feature => feature.is_included)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(feature => ({
          key: feature.feature_key,
          title: feature.feature_title,
          description: feature.feature_description,
        })) || [],
    }));

    return NextResponse.json({ plans: formattedPlans });
  } catch (error) {
    console.error('Erro na API de planos:', error);
    console.log('Retornando dados mock devido ao erro');
    return NextResponse.json({ plans: mockPlans });
  }
}
