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
  UserIcon,
  MapIcon,
  TagIcon,
  TrophyIcon,
  ChartBarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export interface AdvancedQuestFiltersState {
  // Filtros básicos
  search: string;
  trader: string[];
  map: string[];
  
  // Filtros avançados
  minPlayerLevel: number;
  maxPlayerLevel: number;
  experienceRange: [number, number];
  questType: string[];
  objectiveType: string[];
  kappaRequired: boolean | null;
  lightkeeperRequired: boolean | null;
  restartable: boolean | null;
  
  // Ordenação
  sortBy: 'name' | 'trader' | 'level' | 'experience' | 'objectives' | 'minPlayerLevel';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedQuestFiltersProps {
  filters: AdvancedQuestFiltersState;
  onFiltersChange: (filters: AdvancedQuestFiltersState) => void;
  onClearFilters?: () => void;
  questCount?: number;
  filteredCount?: number;
  quests?: any[]; // Para compatibilidade
}

const TRADERS = [
  'Prapor', 'Therapist', 'Fence', 'Skier', 'Peacekeeper', 'Mechanic',
  'Ragman', 'Jaeger', 'Lightkeeper'
];

const MAPS = [
  'Customs', 'Factory', 'Interchange', 'Labs', 'Lighthouse', 'Reserve',
  'Shoreline', 'Streets of Tarkov', 'Woods', 'Ground Zero'
];

const QUEST_TYPES = [
  { value: 'kappa', label: 'Kappa Required', color: 'text-yellow-400' },
  { value: 'lightkeeper', label: 'Lightkeeper Required', color: 'text-blue-400' },
  { value: 'restartable', label: 'Restartable', color: 'text-green-400' },
];

const OBJECTIVE_TYPES = [
  'Elimination', 'Collection', 'Delivery', 'Extraction', 'Survival',
  'Skill', 'TraderLevel', 'UseItem', 'PlaceItem', 'Mark'
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Nome' },
  { value: 'trader', label: 'Trader' },
  { value: 'level', label: 'Nível' },
  { value: 'experience', label: 'Experiência' },
  { value: 'objectives', label: 'Objetivos' },
];

export const AdvancedQuestFilters: React.FC<AdvancedQuestFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  questCount,
  filteredCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'sort'>('basic');

  const updateFilter = (key: keyof AdvancedQuestFiltersState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'trader' | 'map' | 'questType' | 'objectiveType', value: string) => {
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
      filters.trader.length > 0 ||
      filters.map.length > 0 ||
      filters.minPlayerLevel > 0 ||
      filters.maxPlayerLevel < 100 ||
      filters.experienceRange[0] > 0 ||
      filters.experienceRange[1] < 100000 ||
      filters.questType.length > 0 ||
      filters.objectiveType.length > 0 ||
      filters.kappaRequired !== null ||
      filters.lightkeeperRequired !== null ||
      filters.restartable !== null
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AdjustmentsHorizontalIcon className="w-5 h-5 text-tarkov-accent" />
            <h3 className="text-lg font-semibold text-tarkov-light">Filtros de Quests</h3>
            {hasActiveFilters() && (
              <Badge variant="primary" size="sm">
                {filteredCount.toLocaleString()} de {questCount.toLocaleString()}
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
                  Buscar Quests
                </label>
                <Input
                  placeholder="Nome da quest..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Traders */}
              <div>
                <label className="block text-sm font-medium text-tarkov-light mb-2">
                  Traders
                </label>
                <div className="flex flex-wrap gap-2">
                  {TRADERS.map(trader => (
                    <Button
                      key={trader}
                      variant={filters.trader.includes(trader) ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => toggleArrayFilter('trader', trader)}
                      className="text-xs"
                    >
                      <UserIcon className="w-3 h-3 mr-1" />
                      {trader}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Maps */}
              <div>
                <label className="block text-sm font-medium text-tarkov-light mb-2">
                  Mapas
                </label>
                <div className="flex flex-wrap gap-2">
                  {MAPS.map(map => (
                    <Button
                      key={map}
                      variant={filters.map.includes(map) ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => toggleArrayFilter('map', map)}
                      className="text-xs"
                    >
                      <MapIcon className="w-3 h-3 mr-1" />
                      {map}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Filtros Avançados */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              {/* Nível do Jogador */}
              <div>
                <label className="block text-sm font-medium text-tarkov-light mb-2">
                  Nível do Jogador
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Mínimo"
                    value={filters.minPlayerLevel || ''}
                    onChange={(e) => updateFilter('minPlayerLevel', Number(e.target.value) || 0)}
                    min="0"
                    max="100"
                  />
                  <Input
                    type="number"
                    placeholder="Máximo"
                    value={filters.maxPlayerLevel || ''}
                    onChange={(e) => updateFilter('maxPlayerLevel', Number(e.target.value) || 100)}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* Faixa de Experiência */}
              <div>
                <label className="block text-sm font-medium text-tarkov-light mb-2">
                  Experiência (XP)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Mínimo"
                    value={filters.experienceRange[0] || ''}
                    onChange={(e) => updateFilter('experienceRange', [Number(e.target.value) || 0, filters.experienceRange[1]])}
                  />
                  <Input
                    type="number"
                    placeholder="Máximo"
                    value={filters.experienceRange[1] || ''}
                    onChange={(e) => updateFilter('experienceRange', [filters.experienceRange[0], Number(e.target.value) || 100000])}
                  />
                </div>
              </div>

              {/* Tipo de Quest */}
              <div>
                <label className="block text-sm font-medium text-tarkov-light mb-2">
                  Tipo de Quest
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="kappa-required"
                      checked={filters.kappaRequired === true}
                      onChange={(e) => updateFilter('kappaRequired', e.target.checked ? true : null)}
                      className="rounded border-input-border bg-input-background"
                    />
                    <label htmlFor="kappa-required" className="text-sm text-yellow-400">
                      Kappa Required
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="lightkeeper-required"
                      checked={filters.lightkeeperRequired === true}
                      onChange={(e) => updateFilter('lightkeeperRequired', e.target.checked ? true : null)}
                      className="rounded border-input-border bg-input-background"
                    />
                    <label htmlFor="lightkeeper-required" className="text-sm text-blue-400">
                      Lightkeeper Required
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="restartable"
                      checked={filters.restartable === true}
                      onChange={(e) => updateFilter('restartable', e.target.checked ? true : null)}
                      className="rounded border-input-border bg-input-background"
                    />
                    <label htmlFor="restartable" className="text-sm text-green-400">
                      Restartable
                    </label>
                  </div>
                </div>
              </div>

              {/* Tipo de Objetivo */}
              <div>
                <label className="block text-sm font-medium text-tarkov-light mb-2">
                  Tipo de Objetivo
                </label>
                <div className="flex flex-wrap gap-2">
                  {OBJECTIVE_TYPES.map(type => (
                    <Button
                      key={type}
                      variant={filters.objectiveType.includes(type) ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => toggleArrayFilter('objectiveType', type)}
                      className="text-xs"
                    >
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Ordenação */}
          {activeTab === 'sort' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Ordenar por */}
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

                {/* Ordem */}
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

export default AdvancedQuestFilters;