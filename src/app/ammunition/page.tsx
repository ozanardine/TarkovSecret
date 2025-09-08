'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { PageLayout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { InfiniteLoading } from '@/components/ui/InfiniteLoading';
import { AdvancedAmmoFilters, AdvancedAmmoFiltersState } from '@/components/ammunition/AdvancedAmmoFilters';
import { AmmoTable } from '@/components/ammunition/AmmoTable';
import { AmmoQuickPreview } from '@/components/ammunition/AmmoQuickPreview';
import { AmmoComparison } from '@/components/ammunition/AmmoComparison';
import { ModernAmmoCard } from '@/components/ammunition/ModernAmmoCard';
import { useAmmunition } from '@/hooks/useAmmunition';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { Ammo } from '@/types/tarkov';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ChartBarIcon,
  ShareIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const AMMO_PER_LOAD = 24;

export default function AmmunitionPage() {
  const router = useRouter();
  const { ammunition, loading, error } = useAmmunition();
  
  const [displayedAmmo, setDisplayedAmmo] = useState(AMMO_PER_LOAD);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // Estados para modais
  const [quickPreviewAmmo, setQuickPreviewAmmo] = useState<Ammo | null>(null);
  const [comparisonAmmo, setComparisonAmmo] = useState<Ammo[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<AdvancedAmmoFiltersState>({
    search: '',
    caliber: [],
    damageRange: [0, 200],
    penetrationRange: [0, 100],
    priceRange: [0, 50000],
    trader: [],
    ammoType: [],
    tracer: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Estados para melhor UX
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isFilteringActive, setIsFilteringActive] = useState(false);


  // Extrair valores únicos para filtros
  const availableCalibers = useMemo(() => {
    const calibers = ammunition.map(ammo => ammo.caliber).filter((caliber): caliber is string => Boolean(caliber));
    return Array.from(new Set(calibers)).sort();
  }, [ammunition]);

  const availableTraders = useMemo(() => {
    const traders = ammunition.flatMap(ammo => 
      (ammo.item.buyFor || []).map(trader => trader.source)
    ).filter((source): source is string => Boolean(source));
    return Array.from(new Set(traders)).sort();
  }, [ammunition]);

  const availableAmmoTypes = useMemo(() => {
    const types = ammunition.map(ammo => ammo.ammoType).filter((type): type is string => Boolean(type));
    return Array.from(new Set(types)).sort();
  }, [ammunition]);

  // Filtrar e ordenar munições com debounce implícito
  const filteredAmmo = useMemo(() => {
    setIsFilteringActive(true);
    
    let filtered = ammunition.filter(ammo => {
      // Filtro de busca melhorado
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase().trim();
        if (!searchTerm) return true;
        
        const searchableText = [
          ammo.item.name,
          ammo.item.shortName,
          ammo.caliber,
          ammo.ammoType
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Filtro de calibre
      if (filters.caliber.length > 0 && ammo.caliber && !filters.caliber.includes(ammo.caliber)) {
        return false;
      }

      // Filtro de tipo de munição
      if (filters.ammoType.length > 0 && !filters.ammoType.includes(ammo.ammoType)) {
        return false;
      }

      // Filtro de tracer
      if (filters.tracer === 'tracer' && !ammo.tracer) return false;
      if (filters.tracer === 'no-tracer' && ammo.tracer) return false;

      // Filtro de dano
      if (ammo.damage < filters.damageRange[0] || ammo.damage > filters.damageRange[1]) {
        return false;
      }

      // Filtro de penetração
      if (ammo.penetrationPower < filters.penetrationRange[0] || 
          ammo.penetrationPower > filters.penetrationRange[1]) {
        return false;
      }

      // Filtro de trader
      if (filters.trader.length > 0) {
        const hasTrader = ammo.item.buyFor?.some(trader => 
          filters.trader.includes(trader.source)
        );
        if (!hasTrader) return false;
      }

      // Filtro de preço melhorado
      if (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000) {
        const bestPrice = ammo.item.buyFor?.reduce((min, current) => 
          current.price < min ? current.price : min, Infinity
        );
        if (!bestPrice || bestPrice === Infinity || bestPrice < filters.priceRange[0] || bestPrice > filters.priceRange[1]) {
          return false;
        }
      }

      return true;
    });

    // Indicar fim da filtragem
    setTimeout(() => setIsFilteringActive(false), 100);

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.item.name.localeCompare(b.item.name);
          break;
        case 'damage':
          comparison = a.damage - b.damage;
          break;
        case 'penetration':
          comparison = a.penetrationPower - b.penetrationPower;
          break;
        case 'armorDamage':
          comparison = a.armorDamage - b.armorDamage;
          break;
        case 'fragmentation':
          comparison = a.fragmentationChance - b.fragmentationChance;
          break;
        case 'accuracy':
          comparison = a.accuracyModifier - b.accuracyModifier;
          break;
        case 'recoil':
          comparison = a.recoilModifier - b.recoilModifier;
          break;
        case 'velocity':
          const velocityA = a.initialSpeed || 0;
          const velocityB = b.initialSpeed || 0;
          comparison = velocityA - velocityB;
          break;
        case 'price':
          const priceA = a.item.buyFor?.reduce((min, current) => 
            current.price < min ? current.price : min, Infinity) || Infinity;
          const priceB = b.item.buyFor?.reduce((min, current) => 
            current.price < min ? current.price : min, Infinity) || Infinity;
          comparison = priceA - priceB;
          break;
        case 'efficiency':
          const efficiencyA = a.item.buyFor?.length ? 
            a.damage / Math.min(...a.item.buyFor.map(t => t.price)) : 0;
          const efficiencyB = b.item.buyFor?.length ? 
            b.damage / Math.min(...b.item.buyFor.map(t => t.price)) : 0;
          comparison = efficiencyA - efficiencyB;
          break;
      }
      
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [ammunition, filters]);

  // Scroll infinito (após filteredAmmo estar definido)
  const { ref: infiniteScrollRef, isLoading: isLoadingMore } = useInfiniteScroll(
    useCallback(() => {
      setDisplayedAmmo(prev => Math.min(prev + AMMO_PER_LOAD, filteredAmmo.length));
    }, [filteredAmmo.length]),
    {
      enabled: displayedAmmo < filteredAmmo.length
    }
  );

  const visibleAmmo = filteredAmmo.slice(0, displayedAmmo);

  // Handlers
  const handleAmmoClick = (ammo: Ammo) => {
    router.push(`/item/${ammo.item.id}`);
  };

  const handleFavoriteToggle = (ammoId: string) => {
    setFavorites(prev => 
      prev.includes(ammoId) 
        ? prev.filter(id => id !== ammoId)
        : [...prev, ammoId]
    );
  };

  const handleShare = async (ammo: Ammo) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${ammo.item.name} - Secret Tarkov`,
          text: `Confira as estatísticas da munição ${ammo.item.name}`,
          url: `${window.location.origin}/item/${ammo.item.id}`,
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/item/${ammo.item.id}`);
    }
  };

  const handleQuickView = (ammo: Ammo) => {
    setQuickPreviewAmmo(ammo);
  };

  const handleCompareToggle = (ammo: Ammo) => {
    setComparisonAmmo(prev => {
      const exists = prev.find(a => a.item.id === ammo.item.id);
      if (exists) {
        return prev.filter(a => a.item.id !== ammo.item.id);
      } else if (prev.length < 4) {
        return [...prev, ammo];
      }
      return prev;
    });
  };

  const isInComparison = (ammoId: string) => {
    return comparisonAmmo.some(a => a.item.id === ammoId);
  };

  const handleShowComparison = () => {
    if (comparisonAmmo.length >= 2) {
      setShowComparison(true);
    }
  };

  const handleRemoveFromComparison = (ammoId: string) => {
    setComparisonAmmo(prev => prev.filter(a => a.item.id !== ammoId));
  };

  const handleSort = (column: string) => {
    if (filters.sortBy === column) {
      setFilters(prev => ({
        ...prev,
        sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        sortBy: column as any,
        sortOrder: 'asc'
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      caliber: [],
      damageRange: [0, 200],
      penetrationRange: [0, 100],
      priceRange: [0, 50000],
      trader: [],
      ammoType: [],
      tracer: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  // Scroll to top
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

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <Loading text="Carregando munições..." variant="orbit" size="lg" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
              <SparklesIcon className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-tarkov-light mb-2">
              Erro ao Carregar Munições
            </h3>
            <p className="text-tarkov-muted mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-tarkov-accent/20 rounded-xl">
              <SparklesIcon className="w-8 h-8 text-tarkov-accent" />
            </div>
            <h1 className="text-4xl font-bold text-tarkov-light">
              Munições do Tarkov
            </h1>
          </div>
          <p className="text-lg text-tarkov-muted max-w-2xl mx-auto">
            Explore todas as munições disponíveis no Escape from Tarkov. 
            Compare estatísticas, preços e encontre a munição perfeita para sua estratégia.
          </p>
          
          {/* Stats rápidas */}
          <div className="flex items-center justify-center gap-8 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-tarkov-accent">{ammunition.length}</div>
              <div className="text-sm text-tarkov-muted">Munições</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-tarkov-accent">{availableCalibers.length}</div>
              <div className="text-sm text-tarkov-muted">Calibres</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-tarkov-accent">{availableTraders.length}</div>
              <div className="text-sm text-tarkov-muted">Traders</div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <AdvancedAmmoFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
          availableCalibers={availableCalibers}
          availableTraders={availableTraders}
          availableAmmoTypes={availableAmmoTypes}
        />

        {/* Controles de visualização melhorados */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-tarkov-muted">
              Mostrando {visibleAmmo.length} de {filteredAmmo.length} munições
              {isFilteringActive && <span className="ml-1 text-tarkov-accent">•</span>}
            </span>
            {filteredAmmo.length !== ammunition.length && (
              <Badge variant="secondary" className="bg-tarkov-accent/20 text-tarkov-accent">
                Filtrado
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle de visualização */}
            <div className="flex rounded-lg border border-tarkov-secondary/30 overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-tarkov-accent text-tarkov-dark' 
                    : 'text-tarkov-muted hover:text-tarkov-light'
                }`}
                aria-label="Visualização em tabela"
              >
                Tabela
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-tarkov-accent text-tarkov-dark' 
                    : 'text-tarkov-muted hover:text-tarkov-light'
                }`}
                aria-label="Visualização em grade"
              >
                Grade
              </button>
            </div>
            
            {comparisonAmmo.length >= 2 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleShowComparison}
                className="bg-tarkov-accent/20 text-tarkov-accent border-tarkov-accent/30"
              >
                <ChartBarIcon className="w-4 h-4 mr-1" />
                Comparar ({comparisonAmmo.length})
              </Button>
            )}
          </div>
        </div>

        {/* Conteúdo baseado no modo de visualização */}
        {viewMode === 'table' ? (
          <AmmoTable
            ammunition={visibleAmmo}
            onAmmoClick={handleAmmoClick}
            onFavoriteToggle={handleFavoriteToggle}
            onShare={handleShare}
            onQuickView={handleQuickView}
            onCompareToggle={handleCompareToggle}
            favorites={favorites}
            comparisonAmmo={comparisonAmmo.map(a => a.item.id)}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSort={handleSort}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visibleAmmo.map((ammo, index) => (
              <ModernAmmoCard
                key={ammo.item.id}
                ammo={ammo}
                viewMode="grid"
                onAmmoClick={handleAmmoClick}
                onFavoriteToggle={handleFavoriteToggle}
                onShare={handleShare}
                onQuickView={handleQuickView}
                onCompareToggle={handleCompareToggle}
                isFavorite={favorites.includes(ammo.item.id)}
                isInComparison={comparisonAmmo.some(a => a.item.id === ammo.item.id)}
                showActions={true}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Loading infinito */}
        <InfiniteLoading
          ref={infiniteScrollRef}
          isLoading={isLoadingMore}
          hasMore={displayedAmmo < filteredAmmo.length}
          text="Carregando mais munições..."
          variant="orbit"
          size="md"
        />

        {/* Empty State */}
        {filteredAmmo.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-tarkov-secondary/30 rounded-full flex items-center justify-center">
                <MagnifyingGlassIcon className="w-12 h-12 text-tarkov-muted" />
              </div>
              <h3 className="text-xl font-semibold text-tarkov-light mb-2">
                Nenhuma munição encontrada
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

        {/* Botão Voltar ao Topo */}
        {showBackToTop && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              onClick={scrollToTop}
              className="rounded-full w-12 h-12 p-0 shadow-lg"
              title="Voltar ao topo"
            >
              <ArrowUpIcon className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Modal de Preview Rápido */}
      <AmmoQuickPreview
        ammo={quickPreviewAmmo}
        isOpen={!!quickPreviewAmmo}
        onClose={() => setQuickPreviewAmmo(null)}
        onViewFull={handleAmmoClick}
      />

      {/* Modal de Comparação */}
      <AmmoComparison
        ammunition={comparisonAmmo}
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        onRemoveAmmo={handleRemoveFromComparison}
        maxComparisons={4}
      />
    </PageLayout>
  );
}
