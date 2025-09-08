'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

export interface AdvancedAmmoFiltersState {
  search: string;
  caliber: string[];
  damageRange: [number, number];
  penetrationRange: [number, number];
  priceRange: [number, number];
  trader: string[];
  ammoType: string[];
  tracer: 'all' | 'tracer' | 'no-tracer';
  sortBy: 'name' | 'damage' | 'penetration' | 'price' | 'efficiency' | 'armorDamage' | 'fragmentation' | 'accuracy' | 'recoil' | 'velocity';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedAmmoFiltersProps {
  filters: AdvancedAmmoFiltersState;
  onFiltersChange: (filters: AdvancedAmmoFiltersState) => void;
  onClearFilters: () => void;
  availableCalibers: string[];
  availableTraders: string[];
  availableAmmoTypes: string[];
  className?: string;
}

export function AdvancedAmmoFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  availableCalibers,
  availableTraders,
  availableAmmoTypes,
  className = ''
}: AdvancedAmmoFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (updates: Partial<AdvancedAmmoFiltersState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleArrayFilter = (key: keyof AdvancedAmmoFiltersState, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilters({ [key]: newArray });
  };

  // Função para limpar o nome do calibre
  const cleanCaliberName = (caliber: string) => {
    return caliber
      .replace(/caliber/gi, '') // Remove "caliber" (case insensitive)
      .replace(/mm/gi, '') // Remove "mm"
      .replace(/\s+/g, '') // Remove espaços extras
      .replace(/[()]/g, '') // Remove parênteses
      .replace(/^\.+|\.+$/g, '') // Remove pontos no início/fim
      .trim();
  };

  const hasActiveFilters = () => {
    return (
      filters.search !== '' ||
      filters.caliber.length > 0 ||
      filters.trader.length > 0 ||
      filters.ammoType.length > 0 ||
      filters.tracer !== 'all' ||
      filters.damageRange[0] > 0 || filters.damageRange[1] < 200 ||
      filters.penetrationRange[0] > 0 || filters.penetrationRange[1] < 100 ||
      filters.priceRange[0] > 0 || filters.priceRange[1] < 50000
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search !== '') count++;
    if (filters.caliber.length > 0) count++;
    if (filters.trader.length > 0) count++;
    if (filters.ammoType.length > 0) count++;
    if (filters.tracer !== 'all') count++;
    if (filters.damageRange[0] > 0 || filters.damageRange[1] < 200) count++;
    if (filters.penetrationRange[0] > 0 || filters.penetrationRange[1] < 100) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000) count++;
    return count;
  };

  return (
    <div className={`bg-tarkov-dark/50 backdrop-blur-sm border border-tarkov-secondary/30 rounded-xl ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-tarkov-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FunnelIcon className="w-5 h-5 text-tarkov-accent" />
            <h3 className="text-lg font-semibold text-tarkov-light">
              Filtros Avançados
            </h3>
            {hasActiveFilters() && (
              <Badge variant="secondary" className="bg-tarkov-accent/20 text-tarkov-accent">
                {getActiveFiltersCount()} ativo{getActiveFiltersCount() !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
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
              {isExpanded ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Barra de busca sempre visível */}
        <div className="mt-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-tarkov-muted" />
            <Input
              type="text"
              placeholder="Buscar por nome, calibre ou tipo..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10"
              aria-label="Campo de busca de munições"
            />
            {filters.search && (
              <button
                onClick={() => updateFilters({ search: '' })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-tarkov-muted hover:text-tarkov-light"
                aria-label="Limpar busca"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filtros expandidos */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Linha 1: Calibre e Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Calibres */}
            <div>
              <label className="block text-sm font-medium text-tarkov-light mb-3">
                Calibre ({availableCalibers.length} disponíveis)
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {availableCalibers.map(caliber => (
                  <Badge
                    key={caliber}
                    variant={filters.caliber.includes(caliber) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-colors ${
                      filters.caliber.includes(caliber)
                        ? 'bg-tarkov-accent text-tarkov-dark'
                        : 'hover:bg-tarkov-accent/20'
                    }`}
                    onClick={() => toggleArrayFilter('caliber', caliber)}
                    role="checkbox"
                    aria-checked={filters.caliber.includes(caliber)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleArrayFilter('caliber', caliber);
                      }
                    }}
                  >
                    {cleanCaliberName(caliber)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tipo de munição */}
            <div>
              <label className="block text-sm font-medium text-tarkov-light mb-3">
                Tipo de Munição
              </label>
              <div className="flex flex-wrap gap-2">
                {availableAmmoTypes.map(type => (
                  <Badge
                    key={type}
                    variant={filters.ammoType.includes(type) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-colors ${
                      filters.ammoType.includes(type)
                        ? 'bg-tarkov-accent text-tarkov-dark'
                        : 'hover:bg-tarkov-accent/20'
                    }`}
                    onClick={() => toggleArrayFilter('ammoType', type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Linha 2: Ranges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Range de Dano */}
            <div>
              <label className="block text-sm font-medium text-tarkov-light mb-3">
                Dano ({filters.damageRange[0]} - {filters.damageRange[1]})
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.damageRange[0]}
                  onChange={(e) => updateFilters({
                    damageRange: [parseInt(e.target.value), filters.damageRange[1]]
                  })}
                  className="w-full h-2 bg-tarkov-secondary/30 rounded-lg appearance-none cursor-pointer slider"
                />
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.damageRange[1]}
                  onChange={(e) => updateFilters({
                    damageRange: [filters.damageRange[0], parseInt(e.target.value)]
                  })}
                  className="w-full h-2 bg-tarkov-secondary/30 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            {/* Range de Penetração */}
            <div>
              <label className="block text-sm font-medium text-tarkov-light mb-3">
                Penetração ({filters.penetrationRange[0]} - {filters.penetrationRange[1]})
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.penetrationRange[0]}
                  onChange={(e) => updateFilters({
                    penetrationRange: [parseInt(e.target.value), filters.penetrationRange[1]]
                  })}
                  className="w-full h-2 bg-tarkov-secondary/30 rounded-lg appearance-none cursor-pointer slider"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.penetrationRange[1]}
                  onChange={(e) => updateFilters({
                    penetrationRange: [filters.penetrationRange[0], parseInt(e.target.value)]
                  })}
                  className="w-full h-2 bg-tarkov-secondary/30 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            {/* Range de Preço */}
            <div>
              <label className="block text-sm font-medium text-tarkov-light mb-3">
                Preço ({filters.priceRange[0]} - {filters.priceRange[1]})
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="100"
                  value={filters.priceRange[0]}
                  onChange={(e) => updateFilters({
                    priceRange: [parseInt(e.target.value), filters.priceRange[1]]
                  })}
                  className="w-full h-2 bg-tarkov-secondary/30 rounded-lg appearance-none cursor-pointer slider"
                />
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="100"
                  value={filters.priceRange[1]}
                  onChange={(e) => updateFilters({
                    priceRange: [filters.priceRange[0], parseInt(e.target.value)]
                  })}
                  className="w-full h-2 bg-tarkov-secondary/30 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>

          {/* Linha 3: Traders e Tracer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traders */}
            <div>
              <label className="block text-sm font-medium text-tarkov-light mb-3">
                Traders
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTraders.map(trader => (
                  <Badge
                    key={trader}
                    variant={filters.trader.includes(trader) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-colors ${
                      filters.trader.includes(trader)
                        ? 'bg-tarkov-accent text-tarkov-dark'
                        : 'hover:bg-tarkov-accent/20'
                    }`}
                    onClick={() => toggleArrayFilter('trader', trader)}
                  >
                    {trader}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tracer */}
            <div>
              <label className="block text-sm font-medium text-tarkov-light mb-3">
                Tracer
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'Todas' },
                  { value: 'tracer', label: 'Apenas Tracer' },
                  { value: 'no-tracer', label: 'Sem Tracer' }
                ].map(option => (
                  <Badge
                    key={option.value}
                    variant={filters.tracer === option.value ? 'default' : 'outline'}
                    className={`cursor-pointer transition-colors ${
                      filters.tracer === option.value
                        ? 'bg-tarkov-accent text-tarkov-dark'
                        : 'hover:bg-tarkov-accent/20'
                    }`}
                    onClick={() => updateFilters({ tracer: option.value as any })}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Linha 4: Ordenação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ordenar por */}
            <div>
              <label className="block text-sm font-medium text-tarkov-light mb-3">
                Ordenar por
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'name', label: 'Nome' },
                  { value: 'damage', label: 'Dano' },
                  { value: 'penetration', label: 'Penetração' },
                  { value: 'price', label: 'Preço' },
                  { value: 'efficiency', label: 'Eficiência' }
                ].map(option => (
                  <Badge
                    key={option.value}
                    variant={filters.sortBy === option.value ? 'default' : 'outline'}
                    className={`cursor-pointer transition-colors ${
                      filters.sortBy === option.value
                        ? 'bg-tarkov-accent text-tarkov-dark'
                        : 'hover:bg-tarkov-accent/20'
                    }`}
                    onClick={() => updateFilters({ sortBy: option.value as any })}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Ordem */}
            <div>
              <label className="block text-sm font-medium text-tarkov-light mb-3">
                Ordem
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'asc', label: 'Crescente' },
                  { value: 'desc', label: 'Decrescente' }
                ].map(option => (
                  <Badge
                    key={option.value}
                    variant={filters.sortOrder === option.value ? 'default' : 'outline'}
                    className={`cursor-pointer transition-colors ${
                      filters.sortOrder === option.value
                        ? 'bg-tarkov-accent text-tarkov-dark'
                        : 'hover:bg-tarkov-accent/20'
                    }`}
                    onClick={() => updateFilters({ sortOrder: option.value as any })}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
