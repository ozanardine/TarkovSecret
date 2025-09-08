'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { ErrorDisplay, ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { QuestObjectives } from '@/components/quests/QuestObjectives';
import { QuestRewards } from '@/components/quests/QuestRewards';
import { QuestRequirements } from '@/components/quests/QuestRequirements';
import { useTarkov } from '@/hooks/useTarkov';
import { useImages } from '@/hooks/useImages';
import { useSkills } from '@/hooks/useSkills';
import { TarkovQuest } from '@/types/tarkov';
import { cn } from '@/lib/utils';
import {
  ArrowLeftIcon,
  HeartIcon,
  ShareIcon,
  UserIcon,
  MapPinIcon,
  StarIcon,
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  GiftIcon,
  CurrencyDollarIcon,
  TagIcon,
  LinkIcon,
  ChartBarIcon,
  QueueListIcon,
  EyeIcon,
  BookOpenIcon,
  CogIcon,
  ShieldCheckIcon,
  ArrowUpRightIcon,
  HomeIcon,
  ChevronRightIcon,
  PlayIcon,
  DocumentTextIcon,
  CalendarIcon,
  FireIcon,
  BeakerIcon,
  PuzzlePieceIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

export default function QuestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { useQuests, useQuestFavorites } = useTarkov;
  const { getSkillImage } = useSkills();
  
  const questId = params.id as string;
  const { quests, loading: questsLoading, error } = useQuests();
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useQuestFavorites();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'objectives' | 'rewards' | 'requirements' | 'related'>('overview');
  const [imageError, setImageError] = useState(false);
  const [skillImageErrors, setSkillImageErrors] = useState<Set<string>>(new Set());
  
  // Find the specific quest
  const quest = quests.find(q => q.id === questId);
  const isQuestFavorite = isFavorite(questId);
  const loading = questsLoading;

  // Hook para obter imagens da quest
  const { data: questImages } = useImages({
    type: 'quests',
    ids: [questId],
    imageTypes: ['taskImage', 'taskImageLink', 'traderAvatar', 'mapImage']
  });

  const questImage = questImages?.[0]?.images?.taskImage || questImages?.[0]?.images?.taskImageLink || quest?.taskImageLink || '/images/placeholder-quest.png';
  const traderImage = questImages?.[0]?.images?.traderAvatar || quest?.trader?.imageLink || quest?.trader?.image4xLink || '/images/placeholder-trader.png';

  useEffect(() => {
    if (quest) {
      setImageError(false);
    }
  }, [quest]);

  const handleFavoriteToggle = useCallback(() => {
    if (!quest) return;
    
    if (isQuestFavorite) {
      removeFromFavorites(questId);
    } else {
      addToFavorites(questId);
    }
  }, [quest, isQuestFavorite, questId, removeFromFavorites, addToFavorites]);

  const handleShare = useCallback(async () => {
    if (navigator.share && quest) {
      try {
        await navigator.share({
          title: `Quest: ${quest.name}`,
          text: `Confira a quest ${quest.name} do Tarkov`,
          url: window.location.href
        });
      } catch (error) {
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }, [quest]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Mapeamento de skills para ícones (fallback) - memoizado
  const getSkillIcon = useMemo(() => {
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
    return (skillName: string) => skillIcons[skillName] || '⭐';
  }, []);

  const getTraderImage = useCallback(() => {
    if (imageError || !quest?.trader?.imageLink) {
      return '/images/placeholder-trader.png';
    }
    return quest.trader.imageLink;
  }, [imageError, quest?.trader?.imageLink]);

  // Obter informações sobre quests relacionadas - memoizado
  const getPreviousQuests = useMemo(() => {
    return quest?.taskRequirements?.filter(req => req.task) || [];
  }, [quest?.taskRequirements]);

  // Encontrar quests que serão liberadas ao completar a atual - memoizado
  const getNextQuests = useMemo(() => {
    if (!quest || !quests.length) return [];
    
    return quests.filter(otherQuest => 
      otherQuest.taskRequirements?.some(req => 
        req.task?.id === quest.id
      )
    ).slice(0, 6); // Limitar a 6 próximas quests
  }, [quest, quests]);

  // Extrair itens obrigatórios dos objetivos - memoizado
  const requiredItems = useMemo(() => {
    if (!quest) return [];
    
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
  }, [quest?.objectives]);

  // Extrair mapas dos objetivos quando não há mapa principal - memoizado
  const getObjectiveMaps = useMemo(() => {
    if (!quest || quest.map) return null; // Se já tem mapa principal, não precisa dos objetivos
    
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
  }, [quest?.objectives, quest?.map]);

  const totalRewards = useMemo(() => (
    (quest?.startRewards?.items?.length || 0) +
    (quest?.finishRewards?.items?.length || 0) +
    (quest?.startRewards?.offerUnlock?.length || 0) +
    (quest?.finishRewards?.offerUnlock?.length || 0) +
    (quest?.startRewards?.skillLevelReward?.length || 0) +
    (quest?.finishRewards?.skillLevelReward?.length || 0)
  ), [quest?.startRewards, quest?.finishRewards]);

  const getQuestTypeBadges = useMemo(() => {
    const badges = [];
    if (quest?.kappaRequired) {
      badges.push(
        <Badge key="kappa" variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          <TrophyIcon className="w-3 h-3 mr-1" />
          Kappa
        </Badge>
      );
    }
    if (quest?.lightkeeperRequired) {
      badges.push(
        <Badge key="lightkeeper" variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          <StarIcon className="w-3 h-3 mr-1" />
          Lightkeeper
        </Badge>
      );
    }
    if (quest?.restartable) {
      badges.push(
        <Badge key="restartable" variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
          <ClockIcon className="w-3 h-3 mr-1" />
          Reiniciável
        </Badge>
      );
    }
    return badges;
  }, [quest?.kappaRequired, quest?.lightkeeperRequired, quest?.restartable]);

  const getDifficultyInfo = () => {
    if (!quest) return null;
    
    const isEndGame = quest.kappaRequired || quest.lightkeeperRequired;
    const isHighLevel = (quest.minPlayerLevel || 0) >= 40;
    
    if (isEndGame) {
      return {
        level: 'End Game',
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30'
      };
    }
    
    if (isHighLevel) {
      return {
        level: 'High Level',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/20',
        borderColor: 'border-orange-500/30'
      };
    }
    
    return {
      level: 'Standard',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30'
    };
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading />
        </div>
      </PageLayout>
    );
  }

  if (error || !quest) {
    return (
      <PageLayout>
        <ErrorDisplay
          error={error || new Error('Quest não encontrada')}
          title="Quest não encontrada"
          description="A quest solicitada não foi encontrada ou ocorreu um erro ao carregá-la."
          onRetry={() => router.push('/quests')}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary/20 to-background-primary">
        {/* Breadcrumb Navigation */}
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <nav className="flex items-center space-x-2 text-sm text-tarkov-muted mb-6">
            <button
              onClick={() => router.push('/')}
              className="flex items-center hover:text-tarkov-light transition-colors"
            >
              <HomeIcon className="w-4 h-4 mr-1" />
              Home
            </button>
            <ChevronRightIcon className="w-4 h-4" />
            <button
              onClick={() => router.push('/quests')}
              className="hover:text-tarkov-light transition-colors"
            >
              Quests
            </button>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-tarkov-light font-medium truncate max-w-xs">
              {quest?.name || 'Carregando...'}
            </span>
          </nav>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <img
              src={questImage}
              alt={quest?.name || 'Quest'}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background-primary via-background-primary/80 to-background-primary/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-background-primary/60 via-transparent to-background-primary/60" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Quest Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="text-tarkov-muted hover:text-tarkov-light hover:bg-background-secondary/50 backdrop-blur-sm border border-card-border/30"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFavoriteToggle}
                      className={cn(
                        "backdrop-blur-sm border border-card-border/30 transition-all",
                        isQuestFavorite 
                          ? "text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20" 
                          : "text-tarkov-muted hover:text-red-400 hover:bg-red-500/10"
                      )}
                      title={isQuestFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    >
                      {isQuestFavorite ? (
                        <HeartSolid className="w-4 h-4" />
                      ) : (
                        <HeartIcon className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleShare}
                      className="text-tarkov-muted hover:text-blue-400 hover:bg-blue-500/10 backdrop-blur-sm border border-card-border/30 transition-all"
                      title="Compartilhar quest"
                    >
                      <ShareIcon className="w-4 h-4" />
                    </Button>

                    {quest?.wikiLink && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(quest.wikiLink, '_blank')}
                        className="text-tarkov-muted hover:text-tarkov-accent hover:bg-tarkov-accent/10 backdrop-blur-sm border border-card-border/30 transition-all"
                        title="Ver no Wiki"
                      >
                        <ArrowUpRightIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Quest Title and Basic Info */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {getQuestTypeBadges}
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-bold text-tarkov-light leading-tight">
                    {quest?.name}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-6 text-tarkov-muted">
                    {quest?.trader && (
                      <div className="flex items-center gap-2">
                        <img
                          src={getTraderImage()}
                          alt={quest.trader.name}
                          className="w-6 h-6 rounded-full border border-card-border/30"
                          onError={handleImageError}
                        />
                        <span>{quest.trader.name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{quest?.map?.name || getObjectiveMaps || 'Qualquer local'}</span>
                    </div>
                    
                    {quest?.minPlayerLevel && (
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-4 h-4" />
                        <span>Nível {quest.minPlayerLevel}+</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <TrophyIcon className="w-4 h-4 text-tarkov-accent" />
                      <span className="text-tarkov-accent font-semibold">
                        {(quest?.experience || 0).toLocaleString()} XP
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {quest?.descriptionMessageId && (
                    <p className="text-lg text-tarkov-muted leading-relaxed max-w-3xl">
                      {quest.descriptionMessageId}
                    </p>
                  )}
                </div>
              </div>

              {/* Side Stats */}
              <div className="space-y-4">
                {/* Quick Stats Card */}
                <div className="bg-background-tertiary/60 backdrop-blur-sm rounded-xl border border-card-border/30 p-6">
                  <h3 className="text-lg font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5 text-tarkov-accent" />
                    Estatísticas Rápidas
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {quest?.objectives?.length || 0}
                      </div>
                      <div className="text-xs text-tarkov-muted">Objetivos</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {totalRewards}
                      </div>
                      <div className="text-xs text-tarkov-muted">Recompensas</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {getPreviousQuests.length}
                      </div>
                      <div className="text-xs text-tarkov-muted">Pré-requisitos</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {getNextQuests.length}
                      </div>
                      <div className="text-xs text-tarkov-muted">Desbloqueia</div>
                    </div>
                  </div>
                </div>

                {/* Required Items Preview */}
                {requiredItems.length > 0 && (
                  <div className="bg-background-tertiary/60 backdrop-blur-sm rounded-xl border border-card-border/30 p-6">
                    <h3 className="text-lg font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                      <TagIcon className="w-5 h-5 text-tarkov-accent" />
                      Itens Necessários
                    </h3>
                    
                    <div className="space-y-3">
                      {requiredItems.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-background-secondary/50 rounded-lg flex items-center justify-center">
                            {item.item.iconLink ? (
                              <img 
                                src={item.item.iconLink} 
                                alt={item.item.shortName}
                                className="w-6 h-6 object-contain"
                              />
                            ) : (
                              <TagIcon className="w-4 h-4 text-tarkov-muted" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-tarkov-light truncate">
                              {item.item.shortName}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-tarkov-muted">
                              <span>x{item.count}</span>
                              {item.foundInRaid && (
                                <span className="text-yellow-400">FIR</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {requiredItems.length > 3 && (
                        <div className="text-xs text-tarkov-muted text-center pt-2 border-t border-card-border/20">
                          +{requiredItems.length - 3} mais itens...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">

              {/* Modern Tab Navigation */}
              <div className="bg-background-tertiary/40 backdrop-blur-sm rounded-2xl border border-card-border/30 overflow-hidden">
                <div className="flex flex-wrap border-b border-card-border/20">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={cn(
                      "flex items-center gap-2 px-6 py-4 font-medium transition-all relative",
                      activeTab === 'overview'
                        ? "text-tarkov-accent bg-tarkov-accent/10 border-b-2 border-tarkov-accent"
                        : "text-tarkov-muted hover:text-tarkov-light hover:bg-background-secondary/30"
                    )}
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>Visão Geral</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('objectives')}
                    className={cn(
                      "flex items-center gap-2 px-6 py-4 font-medium transition-all relative",
                      activeTab === 'objectives'
                        ? "text-tarkov-accent bg-tarkov-accent/10 border-b-2 border-tarkov-accent"
                        : "text-tarkov-muted hover:text-tarkov-light hover:bg-background-secondary/30"
                    )}
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Objetivos</span>
                    {quest?.objectives && quest.objectives.length > 0 && (
                      <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-xs">
                        {quest.objectives.length}
                      </span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('rewards')}
                    className={cn(
                      "flex items-center gap-2 px-6 py-4 font-medium transition-all relative",
                      activeTab === 'rewards'
                        ? "text-tarkov-accent bg-tarkov-accent/10 border-b-2 border-tarkov-accent"
                        : "text-tarkov-muted hover:text-tarkov-light hover:bg-background-secondary/30"
                    )}
                  >
                    <GiftIcon className="w-4 h-4" />
                    <span>Recompensas</span>
                    {totalRewards > 0 && (
                      <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full text-xs">
                        {totalRewards}
                      </span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('requirements')}
                    className={cn(
                      "flex items-center gap-2 px-6 py-4 font-medium transition-all relative",
                      activeTab === 'requirements'
                        ? "text-tarkov-accent bg-tarkov-accent/10 border-b-2 border-tarkov-accent"
                        : "text-tarkov-muted hover:text-tarkov-light hover:bg-background-secondary/30"
                    )}
                  >
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span>Requisitos</span>
                    {(getPreviousQuests.length + (quest?.traderLevelRequirements?.length || 0) + (quest?.minPlayerLevel ? 1 : 0)) > 0 && (
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-xs">
                        {getPreviousQuests.length + (quest?.traderLevelRequirements?.length || 0) + (quest?.minPlayerLevel ? 1 : 0)}
                      </span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('related')}
                    className={cn(
                      "flex items-center gap-2 px-6 py-4 font-medium transition-all relative",
                      activeTab === 'related'
                        ? "text-tarkov-accent bg-tarkov-accent/10 border-b-2 border-tarkov-accent"
                        : "text-tarkov-muted hover:text-tarkov-light hover:bg-background-secondary/30"
                    )}
                  >
                    <PuzzlePieceIcon className="w-4 h-4" />
                    <span>Relacionadas</span>
                    {getNextQuests.length > 0 && (
                      <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full text-xs">
                        {getNextQuests.length}
                      </span>
                    )}
                  </button>
                </div>
                {/* Tab Content */}
                <div className="p-8">
                  {activeTab === 'overview' && (
                    <div className="space-y-8">
                      {/* Quick Overview Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Objectives Summary */}
                        <div className="bg-background-secondary/30 backdrop-blur-sm rounded-xl border border-card-border/20 p-6">
                          <h4 className="text-lg font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                            <CheckCircleIcon className="w-5 h-5 text-green-400" />
                            Objetivos Principais
                          </h4>
                          <div className="space-y-3">
                            {quest?.objectives?.slice(0, 4).map((objective, index) => (
                              <div key={index} className="flex items-start gap-3 p-3 bg-background-primary/30 rounded-lg">
                                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-xs font-bold text-green-400">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm text-tarkov-light leading-relaxed">
                                    {objective.description || `Objetivo ${index + 1}`}
                                  </p>
                                  {objective.optional && (
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                      Opcional
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                            {quest?.objectives && quest.objectives.length > 4 && (
                              <button
                                onClick={() => setActiveTab('objectives')}
                                className="w-full mt-3 p-3 text-sm text-tarkov-accent hover:text-tarkov-light bg-tarkov-accent/10 hover:bg-tarkov-accent/20 rounded-lg transition-all border border-tarkov-accent/30"
                              >
                                Ver todos os {quest.objectives.length} objetivos
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Rewards Summary */}
                        <div className="bg-background-secondary/30 backdrop-blur-sm rounded-xl border border-card-border/20 p-6">
                          <h4 className="text-lg font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                            <GiftIcon className="w-5 h-5 text-yellow-400" />
                            Recompensas
                          </h4>
                          <div className="space-y-4">
                            {/* Experience */}
                            {quest?.experience && quest.experience > 0 && (
                              <div className="flex items-center gap-3 p-3 bg-background-primary/30 rounded-lg">
                                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                  <TrophyIcon className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div>
                                  <div className="text-lg font-bold text-yellow-400">
                                    {quest.experience.toLocaleString()} XP
                                  </div>
                                  <div className="text-sm text-tarkov-muted">Experiência</div>
                                </div>
                              </div>
                            )}
                            
                            {/* Items count */}
                            {quest?.finishRewards?.items && quest.finishRewards.items.length > 0 && (
                              <div className="flex items-center gap-3 p-3 bg-background-primary/30 rounded-lg">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                  <TagIcon className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                  <div className="text-lg font-bold text-blue-400">
                                    {quest.finishRewards.items.length} Itens
                                  </div>
                                  <div className="text-sm text-tarkov-muted">Recompensas de item</div>
                                </div>
                              </div>
                            )}
                            
                            {/* Trader standing */}
                            {quest?.finishRewards?.traderStanding && quest.finishRewards.traderStanding.length > 0 && (
                              <div className="flex items-center gap-3 p-3 bg-background-primary/30 rounded-lg">
                                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                  <UserIcon className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                  <div className="text-lg font-bold text-green-400">
                                    {quest.finishRewards.traderStanding[0]?.standing && quest.finishRewards.traderStanding[0].standing > 0 ? '+' : ''}{quest.finishRewards.traderStanding[0]?.standing} Rep
                                  </div>
                                  <div className="text-sm text-tarkov-muted">
                                    {quest.finishRewards.traderStanding[0]?.trader?.name}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <button
                              onClick={() => setActiveTab('rewards')}
                              className="w-full mt-3 p-3 text-sm text-tarkov-accent hover:text-tarkov-light bg-tarkov-accent/10 hover:bg-tarkov-accent/20 rounded-lg transition-all border border-tarkov-accent/30"
                            >
                              Ver todas as recompensas
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Progress Timeline */}
                      {(getPreviousQuests.length > 0 || getNextQuests.length > 0) && (
                        <div className="bg-background-secondary/30 backdrop-blur-sm rounded-xl border border-card-border/20 p-6">
                          <h4 className="text-lg font-semibold text-tarkov-light mb-6 flex items-center gap-2">
                            <RocketLaunchIcon className="w-5 h-5 text-purple-400" />
                            Linha do Tempo da Quest
                          </h4>
                          
                          <div className="flex items-center gap-4 overflow-x-auto pb-4">
                            {/* Previous Quests */}
                            {getPreviousQuests.slice(0, 3).map((req, index) => (
                              <div key={index} className="flex items-center gap-2 flex-shrink-0">
                                <div className="w-24 h-16 bg-green-500/20 rounded-lg flex flex-col items-center justify-center border border-green-500/30">
                                  <CheckCircleIcon className="w-4 h-4 text-green-400 mb-1" />
                                  <span className="text-xs text-green-400 text-center leading-tight">
                                    {req.task.name.slice(0, 15)}...
                                  </span>
                                </div>
                                <ChevronRightIcon className="w-4 h-4 text-tarkov-muted" />
                              </div>
                            ))}
                            
                            {/* Current Quest */}
                            <div className="w-24 h-16 bg-tarkov-accent/20 rounded-lg flex flex-col items-center justify-center border-2 border-tarkov-accent flex-shrink-0">
                              <PlayIcon className="w-4 h-4 text-tarkov-accent mb-1" />
                              <span className="text-xs text-tarkov-accent text-center leading-tight font-semibold">
                                ATUAL
                              </span>
                            </div>
                            
                            {/* Next Quests */}
                            {getNextQuests.slice(0, 3).map((nextQuest, index) => (
                              <div key={index} className="flex items-center gap-2 flex-shrink-0">
                                <ChevronRightIcon className="w-4 h-4 text-tarkov-muted" />
                                <div className="w-24 h-16 bg-purple-500/20 rounded-lg flex flex-col items-center justify-center border border-purple-500/30">
                                  <StarIcon className="w-4 h-4 text-purple-400 mb-1" />
                                  <span className="text-xs text-purple-400 text-center leading-tight">
                                    {nextQuest.name.slice(0, 15)}...
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-4">
                        {quest?.wikiLink && (
                          <Button
                            variant="outline"
                            onClick={() => window.open(quest.wikiLink, '_blank')}
                            className="flex items-center gap-2 bg-background-secondary/30 hover:bg-background-secondary/50 border-card-border/30"
                          >
                            <BookOpenIcon className="w-4 h-4" />
                            Ver no Wiki
                            <ArrowUpRightIcon className="w-3 h-3" />
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('objectives')}
                          className="flex items-center gap-2 bg-background-secondary/30 hover:bg-background-secondary/50 border-card-border/30"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                          Ver Objetivos Detalhados
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('related')}
                          className="flex items-center gap-2 bg-background-secondary/30 hover:bg-background-secondary/50 border-card-border/30"
                        >
                          <PuzzlePieceIcon className="w-4 h-4" />
                          Quests Relacionadas
                        </Button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'objectives' && (
                    <QuestObjectives
                      objectives={quest?.objectives || []}
                      failConditions={quest?.failConditions || []}
                    />
                  )}

                  {activeTab === 'rewards' && (
                    <QuestRewards
                      startRewards={quest?.startRewards}
                      finishRewards={quest?.finishRewards}
                      failureOutcome={quest?.failureOutcome}
                    />
                  )}

                  {activeTab === 'requirements' && (
                    <QuestRequirements
                      taskRequirements={quest?.taskRequirements || []}
                      traderLevelRequirements={quest?.traderLevelRequirements || []}
                      minPlayerLevel={quest?.minPlayerLevel}
                    />
                  )}

                  {activeTab === 'related' && (
                    <div className="space-y-8">
                      {/* Previous Quests */}
                      {getPreviousQuests.length > 0 && (
                        <div>
                          <h3 className="text-xl font-semibold text-tarkov-light mb-6 flex items-center gap-2">
                            <CheckCircleIcon className="w-6 h-6 text-green-400" />
                            Quests Anteriores Necessárias
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {getPreviousQuests.map((requirement, index) => (
                              <div key={index} className="bg-background-secondary/30 backdrop-blur-sm rounded-xl border border-card-border/20 p-6 hover:bg-background-secondary/40 transition-all">
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                                    <CheckCircleIcon className="w-6 h-6 text-green-400" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-tarkov-light">
                                      {requirement.task.name}
                                    </h4>
                                    <p className="text-sm text-tarkov-muted">
                                      Status: {Array.isArray(requirement.status) ? requirement.status.join(', ') : requirement.status || 'Completa'}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-xs text-tarkov-muted">
                                  ID: {requirement.task.id}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Next Quests */}
                      {getNextQuests.length > 0 && (
                        <div>
                          <h3 className="text-xl font-semibold text-tarkov-light mb-6 flex items-center gap-2">
                            <StarIcon className="w-6 h-6 text-purple-400" />
                            Próximas Quests Liberadas
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {getNextQuests.map((nextQuest, index) => (
                              <div 
                                key={index} 
                                className="bg-background-secondary/30 backdrop-blur-sm rounded-xl border border-card-border/20 p-6 hover:bg-background-secondary/40 transition-all cursor-pointer group"
                                onClick={() => router.push(`/quest/${nextQuest.id}`)}
                              >
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    {nextQuest.trader?.imageLink ? (
                                      <img 
                                        src={nextQuest.trader.imageLink} 
                                        alt={nextQuest.trader.name}
                                        className="w-8 h-8 object-cover rounded"
                                      />
                                    ) : (
                                      <UserIcon className="w-6 h-6 text-purple-400" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-tarkov-light group-hover:text-tarkov-accent transition-colors">
                                      {nextQuest.name}
                                    </h4>
                                    <p className="text-sm text-tarkov-muted">
                                      {nextQuest.trader?.name}
                                    </p>
                                  </div>
                                  <ArrowUpRightIcon className="w-4 h-4 text-tarkov-muted group-hover:text-tarkov-accent transition-colors" />
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm text-tarkov-muted">
                                    <TrophyIcon className="w-4 h-4" />
                                    <span>{nextQuest.experience?.toLocaleString() || 0} XP</span>
                                  </div>
                                  
                                  {nextQuest.minPlayerLevel && (
                                    <div className="flex items-center gap-2 text-sm text-tarkov-muted">
                                      <UserIcon className="w-4 h-4" />
                                      <span>Nível {nextQuest.minPlayerLevel}+</span>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center gap-2 text-sm text-tarkov-muted">
                                    <CheckCircleIcon className="w-4 h-4" />
                                    <span>{nextQuest.objectives?.length || 0} objetivos</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quest Chain Visualization */}
                      {(getPreviousQuests.length > 0 || getNextQuests.length > 0) && (
                        <div>
                          <h3 className="text-xl font-semibold text-tarkov-light mb-6 flex items-center gap-2">
                            <PuzzlePieceIcon className="w-6 h-6 text-tarkov-accent" />
                            Cadeia de Quests
                          </h3>
                          
                          <div className="bg-background-secondary/30 backdrop-blur-sm rounded-xl border border-card-border/20 p-6">
                            <div className="flex items-center justify-center">
                              <div className="flex items-center gap-4 overflow-x-auto max-w-full">
                                {/* Previous quests */}
                                {getPreviousQuests.slice(0, 2).map((req, index) => (
                                  <div key={`prev-${index}`} className="flex items-center gap-2 flex-shrink-0">
                                    <div className="w-20 h-12 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                                      <span className="text-xs text-green-400 text-center leading-tight">
                                        {req.task.name.slice(0, 12)}...
                                      </span>
                                    </div>
                                    <ChevronRightIcon className="w-4 h-4 text-tarkov-muted" />
                                  </div>
                                ))}
                                
                                {/* Current quest */}
                                <div className="w-24 h-16 bg-tarkov-accent/20 rounded-lg flex flex-col items-center justify-center border-2 border-tarkov-accent flex-shrink-0">
                                  <PlayIcon className="w-5 h-5 text-tarkov-accent mb-1" />
                                  <span className="text-xs text-tarkov-accent text-center leading-tight font-semibold">
                                    ATUAL
                                  </span>
                                </div>
                                
                                {/* Next quests */}
                                {getNextQuests.slice(0, 2).map((nextQuest, index) => (
                                  <div key={`next-${index}`} className="flex items-center gap-2 flex-shrink-0">
                                    <ChevronRightIcon className="w-4 h-4 text-tarkov-muted" />
                                    <div 
                                      className="w-20 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-500/30 cursor-pointer hover:bg-purple-500/30 transition-all"
                                      onClick={() => router.push(`/quest/${nextQuest.id}`)}
                                    >
                                      <span className="text-xs text-purple-400 text-center leading-tight">
                                        {nextQuest.name.slice(0, 12)}...
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* No related quests message */}
                      {getPreviousQuests.length === 0 && getNextQuests.length === 0 && (
                        <div className="text-center py-12">
                          <PuzzlePieceIcon className="w-16 h-16 text-tarkov-muted mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-semibold text-tarkov-light mb-2">
                            Nenhuma Quest Relacionada
                          </h3>
                          <p className="text-tarkov-muted">
                            Esta quest não possui pré-requisitos nem desbloqueia outras quests.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modern Sidebar */}
            <div className="space-y-6">
              {/* Quest Status Card */}
              <div className="bg-background-tertiary/60 backdrop-blur-sm rounded-xl border border-card-border/30 p-6">
                <h3 className="text-lg font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5 text-tarkov-accent" />
                  Status da Quest
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-background-primary/30 rounded-lg">
                    <span className="text-sm text-tarkov-muted">Progresso</span>
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      Não Iniciada
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-background-primary/30 rounded-lg">
                    <span className="text-sm text-tarkov-muted">Favorita</span>
                    <Badge variant="secondary" className={isQuestFavorite ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>
                      {isQuestFavorite ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                  
                  {quest?.restartable && (
                    <div className="flex items-center justify-between p-3 bg-background-primary/30 rounded-lg">
                      <span className="text-sm text-tarkov-muted">Restartável</span>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                        Sim
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Trader Info */}
              {quest?.trader && (
                <div className="bg-background-tertiary/60 backdrop-blur-sm rounded-xl border border-card-border/30 p-6">
                  <h3 className="text-lg font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-blue-400" />
                    Trader
                  </h3>
                  
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <img
                        src={getTraderImage()}
                        alt={quest.trader.name}
                        className="w-20 h-20 rounded-full border-2 border-card-border/30"
                        onError={handleImageError}
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <UserIcon className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <h4 className="font-semibold text-tarkov-light mb-1">{quest.trader.name}</h4>
                    <p className="text-sm text-tarkov-muted">ID: {quest.trader.id}</p>
                  </div>
                </div>
              )}

              {/* Map Info */}
              {quest?.map && (
                <div className="bg-background-tertiary/60 backdrop-blur-sm rounded-xl border border-card-border/30 p-6">
                  <h3 className="text-lg font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-green-400" />
                    Localização
                  </h3>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-500/20 rounded-xl mx-auto mb-4 flex items-center justify-center border border-green-500/30">
                      <MapPinIcon className="w-10 h-10 text-green-400" />
                    </div>
                    <h4 className="font-semibold text-tarkov-light mb-1">{quest.map.name}</h4>
                    <p className="text-sm text-tarkov-muted">ID: {quest.map.id}</p>
                  </div>
                </div>
              )}

              {/* Additional Quest Info */}
              <div className="bg-background-tertiary/60 backdrop-blur-sm rounded-xl border border-card-border/30 p-6">
                <h3 className="text-lg font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-purple-400" />
                  Informações Extras
                </h3>
                
                <div className="space-y-3">
                  {quest?.availableDelaySecondsMin && (
                    <div className="flex items-center justify-between p-3 bg-background-primary/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-tarkov-muted">Delay Mín</span>
                      </div>
                      <span className="text-sm font-semibold text-yellow-400">
                        {Math.floor(quest.availableDelaySecondsMin / 3600)}h
                      </span>
                    </div>
                  )}
                  
                  {quest?.availableDelaySecondsMax && (
                    <div className="flex items-center justify-between p-3 bg-background-primary/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-orange-400" />
                        <span className="text-sm text-tarkov-muted">Delay Máx</span>
                      </div>
                      <span className="text-sm font-semibold text-orange-400">
                        {Math.floor(quest.availableDelaySecondsMax / 3600)}h
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between p-3 bg-background-primary/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-tarkov-muted">Quest ID</span>
                    </div>
                    <span className="text-sm font-mono text-blue-400">
                      {quest?.id.slice(-8)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}