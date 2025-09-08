import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';

// Subscription pause management for PLUS users
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Get user and subscription data
    const { data: user } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        user_subscriptions!inner(
          id,
          type,
          status,
          stripe_subscription_id,
          current_period_end,
          pause_collection
        )
      `)
      .eq('email', session.user.email)
      .eq('user_subscriptions.type', 'PLUS')
      .single();

    if (!user || !user.user_subscriptions?.[0]) {
      return NextResponse.json(
        { error: 'Assinatura PLUS não encontrada' },
        { status: 404 }
      );
    }

    const subscription = user.user_subscriptions[0];

    if (subscription.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Apenas assinaturas ativas podem ser pausadas' },
        { status: 400 }
      );
    }

    const { pauseDuration, reason } = await request.json();

    if (!pauseDuration || !['1_month', '2_months', '3_months'].includes(pauseDuration)) {
      return NextResponse.json(
        { error: 'Duração de pausa inválida. Use: 1_month, 2_months ou 3_months' },
        { status: 400 }
      );
    }

    // Check if subscription is already paused
    if (subscription.pause_collection) {
      return NextResponse.json(
        { error: 'Assinatura já está pausada' },
        { status: 400 }
      );
    }

    // Calculate pause end date
    const pauseEndDate = new Date();
    switch (pauseDuration) {
      case '1_month':
        pauseEndDate.setMonth(pauseEndDate.getMonth() + 1);
        break;
      case '2_months':
        pauseEndDate.setMonth(pauseEndDate.getMonth() + 2);
        break;
      case '3_months':
        pauseEndDate.setMonth(pauseEndDate.getMonth() + 3);
        break;
    }

    // Pause subscription in Stripe
    if (subscription.stripe_subscription_id) {
      try {
        await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          pause_collection: {
            behavior: 'void',
            resumes_at: Math.floor(pauseEndDate.getTime() / 1000)
          }
        });
      } catch (stripeError) {
        console.error('Erro ao pausar assinatura no Stripe:', stripeError);
        return NextResponse.json(
          { error: 'Erro ao pausar assinatura no sistema de pagamento' },
          { status: 500 }
        );
      }
    }

    // Update subscription in database
    const { data: updatedSubscription, error } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        status: 'PAUSED',
        pause_collection: {
          behavior: 'void',
          resumes_at: pauseEndDate.toISOString(),
          paused_at: new Date().toISOString(),
          reason: reason || 'User requested pause'
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log the pause action
    await supabaseAdmin
      .from('subscription_events')
      .insert({
        user_id: user.id,
        subscription_id: subscription.id,
        event_type: 'PAUSED',
        event_data: {
          duration: pauseDuration,
          reason: reason || 'User requested pause',
          resumes_at: pauseEndDate.toISOString()
        },
        created_at: new Date().toISOString()
      });

    // Log API usage
    await supabaseAdmin
      .from('api_usage')
      .insert({
        user_id: user.id,
        endpoint: '/api/plus/subscription/pause',
        method: 'POST',
        query_params: JSON.stringify({ pauseDuration, reason }),
        response_size: JSON.stringify(updatedSubscription).length,
        created_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      data: {
        subscription: updatedSubscription,
        pauseDetails: {
          pausedAt: new Date().toISOString(),
          resumesAt: pauseEndDate.toISOString(),
          duration: pauseDuration,
          reason: reason || 'User requested pause'
        }
      },
      message: `Assinatura pausada com sucesso. Será reativada em ${pauseEndDate.toLocaleDateString('pt-BR')}`
    });
    
  } catch (error) {
    console.error('Erro ao pausar assinatura:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

// Resume paused subscription
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Get user and subscription data
    const { data: user } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        user_subscriptions!inner(
          id,
          type,
          status,
          stripe_subscription_id,
          pause_collection
        )
      `)
      .eq('email', session.user.email)
      .eq('user_subscriptions.type', 'PLUS')
      .single();

    if (!user || !user.user_subscriptions?.[0]) {
      return NextResponse.json(
        { error: 'Assinatura PLUS não encontrada' },
        { status: 404 }
      );
    }

    const subscription = user.user_subscriptions[0];

    if (subscription.status !== 'PAUSED') {
      return NextResponse.json(
        { error: 'Assinatura não está pausada' },
        { status: 400 }
      );
    }

    // Resume subscription in Stripe
    if (subscription.stripe_subscription_id) {
      try {
        await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          pause_collection: null
        });
      } catch (stripeError) {
        console.error('Erro ao reativar assinatura no Stripe:', stripeError);
        return NextResponse.json(
          { error: 'Erro ao reativar assinatura no sistema de pagamento' },
          { status: 500 }
        );
      }
    }

    // Update subscription in database
    const { data: updatedSubscription, error } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        status: 'ACTIVE',
        pause_collection: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log the resume action
    await supabaseAdmin
      .from('subscription_events')
      .insert({
        user_id: user.id,
        subscription_id: subscription.id,
        event_type: 'RESUMED',
        event_data: {
          resumed_at: new Date().toISOString(),
          resumed_early: true
        },
        created_at: new Date().toISOString()
      });

    // Log API usage
    await supabaseAdmin
      .from('api_usage')
      .insert({
        user_id: user.id,
        endpoint: '/api/plus/subscription/pause',
        method: 'PUT',
        query_params: JSON.stringify({}),
        response_size: JSON.stringify(updatedSubscription).length,
        created_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      data: {
        subscription: updatedSubscription,
        resumeDetails: {
          resumedAt: new Date().toISOString(),
          resumedEarly: true
        }
      },
      message: 'Assinatura reativada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao reativar assinatura:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

// Get pause status and options
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Get user and subscription data
    const { data: user } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        user_subscriptions!inner(
          id,
          type,
          status,
          pause_collection,
          created_at
        )
      `)
      .eq('email', session.user.email)
      .eq('user_subscriptions.type', 'PLUS')
      .single();

    if (!user || !user.user_subscriptions?.[0]) {
      return NextResponse.json(
        { error: 'Assinatura PLUS não encontrada' },
        { status: 404 }
      );
    }

    const subscription = user.user_subscriptions[0];

    // Check pause eligibility
    const subscriptionAge = new Date().getTime() - new Date(subscription.created_at).getTime();
    const minAgeForPause = 30 * 24 * 60 * 60 * 1000; // 30 days
    const canPause = subscriptionAge >= minAgeForPause && subscription.status === 'ACTIVE';

    // Get pause history
    const { data: pauseHistory } = await supabaseAdmin
      .from('subscription_events')
      .select('*')
      .eq('user_id', user.id)
      .eq('subscription_id', subscription.id)
      .in('event_type', ['PAUSED', 'RESUMED'])
      .order('created_at', { ascending: false })
      .limit(10);

    const pauseOptions = {
      canPause,
      currentStatus: subscription.status,
      pauseCollection: subscription.pause_collection,
      availableDurations: [
        {
          id: '1_month',
          name: '1 Mês',
          description: 'Pausar por 1 mês'
        },
        {
          id: '2_months',
          name: '2 Meses',
          description: 'Pausar por 2 meses'
        },
        {
          id: '3_months',
          name: '3 Meses',
          description: 'Pausar por 3 meses'
        }
      ],
      restrictions: {
        minSubscriptionAge: '30 dias',
        maxPausesPerYear: 2,
        maxPauseDuration: '3 meses'
      },
      pauseHistory: pauseHistory || []
    };

    return NextResponse.json({
      success: true,
      data: pauseOptions
    });
    
  } catch (error) {
    console.error('Erro ao obter opções de pausa:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}