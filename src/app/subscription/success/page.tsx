'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import TrialStatus from '@/components/subscription/TrialStatus';
import { CheckIcon, StarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function SubscriptionSuccessContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Check if this is a successful checkout
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      router.push('/subscription');
      return;
    }

    // Fetch subscription status
    fetchSubscriptionStatus();
  }, [session, status, router, searchParams]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      const data = await response.json();
      
      if (data.success) {
        setSubscription(data);
      } else {
        toast.error('Erro ao carregar informações da assinatura');
        router.push('/subscription');
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      toast.error('Erro interno do servidor');
      router.push('/subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao acessar portal de assinatura');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  // Calculate days remaining for trial
  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-tarkov-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-tarkov-gold"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isPlus = subscription?.subscription?.type === 'PLUS';
  const isTrial = subscription?.isTrial;

  return (
    <div className="min-h-screen bg-tarkov-dark py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-600 mb-6">
            <CheckIcon className="h-8 w-8 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            {isTrial ? 'Período de Teste Iniciado!' : 'Assinatura Confirmada!'}
          </h1>
          
          <p className="text-xl text-gray-300 mb-8">
            {isTrial 
              ? 'Bem-vindo ao Secret Tarkov PLUS! Aproveite seus 7 dias de teste gratuito.'
              : 'Obrigado por se tornar um membro PLUS! Sua assinatura está ativa.'
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push('/dashboard')}
            className="bg-tarkov-gold hover:bg-tarkov-gold/90 text-black px-8 py-3"
          >
            Ir para o Dashboard
          </Button>
          
          <Button
            onClick={() => router.push('/subscription')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3"
          >
            Gerenciar Assinatura
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-tarkov-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-tarkov-gold"></div>
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
