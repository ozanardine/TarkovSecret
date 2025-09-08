'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { PageLayout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { InfiniteLoading } from '@/components/ui/InfiniteLoading';
import { AdvancedQuestFilters, AdvancedQuestFiltersState } from '@/components/quests/AdvancedQuestFilters';
import { QuestCard } from '@/components/quests/QuestCard';
import { QuestQuickPreview } from '@/components/quests/QuestQuickPreview';
import { QuestComparison } from '@/components/quests/QuestComparison';
import { useTarkov } from '@/hooks/useTarkov';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { TarkovQuest } from '@/types/tarkov';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowUpIcon,
  ChartBarIcon,
  ShareIcon,
  ScaleIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

type ViewMode = 'grid' | 'list';

const QUESTS_PER_LOAD = 24;

export default function QuestsPage() {
  const router = useRouter();
  const { useQuests, useQuestSearch, useQuestFavorites, useQuestComparison } = useTarkov;
  const { quests, loading, error } = useQuests();
  const { searchResults, loading: searchLoading, search, clearSearch } = useQuestSearch();
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useQuestFavorites();
  const { 
    questsInComparison, 
    addToComparison, 
    removeFromComparison, 
    isInComparison, 
    canAddToComparison,
    clearComparison,
    isComparisonModalOpen,
    openComparisonModal,
    closeComparisonModal 
  } = useQuestComparison();
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [displayedQuests, setDisplayedQuests] = useState(QUESTS_PER_LOAD);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<TarkovQuest | null>(null);
  const [isQuickPreviewOpen, setIsQuickPreviewOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Estado dos filtros
  const [filters, setFilters] = useState<AdvancedQuestFiltersState>({
    search: '',
    trader: [],
    map: [],
    minPlayerLevel: 0,
    maxPlayerLevel: 100,
    experienceRange: [0, 100000],
    questType: [],
    objectiveType: [],
    kappaRequired: null,
    lightkeeperRequired: null,
    restartable: null,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Filtrar e ordenar quests com filtros avançados
  const filteredQuests = useMemo(() => {
    let filtered = quests.filter(quest => {
      // Filtro de busca
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!quest.name.toLowerCase().includes(searchLower) &&
            !quest.trader?.name.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Filtro de trader
      if (filters.trader.length > 0) {
        if (!quest.trader || !filters.trader.includes(quest.trader.name)) {
          return false;
        }
      }

      // Filtro de mapa
      if (filters.map.length > 0) {
        if (!quest.map || !filters.map.includes(quest.map.name)) {
          return false;
        }
      }

      // Filtro de nível do jogador
      if (quest.minPlayerLevel) {
        if (quest.minPlayerLevel < filters.minPlayerLevel || quest.minPlayerLevel > filters.maxPlayerLevel) {
          return false;
        }
      }

      // Filtro de experiência
      if (quest.experience < filters.experienceRange[0] || quest.experience > filters.experienceRange[1]) {
        return false;
      }

      // Filtro de tipo de quest
      if (filters.questType.length > 0) {
        const isKappa = quest.kappaRequired && filters.questType.includes('kappa');
        const isLightkeeper = quest.lightkeeperRequired && filters.questType.includes('lightkeeper');
        const isHighLevel = (quest.minPlayerLevel || 0) >= 40 && filters.questType.includes('highLevel');
        const isStandard = !quest.kappaRequired && !quest.lightkeeperRequired && (quest.minPlayerLevel || 0) < 40 && filters.questType.includes('standard');
        
        if (!isKappa && !isLightkeeper && !isHighLevel && !isStandard) {
          return false;
        }
      }

      // Filtro de tipo de objetivo
      if (filters.objectiveType.length > 0) {
        const hasMatchingObjective = quest.objectives?.some(objective => 
          filters.objectiveType.includes(objective.type || 'unknown')
        );
        if (!hasMatchingObjective) {
          return false;
        }
      }

      // Filtro de Kappa Required
      if (filters.kappaRequired !== null && quest.kappaRequired !== filters.kappaRequired) {
        return false;
      }

      // Filtro de Lightkeeper Required
      if (filters.lightkeeperRequired !== null && quest.lightkeeperRequired !== filters.lightkeeperRequired) {
        return false;
      }

      // Filtro de Restartable
      if (filters.restartable !== null && quest.restartable !== filters.restartable) {
        return false;
      }

      return true;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'trader':
          aValue = a.trader?.name.toLowerCase() || '';
          bValue = b.trader?.name.toLowerCase() || '';
          break;
        case 'experience':
          aValue = a.experience;
          bValue = b.experience;
          break;
        case 'minPlayerLevel':
          aValue = a.minPlayerLevel || 0;
          bValue = b.minPlayerLevel || 0;
          break;
        case 'objectives':
          aValue = a.objectives?.length || 0;
          bValue = b.objectives?.length || 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [quests, filters]);

  // Quest atual para exibição
  const currentQuests = searchResults.length > 0 ? searchResults : filteredQuests;
  const displayedQuestsList = currentQuests.slice(0, displayedQuests);

  // Handlers
  const handleQuestClick = useCallback((quest: TarkovQuest) => {
    router.push(`/quest/${quest.id}`);
  }, [router]);

  const handleQuickPreview = useCallback((quest: TarkovQuest) => {
    setSelectedQuest(quest);
    setIsQuickPreviewOpen(true);
  }, []);

  const handleFavoriteToggle = useCallback((quest: TarkovQuest) => {
    if (isFavorite(quest.id)) {
      removeFromFavorites(quest.id);
    } else {
      addToFavorites(quest.id);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  const handleComparisonToggle = useCallback((quest: TarkovQuest) => {
    if (isInComparison(quest.id)) {
      removeFromComparison(quest.id);
    } else {
      addToComparison(quest);
    }
  }, [isInComparison, addToComparison, removeFromComparison]);

  const handleShare = useCallback(async (quest: TarkovQuest) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Quest: ${quest.name}`,
          text: `Confira a quest ${quest.name} do Tarkov`,
          url: `${window.location.origin}/quest/${quest.id}`
        });
      } catch (error) {
        navigator.clipboard.writeText(`${window.location.origin}/quest/${quest.id}`);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/quest/${quest.id}`);
    }
  }, []);

  const handleLoadMore = useCallback(() => {
    setDisplayedQuests(prev => Math.min(prev + QUESTS_PER_LOAD, currentQuests.length));
  }, [currentQuests.length]);

  const handleClearSearch = useCallback(() => {
    clearSearch();
    setDisplayedQuests(QUESTS_PER_LOAD);
  }, [clearSearch]);

  const handleFiltersChange = useCallback((newFilters: AdvancedQuestFiltersState) => {
    setFilters(newFilters);
    setDisplayedQuests(QUESTS_PER_LOAD);
  }, []);

  // Scroll handler para botão "Voltar ao topo"
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  if (error) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Erro ao carregar quests</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header da página */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Quests do Tarkov</h1>
            <p className="text-muted-foreground mt-1">
              {searchResults.length > 0 
                ? `${searchResults.length} resultado(s) encontrado(s)`
                : `${filteredQuests.length} quest(s) disponível(is)`
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <FunnelIcon className="w-4 h-4" />
              <span>Filtros</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={openComparisonModal}
              disabled={questsInComparison.length === 0}
              className="flex items-center space-x-2"
            >
              <ScaleIcon className="w-4 h-4" />
              <span>Comparar ({questsInComparison.length})</span>
            </Button>
          </div>
        </div>

        {/* Filtros avançados */}
        {showFilters && (
          <AdvancedQuestFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            quests={quests}
          />
        )}

        {/* Barra de busca */}
        <div className="relative">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome da quest ou trader..."
              value={filters.search}
              onChange={(e) => handleFiltersChange({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-background-secondary/50 border border-card-border/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-tarkov-accent/50 focus:border-tarkov-accent/50 transition-all duration-200"
            />
          </div>
          
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              Limpar
            </Button>
          )}
        </div>

        {/* Controles de visualização */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="flex items-center space-x-2"
            >
              <Squares2X2Icon className="w-4 h-4" />
              <span>Grid</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center space-x-2"
            >
              <ListBulletIcon className="w-4 h-4" />
              <span>Lista</span>
            </Button>
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Ordenar por:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFiltersChange({ ...filters, sortBy: e.target.value as any })}
              className="bg-background-secondary/50 border border-card-border/30 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-tarkov-accent/50"
            >
              <option value="name">Nome</option>
              <option value="trader">Trader</option>
              <option value="experience">Experiência</option>
              <option value="minPlayerLevel">Nível Mínimo</option>
              <option value="objectives">Objetivos</option>
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFiltersChange({ 
                ...filters, 
                sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
              })}
              className="p-1"
            >
              <ArrowUpIcon className={`w-4 h-4 transition-transform ${
                filters.sortOrder === 'desc' ? 'rotate-180' : ''
              }`} />
            </Button>
          </div>
        </div>

        {/* Lista de quests */}
        {displayedQuestsList.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {displayedQuestsList.map((quest, index) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                viewMode={viewMode}
                index={index}
                onQuestClick={() => handleQuestClick(quest)}
                onFavoriteToggle={() => handleFavoriteToggle(quest)}
                onComparisonToggle={() => handleComparisonToggle(quest)}
                onShare={() => handleShare(quest)}
                onQuickPreview={() => handleQuickPreview(quest)}
                isFavorite={isFavorite(quest.id)}
                isInComparison={isInComparison(quest.id)}
                canAddToComparison={canAddToComparison()}
                showActions={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-background-secondary/30 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MagnifyingGlassIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma quest encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {filters.search 
                ? 'Tente ajustar os termos de busca ou filtros aplicados.'
                : 'Não há quests disponíveis com os filtros atuais.'
              }
            </p>
            {filters.search && (
              <Button variant="outline" onClick={handleClearSearch}>
                Limpar busca
              </Button>
            )}
          </div>
        )}

        {/* Botão "Carregar mais" */}
        {displayedQuests < currentQuests.length && (
          <div className="text-center">
            <Button
              onClick={handleLoadMore}
              variant="outline"
              className="px-8"
            >
              Carregar mais quests ({displayedQuests}/{currentQuests.length})
            </Button>
          </div>
        )}

        {/* Botão "Voltar ao topo" */}
        {showBackToTop && (
          <Button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 rounded-full w-12 h-12 p-0 shadow-lg z-50"
          >
            <ArrowUpIcon className="w-5 h-5" />
          </Button>
        )}

        {/* Modal de preview rápido */}
        {selectedQuest && (
          <QuestQuickPreview
            quest={selectedQuest}
            isOpen={isQuickPreviewOpen}
            onClose={() => {
              setIsQuickPreviewOpen(false);
              setSelectedQuest(null);
            }}
            onQuestClick={() => {
              handleQuestClick(selectedQuest);
              setIsQuickPreviewOpen(false);
              setSelectedQuest(null);
            }}
            onFavoriteToggle={() => handleFavoriteToggle(selectedQuest)}
            onShare={() => handleShare(selectedQuest)}
            isFavorite={isFavorite(selectedQuest.id)}
            allQuests={quests}
          />
        )}

        {/* Modal de comparação */}
        <QuestComparison
          quests={questsInComparison}
          isOpen={isComparisonModalOpen}
          onClose={closeComparisonModal}
          onRemoveQuest={removeFromComparison}
          onQuestClick={handleQuestClick}
        />
      </div>
    </PageLayout>
  );
}