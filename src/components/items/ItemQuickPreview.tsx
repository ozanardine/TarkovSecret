'use client';

import React, { useState, useEffect } from 'react';
import { TarkovItem } from '@/types/tarkov';
import { Badge, ItemTypeBadge, PriceChangeBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useTarkov } from '@/hooks/useTarkov';
import {
  XMarkIcon,
  HeartIcon,
  ShareIcon,
  EyeIcon,
  ChartBarIcon,
  CubeIcon,
  ScaleIcon,
  StarIcon,
  ArrowArrowTrendingUpIcon,
  ArrowArrowTrendingDownIcon,
  MinusIcon,
  CurrencyDollarIcon,
  ClockIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

interface ItemQuickPreviewProps {
  item: TarkovItem | null;
  isOpen: boolean;
  onClose: () => void;
  onItemClick?: (itemId: string) => void;
  onFavoriteToggle?: (itemId: string) => void;
  onShare?: (item: TarkovItem) => void;
  isFavorite?: boolean;
}

export const ItemQuickPreview: React.FC<ItemQuickPreviewProps> = ({
  item,
  isOpen,
  onClose,
  onItemClick,
  onFavoriteToggle,
  onShare,
  isFavorite = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const { useItemUsage } = useTarkov;
  
  // Buscar dados de uso do item
  const { itemUsage, loading: usageLoading } = useItemUsage(item?.id || null);

  useEffect(() => {
    if (item) {
      setImageError(false);
    }
  }, [item]);

  if (!item) return null;

  const getItemImage = () => {
    if (imageError) return '/placeholder-item.png';
    
    return (
      item.image8xLink ||
      item.image512pxLink ||
      item.inspectImageLink ||
      item.gridImageLink ||
      item.imageLink ||
      item.iconLink ||
      '/placeholder-item.png'
    );
  };

  const getPriceChangeIcon = () => {
    if (!item.changeLast48hPercent) return null;
    
    if (item.changeLast48hPercent > 0) {
      return <ArrowTrendingUpIcon className="w-4 h-4" />;
    } else if (item.changeLast48hPercent < 0) {
      return <ArrowTrendingDownIcon className="w-4 h-4" />;
    } else {
      return <MinusIcon className="w-4 h-4" />;
    }
  };

  const getPriceChangeColor = () => {
    if (!item.changeLast48hPercent) return 'text-tarkov-muted';
    
    if (item.changeLast48hPercent > 0) return 'text-green-400';
    if (item.changeLast48hPercent < 0) return 'text-red-400';
    return 'text-tarkov-muted';
  };

  const getRarityGradient = () => {
    switch (item.rarity?.toLowerCase()) {
      case 'legendary':
        return 'from-orange-500/20 to-yellow-500/20 border-orange-500/30';
      case 'epic':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      case 'rare':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'uncommon':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      case 'common':
      default:
        return 'from-gray-500/20 to-slate-500/20 border-gray-500/30';
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleFavoriteClick = () => {
    if (onFavoriteToggle) {
      onFavoriteToggle(item.id);
    }
  };

  const handleShareClick = () => {
    if (onShare) {
      onShare(item);
    }
  };

  const handleViewDetails = () => {
    if (onItemClick) {
      onItemClick(item.id);
      onClose();
    }
  };

  const totalUsages = 
    (itemUsage.quests.asRequirement.length + itemUsage.quests.asReward.length) +
    (itemUsage.hideoutStations.asRequirement.length + itemUsage.hideoutStations.asReward.length) +
    (itemUsage.barterTrades.asRequirement.length + itemUsage.barterTrades.asReward.length);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="max-w-2xl"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={getItemImage()}
                alt={item.name}
                className="w-16 h-16 object-contain rounded-lg bg-background-tertiary/30 p-2"
                onError={handleImageError}
              />
              {item.types[0] && (
                <div className="absolute -bottom-1 -right-1">
                  <ItemTypeBadge itemType={item.types[0]} size="sm" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-tarkov-light">{item.name}</h2>
              {item.shortName && (
                <p className="text-tarkov-muted">{item.shortName}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteClick}
              className="p-2"
            >
              {isFavorite ? (
                <HeartSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareClick}
              className="p-2"
            >
              <ShareIcon className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Informações Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Preços */}
          <div className="bg-background-tertiary/60 backdrop-blur-sm rounded-lg p-4 border border-card-border/50">
            <h3 className="text-lg font-semibold text-tarkov-light mb-3 flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-tarkov-accent" />
              Preços
            </h3>
            
            <div className="space-y-3">
              {item.basePrice && (
                <div className="flex justify-between items-center">
                  <span className="text-tarkov-muted">Preço Base</span>
                  <span className="font-semibold text-tarkov-light">
                    ₽{item.basePrice.toLocaleString()}
                  </span>
                </div>
              )}
              
              {item.avg24hPrice && (
                <div className="flex justify-between items-center">
                  <span className="text-tarkov-muted">Média 24h</span>
                  <span className="font-semibold text-green-400">
                    ₽{item.avg24hPrice.toLocaleString()}
                  </span>
                </div>
              )}
              
              {item.changeLast48hPercent !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-tarkov-muted">Mudança 48h</span>
                  <div className={`flex items-center gap-1 font-semibold ${getPriceChangeColor()}`}>
                    {getPriceChangeIcon()}
                    {item.changeLast48hPercent > 0 ? '+' : ''}{item.changeLast48hPercent.toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Estatísticas */}
          <div className="bg-background-tertiary/60 backdrop-blur-sm rounded-lg p-4 border border-card-border/50">
            <h3 className="text-lg font-semibold text-tarkov-light mb-3 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-tarkov-accent" />
              Estatísticas
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-tarkov-muted flex items-center gap-1">
                  <ScaleIcon className="w-4 h-4" />
                  Peso
                </span>
                <span className="font-semibold text-tarkov-light">{item.weight} kg</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-tarkov-muted flex items-center gap-1">
                  <CubeIcon className="w-4 h-4" />
                  Tamanho
                </span>
                <span className="font-semibold text-tarkov-light">{item.width}×{item.height}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-tarkov-muted flex items-center gap-1">
                  <TagIcon className="w-4 h-4" />
                  Slots
                </span>
                <span className="font-semibold text-tarkov-light">{item.width * item.height}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Uso do Item */}
        {totalUsages > 0 && (
          <div className="bg-background-tertiary/60 backdrop-blur-sm rounded-lg p-4 border border-card-border/50 mb-6">
            <h3 className="text-lg font-semibold text-tarkov-light mb-3 flex items-center gap-2">
              <StarIcon className="w-5 h-5 text-tarkov-accent" />
              Uso no Jogo
            </h3>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-tarkov-accent">
                  {itemUsage.quests.asRequirement.length + itemUsage.quests.asReward.length}
                </div>
                <div className="text-sm text-tarkov-muted">Quests</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-tarkov-accent">
                  {itemUsage.hideoutStations.asRequirement.length + itemUsage.hideoutStations.asReward.length}
                </div>
                <div className="text-sm text-tarkov-muted">Hideout</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-tarkov-accent">
                  {itemUsage.barterTrades.asRequirement.length + itemUsage.barterTrades.asReward.length}
                </div>
                <div className="text-sm text-tarkov-muted">Barters</div>
              </div>
            </div>
          </div>
        )}

        {/* Categorias */}
        {item.types && item.types.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-tarkov-light mb-3">Categorias</h3>
            <div className="flex flex-wrap gap-2">
              {item.types.map((type, index) => (
                <Badge key={index} variant="secondary" size="sm">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Descrição */}
        {item.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-tarkov-light mb-3">Descrição</h3>
            <p className="text-tarkov-muted leading-relaxed">{item.description}</p>
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center justify-between pt-4 border-t border-card-border">
          <div className="text-sm text-tarkov-muted">
            Última atualização: {item.updated ? new Date(item.updated).toLocaleDateString('pt-BR') : 'N/A'}
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Fechar
            </Button>
            
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
      </div>
    </Modal>
  );
};

export default ItemQuickPreview;
