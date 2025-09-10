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
import { 
  CheckIcon, 
  StarIcon, 
  ShieldCheckIcon, 
  BoltIcon, 
  ChartBarIcon,
  XMarkIcon,
  SparklesIcon,
  RocketLaunchIcon,
  TrophyIcon,
  HeartIcon,
  FireIcon,
  ArrowRightIcon,
  PlayIcon
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
    <Layout showSidebar={true} showFooter={true}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
        {/* Hero Section - Completamente Redesenhada */}
        <div className="relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-cyan-600/10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative container mx-auto px-4 py-20 lg:py-32">
            <div className="text-center max-w-5xl mx-auto">
              {/* Badge Animado */}
              <div className="inline-flex items-center space-x-2 mb-8">
                <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30 px-6 py-3 text-sm font-medium backdrop-blur-sm">
                  <SparklesIcon className="w-4 h-4 mr-2 animate-pulse" />
                  Planos Premium
                </Badge>
                <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30 px-4 py-2 text-xs font-medium backdrop-blur-sm">
                  <FireIcon className="w-3 h-3 mr-1" />
                  Mais Popular
                </Badge>
              </div>
              
              {/* Título Principal com Gradiente Animado */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 mb-8 leading-tight">
                Domine o
                <br />
                <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent animate-pulse">
                  Mercado Tarkov
                </span>
              </h1>
              
              {/* Subtítulo Impactante */}
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                A ferramenta definitiva para jogadores profissionais. 
                <span className="text-blue-400 font-semibold"> Maximize seus lucros</span>, 
                <span className="text-purple-400 font-semibold"> acompanhe tendências</span> e 
                <span className="text-cyan-400 font-semibold"> domine o mercado</span> como nunca antes.
              </p>

              {/* Estatísticas Impressionantes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">+50K</div>
                  <div className="text-gray-400">Jogadores Ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-400 mb-2">R$ 2.5M+</div>
                  <div className="text-gray-400">Lucros Gerados</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-cyan-400 mb-2">99.9%</div>
                  <div className="text-gray-400">Precisão dos Dados</div>
                </div>
              </div>

              {/* Billing Interval Selector Estilizado */}
              <div className="mb-12">
                <BillingIntervalSelector
                  selectedInterval={billingInterval}
                  onIntervalChange={setBillingInterval}
                />
              </div>

              {/* CTA Principal */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => {
                    const secretPlusPlan = plans.find(p => p.name === 'Secret Plus');
                    if (secretPlusPlan) {
                      handleSelectPlan(secretPlusPlan.id, billingInterval);
                    }
                  }}
                  className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-12 py-4 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
                >
                  <span className="flex items-center">
                    <RocketLaunchIcon className="w-6 h-6 mr-3 group-hover:animate-bounce" />
                    Começar Teste Grátis
                    <ArrowRightIcon className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                </button>
                
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group flex items-center text-gray-300 hover:text-white font-semibold px-8 py-4 rounded-2xl border border-gray-600 hover:border-gray-400 transition-all duration-300"
                >
                  <PlayIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Ver Demonstração
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Preview - Redesenhada */}
        <div id="features" className="py-24 bg-gradient-to-b from-gray-900 to-black">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Por que escolher o{' '}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Secret Tarkov?
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Ferramentas profissionais que transformam jogadores comuns em traders de elite
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <div className="group relative bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ChartBarIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Analytics Avançados</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Gráficos interativos e estatísticas em tempo real para análise profunda do mercado. 
                    Identifique tendências antes de todos.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm rounded-3xl p-8 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <BoltIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Alertas Inteligentes</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Notificações instantâneas sobre mudanças de preços, oportunidades de lucro e 
                    eventos importantes do mercado.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm rounded-3xl p-8 border border-green-500/20 hover:border-green-400/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ShieldCheckIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Experiência Sem Anúncios</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Navegue sem interrupções! Usuários Plus desfrutam de uma experiência 
                    completamente livre de anúncios e distrações.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="group relative bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-sm rounded-3xl p-8 border border-orange-500/20 hover:border-orange-400/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <TrophyIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Suporte Prioritário</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Atendimento exclusivo e personalizado para membros Plus. 
                    Respostas mais rápidas e suporte especializado.
                  </p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="group relative bg-gradient-to-br from-cyan-900/20 to-blue-900/20 backdrop-blur-sm rounded-3xl p-8 border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <HeartIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Listas Ilimitadas</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Crie quantas listas de favoritos quiser. Organize seus itens de forma 
                    personalizada e eficiente.
                  </p>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="group relative bg-gradient-to-br from-pink-900/20 to-purple-900/20 backdrop-blur-sm rounded-3xl p-8 border border-pink-500/20 hover:border-pink-400/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <SparklesIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Acesso Antecipado</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Seja o primeiro a testar novas funcionalidades e recursos. 
                    Mantenha-se sempre à frente da concorrência.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards - Redesenhada */}
        <div className="py-24 bg-gradient-to-b from-black to-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Escolha seu{' '}
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Plano Ideal
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Comece grátis e faça upgrade quando estiver pronto para dominar o mercado
              </p>
            </div>

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

        {/* Features Comparison - Redesenhada */}
        <div className="py-24 bg-gradient-to-b from-gray-900 to-black">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Comparação{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Detalhada
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Veja exatamente o que cada plano oferece para você tomar a melhor decisão
              </p>
            </div>
            <FeaturesComparison plans={plans} />
          </div>
        </div>

        {/* FAQ Section - Redesenhada */}
        <div className="py-24 bg-gradient-to-b from-black to-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Perguntas{' '}
                  <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Frequentes
                  </span>
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Tire suas dúvidas sobre nossos planos e funcionalidades
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:scale-105">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center group-hover:text-blue-300 transition-colors">
                    <CheckIcon className="w-6 h-6 text-blue-400 mr-3 group-hover:scale-110 transition-transform" />
                    Posso cancelar a qualquer momento?
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Sim! Você pode cancelar sua assinatura a qualquer momento. Seu acesso ao Secret Plus continuará até o final do período de cobrança atual.
                  </p>
                </div>

                <div className="group bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm rounded-3xl p-8 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-105">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center group-hover:text-purple-300 transition-colors">
                    <CheckIcon className="w-6 h-6 text-purple-400 mr-3 group-hover:scale-110 transition-transform" />
                    Há período de teste?
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Sim! Oferecemos 7 dias de teste gratuito para o Secret Plus. Você pode experimentar todas as funcionalidades sem compromisso.
                  </p>
                </div>

                <div className="group bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm rounded-3xl p-8 border border-green-500/20 hover:border-green-400/40 transition-all duration-300 hover:scale-105">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center group-hover:text-green-300 transition-colors">
                    <CheckIcon className="w-6 h-6 text-green-400 mr-3 group-hover:scale-110 transition-transform" />
                    Quais métodos de pagamento?
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Aceitamos cartões de crédito e débito (Visa, Mastercard, American Express) através do Stripe, garantindo máxima segurança.
                  </p>
                </div>

                <div className="group bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-sm rounded-3xl p-8 border border-orange-500/20 hover:border-orange-400/40 transition-all duration-300 hover:scale-105">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center group-hover:text-orange-300 transition-colors">
                    <CheckIcon className="w-6 h-6 text-orange-400 mr-3 group-hover:scale-110 transition-transform" />
                    Posso mudar de plano?
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento através do portal de assinatura.
                  </p>
                </div>

                <div className="group bg-gradient-to-br from-cyan-900/20 to-blue-900/20 backdrop-blur-sm rounded-3xl p-8 border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300 hover:scale-105 md:col-span-2">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center group-hover:text-cyan-300 transition-colors">
                    <CheckIcon className="w-6 h-6 text-cyan-400 mr-3 group-hover:scale-110 transition-transform" />
                    O que acontece se eu não tiver conta?
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Você pode visualizar todos os planos e recursos sem precisar fazer login. Quando decidir assinar o Secret Plus, será redirecionado para criar uma conta.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section - Redesenhada */}
        <div className="py-24 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-cyan-600/5"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
                Pronto para{' '}
                <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                  dominar
                </span>
                <br />
                o mercado?
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Junte-se a{' '}
                <span className="text-blue-400 font-semibold">milhares de jogadores</span> que já{' '}
                <span className="text-purple-400 font-semibold">maximizaram seus lucros</span> com o Secret Tarkov
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                <button
                  onClick={() => {
                    const secretPlusPlan = plans.find(p => p.name === 'Secret Plus');
                    if (secretPlusPlan) {
                      handleSelectPlan(secretPlusPlan.id, billingInterval);
                    }
                  }}
                  className="group relative bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black font-bold px-12 py-5 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25"
                >
                  <span className="flex items-center">
                    <RocketLaunchIcon className="w-7 h-7 mr-3 group-hover:animate-bounce" />
                    Começar Teste Grátis
                    <ArrowRightIcon className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                </button>
                
                <button
                  onClick={() => window.location.href = '/'}
                  className="group flex items-center text-gray-300 hover:text-white font-semibold px-10 py-5 rounded-2xl border-2 border-gray-600 hover:border-gray-400 transition-all duration-300 hover:bg-gray-800/50"
                >
                  <PlayIcon className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                  Explorar Recursos
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">7 dias</div>
                  <div className="text-gray-400">Teste Grátis</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">Cancelamento</div>
                  <div className="text-gray-400">A Qualquer Momento</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">Suporte 24/7</div>
                  <div className="text-gray-400">Para Membros Plus</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
