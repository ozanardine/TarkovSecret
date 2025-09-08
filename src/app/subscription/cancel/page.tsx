'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ExclamationTriangleIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CancelSubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

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

  const handleCancelSubscription = async () => {
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
      console.error('Error accessing portal:', error);
      toast.error('Erro interno do servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancellation = async () => {
    // This would typically call an API to cancel the subscription
    // For now, we'll redirect to the Stripe portal
    await handleCancelSubscription();
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

  if (!isPlus) {
    return (
      <div className="min-h-screen bg-tarkov-dark py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Nenhuma Assinatura Ativa
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Você não possui uma assinatura PLUS ativa para cancelar.
            </p>
            <Button
              onClick={() => router.push('/subscription')}
              className="bg-tarkov-gold hover:bg-tarkov-gold/90 text-black px-8 py-3"
            >
              Ver Planos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const subscription = userSubscription?.subscription;
  const isTrial = userSubscription?.isTrial;

  return (
    <div className="min-h-screen bg-tarkov-dark py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-600 mb-6">
            <ExclamationTriangleIcon className="h-8 w-8 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Cancelar Assinatura
          </h1>
          
          <p className="text-xl text-gray-300">
            Temos certeza de que quer cancelar? Vamos sentir sua falta!
          </p>
        </div>

        {/* Current Subscription */}
        <Card className="bg-tarkov-card border-red-500/20 mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Secret Tarkov PLUS
                </h2>
                <p className="text-gray-300">
                  {isTrial ? 'Período de teste ativo' : 'Assinatura ativa'}
                </p>
              </div>
              <Badge className="bg-green-600 text-white">
                {subscription?.status}
              </Badge>
            </div>

            {subscription && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Data de início</p>
                  <p className="text-white font-medium">
                    {new Date(subscription.start_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">
                    {isTrial ? 'Fim do período de teste' : 'Próxima cobrança'}
                  </p>
                  <p className="text-white font-medium">
                    {subscription.current_period_end 
                      ? new Date(subscription.current_period_end).toLocaleDateString('pt-BR')
                      : 'N/A'
                    }
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Renovação automática</p>
                  <p className="text-white font-medium">
                    {subscription.auto_renew ? 'Ativada' : 'Desativada'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* What You'll Lose */}
        <Card className="bg-tarkov-card mb-8">
          <div className="p-8">
            <h3 className="text-xl font-bold text-white mb-6">
              O que você perderá ao cancelar:
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
                  <XMarkIcon className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Alternatives */}
        <Card className="bg-tarkov-card mb-8">
          <div className="p-8">
            <h3 className="text-xl font-bold text-white mb-6">
              Antes de cancelar, considere:
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckIcon className="h-6 w-6 text-tarkov-gold mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    Pausar temporariamente
                  </h4>
                  <p className="text-gray-300 mb-3">
                    Você pode pausar sua assinatura por até 3 meses e retomar quando quiser.
                  </p>
                  <Button
                    onClick={() => router.push('/subscription/pause')}
                    variant="outline"
                    className="border-tarkov-gold text-tarkov-gold hover:bg-tarkov-gold hover:text-black"
                  >
                    Pausar Assinatura
                  </Button>
                </div>
              </div>
              
              <div className="flex items-start">
                <CheckIcon className="h-6 w-6 text-tarkov-gold mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    Mudar para plano anual
                  </h4>
                  <p className="text-gray-300">
                    Economize 2 meses pagando anualmente e mantenha todas as funcionalidades.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <CheckIcon className="h-6 w-6 text-tarkov-gold mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    Falar conosco
                  </h4>
                  <p className="text-gray-300">
                    Nossa equipe pode ajudar a resolver qualquer problema que você esteja enfrentando.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Cancellation Form */}
        {!showConfirmation ? (
          <Card className="bg-tarkov-card mb-8">
            <div className="p-8">
              <h3 className="text-xl font-bold text-white mb-6">
                Por que você está cancelando?
              </h3>
              
              <div className="space-y-4 mb-6">
                <label className="block">
                  <input
                    type="radio"
                    name="reason"
                    value="too-expensive"
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-300">Muito caro</span>
                </label>
                
                <label className="block">
                  <input
                    type="radio"
                    name="reason"
                    value="not-using"
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-300">Não estou usando</span>
                </label>
                
                <label className="block">
                  <input
                    type="radio"
                    name="reason"
                    value="missing-features"
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-300">Faltam funcionalidades</span>
                </label>
                
                <label className="block">
                  <input
                    type="radio"
                    name="reason"
                    value="technical-issues"
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-300">Problemas técnicos</span>
                </label>
                
                <label className="block">
                  <input
                    type="radio"
                    name="reason"
                    value="other"
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-300">Outro motivo</span>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => setShowConfirmation(true)}
                  disabled={!cancellationReason}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
                >
                  Continuar Cancelamento
                </Button>
                
                <Button
                  onClick={() => router.push('/subscription')}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3"
                >
                  Voltar
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="bg-tarkov-card border-red-500/50 mb-8">
            <div className="p-8">
              <h3 className="text-xl font-bold text-white mb-6">
                Confirmar Cancelamento
              </h3>
              
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-red-200">
                  <strong>Atenção:</strong> Sua assinatura será cancelada e você perderá acesso a todas as funcionalidades PLUS no final do período de cobrança atual.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleConfirmCancellation}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Sim, Cancelar Assinatura'
                  )}
                </Button>
                
                <Button
                  onClick={() => setShowConfirmation(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3"
                >
                  Não, Manter Assinatura
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Support */}
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            Ainda tem dúvidas? Nossa equipe de suporte está aqui para ajudar.
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
