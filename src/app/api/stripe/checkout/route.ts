import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripeApi, STRIPE_CONFIG } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const { priceId, successUrl, cancelUrl } = await request.json();

    if (!priceId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Validate price ID
    const validPriceIds = Object.values(STRIPE_CONFIG.PRICES);
    if (!validPriceIds.includes(priceId)) {
      return NextResponse.json(
        { error: 'ID de preço inválido' },
        { status: 400 }
      );
    }

    // Get user from database
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Check if user already has an active subscription
    const { data: existingSubscription } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'ACTIVE')
      .single();

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Usuário já possui uma assinatura ativa' },
        { status: 400 }
      );
    }

    // Check trial eligibility
    const { data: subscriptionHistory } = await supabaseAdmin
      .from('user_subscriptions')
      .select('id, type, trial_start, trial_end')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const hasHadSubscription = subscriptionHistory && subscriptionHistory.length > 0;
    const hasUsedTrial = subscriptionHistory?.some(sub => sub.trial_start !== null);
    const isTrialEligible = !hasHadSubscription || !hasUsedTrial;

    // Create or get Stripe customer
    const customer = await stripeApi.createOrGetCustomer(
      user.email,
      user.name,
      user.id
    );

    // Create checkout session with trial if eligible
    const checkoutSession = await stripeApi.createCheckoutSession({
      customerId: customer.id,
      priceId,
      successUrl,
      cancelUrl,
      trialPeriodDays: isTrialEligible ? 7 : undefined,
    });

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
