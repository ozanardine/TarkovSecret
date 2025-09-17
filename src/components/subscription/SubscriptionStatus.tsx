'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useSubscription } from '@/hooks/useSubscription';
import { 
  StarIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface SubscriptionStatusProps {
  showUpgradeButton?: boolean;
  className?: string;
}

export default function SubscriptionStatus({ 
  showUpgradeButton = true, 
  className = '' 
}: SubscriptionStatusProps) {
  const { 
    subscription, 
    isPlus, 
    isTrial, 
    isActive, 
    isCancelled, 
    isExpired, 
    isPastDue,
    loading,
    trialDaysRemaining,
    isTrialExpiringSoon,
    upgradeToPlus,
    manageSubscription 
  } = useSubscription();
  
  const router = useRouter();

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-gray-700 rounded w-24"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {showUpgradeButton && (
          <Button
            onClick={upgradeToPlus}
            size="sm"
            className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-black"
          >
            <StarIcon className="w-4 h-4 mr-1" />
            Upgrade
          </Button>
        )}
      </div>
    );
  }

  const getStatusInfo = () => {
    if (isTrial) {
      const isExpiring = isTrialExpiringSoon;
      return {
        icon: ClockIcon,
        text: `Teste (${trialDaysRemaining}d)`,
        className: isExpiring ? 'bg-yellow-600 text-white' : 'bg-blue-600 text-white',
        description: isExpiring ? `Teste expira em ${trialDaysRemaining} ${trialDaysRemaining === 1 ? 'dia' : 'dias'}` : 'Período de teste ativo'
      };
    }

    if (isActive) {
      return {
        icon: CheckCircleIcon,
        text: isPlus ? 'PLUS' : null,
        className: isPlus ? 'bg-tarkov-gold text-black' : '',
        description: isPlus ? 'Assinatura PLUS ativa' : 'Plano gratuito'
      };
    }

    if (isCancelled) {
      return {
        icon: XCircleIcon,
        text: 'Cancelado',
        className: 'bg-red-600 text-white',
        description: 'Assinatura cancelada'
      };
    }

    if (isExpired) {
      return {
        icon: XCircleIcon,
        text: 'Expirado',
        className: 'bg-red-600 text-white',
        description: 'Assinatura expirada'
      };
    }

    if (isPastDue) {
      return {
        icon: ExclamationTriangleIcon,
        text: 'Atrasado',
        className: 'bg-yellow-600 text-white',
        description: 'Pagamento em atraso'
      };
    }

    return {
      icon: XCircleIcon,
      text: 'Inativo',
      className: 'bg-gray-600 text-white',
      description: 'Assinatura inativa'
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {statusInfo.text && (
        <Badge className={statusInfo.className}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {statusInfo.text}
        </Badge>
      )}
      
      {isPlus && isActive && (
        <Button
          onClick={manageSubscription}
          size="sm"
          className="bg-transparent border border-gray-600 hover:border-tarkov-gold text-gray-300 hover:text-tarkov-gold"
        >
          {isTrial ? 'Configurar Pagamento' : 'Gerenciar'}
        </Button>
      )}
      
      {!isPlus && showUpgradeButton && (
        <Button
          onClick={upgradeToPlus}
          size="sm"
          className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-black"
        >
          <StarIcon className="w-4 h-4 mr-1" />
          Upgrade
        </Button>
      )}
      
      {isCancelled && showUpgradeButton && (
        <Button
          onClick={() => router.push('/subscription')}
          size="sm"
          className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-black"
        >
          <StarIcon className="w-4 h-4 mr-1" />
          Reativar
        </Button>
      )}
    </div>
  );
}
