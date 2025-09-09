'use client';

import { TarkovItem } from '@/types/tarkov';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ScaleIcon,
  CubeIcon,
  TagIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InformationCircleIcon,
  ChartBarIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface ItemSpecsProps {
  item: TarkovItem;
}

export function ItemSpecs({ item }: ItemSpecsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR').format(price);
  };

  const formatWeight = (weight: number) => {
    return `${weight.toFixed(2)} kg`;
  };

  const formatDimensions = (width: number, height: number) => {
    return `${width}×${height} (${width * height} slots)`;
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <ArrowTrendingUpIcon className="w-4 h-4" />;
    if (change < 0) return <ArrowTrendingDownIcon className="w-4 h-4" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Especificações Físicas */}
      <Card variant="elevated">
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <CubeIcon className="w-5 h-5 text-blue-400" />
            Especificações Físicas
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <ScaleIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Peso</p>
                <p className="text-white font-semibold">{formatWeight(item.weight)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CubeIcon className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Dimensões</p>
                <p className="text-white font-semibold">{formatDimensions(item.width, item.height)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações de Mercado */}
      <Card variant="elevated">
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <CurrencyDollarIcon className="w-5 h-5 text-yellow-500" />
            Informações de Mercado
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {item.basePrice && (
              <div className="p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <TagIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Preço Base</span>
                </div>
                <p className="text-xl font-bold text-yellow-500">₽ {formatPrice(item.basePrice)}</p>
              </div>
            )}
            
            {item.avg24hPrice && (
              <div className="p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Média 24h</span>
                </div>
                <p className="text-xl font-bold text-green-400">₽ {formatPrice(item.avg24hPrice)}</p>
              </div>
            )}

            {item.changeLast48hPercent !== undefined && item.changeLast48hPercent !== null && (
              <div className="p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <ChartBarIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Variação 48h</span>
                </div>
                <div className={`text-xl font-bold flex items-center gap-2 ${getPriceChangeColor(item.changeLast48hPercent)}`}>
                  {getPriceChangeIcon(item.changeLast48hPercent)}
                  {formatPercentage(item.changeLast48hPercent)}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card variant="elevated">
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <InformationCircleIcon className="w-5 h-5 text-purple-400" />
            Informações Adicionais
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {item.fleaMarketFee && (
              <div className="flex items-center gap-3 p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <TagIcon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Taxa do Flea Market</p>
                  <p className="text-white font-semibold">₽ {formatPrice(item.fleaMarketFee)}</p>
                </div>
              </div>
            )}

            {item.rarity && (
              <div className="flex items-center gap-3 p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <StarIcon className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Raridade</p>
                  <Badge 
                    variant="secondary" 
                    className={`${
                      item.rarity === 'legendary' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' :
                      item.rarity === 'epic' ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' :
                      item.rarity === 'rare' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' :
                      item.rarity === 'uncommon' ? 'bg-green-500/20 border-green-500/50 text-green-400' :
                      'bg-gray-500/20 border-gray-500/50 text-gray-400'
                    }`}
                  >
                    {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}