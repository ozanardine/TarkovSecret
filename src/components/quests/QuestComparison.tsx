'use client';

import React from 'react';
import { TarkovQuest } from '@/types/tarkov';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  XMarkIcon,
  UserIcon,
  MapPinIcon,
  StarIcon,
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
  GiftIcon,
  CurrencyDollarIcon,
  TagIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface QuestComparisonProps {
  quests: TarkovQuest[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveQuest: (questId: string) => void;
  onQuestClick: (quest: TarkovQuest) => void;
}

export const QuestComparison: React.FC<QuestComparisonProps> = ({
  quests,
  isOpen,
  onClose,
  onRemoveQuest,
  onQuestClick,
}) => {
  const getTraderImage = (quest: TarkovQuest) => {
    return quest.trader?.imageLink || '/images/placeholder-trader.png';
  };

  const getQuestTypeBadges = (quest: TarkovQuest) => {
    const badges = [];
    if (quest.kappaRequired) {
      badges.push(
        <Badge key="kappa" variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
          <TrophyIcon className="w-3 h-3 mr-1" />
          Kappa
        </Badge>
      );
    }
    if (quest.lightkeeperRequired) {
      badges.push(
        <Badge key="lightkeeper" variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
          <StarIcon className="w-3 h-3 mr-1" />
          Lightkeeper
        </Badge>
      );
    }
    if (quest.restartable) {
      badges.push(
        <Badge key="restartable" variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
          <ClockIcon className="w-3 h-3 mr-1" />
          Reiniciável
        </Badge>
      );
    }
    return badges;
  };

  const getTotalRewards = (quest: TarkovQuest) => {
    return (
      (quest.startRewards?.items?.length || 0) +
      (quest.finishRewards?.items?.length || 0) +
      (quest.startRewards?.offerUnlock?.length || 0) +
      (quest.finishRewards?.offerUnlock?.length || 0)
    );
  };

  const getComparisonData = () => {
    return [
      {
        label: 'Nível Mínimo',
        icon: UserIcon,
        getValue: (quest: TarkovQuest) => quest.minPlayerLevel || 0,
        format: (value: number) => value || 'Qualquer',
        color: 'text-blue-400',
      },
      {
        label: 'Experiência',
        icon: CurrencyDollarIcon,
        getValue: (quest: TarkovQuest) => quest.experience || 0,
        format: (value: number) => value.toLocaleString() + ' XP',
        color: 'text-green-400',
      },
      {
        label: 'Objetivos',
        icon: CheckCircleIcon,
        getValue: (quest: TarkovQuest) => quest.objectives?.length || 0,
        format: (value: number) => value.toString(),
        color: 'text-purple-400',
      },
      {
        label: 'Total de Recompensas',
        icon: GiftIcon,
        getValue: (quest: TarkovQuest) => getTotalRewards(quest),
        format: (value: number) => value.toString(),
        color: 'text-yellow-400',
      },
      {
        label: 'Quests Anteriores',
        icon: TagIcon,
        getValue: (quest: TarkovQuest) => quest.taskRequirements?.length || 0,
        format: (value: number) => value.toString(),
        color: 'text-orange-400',
      },
    ];
  };

  if (!isOpen || quests.length === 0) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <div className="bg-background-secondary/95 backdrop-blur-md border border-card-border/50 rounded-xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-card-border/50">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="w-6 h-6 text-tarkov-accent" />
            <h2 className="text-xl font-bold text-tarkov-light">
              Comparação de Quests ({quests.length}/3)
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <XMarkIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {quests.map((quest) => (
              <div
                key={quest.id}
                className="bg-background-tertiary/60 rounded-xl border border-card-border/30 overflow-hidden hover:border-tarkov-accent/50 transition-all duration-200"
              >
                {/* Quest Header */}
                <div className="relative p-4 border-b border-card-border/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveQuest(quest.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 p-1"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={getTraderImage(quest)}
                      alt={quest.trader?.name || 'Quest'}
                      className="w-12 h-12 object-cover rounded-lg bg-gray-800/50 p-1"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = '/images/placeholder-trader.png';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-tarkov-light text-sm leading-tight mb-1">
                        {quest.name}
                      </h3>
                      <p className="text-tarkov-muted text-xs">
                        {quest.trader?.name || 'Trader Desconhecido'}
                      </p>
                    </div>
                  </div>

                  {/* Quest Type Badges */}
                  {getQuestTypeBadges(quest).length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {getQuestTypeBadges(quest)}
                    </div>
                  )}

                  {/* Map */}
                  {quest.map && (
                    <div className="flex items-center gap-1 text-xs text-tarkov-muted">
                      <MapPinIcon className="w-3 h-3" />
                      {quest.map.name}
                    </div>
                  )}
                </div>

                {/* Comparison Stats */}
                <div className="p-4 space-y-3">
                  {getComparisonData().map((stat) => {
                    const value = stat.getValue(quest);
                    const Icon = stat.icon;
                    
                    return (
                      <div key={stat.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-tarkov-muted">
                          <Icon className="w-3 h-3" />
                          {stat.label}
                        </div>
                        <div className={`text-xs font-semibold ${stat.color}`}>
                          {stat.format(value)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-card-border/30">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onQuestClick(quest)}
                    className="w-full text-xs"
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          {quests.length > 1 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-tarkov-accent" />
                Comparação Detalhada
              </h3>
              
              <div className="bg-background-tertiary/60 rounded-xl border border-card-border/30 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-card-border/30">
                        <th className="text-left p-4 text-sm font-semibold text-tarkov-light">
                          Atributo
                        </th>
                        {quests.map((quest) => (
                          <th key={quest.id} className="text-center p-4 text-sm font-semibold text-tarkov-light min-w-[150px]">
                            {quest.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getComparisonData().map((stat, index) => {
                        const Icon = stat.icon;
                        
                        return (
                          <tr key={stat.label} className={index % 2 === 0 ? 'bg-background-secondary/30' : ''}>
                            <td className="p-4 text-sm text-tarkov-muted">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {stat.label}
                              </div>
                            </td>
                            {quests.map((quest) => {
                              const value = stat.getValue(quest);
                              const isHighest = quests.length > 1 && value === Math.max(...quests.map(q => stat.getValue(q)));
                              
                              return (
                                <td key={quest.id} className="p-4 text-center">
                                  <span className={`text-sm font-semibold ${
                                    isHighest && value > 0 ? 'text-tarkov-accent' : stat.color
                                  }`}>
                                    {stat.format(value)}
                                  </span>
                                  {isHighest && value > 0 && (
                                    <div className="text-xs text-tarkov-accent mt-1">Melhor</div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Empty Slots */}
          {quests.length < 3 && (
            <div className="mt-6">
              <div className="text-center text-tarkov-muted text-sm">
                <p>Você pode adicionar até {3 - quests.length} quest(s) adicionais para comparação.</p>
                <p className="mt-1">Use o botão de comparação nos cards das quests para adicioná-las.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default QuestComparison;