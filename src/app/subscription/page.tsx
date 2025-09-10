'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { BillingInterval } from '@/types/subscription';
import { PlanCard } from '@/components/subscription/PlanCard';
import { BillingIntervalSelector } from '@/components/subscription/BillingIntervalSelector';
import { FeaturesComparison } from '@/components/subscription/FeaturesComparison';
import { Loading } from '@/components/ui/Loading';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheckIcon, StarIcon, ShieldCheckIcon, BoltIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  const { plans, loading, error } = useSubscriptionPlans();

  const handleSelectPlan = async (planId: string, interval: BillingInterval) => {
    // Esta função é chamada pelo PlanCard, mas a lógica real está no hook useCheckout
    // Mantemos aqui apenas para compatibilidade com a interface
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Erro ao carregar planos
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout showSidebar={false} showFooter={true}>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-tarkov-dark via-tarkov-secondary to-tarkov-tertiary">
          <div className="absolute inset-0 bg-gradient-to-r from-tarkov-accent/5 to-transparent opacity-20"></div>
          <div className="relative container mx-auto px-4 py-16 lg:py-24">
            <div className="text-center max-w-4xl mx-auto">
              <Badge className="bg-tarkov-accent/20 text-tarkov-accent border-tarkov-accent/30 px-4 py-2 mb-6">
                <StarIcon className="w-4 h-4 mr-2" />
                Planos de Subscription
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold text-tarkov-light mb-6">
                Domine o{' '}
                <span className="text-gradient">Mercado Tarkov</span>
              </h1>
              
              <p className="text-xl text-tarkov-muted mb-8 max-w-2xl mx-auto">
                Ferramentas profissionais para jogadores sérios. Acompanhe preços, receba alertas e maximize seus lucros no Escape from Tarkov.
              </p>

              {/* Billing Interval Selector */}
              <BillingIntervalSelector
                selectedInterval={billingInterval}
                onIntervalChange={setBillingInterval}
              />
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="py-16 bg-tarkov-secondary/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-tarkov-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="w-8 h-8 text-tarkov-accent" />
                </div>
                <h3 className="text-lg font-semibold text-tarkov-light mb-2">Analytics Avançados</h3>
                <p className="text-tarkov-muted">Gráficos e estatísticas detalhadas para análise de mercado</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-tarkov-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BoltIcon className="w-8 h-8 text-tarkov-accent" />
                </div>
                <h3 className="text-lg font-semibold text-tarkov-light mb-2">Alertas Inteligentes</h3>
                <p className="text-tarkov-muted">Notificações em tempo real sobre mudanças de preços</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-tarkov-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-tarkov-accent" />
                </div>
                <h3 className="text-lg font-semibold text-tarkov-light mb-2">Suporte Prioritário</h3>
                <p className="text-tarkov-muted">Atendimento exclusivo para membros Secret Plus</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  selectedInterval={billingInterval}
                  onSelectPlan={handleSelectPlan}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="py-16 bg-tarkov-secondary/30">
          <div className="container mx-auto px-4">
            <FeaturesComparison plans={plans} />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-tarkov-light mb-4">
                  Perguntas Frequentes
                </h2>
                <p className="text-tarkov-muted">
                  Tire suas dúvidas sobre nossos planos e funcionalidades
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-tarkov-secondary/50 border-tarkov-border/50 backdrop-blur-sm">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-tarkov-light mb-3 flex items-center">
                      <CheckIcon className="w-5 h-5 text-tarkov-accent mr-2" />
                      Posso cancelar a qualquer momento?
                    </h3>
                    <p className="text-tarkov-muted">
                      Sim! Você pode cancelar sua assinatura a qualquer momento. Seu acesso ao Secret Plus continuará até o final do período de cobrança atual.
                    </p>
                  </div>
                </Card>

                <Card className="bg-tarkov-secondary/50 border-tarkov-border/50 backdrop-blur-sm">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-tarkov-light mb-3 flex items-center">
                      <CheckIcon className="w-5 h-5 text-tarkov-accent mr-2" />
                      Há período de teste?
                    </h3>
                    <p className="text-tarkov-muted">
                      Sim! Oferecemos 7 dias de teste gratuito para o Secret Plus. Você pode experimentar todas as funcionalidades sem compromisso.
                    </p>
                  </div>
                </Card>

                <Card className="bg-tarkov-secondary/50 border-tarkov-border/50 backdrop-blur-sm">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-tarkov-light mb-3 flex items-center">
                      <CheckIcon className="w-5 h-5 text-tarkov-accent mr-2" />
                      Quais métodos de pagamento?
                    </h3>
                    <p className="text-tarkov-muted">
                      Aceitamos cartões de crédito e débito (Visa, Mastercard, American Express) através do Stripe, garantindo máxima segurança.
                    </p>
                  </div>
                </Card>

                <Card className="bg-tarkov-secondary/50 border-tarkov-border/50 backdrop-blur-sm">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-tarkov-light mb-3 flex items-center">
                      <CheckIcon className="w-5 h-5 text-tarkov-accent mr-2" />
                      Posso mudar de plano?
                    </h3>
                    <p className="text-tarkov-muted">
                      Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento através do portal de assinatura.
                    </p>
                  </div>
                </Card>

                <Card className="bg-tarkov-secondary/50 border-tarkov-border/50 backdrop-blur-sm md:col-span-2">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-tarkov-light mb-3 flex items-center">
                      <CheckIcon className="w-5 h-5 text-tarkov-accent mr-2" />
                      O que acontece se eu não tiver conta?
                    </h3>
                    <p className="text-tarkov-muted">
                      Você pode visualizar todos os planos e recursos sem precisar fazer login. Quando decidir assinar o Secret Plus, será redirecionado para criar uma conta.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 bg-gradient-to-r from-tarkov-accent/10 to-tarkov-accent/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-tarkov-light mb-4">
              Pronto para dominar o mercado?
            </h2>
            <p className="text-tarkov-muted mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de jogadores que já maximizaram seus lucros com o Secret Tarkov
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  const secretPlusPlan = plans.find(p => p.name === 'Secret Plus');
                  if (secretPlusPlan) {
                    handleSelectPlan(secretPlusPlan.id, billingInterval);
                  }
                }}
                className="btn bg-tarkov-accent hover:bg-tarkov-accent/90 text-black font-semibold px-8 py-3 rounded-lg transition-all duration-200 btn-hover"
              >
                Começar Teste Grátis
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="btn bg-tarkov-secondary hover:bg-tarkov-tertiary text-tarkov-light font-semibold px-8 py-3 rounded-lg transition-all duration-200 btn-hover"
              >
                Explorar Recursos
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
