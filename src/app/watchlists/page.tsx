'use client';

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Heart, Plus, Search, Star, TrendingUp, AlertCircle } from 'lucide-react';

export default function WatchlistsPage() {
  // Mock data - em produção viria da API
  const watchlists = [
    {
      id: '1',
      name: 'Armas Favoritas',
      itemCount: 12,
      lastUpdated: '2024-01-10',
      items: [
        { id: '1', name: 'AK-74', price: 45000, change: 2.5 },
        { id: '2', name: 'M4A1', price: 120000, change: -1.2 },
        { id: '3', name: 'SVD', price: 180000, change: 5.8 },
      ]
    },
    {
      id: '2',
      name: 'Itens de Quest',
      itemCount: 8,
      lastUpdated: '2024-01-09',
      items: [
        { id: '4', name: 'Gas Analyzer', price: 25000, change: 3.2 },
        { id: '5', name: 'Flash Drive', price: 15000, change: -0.8 },
      ]
    },
    {
      id: '3',
      name: 'Investimentos',
      itemCount: 5,
      lastUpdated: '2024-01-08',
      items: [
        { id: '6', name: 'Bitcoin', price: 500000, change: 12.5 },
        { id: '7', name: 'Graphics Card', price: 80000, change: -2.1 },
      ]
    }
  ];

  const recentItems = [
    { id: '1', name: 'AK-74', price: 45000, change: 2.5, watchlist: 'Armas Favoritas' },
    { id: '2', name: 'M4A1', price: 120000, change: -1.2, watchlist: 'Armas Favoritas' },
    { id: '4', name: 'Gas Analyzer', price: 25000, change: 3.2, watchlist: 'Itens de Quest' },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-tarkov-dark py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-tarkov-light mb-2">
                <Heart className="inline w-8 h-8 text-tarkov-accent mr-3" />
                Minhas Listas
              </h1>
              <p className="text-tarkov-muted">
                Gerencie suas listas de favoritos e acompanhe preços
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button size="lg" className="px-6">
                <Plus className="w-4 h-4 mr-2" />
                Nova Lista
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-8">
            <Input
              placeholder="Buscar nas suas listas..."
              leftIcon={<Search className="w-4 h-4" />}
              className="max-w-md"
            />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 text-center">
              <div className="text-2xl font-bold text-tarkov-light mb-1">
                {watchlists.length}
              </div>
              <div className="text-sm text-tarkov-muted">Listas Ativas</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-2xl font-bold text-tarkov-light mb-1">
                {watchlists.reduce((acc, list) => acc + list.itemCount, 0)}
              </div>
              <div className="text-sm text-tarkov-muted">Itens Total</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                +5.2%
              </div>
              <div className="text-sm text-tarkov-muted">Ganho Médio</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-2xl font-bold text-tarkov-accent mb-1">
                12
              </div>
              <div className="text-sm text-tarkov-muted">Alertas Ativos</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Watchlists */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-tarkov-light mb-6">
                Suas Listas
              </h2>
              <div className="space-y-4">
                {watchlists.map((watchlist) => (
                  <Card key={watchlist.id} className="p-6 hover:bg-tarkov-secondary/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-tarkov-light mb-1">
                          {watchlist.name}
                        </h3>
                        <p className="text-sm text-tarkov-muted">
                          {watchlist.itemCount} itens • Atualizado em {watchlist.lastUpdated}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Star className="w-4 h-4 mr-1" />
                          Favoritar
                        </Button>
                        <Button size="sm" variant="ghost">
                          ...
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {watchlist.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-tarkov-dark/50 rounded">
                          <div>
                            <div className="text-sm font-medium text-tarkov-light">
                              {item.name}
                            </div>
                            <div className="text-xs text-tarkov-muted">
                              ₽{item.price.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${
                              item.change > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {item.change > 0 ? '+' : ''}{item.change}%
                            </div>
                            <div className="text-xs text-tarkov-muted">
                              <TrendingUp className="inline w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      ))}
                      {watchlist.items.length > 3 && (
                        <div className="text-center">
                          <Button variant="ghost" size="sm">
                            Ver mais {watchlist.items.length - 3} itens
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Items & Quick Actions */}
            <div className="space-y-6">
              {/* Recent Items */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-tarkov-light mb-4">
                  Itens Recentes
                </h3>
                <div className="space-y-3">
                  {recentItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2">
                      <div>
                        <div className="text-sm font-medium text-tarkov-light">
                          {item.name}
                        </div>
                        <div className="text-xs text-tarkov-muted">
                          {item.watchlist}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-tarkov-light">
                          ₽{item.price.toLocaleString()}
                        </div>
                        <div className={`text-xs ${
                          item.change > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {item.change > 0 ? '+' : ''}{item.change}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-tarkov-light mb-4">
                  Ações Rápidas
                </h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Item
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Configurar Alertas
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Ver Análises
                  </Button>
                </div>
              </Card>

              {/* Plus Features */}
              <Card className="p-6 bg-gradient-to-br from-tarkov-accent/10 to-transparent border-tarkov-accent/20">
                <h3 className="text-lg font-semibold text-tarkov-light mb-2">
                  <Badge variant="primary" className="mr-2">Plus</Badge>
                  Recursos Avançados
                </h3>
                <ul className="text-sm text-tarkov-muted space-y-2 mb-4">
                  <li>• Alertas de preço ilimitados</li>
                  <li>• Análises de tendências</li>
                  <li>• Exportar listas</li>
                  <li>• Histórico de preços</li>
                </ul>
                <Button size="sm" className="w-full">
                  Fazer Upgrade
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
