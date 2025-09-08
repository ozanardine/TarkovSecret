'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { AnalyticsChart } from '@/components/analytics/AnalyticsChart';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import {
  ChartBarIcon,
  ClockIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  CpuChipIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface AnalyticsData {
  summary: {
    totalApiCalls: number;
    totalSearches: number;
    watchlistItems: number;
    averageResponseTime: number;
    mostActiveDay: string;
  };
  trends: {
    dailyApiCalls: Array<{ date: string; count: number }>;
    dailySearches: Array<{ date: string; count: number }>;
  };
  topEndpoints: Array<{ endpoint: string; count: number }>;
  performance: {
    averageResponseTime: number;
    successRate: number;
  };
}

interface SearchAnalytics {
  totalSearches: number;
  topQueries: Array<{ query: string; count: number }>;
  searchTypes: Array<{ type: string; count: number }>;
  timeDistribution: Array<{ hour: number; count: number }>;
  resultsAnalysis: {
    totalResults: number;
    averageResults: number;
    zeroResultSearches: number;
  };
}

interface ItemAnalytics {
  watchlistStats: {
    totalItems: number;
    categoriesDistribution: Array<{ category: string; count: number }>;
    priceRangeDistribution: Array<{ label: string; count: number }>;
  };
  searchedItems: {
    mostSearchedCategories: Array<{ category: string; count: number }>;
    averagePriceRange: { min: number; max: number };
  };
}

interface PerformanceAnalytics {
  responseTime: {
    average: number;
    median: number;
    p95: number;
  };
  throughput: {
    requestsPerHour: number;
    peakHour: number;
  };
  errors: {
    errorRate: number;
    commonErrors: Array<{ error: string; count: number }>;
  };
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [activeTab, setActiveTab] = useState<'overview' | 'searches' | 'items' | 'performance'>('overview');
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [searchData, setSearchData] = useState<SearchAnalytics | null>(null);
  const [itemData, setItemData] = useState<ItemAnalytics | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceAnalytics | null>(null);

  useEffect(() => {
    if (!subscription || subscription.type !== 'PLUS' || subscription.status !== 'ACTIVE') {
      router.push('/subscription');
      return;
    }

    if (subscription?.type === 'PLUS' && subscription?.status === 'ACTIVE') {
      fetchAnalytics();
    }
  }, [subscription, activeTab, period, router]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/plus/analytics?type=${activeTab}&period=${period}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar analytics');
      }

      const data = await response.json();
      
      switch (activeTab) {
        case 'overview':
          setAnalyticsData(data.data);
          break;
        case 'searches':
          setSearchData(data.data);
          break;
        case 'items':
          setItemData(data.data);
          break;
        case 'performance':
          setPerformanceData(data.data);
          break;
      }
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      toast.error('Erro ao carregar dados de analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '7d': return 'Últimos 7 dias';
      case '30d': return 'Últimos 30 dias';
      case '90d': return 'Últimos 90 dias';
      case '1y': return 'Último ano';
      default: return 'Últimos 30 dias';
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading size="lg" />
        </div>
      </PageLayout>
    );
  }

  if (!subscription || subscription.type !== 'PLUS' || subscription.status !== 'ACTIVE') {
    return null;
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-tarkov-light flex items-center gap-2">
              <ChartBarIcon className="w-8 h-8 text-tarkov-gold" />
              Analytics PLUS
            </h1>
            <p className="text-tarkov-muted mt-1">
              Métricas detalhadas de uso e performance da sua conta
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-tarkov-dark border border-tarkov-border rounded-lg px-3 py-2 text-tarkov-light focus:outline-none focus:ring-2 focus:ring-tarkov-gold"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="1y">Último ano</option>
            </select>
            
            <Button
              onClick={fetchAnalytics}
              size="sm"
              className="bg-tarkov-gold hover:bg-tarkov-gold/80 text-black"
            >
              Atualizar
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-tarkov-border">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Visão Geral', icon: ChartBarIcon },
              { id: 'searches', label: 'Buscas', icon: MagnifyingGlassIcon },
              { id: 'items', label: 'Itens', icon: HeartIcon },
              { id: 'performance', label: 'Performance', icon: CpuChipIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-tarkov-gold text-tarkov-gold'
                      : 'border-transparent text-tarkov-muted hover:text-tarkov-light hover:border-tarkov-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loading size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && analyticsData && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-tarkov-muted">Total de API Calls</p>
                        <p className="text-2xl font-bold text-tarkov-light">
                          {formatNumber(analyticsData.summary.totalApiCalls)}
                        </p>
                      </div>
                      <ServerIcon className="w-8 h-8 text-blue-400" />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-tarkov-muted">Total de Buscas</p>
                        <p className="text-2xl font-bold text-tarkov-light">
                          {formatNumber(analyticsData.summary.totalSearches)}
                        </p>
                      </div>
                      <MagnifyingGlassIcon className="w-8 h-8 text-green-400" />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-tarkov-muted">Itens Favoritos</p>
                        <p className="text-2xl font-bold text-tarkov-light">
                          {analyticsData.summary.watchlistItems}
                        </p>
                      </div>
                      <HeartIcon className="w-8 h-8 text-red-400" />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-tarkov-muted">Tempo Médio</p>
                        <p className="text-2xl font-bold text-tarkov-light">
                          {formatTime(analyticsData.summary.averageResponseTime)}
                        </p>
                      </div>
                      <ClockIcon className="w-8 h-8 text-yellow-400" />
                    </div>
                  </Card>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-tarkov-light flex items-center gap-2">
                        <BoltIcon className="w-5 h-5 text-tarkov-gold" />
                        Performance
                      </h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-tarkov-muted">Taxa de Sucesso</span>
                        <div className="flex items-center gap-2">
                          <span className="text-tarkov-light font-medium">
                            {analyticsData.performance.successRate}%
                          </span>
                          {analyticsData.performance.successRate >= 95 ? (
                            <CheckCircleIcon className="w-4 h-4 text-green-400" />
                          ) : (
                            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-tarkov-muted">Tempo de Resposta</span>
                        <span className="text-tarkov-light font-medium">
                          {formatTime(analyticsData.performance.averageResponseTime)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-tarkov-muted">Dia Mais Ativo</span>
                        <span className="text-tarkov-light font-medium">
                          {new Date(analyticsData.summary.mostActiveDay).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="p-6">
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-tarkov-light flex items-center gap-2">
                        <ArrowTrendingUpIcon className="w-5 h-5 text-tarkov-gold" />
                        Top Endpoints
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analyticsData.topEndpoints.slice(0, 5).map((endpoint, index) => (
                          <div key={endpoint.endpoint} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-tarkov-gold bg-tarkov-gold/20 px-2 py-1 rounded">
                                #{index + 1}
                              </span>
                              <span className="text-sm text-tarkov-light font-mono">
                                {endpoint.endpoint}
                              </span>
                            </div>
                            <Badge variant="secondary">
                              {formatNumber(endpoint.count)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Trends Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AnalyticsChart
                    title="API Calls Diárias"
                    type="line"
                    data={analyticsData.trends.dailyApiCalls.map(day => ({
                      label: new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                      value: day.count
                    }))}
                  />

                  <AnalyticsChart
                    title="Buscas Diárias"
                    type="line"
                    data={analyticsData.trends.dailySearches.map(day => ({
                      label: new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                      value: day.count
                    }))}
                  />
                </div>
              </>
            )}

            {/* Searches Tab */}
            {activeTab === 'searches' && searchData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-tarkov-muted">Total de Buscas</p>
                        <p className="text-2xl font-bold text-tarkov-light">
                          {formatNumber(searchData.totalSearches)}
                        </p>
                      </div>
                      <MagnifyingGlassIcon className="w-8 h-8 text-blue-400" />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-tarkov-muted">Resultados Médios</p>
                        <p className="text-2xl font-bold text-tarkov-light">
                          {searchData.resultsAnalysis.averageResults}
                        </p>
                      </div>
                      <EyeIcon className="w-8 h-8 text-green-400" />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-tarkov-muted">Sem Resultados</p>
                        <p className="text-2xl font-bold text-tarkov-light">
                          {searchData.resultsAnalysis.zeroResultSearches}
                        </p>
                      </div>
                      <ExclamationTriangleIcon className="w-8 h-8 text-yellow-400" />
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-tarkov-light">Top Consultas</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {searchData.topQueries.slice(0, 8).map((query, index) => (
                          <div key={query.query} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-tarkov-gold bg-tarkov-gold/20 px-2 py-1 rounded">
                                #{index + 1}
                              </span>
                              <span className="text-sm text-tarkov-light">
                                {query.query === 'empty' ? '(busca vazia)' : query.query}
                              </span>
                            </div>
                            <Badge variant="secondary">{query.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <AnalyticsChart
                    title="Distribuição por Hora"
                    type="bar"
                    data={searchData.timeDistribution.map(hour => ({
                      label: `${hour.hour}h`,
                      value: hour.count,
                      color: 'bg-blue-500'
                    }))}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AnalyticsChart
                    title="Tipos de Busca"
                    type="pie"
                    data={searchData.searchTypes.map(type => ({
                      label: type.type === 'text' ? 'Busca por Texto' : 
                             type.type === 'image' ? 'Busca por Imagem' : type.type,
                      value: type.count,
                      color: type.type === 'text' ? 'bg-tarkov-gold' : 'bg-blue-500'
                    }))}
                  />

                  <Card className="p-6">
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-tarkov-light">Análise de Resultados</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-tarkov-muted">Total de Resultados</span>
                        <span className="text-tarkov-light font-medium">
                          {formatNumber(searchData.resultsAnalysis.totalResults)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-tarkov-muted">Média por Busca</span>
                        <span className="text-tarkov-light font-medium">
                          {searchData.resultsAnalysis.averageResults}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-tarkov-muted">Buscas sem Resultado</span>
                        <div className="flex items-center gap-2">
                          <span className="text-tarkov-light font-medium">
                            {searchData.resultsAnalysis.zeroResultSearches}
                          </span>
                          <span className="text-xs text-tarkov-muted">
                            ({((searchData.resultsAnalysis.zeroResultSearches / searchData.totalSearches) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* Items Tab */}
            {activeTab === 'items' && itemData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-tarkov-muted">Itens na Watchlist</p>
                        <p className="text-2xl font-bold text-tarkov-light">
                          {itemData.watchlistStats.totalItems}
                        </p>
                      </div>
                      <HeartIcon className="w-8 h-8 text-red-400" />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-tarkov-muted">Faixa de Preço Média</p>
                        <p className="text-lg font-bold text-tarkov-light">
                          ₽{formatNumber(itemData.searchedItems.averagePriceRange.min)} - 
                          ₽{formatNumber(itemData.searchedItems.averagePriceRange.max)}
                        </p>
                      </div>
                      <CursorArrowRaysIcon className="w-8 h-8 text-green-400" />
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AnalyticsChart
                    title="Categorias na Watchlist"
                    type="pie"
                    data={itemData.watchlistStats.categoriesDistribution.slice(0, 6).map((category, index) => ({
                      label: category.category,
                      value: category.count,
                      color: [
                        'bg-tarkov-gold',
                        'bg-blue-500',
                        'bg-green-500',
                        'bg-purple-500',
                        'bg-orange-500',
                        'bg-red-500'
                      ][index % 6]
                    }))}
                  />

                  <AnalyticsChart
                    title="Categorias Mais Buscadas"
                    type="bar"
                    data={itemData.searchedItems.mostSearchedCategories.slice(0, 6).map((category, index) => ({
                      label: category.category,
                      value: category.count,
                      color: [
                        'bg-tarkov-accent',
                        'bg-blue-500',
                        'bg-green-500',
                        'bg-purple-500',
                        'bg-orange-500',
                        'bg-red-500'
                      ][index % 6]
                    }))}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AnalyticsChart
                    title="Distribuição de Preços - Watchlist"
                    type="bar"
                    data={itemData.watchlistStats.priceRangeDistribution.map((range, index) => ({
                      label: range.label,
                      value: range.count,
                      color: [
                        'bg-green-500',
                        'bg-yellow-500',
                        'bg-orange-500',
                        'bg-red-500'
                      ][index % 4]
                    }))}
                  />

                  <Card className="p-6">
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-tarkov-light">Estatísticas de Itens</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-tarkov-muted">Total na Watchlist</span>
                        <span className="text-tarkov-light font-medium">
                          {itemData.watchlistStats.totalItems}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-tarkov-muted">Categorias Únicas</span>
                        <span className="text-tarkov-light font-medium">
                          {itemData.watchlistStats.categoriesDistribution.length}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-tarkov-muted">Preço Médio Min</span>
                        <span className="text-tarkov-light font-medium">
                          ₽{formatNumber(itemData.searchedItems.averagePriceRange.min)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-tarkov-muted">Preço Médio Max</span>
                        <span className="text-tarkov-light font-medium">
                          ₽{formatNumber(itemData.searchedItems.averagePriceRange.max)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && performanceData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-tarkov-muted">Tempo Médio</p>
                        <p className="text-2xl font-bold text-tarkov-light">
                          {formatTime(performanceData.responseTime.average)}
                        </p>
                      </div>
                      <ClockIcon className="w-8 h-8 text-blue-400" />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-tarkov-muted">Requests/Hora</p>
                        <p className="text-2xl font-bold text-tarkov-light">
                          {performanceData.throughput.requestsPerHour}
                        </p>
                      </div>
                      <BoltIcon className="w-8 h-8 text-yellow-400" />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-tarkov-muted">Taxa de Erro</p>
                        <p className="text-2xl font-bold text-tarkov-light">
                          {performanceData.errors.errorRate.toFixed(1)}%
                        </p>
                      </div>
                      {performanceData.errors.errorRate < 5 ? (
                        <CheckCircleIcon className="w-8 h-8 text-green-400" />
                      ) : (
                        <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
                      )}
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AnalyticsChart
                    title="Métricas de Tempo de Resposta"
                    type="bar"
                    data={[
                      { label: 'Médio', value: performanceData.responseTime.average, color: 'bg-blue-500' },
                      { label: 'Mediano', value: performanceData.responseTime.median, color: 'bg-green-500' },
                      { label: 'P95', value: performanceData.responseTime.p95, color: 'bg-yellow-500' }
                    ]}
                  />

                  {performanceData.errors.commonErrors.length > 0 && (
                    <AnalyticsChart
                      title="Distribuição de Erros"
                      type="pie"
                      data={performanceData.errors.commonErrors.map((error, index) => ({
                        label: error.error,
                        value: error.count,
                        color: [
                          'bg-red-500',
                          'bg-orange-500',
                          'bg-yellow-500',
                          'bg-purple-500'
                        ][index % 4]
                      }))}
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-tarkov-light">Métricas de Tempo</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-tarkov-muted">Tempo Médio</span>
                        <span className="text-tarkov-light font-medium">
                          {formatTime(performanceData.responseTime.average)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-tarkov-muted">Tempo Mediano</span>
                        <span className="text-tarkov-light font-medium">
                          {formatTime(performanceData.responseTime.median)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-tarkov-muted">P95</span>
                        <span className="text-tarkov-light font-medium">
                          {formatTime(performanceData.responseTime.p95)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-tarkov-muted">Hora de Pico</span>
                        <span className="text-tarkov-light font-medium">
                          {performanceData.throughput.peakHour}:00
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="p-6">
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-tarkov-light">Throughput e Qualidade</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-tarkov-muted">Requests/Hora</span>
                        <span className="text-tarkov-light font-medium">
                          {performanceData.throughput.requestsPerHour}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-tarkov-muted">Hora de Pico</span>
                        <span className="text-tarkov-light font-medium">
                          {performanceData.throughput.peakHour}:00
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-tarkov-muted">Taxa de Erro</span>
                        <div className="flex items-center gap-2">
                          <span className="text-tarkov-light font-medium">
                            {performanceData.errors.errorRate.toFixed(1)}%
                          </span>
                          {performanceData.errors.errorRate < 5 ? (
                            <CheckCircleIcon className="w-4 h-4 text-green-400" />
                          ) : (
                            <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-tarkov-muted">Total de Erros</span>
                        <span className="text-tarkov-light font-medium">
                          {performanceData.errors.commonErrors.reduce((acc, error) => acc + error.count, 0)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}