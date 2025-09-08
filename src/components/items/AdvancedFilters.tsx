'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  FunnelIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  CurrencyDollarIcon,
  StarIcon,
  TagIcon,
  CubeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export interface AdvancedFiltersState {
  // Filtros básicos
  search: string;
  category: string;
  priceRange: [number, number];
  
  // Filtros avançados
  rarity: string[];
  weightRange: [number, number];
  sizeRange: [number, number];
  priceChange: 'all' | 'up' | 'down' | 'stable';
  popularity: 'all' | 'trending' | 'popular' | 'new';
  trader: string[];
  questRelated: boolean;
  hideoutRelated: boolean;
  barterRelated: boolean;
  
  // Ordenação
  sortBy: 'name' | 'price' | 'updated' | 'weight' | 'size' | 'popularity' | 'priceChange';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedFiltersProps {
  filters: AdvancedFiltersState;
  onFiltersChange: (filters: AdvancedFiltersState) => void;
  onClearFilters: () => void;
  itemCount: number;
  filteredCount: number;
}

const CATEGORIES = [
  'All', 'Weapon', 'Ammo', 'Armor', 'Backpack', 'Barter', 'Container',
  'Glasses', 'Grenade', 'Headphones', 'Helmet', 'Key', 'Medical',
  'Mods', 'Provisions', 'Rig', 'Suppressor'
];

const RARITIES = [
  { value: 'common', label: 'Comum', color: 'text-gray-400' },
  { value: 'uncommon', label: 'Incomum', color: 'text-green-400' },
  { value: 'rare', label: 'Raro', color: 'text-blue-400' },
  { value: 'epic', label: 'Épico', color: 'text-purple-400' },
  { value: 'legendary', label: 'Lendário', color: 'text-orange-400' },
];

const TRADERS = [
  'Prapor', 'Therapist', 'Fence', 'Skier', 'Peacekeeper', 'Mechanic',
  'Ragman', 'Jaeger', 'Lightkeeper'
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Nome' },
  { value: 'price', label: 'Preço' },
  { value: 'updated', label: 'Atualizado' },
  { value: 'weight', label: 'Peso' },
  { value: 'size', label: 'Tamanho' },
  { value: 'popularity', label: 'Popularidade' },
  { value: 'priceChange', label: 'Mudança de Preço' },
];

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  itemCount,
  filteredCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'sort'>('basic');

  const updateFilter = (key: keyof AdvancedFiltersState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'rarity' | 'trader', value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const clearAllFilters = () => {
    onClearFilters();
  };

  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.category !== 'All' ||
      filters.rarity.length > 0 ||
      filters.trader.length > 0 ||
      filters.priceRange[0] > 0 ||
      filters.priceRange[1] < 1000000 ||
      filters.weightRange[0] > 0 ||
      filters.weightRange[1] < 50 ||
      filters.sizeRange[0] > 0 ||
      filters.sizeRange[1] < 20 ||
      filters.priceChange !== 'all' ||
      filters.popularity !== 'all' ||
      filters.questRelated ||
      filters.hideoutRelated ||
      filters.barterRelated
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AdjustmentsHorizontalIcon className="w-5 h-5 text-tarkov-accent" />
            <h3 className="text-lg font-semibold text-tarkov-light">Filtros Avançados</h3>
            {hasActiveFilters() && (
              <Badge variant="primary" size="sm">
                {filteredCount.toLocaleString()} de {itemCount.toLocaleString()}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-tarkov-muted hover:text-tarkov-light"
              >
                <XMarkIcon className="w-4 h-4 mr-1" />
                Limpar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-tarkov-muted hover:text-tarkov-light"
            >
              <FunnelIcon className="w-4 h-4" />
              {isExpanded ? 'Recolher' : 'Expandir'}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          {/* Tabs de Navegação */}
          <div className="flex border-b border-card-border mb-6">
            {[
              { id: 'basic', label: 'Básicos', icon: TagIcon },
              { id: 'advanced', label: 'Avançados', icon: ChartBarIcon },
              { id: 'sort', label: 'Ordenação', icon: AdjustmentsHorizontalIcon },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                  activeTab === id
                    ? 'text-tarkov-accent border-b-2 border-tarkov-accent'
                    : 'text-tarkov-muted hover:text-tarkov-light'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Filtros Básicos */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* Busca */}
              <div>
                <label className="block text-sm font-medium text-tarkov-light mb-2">
                  Buscar Itens
                </label>
                <Input
                  placeholder="Nome do item..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-tarkov-light mb-2">
                  Categoria
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full px-3 py-2 bg-input-background border border-input-border rounded-md text-tarkov-light focus:outline-none focus:ring-2 focus:ring-input-focus"
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Faixa de Preço */}
              <div>
                <label className="block text-sm font-medium text-tarkov-light mb-2">
                  Faixa de Preço (₽)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Mínimo"
                    value={filters.priceRange[0] || ''}
                    onChange={(e) => updateFilter('priceRange', [Number(e.target.value) || 0, filters.priceRange[1]])}
                  />
                  <Input
                    type="number"
                    placeholder="Máximo"
                    value={filters.priceRange[1] || ''}
                    onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], Number(e.target.value) || 1000000])}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Filtros Avançados */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              {/* Raridade */}
              <div>
                <label className="block text-sm font-medium text-tarkov-light mb-2">
                  Raridade
                </label>
                <div className="flex flex-wrap gap-2">
                  {RARITIES.map(({ value, label, color }) => (
                    <button
                      key={value}
                      onClick={() => toggleArrayFilter('rarity', value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        filters.rarity.includes(value)
                          ? 'bg-tarkov-accent/20 text-tarkov-accent border border-tarkov-accent/30'
                          : 'bg-background-tertiary/60 text-tarkov-muted border border-card-border hover:bg-background-tertiary'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Traders */}
              <div>
                <label className="block text-sm font-medium text-tarkov-light mb-2">
                  Traders
                </label>
                <div className="flex flex-wrap gap-2">
                  {TRADERS.map(trader => (
                    <button
                      key={trader}
                      onClick={() => toggleArrayFilter('trader', trader)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        filters.trader.includes(trader)
                          ? 'bg-tarkov-accent/20 text-tarkov-accent border border-tarkov-accent/30'
                          : 'bg-background-tertiary/60 text-tarkov-muted border border-card-border hover:bg-background-tertiary'
                      }`}
                    >
                      {trader}
                    </button>
                  ))}
                </div>
              </div>

              {/* Faixas de Peso e Tamanho */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-tarkov-light mb-2">
                    Peso (kg)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Min"
                      value={filters.weightRange[0] || ''}
                      onChange={(e) => updateFilter('weightRange', [Number(e.target.value) || 0, filters.weightRange[1]])}
                    />
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Max"
                      value={filters.weightRange[1] || ''}
                      onChange={(e) => updateFilter('weightRange', [filters.weightRange[0], Number(e.target.value) || 50])}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-tarkov-light mb-2">
                    Tamanho (slots)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.sizeRange[0] || ''}
                      onChange={(e) => updateFilter('sizeRange', [Number(e.target.value) || 0, filters.sizeRange[1]])}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.sizeRange[1] || ''}
                      onChange={(e) => updateFilter('sizeRange', [filters.sizeRange[0], Number(e.target.value) || 20])}
                    />
                  </div>
                </div>
              </div>

              {/* Filtros de Tendência */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-tarkov-light mb-2">
                    Mudança de Preço
                  </label>
                  <select
                    value={filters.priceChange}
                    onChange={(e) => updateFilter('priceChange', e.target.value)}
                    className="w-full px-3 py-2 bg-input-background border border-input-border rounded-md text-tarkov-light focus:outline-none focus:ring-2 focus:ring-input-focus"
                  >
                    <option value="all">Todas</option>
                    <option value="up">Subindo ↗️</option>
                    <option value="down">Descendo ↘️</option>
                    <option value="stable">Estável ➡️</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-tarkov-light mb-2">
                    Popularidade
                  </label>
                  <select
                    value={filters.popularity}
                    onChange={(e) => updateFilter('popularity', e.target.value)}
                    className="w-full px-3 py-2 bg-input-background border border-input-border rounded-md text-tarkov-light focus:outline-none focus:ring-2 focus:ring-input-focus"
                  >
                    <option value="all">Todas</option>
                    <option value="trending">Em Alta 🔥</option>
                    <option value="popular">Populares ⭐</option>
                    <option value="new">Novos ✨</option>
                  </select>
                </div>
              </div>

              {/* Filtros de Uso */}
              <div>
                <label className="block text-sm font-medium text-tarkov-light mb-2">
                  Relacionado a
                </label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { key: 'questRelated', label: 'Quests', icon: '📋' },
                    { key: 'hideoutRelated', label: 'Hideout', icon: '🏠' },
                    { key: 'barterRelated', label: 'Barters', icon: '🔄' },
                  ].map(({ key, label, icon }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters[key as keyof AdvancedFiltersState] as boolean}
                        onChange={(e) => updateFilter(key as keyof AdvancedFiltersState, e.target.checked)}
                        className="w-4 h-4 text-tarkov-accent bg-input-background border-input-border rounded focus:ring-tarkov-accent"
                      />
                      <span className="text-tarkov-light text-sm">
                        {icon} {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Ordenação */}
          {activeTab === 'sort' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-tarkov-light mb-2">
                    Ordenar por
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => updateFilter('sortBy', e.target.value)}
                    className="w-full px-3 py-2 bg-input-background border border-input-border rounded-md text-tarkov-light focus:outline-none focus:ring-2 focus:ring-input-focus"
                  >
                    {SORT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-tarkov-light mb-2">
                    Ordem
                  </label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => updateFilter('sortOrder', e.target.value)}
                    className="w-full px-3 py-2 bg-input-background border border-input-border rounded-md text-tarkov-light focus:outline-none focus:ring-2 focus:ring-input-focus"
                  >
                    <option value="asc">Crescente</option>
                    <option value="desc">Decrescente</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default AdvancedFilters;
