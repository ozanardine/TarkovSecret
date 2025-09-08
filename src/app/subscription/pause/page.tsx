'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import {
  PauseIcon,
  PlayIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface PauseOptions {
  canPause: boolean;
  currentStatus: string;
  pauseCollection: any;
  availableDurations: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  restrictions: {
    minSubscriptionAge: string;
    maxPausesPerYear: number;
    maxPauseDuration: string;
  };
  pauseHistory: any[];
}

interface PauseDetails {
  pausedAt: string;
  resumesAt: string;
  duration: string;
  reason: string;
}

export default function PauseSubscriptionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { subscriptionData, loading: subscriptionLoading, fetchSubscription } = useSubscription();
  
  const [pauseOptions, setPauseOptions] = useState<PauseOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [pauseReason, setPauseReason] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<'pause' | 'resume'>('pause');

  useEffect(() => {
    if (status === 'loading' || subscriptionLoading) return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchPauseOptions();
  }, [session, status, subscriptionLoading]);

  const fetchPauseOptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/plus/subscription/pause');
      const data = await response.json();

      if (data.success) {
        setPauseOptions(data.data);
      } else {
        toast.error(data.error || 'Erro ao carregar opções de pausa');
        router.push('/subscription');
      }
    } catch (error) {
      console.error('Error fetching pause options:', error);
      toast.error('Erro interno do servidor');
      router.push('/subscription');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseSubscription = async () => {
    if (!selectedDuration) {
      toast.error('Selecione a duração da pausa');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/plus/subscription/pause', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pauseDuration: selectedDuration,
          reason: pauseReason || 'Pausa solicitada pelo usuário'
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        await fetchSubscription();
        await fetchPauseOptions();
        setShowConfirmDialog(false);
        setSelectedDuration('');
        setPauseReason('');
      } else {
        toast.error(data.error || 'Erro ao pausar assinatura');
      }
    } catch (error) {
      console.error('Error pausing subscription:', error);
      toast.error('Erro interno do servidor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeSubscription = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/plus/subscription/pause', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        await fetchSubscription();
        await fetchPauseOptions();
        setShowConfirmDialog(false);
      } else {
        toast.error(data.error || 'Erro ao reativar assinatura');
      }
    } catch (error) {
      console.error('Error resuming subscription:', error);
      toast.error('Erro interno do servidor');
    } finally {
      setActionLoading(false);
    }
  };

  const openConfirmDialog = (type: 'pause' | 'resume') => {
    setActionType(type);
    setShowConfirmDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (status === 'loading' || subscriptionLoading || loading) {
    return (
      <div className="min-h-screen bg-tarkov-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-tarkov-gold"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isPlus = subscriptionData?.isPlus;
  const subscription = subscriptionData?.subscription;
  const isPaused = subscription?.status === 'PAUSED';

  if (!isPlus) {
    return (
      <div className="min-h-screen bg-tarkov-dark py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Nenhuma Assinatura PLUS
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Você precisa de uma assinatura PLUS ativa para acessar esta funcionalidade.
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

  const pauseDetails = pauseOptions?.pauseCollection as PauseDetails | null;

  return (
    <div className="min-h-screen bg-tarkov-dark py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/subscription')}
            className="mr-4 text-gray-400 hover:text-white"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {isPaused ? 'Retomar Assinatura' : 'Pausar Assinatura'}
            </h1>
            <p className="text-xl text-gray-300">
              {isPaused 
                ? 'Sua assinatura está pausada. Você pode reativá-la a qualquer momento.'
                : 'Pause temporariamente sua assinatura PLUS por até 3 meses.'
              }
            </p>
          </div>
        </div>

        {/* Current Status */}
        <Card className="bg-tarkov-card mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Status Atual</h2>
              <Badge 
                variant={isPaused ? 'warning' : 'success'}
                className="text-sm"
              >
                {isPaused ? 'PAUSADA' : 'ATIVA'}
              </Badge>
            </div>
            
            {isPaused && pauseDetails ? (
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <ClockIcon className="h-5 w-5 mr-3 text-yellow-400" />
                  <span>Pausada em: {formatDate(pauseDetails.pausedAt)}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <CalendarIcon className="h-5 w-5 mr-3 text-green-400" />
                  <span>Será reativada em: {formatDate(pauseDetails.resumesAt)}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-3 text-blue-400" />
                  <span>Motivo: {pauseDetails.reason}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center text-gray-300">
                <CheckCircleIcon className="h-5 w-5 mr-3 text-green-400" />
                <span>Sua assinatura PLUS está ativa e funcionando normalmente.</span>
              </div>
            )}
          </div>
        </Card>

        {/* Action Section */}
        {isPaused ? (
          /* Resume Section */
          <Card className="bg-tarkov-card mb-8">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Reativar Assinatura
              </h3>
              <p className="text-gray-300 mb-6">
                Você pode reativar sua assinatura a qualquer momento antes da data programada.
                Ao reativar, você terá acesso imediato a todas as funcionalidades PLUS.
              </p>
              <Button
                onClick={() => openConfirmDialog('resume')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
                disabled={actionLoading}
              >
                <PlayIcon className="h-5 w-5 mr-2" />
                {actionLoading ? 'Reativando...' : 'Reativar Agora'}
              </Button>
            </div>
          </Card>
        ) : (
          /* Pause Section */
          <>
            {pauseOptions?.canPause ? (
              <Card className="bg-tarkov-card mb-8">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Opções de Pausa
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Selecione por quanto tempo deseja pausar sua assinatura. Durante a pausa,
                    você não será cobrado e não terá acesso às funcionalidades PLUS.
                  </p>

                  {/* Duration Selection */}
                  <div className="space-y-3 mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Duração da Pausa
                    </label>
                    {pauseOptions.availableDurations.map((duration) => (
                      <label key={duration.id} className="flex items-center">
                        <input
                          type="radio"
                          name="duration"
                          value={duration.id}
                          checked={selectedDuration === duration.id}
                          onChange={(e) => setSelectedDuration(e.target.value)}
                          className="mr-3 text-tarkov-gold focus:ring-tarkov-gold"
                        />
                        <div>
                          <span className="text-white font-medium">{duration.name}</span>
                          <p className="text-gray-400 text-sm">{duration.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Reason (Optional) */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Motivo (Opcional)
                    </label>
                    <textarea
                      value={pauseReason}
                      onChange={(e) => setPauseReason(e.target.value)}
                      placeholder="Conte-nos o motivo da pausa para melhorarmos nossos serviços..."
                      className="w-full px-3 py-2 bg-tarkov-dark border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tarkov-gold focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={() => openConfirmDialog('pause')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3"
                    disabled={!selectedDuration || actionLoading}
                  >
                    <PauseIcon className="h-5 w-5 mr-2" />
                    {actionLoading ? 'Pausando...' : 'Pausar Assinatura'}
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="bg-tarkov-card mb-8">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Pausa Não Disponível
                  </h3>
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-gray-300 mb-4">
                        Sua assinatura não atende aos requisitos para pausa temporária.
                      </p>
                      <div className="space-y-2 text-sm text-gray-400">
                        <p>• Idade mínima da assinatura: {pauseOptions?.restrictions.minSubscriptionAge}</p>
                        <p>• Máximo de pausas por ano: {pauseOptions?.restrictions.maxPausesPerYear}</p>
                        <p>• Duração máxima da pausa: {pauseOptions?.restrictions.maxPauseDuration}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Pause History */}
        {pauseOptions?.pauseHistory && pauseOptions.pauseHistory.length > 0 && (
          <Card className="bg-tarkov-card">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Histórico de Pausas
              </h3>
              <div className="space-y-3">
                {pauseOptions.pauseHistory.map((event, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                    <div>
                      <span className="text-white font-medium">
                        {event.event_type === 'PAUSED' ? 'Pausada' : 'Reativada'}
                      </span>
                      <p className="text-gray-400 text-sm">
                        {formatDate(event.created_at)}
                      </p>
                    </div>
                    <Badge 
                      variant={event.event_type === 'PAUSED' ? 'warning' : 'success'}
                      className="text-xs"
                    >
                      {event.event_type === 'PAUSED' ? 'PAUSADA' : 'REATIVADA'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="bg-tarkov-card max-w-md mx-4">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  {actionType === 'pause' ? 'Confirmar Pausa' : 'Confirmar Reativação'}
                </h3>
                <p className="text-gray-300 mb-6">
                  {actionType === 'pause'
                    ? `Tem certeza que deseja pausar sua assinatura por ${pauseOptions?.availableDurations.find(d => d.id === selectedDuration)?.name.toLowerCase()}?`
                    : 'Tem certeza que deseja reativar sua assinatura agora?'
                  }
                </p>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => setShowConfirmDialog(false)}
                    variant="outline"
                    className="flex-1"
                    disabled={actionLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={actionType === 'pause' ? handlePauseSubscription : handleResumeSubscription}
                    className={`flex-1 ${actionType === 'pause' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processando...' : 'Confirmar'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}