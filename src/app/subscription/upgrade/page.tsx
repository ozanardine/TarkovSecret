'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheckIcon, StarIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { stripeHelpers, STRIPE_CONFIG } from '@/lib/stripe';
import toast from 'react-hot-toast';

export default function UpgradePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userSubscription, setUserSubscription] = useState<any>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchSubscriptionStatus();
  }, [session, status, router]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      const data = await response.json();
      
      if (data.success) {
        setUserSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  const handleUpgrade = async (priceId: string) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription/upgrade`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Erro ao criar sessão de pagamento');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Erro interno do servidor');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-tarkov-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-tarkov-gold"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isPlus = userSubscription?.subscription?.type === 'PLUS';

  if (isPlus) {
    return (
      <div className="min-h-screen bg-tarkov-dark py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Você já é PLUS!
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Você já possui uma assinatura PLUS ativa.
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-tarkov-gold hover:bg-tarkov-gold/90 text-black px-8 py-3"
            >
              Ir para o Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const plusFeatures = [
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
  ];

  const currentFeatures = [
    'Acesso a todos os itens do jogo',
    'Calculadora de dano básica',
    'Lista de favoritos (até 10 itens)',
    'Alertas de preço básicos',
    'Suporte por email',
  ];

  return (
    <div className="min-h-screen bg-tarkov-dark py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">
            Faça Upgrade para PLUS
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Desbloqueie todo o potencial do Secret Tarkov
          </p>
        </div>

        {/* Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Current Plan */}
          <Card className="bg-tarkov-card border-gray-700">
            <div className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Plano Atual
                </h3>
                <p className="text-gray-300 mb-4">
                  Gratuito
                </p>
                <div className="text-3xl font-bold text-white">
                  R$ 0
                  <span className="text-gray-400 text-lg">/mês</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {currentFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="text-center">
                <Badge className="bg-gray-600 text-white">
                  Plano Atual
                </Badge>
              </div>
            </div>
          </Card>

          {/* Plus Plan */}
          <Card className="bg-tarkov-card border-tarkov-gold bg-tarkov-card/50 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-tarkov-gold text-black px-4 py-1">
                <StarIcon className="w-4 h-4 mr-1" />
                Recomendado
              </Badge>
            </div>

            <div className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Secret Tarkov PLUS
                </h3>
                <p className="text-gray-300 mb-4">
                  Ferramentas avançadas para dominar o mercado
                </p>
                <div className="text-3xl font-bold text-white">
                  R$ 19,90
                  <span className="text-gray-400 text-lg">/mês</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  7 dias de teste gratuito
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plusFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-tarkov-gold mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleUpgrade(STRIPE_CONFIG.PRICES.PLUS_MONTHLY)}
                disabled={loading}
                className="w-full bg-tarkov-gold hover:bg-tarkov-gold/90 text-black"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                ) : (
                  <>
                    Fazer Upgrade Agora
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Por que fazer upgrade?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-tarkov-card text-center">
              <div className="p-6">
                <div className="w-16 h-16 bg-tarkov-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <StarIcon className="w-8 h-8 text-tarkov-gold" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Funcionalidades Avançadas
                </h3>
                <p className="text-gray-300">
                  Acesse ferramentas exclusivas como análise de mercado em tempo real e estatísticas detalhadas.
                </p>
              </div>
            </Card>

            <Card className="bg-tarkov-card text-center">
              <div className="p-6">
                <div className="w-16 h-16 bg-tarkov-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckIcon className="w-8 h-8 text-tarkov-gold" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Sem Limitações
                </h3>
                <p className="text-gray-300">
                  Listas de favoritos ilimitadas, alertas avançados e muito mais sem restrições.
                </p>
              </div>
            </Card>

            <Card className="bg-tarkov-card text-center">
              <div className="p-6">
                <div className="w-16 h-16 bg-tarkov-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowRightIcon className="w-8 h-8 text-tarkov-gold" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Suporte Prioritário
                </h3>
                <p className="text-gray-300">
                  Receba suporte prioritário e acesso antecipado a novas funcionalidades.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Testimonial */}
        <Card className="bg-tarkov-card mb-16">
          <div className="p-8 text-center">
            <blockquote className="text-xl text-gray-300 mb-6">
              "O Secret Tarkov PLUS mudou completamente minha experiência no jogo. 
              As análises de mercado me ajudaram a lucrar muito mais!"
            </blockquote>
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 bg-tarkov-gold rounded-full flex items-center justify-center mr-4">
                <span className="text-black font-bold text-lg">J</span>
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">João Silva</p>
                <p className="text-gray-400">Membro PLUS há 6 meses</p>
              </div>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para dominar o Tarkov?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Comece seu teste gratuito de 7 dias hoje mesmo!
          </p>
          <Button
            onClick={() => handleUpgrade(STRIPE_CONFIG.PRICES.PLUS_MONTHLY)}
            disabled={loading}
            className="bg-tarkov-gold hover:bg-tarkov-gold/90 text-black px-8 py-4 text-lg"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
            ) : (
              'Começar Teste Gratuito'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
