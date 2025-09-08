'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheckIcon, StarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { stripeHelpers, STRIPE_CONFIG } from '@/lib/stripe';
import TrialBanner from '@/components/subscription/TrialBanner';
import SubscriptionNotifications from '@/components/subscription/SubscriptionNotifications';
import toast from 'react-hot-toast';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  popular?: boolean;
  stripePriceId: {
    monthly: string;
    yearly: string;
  };
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Gratuito',
    description: 'Perfeito para começar sua jornada no Tarkov',
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      'Acesso a todos os itens do jogo',
      'Calculadora de dano básica',
      'Lista de favoritos (até 10 itens)',
      'Alertas de preço básicos',
      'Suporte por email',
    ],
    stripePriceId: {
      monthly: '',
      yearly: '',
    },
  },
  {
    id: 'plus',
    name: 'Secret Tarkov PLUS',
    description: 'Ferramentas avançadas para dominar o mercado',
    price: {
      monthly: 1990, // R$ 19,90
      yearly: 19900, // R$ 199,00 (2 meses grátis)
    },
    features: [
      'Tudo do plano gratuito',
      'Lista de favoritos ilimitada',
      'Alertas de preço avançados',
      'Análise de mercado em tempo real',
      'Calculadora de dano avançada',
      'Estatísticas detalhadas',
      'Exportação de dados',
      'Suporte prioritário',
      'Acesso antecipado a novas funcionalidades',
      'API personalizada',
    ],
    popular: true,
    stripePriceId: {
      monthly: STRIPE_CONFIG.PRICES.PLUS_MONTHLY,
      yearly: STRIPE_CONFIG.PRICES.PLUS_YEARLY,
    },
  },
];

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [userSubscription, setUserSubscription] = useState<any>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Fetch user subscription status
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

  const handleSubscribe = async (planId: string, priceId: string) => {
    if (planId === 'free') {
      toast.error('Você já está no plano gratuito');
      return;
    }

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
          cancelUrl: `${window.location.origin}/subscription`,
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

  const handleManageSubscription = async () => {
    if (!session) return;

    setLoading(true);

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
    } catch (error) {
      console.error('Error creating portal session:', error);
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

  return (
    <div className="min-h-screen bg-tarkov-dark py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">
            Escolha seu plano
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Desbloqueie todo o potencial do Secret Tarkov
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm font-medium ${billingInterval === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
              Mensal
            </span>
            <button
              onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-tarkov-gold focus:ring-offset-2 focus:ring-offset-tarkov-dark"
            >
              <span
                className={`${
                  billingInterval === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </button>
            <span className={`text-sm font-medium ${billingInterval === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
              Anual
            </span>
            {billingInterval === 'yearly' && (
              <Badge className="bg-green-600 text-white">
                Economize 2 meses
              </Badge>
            )}
          </div>
        </div>

        {/* Subscription Notifications */}
        <SubscriptionNotifications className="mb-8" />

        {/* Trial Banner */}
        {!userSubscription?.subscription && (
          <div className="mb-8">
            <TrialBanner 
              onTrialStart={() => handleSubscribe('plus', billingInterval === 'yearly' ? STRIPE_CONFIG.PRICES.PLUS_YEARLY : STRIPE_CONFIG.PRICES.PLUS_MONTHLY)}
            />
          </div>
        )}

        {/* Current Subscription Status */}
        {userSubscription?.subscription && (
          <div className="mb-8">
            <Card className="bg-tarkov-card border-tarkov-gold/20">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Plano Atual: {userSubscription.subscription.type === 'PLUS' ? 'Secret Tarkov PLUS' : 'Gratuito'}
                      {userSubscription.isTrial && (
                        <Badge className="ml-2 bg-green-600 text-white">
                          Período de Teste
                        </Badge>
                      )}
                    </h3>
                    <p className="text-gray-300">
                      Status: {userSubscription.subscription.status}
                      {userSubscription.subscription.current_period_end && (
                        <span className="ml-2">
                          • {userSubscription.isTrial ? 'Teste termina em' : 'Renova em'} {new Date(userSubscription.subscription.current_period_end).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </p>
                  </div>
                  {userSubscription.subscription.type === 'PLUS' && (
                    <div className="flex space-x-3">
                      <Button
                        onClick={handleManageSubscription}
                        disabled={loading}
                        className="bg-tarkov-gold hover:bg-tarkov-gold/90 text-black"
                      >
                        Gerenciar Assinatura
                      </Button>
                      <Button
                        onClick={() => router.push('/subscription/pause')}
                        disabled={loading}
                        variant="outline"
                        className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
                      >
                        Pausar Assinatura
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingPlans.map((plan) => {
            const isCurrentPlan = userSubscription?.subscription?.type === plan.id.toUpperCase();
            const price = billingInterval === 'yearly' ? plan.price.yearly : plan.price.monthly;
            const priceId = billingInterval === 'yearly' ? plan.stripePriceId.yearly : plan.stripePriceId.monthly;

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular
                    ? 'border-tarkov-gold bg-tarkov-card/50'
                    : 'border-gray-700 bg-tarkov-card'
                } ${isCurrentPlan ? 'ring-2 ring-tarkov-gold' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-tarkov-gold text-black px-4 py-1">
                      <StarIcon className="w-4 h-4 mr-1" />
                      Mais Popular
                    </Badge>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <Badge className="bg-green-600 text-white px-4 py-1">
                      <CheckIcon className="w-4 h-4 mr-1" />
                      Plano Atual
                    </Badge>
                  </div>
                )}

                <div className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-300 mb-4">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-white">
                        {price === 0 ? 'Grátis' : stripeHelpers.formatPrice(price)}
                      </span>
                      {price > 0 && (
                        <span className="text-gray-400 ml-1">
                          /{billingInterval === 'yearly' ? 'ano' : 'mês'}
                        </span>
                      )}
                    </div>
                    {billingInterval === 'yearly' && price > 0 && (
                      <p className="text-sm text-gray-400 mt-2">
                        {stripeHelpers.formatPrice(price / 12)}/mês
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckIcon className="w-5 h-5 text-tarkov-gold mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(plan.id, priceId)}
                    disabled={loading || isCurrentPlan}
                    className={`w-full ${
                      plan.popular
                        ? 'bg-tarkov-gold hover:bg-tarkov-gold/90 text-black'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    } ${isCurrentPlan ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : isCurrentPlan ? (
                      'Plano Atual'
                    ) : price === 0 ? (
                      'Plano Atual'
                    ) : (
                      `Assinar ${plan.name}`
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Perguntas Frequentes
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="bg-tarkov-card">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Posso cancelar a qualquer momento?
                </h3>
                <p className="text-gray-300">
                  Sim! Você pode cancelar sua assinatura a qualquer momento. Seu acesso ao plano PLUS continuará até o final do período de cobrança atual.
                </p>
              </div>
            </Card>

            <Card className="bg-tarkov-card">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Há período de teste?
                </h3>
                <p className="text-gray-300">
                  Sim! Oferecemos 7 dias de teste gratuito para o plano PLUS. Você pode experimentar todas as funcionalidades sem compromisso.
                </p>
              </div>
            </Card>

            <Card className="bg-tarkov-card">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Quais métodos de pagamento são aceitos?
                </h3>
                <p className="text-gray-300">
                  Aceitamos cartões de crédito e débito (Visa, Mastercard, American Express) através do Stripe, garantindo máxima segurança.
                </p>
              </div>
            </Card>

            <Card className="bg-tarkov-card">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Posso mudar de plano a qualquer momento?
                </h3>
                <p className="text-gray-300">
                  Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento através do portal de assinatura.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
