'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface SubscriptionData {
  user: {
    id: string;
    email: string;
    name: string;
    image: string;
    created_at: string;
    updated_at: string;
  };
  subscription: {
    id: string;
    type: 'FREE' | 'PLUS';
    status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE' | 'UNPAID';
    start_date: string;
    end_date: string | null;
    auto_renew: boolean;
    current_period_start: string | null;
    current_period_end: string | null;
    trial_start: string | null;
    trial_end: string | null;
    cancel_at_period_end: boolean;
    canceled_at: string | null;
  } | null;
  profile: any;
  preferences: any;
  isPlus: boolean;
  isTrial: boolean;
}

export function useSubscription() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    if (!session) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/subscription/status');
      const data = await response.json();

      if (data.success) {
        setSubscriptionData(data);
      } else {
        setError(data.error || 'Erro ao carregar dados da assinatura');
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('Erro interno do servidor');
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (priceId: string) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Erro ao criar sessão de pagamento');
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      toast.error('Erro interno do servidor');
    }
  };

  const createPortalSession = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Erro ao acessar portal de assinatura');
      }
    } catch (err) {
      console.error('Error creating portal session:', err);
      toast.error('Erro interno do servidor');
    }
  };

  const upgradeToPlus = () => {
    createCheckoutSession(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PLUS_MONTHLY || 'price_plus_monthly');
  };

  // Calculate days remaining in trial
  const getTrialDaysRemaining = () => {
    if (!subscriptionData?.subscription?.trial_end) return 0;
    const trialEnd = new Date(subscriptionData.subscription.trial_end);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Check if trial is expiring soon (2 days or less)
  const isTrialExpiringSoon = () => {
    return subscriptionData?.isTrial && getTrialDaysRemaining() <= 2;
  };

  const manageSubscription = () => {
    createPortalSession();
  };

  const cancelSubscription = () => {
    router.push('/subscription/cancel');
  };

  const pauseSubscription = () => {
    router.push('/subscription/pause');
  };

  const upgradeSubscription = () => {
    router.push('/subscription/upgrade');
  };

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      setLoading(false);
      return;
    }

    fetchSubscription();
  }, [session, status]);

  return {
    // Data
    subscriptionData,
    user: subscriptionData?.user,
    subscription: subscriptionData?.subscription,
    profile: subscriptionData?.profile,
    preferences: subscriptionData?.preferences,
    
    // Status
    loading,
    error,
    isPlus: subscriptionData?.isPlus || false,
    isTrial: subscriptionData?.isTrial || false,
    isActive: subscriptionData?.subscription?.status === 'ACTIVE',
    isCancelled: subscriptionData?.subscription?.status === 'CANCELLED',
    isExpired: subscriptionData?.subscription?.status === 'EXPIRED',
    isPastDue: subscriptionData?.subscription?.status === 'PAST_DUE',
    
    // Trial specific
    trialDaysRemaining: getTrialDaysRemaining(),
    isTrialExpiringSoon: isTrialExpiringSoon(),
    trialEndDate: subscriptionData?.subscription?.trial_end,
    
    // Actions
    fetchSubscription,
    upgradeToPlus,
    manageSubscription,
    cancelSubscription,
    pauseSubscription,
    upgradeSubscription,
    createCheckoutSession,
    createPortalSession,
  };
}
