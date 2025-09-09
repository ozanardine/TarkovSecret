'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, ItemTypeBadge, PriceChangeBadge } from '@/components/ui/Badge';
import { Loading, Skeleton } from '@/components/ui/Loading';
import { ErrorDisplay, ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useTarkov } from '@/hooks/useTarkov';
import { useAuth } from '@/hooks/useAuth';
import { useImages } from '@/hooks/useImages';
import { ItemSpecs } from '@/components/item/ItemSpecs';
import { ItemTraders } from '@/components/item/ItemTraders';
import { PriceHistory } from '@/components/item/PriceHistory';
import { ItemTypeDetails } from '@/components/item/ItemTypeDetails';
import { ItemDetailSkeleton } from '@/components/item/ItemDetailSkeleton';
import ItemQuests from '@/components/item/ItemQuests';
import ItemHideout from '@/components/item/ItemHideout';
import ItemBarters from '@/components/item/ItemBarters';
import ItemUsageOverview from '@/components/item/ItemUsageOverview';
import ItemQuantityNeeded from '@/components/item/ItemQuantityNeeded';
import {
  ArrowLeftIcon,
  HeartIcon,
  ShareIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  QueueListIcon,
  ArrowsRightLeftIcon,
  ScaleIcon,
  CubeIcon,
  TagIcon,
  ClockIcon,
  StarIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { TarkovQuest, HideoutStation, Barter } from '@/types/tarkov';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { useItem, useFavorites } = useTarkov;
  
  const itemId = params.id as string;
  const { item, loading: itemLoading, error, retry } = useItem(itemId);
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { data: itemImages, loading: imagesLoading } = useImages({
    type: 'items',
    ids: itemId ? [itemId] : [],
    enabled: !!itemId
  });
  
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'traders' | 'prices' | 'quests' | 'hideout' | 'trades'>('overview');
  
  const isItemFavorite = isFavorite(itemId);

  // Loading state
  const loading = itemLoading;

  const handleFavoriteToggle = () => {
    if (!item) return;
    
    if (isItemFavorite) {
      removeFromFavorites(itemId);
    } else {
      addToFavorites(itemId);
    }
  };

  const handleShare = async () => {
    if (navigator.share && item) {
      try {
        await navigator.share({
          title: item?.name || 'Item',
          text: `Confira as informações sobre ${item?.name || 'item'} no Secret Tarkov`,
          url: window.location.href
        });
      } catch (error) {
        // Fallback para copiar URL
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading size="lg" variant="wave" text="Carregando item..." />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <ErrorDisplay
            error={error}
            title="Erro ao carregar item"
            description="Não foi possível carregar as informações do item."
            onRetry={retry}
            variant="card"
          />
        </div>
      </PageLayout>
    );
  }

  if (!item && !loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <ErrorDisplay
            error="Item não encontrado"
            title="Item não encontrado"
            description="O item solicitado não foi encontrado ou não existe."
            onRetry={() => router.push('/search')}
            variant="card"
          />
        </div>
      </PageLayout>
    );
  }

  // Função para obter a melhor imagem disponível
  const getBestImage = () => {
    const currentItemImage = itemImages.find(img => img.id === itemId);
    if (currentItemImage?.images?.iconLink) {
      return currentItemImage.images.iconLink;
    }
    if (!item) return '/images/placeholder-item.png';
    return item.image8xLink || 
           item.image512pxLink || 
           item.inspectImageLink || 
           item.gridImageLink || 
           item.imageLink || 
           item.iconLink ||
           '/images/placeholder-item.png';
  };

  // Função para formatar preços
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR').format(price);
  };

  // Função para obter cor do preço
  const getPriceColor = (price: number, basePrice: number) => {
    if (!basePrice) return 'text-gray-400';
    const ratio = price / basePrice;
    if (ratio > 1.2) return 'text-green-400';
    if (ratio < 0.8) return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <PageLayout>
      <ErrorBoundary>
        <div className="min-h-screen">
          {/* Header Fixo */}
          <div className="sticky top-0 z-50 border-b border-gray-700/50 shadow-lg" style={{background: 'transparent'}}>
            <div className="container mx-auto px-4 py-3" style={{background: 'transparent'}}>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Voltar</span>
                </Button>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFavoriteToggle}
                    className={`flex items-center gap-2 transition-all duration-200 ${
                      isItemFavorite 
                        ? 'text-red-500 hover:text-red-400 hover:bg-red-500/10' 
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {isItemFavorite ? (
                      <HeartSolid className="w-4 h-4" />
                    ) : (
                      <HeartIcon className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">
                      {isItemFavorite ? 'Favorito' : 'Favoritar'}
                    </span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    <ShareIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Compartilhar</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="container mx-auto px-4 py-6" style={{background: 'transparent'}}>
            {/* Hero Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
              {/* Card Principal do Item */}
              <div className="xl:col-span-1">
                <Card variant="glass" className="p-6 text-center">
                  {/* Imagem do Item */}
                  <div className="relative mb-6">
                    <div className="relative inline-block">
                      <img
                        src={getBestImage()}
                        alt={item?.name || 'Item'}
                        className="w-32 h-32 object-contain mx-auto rounded-2xl shadow-2xl bg-gray-800/50 p-2"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = '/images/placeholder-item.png';
                        }}
                      />
                      {/* Badge de Tipo */}
                      {item?.types && item.types.length > 0 && (
                        <div className="absolute -top-2 -right-2">
                          <ItemTypeBadge itemType={item.types[0]} size="sm" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Nome e Descrição */}
                  <h1 className="text-2xl font-bold text-white mb-2 leading-tight">
                    {item?.name || 'Item'}
                  </h1>
                  <p className="text-gray-400 text-sm mb-4">
                    {item?.shortName || ''}
                  </p>
                  
                  {/* Tipos */}
                  {item?.types && item.types.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      {item?.types?.slice(0, 3).map((type, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="bg-gray-800/60 border-gray-600 text-gray-300 text-xs"
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Estatísticas Rápidas */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-800/40 rounded-lg p-3">
                      <ScaleIcon className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                      <div className="text-xs text-gray-400">Peso</div>
                      <div className="text-white font-semibold text-sm">
                        {item?.weight?.toFixed(2) || '0.00'} kg
                      </div>
                    </div>
                    <div className="bg-gray-800/40 rounded-lg p-3">
                      <CubeIcon className="w-4 h-4 text-green-400 mx-auto mb-1" />
                      <div className="text-xs text-gray-400">Tamanho</div>
                      <div className="text-white font-semibold text-sm">
                        {item?.width || 0}×{item?.height || 0}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Informações de Preço e Mercado */}
              <div className="xl:col-span-2 space-y-6">
                {/* Card de Preços */}
                <Card variant="elevated" className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CurrencyDollarIcon className="w-5 h-5 text-yellow-500" />
                    <h2 className="text-xl font-bold text-white">Informações de Mercado</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Preço Base */}
                    {item?.basePrice && (
                      <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <TagIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">Preço Base</span>
                        </div>
                        <div className="text-xl font-bold text-yellow-500">
                          ₽{formatPrice(item?.basePrice || 0)}
                        </div>
                      </div>
                    )}
                    
                    {/* Preço Médio 24h */}
                    {item?.avg24hPrice && (
                      <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">Média 24h</span>
                        </div>
                          <div className={`text-xl font-bold ${getPriceColor(item?.avg24hPrice || 0, item?.basePrice || 0)}`}>
                            ₽{formatPrice(item?.avg24hPrice || 0)}
                        </div>
                      </div>
                    )}
                    
                    {/* Variação 48h */}
                    {item?.changeLast48hPercent !== undefined && item?.changeLast48hPercent !== null && (
                      <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <ChartBarIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">Variação 48h</span>
                        </div>
                        <div className={`text-xl font-bold flex items-center gap-1 ${
                          (item?.changeLast48hPercent || 0) > 0 
                            ? 'text-green-400' 
                            : (item?.changeLast48hPercent || 0) < 0 
                              ? 'text-red-400' 
                              : 'text-gray-400'
                        }`}>
                          {(item?.changeLast48hPercent || 0) > 0 ? '+' : ''}{(item?.changeLast48hPercent || 0).toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Card de Descrição */}
                {item?.description && (
                  <Card variant="elevated" className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Descrição</h3>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      {item?.description}
                    </p>
                  </Card>
                )}
              </div>
            </div>
            
            {/* Navegação por Abas */}
            <Card variant="glass" className="overflow-hidden">
              {/* Abas */}
              <div className="flex flex-wrap border-b border-gray-700/50 bg-gray-800/20">
                {[
                  { id: 'overview', label: 'Visão Geral', icon: StarIcon },
                  { id: 'specs', label: 'Especificações', icon: ChartBarIcon },
                  { id: 'traders', label: 'Traders', icon: CurrencyDollarIcon },
                  { id: 'prices', label: 'Preços', icon: ChartBarIcon },
                  { id: 'quests', label: 'Quests', icon: QueueListIcon },
                  { id: 'hideout', label: 'Hideout', icon: BuildingOfficeIcon },
                  { id: 'trades', label: 'Barters', icon: ArrowsRightLeftIcon }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`px-4 py-3 font-medium transition-all duration-200 flex items-center gap-2 text-sm ${
                      activeTab === id
                        ? 'bg-yellow-600 text-white border-b-2 border-yellow-500'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
              
              {/* Conteúdo das Abas */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <ItemUsageOverview itemId={itemId} />
                    
                    {/* Links Externos */}
                    {item?.wikiLink && (
                      <div className="bg-gray-800/20 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-white mb-3">Links Úteis</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(item?.wikiLink, '_blank')}
                          className="bg-yellow-600/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-600/30"
                        >
                          Ver na Wiki
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'specs' && (
                  <div className="space-y-6">
                    <ItemQuantityNeeded itemId={itemId} />
                    {item && <ItemSpecs item={item} />}
                    {item && <ItemTypeDetails item={item} />}
                  </div>
                )}
                
                {activeTab === 'traders' && item && (
                  <ItemTraders item={item} />
                )}
                
                {activeTab === 'prices' && item && (
                  <PriceHistory item={item} />
                )}
                
                {activeTab === 'quests' && (
                  <ItemQuests itemId={itemId} />
                )}
                
                {activeTab === 'hideout' && (
                  <ItemHideout itemId={itemId} />
                )}
                
                {activeTab === 'trades' && (
                  <ItemBarters itemId={itemId} />
                )}
              </div>
            </Card>
          </div>
        </div>
      </ErrorBoundary>
    </PageLayout>
  );
}