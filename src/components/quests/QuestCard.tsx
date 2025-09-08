'use client';

import React, { useState, useMemo } from 'react';
import { TarkovQuest } from '@/types/tarkov';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useImages } from '@/hooks/useImages';
import {
  HeartIcon,
  ShareIcon,
  EyeIcon,
  UserIcon,
  MapIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  ScaleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  GiftIcon,
  TagIcon,
  MapPinIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, ScaleIcon as ScaleSolid } from '@heroicons/react/24/solid';

interface QuestCardProps {
  quest: TarkovQuest;
  viewMode: 'grid' | 'list';
  onQuestClick: () => void;
  onFavoriteToggle?: (e: React.MouseEvent) => void;
  onComparisonToggle?: (e: React.MouseEvent) => void;
  onShare?: (e: React.MouseEvent) => void;
  onQuickPreview?: () => void;
  isFavorite?: boolean;
  isInComparison?: boolean;
  canAddToComparison?: boolean;
  showActions?: boolean;
  index?: number;
  allQuests?: TarkovQuest[]; // Para encontrar quests relacionadas
}

export const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  viewMode,
  onQuestClick,
  onFavoriteToggle,
  onComparisonToggle,
  onShare,
  onQuickPreview,
  isFavorite = false,
  isInComparison = false,
  canAddToComparison = true,
  showActions = true,
  index = 0,
  allQuests = [],
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Hook para obter imagens da quest
  const { data: questImages } = useImages({
    type: 'quests',
    ids: [quest.id],
    imageTypes: ['taskImage', 'traderAvatar', 'mapImage']
  });

  const questImage = questImages?.[0]?.images?.taskImage || quest.taskImageLink || '/images/placeholder-quest.png';
  const traderImage = questImages?.[0]?.images?.traderAvatar || quest.trader?.imageLink || '/images/placeholder-trader.png';
  const mapImage = questImages?.[0]?.images?.mapImage || quest.map?.normalizedName;

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
      }
    });

    return Array.from(requiredItemsMap.values()).slice(0, 3); // Limitar a 3 itens no card
  };

  // Informações organizadas da quest
  const questInfo = useMemo(() => {
    const objectives = quest.objectives || [];
    const itemObjectives = objectives.filter(obj => obj.type === 'item' || obj.type === 'TaskObjectiveItem');
    const skillObjectives = objectives.filter(obj => obj.type === 'skill' || obj.type === 'TaskObjectiveSkill');
    const traderObjectives = objectives.filter(obj => obj.type === 'trader' || obj.type === 'TaskObjectiveTraderLevel');
    const requiredItems = getRequiredItems();
    
    // Contar quests relacionadas
    const previousQuests = quest.taskRequirements?.filter(req => req.task) || [];
    const nextQuests = allQuests.filter(otherQuest => 
      otherQuest.taskRequirements?.some(req => req.task?.id === quest.id)
    ).slice(0, 2);
    
    return {
      totalObjectives: objectives.length,
      itemObjectives: itemObjectives.length,
      skillObjectives: skillObjectives.length,
      traderObjectives: traderObjectives.length,
      requiredItems,
      previousQuests,
      nextQuests,
      hasRewards: !!(quest.startRewards || quest.finishRewards),
      isHighLevel: (quest.minPlayerLevel || 0) >= 40,
      isEndGame: quest.kappaRequired || quest.lightkeeperRequired,
      totalRewards: (
        (quest.startRewards?.items?.length || 0) +
        (quest.finishRewards?.items?.length || 0) +
        (quest.startRewards?.offerUnlock?.length || 0) +
        (quest.finishRewards?.offerUnlock?.length || 0) +
        (quest.startRewards?.skillLevelReward?.length || 0) +
        (quest.finishRewards?.skillLevelReward?.length || 0)
      ),
    };
  }, [quest, allQuests]);

  const getQuestTypeColor = () => {
    if (quest.kappaRequired) return 'text-yellow-400';
    if (quest.lightkeeperRequired) return 'text-blue-400';
    if (questInfo.isHighLevel) return 'text-orange-400';
    return 'text-tarkov-muted';
  };

  const getQuestTypeBadges = () => {
    const badges = [];
    if (quest.kappaRequired) {
      badges.push({
        text: 'Kappa',
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        icon: TrophyIcon
      });
    }
    if (quest.lightkeeperRequired) {
      badges.push({
        text: 'Lightkeeper',
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        icon: StarIcon
      });
    }
    if (quest.restartable) {
      badges.push({
        text: 'Reiniciável',
        color: 'bg-green-500/20 text-green-400 border-green-500/30',
        icon: ClockIcon
      });
    }
    return badges;
  };

  const getDifficultyBadge = () => {
    if (questInfo.isEndGame) return { text: 'End Game', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    if (questInfo.isHighLevel) return { text: 'Advanced', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
    return { text: 'Standard', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle?.(e);
  };

  const handleComparisonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComparisonToggle?.(e);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(e);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickPreview?.();
  };

  if (viewMode === 'list') {
    return (
      <div
        className={`
          group relative overflow-hidden rounded-xl border border-card-border/50 
          bg-gradient-to-r from-background-secondary/50 to-background-tertiary/50 backdrop-blur-md
          hover:border-tarkov-accent/50 hover:shadow-lg hover:shadow-tarkov-accent/10
          cursor-pointer transition-all duration-300 ease-out
          animate-fade-in z-0
        `}
        style={{
          animationDelay: `${Math.min(index * 0.05, 0.5)}s`,
          animationFillMode: 'both'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onQuestClick}
      >
        <div className="flex items-center p-4 space-x-4">
          {/* Imagem da Quest */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-background-primary/50 border border-card-border/30">
              <img
                src={questImage}
                alt={quest.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/images/placeholder-quest.png';
                }}
              />
            </div>
            {/* Badges de tipo da quest */}
            {getQuestTypeBadges().length > 0 && (
              <div className="absolute -top-2 -right-2 flex flex-col gap-1">
                {getQuestTypeBadges().slice(0, 2).map((badge, index) => (
                  <div key={index} className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color} flex items-center gap-1`}>
                    <badge.icon className="w-3 h-3" />
                    {badge.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informações principais */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground truncate group-hover:text-tarkov-accent transition-colors">
                  {quest.name}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <img
                      src={traderImage}
                      alt={quest.trader?.name}
                      className="w-4 h-4 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder-trader.png';
                      }}
                    />
                    <span>{quest.trader?.name}</span>
                  </div>
                  {quest.map && (
                    <>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <MapIcon className="w-4 h-4" />
                        <span>{quest.map.name}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Badges de dificuldade e tipo */}
              <div className="flex flex-col items-end space-y-2 ml-4">
                {getDifficultyBadge() && (
                  <Badge variant="secondary" className={getDifficultyBadge()!.color}>
                    {getDifficultyBadge()!.text}
                  </Badge>
                )}
                {quest.experience && quest.experience > 0 && (
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <TrophyIcon className="w-4 h-4" />
                    <span>{quest.experience.toLocaleString()} XP</span>
                  </div>
                )}
              </div>
            </div>

            {/* Objetivos e requisitos */}
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center space-x-1">
                <CheckCircleIcon className="w-4 h-4" />
                <span>{questInfo.totalObjectives} objetivos</span>
              </div>
              {questInfo.itemObjectives > 0 && (
                <div className="flex items-center space-x-1">
                  <GiftIcon className="w-4 h-4" />
                  <span>{questInfo.itemObjectives} itens</span>
                </div>
              )}
              {quest.minPlayerLevel && (
                <div className="flex items-center space-x-1">
                  <UserIcon className="w-4 h-4" />
                  <span>Nível {quest.minPlayerLevel}</span>
                </div>
              )}
            </div>


            {/* Recompensas */}
            {questInfo.totalRewards > 0 && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <GiftIcon className="w-4 h-4 text-green-400" />
                <span>{questInfo.totalRewards} recompensas</span>
              </div>
            )}
          </div>

          {/* Ações */}
          {showActions && (
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleQuickViewClick}
                className="h-8 w-8 p-0 hover:bg-background-primary/50"
              >
                <EyeIcon className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteClick}
                className={`h-8 w-8 p-0 hover:bg-background-primary/50 ${
                  isFavorite ? 'text-red-400 hover:text-red-300' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isFavorite ? <HeartSolid className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleComparisonClick}
                disabled={!canAddToComparison}
                className={`h-8 w-8 p-0 hover:bg-background-primary/50 ${
                  isInComparison ? 'text-tarkov-accent' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isInComparison ? <ScaleSolid className="w-4 h-4" /> : <ScaleIcon className="w-4 h-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleShareClick}
                className="h-8 w-8 p-0 hover:bg-background-primary/50"
              >
                <ShareIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      className={`
        group relative overflow-hidden rounded-xl border border-card-border/50 
        bg-gradient-to-br from-background-secondary/50 to-background-tertiary/50 backdrop-blur-md
        hover:border-tarkov-accent/50 hover:shadow-lg hover:shadow-tarkov-accent/10
        cursor-pointer transition-all duration-300 ease-out
        animate-fade-in z-0
      `}
      style={{
        animationDelay: `${Math.min(index * 0.05, 0.5)}s`,
        animationFillMode: 'both'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onQuestClick}
    >
      {/* Imagem da Quest */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={questImage}
          alt={quest.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = '/images/placeholder-quest.png';
          }}
        />
        
        {/* Overlay com informações */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges no topo */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {getQuestTypeBadges().map((badge, index) => (
            <Badge key={index} variant="secondary" className={`${badge.color} flex items-center gap-1`}>
              <badge.icon className="w-3 h-3" />
              {badge.text}
            </Badge>
          ))}
          {getDifficultyBadge() && (
            <Badge variant="secondary" className={getDifficultyBadge()!.color}>
              {getDifficultyBadge()!.text}
            </Badge>
          )}
        </div>

        {/* XP no canto superior direito */}
        {quest.experience && quest.experience > 0 && (
          <div className="absolute top-3 right-3 bg-background-primary/90 backdrop-blur-sm rounded-lg px-2 py-1">
            <div className="flex items-center space-x-1 text-sm font-medium text-foreground">
              <TrophyIcon className="w-4 h-4 text-yellow-400" />
              <span>{quest.experience.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Ações no overlay */}
        {showActions && (
          <div className="absolute bottom-3 right-3 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleQuickViewClick}
              className="h-8 w-8 p-0 bg-background-primary/90 backdrop-blur-sm hover:bg-background-primary"
            >
              <EyeIcon className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteClick}
              className={`h-8 w-8 p-0 bg-background-primary/90 backdrop-blur-sm hover:bg-background-primary ${
                isFavorite ? 'text-red-400 hover:text-red-300' : 'text-foreground'
              }`}
            >
              {isFavorite ? <HeartSolid className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleComparisonClick}
              disabled={!canAddToComparison}
              className={`h-8 w-8 p-0 bg-background-primary/90 backdrop-blur-sm hover:bg-background-primary ${
                isInComparison ? 'text-tarkov-accent' : 'text-foreground'
              }`}
            >
              {isInComparison ? <ScaleSolid className="w-4 h-4" /> : <ScaleIcon className="w-4 h-4" />}
            </Button>
          </div>
        )}
      </div>

      {/* Conteúdo do card */}
      <div className="p-4">
        {/* Header com trader e mapa */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <img
              src={traderImage}
              alt={quest.trader?.name}
              className="w-6 h-6 rounded-full border border-card-border/30"
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder-trader.png';
              }}
            />
            <span className="text-sm font-medium text-foreground">{quest.trader?.name}</span>
          </div>
          
          {quest.map && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <MapIcon className="w-3 h-3" />
              <span>{quest.map.name}</span>
            </div>
          )}
        </div>

        {/* Nome da quest */}
        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-tarkov-accent transition-colors">
          {quest.name}
        </h3>

        {/* Informações rápidas */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <div className="flex items-center space-x-1">
            <CheckCircleIcon className="w-4 h-4" />
            <span>{questInfo.totalObjectives} objetivos</span>
          </div>
          
          {quest.minPlayerLevel && (
            <div className="flex items-center space-x-1">
              <UserIcon className="w-4 h-4" />
              <span>Nível {quest.minPlayerLevel}</span>
            </div>
          )}
        </div>

        {/* Objetivos resumidos */}
        <div className="flex items-center space-x-3 text-xs text-muted-foreground mb-2">
          {questInfo.itemObjectives > 0 && (
            <div className="flex items-center space-x-1">
              <GiftIcon className="w-3 h-3" />
              <span>{questInfo.itemObjectives} itens</span>
            </div>
          )}
          {questInfo.skillObjectives > 0 && (
            <div className="flex items-center space-x-1">
              <StarIcon className="w-3 h-3" />
              <span>{questInfo.skillObjectives} skills</span>
            </div>
          )}
        </div>


        {/* Recompensas disponíveis */}
        {questInfo.totalRewards > 0 && (
          <div className="mt-2 pt-2 border-t border-card-border/30">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <GiftIcon className="w-3 h-3 text-green-400" />
              <span>{questInfo.totalRewards} recompensas</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestCard;