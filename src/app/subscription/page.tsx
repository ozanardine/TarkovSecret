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
import { PageLayout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  CheckIcon, 
  StarIcon, 
  ShieldCheckIcon, 
  BoltIcon, 
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';
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
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading size="lg" text="Carregando planos..." />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center max-w-md">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-tarkov-light mb-2">
              Erro ao carregar planos
            </h2>
            <p className="text-tarkov-muted mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="text-center py-16">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Badge className="bg-tarkov-accent/20 text-tarkov-accent border-tarkov-accent/30 px-4 py-2 mb-6">
                <StarIcon className="w-4 h-4 mr-2" />
                Planos Premium
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-tarkov-light mb-6">
              Domine o Mercado
              <br />
              <span className="text-tarkov-accent">Tarkov</span>
            </h1>
            
            <p className="text-xl text-tarkov-muted mb-8 max-w-2xl mx-auto">
              A ferramenta definitiva para jogadores profissionais. Maximize seus lucros, 
              acompanhe tendências e domine o mercado como nunca antes.
            </p>

            {/* CTA Principal */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => {
                  const secretPlusPlan = plans.find(p => p.name === 'Secret Plus');
                  if (secretPlusPlan) {
                    handleSelectPlan(secretPlusPlan.id, billingInterval);
                  }
                }}
                size="lg"
                className="px-8"
              >
                <StarIcon className="w-5 h-5 mr-2" />
                Começar Teste Grátis
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8"
              >
                Ver Recursos
              </Button>
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section id="features" className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-tarkov-light mb-4">
              Por que escolher o Secret Tarkov?
            </h2>
            <p className="text-lg text-tarkov-muted max-w-2xl mx-auto">
              Ferramentas profissionais que transformam jogadores comuns em traders de elite
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="p-6 hover:border-tarkov-accent/50 transition-colors">
              <div className="w-12 h-12 bg-tarkov-accent/20 rounded-lg flex items-center justify-center mb-4">
                <ChartBarIcon className="w-6 h-6 text-tarkov-accent" />
              </div>
              <h3 className="text-xl font-bold text-tarkov-light mb-3">Analytics Avançados</h3>
              <p className="text-tarkov-muted">
                Gráficos interativos e estatísticas em tempo real para análise profunda do mercado. 
                Identifique tendências antes de todos.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 hover:border-tarkov-accent/50 transition-colors">
              <div className="w-12 h-12 bg-tarkov-accent/20 rounded-lg flex items-center justify-center mb-4">
                <BoltIcon className="w-6 h-6 text-tarkov-accent" />
              </div>
              <h3 className="text-xl font-bold text-tarkov-light mb-3">Alertas Inteligentes</h3>
              <p className="text-tarkov-muted">
                Notificações instantâneas sobre mudanças de preços, oportunidades de lucro e 
                eventos importantes do mercado.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 hover:border-tarkov-accent/50 transition-colors">
              <div className="w-12 h-12 bg-tarkov-accent/20 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheckIcon className="w-6 h-6 text-tarkov-accent" />
              </div>
              <h3 className="text-xl font-bold text-tarkov-light mb-3">Experiência Sem Anúncios</h3>
              <p className="text-tarkov-muted">
                Navegue sem interrupções! Usuários Plus desfrutam de uma experiência 
                completamente livre de anúncios e distrações.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 hover:border-tarkov-accent/50 transition-colors">
              <div className="w-12 h-12 bg-tarkov-accent/20 rounded-lg flex items-center justify-center mb-4">
                <UserGroupIcon className="w-6 h-6 text-tarkov-accent" />
              </div>
              <h3 className="text-xl font-bold text-tarkov-light mb-3">Suporte Prioritário</h3>
              <p className="text-tarkov-muted">
                Atendimento exclusivo e personalizado para membros Plus. 
                Respostas mais rápidas e suporte especializado.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="p-6 hover:border-tarkov-accent/50 transition-colors">
              <div className="w-12 h-12 bg-tarkov-accent/20 rounded-lg flex items-center justify-center mb-4">
                <StarIcon className="w-6 h-6 text-tarkov-accent" />
              </div>
              <h3 className="text-xl font-bold text-tarkov-light mb-3">Listas Ilimitadas</h3>
              <p className="text-tarkov-muted">
                Crie quantas listas de favoritos quiser. Organize seus itens de forma 
                personalizada e eficiente.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="p-6 hover:border-tarkov-accent/50 transition-colors">
              <div className="w-12 h-12 bg-tarkov-accent/20 rounded-lg flex items-center justify-center mb-4">
                <ClockIcon className="w-6 h-6 text-tarkov-accent" />
              </div>
              <h3 className="text-xl font-bold text-tarkov-light mb-3">Acesso Antecipado</h3>
              <p className="text-tarkov-muted">
                Seja o primeiro a testar novas funcionalidades e recursos. 
                Mantenha-se sempre à frente da concorrência.
              </p>
            </Card>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-tarkov-light mb-4">
              Escolha seu Plano Ideal
            </h2>
            <p className="text-lg text-tarkov-muted max-w-2xl mx-auto">
              Comece grátis e faça upgrade quando estiver pronto para dominar o mercado
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                selectedInterval={billingInterval}
                onSelectPlan={handleSelectPlan}
              />
            ))}
          </div>
        </section>

        {/* Features Comparison */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-tarkov-light mb-4">
              Comparação Detalhada
            </h2>
            <p className="text-lg text-tarkov-muted max-w-2xl mx-auto">
              Veja exatamente o que cada plano oferece para você tomar a melhor decisão
            </p>
          </div>
          <FeaturesComparison plans={plans} />
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-tarkov-light mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-lg text-tarkov-muted max-w-2xl mx-auto">
              Tire suas dúvidas sobre nossos planos e funcionalidades
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-tarkov-light mb-3 flex items-center">
                <CheckIcon className="w-5 h-5 text-tarkov-accent mr-3" />
                Posso cancelar a qualquer momento?
              </h3>
              <p className="text-tarkov-muted">
                Sim! Você pode cancelar sua assinatura a qualquer momento. Seu acesso ao Secret Plus continuará até o final do período de cobrança atual.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-tarkov-light mb-3 flex items-center">
                <CheckIcon className="w-5 h-5 text-tarkov-accent mr-3" />
                Há período de teste?
              </h3>
              <p className="text-tarkov-muted">
                Sim! Oferecemos 7 dias de teste gratuito para o Secret Plus. Você pode experimentar todas as funcionalidades sem compromisso.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-tarkov-light mb-3 flex items-center">
                <CheckIcon className="w-5 h-5 text-tarkov-accent mr-3" />
                Quais métodos de pagamento?
              </h3>
              <p className="text-tarkov-muted">
                Aceitamos cartões de crédito e débito (Visa, Mastercard, American Express) através do Stripe, garantindo máxima segurança.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-tarkov-light mb-3 flex items-center">
                <CheckIcon className="w-5 h-5 text-tarkov-accent mr-3" />
                Posso mudar de plano?
              </h3>
              <p className="text-tarkov-muted">
                Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento através do portal de assinatura.
              </p>
            </Card>

            <Card className="p-6 md:col-span-2">
              <h3 className="text-lg font-bold text-tarkov-light mb-3 flex items-center">
                <CheckIcon className="w-5 h-5 text-tarkov-accent mr-3" />
                O que acontece se eu não tiver conta?
              </h3>
              <p className="text-tarkov-muted">
                Você pode visualizar todos os planos e recursos sem precisar fazer login. Quando decidir assinar o Secret Plus, será redirecionado para criar uma conta.
              </p>
            </Card>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-16">
          <Card className="p-12 text-center bg-tarkov-secondary/50 border-tarkov-accent/20">
            <h2 className="text-3xl md:text-4xl font-bold text-tarkov-light mb-4">
              Pronto para dominar o mercado?
            </h2>
            <p className="text-lg text-tarkov-muted mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de jogadores que já maximizaram seus lucros com o Secret Tarkov
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                onClick={() => {
                  const secretPlusPlan = plans.find(p => p.name === 'Secret Plus');
                  if (secretPlusPlan) {
                    handleSelectPlan(secretPlusPlan.id, billingInterval);
                  }
                }}
                size="lg"
                className="px-8"
              >
                <StarIcon className="w-5 h-5 mr-2" />
                Começar Teste Grátis
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/')}
                className="px-8"
              >
                Explorar Recursos
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-tarkov-accent mb-1">7 dias</div>
                <div className="text-tarkov-muted text-sm">Teste Grátis</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-tarkov-accent mb-1">Cancelamento</div>
                <div className="text-tarkov-muted text-sm">A Qualquer Momento</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-tarkov-accent mb-1">Suporte 24/7</div>
                <div className="text-tarkov-muted text-sm">Para Membros Plus</div>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </PageLayout>
  );
}