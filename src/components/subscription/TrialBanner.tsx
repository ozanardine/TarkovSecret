'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  ClockIcon, 
  StarIcon, 
  CheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface TrialEligibilityData {
  isEligible: boolean;
  reason: string;
  trialDays: number;
}

interface TrialBannerProps {
  onTrialStart?: () => void;
  className?: string;
}

export default function TrialBanner({ onTrialStart, className = '' }: TrialBannerProps) {
  const [eligibility, setEligibility] = useState<TrialEligibilityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrialEligibility();
  }, []);

  const fetchTrialEligibility = async () => {
    try {
      const response = await fetch('/api/subscription/trial-eligibility');
      const data = await response.json();
      
      if (data.success) {
        setEligibility(data);
      }
    } catch (error) {
      console.error('Error fetching trial eligibility:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-32 bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  if (!eligibility?.isEligible) {
    return null;
  }

  return (
    <Card className={`bg-gradient-to-r from-tarkov-gold/10 to-yellow-600/10 border-tarkov-gold/30 ${className}`}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-tarkov-gold/20 rounded-full flex items-center justify-center">
                <StarIcon className="w-6 h-6 text-tarkov-gold" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-bold text-white">
                  Teste Gratuito Disponível!
                </h3>
                <Badge className="bg-tarkov-gold text-black text-xs">
                  {eligibility.trialDays} dias grátis
                </Badge>
              </div>
              
              <p className="text-gray-300 text-sm mb-4">
                Experimente todas as funcionalidades do Secret Tarkov PLUS por {eligibility.trialDays} dias, 
                sem compromisso e sem cobrança inicial.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="flex items-center text-sm text-gray-300">
                  <CheckIcon className="w-4 h-4 text-tarkov-gold mr-2" />
                  Sem cobrança inicial
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <CheckIcon className="w-4 h-4 text-tarkov-gold mr-2" />
                  Cancele a qualquer momento
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <CheckIcon className="w-4 h-4 text-tarkov-gold mr-2" />
                  Acesso completo ao PLUS
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <CheckIcon className="w-4 h-4 text-tarkov-gold mr-2" />
                  Suporte prioritário
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-tarkov-gold/20">
          <div className="flex items-center text-sm text-gray-400">
            <InformationCircleIcon className="w-4 h-4 mr-1" />
            Após o período de teste, será cobrado R$ 19,90/mês
          </div>
          
          <Button
            onClick={onTrialStart}
            className="bg-tarkov-gold hover:bg-tarkov-gold/90 text-black font-semibold px-6"
          >
            <ClockIcon className="w-4 h-4 mr-2" />
            Iniciar Teste Gratuito
          </Button>
        </div>
      </div>
    </Card>
  );
}