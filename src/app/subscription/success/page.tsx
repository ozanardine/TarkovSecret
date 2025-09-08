'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import TrialStatus from '@/components/subscription/TrialStatus';
import { CheckIcon, StarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SubscriptionSuccessPage() {
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
        setLoading(false);
      } else {
        toast.error('Erro ao carregar informações da assinatura');
        router.push('/subscription');
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      toast.error('Erro interno do servidor');
      router.push('/subscription');
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

        {/* Trial Status */}
        {isTrial && subscription?.subscription?.current_period_end && (
          <div className="mb-8">
            <TrialStatus
              trialEnd={subscription.subscription.current_period_end}
              daysRemaining={calculateDaysRemaining(subscription.subscription.current_period_end)}
              onManageSubscription={handleManageSubscription}
            />
          </div>
        )}

        {/* Subscription Details */
        <Card className="bg-tarkov-card border-tarkov-gold/20 mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <StarIcon className="h-8 w-8 text-tarkov-gold mr-3" />
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Secret Tarkov PLUS
                  </h2>
                  <p className="text-gray-300">
                    {isTrial ? 'Período de teste ativo' : 'Assinatura ativa'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Status</p>
                <p className="text-lg font-semibold text-green-400">
                  {subscription?.subscription?.status}
                </p>
              </div>
            </div>

            {subscription?.subscription && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Data de início</p>
                  <p className="text-white font-medium">
                    {new Date(subscription.subscription.start_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">
                    {isTrial ? 'Fim do período de teste' : 'Próxima cobrança'}
                  </p>
                  <p className="text-white font-medium">
                    {subscription.subscription.current_period_end 
                      ? new Date(subscription.subscription.current_period_end).toLocaleDateString('pt-BR')
                      : 'N/A'
                    }
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Renovação automática</p>
                  <p className="text-white font-medium">
                    {subscription.subscription.auto_renew ? 'Ativada' : 'Desativada'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Features Unlocked */}
        <Card className="bg-tarkov-card mb-8">
          <div className="p-8">
            <h3 className="text-xl font-bold text-white mb-6">
              Funcionalidades Desbloqueadas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Lista de favoritos ilimitada',
                'Alertas de preço avançados',
                'Análise de mercado em tempo real',
                'Calculadora de dano avançada',
                'Estatísticas detalhadas',
                'Exportação de dados',
                'Suporte prioritário',
                'Acesso antecipado a novas funcionalidades',
                'API personalizada',
                'Análise de tendências de preços',
              ].map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-tarkov-gold mr-3 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="bg-tarkov-card mb-8">
          <div className="p-8">
            <h3 className="text-xl font-bold text-white mb-6">
              Próximos Passos
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-tarkov-gold text-black font-bold text-sm">
                    1
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-white">
                    Explore o Dashboard
                  </h4>
                  <p className="text-gray-300">
                    Acesse seu dashboard personalizado para começar a usar todas as funcionalidades PLUS.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-tarkov-gold text-black font-bold text-sm">
                    2
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-white">
                    Configure suas Preferências
                  </h4>
                  <p className="text-gray-300">
                    Personalize alertas, notificações e configurações de exibição.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-tarkov-gold text-black font-bold text-sm">
                    3
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-white">
                    Crie suas Listas de Favoritos
                  </h4>
                  <p className="text-gray-300">
                    Adicione itens ilimitados às suas listas de favoritos e configure alertas de preço.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

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

        {/* Support */}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">
            Precisa de ajuda? Nossa equipe de suporte está aqui para você.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.open('mailto:support@secret-tarkov.com', '_blank')}
              className="bg-transparent border border-gray-600 hover:border-tarkov-gold text-tarkov-gold hover:text-white px-6 py-2"
            >
              Enviar Email
            </Button>
            
            <Button
              onClick={() => window.open('https://discord.gg/secret-tarkov', '_blank')}
              className="bg-transparent border border-gray-600 hover:border-tarkov-gold text-tarkov-gold hover:text-white px-6 py-2"
            >
              Discord
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
