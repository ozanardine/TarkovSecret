import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, authOptions } from '@/lib/auth';
import { stripeApi } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const { returnUrl } = await request.json();

    if (!returnUrl) {
      return NextResponse.json(
        { error: 'URL de retorno obrigatória' },
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

    // Get user's Stripe customer ID
    const { data: subscription } = await supabaseAdmin
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .not('stripe_customer_id', 'is', null)
      .single();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Usuário não possui assinatura Stripe' },
        { status: 404 }
      );
    }

    // Create portal session
    const portalSession = await stripeApi.createPortalSession(
      subscription.stripe_customer_id,
      returnUrl
    );

    return NextResponse.json({
      success: true,
      url: portalSession.url,
    });

  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
