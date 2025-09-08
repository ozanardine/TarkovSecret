'use client';

import React, { useState, useEffect } from 'react';
import { TarkovQuest } from '@/types/tarkov';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import { useSkills } from '@/hooks/useSkills';
import {
  XMarkIcon,
  HeartIcon,
  ShareIcon,
  EyeIcon,
  ChartBarIcon,
  UserIcon,
  MapPinIcon,
  StarIcon,
  TrophyIcon,
  ClockIcon,
  TagIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  GiftIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

interface QuestQuickPreviewProps {
  quest: TarkovQuest | null;
  isOpen: boolean;
  onClose: () => void;
  onQuestClick?: (questId: string) => void;
  onFavoriteToggle?: (questId: string) => void;
  onShare?: (quest: TarkovQuest) => void;
  isFavorite?: boolean;
  allQuests?: TarkovQuest[]; // Para encontrar quests relacionadas
}

export const QuestQuickPreview: React.FC<QuestQuickPreviewProps> = ({
  quest,
  isOpen,
  onClose,
  onQuestClick,
  onFavoriteToggle,
  onShare,
  isFavorite = false,
  allQuests = [],
}) => {
  const [imageError, setImageError] = useState(false);
  const [skillImageErrors, setSkillImageErrors] = useState<Set<string>>(new Set());
  const { getSkillImage } = useSkills();

  useEffect(() => {
    if (quest) {
      setImageError(false);
    }
  }, [quest]);

  if (!quest) return null;

  // Mapeamento de skills para ícones (fallback)
  const getSkillIcon = (skillName: string) => {
    const skillIcons: { [key: string]: string } = {
      'Endurance': '🏃',
      'Strength': '💪',
      'Metabolism': '🍽️',
      'Charisma': '💬',
      'Intellect': '🧠',
      'Attention': '👁️',
      'Perception': '👀',
      'Memory': '🧠',
      'Vitality': '❤️',
      'Health': '🩺',
      'Stress Resistance': '😌',
      'Throwables': '💣',
      'Covert Movement': '🤫',
      'Search': '🔍',
      'Mag Drills': '🔄',
      'Light Vests': '🦺',
      'Heavy Vests': '🛡️',
      'Sniper Rifles': '🎯',
      'Assault Rifles': '🔫',
      'DMRs': '📏',
      'LMGs': '🔫',
      'SMGs': '🔫',
      'Shotguns': '🔫',
      'Pistols': '🔫',
      'Revolver': '🔫',
    };
    return skillIcons[skillName] || '⭐';
  };

  const getTraderImage = () => {
    if (imageError || !quest.trader?.imageLink) {
      return '/placeholder-trader.png';
    }
    return quest.trader.imageLink;
  };

  const getQuestTypeColor = () => {
    if (quest.kappaRequired) return 'text-yellow-400';
    if (quest.lightkeeperRequired) return 'text-blue-400';
    if (quest.restartable) return 'text-green-400';
    return 'text-tarkov-muted';
  };

  const getQuestTypeBadge = () => {
    const badges = [];
    if (quest.kappaRequired) {
      badges.push(
        <Badge key="kappa" variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          <TrophyIcon className="w-3 h-3 mr-1" />
          Kappa
        </Badge>
      );
    }
    if (quest.lightkeeperRequired) {
      badges.push(
        <Badge key="lightkeeper" variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          <StarIcon className="w-3 h-3 mr-1" />
          Lightkeeper
        </Badge>
      );
    }
    if (quest.restartable) {
      badges.push(
        <Badge key="restartable" variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
          <ClockIcon className="w-3 h-3 mr-1" />
          Reiniciável
        </Badge>
      );
    }
    return badges;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleFavoriteClick = () => {
    if (onFavoriteToggle) {
      onFavoriteToggle(quest.id);
    }
  };

  const handleShareClick = () => {
    if (onShare) {
      onShare(quest);
    }
  };

  const handleViewDetails = () => {
    if (onQuestClick) {
      onQuestClick(quest.id);
      onClose();
    }
  };

  const totalRewards = (
    (quest.startRewards?.items?.length || 0) +
    (quest.finishRewards?.items?.length || 0) +
    (quest.startRewards?.offerUnlock?.length || 0) +
    (quest.finishRewards?.offerUnlock?.length || 0) +
    (quest.startRewards?.skillLevelReward?.length || 0) +
    (quest.finishRewards?.skillLevelReward?.length || 0)
  );

  // Extrair itens obrigatórios dos objetivos
  const getRequiredItems = () => {
    const requiredItemsMap = new Map<string, {
      item: { id: string; name: string; shortName: string; iconLink?: string };
      count: number;
      foundInRaid?: boolean;
    }>();

    quest.objectives?.forEach(objective => {
      if (!objective.optional) {
        // TaskObjectiveItem - item único
        if ((objective as any).item && (objective as any).count) {
          const item = (objective as any).item;
          const key = item.id;
          const existing = requiredItemsMap.get(key);
          
          requiredItemsMap.set(key, {
            item,
            count: existing ? existing.count + (objective as any).count : (objective as any).count,
            foundInRaid: (objective as any).foundInRaid
          });
        }
        
        // TaskObjectiveItem - múltiplos itens
        if ((objective as any).items && (objective as any).count) {
          (objective as any).items.forEach((item: any) => {
            const key = item.id;
            const existing = requiredItemsMap.get(key);
            
            requiredItemsMap.set(key, {
              item,
              count: existing ? existing.count + ((objective as any).count || 1) : ((objective as any).count || 1),
              foundInRaid: (objective as any).foundInRaid
            });
          });
        }
        
        // TaskObjectiveBuildItem
        if ((objective as any).item && objective.type === 'buildItem') {
          const item = (objective as any).item;
          const key = item.id;
          const existing = requiredItemsMap.get(key);
          
          requiredItemsMap.set(key, {
            item,
            count: existing ? existing.count + 1 : 1,
            foundInRaid: false // Build items não são FIR
          });
        }
        
        // TaskObjectiveQuestItem
        if ((objective as any).questItem) {
          const item = (objective as any).questItem;
          const key = item.id;
          const existing = requiredItemsMap.get(key);
          
          requiredItemsMap.set(key, {
            item,
            count: existing ? existing.count + 1 : 1,
            foundInRaid: false // Quest items não são FIR
          });
        }
      }
    });

    return Array.from(requiredItemsMap.values());
  };

  const requiredItems = getRequiredItems();

  // Extrair mapas dos objetivos quando não há mapa principal
  const getObjectiveMaps = () => {
    if (quest.map) return null; // Se já tem mapa principal, não precisa dos objetivos
    
    const maps = new Set<string>();
    quest.objectives?.forEach(objective => {
      objective.maps?.forEach(map => {
        maps.add(map.name);
      });
    });
    
    const mapArray = Array.from(maps);
    if (mapArray.length === 0) return null;
    if (mapArray.length === 1) return mapArray[0];
    if (mapArray.length <= 3) return mapArray.join(', ');
    return `${mapArray.slice(0, 2).join(', ')} +${mapArray.length - 2}`;
  };

  // Obter informações sobre quests relacionadas
  const getPreviousQuests = () => {
    return quest.taskRequirements?.filter(req => req.task) || [];
  };

  // Encontrar quests que serão liberadas ao completar a atual
  const getNextQuests = () => {
    if (!quest || !allQuests.length) return [];
    
    return allQuests.filter(otherQuest => 
      otherQuest.taskRequirements?.some(req => 
        req.task?.id === quest.id
      )
    ).slice(0, 4); // Limitar a 4 próximas quests
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      className="max-w-4xl"
      showCloseButton={false}
    >
      {/* Header destacado */}
      <div className="bg-background-tertiary/40 backdrop-blur-sm border-b border-card-border/50 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={getTraderImage()}
                alt={quest.trader?.name || 'Quest'}
                className="w-20 h-20 object-cover rounded-lg bg-background-tertiary/30 p-1 border border-card-border/30 shadow-lg"
                onError={handleImageError}
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-tarkov-light mb-2">{quest.name}</h2>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {quest.trader && (
                  <div className="flex items-center gap-1">
                    <UserIcon className="w-4 h-4 text-tarkov-accent" />
                    <span className="text-tarkov-muted">{quest.trader.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4 text-tarkov-accent" />
                  <span className="text-tarkov-muted">
                    {quest.map?.name || getObjectiveMaps() || 'Qualquer local'}
                  </span>
                </div>
                {quest.minPlayerLevel && (
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4 text-tarkov-accent" />
                    <span className="text-tarkov-muted">Nível {quest.minPlayerLevel}</span>
                  </div>
                )}
              </div>
              
              {/* Quest Types no header */}
              {getQuestTypeBadge().length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {getQuestTypeBadge()}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteClick}
              className={`p-2 transition-colors ${
                isFavorite 
                  ? "text-red-500 hover:text-red-600" 
                  : "text-gray-400 hover:text-red-500"
              }`}
              title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              {isFavorite ? (
                <HeartSolid className="w-5 h-5" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareClick}
              className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
              title="Compartilhar quest"
            >
              <ShareIcon className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Fechar modal"
            >
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="p-6">
        {/* Itens Obrigatórios */}
        {requiredItems.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-tarkov-light mb-3 flex items-center gap-2">
              <TagIcon className="w-5 h-5 text-tarkov-accent" />
              Itens Obrigatórios
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {requiredItems.map((reqItem, index) => (
                <div key={index} className="bg-background-tertiary/60 backdrop-blur-sm rounded-lg p-3 border border-card-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-background-secondary/50 rounded-lg flex items-center justify-center">
                      {reqItem.item.iconLink ? (
                        <img 
                          src={reqItem.item.iconLink} 
                          alt={reqItem.item.shortName}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <TagIcon className="w-5 h-5 text-tarkov-muted" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-tarkov-light truncate">
                        {reqItem.item.shortName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-tarkov-muted">
                        <span>x{reqItem.count}</span>
                        {reqItem.foundInRaid && (
                          <div 
                            className="relative w-5 h-5 cursor-help"
                            title="Found in Raid"
                          >
                            {/* SVG FIR baseado no jogo */}
                            <svg 
                              width="20" 
                              height="20" 
                              viewBox="0 0 60 60" 
                              fill="none" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g filter="url(#filter0_d_1_2)">
                                <path 
                                  d="M30 3C15.0873 3 3 15.0873 3 30C3 44.9127 15.0873 57 30 57C44.9127 57 57 44.9127 57 30C57 15.0873 44.9127 3 30 3ZM30 54C16.7452 54 6 43.2548 6 30C6 16.7452 16.7452 6 30 6C43.2548 6 54 16.7452 54 30C54 43.2548 43.2548 54 30 54Z" 
                                  fill="#FBF037"
                                />
                                <path 
                                  d="M41.7744 20.3705C42.2227 19.8973 42.1952 19.141 41.722 18.6926C41.2488 18.2443 40.4925 18.2718 40.0441 18.745L25.3333 34.221L19.9559 29.5638C19.5075 29.0906 18.7512 29.1181 18.278 29.5665C17.8048 30.0148 17.8323 30.7711 18.2807 31.2443L24.4287 37.8931C24.877 38.3663 25.6333 38.3388 26.1065 37.8904L41.7744 20.3705Z" 
                                  fill="#FBF037"
                                />
                              </g>
                              <defs>
                                <filter id="filter0_d_1_2" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                                  <feOffset dx="0" dy="0"/>
                                  <feGaussianBlur stdDeviation="1.5"/>
                                  <feComposite in2="hardAlpha" operator="out"/>
                                  <feColorMatrix type="matrix" values="0 0 0 0 0.984314 0 0 0 0 0.941176 0 0 0 0 0.215686 0 0 0 1 0"/>
                                  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_2"/>
                                  <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_2" result="shape"/>
                                </filter>
                              </defs>
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quests Anteriores Necessárias */}
        {getPreviousQuests().length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-tarkov-light mb-3 flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-tarkov-accent" />
              Quests Anteriores Necessárias
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {getPreviousQuests().map((requirement, index) => (
                <div key={index} className="bg-background-tertiary/60 backdrop-blur-sm rounded-lg p-3 border border-card-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-background-secondary/50 rounded-lg flex items-center justify-center">
                      <CheckCircleIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-tarkov-light truncate">
                        {requirement.task.name}
                      </div>
                      <div className="text-xs text-tarkov-muted">
                        Status: {Array.isArray(requirement.status) ? requirement.status.join(', ') : requirement.status || 'Completa'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Próximas Quests Liberadas */}
        {getNextQuests().length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-tarkov-light mb-3 flex items-center gap-2">
              <StarIcon className="w-5 h-5 text-tarkov-accent" />
              Próximas Quests Liberadas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {getNextQuests().map((nextQuest, index) => (
                <div key={index} className="bg-background-tertiary/60 backdrop-blur-sm rounded-lg p-3 border border-card-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-background-secondary/50 rounded-lg flex items-center justify-center">
                      {nextQuest.trader?.imageLink ? (
                        <img 
                          src={nextQuest.trader.imageLink} 
                          alt={nextQuest.trader.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                      ) : (
                        <UserIcon className="w-5 h-5 text-tarkov-muted" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-tarkov-light truncate">
                        {nextQuest.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-tarkov-muted">
                        <span>{nextQuest.trader?.name}</span>
                        {nextQuest.experience > 0 && (
                          <span>• {nextQuest.experience.toLocaleString()} XP</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recompensas */}
        {(totalRewards > 0 || (quest.experience != null && quest.experience > 0)) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-tarkov-light mb-3 flex items-center gap-2">
              <GiftIcon className="w-5 h-5 text-tarkov-accent" />
              Recompensas
            </h3>
            
            <div className="space-y-4">
            {/* Experiência */}
            {quest.experience != null && quest.experience > 0 && (
              <div className="bg-background-tertiary/60 backdrop-blur-sm rounded-lg p-4 border border-card-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <StarIcon className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-400">
                      {quest.experience.toLocaleString()} EXP
                    </div>
                    <div className="text-sm text-tarkov-muted">Experiência</div>
                  </div>
                </div>
              </div>
            )}

            {/* Reputação do Trader */}
            {quest.finishRewards?.traderStanding && quest.finishRewards.traderStanding.length > 0 && (
              <div className="bg-background-tertiary/60 backdrop-blur-sm rounded-lg p-4 border border-card-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-400">
                      {quest.finishRewards.traderStanding[0].trader.name} Rep {quest.finishRewards.traderStanding[0].standing > 0 ? '+' : ''}{quest.finishRewards.traderStanding[0].standing}
                    </div>
                    <div className="text-sm text-tarkov-muted">Reputação</div>
                  </div>
                </div>
              </div>
            )}

            {/* Itens de Recompensa */}
            {quest.finishRewards?.items && quest.finishRewards.items.length > 0 && (
              <div className="bg-background-tertiary/60 backdrop-blur-sm rounded-lg p-4 border border-card-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <TagIcon className="w-5 h-5 text-tarkov-accent" />
                  <span className="font-semibold text-tarkov-light">Itens</span>
                </div>
                <div className="space-y-2">
                  {quest.finishRewards.items.map((rewardItem, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-background-secondary/50 rounded flex items-center justify-center">
                        {rewardItem.item.iconLink ? (
                          <img 
                            src={rewardItem.item.iconLink} 
                            alt={rewardItem.item.shortName}
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          <TagIcon className="w-4 h-4 text-tarkov-muted" />
                        )}
                      </div>
                      <span className="text-tarkov-light">
                        {rewardItem.count}× {rewardItem.item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Desbloqueios de Trader */}
            {quest.finishRewards?.offerUnlock && quest.finishRewards.offerUnlock.length > 0 && (
              <div className="bg-background-tertiary/60 backdrop-blur-sm rounded-lg p-4 border border-card-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <UserIcon className="w-5 h-5 text-purple-400" />
                  <span className="font-semibold text-tarkov-light">Desbloqueios</span>
                </div>
                <div className="space-y-2">
                  {quest.finishRewards.offerUnlock.map((unlock, index) => (
                    <div key={index} className="text-sm text-tarkov-light">
                      Desbloqueia compra de <span className="text-tarkov-accent">{unlock.item.name}</span> em {unlock.trader.name} LL{unlock.level}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recompensas de Skill */}
            {((quest.startRewards?.skillLevelReward && quest.startRewards.skillLevelReward.length > 0) ||
              (quest.finishRewards?.skillLevelReward && quest.finishRewards.skillLevelReward.length > 0)) && (
              <div className="bg-background-tertiary/60 backdrop-blur-sm rounded-lg p-4 border border-card-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <StarIcon className="w-5 h-5 text-orange-400" />
                  <span className="font-semibold text-tarkov-light">Níveis de Skill</span>
                </div>
                <div className="space-y-3">
                  {quest.startRewards?.skillLevelReward?.map((skillReward, index) => (
                    <div key={`start-${index}`} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        {(() => {
                          const skillName = (skillReward as any).name || skillReward.skill?.name || 'Skill';
                          const skillImage = getSkillImage(skillName);
                          
                          if (skillImage && !skillImageErrors.has(skillName)) {
                            return (
                              <img 
                                src={skillImage} 
                                alt={skillName}
                                className="w-8 h-8 object-contain"
                                onError={() => {
                                  setSkillImageErrors(prev => new Set(prev).add(skillName));
                                }}
                              />
                            );
                          }
                          
                          return (
                            <span className="text-lg">
                              {getSkillIcon(skillName)}
                            </span>
                          );
                        })()}
                      </div>
                      <div>
                        <div className="text-lg font-bold text-orange-400">
                          +{skillReward.level} {(skillReward as any).name || skillReward.skill?.name || 'Skill'}
                        </div>
                        <div className="text-sm text-tarkov-muted">Nível de skill</div>
                      </div>
                    </div>
                  ))}
                  {quest.finishRewards?.skillLevelReward?.map((skillReward, index) => (
                    <div key={`finish-${index}`} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        {(() => {
                          const skillName = (skillReward as any).name || skillReward.skill?.name || 'Skill';
                          const skillImage = getSkillImage(skillName);
                          
                          if (skillImage && !skillImageErrors.has(skillName)) {
                            return (
                              <img 
                                src={skillImage} 
                                alt={skillName}
                                className="w-8 h-8 object-contain"
                                onError={() => {
                                  setSkillImageErrors(prev => new Set(prev).add(skillName));
                                }}
                              />
                            );
                          }
                          
                          return (
                            <span className="text-lg">
                              {getSkillIcon(skillName)}
                            </span>
                          );
                        })()}
                      </div>
                      <div>
                        <div className="text-lg font-bold text-orange-400">
                          +{skillReward.level} {(skillReward as any).name || skillReward.skill?.name || 'Skill'}
                        </div>
                        <div className="text-sm text-tarkov-muted">Nível de skill</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>
          </div>
        )}

        {/* Objetivos */}
        {quest.objectives && quest.objectives.length > 0 && (
          <div className="bg-background-tertiary/60 backdrop-blur-sm rounded-lg border border-card-border/50 mb-6">
            <div className="flex items-center gap-2 p-4 border-b border-card-border/30">
              <CheckCircleIcon className="w-5 h-5 text-tarkov-accent" />
              <span className="text-lg font-semibold text-tarkov-light">Objetivos</span>
              <span className="text-sm text-tarkov-muted">({quest.objectives.length})</span>
            </div>
            <div className="max-h-80 overflow-y-auto p-4 space-y-4">
              {quest.objectives.map((objective, index) => (
                <div key={index} className="border-l-2 border-tarkov-accent/30 pl-4 py-2">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-tarkov-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-tarkov-accent">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-tarkov-light font-medium mb-2">
                        {objective.description}
                      </p>
                      
                      {/* Informações específicas por tipo de objetivo */}
                      <div className="space-y-2">
                        {/* Apenas mostrar badge opcional se necessário */}
                        {objective.optional && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 bg-yellow-500/20 rounded text-yellow-400">
                              Opcional
                            </span>
                          </div>
                        )}

                        {/* Item específico (para TaskObjectiveItem) - formato simplificado */}
                        {(objective as any).item && (
                          <div className="flex items-center gap-2">
                            {(objective as any).item.iconLink && (
                              <img 
                                src={(objective as any).item.iconLink} 
                                alt={(objective as any).item.shortName}
                                className="w-6 h-6 object-contain"
                              />
                            )}
                            <span className="text-tarkov-light font-medium">
                              {(objective as any).count && (objective as any).count > 1 ? `${(objective as any).count}× ` : ''}
                              {(objective as any).item.name}
                            </span>
                            {(objective as any).foundInRaid && (
                              <div 
                                className="relative w-5 h-5 cursor-help"
                                title="Found in Raid"
                              >
                                {/* SVG FIR baseado no jogo */}
                                <svg 
                                  width="20" 
                                  height="20" 
                                  viewBox="0 0 60 60" 
                                  fill="none" 
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <g filter="url(#filter0_d_1_2)">
                                    <path 
                                      d="M30 3C15.0873 3 3 15.0873 3 30C3 44.9127 15.0873 57 30 57C44.9127 57 57 44.9127 57 30C57 15.0873 44.9127 3 30 3ZM30 54C16.7452 54 6 43.2548 6 30C6 16.7452 16.7452 6 30 6C43.2548 6 54 16.7452 54 30C54 43.2548 43.2548 54 30 54Z" 
                                      fill="#FBF037"
                                    />
                                    <path 
                                      d="M41.7744 20.3705C42.2227 19.8973 42.1952 19.141 41.722 18.6926C41.2488 18.2443 40.4925 18.2718 40.0441 18.745L25.3333 34.221L19.9559 29.5638C19.5075 29.0906 18.7512 29.1181 18.278 29.5665C17.8048 30.0148 17.8323 30.7711 18.2807 31.2443L24.4287 37.8931C24.877 38.3663 25.6333 38.3388 26.1065 37.8904L41.7744 20.3705Z" 
                                      fill="#FBF037"
                                    />
                                  </g>
                                  <defs>
                                    <filter id="filter0_d_1_2" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                      <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                                      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                                      <feOffset dy="4"/>
                                      <feGaussianBlur stdDeviation="1.5"/>
                                      <feComposite in2="hardAlpha" operator="out"/>
                                      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_2"/>
                                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_2" result="shape"/>
                                    </filter>
                                  </defs>
                                </svg>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Mapas específicos - apenas se não for item */}
                        {!(objective as any).item && !(objective as any).items && (objective as any).maps && (objective as any).maps.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {(objective as any).maps.map((map: any, mapIndex: number) => (
                              <span key={mapIndex} className="px-2 py-1 bg-blue-500/20 rounded text-blue-300 text-xs">
                                {map.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Informações adicionais apenas para objetivos que não são de item */}
                        {!(objective as any).item && !(objective as any).items && (
                          <>
                            {/* Target para objetivos de eliminação */}
                            {(objective as any).target && (
                              <div className="text-xs">
                                <span className="text-tarkov-muted">Alvo:</span>
                                <span className="text-tarkov-light ml-1">{(objective as any).target}</span>
                              </div>
                            )}

                            {/* Distância para objetivos de tiro */}
                            {(objective as any).distance && (
                              <div className="text-xs">
                                <span className="text-tarkov-muted">Distância:</span>
                                <span className="text-tarkov-accent ml-1 font-medium">
                                  {(objective as any).distance}m
                                </span>
                              </div>
                            )}

                            {/* Contagem para objetivos sem item */}
                            {(objective as any).count && (
                              <div className="text-xs">
                                <span className="text-tarkov-muted">Quantidade:</span>
                                <span className="text-tarkov-accent ml-1 font-medium">
                                  {(objective as any).count}
                                </span>
                              </div>
                            )}

                            {/* Localização */}
                            {(objective as any).zone && (
                              <div className="text-xs">
                                <span className="text-tarkov-muted">Local:</span>
                                <span className="text-tarkov-light ml-1">{(objective as any).zone}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Localização */}
        {quest.map && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-tarkov-light mb-3 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-tarkov-accent" />
              Localização
            </h3>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              {quest.map.name}
            </Badge>
          </div>
        )}

        {/* Wiki Link */}
        {quest.wikiLink && (
          <div className="mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(quest.wikiLink, '_blank')}
              className="flex items-center gap-2"
            >
              <ExclamationTriangleIcon className="w-4 h-4" />
              Ver no Wiki
            </Button>
          </div>
        )}

        {/* Ações */}
        <div className="flex justify-end pt-4 border-t border-card-border">
          <Button
            variant="primary"
            onClick={handleViewDetails}
            className="flex items-center gap-2"
          >
            <EyeIcon className="w-4 h-4" />
            Ver Detalhes
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default QuestQuickPreview;