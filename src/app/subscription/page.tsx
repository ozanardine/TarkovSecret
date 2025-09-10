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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Escolha seu plano
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Desbloqueie todo o potencial do Secret Tarkov com recursos avançados para dominar o mercado
          </p>

          {/* Billing Interval Selector */}
          <BillingIntervalSelector
            selectedInterval={billingInterval}
            onIntervalChange={setBillingInterval}
          />
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selectedInterval={billingInterval}
              onSelectPlan={handleSelectPlan}
            />
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mb-16">
          <FeaturesComparison plans={plans} />
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Perguntas Frequentes
          </h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Posso cancelar a qualquer momento?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Sim! Você pode cancelar sua assinatura a qualquer momento. Seu acesso ao Secret Plus continuará até o final do período de cobrança atual.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Há período de teste?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Sim! Oferecemos 7 dias de teste gratuito para o Secret Plus. Você pode experimentar todas as funcionalidades sem compromisso.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Quais métodos de pagamento são aceitos?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Aceitamos cartões de crédito e débito (Visa, Mastercard, American Express) através do Stripe, garantindo máxima segurança.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Posso mudar de plano a qualquer momento?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento através do portal de assinatura.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                O que acontece se eu não tiver conta?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Você pode visualizar todos os planos e recursos sem precisar fazer login. Quando decidir assinar o Secret Plus, será redirecionado para criar uma conta.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
