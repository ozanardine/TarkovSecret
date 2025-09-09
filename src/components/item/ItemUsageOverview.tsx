'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { useItemUsage } from '@/hooks/useTarkov';
import { useQuestImages, useTraderImages } from '@/hooks/useImages';
import {
  MapIcon,
  HomeIcon,
  UserGroupIcon,
  GiftIcon,
  CubeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import ItemUsageModal from './ItemUsageModal';

interface ItemUsageOverviewProps {
  itemId: string;
}

interface UsageStats {
  questsAsRequirement: number;
  questsAsReward: number;
  hideoutAsRequirement: number;
  hideoutAsReward: number;
  bartersAsRequirement: number;
  bartersAsReward: number;
  totalUsages: number;
}

export function ItemUsageOverview({ itemId }: ItemUsageOverviewProps) {
  const { itemUsage, loading, error } = useItemUsage(itemId);
  const [stats, setStats] = useState<UsageStats>({
    questsAsRequirement: 0,
    questsAsReward: 0,
    hideoutAsRequirement: 0,
    hideoutAsReward: 0,
    bartersAsRequirement: 0,
    bartersAsReward: 0,
    totalUsages: 0
  });
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    item: any;
    type: 'quest' | 'hideout' | 'barter';
    category: 'requirement' | 'reward';
  }>({ isOpen: false, item: null, type: 'quest', category: 'requirement' });

  const openModal = (item: any, type: 'quest' | 'hideout' | 'barter', category: 'requirement' | 'reward') => {
    setModalState({ isOpen: true, item, type, category });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, item: null, type: 'quest', category: 'requirement' });
  };

  // Get trader images for barters
  const traderIds = [...itemUsage.barterTrades.asRequirement, ...itemUsage.barterTrades.asReward]
    .map(barter => barter.trader?.id).filter(Boolean);
  const { data: traderImages } = useTraderImages({ ids: traderIds, enabled: traderIds.length > 0 });

  // Get quest giver images
  const questGiverIds = [...itemUsage.quests.asRequirement, ...itemUsage.quests.asReward]
    .map(quest => quest.trader?.id).filter(Boolean);
  const { data: questGiverImages } = useTraderImages({ ids: questGiverIds, enabled: questGiverIds.length > 0 });

  useEffect(() => {
    if (itemUsage) {
      const questsAsRequirement = itemUsage.quests.asRequirement.length;
      const questsAsReward = itemUsage.quests.asReward.length;
      const hideoutAsRequirement = itemUsage.hideoutStations.asRequirement.length;
      const hideoutAsReward = itemUsage.hideoutStations.asReward.length;
      const bartersAsRequirement = itemUsage.barterTrades.asRequirement.length;
      const bartersAsReward = itemUsage.barterTrades.asReward.length;
      
      setStats({
        questsAsRequirement,
        questsAsReward,
        hideoutAsRequirement,
        hideoutAsReward,
        bartersAsRequirement,
        bartersAsReward,
        totalUsages: questsAsRequirement + questsAsReward + hideoutAsRequirement + hideoutAsReward + bartersAsRequirement + bartersAsReward
      });
    }
  }, [itemUsage]);

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <CubeIcon className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Onde é Usado</h3>
        </div>
        <Loading size="sm" />
      </div>
    );
  }

  if (error || !itemUsage) {
    return null;
  }

  if (stats.totalUsages === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <CubeIcon className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Onde é Usado</h3>
        </div>
        <p className="text-tarkov-text-secondary">Este item não é usado em quests, hideout ou trocas conhecidas.</p>
      </div>
    );
  }

  const getTraderImage = (traderId: string) => {
    const traderImage = [...(traderImages || []), ...(questGiverImages || [])]
      .find(img => img.id === traderId);
    return traderImage?.images?.imageLink || traderImage?.images?.image4xLink;
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <CubeIcon className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Onde é Usado</h3>
        <Badge variant="secondary" className="bg-blue-500/20 border-blue-400/30 text-blue-300">
          {stats.totalUsages} uso{stats.totalUsages !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Quests as Reward */}
        {stats.questsAsReward > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-yellow-400" />
              <h4 className="font-medium text-white">Quest Recompensas</h4>
              <Badge variant="secondary" className="bg-yellow-500/20 border-yellow-400/30 text-yellow-300 text-xs">
                {stats.questsAsReward}
              </Badge>
            </div>
            <div className="max-h-32 overflow-y-auto minimal-scrollbar space-y-2">
              {itemUsage.quests.asReward.map((quest) => (
                <div key={quest.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors" onClick={() => openModal(quest, 'quest', 'reward')}>
                  {quest.trader?.id && getTraderImage(quest.trader.id) ? (
                    <img
                      src={getTraderImage(quest.trader.id)}
                      alt={quest.trader.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <UserGroupIcon className="w-6 h-6 text-yellow-400" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{quest.name}</p>
                    <p className="text-xs text-tarkov-text-secondary">{quest.trader?.name || 'Trader'} • Recompensa</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hideout as Requirement */}
        {stats.hideoutAsRequirement > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HomeIcon className="w-4 h-4 text-green-400" />
              <h4 className="font-medium text-white">Hideout Requisitos</h4>
              <Badge variant="secondary" className="bg-green-500/20 border-green-400/30 text-green-300 text-xs">
                {stats.hideoutAsRequirement}
              </Badge>
            </div>
            <div className="max-h-32 overflow-y-auto minimal-scrollbar space-y-2">
              {itemUsage.hideoutStations.asRequirement.map((station, index) => (
                <div key={`${station.id}-req-${index}`} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors" onClick={() => openModal(station, 'hideout', 'requirement')}>
                  <HomeIcon className="w-6 h-6 text-green-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{station.name}</p>
                    <p className="text-xs text-tarkov-text-secondary">Construção/Craft • Requisito</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hideout as Reward */}
        {stats.hideoutAsReward > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HomeIcon className="w-4 h-4 text-blue-400" />
              <h4 className="font-medium text-white">Hideout Produção</h4>
              <Badge variant="secondary" className="bg-blue-500/20 border-blue-400/30 text-blue-300 text-xs">
                {stats.hideoutAsReward}
              </Badge>
            </div>
            <div className="max-h-32 overflow-y-auto minimal-scrollbar space-y-2">
              {itemUsage.hideoutStations.asReward.map((station, index) => (
                <div key={`${station.id}-rew-${index}`} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors" onClick={() => openModal(station, 'hideout', 'reward')}>
                  <HomeIcon className="w-6 h-6 text-blue-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{station.name}</p>
                    <p className="text-xs text-tarkov-text-secondary">Craft • Produzido</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Barters as Requirement */}
        {stats.bartersAsRequirement > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <GiftIcon className="w-4 h-4 text-purple-400" />
              <h4 className="font-medium text-white">Troca Requisitos</h4>
              <Badge variant="secondary" className="bg-purple-500/20 border-purple-400/30 text-purple-300 text-xs">
                {stats.bartersAsRequirement}
              </Badge>
            </div>
            <div className="max-h-32 overflow-y-auto minimal-scrollbar space-y-2">
              {itemUsage.barterTrades.asRequirement.map((barter) => (
                <div key={`${barter.id}-req`} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors" onClick={() => openModal(barter, 'barter', 'requirement')}>
                  {barter.trader?.id && getTraderImage(barter.trader.id) ? (
                    <img
                      src={getTraderImage(barter.trader.id)}
                      alt={barter.trader.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <GiftIcon className="w-6 h-6 text-purple-400" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">Troca com {barter.trader?.name || 'Trader'}</p>
                    <p className="text-xs text-tarkov-text-secondary">Nível {barter.level || 1} • Requisito</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Barters as Reward */}
        {stats.bartersAsReward > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <GiftIcon className="w-4 h-4 text-orange-400" />
              <h4 className="font-medium text-white">Troca Recompensas</h4>
              <Badge variant="secondary" className="bg-orange-500/20 border-orange-400/30 text-orange-300 text-xs">
                {stats.bartersAsReward}
              </Badge>
            </div>
            <div className="max-h-32 overflow-y-auto minimal-scrollbar space-y-2">
              {itemUsage.barterTrades.asReward.map((barter) => (
                <div key={`${barter.id}-rew`} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors" onClick={() => openModal(barter, 'barter', 'reward')}>
                  {barter.trader?.id && getTraderImage(barter.trader.id) ? (
                    <img
                      src={getTraderImage(barter.trader.id)}
                      alt={barter.trader.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <GiftIcon className="w-6 h-6 text-orange-400" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">Troca com {barter.trader?.name || 'Trader'}</p>
                    <p className="text-xs text-tarkov-text-secondary">Nível {barter.level || 1} • Recompensa</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {stats.totalUsages > 0 && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-sm text-tarkov-text-secondary">
              Este item é usado em <span className="text-white font-medium">{stats.totalUsages}</span> local{stats.totalUsages !== 1 ? 'is' : ''} diferentes
            </p>
            <ArrowRightIcon className="w-4 h-4 text-tarkov-text-secondary" />
          </div>
        </div>
      )}
      
      <ItemUsageModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        item={modalState.item}
        type={modalState.type}
        category={modalState.category}
      />
    </div>
  );
}

export default ItemUsageOverview;