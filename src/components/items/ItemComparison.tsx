'use client';

import React, { useState } from 'react';
import { TarkovItem } from '@/types/tarkov';
import { Badge, ItemTypeBadge, PriceChangeBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  XMarkIcon,
  PlusIcon,
  ScaleIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  TagIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

interface ItemComparisonProps {
  items: TarkovItem[];
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: TarkovItem) => void;
  onRemoveItem: (itemId: string) => void;
  onItemClick?: (itemId: string) => void;
  maxItems?: number;
}

export const ItemComparison: React.FC<ItemComparisonProps> = ({
  items,
  isOpen,
  onClose,
  onAddItem,
  onRemoveItem,
  onItemClick,
  maxItems = 4,
}) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const getItemImage = (item: TarkovItem) => {
    if (imageErrors[item.id]) return '/placeholder-item.png';
    
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

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const getPriceChangeIcon = (change?: number) => {
    if (!change) return null;
    
    if (change > 0) {
      return <TrendingUpIcon className="w-3 h-3" />;
    } else if (change < 0) {
      return <TrendingDownIcon className="w-3 h-3" />;
    } else {
      return <MinusIcon className="w-3 h-3" />;
    }
  };

  const getPriceChangeColor = (change?: number) => {
    if (!change) return 'text-tarkov-muted';
    
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-tarkov-muted';
  };

  const getComparisonValue = (item: TarkovItem, field: keyof TarkovItem) => {
    const value = item[field];
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return value;
    return null;
  };

  const getBestValue = (field: keyof TarkovItem, type: 'min' | 'max' = 'max') => {
    if (items.length === 0) return null;
    
    const values = items.map(item => getComparisonValue(item, field)).filter(v => v !== null);
    if (values.length === 0) return null;
    
    if (type === 'min') {
      return Math.min(...values as number[]);
    } else {
      return Math.max(...values as number[]);
    }
  };

  const isBestValue = (item: TarkovItem, field: keyof TarkovItem, type: 'min' | 'max' = 'max') => {
    const bestValue = getBestValue(field, type);
    const itemValue = getComparisonValue(item, field);
    return bestValue === itemValue;
  };

  const comparisonFields = [
    {
      key: 'weight' as keyof TarkovItem,
      label: 'Peso (kg)',
      icon: ScaleIcon,
      type: 'min' as const,
      format: (value: any) => `${value} kg`,
    },
    {
      key: 'width' as keyof TarkovItem,
      label: 'Largura',
      icon: CubeIcon,
      type: 'min' as const,
      format: (value: any) => `${value}`,
    },
    {
      key: 'height' as keyof TarkovItem,
      label: 'Altura',
      icon: CubeIcon,
      type: 'min' as const,
      format: (value: any) => `${value}`,
    },
    {
      key: 'basePrice' as keyof TarkovItem,
      label: 'Preço Base',
      icon: CurrencyDollarIcon,
      type: 'min' as const,
      format: (value: any) => `₽${value?.toLocaleString() || 'N/A'}`,
    },
    {
      key: 'avg24hPrice' as keyof TarkovItem,
      label: 'Preço 24h',
      icon: CurrencyDollarIcon,
      type: 'min' as const,
      format: (value: any) => `₽${value?.toLocaleString() || 'N/A'}`,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      className="max-w-7xl"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="w-6 h-6 text-tarkov-accent" />
            <h2 className="text-2xl font-bold text-tarkov-light">
              Comparação de Itens
            </h2>
            <Badge variant="secondary" size="sm">
              {items.length} de {maxItems}
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <XMarkIcon className="w-5 h-5" />
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-tarkov-secondary/30 rounded-full flex items-center justify-center">
              <PlusIcon className="w-12 h-12 text-tarkov-muted" />
            </div>
            <h3 className="text-lg font-semibold text-tarkov-light mb-2">
              Nenhum item selecionado
            </h3>
            <p className="text-tarkov-muted">
              Adicione itens à comparação clicando no botão de comparação nos cards
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Grid de Itens */}
            <div className={`grid gap-4 ${items.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : items.length === 2 ? 'grid-cols-2' : items.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="relative bg-background-tertiary/60 backdrop-blur-sm rounded-lg p-4 border border-card-border/50 hover:border-tarkov-accent/50 transition-colors duration-200"
                >
                  {/* Botão de remover */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.id)}
                    className="absolute top-2 right-2 p-1 h-6 w-6 bg-background-tertiary/80 backdrop-blur-sm"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </Button>

                  {/* Imagem */}
                  <div className="text-center mb-4">
                    <div className="relative inline-block">
                      <img
                        src={getItemImage(item)}
                        alt={item.name}
                        className="w-20 h-20 object-contain rounded-lg bg-background-tertiary/30 p-2 mx-auto"
                        onError={() => handleImageError(item.id)}
                      />
                      {item.types[0] && (
                        <div className="absolute -bottom-1 -right-1">
                          <ItemTypeBadge itemType={item.types[0]} size="sm" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nome */}
                  <h3 className="font-semibold text-tarkov-light text-sm mb-2 line-clamp-2 text-center">
                    {item.name}
                  </h3>

                  {/* Preço */}
                  {(item.avg24hPrice || item.basePrice) && (
                    <div className="text-center mb-2">
                      <div className="font-bold text-tarkov-accent text-sm">
                        ₽{(item.avg24hPrice || item.basePrice || 0).toLocaleString()}
                      </div>
                      {item.changeLast48hPercent !== undefined && (
                        <div className={`flex items-center justify-center gap-1 text-xs font-medium ${getPriceChangeColor(item.changeLast48hPercent)}`}>
                          {getPriceChangeIcon(item.changeLast48hPercent)}
                          {item.changeLast48hPercent > 0 ? '+' : ''}{item.changeLast48hPercent.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  )}

                  {/* Botão de detalhes */}
                  {onItemClick && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onItemClick(item.id)}
                      className="w-full mt-2"
                    >
                      Ver Detalhes
                    </Button>
                  )}
                </div>
              ))}

              {/* Slot vazio para adicionar mais itens */}
              {items.length < maxItems && (
                <div className="border-2 border-dashed border-card-border rounded-lg p-4 flex items-center justify-center min-h-[200px] hover:border-tarkov-accent/50 transition-colors duration-200">
                  <div className="text-center">
                    <PlusIcon className="w-8 h-8 text-tarkov-muted mx-auto mb-2" />
                    <p className="text-tarkov-muted text-sm">
                      Adicionar item
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Tabela de Comparação */}
            <div className="bg-background-tertiary/60 backdrop-blur-sm rounded-lg border border-card-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background-tertiary/80">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-tarkov-light">
                        Propriedade
                      </th>
                      {items.map((item, index) => (
                        <th key={item.id} className="px-4 py-3 text-center text-sm font-semibold text-tarkov-light min-w-[120px]">
                          Item {index + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border/50">
                    {comparisonFields.map(({ key, label, icon: Icon, type, format }) => (
                      <tr key={key} className="hover:bg-background-tertiary/40 transition-colors duration-200">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-tarkov-muted" />
                            <span className="text-sm font-medium text-tarkov-light">{label}</span>
                          </div>
                        </td>
                        {items.map((item) => {
                          const value = getComparisonValue(item, key);
                          const isBest = isBestValue(item, key, type);
                          
                          return (
                            <td key={item.id} className="px-4 py-3 text-center">
                              <span className={`text-sm ${isBest ? 'font-bold text-tarkov-accent' : 'text-tarkov-light'}`}>
                                {format(value)}
                              </span>
                              {isBest && (
                                <StarIcon className="w-3 h-3 text-tarkov-accent inline-block ml-1" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background-tertiary/60 backdrop-blur-sm rounded-lg p-4 border border-card-border/50">
                <h4 className="font-semibold text-tarkov-light mb-2">Preço Mais Baixo</h4>
                {(() => {
                  const prices = items.map(item => item.avg24hPrice || item.basePrice).filter(Boolean);
                  const minPrice = Math.min(...prices);
                  const cheapestItem = items.find(item => (item.avg24hPrice || item.basePrice) === minPrice);
                  return (
                    <div>
                      <div className="text-lg font-bold text-tarkov-accent">
                        ₽{minPrice.toLocaleString()}
                      </div>
                      <div className="text-sm text-tarkov-muted">
                        {cheapestItem?.name}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="bg-background-tertiary/60 backdrop-blur-sm rounded-lg p-4 border border-card-border/50">
                <h4 className="font-semibold text-tarkov-light mb-2">Mais Leve</h4>
                {(() => {
                  const weights = items.map(item => item.weight);
                  const minWeight = Math.min(...weights);
                  const lightestItem = items.find(item => item.weight === minWeight);
                  return (
                    <div>
                      <div className="text-lg font-bold text-tarkov-accent">
                        {minWeight} kg
                      </div>
                      <div className="text-sm text-tarkov-muted">
                        {lightestItem?.name}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="bg-background-tertiary/60 backdrop-blur-sm rounded-lg p-4 border border-card-border/50">
                <h4 className="font-semibold text-tarkov-light mb-2">Menor Tamanho</h4>
                {(() => {
                  const sizes = items.map(item => item.width * item.height);
                  const minSize = Math.min(...sizes);
                  const smallestItem = items.find(item => item.width * item.height === minSize);
                  return (
                    <div>
                      <div className="text-lg font-bold text-tarkov-accent">
                        {minSize} slots
                      </div>
                      <div className="text-sm text-tarkov-muted">
                        {smallestItem?.name}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ItemComparison;
