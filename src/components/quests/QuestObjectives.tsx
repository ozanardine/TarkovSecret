'use client';

import React from 'react';
import { TaskObjective } from '@/types/tarkov';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  UserIcon,
  StarIcon,
  GiftIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ShieldCheckIcon,
  FireIcon,
  HeartIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

interface QuestObjectivesProps {
  objectives: TaskObjective[];
  failConditions?: TaskObjective[];
  className?: string;
}

export const QuestObjectives: React.FC<QuestObjectivesProps> = ({
  objectives,
  failConditions = [],
  className = '',
}) => {
  const getObjectiveIcon = (type: string) => {
    switch (type) {
      case 'item':
      case 'TaskObjectiveItem':
        return <GiftIcon className="w-5 h-5 text-blue-400" />;
      case 'skill':
      case 'TaskObjectiveSkill':
        return <StarIcon className="w-5 h-5 text-yellow-400" />;
      case 'trader':
      case 'TaskObjectiveTraderLevel':
        return <UserIcon className="w-5 h-5 text-green-400" />;
      case 'extract':
      case 'TaskObjectiveExtract':
        return <MapPinIcon className="w-5 h-5 text-purple-400" />;
      case 'shoot':
      case 'TaskObjectiveShoot':
        return <FireIcon className="w-5 h-5 text-red-400" />;
      case 'mark':
      case 'TaskObjectiveMark':
        return <CheckCircleIcon className="w-5 h-5 text-emerald-400" />;
      case 'experience':
      case 'TaskObjectiveExperience':
        return <StarIcon className="w-5 h-5 text-indigo-400" />;
      case 'build':
      case 'TaskObjectiveBuildItem':
        return <CogIcon className="w-5 h-5 text-gray-400" />;
      case 'use':
      case 'TaskObjectiveUseItem':
        return <HeartIcon className="w-5 h-5 text-pink-400" />;
      default:
        return <CheckCircleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getObjectiveTypeLabel = (type: string) => {
    switch (type) {
      case 'item':
      case 'TaskObjectiveItem':
        return 'Item';
      case 'skill':
      case 'TaskObjectiveSkill':
        return 'Skill';
      case 'trader':
      case 'TaskObjectiveTraderLevel':
        return 'Trader';
      case 'extract':
      case 'TaskObjectiveExtract':
        return 'Extração';
      case 'shoot':
      case 'TaskObjectiveShoot':
        return 'Tiro';
      case 'mark':
      case 'TaskObjectiveMark':
        return 'Marcação';
      case 'experience':
      case 'TaskObjectiveExperience':
        return 'Experiência';
      case 'build':
      case 'TaskObjectiveBuildItem':
        return 'Construção';
      case 'use':
      case 'TaskObjectiveUseItem':
        return 'Uso';
      default:
        return 'Objetivo';
    }
  };

  const renderObjectiveContent = (objective: TaskObjective) => {
    const type = objective.type || 'unknown';
    
    switch (type) {
      case 'item':
      case 'TaskObjectiveItem':
        return (
          <div className="space-y-2">
            {objective.item && (
              <div className="flex items-center space-x-3 p-3 bg-background-secondary/50 rounded-lg">
                <div className="relative">
                  <img
                    src={objective.item.iconLink || '/images/placeholder-item.png'}
                    alt={objective.item.name}
                    className="w-12 h-12 rounded-lg object-cover border border-card-border/30"
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder-item.png';
                    }}
                  />
                  {objective.foundInRaid && (
                    <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      ✓
                    </div>
                  )}
                  {(objective.count || 1) > 1 && (
                    <div className="absolute -bottom-1 -right-1 bg-tarkov-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {objective.count}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{objective.item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {objective.item.shortName && (
                      <span className="text-xs text-muted-foreground block">{objective.item.shortName}</span>
                    )}
                    Quantidade: {objective.count || 1}
                    {objective.foundInRaid && (
                      <span className="ml-2 text-orange-400 font-medium">• Found in Raid</span>
                    )}
                  </p>
                </div>
              </div>
            )}
            {objective.items && objective.items.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Itens alternativos:</p>
                {objective.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-background-secondary/30 rounded-lg">
                    <img
                      src={item.iconLink || '/images/placeholder-item.png'}
                      alt={item.name}
                      className="w-8 h-8 rounded object-cover border border-card-border/20"
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder-item.png';
                      }}
                    />
                    <div className="flex-1">
                      <span className="text-sm text-foreground">{item.name}</span>
                      {item.shortName && (
                        <span className="text-xs text-muted-foreground block">{item.shortName}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'skill':
      case 'TaskObjectiveSkill':
        return (
          <div className="p-3 bg-background-secondary/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <StarIcon className="w-8 h-8 text-yellow-400" />
              <div>
                <h4 className="font-medium text-foreground">
                  {objective.skill?.name || 'Skill'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Nível necessário: {objective.level || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        );

      case 'trader':
      case 'TaskObjectiveTraderLevel':
        return (
          <div className="p-3 bg-background-secondary/50 rounded-lg">
            <div className="flex items-center space-x-3">
              {objective.trader?.imageLink ? (
                <img
                  src={objective.trader.imageLink}
                  alt={objective.trader.name}
                  className="w-10 h-10 rounded-full object-cover border border-card-border/30"
                  onError={(e) => {
                    e.currentTarget.src = '/images/placeholder-trader.png';
                  }}
                />
              ) : (
                <UserIcon className="w-8 h-8 text-green-400" />
              )}
              <div>
                <h4 className="font-medium text-foreground">
                  {objective.trader?.name || 'Trader'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Nível necessário: {objective.level || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        );

      case 'extract':
      case 'TaskObjectiveExtract':
        return (
          <div className="p-3 bg-background-secondary/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <MapPinIcon className="w-8 h-8 text-purple-400" />
              <div>
                <h4 className="font-medium text-foreground">Extração</h4>
                <p className="text-sm text-muted-foreground">
                  {objective.maps && objective.maps.length > 0 ? (
                    <span>Mapas: {objective.maps.map(m => m.name).join(', ')}</span>
                  ) : (
                    'Mapa não especificado'
                  )}
                </p>
              </div>
            </div>
          </div>
        );

      case 'shoot':
      case 'TaskObjectiveShoot':
        return (
          <div className="p-3 bg-background-secondary/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FireIcon className="w-8 h-8 text-red-400" />
              <div>
                <h4 className="font-medium text-foreground">Tiro</h4>
                <p className="text-sm text-muted-foreground">
                  {objective.description || 'Objetivo de tiro'}
                </p>
              </div>
            </div>
          </div>
        );

      case 'mark':
      case 'TaskObjectiveMark':
        return (
          <div className="p-3 bg-background-secondary/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-8 h-8 text-emerald-400" />
              <div>
                <h4 className="font-medium text-foreground">Marcação</h4>
                <p className="text-sm text-muted-foreground">
                  {objective.description || 'Objetivo de marcação'}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-3 bg-background-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {objective.description || 'Objetivo não especificado'}
            </p>
          </div>
        );
    }
  };

  const renderObjective = (objective: TaskObjective, index: number, isFailCondition = false) => {
    const type = objective.type || 'unknown';
    const isOptional = objective.optional || false;

    return (
      <div
        key={`${objective.id || index}-${isFailCondition ? 'fail' : 'success'}`}
        className={`
          relative p-4 rounded-lg border transition-all duration-200
          ${isFailCondition 
            ? 'border-red-500/30 bg-red-500/5' 
            : 'border-card-border/30 bg-background-secondary/20 hover:bg-background-secondary/30'
          }
          ${isOptional ? 'border-dashed border-orange-400/50 bg-orange-500/5' : ''}
        `}
      >
        {/* Header do objetivo */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getObjectiveIcon(type)}
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-foreground">
                  {getObjectiveTypeLabel(type)} {index + 1}
                </h3>
                {isOptional && (
                  <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    Opcional
                  </Badge>
                )}
                {isFailCondition && (
                  <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">
                    Condição de Falha
                  </Badge>
                )}
              </div>
              {objective.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {objective.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Conteúdo específico do objetivo */}
        {renderObjectiveContent(objective)}

        {/* Informações adicionais */}
        <div className="mt-3 pt-3 border-t border-card-border/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              {objective.maps && objective.maps.length > 0 && (
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="w-3 h-3" />
                  <span>{objective.maps.length} mapa(s)</span>
                </div>
              )}
              {objective.count && objective.count > 1 && (
                <div className="flex items-center space-x-1">
                  <GiftIcon className="w-3 h-3" />
                  <span>Qtd: {objective.count}</span>
                </div>
              )}
            </div>
            
            {isFailCondition && (
              <div className="flex items-center space-x-1 text-red-400">
                <ExclamationTriangleIcon className="w-3 h-3" />
                <span>Falha</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      {/* Objetivos principais */}
      {objectives.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              <span>Objetivos ({objectives.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {objectives.map((objective, index) => renderObjective(objective, index))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Condições de falha */}
      {failConditions.length > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-400">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span>Condições de Falha ({failConditions.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {failConditions.map((condition, index) => renderObjective(condition, index, true))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagem quando não há objetivos */}
      {objectives.length === 0 && failConditions.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <CheckCircleIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum objetivo definido para esta quest.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
