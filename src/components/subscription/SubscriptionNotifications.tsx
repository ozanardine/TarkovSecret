'use client';

import { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ExclamationTriangleIcon, 
  XMarkIcon,
  ClockIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

interface NotificationProps {
  className?: string;
}

export default function SubscriptionNotifications({ className = '' }: NotificationProps) {
  const { 
    isTrial, 
    isTrialExpiringSoon, 
    trialDaysRemaining, 
    trialEndDate,
    isPastDue,
    subscription,
    manageSubscription 
  } = useSubscription();
  
  const [dismissed, setDismissed] = useState<string[]>([]);

  // Load dismissed notifications from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('dismissedNotifications');
    if (stored) {
      setDismissed(JSON.parse(stored));
    }
  }, []);

  const dismissNotification = (notificationId: string) => {
    const newDismissed = [...dismissed, notificationId];
    setDismissed(newDismissed);
    localStorage.setItem('dismissedNotifications', JSON.stringify(newDismissed));
  };

  const notifications = [];

  // Trial expiring soon notification
  if (isTrial && isTrialExpiringSoon && !dismissed.includes('trial-expiring')) {
    const trialEndFormatted = trialEndDate ? new Date(trialEndDate).toLocaleDateString('pt-BR') : '';
    
    notifications.push({
      id: 'trial-expiring',
      type: 'warning' as const,
      icon: ClockIcon,
      title: 'Período de Teste Terminando',
      message: `Seu período de teste termina em ${trialDaysRemaining} ${trialDaysRemaining === 1 ? 'dia' : 'dias'} (${trialEndFormatted}). Configure seu método de pagamento para continuar aproveitando todas as funcionalidades PLUS.`,
      action: {
        label: 'Configurar Pagamento',
        onClick: manageSubscription
      }
    });
  }

  // Payment past due notification
  if (isPastDue && !dismissed.includes('payment-past-due')) {
    notifications.push({
      id: 'payment-past-due',
      type: 'error' as const,
      icon: CreditCardIcon,
      title: 'Pagamento em Atraso',
      message: 'Seu pagamento está em atraso. Atualize seu método de pagamento para manter o acesso às funcionalidades PLUS.',
      action: {
        label: 'Atualizar Pagamento',
        onClick: manageSubscription
      }
    });
  }

  // Subscription paused notification
  if (subscription?.status === 'PAUSED' && !dismissed.includes('subscription-paused')) {
    const pauseData = subscription.pause_collection;
    const resumeDate = pauseData?.resumes_at ? new Date(pauseData.resumes_at).toLocaleDateString('pt-BR') : '';
    
    notifications.push({
      id: 'subscription-paused',
      type: 'warning' as const,
      icon: ClockIcon,
      title: 'Assinatura Pausada',
      message: `Sua assinatura PLUS está pausada${resumeDate ? ` e será reativada em ${resumeDate}` : ''}. Você pode reativá-la a qualquer momento.`,
      action: {
        label: 'Gerenciar Pausa',
        onClick: () => window.location.href = '/subscription/pause'
      }
    });
  }

  // Subscription ending soon (for active subscriptions)
  if (subscription?.current_period_end && !isTrial && !isPastDue && !dismissed.includes('subscription-ending')) {
    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEnd <= 3 && daysUntilEnd > 0) {
      notifications.push({
        id: 'subscription-ending',
        type: 'info' as const,
        icon: ExclamationTriangleIcon,
        title: 'Assinatura Renovando em Breve',
        message: `Sua assinatura PLUS será renovada em ${daysUntilEnd} ${daysUntilEnd === 1 ? 'dia' : 'dias'} (${endDate.toLocaleDateString('pt-BR')}). Verifique se seu método de pagamento está atualizado.`,
        action: {
          label: 'Verificar Pagamento',
          onClick: manageSubscription
        }
      });
    }
  }

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {notifications.map((notification) => {
        const Icon = notification.icon;
        const bgColor = {
          warning: 'bg-yellow-900/20 border-yellow-500/50',
          error: 'bg-red-900/20 border-red-500/50',
          info: 'bg-blue-900/20 border-blue-500/50'
        }[notification.type];
        
        const iconColor = {
          warning: 'text-yellow-500',
          error: 'text-red-500',
          info: 'text-blue-500'
        }[notification.type];
        
        const buttonColor = {
          warning: 'bg-yellow-600 hover:bg-yellow-700',
          error: 'bg-red-600 hover:bg-red-700',
          info: 'bg-blue-600 hover:bg-blue-700'
        }[notification.type];

        return (
          <Card key={notification.id} className={`${bgColor} relative`}>
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-semibold text-white mb-1">
                    {notification.title}
                  </h3>
                  <p className="text-sm text-gray-300 mb-3">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={notification.action.onClick}
                      size="sm"
                      className={`${buttonColor} text-white`}
                    >
                      {notification.action.label}
                    </Button>
                    
                    <button
                      onClick={() => dismissNotification(notification.id)}
                      className="text-xs text-gray-400 hover:text-gray-300 underline"
                    >
                      Dispensar
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-300"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}