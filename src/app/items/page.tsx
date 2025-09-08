'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { PageLayout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { InfiniteLoading } from '@/components/ui/InfiniteLoading';
import { AdvancedFilters, AdvancedFiltersState } from '@/components/items/AdvancedFilters';
import { ModernItemCard } from '@/components/items/ModernItemCard';
import { ItemQuickPreview } from '@/components/items/ItemQuickPreview';
import { ItemComparison } from '@/components/items/ItemComparison';
import { useTarkov } from '@/hooks/useTarkov';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { TarkovItem } from '@/types/tarkov';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowUpIcon,
  ChartBarIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';

// Removido - agora usando AdvancedFiltersState

const ITEMS_PER_LOAD = 24;

export default function ItemsPage() {
  const router = useRouter();
  const { items, loading, error } = useTarkov.useAllItems();
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useTarkov.useFavorites();
  
  const [displayedItems, setDisplayedItems] = useState(ITEMS_PER_LOAD);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // Estados para modais
  const [quickPreviewItem, setQuickPreviewItem] = useState<TarkovItem | null>(null);
  const [comparisonItems, setComparisonItems] = useState<TarkovItem[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  
  const [filters, setFilters] = useState<AdvancedFiltersState>({
    search: '',
    category: 'All',
    priceRange: [0, 1000000],
    rarity: [],
    weightRange: [0, 50],
    sizeRange: [0, 20],
    priceChange: 'all',
    popularity: 'all',
    trader: [],
    questRelated: false,
    hideoutRelated: false,
    barterRelated: false,
    sortBy: 'name',
    sortOrder: 'asc',
  });



  // Filtrar e ordenar itens com filtros avançados
  const filteredItems = useMemo(() => {
    let filtered = items.filter(item => {
      // Filtro de busca
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!item.name.toLowerCase().includes(searchLower) &&
            !item.shortName.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Filtro de categoria
      if (filters.category !== 'All') {
        const categoryLower = filters.category.toLowerCase();
        if (!item.types.some(type => type.toLowerCase().includes(categoryLower))) {
          return false;
        }
      }

      // Filtro de preço
      const price = item.avg24hPrice || item.basePrice || 0;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }

      // Filtro de raridade
      if (filters.rarity.length > 0 && item.rarity) {
        if (!filters.rarity.includes(item.rarity.toLowerCase())) {
          return false;
        }
      }

      // Filtro de peso
      if (item.weight < filters.weightRange[0] || item.weight > filters.weightRange[1]) {
        return false;
      }

      // Filtro de tamanho (slots)
      const itemSize = item.width * item.height;
      const minSize = filters.sizeRange[0];
      const maxSize = filters.sizeRange[1];
      if (itemSize < minSize || itemSize > maxSize) {
        return false;
      }

      // Filtro de mudança de preço
      if (filters.priceChange !== 'all' && item.changeLast48hPercent !== undefined) {
        const change = item.changeLast48hPercent;
        switch (filters.priceChange) {
          case 'up':
            if (change <= 0) return false;
            break;
          case 'down':
            if (change >= 0) return false;
            break;
          case 'stable':
            if (change !== 0) return false;
            break;
        }
      }

      // Filtro de trader
      if (filters.trader.length > 0) {
        const hasTrader = item.sellFor?.some(sell => 
          filters.trader.some(trader => 
            sell.source.toLowerCase().includes(trader.toLowerCase())
          )
        ) || item.buyFor?.some(buy => 
          filters.trader.some(trader => 
            buy.source.toLowerCase().includes(trader.toLowerCase())
          )
        );
        if (!hasTrader) return false;
      }

      return true;
    });

    // Ordenação avançada
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.avg24hPrice || a.basePrice || 0;
          bValue = b.avg24hPrice || b.basePrice || 0;
          break;
        case 'updated':
          aValue = new Date(a.updated || 0).getTime();
          bValue = new Date(b.updated || 0).getTime();
          break;
        case 'weight':
          aValue = a.weight;
          bValue = b.weight;
          break;
        case 'size':
          aValue = a.width * a.height;
          bValue = b.width * b.height;
          break;
        case 'popularity':
          // Simular popularidade baseada em preço e mudança
          aValue = (a.avg24hPrice || a.basePrice || 0) * (1 + (a.changeLast48hPercent || 0) / 100);
          bValue = (b.avg24hPrice || b.basePrice || 0) * (1 + (b.changeLast48hPercent || 0) / 100);
          break;
        case 'priceChange':
          aValue = a.changeLast48hPercent || 0;
          bValue = b.changeLast48hPercent || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [items, filters]);

  // Itens visíveis com paginação infinita
  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, displayedItems);
  }, [filteredItems, displayedItems]);

  // Reset itens exibidos quando filtros mudam
  useEffect(() => {
    setDisplayedItems(ITEMS_PER_LOAD);
  }, [filters]);

  // Scroll infinito melhorado
  const loadMoreItems = useCallback(() => {
    if (displayedItems < filteredItems.length) {
      setDisplayedItems(prev => prev + ITEMS_PER_LOAD);
    }
  }, [displayedItems, filteredItems.length]);

  // Hook de scroll infinito
  const { ref: infiniteScrollRef, isLoading: isLoadingMore } = useInfiniteScroll(
    loadMoreItems,
    {
      threshold: 0.1,
      rootMargin: '100px',
      enabled: displayedItems < filteredItems.length,
      delay: 300
    }
  );

  // Controle do botão voltar ao topo
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemClick = (itemId: string) => {
    router.push(`/item/${itemId}`);
  };

  const updateFilters = (newFilters: AdvancedFiltersState) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      priceRange: [0, 1000000],
      rarity: [],
      weightRange: [0, 50],
      sizeRange: [0, 20],
      priceChange: 'all',
      popularity: 'all',
      trader: [],
      questRelated: false,
      hideoutRelated: false,
      barterRelated: false,
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  // Funções para manipulação de favoritos
  const handleFavoriteToggle = (itemId: string) => {
    if (isFavorite(itemId)) {
      removeFromFavorites(itemId);
    } else {
      addToFavorites(itemId);
    }
  };

  // Funções para preview rápido
  const handleQuickView = (item: TarkovItem) => {
    setQuickPreviewItem(item);
  };

  // Funções para comparação
  const handleAddToComparison = (item: TarkovItem) => {
    if (comparisonItems.length < 4 && !comparisonItems.find(i => i.id === item.id)) {
      setComparisonItems(prev => [...prev, item]);
    }
  };

  const handleRemoveFromComparison = (itemId: string) => {
    setComparisonItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleOpenComparison = () => {
    setShowComparison(true);
  };

  // Função para compartilhamento
  const handleShare = async (item: TarkovItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.name,
          text: `Confira ${item.name} no Secret Tarkov`,
          url: `${window.location.origin}/item/${item.id}`
        });
      } catch (error) {
        // Fallback para copiar URL
        navigator.clipboard.writeText(`${window.location.origin}/item/${item.id}`);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/item/${item.id}`);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading size="lg" variant="orbit" text="Carregando itens..." />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6 relative z-0">
        {/* Header Fixo */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-card-border pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-tarkov-light">Itens do Tarkov</h1>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-tarkov-muted">
                  {filteredItems.length.toLocaleString()} itens encontrados
                </p>
                {displayedItems < filteredItems.length && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-tarkov-accent rounded-full animate-pulse"></div>
                    <span className="text-tarkov-accent text-sm font-medium">
                      {displayedItems.toLocaleString()} de {filteredItems.length.toLocaleString()} carregados
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Comparação */}
              {comparisonItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenComparison}
                  className="flex items-center gap-2"
                >
                  <ChartBarIcon className="w-4 h-4" />
                  Comparar ({comparisonItems.length})
                </Button>
              )}
              
              {/* View Mode Toggle */}
              <div className="flex rounded-lg border border-card-border overflow-hidden bg-card/50 backdrop-blur-sm">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <ListBulletIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filtros Avançados */}
          <AdvancedFilters
            filters={filters}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
            itemCount={items.length}
            filteredCount={filteredItems.length}
          />
        </div>

        {/* Items Grid/List com Scroll Infinito */}
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'
            : 'space-y-3'
          }
        `}>
          {visibleItems.map((item, index) => (
            <ModernItemCard
              key={item.id}
              item={item}
              viewMode={viewMode}
              onItemClick={handleItemClick}
              onFavoriteToggle={handleFavoriteToggle}
              onShare={handleShare}
              onQuickView={handleQuickView}
              isFavorite={isFavorite(item.id)}
              showActions={true}
              index={index}
            />
          ))}
        </div>

        {/* Loading infinito melhorado */}
        <InfiniteLoading
          ref={infiniteScrollRef}
          isLoading={isLoadingMore}
          hasMore={displayedItems < filteredItems.length}
          text="Carregando mais itens..."
          variant="orbit"
          size="md"
        />

        {/* Empty State */}
        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-tarkov-secondary/30 rounded-full flex items-center justify-center">
                <MagnifyingGlassIcon className="w-12 h-12 text-tarkov-muted" />
              </div>
              <h3 className="text-xl font-semibold text-tarkov-light mb-2">
                Nenhum item encontrado
              </h3>
              <p className="text-tarkov-muted mb-6">
                Tente ajustar os filtros de busca ou limpar os filtros ativos
              </p>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mx-auto"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        )}

        {/* Botão Voltar ao Topo Melhorado */}
        {showBackToTop && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              onClick={scrollToTop}
              variant="primary"
              size="lg"
              className="
                rounded-full p-3 shadow-lg hover:shadow-xl
                transform hover:scale-105 backdrop-blur-sm
                border border-tarkov-accent/20
                bg-tarkov-accent hover:bg-tarkov-accent/90
              "
              style={{ 
                transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out', 
                willChange: 'transform, box-shadow' 
              }}
              aria-label="Voltar ao topo"
            >
              <ArrowUpIcon className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Modais */}
        <ItemQuickPreview
          item={quickPreviewItem}
          isOpen={!!quickPreviewItem}
          onClose={() => setQuickPreviewItem(null)}
          onItemClick={handleItemClick}
          onFavoriteToggle={handleFavoriteToggle}
          onShare={handleShare}
          isFavorite={quickPreviewItem ? isFavorite(quickPreviewItem.id) : false}
        />

        <ItemComparison
          items={comparisonItems}
          isOpen={showComparison}
          onClose={() => setShowComparison(false)}
          onAddItem={handleAddToComparison}
          onRemoveItem={handleRemoveFromComparison}
          onItemClick={handleItemClick}
          maxItems={4}
        />
      </div>
    </PageLayout>
  );
}