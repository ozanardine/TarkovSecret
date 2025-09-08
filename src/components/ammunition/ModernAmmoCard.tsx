'use client';

import { useState } from 'react';
import { Ammo } from '@/types/tarkov';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import ClickableItemImage from '@/components/ui/ClickableItemImage';
import {
  EyeIcon,
  HeartIcon,
  ShareIcon,
  ShieldCheckIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface ModernAmmoCardProps {
  ammo: Ammo;
  viewMode?: 'grid' | 'list';
  onAmmoClick?: (ammo: Ammo) => void;
  onFavoriteToggle?: (ammoId: string) => void;
  onShare?: (ammo: Ammo) => void;
  onQuickView?: (ammo: Ammo) => void;
  onCompareToggle?: (ammo: Ammo) => void;
  isFavorite?: boolean;
  isInComparison?: boolean;
  showActions?: boolean;
  index?: number;
}

export function ModernAmmoCard({
  ammo,
  viewMode = 'grid',
  onAmmoClick,
  onFavoriteToggle,
  onShare,
  onQuickView,
  onCompareToggle,
  isFavorite = false,
  isInComparison = false,
  showActions = true,
  index = 0
}: ModernAmmoCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Determinar nível de penetração baseado no penetrationPower
  const getPenetrationLevel = (penetrationPower: number) => {
    if (penetrationPower >= 50) return { level: 'Muito Alta', color: 'bg-red-500', textColor: 'text-red-400' };
    if (penetrationPower >= 40) return { level: 'Alta', color: 'bg-orange-500', textColor: 'text-orange-400' };
    if (penetrationPower >= 30) return { level: 'Média', color: 'bg-yellow-500', textColor: 'text-yellow-400' };
    if (penetrationPower >= 20) return { level: 'Baixa', color: 'bg-blue-500', textColor: 'text-blue-400' };
    return { level: 'Muito Baixa', color: 'bg-gray-500', textColor: 'text-gray-400' };
  };

  // Determinar melhor trader baseado no preço
  const getBestTrader = () => {
    if (!ammo.item.buyFor || ammo.item.buyFor.length === 0) return null;
    
    return ammo.item.buyFor.reduce((best, current) => {
      if (!best || current.price < best.price) return current;
      return best;
    });
  };

  const penetrationInfo = getPenetrationLevel(ammo.penetrationPower);
  const bestTrader = getBestTrader();

  // Calcular eficiência de dano por preço
  const damagePerRuble = bestTrader ? (ammo.damage / bestTrader.price) : 0;

  const handleCardClick = () => {
    if (onAmmoClick) onAmmoClick(ammo);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteToggle) onFavoriteToggle(ammo.item.id);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) onShare(ammo);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) onQuickView(ammo);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCompareToggle) onCompareToggle(ammo);
  };

  if (viewMode === 'list') {
    return (
      <div
        className={`
          group relative bg-tarkov-dark/50 backdrop-blur-sm border border-tarkov-secondary/30 
          rounded-xl overflow-hidden transition-all duration-300 hover:border-tarkov-accent/50
          hover:shadow-lg hover:shadow-tarkov-accent/10 cursor-pointer
          ${isHovered ? 'scale-[1.02]' : ''}
        `}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          animationDelay: `${index * 50}ms`,
          animation: 'fadeInUp 0.6s ease-out forwards'
        }}
      >
        <div className="flex items-center p-4 gap-4">
          {/* Imagem */}
          <div className="flex-shrink-0">
            <ClickableItemImage
              src={ammo.item.image || ammo.item.icon}
              alt={ammo.item.name}
              size={64}
              className="rounded-lg"
              onError={() => setImageError(true)}
            />
          </div>

          {/* Informações principais */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold text-tarkov-light truncate">
                  {ammo.item.name}
                </h3>
                <p className="text-sm text-tarkov-muted">
                  {ammo.caliber} • {ammo.ammoType}
                </p>
              </div>
              
              {showActions && (
                <div className="flex items-center gap-1 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleQuickViewClick}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCompareClick}
                    className={`transition-colors ${isInComparison ? 'text-tarkov-accent' : 'opacity-0 group-hover:opacity-100'}`}
                    title={isInComparison ? 'Remover da comparação' : 'Adicionar à comparação'}
                  >
                    <ChartBarIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFavoriteClick}
                    className={`transition-colors ${isFavorite ? 'text-red-500' : 'opacity-0 group-hover:opacity-100'}`}
                  >
                    {isFavorite ? <HeartSolidIcon className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShareClick}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ShareIcon className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Stats em linha */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <BoltIcon className="w-4 h-4 text-red-400" />
                <span className="text-tarkov-muted">Dano:</span>
                <span className="font-semibold text-tarkov-light">{ammo.damage}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4 text-blue-400" />
                <span className="text-tarkov-muted">Penetração:</span>
                <span className={`font-semibold ${penetrationInfo.textColor}`}>
                  {ammo.penetrationPower}
                </span>
              </div>

              {bestTrader && (
                <div className="flex items-center gap-2">
                  <CurrencyDollarIcon className="w-4 h-4 text-green-400" />
                  <span className="text-tarkov-muted">Trader:</span>
                  <span className="font-semibold text-tarkov-light">
                    {bestTrader.source}
                  </span>
                </div>
              )}

              {damagePerRuble > 0 && (
                <div className="flex items-center gap-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-purple-400" />
                  <span className="text-tarkov-muted">Eficiência:</span>
                  <span className="font-semibold text-purple-400">
                    {damagePerRuble.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      className={`
        group relative bg-tarkov-dark/50 backdrop-blur-sm border border-tarkov-secondary/30 
        rounded-xl overflow-hidden transition-all duration-300 hover:border-tarkov-accent/50
        hover:shadow-lg hover:shadow-tarkov-accent/10 cursor-pointer
        ${isHovered ? 'scale-105' : ''}
      `}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animationDelay: `${index * 50}ms`,
        animation: 'fadeInUp 0.6s ease-out forwards'
      }}
    >
      {/* Header com imagem e ações */}
      <div className="relative p-4 pb-2">
        <div className="flex items-start justify-between mb-3">
          <ClickableItemImage
            src={ammo.item.image || ammo.item.icon}
            alt={ammo.item.name}
            size={48}
            className="rounded-lg"
            onError={() => setImageError(true)}
          />
          
          {showActions && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleQuickViewClick}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <EyeIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCompareClick}
                className={`transition-colors ${isInComparison ? 'text-tarkov-accent' : 'opacity-0 group-hover:opacity-100'}`}
                title={isInComparison ? 'Remover da comparação' : 'Adicionar à comparação'}
              >
                <ChartBarIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteClick}
                className={`transition-colors ${isFavorite ? 'text-red-500' : 'opacity-0 group-hover:opacity-100'}`}
              >
                {isFavorite ? <HeartSolidIcon className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShareClick}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ShareIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Tracer indicator */}
        {ammo.tracer && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              Tracer
            </Badge>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="px-4 pb-4">
        {/* Nome e calibre */}
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-tarkov-light truncate mb-1">
            {ammo.item.shortName || ammo.item.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-tarkov-muted">
            <span>{ammo.caliber}</span>
            <span>•</span>
            <span>{ammo.ammoType}</span>
          </div>
        </div>

        {/* Stats principais */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <BoltIcon className="w-3 h-3 text-red-400" />
              <span className="text-tarkov-muted">Dano</span>
            </div>
            <span className="font-semibold text-tarkov-light">{ammo.damage}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <ShieldCheckIcon className="w-3 h-3 text-blue-400" />
              <span className="text-tarkov-muted">Penetração</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${penetrationInfo.color}`}></div>
              <span className={`font-semibold ${penetrationInfo.textColor}`}>
                {ammo.penetrationPower}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <ScaleIcon className="w-3 h-3 text-gray-400" />
              <span className="text-tarkov-muted">Peso</span>
            </div>
            <span className="font-semibold text-tarkov-light">{ammo.weight}kg</span>
          </div>
        </div>

        {/* Trader info */}
        {bestTrader && (
          <div className="pt-2 border-t border-tarkov-secondary/30">
            <div className="flex items-center justify-between text-xs">
              <span className="text-tarkov-muted">Melhor Preço</span>
              <div className="text-right">
                <div className="font-semibold text-green-400">
                  {bestTrader.price.toLocaleString()} {bestTrader.currency}
                </div>
                <div className="text-tarkov-muted">{bestTrader.source}</div>
              </div>
            </div>
          </div>
        )}

        {/* Nível de penetração */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-tarkov-muted">Nível de Penetração</span>
            <span className={`font-semibold ${penetrationInfo.textColor}`}>
              {penetrationInfo.level}
            </span>
          </div>
          <div className="w-full bg-tarkov-secondary/30 rounded-full h-1">
            <div
              className={`h-1 rounded-full ${penetrationInfo.color}`}
              style={{ width: `${Math.min((ammo.penetrationPower / 60) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
