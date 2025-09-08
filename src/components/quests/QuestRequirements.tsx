'use client';

import React from 'react';
import { TaskRequirement, TraderLevelRequirement } from '@/types/tarkov';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useImages } from '@/hooks/useImages';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

interface QuestRequirementsProps {
  taskRequirements: TaskRequirement[];
  traderLevelRequirements: TraderLevelRequirement[];
  minPlayerLevel?: number;
  className?: string;
}

export const QuestRequirements: React.FC<QuestRequirementsProps> = ({
  taskRequirements,
  traderLevelRequirements,
  minPlayerLevel,
  className = '',
}) => {
  // Hook para obter imagens dos traders
  const traderIds = traderLevelRequirements.map(req => req.trader?.id).filter(Boolean);
  const { data: traderImages } = useImages({
    type: 'traders',
    ids: traderIds,
    imageTypes: ['imageLink', 'avatar', 'traderAvatar', 'image4xLink']
  });

  const getTraderImage = (traderId: string) => {
    const traderImage = traderImages.find(img => img.id === traderId);
    return traderImage?.images?.traderAvatar || traderImage?.images?.imageLink || traderImage?.images?.avatar || '/images/placeholder-trader.png';
  };

  const renderTaskRequirement = (requirement: TaskRequirement, index: number) => {
    const isCompleted = requirement.status === 'completed';
    const isFailed = requirement.status === 'failed';
    const isInProgress = requirement.status === 'inProgress';

    const getStatusIcon = () => {
      if (isCompleted) return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      if (isFailed) return <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />;
      if (isInProgress) return <ClockIcon className="w-5 h-5 text-yellow-400" />;
      return <LockClosedIcon className="w-5 h-5 text-muted-foreground" />;
    };

    const getStatusBadge = () => {
      if (isCompleted) {
        return <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">Concluída</Badge>;
      }
      if (isFailed) {
        return <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">Falhou</Badge>;
      }
      if (isInProgress) {
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Em Progresso</Badge>;
      }
      return <Badge variant="secondary" className="bg-gray-500/20 text-gray-400 border-gray-500/30">Pendente</Badge>;
    };

    return (
      <div
        key={`${requirement.task?.id || index}`}
        className={`
          relative p-4 rounded-lg border transition-all duration-200
          ${isCompleted 
            ? 'border-green-500/30 bg-green-500/5' 
            : isFailed 
            ? 'border-red-500/30 bg-red-500/5'
            : isInProgress
            ? 'border-yellow-500/30 bg-yellow-500/5'
            : 'border-card-border/30 bg-background-secondary/20'
          }
        `}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-medium text-foreground">
                Quest Prévia: {requirement.task?.name || 'Quest desconhecida'}
              </h3>
              <p className="text-sm text-muted-foreground">
                ID: {requirement.task?.id || 'N/A'}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Status detalhado */}
        <div className="mt-3 pt-3 border-t border-card-border/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <span className={`font-medium ${
              isCompleted ? 'text-green-400' :
              isFailed ? 'text-red-400' :
              isInProgress ? 'text-yellow-400' :
              'text-muted-foreground'
            }`}>
              {requirement.status || 'Pendente'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderTraderRequirement = (requirement: TraderLevelRequirement, index: number) => {
    const trader = requirement.trader;
    if (!trader) return null;

    const isHighLevel = (requirement.level || 0) >= 4;
    const isMaxLevel = (requirement.level || 0) >= 4;

    const getLevelColor = () => {
      if (isMaxLevel) return 'text-purple-400';
      if (isHighLevel) return 'text-orange-400';
      return 'text-blue-400';
    };

    const getLevelBadge = () => {
      if (isMaxLevel) {
        return <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">Max</Badge>;
      }
      if (isHighLevel) {
        return <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">Alto</Badge>;
      }
      return <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">Básico</Badge>;
    };

    return (
      <div
        key={`${trader.id || index}`}
        className="flex items-center justify-between p-4 bg-background-secondary/20 rounded-lg border border-card-border/30 hover:bg-background-secondary/30 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <img
            src={getTraderImage(trader.id)}
            alt={trader.name}
            className="w-10 h-10 rounded-full border border-card-border/30"
            onError={(e) => {
              e.currentTarget.src = '/images/placeholder-trader.png';
            }}
          />
          <div>
            <h3 className="font-medium text-foreground">{trader.name}</h3>
            <p className="text-sm text-muted-foreground">
              Trader ID: {trader.id}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {getLevelBadge()}
          <div className="text-right">
            <div className={`text-lg font-bold ${getLevelColor()}`}>
              Nível {requirement.level}
            </div>
            <div className="text-xs text-muted-foreground">
              {isMaxLevel ? 'Nível máximo' : 'Nível necessário'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const hasAnyRequirements = taskRequirements.length > 0 || 
                           traderLevelRequirements.length > 0 || 
                           minPlayerLevel;

  if (!hasAnyRequirements) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <ShieldCheckIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum requisito definido para esta quest.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Nível mínimo do jogador */}
        {minPlayerLevel && (
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-400">
                <UserIcon className="w-5 h-5" />
                <span>Requisito de Nível</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-background-primary/50 rounded-lg border border-card-border/20">
                <div className="flex items-center space-x-3">
                  <UserIcon className="w-8 h-8 text-blue-400" />
                  <div>
                    <h4 className="font-medium text-foreground">Nível do Jogador</h4>
                    <p className="text-sm text-muted-foreground">
                      Você deve ter pelo menos o nível {minPlayerLevel} para aceitar esta quest
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  Nível {minPlayerLevel}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Requisitos de quests prévias */}
        {taskRequirements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                <span>Quests Pré-requisito ({taskRequirements.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {taskRequirements.map((requirement, index) => 
                  renderTaskRequirement(requirement, index)
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Requisitos de nível dos traders */}
        {traderLevelRequirements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5 text-blue-400" />
                <span>Requisitos de Trader ({traderLevelRequirements.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {traderLevelRequirements.map((requirement, index) => 
                  renderTraderRequirement(requirement, index)
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resumo dos requisitos */}
        <Card className="bg-background-primary/20 border-dashed border-card-border/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Total de requisitos:</span>
              <div className="flex items-center space-x-4">
                {minPlayerLevel && (
                  <span className="flex items-center space-x-1">
                    <UserIcon className="w-4 h-4" />
                    <span>1 nível</span>
                  </span>
                )}
                {taskRequirements.length > 0 && (
                  <span className="flex items-center space-x-1">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>{taskRequirements.length} quests</span>
                  </span>
                )}
                {traderLevelRequirements.length > 0 && (
                  <span className="flex items-center space-x-1">
                    <UserIcon className="w-4 h-4" />
                    <span>{traderLevelRequirements.length} traders</span>
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
