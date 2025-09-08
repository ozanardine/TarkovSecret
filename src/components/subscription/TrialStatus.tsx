'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  ClockIcon, 
  CalendarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface TrialStatusProps {
  trialEnd: string;
  daysRemaining: number;
  onManageSubscription?: () => void;
  className?: string;
}

export default function TrialStatus({ 
  trialEnd, 
  daysRemaining, 
  onManageSubscription,
  className = '' 
}: TrialStatusProps) {
  const isExpiringSoon = daysRemaining <= 2;
  const trialEndDate = new Date(trialEnd).toLocaleDateString('pt-BR');

  return (
    <Card className={`${isExpiringSoon ? 'border-yellow-500/50 bg-yellow-900/10' : 'border-green-500/50 bg-green-900/10'} ${className}`}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isExpiringSoon ? 'bg-yellow-500/20' : 'bg-green-500/20'
              }`}>
                {isExpiringSoon ? (
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
                ) : (
                  <CheckCircleIcon className="w-6 h-6 text-green-500" />
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-bold text-white">
                  Período de Teste Ativo
                </h3>
                <Badge className={`text-xs ${
                  isExpiringSoon 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-green-600 text-white'
                }`}>
                  {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-300">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Teste termina em: {trialEndDate}
                </div>
                
                {isExpiringSoon && (
                  <p className="text-sm text-yellow-200">
                    ⚠️ Seu período de teste está terminando em breve. 
                    Para continuar aproveitando todas as funcionalidades PLUS, 
                    configure seu método de pagamento.
                  </p>
                )}
                
                {!isExpiringSoon && (
                  <p className="text-sm text-green-200">
                    ✅ Você está aproveitando todas as funcionalidades PLUS gratuitamente. 
                    Lembre-se de configurar seu método de pagamento antes do fim do teste.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-600">
          <div className="text-sm text-gray-400">
            Após o período de teste: R$ 19,90/mês
          </div>
          
          <Button
            onClick={onManageSubscription}
            className={`font-semibold px-6 ${
              isExpiringSoon 
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-tarkov-gold hover:bg-tarkov-gold/90 text-black'
            }`}
          >
            <ClockIcon className="w-4 h-4 mr-2" />
            {isExpiringSoon ? 'Configurar Pagamento' : 'Gerenciar Assinatura'}
          </Button>
        </div>
      </div>
    </Card>
  );
}