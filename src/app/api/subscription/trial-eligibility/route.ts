import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
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

    // Check if user has ever had a subscription
    const { data: subscriptionHistory } = await supabaseAdmin
      .from('user_subscriptions')
      .select('id, type, trial_start, trial_end')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // User is eligible for trial if:
    // 1. Never had any subscription
    // 2. Never used a trial period before
    const hasHadSubscription = subscriptionHistory && subscriptionHistory.length > 0;
    const hasUsedTrial = subscriptionHistory?.some(sub => sub.trial_start !== null);
    
    const isEligible = !hasHadSubscription || !hasUsedTrial;

    return NextResponse.json({
      success: true,
      isEligible,
      reason: !isEligible 
        ? hasUsedTrial 
          ? 'Usuário já utilizou o período de teste'
          : 'Usuário já teve uma assinatura'
        : 'Usuário elegível para período de teste',
      trialDays: 7,
    });

  } catch (error) {
    console.error('Error checking trial eligibility:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}