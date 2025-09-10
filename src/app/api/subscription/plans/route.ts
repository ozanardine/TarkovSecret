import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createClient();

    // Buscar planos ativos com suas features
    const { data: plans, error: plansError } = await supabase
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
      return NextResponse.json(
        { error: 'Erro ao buscar planos de subscription' },
        { status: 500 }
      );
    }

    // Organizar os dados para retorno
    const formattedPlans = plans?.map(plan => ({
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
    })) || [];

    return NextResponse.json({ plans: formattedPlans });
  } catch (error) {
    console.error('Erro na API de planos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
