'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { TarkovItem } from '@/types/tarkov';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

interface PricePoint {
  timestamp: string;
  price: number;
  date: string;
}

interface PriceHistoryProps {
  item: TarkovItem;
}

export function PriceHistory({ item }: PriceHistoryProps) {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPriceHistory();
  }, [item.id, timeRange]);

  const fetchPriceHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular dados de histórico de preços (substituir por API real)
      const mockData = generateMockPriceHistory(item.avg24hPrice || item.basePrice || 0, timeRange);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPriceHistory(mockData);
    } catch (err) {
      setError('Erro ao carregar histórico de preços');
    } finally {
      setLoading(false);
    }
  };

  const generateMockPriceHistory = (basePrice: number, range: string): PricePoint[] => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const points: PricePoint[] = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simular variação de preço
      const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
      const price = Math.round(basePrice * (1 + variation));
      
      points.push({
        timestamp: date.toISOString(),
        price,
        date: date.toLocaleDateString('pt-BR')
      });
    }
    
    return points;
  };

  const calculateStats = () => {
    if (priceHistory.length === 0) return null;
    
    const prices = priceHistory.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    return { minPrice, maxPrice, avgPrice, change };
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR').format(price);
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />;
    if (change < 0) return <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />;
    return <MinusIcon className="w-4 h-4 text-gray-400" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const renderSimpleChart = () => {
    if (priceHistory.length === 0) return null;
    
    const prices = priceHistory.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    
    return (
      <div className="relative h-32 bg-gray-800/40 rounded-lg p-4 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="2"
            points={priceHistory.map((point, index) => {
              const x = (index / (priceHistory.length - 1)) * 100;
              const y = 100 - ((point.price - minPrice) / range) * 100;
              return `${x},${y}`;
            }).join(' ')}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800/40 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-800/40 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-800/40 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="elevated">
        <CardContent className="text-center py-8">
          <ChartBarIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            Erro ao Carregar Dados
          </h3>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <Button onClick={fetchPriceHistory} variant="outline" size="sm">
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Controles de Período */}
      <Card variant="elevated">
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-blue-400" />
            Histórico de Preços
          </h3>
          <p className="text-sm text-gray-400">Acompanhe a evolução dos preços ao longo do tempo</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { value: '7d', label: '7 dias' },
              { value: '30d', label: '30 dias' },
              { value: '90d', label: '90 dias' }
            ].map(({ value, label }) => (
              <Button
                key={value}
                variant={timeRange === value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(value as any)}
                className={timeRange === value 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-gray-800/40 border-gray-600 text-gray-300 hover:bg-gray-700/40'
                }
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Gráfico */}
          {renderSimpleChart()}
        </CardContent>
      </Card>

      {/* Estatísticas */}
      {stats && (
        <Card variant="elevated">
          <CardHeader>
            <h4 className="text-md font-semibold text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-green-400" />
              Resumo do Período
            </h4>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-400">Preço Máximo</span>
                </div>
                <div className="text-xl font-bold text-green-400">
                  ₽{formatPrice(stats.maxPrice)}
                </div>
              </div>

              <div className="p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-gray-400">Preço Mínimo</span>
                </div>
                <div className="text-xl font-bold text-red-400">
                  ₽{formatPrice(stats.minPrice)}
                </div>
              </div>

              <div className="p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <ChartBarIcon className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Preço Médio</span>
                </div>
                <div className="text-xl font-bold text-blue-400">
                  ₽{formatPrice(stats.avgPrice)}
                </div>
              </div>
            </div>

            {/* Variação Total */}
            <div className="mt-6 p-4 bg-gray-800/20 rounded-lg border border-gray-700/50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Variação Total no Período</span>
                <div className={`flex items-center gap-2 text-lg font-bold ${getChangeColor(stats.change)}`}>
                  {getChangeIcon(stats.change)}
                  {stats.change > 0 ? '+' : ''}{stats.change.toFixed(2)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Preços Recentes */}
      {priceHistory.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <h4 className="text-md font-semibold text-white">Preços Recentes</h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {priceHistory.slice(-10).reverse().map((point, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/40 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{point.date}</span>
                  </div>
                  <span className="font-medium text-white">₽{formatPrice(point.price)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}