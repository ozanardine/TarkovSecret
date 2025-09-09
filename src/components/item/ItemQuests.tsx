'use client';

import { useState, useEffect } from 'react';
import { tarkovApi } from '@/lib/tarkov-api';
import { TarkovQuest, Trader } from '@/types/tarkov';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Loading';
import { 
  ExclamationTriangleIcon, 
  GiftIcon, 
  MapPinIcon,
  UserIcon,
  TrophyIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { toRomanNumeral } from '@/lib/utils/roman-numerals';
import { useQuestImages, useTraderImages } from '@/hooks/useImages';

interface ItemQuestsProps {
  itemId: string;
}

export default function ItemQuests({ itemId }: ItemQuestsProps) {
  const [quests, setQuests] = useState<TarkovQuest[]>([]);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get quest images for required quests only
  const questIds = quests.map(quest => quest.id).filter(Boolean);
  const { data: questImages } = useQuestImages({
    ids: questIds,
    enabled: questIds.length > 0
  });

  // Get trader images
  const traderIds = traders.map(trader => trader.id).filter(Boolean);
  const { data: traderImages } = useTraderImages({
    ids: traderIds,
    enabled: traderIds.length > 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [questsData, tradersData] = await Promise.all([
          tarkovApi.getQuestsForItem(itemId),
          tarkovApi.getTraders()
        ]);
        setQuests(questsData);
        setTraders(tradersData);
      } catch (err) {
        setError('Erro ao carregar informações de quests');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-400" />
              Quests
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
                  <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
              Quests
            </h3>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-red-500/20 rounded-lg border border-red-500/50">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quests.length === 0) {
    return (
      <div className="space-y-6">
        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />
              Quests
            </h3>
          </CardHeader>
          <CardContent>
            <div className="p-8 text-center">
              <ExclamationTriangleIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Este item não é usado em nenhuma quest</p>
              <p className="text-gray-500 text-sm mt-2">Continue explorando para encontrar outros usos</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getQuestUsageType = (quest: any, itemId: string) => {
    const usageTypes = [];
    
    // Check objectives - only count REQUIRED and SPECIFIC objectives (not optional or generic)
    const hasRequiredSpecificObjective = quest.objectives?.some((obj: any) => {
      // Skip if objective is optional
      if (obj.optional) return false;
      
      // Skip generic objectives that don't specify the exact item
      if (obj.type === 'TaskObjectiveTraderStanding' || 
          obj.type === 'TaskObjectiveExperience' ||
          obj.type === 'TaskObjectivePlayerLevel' ||
          obj.type === 'TaskObjectiveSkill') {
        return false;
      }
      
      if (obj.item && obj.item.id === itemId) return true;
      if (obj.items && obj.items.some((item: any) => item.id === itemId)) return true;
      return false;
    });
    
    if (hasRequiredSpecificObjective) usageTypes.push('objetivo obrigatório');
    
    // Check rewards
    const hasStartReward = quest.startRewards?.items?.some((reward: any) => reward.item.id === itemId);
    const hasFinishReward = quest.finishRewards?.items?.some((reward: any) => reward.item.id === itemId);
    
    if (hasStartReward) usageTypes.push('recompensa inicial');
    if (hasFinishReward) usageTypes.push('recompensa final');
    
    return usageTypes;
  };

  const getQuestImage = (quest: TarkovQuest) => {
    const questImage = questImages.find(img => img.id === quest.id);
    return questImage?.images?.image || '/images/placeholder-item.png';
  };

  const getQuestTraderImage = (traderName: string) => {
    if (!traderName) return null;
    const trader = traders.find(t => t.name === traderName);
    if (!trader) return null;
    
    const traderImage = traderImages.find(img => img.id === trader.id);
    return traderImage?.images?.avatar || trader.imageLink || '/images/placeholder-trader.png';
  };

  return (
    <div className="space-y-6">
      {/* Resumo das Quests */}
      <Card variant="elevated">
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-yellow-500" />
            Resumo das Quests ({quests.length})
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <ClipboardDocumentListIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total de Quests</p>
                <p className="text-white font-semibold text-xl">{quests.length}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <UserIcon className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Traders Únicos</p>
                <p className="text-white font-semibold text-xl">
                  {quests.filter(q => q.trader).length > 0 ? new Set(quests.filter(q => q.trader).map(q => q.trader!.name)).size : 0}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <MapPinIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Mapas Únicos</p>
                <p className="text-white font-semibold text-xl">
                  {quests.filter(q => q.map).length > 0 ? new Set(quests.filter(q => q.map).map(q => q.map!.name)).size : 0}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Quests */}
      <Card variant="elevated">
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-orange-400" />
            Detalhes das Quests
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {quests.map((quest) => {
              const usageTypes = getQuestUsageType(quest, itemId);
              const questImage = getQuestImage(quest);
                             const traderImage = quest.trader ? getQuestTraderImage(quest.trader.name) : null;
              
              return (
                <div key={quest.id} className="p-6 bg-gray-800/40 rounded-lg border border-gray-700/50">
                  <div className="flex items-start gap-6 mb-4">
                    {/* Quest Thumbnail */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={questImage}
                        alt={quest.name}
                        fill
                        className="object-cover rounded-lg border border-gray-600/50"
                        sizes="96px"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <Link 
                            href={`/quest/${quest.id}`}
                            className="text-xl font-bold text-white hover:text-orange-400 transition-colors"
                          >
                            {quest.name}
                          </Link>
                          
                                                     {/* Trader Info */}
                           {quest.trader && (
                             <div className="flex items-center gap-3 mt-2">
                               {traderImage ? (
                                 <div className="relative w-6 h-6 flex-shrink-0">
                                   <Image
                                     src={traderImage}
                                     alt={quest.trader.name}
                                     fill
                                     className="object-contain rounded-full border border-gray-600"
                                     sizes="24px"
                                   />
                                 </div>
                               ) : (
                                 <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                                   <span className="text-xs text-gray-300">{quest.trader.name.charAt(0) || '?'}</span>
                                 </div>
                               )}
                                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                               <span className="font-medium text-white">{quest.trader.name}</span>
                               <span>•</span>
                                <span>Nível {toRomanNumeral(quest.minPlayerLevel || 1)}</span>
                               {quest.map && (
                                 <>
                                   <span>•</span>
                                   <span>{quest.map.name}</span>
                                 </>
                               )}
                             </div>
                             </div>
                           )}
                        </div>
                        
                        {/* Usage Type Badges */}
                        <div className="flex flex-wrap gap-2">
                          {usageTypes.map((type) => (
                            <Badge 
                              key={type} 
                              variant="secondary" 
                              className={`${
                                type === 'objetivo obrigatório' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
                                type === 'recompensa inicial' ? 'bg-green-500/20 border-green-500/50 text-green-400' :
                                type === 'recompensa final' ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' :
                                'bg-gray-500/20 border-gray-500/50 text-gray-400'
                              }`}
                            >
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Objectives - Only show REQUIRED and SPECIFIC objectives */}
                  {quest.objectives?.filter((obj: any) => {
                    // Skip if objective is optional
                    if (obj.optional) return false;
                    
                    // Skip generic objectives that don't specify the exact item
                    if (obj.type === 'TaskObjectiveTraderStanding' || 
                        obj.type === 'TaskObjectiveExperience' ||
                        obj.type === 'TaskObjectivePlayerLevel' ||
                        obj.type === 'TaskObjectiveSkill') {
                      return false;
                    }
                    
                    if (obj.item && obj.item.id === itemId) return true;
                    if (obj.items && obj.items.some((item: any) => item.id === itemId)) return true;
                    return false;
                  }).map((objective: any) => (
                    <div key={objective.id} className="mt-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <ClipboardDocumentListIcon className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-medium text-red-400">Objetivo Obrigatório</span>
                      </div>
                      <p className="text-white">{objective.description}</p>
                      {objective.count && (
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                          <span>Quantidade: <span className="text-white font-medium">{objective.count}</span></span>
                          {objective.foundInRaid && (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                              Found in Raid
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Rewards */}
                  {(quest.startRewards?.items?.some((reward: any) => reward.item.id === itemId) ||
                    quest.finishRewards?.items?.some((reward: any) => reward.item.id === itemId)) && (
                    <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <GiftIcon className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium text-green-400">Recompensa desta Quest</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}