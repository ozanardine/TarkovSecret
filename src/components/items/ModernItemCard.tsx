'use client';

import React, { useState } from 'react';
import { TarkovItem } from '@/types/tarkov';
import { Badge, ItemTypeBadge, PriceChangeBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  HeartIcon,
  ShareIcon,
  EyeIcon,
  ChartBarIcon,
  CubeIcon,
  ScaleIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

interface ModernItemCardProps {
  item: TarkovItem;
  viewMode: 'grid' | 'list';
  onItemClick: (itemId: string) => void;
  onFavoriteToggle?: (itemId: string) => void;
  onShare?: (item: TarkovItem) => void;
  onQuickView?: (item: TarkovItem) => void;
  isFavorite?: boolean;
  showActions?: boolean;
  index?: number;
}

export const ModernItemCard: React.FC<ModernItemCardProps> = ({
  item,
  viewMode,
  onItemClick,
  onFavoriteToggle,
  onShare,
  onQuickView,
  isFavorite = false,
  showActions = true,
  index = 0,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
      return <ArrowTrendingUpIcon className="w-3 h-3" />;
    } else if (item.changeLast48hPercent < 0) {
      return <ArrowTrendingDownIcon className="w-3 h-3" />;
    } else {
      return <MinusIcon className="w-3 h-3" />;
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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(item.id);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(item);
    }
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(item);
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        className={`
          group relative overflow-hidden rounded-xl border border-card-border/50 
          bg-gradient-to-r ${getRarityGradient()} backdrop-blur-md
          hover:border-tarkov-accent/50 hover:shadow-lg hover:shadow-tarkov-accent/10
          cursor-pointer transition-all duration-300 ease-out
          animate-fade-in z-0
        `}
        style={{
          animationDelay: `${Math.min(index * 0.05, 0.5)}s`,
          animationFillMode: 'both'
        }}
        onClick={() => onItemClick(item.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center p-4 gap-4">
          {/* Imagem */}
          <div className="relative w-16 h-16 flex-shrink-0">
            <div className="w-full h-full rounded-lg bg-background-tertiary/30 overflow-hidden">
              <img
                src={getItemImage()}
                alt={item.name}
                className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
                onError={handleImageError}
              />
            </div>
            
            {/* Badge de tipo */}
            {item.types[0] && (
              <div className="absolute -top-1 -right-1">
                <ItemTypeBadge itemType={item.types[0]} size="sm" />
              </div>
            )}
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-tarkov-light group-hover:text-tarkov-accent transition-colors duration-200 truncate">
                  {item.name}
                </h3>
                
                {item.shortName && (
                  <p className="text-tarkov-muted text-sm truncate">
                    {item.shortName}
                  </p>
                )}

                {/* Stats rápidas */}
                <div className="flex items-center gap-4 mt-2 text-xs text-tarkov-muted">
                  <div className="flex items-center gap-1">
                    <ScaleIcon className="w-3 h-3" />
                    {item.weight}kg
                  </div>
                  <div className="flex items-center gap-1">
                    <CubeIcon className="w-3 h-3" />
                    {item.width}×{item.height}
                  </div>
                </div>
              </div>

              {/* Preço e mudança */}
              <div className="flex flex-col items-end gap-2">
                {(item.avg24hPrice || item.basePrice) && (
                  <div className="text-right">
                    <div className="font-bold text-tarkov-accent text-lg">
                      ₽{(item.avg24hPrice || item.basePrice || 0).toLocaleString()}
                    </div>
                    
                    {item.changeLast48hPercent !== undefined && (
                      <div className={`flex items-center gap-1 text-xs font-medium ${getPriceChangeColor()}`}>
                        {getPriceChangeIcon()}
                        {item.changeLast48hPercent > 0 ? '+' : ''}{item.changeLast48hPercent.toFixed(1)}%
                      </div>
                    )}
                  </div>
                )}

                {/* Ações */}
                {showActions && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFavoriteClick}
                      className="p-1 h-6 w-6"
                    >
                      {isFavorite ? (
                        <HeartSolid className="w-3 h-3 text-red-500" />
                      ) : (
                        <HeartIcon className="w-3 h-3" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleQuickViewClick}
                      className="p-1 h-6 w-6"
                    >
                      <EyeIcon className="w-3 h-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleShareClick}
                      className="p-1 h-6 w-6"
                    >
                      <ShareIcon className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de hover */}
        <div className={`absolute inset-0 bg-gradient-to-r from-tarkov-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
      </div>
    );
  }

  // Modo Grid
  return (
    <div
      className={`
        group relative overflow-hidden rounded-xl border border-card-border/50 
        bg-gradient-to-br ${getRarityGradient()} backdrop-blur-md
        hover:border-tarkov-accent/50 hover:shadow-lg hover:shadow-tarkov-accent/10
        cursor-pointer transition-all duration-300 ease-out
        hover:-translate-y-1 hover:scale-[1.02]
        animate-fade-in z-0
      `}
      style={{
        animationDelay: `${Math.min(index * 0.05, 0.5)}s`,
        animationFillMode: 'both'
      }}
      onClick={() => onItemClick(item.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagem */}
      <div className="relative aspect-square mb-3">
        <div className="w-full h-full rounded-lg bg-background-tertiary/30 overflow-hidden p-3">
          <img
            src={getItemImage()}
            alt={item.name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
            onError={handleImageError}
          />
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {item.types[0] && (
            <ItemTypeBadge itemType={item.types[0]} size="sm" />
          )}
          
          {item.changeLast48hPercent !== undefined && (
            <PriceChangeBadge
              change={item.changeLast48hPercent}
              size="sm"
              className="text-xs"
            />
          )}
        </div>

        {/* Ações de hover */}
        {showActions && (
          <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteClick}
              className="p-1 h-6 w-6 bg-background-tertiary/80 backdrop-blur-sm"
            >
              {isFavorite ? (
                <HeartSolid className="w-3 h-3 text-red-500" />
              ) : (
                <HeartIcon className="w-3 h-3" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleQuickViewClick}
              className="p-1 h-6 w-6 bg-background-tertiary/80 backdrop-blur-sm"
            >
              <EyeIcon className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-3 pt-0">
        <h3 className="font-semibold text-tarkov-light group-hover:text-tarkov-accent transition-colors duration-200 text-sm mb-1 line-clamp-2">
          {item.name}
        </h3>
        
        {item.shortName && (
          <p className="text-tarkov-muted text-xs mb-2 line-clamp-1">
            {item.shortName}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-tarkov-muted mb-2">
          <div className="flex items-center gap-1">
            <ScaleIcon className="w-3 h-3" />
            {item.weight}kg
          </div>
          <div className="flex items-center gap-1">
            <CubeIcon className="w-3 h-3" />
            {item.width}×{item.height}
          </div>
        </div>

        {/* Preço */}
        {(item.avg24hPrice || item.basePrice) && (
          <div className="flex items-center justify-between">
            <span className="font-bold text-tarkov-accent text-sm">
              ₽{(item.avg24hPrice || item.basePrice || 0).toLocaleString()}
            </span>
            
            {item.changeLast48hPercent !== undefined && (
              <div className={`flex items-center gap-1 text-xs font-medium ${getPriceChangeColor()}`}>
                {getPriceChangeIcon()}
                {item.changeLast48hPercent > 0 ? '+' : ''}{item.changeLast48hPercent.toFixed(1)}%
              </div>
            )}
          </div>
        )}
      </div>

      {/* Indicador de hover */}
      <div className={`absolute inset-0 bg-gradient-to-br from-tarkov-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
      
      {/* Efeito de brilho */}
      <div className={`absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
    </div>
  );
};

export default ModernItemCard;
