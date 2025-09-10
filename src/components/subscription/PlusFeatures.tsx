'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useSubscription } from '@/hooks/useSubscription';
import { 
  StarIcon, 
  CheckIcon, 
  LockClosedIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface PlusFeaturesProps {
  showUpgradeButton?: boolean;
  className?: string;
}

const plusFeatures = [
  {
    title: 'Experiência Sem Anúncios',
    description: 'Navegue sem interrupções! Usuários Plus desfrutam de uma experiência completamente livre de anúncios e distrações.',
    icon: ShieldCheckIcon,
  },
  {
    title: 'Lista de Favoritos Ilimitada',
    description: 'Adicione quantos itens quiser às suas listas de favoritos',
    icon: StarIcon,
  },
  {
    title: 'Alertas de Preço Avançados',
    description: 'Configure alertas personalizados com múltiplas condições',
    icon: CheckIcon,
  },
  {
    title: 'Análise de Mercado em Tempo Real',
    description: 'Acompanhe tendências e oportunidades de lucro',
    icon: ArrowRightIcon,
  },
  {
    title: 'Calculadora de Dano Avançada',
    description: 'Simule cenários de combate com precisão',
    icon: CheckIcon,
  },
  {
    title: 'Estatísticas Detalhadas',
    description: 'Visualize seu progresso e performance',
    icon: CheckIcon,
  },
  {
    title: 'Exportação de Dados',
    description: 'Exporte suas listas e dados para análise externa',
    icon: ArrowRightIcon,
  },
  {
    title: 'Suporte Prioritário',
    description: 'Receba suporte mais rápido e personalizado',
    icon: CheckIcon,
  },
  {
    title: 'Acesso Antecipado',
    description: 'Teste novas funcionalidades antes de todos',
    icon: StarIcon,
  },
  {
    title: 'API Personalizada',
    description: 'Integre com suas próprias ferramentas',
    icon: ArrowRightIcon,
  },
];

export default function PlusFeatures({ 
  showUpgradeButton = true, 
  className = '' 
}: PlusFeaturesProps) {
  const { isPlus, isTrial, upgradeToPlus } = useSubscription();
  const [showAll, setShowAll] = useState(false);

  const displayedFeatures = showAll ? plusFeatures : plusFeatures.slice(0, 6);

  return (
    <div className={className}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Funcionalidades PLUS
        </h2>
        <p className="text-xl text-gray-300">
          Desbloqueie todo o potencial do Secret Tarkov
        </p>
      </div>

      {/* Current Status */}
      {isPlus && (
        <Card className="bg-tarkov-card border-tarkov-gold/20 mb-8">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <StarIcon className="w-8 h-8 text-tarkov-gold mr-3" />
              <h3 className="text-2xl font-bold text-white">
                Você é PLUS!
              </h3>
            </div>
            <p className="text-gray-300 mb-4">
              {isTrial 
                ? 'Aproveite seu período de teste gratuito'
                : 'Todas as funcionalidades estão desbloqueadas'
              }
            </p>
            {isTrial && (
              <Badge className="bg-blue-600 text-white">
                Período de Teste Ativo
              </Badge>
            )}
          </div>
        </Card>
      )}

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {displayedFeatures.map((feature, index) => {
          const FeatureIcon = feature.icon;
          const isLocked = !isPlus;
          
          return (
            <Card 
              key={index}
              className={`bg-tarkov-card ${
                isLocked ? 'opacity-60' : ''
              } ${isPlus ? 'border-tarkov-gold/20' : 'border-gray-700'}`}
            >
              <div className="p-6">
                <div className="flex items-start mb-4">
                  <div className={`p-2 rounded-lg ${
                    isPlus ? 'bg-tarkov-gold/20' : 'bg-gray-700'
                  }`}>
                    <FeatureIcon className={`w-6 h-6 ${
                      isPlus ? 'text-tarkov-gold' : 'text-gray-400'
                    }`} />
                  </div>
                  {isLocked && (
                    <LockClosedIcon className="w-5 h-5 text-gray-500 ml-auto" />
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-300 text-sm">
                  {feature.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Show More/Less Button */}
      {plusFeatures.length > 6 && (
        <div className="text-center mb-8">
          <Button
            onClick={() => setShowAll(!showAll)}
            className="bg-transparent border border-gray-600 hover:border-tarkov-gold text-gray-300 hover:text-tarkov-gold"
          >
            {showAll ? 'Mostrar Menos' : `Mostrar Mais (${plusFeatures.length - 6})`}
          </Button>
        </div>
      )}

      {/* Upgrade Button */}
      {!isPlus && showUpgradeButton && (
        <div className="text-center">
          <Card className="bg-tarkov-card border-tarkov-gold/20 inline-block">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Desbloqueie todas as funcionalidades
              </h3>
              <p className="text-gray-300 mb-6">
                Faça upgrade para PLUS e tenha acesso a todas essas funcionalidades e muito mais.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={upgradeToPlus}
                  className="bg-tarkov-gold hover:bg-tarkov-gold/90 text-black px-8 py-3"
                >
                  <StarIcon className="w-5 h-5 mr-2" />
                  Fazer Upgrade para PLUS
                </Button>
                <Button
                  onClick={() => window.open('/subscription', '_blank')}
                  className="bg-transparent border border-gray-600 hover:border-tarkov-gold text-gray-300 hover:text-tarkov-gold px-8 py-3"
                >
                  Ver Todos os Planos
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Trial Information */}
      {isTrial && (
        <Card className="bg-blue-900/20 border-blue-500/30 mt-8">
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">
              Período de Teste Ativo
            </h3>
            <p className="text-blue-200">
              Você tem 7 dias para experimentar todas as funcionalidades PLUS gratuitamente.
              Após o período de teste, sua assinatura será cobrada automaticamente.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
