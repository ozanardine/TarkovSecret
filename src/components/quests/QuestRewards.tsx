'use client';

import React from 'react';
import { TaskReward } from '@/types/tarkov';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useImages } from '@/hooks/useImages';
import {
  GiftIcon,
  CurrencyDollarIcon,
  StarIcon,
  UserIcon,
  TrophyIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface QuestRewardsProps {
  startRewards?: TaskReward;
  finishRewards?: TaskReward;
  failureOutcome?: TaskReward;
  className?: string;
}

export const QuestRewards: React.FC<QuestRewardsProps> = ({
  startRewards,
  finishRewards,
  failureOutcome,
  className = '',
}) => {
  // Hook para obter imagens dos itens das recompensas
  const getRewardItemIds = () => {
    const itemIds: string[] = [];
    
    if (startRewards?.items) {
      startRewards.items.forEach(item => {
        if (item.item?.id) itemIds.push(item.item.id);
      });
    }
    
    if (finishRewards?.items) {
      finishRewards.items.forEach(item => {
        if (item.item?.id) itemIds.push(item.item.id);
      });
    }
    
    return itemIds;
  };

  const { data: rewardImages } = useImages({
    type: 'items',
    ids: getRewardItemIds(),
    imageTypes: ['iconLink', 'gridImageLink']
  });

  const getItemImage = (itemId: string) => {
    const itemImage = rewardImages.find(img => img.id === itemId);
    return itemImage?.images?.iconLink || itemImage?.images?.gridImageLink || '/images/placeholder-item.png';
  };

  const renderRewardSection = (
    title: string,
    rewards: TaskReward | undefined,
    icon: React.ReactNode,
    variant: 'default' | 'success' | 'destructive' = 'default'
  ) => {
    if (!rewards) return null;

    const hasAnyRewards = (rewards.items?.length || 0) > 0 || 
                         (rewards.traderStanding?.length || 0) > 0 || 
                         (rewards.offerUnlock?.length || 0) > 0 ||
                         (rewards.skillLevelReward?.length || 0) > 0 ||
                         (rewards.traderUnlock?.length || 0) > 0;

    if (!hasAnyRewards) return null;

    const getVariantClasses = () => {
      switch (variant) {
        case 'success':
          return 'border-green-500/30 bg-green-500/5';
        case 'destructive':
          return 'border-red-500/30 bg-red-500/5';
        default:
          return 'border-card-border/30 bg-background-secondary/20';
      }
    };

    return (
      <Card className={`${getVariantClasses()}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {icon}
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Itens */}
            {rewards.items && rewards.items.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center space-x-2">
                  <GiftIcon className="w-4 h-4" />
                  <span>Itens ({rewards.items.length})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {rewards.items.map((item, index) => (
                    <div
                      key={`${item.item?.id || index}`}
                      className="flex items-center space-x-3 p-3 bg-background-primary/50 rounded-lg border border-card-border/20 hover:bg-background-primary/70 transition-colors"
                    >
                      <img
                        src={getItemImage(item.item?.id || '')}
                        alt={item.item?.name || 'Item'}
                        className="w-10 h-10 rounded-lg object-cover border border-card-border/30"
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder-item.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-foreground truncate">
                          {item.item?.name || 'Item desconhecido'}
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          Quantidade: {item.count || 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reputação com Traders */}
            {rewards.traderStanding && rewards.traderStanding.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center space-x-2">
                  <UserIcon className="w-4 h-4" />
                  <span>Reputação com Traders</span>
                </h4>
                <div className="space-y-2">
                  {rewards.traderStanding.map((standing, index) => (
                    <div
                      key={`${standing.trader?.id || index}`}
                      className="flex items-center justify-between p-3 bg-background-primary/50 rounded-lg border border-card-border/20"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={standing.trader?.imageLink || '/images/placeholder-trader.png'}
                          alt={standing.trader?.name || 'Trader'}
                          className="w-8 h-8 rounded-full border border-card-border/30"
                          onError={(e) => {
                            e.currentTarget.src = '/images/placeholder-trader.png';
                          }}
                        />
                        <span className="font-medium text-foreground">
                          {standing.trader?.name || 'Trader desconhecido'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {standing.standing > 0 ? (
                          <ArrowUpIcon className="w-4 h-4 text-green-400" />
                        ) : (
                          <ArrowDownIcon className="w-4 h-4 text-red-400" />
                        )}
                        <Badge
                          variant="secondary"
                          className={
                            standing.standing > 0
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }
                        >
                          {standing.standing > 0 ? '+' : ''}{standing.standing}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ofertas Desbloqueadas */}
            {rewards.offerUnlock && rewards.offerUnlock.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center space-x-2">
                  <CurrencyDollarIcon className="w-4 h-4" />
                  <span>Ofertas Desbloqueadas ({rewards.offerUnlock.length})</span>
                </h4>
                <div className="space-y-2">
                  {rewards.offerUnlock.map((offer, index) => (
                    <div
                      key={`${offer.id || index}`}
                      className="flex items-center space-x-3 p-3 bg-background-primary/50 rounded-lg border border-card-border/20"
                    >
                      <img
                        src={offer.trader?.imageLink || '/images/placeholder-trader.png'}
                        alt={offer.trader?.name || 'Trader'}
                        className="w-8 h-8 rounded-full border border-card-border/30"
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder-trader.png';
                        }}
                      />
                      <div className="flex-1">
                        <span className="font-medium text-foreground">
                          {offer.trader?.name || 'Trader'} - Nível {offer.level}
                        </span>
                        <p className="text-sm text-muted-foreground">
                          Item: {offer.item?.name || 'Item desconhecido'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recompensas de Skill */}
            {rewards.skillLevelReward && rewards.skillLevelReward.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center space-x-2">
                  <StarIcon className="w-4 h-4" />
                  <span>Recompensas de Skill ({rewards.skillLevelReward.length})</span>
                </h4>
                <div className="space-y-2">
                  {rewards.skillLevelReward.map((skill, index) => (
                    <div
                      key={`${skill.skill?.id || index}`}
                      className="flex items-center justify-between p-3 bg-background-primary/50 rounded-lg border border-card-border/20"
                    >
                      <div className="flex items-center space-x-3">
                        <StarIcon className="w-6 h-6 text-yellow-400" />
                        <span className="font-medium text-foreground">
                          {skill.skill?.name || 'Skill desconhecida'}
                        </span>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        Nível {skill.level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Traders Desbloqueados */}
            {rewards.traderUnlock && rewards.traderUnlock.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center space-x-2">
                  <UserIcon className="w-4 h-4" />
                  <span>Traders Desbloqueados ({rewards.traderUnlock.length})</span>
                </h4>
                <div className="space-y-2">
                  {rewards.traderUnlock.map((trader, index) => (
                    <div
                      key={`${trader.id || index}`}
                      className="flex items-center space-x-3 p-3 bg-background-primary/50 rounded-lg border border-card-border/20"
                    >
                      <img
                        src={trader.imageLink || '/images/placeholder-trader.png'}
                        alt={trader.name || 'Trader'}
                        className="w-10 h-10 rounded-full border border-card-border/30"
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder-trader.png';
                        }}
                      />
                      <div className="flex-1">
                        <span className="font-medium text-foreground">
                          {trader.name || 'Trader desconhecido'}
                        </span>
                        <p className="text-sm text-muted-foreground">
                          Trader desbloqueado
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const hasAnyRewards = startRewards || finishRewards || failureOutcome;

  if (!hasAnyRewards) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <GiftIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma recompensa definida para esta quest.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Recompensas de início */}
        {renderRewardSection(
          'Recompensas de Início',
          startRewards,
          <ClockIcon className="w-5 h-5 text-blue-400" />,
          'default'
        )}

        {/* Recompensas de conclusão */}
        {renderRewardSection(
          'Recompensas de Conclusão',
          finishRewards,
          <TrophyIcon className="w-5 h-5 text-yellow-400" />,
          'success'
        )}

        {/* Consequências de falha */}
        {renderRewardSection(
          'Consequências de Falha',
          failureOutcome,
          <ShieldCheckIcon className="w-5 h-5 text-red-400" />,
          'destructive'
        )}
      </div>
    </div>
  );
};
