'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { useItemUsage } from '@/hooks/useTarkov';
import { ItemRequirementsDropdown } from './ItemRequirementsDropdown';
import {
  CalculatorIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  QueueListIcon,
  BuildingOfficeIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

interface ItemQuantityNeededProps {
  itemId: string;
}

interface QuantityBreakdown {
  quests: {
    total: number;
    foundInRaid: number;
    details: Array<{
      questName: string;
      quantity: number;
      foundInRaid: boolean;
      type: 'objective' | 'reward';
      requiredItems?: Array<{
        item: {
          id: string;
          name: string;
          shortName?: string;
          iconLink?: string;
        };
        count?: number;
        quantity?: number;
        foundInRaid?: boolean;
      }>;
    }>;
  };
  hideout: {
    total: number;
    details: Array<{
      stationName: string;
      level: number;
      quantity: number;
      type: 'construction' | 'craft';
      requiredItems?: Array<{
        item: {
          id: string;
          name: string;
          shortName?: string;
          iconLink?: string;
        };
        count?: number;
        quantity?: number;
        foundInRaid?: boolean;
      }>;
    }>;
  };
  barters: {
    total: number;
    details: Array<{
      traderName: string;
      quantity: number;
      level: number;
      rewardItems?: Array<{
        item: {
          id: string;
          name: string;
          shortName?: string;
          iconLink?: string;
        };
        count?: number;
        quantity?: number;
      }>;
      requiredItems?: Array<{
        item: {
          id: string;
          name: string;
          shortName?: string;
          iconLink?: string;
        };
        count?: number;
        quantity?: number;
        foundInRaid?: boolean;
      }>;
    }>;
  };
  grandTotal: number;
  foundInRaidRequired: number;
}

export function ItemQuantityNeeded({ itemId }: ItemQuantityNeededProps) {
  const { itemUsage, loading, error } = useItemUsage(itemId);
  const [quantities, setQuantities] = useState<QuantityBreakdown>({
    quests: { total: 0, foundInRaid: 0, details: [] },
    hideout: { total: 0, details: [] },
    barters: { total: 0, details: [] },
    grandTotal: 0,
    foundInRaidRequired: 0
  });

  useEffect(() => {
    if (!itemUsage) return;

    const questBreakdown = {
      total: 0,
      foundInRaid: 0,
      details: [] as any[]
    };

    const hideoutBreakdown = {
      total: 0,
      details: [] as any[]
    };

    const barterBreakdown = {
      total: 0,
      details: [] as any[]
    };

    // Analyze quests as requirements (currently none, but keeping structure)
    [...itemUsage.quests.asRequirement, ...itemUsage.quests.asReward].forEach(quest => {
      // Check objectives
      quest.objectives?.forEach((objective: any) => {
        if (objective.item?.id === itemId || objective.items?.some((item: any) => item.id === itemId)) {
          const quantity = objective.count || 1;
          const foundInRaid = objective.foundInRaid || false;
          
          questBreakdown.total += quantity;
          if (foundInRaid) {
            questBreakdown.foundInRaid += quantity;
          }
          
          // Collect all required items for this quest objective
          const requiredItems: any[] = [];
          if (objective.items) {
            objective.items.forEach((item: any) => {
              requiredItems.push({
                item: {
                  id: item.id,
                  name: item.name,
                  shortName: item.shortName,
                  iconLink: item.iconLink
                },
                count: objective.count || 1,
                foundInRaid: objective.foundInRaid || false
              });
            });
          } else if (objective.item) {
            requiredItems.push({
              item: {
                id: objective.item.id,
                name: objective.item.name,
                shortName: objective.item.shortName,
                iconLink: objective.item.iconLink
              },
              count: objective.count || 1,
              foundInRaid: objective.foundInRaid || false
            });
          }
          
          questBreakdown.details.push({
            questName: quest.name,
            quantity,
            foundInRaid,
            type: 'objective',
            requiredItems
          });
        }
      });

      // Check start rewards (items you get)
      quest.startRewards?.items?.forEach((reward: any) => {
        if (reward.item.id === itemId) {
          questBreakdown.details.push({
            questName: quest.name,
            quantity: -(reward.count || 1), // Negative because you receive it
            foundInRaid: reward.foundInRaid || false,
            type: 'reward'
          });
        }
      });

      // Check finish rewards (items you get)
      quest.finishRewards?.items?.forEach((reward: any) => {
        if (reward.item.id === itemId) {
          questBreakdown.details.push({
            questName: quest.name,
            quantity: -(reward.count || 1), // Negative because you receive it
            foundInRaid: reward.foundInRaid || false,
            type: 'reward'
          });
        }
      });
    });

    // Analyze hideout stations as requirements
    itemUsage.hideoutStations.asRequirement.forEach(station => {
      station.levels?.forEach((level: any) => {
        // Check construction requirements
        if (level.itemRequirements?.some((req: any) => req.item.id === itemId)) {
          const targetReq = level.itemRequirements.find((req: any) => req.item.id === itemId);
          const quantity = targetReq.count || targetReq.quantity || 1;
          hideoutBreakdown.total += quantity;
          
          const requiredItems = level.itemRequirements.map((req: any) => ({
            item: {
              id: req.item.id,
              name: req.item.name,
              shortName: req.item.shortName,
              iconLink: req.item.iconLink
            },
            count: req.count || req.quantity || 1
          }));
          
          hideoutBreakdown.details.push({
            stationName: station.name,
            level: level.level,
            quantity,
            type: 'construction',
            requiredItems
          });
        }

        // Check craft requirements
        level.crafts?.forEach((craft: any) => {
          if (craft.requiredItems?.some((req: any) => req.item.id === itemId)) {
            const targetReq = craft.requiredItems.find((req: any) => req.item.id === itemId);
            const quantity = targetReq.count || targetReq.quantity || 1;
            hideoutBreakdown.total += quantity;
            
            const requiredItems = craft.requiredItems.map((req: any) => ({
              item: {
                id: req.item.id,
                name: req.item.name,
                shortName: req.item.shortName,
                iconLink: req.item.iconLink
              },
              count: req.count || req.quantity || 1
            }));
            
            hideoutBreakdown.details.push({
              stationName: station.name,
              level: level.level,
              quantity,
              type: 'craft',
              requiredItems
            });
          }
        });
      });
    });

    // Analyze barter trades as requirements
    itemUsage.barterTrades.asRequirement.forEach(barter => {
      if (barter.requiredItems?.some((req: any) => req.item.id === itemId)) {
        const targetReq = barter.requiredItems.find((req: any) => req.item.id === itemId);
        const quantity = targetReq?.count || targetReq?.quantity || 1;
        barterBreakdown.total += quantity;
        
        const requiredItems = barter.requiredItems.map((req: any) => ({
          item: {
            id: req.item.id,
            name: req.item.name,
            shortName: req.item.shortName,
            iconLink: req.item.iconLink
          },
          count: req.count || req.quantity || 1
        }));
        
        const rewardItems = barter.rewardItems?.map((reward: any) => ({
          item: {
            id: reward.item.id,
            name: reward.item.name,
            shortName: reward.item.shortName,
            iconLink: reward.item.iconLink
          },
          count: reward.count || reward.quantity || 1
        })) || [];
        
        barterBreakdown.details.push({
          traderName: barter.trader?.name || 'Trader',
          quantity,
          level: barter.level || 1,
          requiredItems,
          rewardItems
        });
      }
    });

    const grandTotal = questBreakdown.total + hideoutBreakdown.total + barterBreakdown.total;
    const foundInRaidRequired = questBreakdown.foundInRaid;

    setQuantities({
      quests: questBreakdown,
      hideout: hideoutBreakdown,
      barters: barterBreakdown,
      grandTotal,
      foundInRaidRequired
    });
  }, [itemUsage, itemId]);

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <CalculatorIcon className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Quantidades Necessárias</h3>
        </div>
        <Loading size="sm" />
      </div>
    );
  }

  if (error || !itemUsage) {
    return null;
  }

  if (quantities.grandTotal === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <CalculatorIcon className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Quantidades Necessárias</h3>
        </div>
        <div className="flex items-center gap-2 text-tarkov-text-secondary">
          <InformationCircleIcon className="w-4 h-4" />
          <p>Este item não é necessário em quantidades específicas.</p>
        </div>
      </div>
    );
  }

  const getSeverityColor = (total: number) => {
    if (total >= 50) return 'text-red-400 bg-red-500/20 border-red-400/30';
    if (total >= 20) return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30';
    if (total >= 5) return 'text-blue-400 bg-blue-500/20 border-blue-400/30';
    return 'text-green-400 bg-green-500/20 border-green-400/30';
  };

  const getSeverityIcon = (total: number) => {
    if (total >= 50) return <ExclamationTriangleIcon className="w-4 h-4" />;
    if (total >= 20) return <ExclamationTriangleIcon className="w-4 h-4" />;
    return <CheckCircleIcon className="w-4 h-4" />;
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <CalculatorIcon className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-semibold text-white">Quantidades Necessárias</h3>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            {getSeverityIcon(quantities.grandTotal)}
            <h4 className="font-medium text-white">Total Necessário</h4>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`${getSeverityColor(quantities.grandTotal)} font-bold`}>
              {quantities.grandTotal}x
            </Badge>
            <span className="text-sm text-tarkov-text-secondary">unidades</span>
          </div>
        </div>

        {quantities.foundInRaidRequired > 0 && (
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-orange-400" />
              <h4 className="font-medium text-white">Found in Raid</h4>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-orange-400 bg-orange-500/20 border-orange-400/30 font-bold">
                {quantities.foundInRaidRequired}x
              </Badge>
              <span className="text-sm text-tarkov-text-secondary">obrigatório FiR</span>
            </div>
          </div>
        )}
      </div>

      {/* Breakdown with Dropdowns */}
      <div className="space-y-4">
        {quantities.quests.details.map((detail, index) => (
          detail.requiredItems && detail.requiredItems.length > 0 && (
            <ItemRequirementsDropdown
              key={`quest-${index}`}
              title={detail.questName}
              subtitle={`Quest ${detail.type === 'objective' ? '- Objetivo' : '- Recompensa'} ${detail.foundInRaid ? '(Found in Raid)' : ''}`}
              requiredItems={detail.requiredItems}
              currentItemId={itemId}
              badgeColor="text-yellow-400 bg-yellow-500/20 border-yellow-400/30"
              icon={<QueueListIcon className="w-4 h-4" />}
            />
          )
        ))}

        {quantities.hideout.details.map((detail, index) => (
          detail.requiredItems && detail.requiredItems.length > 0 && (
            <ItemRequirementsDropdown
              key={`hideout-${index}`}
              title={`${detail.stationName} - Nível ${detail.level}`}
              subtitle={detail.type === 'construction' ? 'Construção' : 'Craft'}
              requiredItems={detail.requiredItems}
              currentItemId={itemId}
              badgeColor="text-green-400 bg-green-500/20 border-green-400/30"
              icon={<BuildingOfficeIcon className="w-4 h-4" />}
            />
          )
        ))}

        {quantities.barters.details.map((detail, index) => {
          const rewardItemName = detail.rewardItems && detail.rewardItems.length > 0 
            ? detail.rewardItems[0].item.name 
            : 'Item';
          
          return (
            detail.requiredItems && detail.requiredItems.length > 0 && (
              <ItemRequirementsDropdown
                key={`barter-${index}`}
                title={`Troca - ${rewardItemName}`}
                subtitle={`${detail.traderName} - Nível ${detail.level}`}
                requiredItems={detail.requiredItems}
                rewardItems={detail.rewardItems}
                currentItemId={itemId}
                badgeColor="text-purple-400 bg-purple-500/20 border-purple-400/30"
                icon={<ArrowsRightLeftIcon className="w-4 h-4" />}
              />
            )
          );
        })}
      </div>

      {quantities.foundInRaidRequired > 0 && (
        <div className="mt-6 p-4 bg-orange-500/10 border border-orange-400/20 rounded-lg">
          <div className="flex items-start gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-orange-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-300">Atenção: Found in Raid Obrigatório</p>
              <p className="text-xs text-orange-400 mt-1">
                {quantities.foundInRaidRequired} unidade{quantities.foundInRaidRequired !== 1 ? 's' : ''} deve{quantities.foundInRaidRequired !== 1 ? 'm' : ''} ser encontrada{quantities.foundInRaidRequired !== 1 ? 's' : ''} em raid, não pode{quantities.foundInRaidRequired !== 1 ? 'm' : ''} ser comprada{quantities.foundInRaidRequired !== 1 ? 's' : ''} no Flea Market.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemQuantityNeeded;