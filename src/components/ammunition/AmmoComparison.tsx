'use client';

import { useState, useMemo, useCallback } from 'react';
import { Ammo } from '@/types/tarkov';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import ClickableItemImage from '@/components/ui/ClickableItemImage';
import { BodyDamageVisualization } from './BodyDamageVisualization';
import { calculateEffectiveDamage, compareAmmunition } from '@/lib/damage-calculations';
import {
  XMarkIcon,
  BoltIcon,
  ShieldCheckIcon,
  ScaleIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  BeakerIcon,
  SparklesIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  FireIcon,
  EyeIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

interface AmmoComparisonProps {
  ammunition: Ammo[];
  isOpen: boolean;
  onClose: () => void;
  onAddAmmo?: () => void;
  onRemoveAmmo?: (ammoId: string) => void;
  maxComparisons?: number;
  selectedArmor?: any[]; // Armor items for damage calculations
}

// Interface para resultados de comparação
interface ComparisonResult {
  ammo1: {
    name: string;
    damage: any;
    ttk: any;
  };
  ammo2: {
    name: string;
    damage: any;
    ttk: any;
  };
  winner: string;
  reason: string;
}

export function AmmoComparison({
  ammunition,
  isOpen,
  onClose,
  onAddAmmo,
  onRemoveAmmo,
  maxComparisons = 4,
  selectedArmor = []
}: AmmoComparisonProps) {
  const [activeView, setActiveView] = useState<'damage' | 'penetration' | 'ballistics' | 'economics'>('damage');
  const [selectedAmmo, setSelectedAmmo] = useState<string | null>(null);

  // Memoized calculations for better performance with error handling
  const calculations = useMemo(() => {
    // Safety check for ammunition array
    if (!ammunition || ammunition.length === 0) {
      return {
        getBestPrice: () => null,
        getEfficiency: () => 0,
        getPenetrationEfficiency: () => 0,
        getPenetrationLevel: () => ({ level: 'N/A', color: 'from-gray-600 to-gray-400', textColor: 'text-gray-400', description: 'Dados indisponíveis' }),
        getDamageCalculation: () => null,
        getComparisonResult: () => null,
        bestDamage: 0,
        worstDamage: 0,
        bestPenetration: 0,
        worstPenetration: 0,
        bestEfficiency: 0,
        bestPenEfficiency: 0,
        bestPrice: Infinity,
        worstPrice: 0
      };
    }

    // Pre-calculate all values to avoid recalculation during render

    const getBestPrice = (ammo: Ammo) => {
      try {
        if (!ammo?.item?.buyFor || !Array.isArray(ammo.item.buyFor) || ammo.item.buyFor.length === 0) return null;
        
        let bestPrice = null;
        for (const current of ammo.item.buyFor) {
          if (!current || typeof current.price !== 'number') continue;
          if (!bestPrice || current.price < bestPrice.price) {
            bestPrice = current;
          }
        }
        return bestPrice;
      } catch (error) {
        console.warn('Error in getBestPrice:', error);
        return null;
      }
    };

    const getEfficiency = (ammo: Ammo) => {
      try {
        if (!ammo || typeof ammo.damage !== 'number') return 0;
        const bestPrice = getBestPrice(ammo);
        return bestPrice && bestPrice.price > 0 ? ammo.damage / bestPrice.price : 0;
      } catch (error) {
        console.warn('Error in getEfficiency:', error);
        return 0;
      }
    };

    const getPenetrationEfficiency = (ammo: Ammo) => {
      try {
        if (!ammo || typeof ammo.penetrationPower !== 'number') return 0;
        const bestPrice = getBestPrice(ammo);
        return bestPrice && bestPrice.price > 0 ? ammo.penetrationPower / bestPrice.price : 0;
      } catch (error) {
        console.warn('Error in getPenetrationEfficiency:', error);
        return 0;
      }
    };

    const getPenetrationLevel = (penetrationPower: number) => {
      const power = typeof penetrationPower === 'number' ? penetrationPower : 0;
      
      if (power >= 50) return { 
        level: 'Classe 6', 
        color: 'from-red-600 to-red-400', 
        textColor: 'text-red-400',
        description: 'Penetra armaduras pesadas'
      };
      if (power >= 40) return { 
        level: 'Classe 5', 
        color: 'from-orange-600 to-orange-400', 
        textColor: 'text-orange-400',
        description: 'Penetra armaduras médias-pesadas'
      };
      if (power >= 30) return { 
        level: 'Classe 4', 
        color: 'from-yellow-600 to-yellow-400', 
        textColor: 'text-yellow-400',
        description: 'Penetra armaduras médias'
      };
      if (power >= 20) return { 
        level: 'Classe 3', 
        color: 'from-blue-600 to-blue-400', 
        textColor: 'text-blue-400',
        description: 'Penetra armaduras leves'
      };
      return { 
        level: 'Classe 1-2', 
        color: 'from-gray-600 to-gray-400', 
        textColor: 'text-gray-400',
        description: 'Penetra apenas armaduras muito leves'
      };
    };

    // Nova função para cálculos de dano com armadura
    const getDamageCalculation = (ammo: Ammo, armorClass: number = 0, armorDurability: number = 100, maxDurability: number = 100) => {
      try {
        if (!ammo || typeof ammo.damage !== 'number' || typeof ammo.penetrationPower !== 'number') {
          return null;
        }
        
        return calculateEffectiveDamage(
          ammo.damage,
          ammo.penetrationPower,
          armorClass,
          armorDurability,
          maxDurability,
          'steel' // Material padrão
        );
      } catch (error) {
        console.warn('Error in getDamageCalculation:', error);
        return null;
      }
    };

    // Nova função para comparação de munições
    const getComparisonResult = (ammo1: Ammo, ammo2: Ammo) => {
      try {
        if (!ammo1 || !ammo2 || selectedArmor.length === 0) {
          return null;
        }
        
        // Usa a primeira armadura selecionada para comparação
        const armor = selectedArmor[0];
        if (!armor) return null;
        
        return compareAmmunition(ammo1, ammo2, armor, 'thorax');
      } catch (error) {
        console.warn('Error in getComparisonResult:', error);
        return null;
      }
    };

    // Find best and worst values with safe array operations
    try {
      const validAmmo = ammunition.filter(ammo => ammo && typeof ammo.damage === 'number' && typeof ammo.penetrationPower === 'number');
      
      if (validAmmo.length === 0) {
        return {
          getBestPrice,
          getEfficiency,
          getPenetrationEfficiency,
          getPenetrationLevel,
          getDamageCalculation,
          getComparisonResult,
          bestDamage: 0,
          worstDamage: 0,
          bestPenetration: 0,
          worstPenetration: 0,
          bestEfficiency: 0,
          bestPenEfficiency: 0,
          bestPrice: Infinity,
          worstPrice: 0
        };
      }

      const damages = validAmmo.map(a => a.damage).filter(d => typeof d === 'number' && !isNaN(d));
      const penetrations = validAmmo.map(a => a.penetrationPower).filter(p => typeof p === 'number' && !isNaN(p));
      const efficiencies = validAmmo.map(a => getEfficiency(a)).filter(e => typeof e === 'number' && !isNaN(e) && e > 0);
      const penEfficiencies = validAmmo.map(a => getPenetrationEfficiency(a)).filter(e => typeof e === 'number' && !isNaN(e) && e > 0);
      const prices = validAmmo
        .map(a => getBestPrice(a)?.price)
        .filter((p): p is number => typeof p === 'number' && !isNaN(p) && p < Infinity);

      return {
        getBestPrice,
        getEfficiency,
        getPenetrationEfficiency,
        getPenetrationLevel,
        getDamageCalculation,
        getComparisonResult,
        bestDamage: damages.length > 0 ? Math.max(...damages) : 0,
        worstDamage: damages.length > 0 ? Math.min(...damages) : 0,
        bestPenetration: penetrations.length > 0 ? Math.max(...penetrations) : 0,
        worstPenetration: penetrations.length > 0 ? Math.min(...penetrations) : 0,
        bestEfficiency: efficiencies.length > 0 ? Math.max(...efficiencies) : 0,
        bestPenEfficiency: penEfficiencies.length > 0 ? Math.max(...penEfficiencies) : 0,
        bestPrice: prices.length > 0 ? Math.min(...prices) : Infinity,
        worstPrice: prices.length > 0 ? Math.max(...prices) : 0
      };
    } catch (error) {
      console.error('Error in calculations:', error);
      return {
        getBestPrice,
        getEfficiency,
        getPenetrationEfficiency,
        getPenetrationLevel,
        getDamageCalculation,
        getComparisonResult,
        bestDamage: 0,
        worstDamage: 0,
        bestPenetration: 0,
        worstPenetration: 0,
        bestEfficiency: 0,
        bestPenEfficiency: 0,
        bestPrice: Infinity,
        worstPrice: 0
      };
    }
  }, [ammunition, selectedArmor]);

  // Early return if no ammunition - moved after all hooks to comply with React rules
  if (!ammunition || ammunition.length === 0) return null;

  // Navigation tabs with modern design
  const viewTabs = [
    { 
      id: 'damage', 
      label: 'Dano', 
      icon: FireIcon, 
      color: 'text-red-400',
      description: 'Análise de dano por parte do corpo'
    },
    { 
      id: 'penetration', 
      label: 'Penetração', 
      icon: ShieldCheckIcon, 
      color: 'text-blue-400',
      description: 'Capacidade de penetrar armaduras'
    },
    { 
      id: 'ballistics', 
      label: 'Balística', 
      icon: BeakerIcon, 
      color: 'text-purple-400',
      description: 'Propriedades físicas e modificadores'
    },
    { 
      id: 'economics', 
      label: 'Economia', 
      icon: CurrencyDollarIcon, 
      color: 'text-green-400',
      description: 'Análise de custo-benefício'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <div className="bg-gradient-to-br from-tarkov-dark to-tarkov-secondary/20 border border-tarkov-accent/20 rounded-2xl overflow-hidden shadow-2xl">
        {/* Modern Header */}
        <div className="relative bg-gradient-to-r from-tarkov-accent/10 to-tarkov-accent/5 backdrop-blur-sm border-b border-tarkov-accent/20">
          <div className="absolute inset-0 bg-tarkov-pattern opacity-5"></div>
          <div className="relative p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-tarkov-accent/20 rounded-xl">
                  <ChartBarIcon className="w-8 h-8 text-tarkov-accent" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-tarkov-light to-tarkov-accent bg-clip-text text-transparent">
                    Comparação Avançada
                  </h1>
                  <p className="text-tarkov-muted mt-1">
                    Análise detalhada de {ammunition.length} munições • Máximo {maxComparisons} itens
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {ammunition.length < maxComparisons && onAddAmmo && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAddAmmo}
                    className="bg-tarkov-accent/10 border-tarkov-accent/30 text-tarkov-accent hover:bg-tarkov-accent/20"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Adicionar Munição
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-tarkov-muted hover:text-tarkov-light hover:bg-tarkov-secondary/20 rounded-xl"
                >
                  <XMarkIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Modern Navigation */}
            <div className="flex gap-2 bg-tarkov-dark/30 p-2 rounded-xl backdrop-blur-sm">
              {viewTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as any)}
                  className={`
                    group relative flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-200
                    ${activeView === tab.id
                      ? 'bg-tarkov-accent text-tarkov-dark shadow-lg transform scale-[1.02]'
                      : 'text-tarkov-muted hover:text-tarkov-light hover:bg-tarkov-secondary/20'
                    }
                  `}
                >
                  <tab.icon className={`w-5 h-5 ${activeView === tab.id ? 'text-tarkov-dark' : tab.color}`} />
                  <div className="text-left">
                    <div className="font-semibold">{tab.label}</div>
                    <div className={`text-xs ${activeView === tab.id ? 'text-tarkov-dark/70' : 'text-tarkov-muted'}`}>
                      {tab.description}
                    </div>
                  </div>
                  {activeView === tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-lg"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Modern Ammunition Cards */}
          <div className="grid gap-6 mb-8" style={{ gridTemplateColumns: `repeat(${ammunition.length}, 1fr)` }}>
            {ammunition.map((ammo, index) => {
              const isSelected = selectedAmmo === ammo.item.id;
              const isBestDamage = ammo.damage === calculations.bestDamage;
              const isBestPenetration = ammo.penetrationPower === calculations.bestPenetration;
              
              return (
                <div
                  key={ammo.item.id}
                  onClick={() => setSelectedAmmo(isSelected ? null : ammo.item.id)}
                  className={`
                    group relative bg-gradient-to-br from-tarkov-secondary/30 to-tarkov-secondary/10 
                    backdrop-blur-sm border rounded-2xl p-6 cursor-pointer transition-all duration-300
                    hover:shadow-2xl hover:scale-[1.02] hover:border-tarkov-accent/50
                    ${isSelected 
                      ? 'border-tarkov-accent shadow-2xl shadow-tarkov-accent/20 scale-[1.02]' 
                      : 'border-tarkov-secondary/30 hover:border-tarkov-accent/30'
                    }
                  `}
                >
                  {/* Remove Button */}
                  {onRemoveAmmo && ammunition.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveAmmo(ammo.item.id);
                      }}
                      className="absolute top-3 right-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  )}

                  {/* Crown for best stats */}
                  {(isBestDamage || isBestPenetration) && (
                    <div className="absolute -top-2 -right-2 p-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg">
                      <TrophyIcon className="w-4 h-4 text-yellow-900" />
                    </div>
                  )}
                  
                  {/* Ammo Image */}
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-tarkov-accent/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <ClickableItemImage
                      src={ammo.item.image || ammo.item.icon || ''}
                      alt={ammo.item.name}
                      size={80}
                      className="relative z-10 rounded-xl border border-tarkov-secondary/30 mx-auto shadow-lg"
                    />
                  </div>
                  
                  {/* Ammo Info */}
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-tarkov-light group-hover:text-tarkov-accent transition-colors">
                      {ammo.item.shortName || ammo.item.name}
                    </h3>
                    
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Badge variant="secondary" className="border-tarkov-accent/30 text-tarkov-accent bg-tarkov-accent/10">
                        {ammo.caliber}
                      </Badge>
                      {ammo.tracer && (
                        <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30">
                          <SparklesIcon className="w-3 h-3 mr-1" />
                          Tracer
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-tarkov-muted font-medium">{ammo.ammoType}</p>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-tarkov-secondary/30">
                      <div className="text-center">
                        <div className={`text-lg font-bold ${isBestDamage ? 'text-red-400' : 'text-tarkov-light'}`}>
                          {ammo.damage}
                          {isBestDamage && <span className="text-xs ml-1">👑</span>}
                        </div>
                        <div className="text-xs text-tarkov-muted">Dano</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${isBestPenetration ? 'text-blue-400' : 'text-tarkov-light'}`}>
                          {ammo.penetrationPower}
                          {isBestPenetration && <span className="text-xs ml-1">👑</span>}
                        </div>
                        <div className="text-xs text-tarkov-muted">Penetração</div>
                      </div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-br from-tarkov-accent/10 to-transparent rounded-2xl pointer-events-none"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Modern Comparison Views */}
          {activeView === 'damage' && (
            <div className="space-y-8">
              {/* Damage Analysis Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-tarkov-light mb-2 flex items-center justify-center gap-3">
                  <FireIcon className="w-7 h-7 text-red-400" />
                  Análise de Dano por Parte do Corpo
                </h2>
                <p className="text-tarkov-muted max-w-2xl mx-auto">
                  Compare o dano efetivo de cada munição nas diferentes partes do corpo, considerando multiplicadores realísticos do jogo.
                </p>
              </div>

              {/* Damage Stats Overview */}
              <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-tarkov-light mb-6 flex items-center gap-2">
                  <BoltIcon className="w-6 h-6 text-red-400" />
                  Comparação de Dano Base
                </h3>
                
                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${ammunition.length}, 1fr)` }}>
                  {ammunition.map((ammo) => {
                    const isBestDamage = ammo.damage === calculations.bestDamage;
                    const damagePercentage = (ammo.damage / calculations.bestDamage) * 100;
                    
                    return (
                      <div key={ammo.item.id} className="bg-tarkov-dark/30 rounded-xl p-6 text-center">
                        <div className="mb-4">
                          <div className={`text-4xl font-bold mb-2 ${isBestDamage ? 'text-red-400' : 'text-tarkov-light'}`}>
                            {ammo.damage}
                            {isBestDamage && <TrophyIcon className="inline w-6 h-6 ml-2 text-yellow-400" />}
                          </div>
                          <div className="text-sm text-tarkov-muted">Dano Base</div>
                        </div>
                        
                        {/* Damage Bar */}
                        <div className="w-full bg-tarkov-secondary/30 rounded-full h-3 mb-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                              isBestDamage 
                                ? 'bg-gradient-to-r from-red-500 to-red-400' 
                                : 'bg-gradient-to-r from-gray-600 to-gray-500'
                            }`}
                            style={{ width: `${damagePercentage}%` }}
                          ></div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-tarkov-light font-semibold">{ammo.armorDamage}%</div>
                            <div className="text-tarkov-muted text-xs">Dano Armadura</div>
                          </div>
                          <div>
                            <div className="text-tarkov-light font-semibold">{ammo.fragmentationChance}%</div>
                            <div className="text-tarkov-muted text-xs">Fragmentação</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Body Damage Visualization */}
              <div className="bg-gradient-to-br from-tarkov-secondary/20 to-tarkov-secondary/10 border border-tarkov-secondary/30 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-tarkov-light mb-6 flex items-center gap-2">
                  <EyeIcon className="w-6 h-6 text-blue-400" />
                  Visualização de Dano Corporal
                </h3>
                
                <div className="grid gap-8" style={{ gridTemplateColumns: `repeat(${ammunition.length}, 1fr)` }}>
                  {ammunition.map((ammo) => (
                    <div key={`body-${ammo.item.id}`} className="bg-tarkov-dark/30 rounded-xl p-6">
                      <div className="text-center mb-4">
                        <h4 className="font-semibold text-tarkov-light">{ammo.item.shortName}</h4>
                        <p className="text-sm text-tarkov-muted">{ammo.caliber}</p>
                      </div>
                      <div className="flex justify-center">
                        <BodyDamageVisualization 
                          ammo={ammo} 
                          showArmorSelector={true}
                          className="scale-90"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Damage Calculations with Armor */}
              {selectedArmor.length > 0 && (
                <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-tarkov-light mb-6 flex items-center gap-2">
                    <ShieldCheckIcon className="w-6 h-6 text-orange-400" />
                    Cálculos Avançados com Armadura
                  </h3>
                  
                  <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${ammunition.length}, 1fr)` }}>
                    {ammunition.map((ammo) => {
                      const armor = selectedArmor[0];
                      const damageCalc = calculations.getDamageCalculation(
                        ammo,
                        armor?.class || 0,
                        armor?.durability || 100,
                        armor?.durability || 100
                      );
                      
                      return (
                        <div key={`armor-${ammo.item.id}`} className="bg-tarkov-dark/30 rounded-xl p-6 text-center">
                          <h4 className="font-semibold text-tarkov-light mb-4">{ammo.item.shortName}</h4>
                          
                          {damageCalc ? (
                            <div className="space-y-3">
                              <div>
                                <div className="text-2xl font-bold text-green-400">
                                  {damageCalc.penetrationChance.toFixed(1)}%
                                </div>
                                <div className="text-xs text-tarkov-muted">Chance de Penetração</div>
                              </div>
                              
                              <div>
                                <div className="text-xl font-bold text-tarkov-light">
                                  {damageCalc.averageDamage.toFixed(1)}
                                </div>
                                <div className="text-xs text-tarkov-muted">Dano Médio</div>
                              </div>
                              
                              <div>
                                <div className="text-lg font-bold text-orange-400">
                                  {damageCalc.armorDamage.toFixed(1)}
                                </div>
                                <div className="text-xs text-tarkov-muted">Dano à Armadura</div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-tarkov-muted">Dados indisponíveis</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Direct Ammunition Comparison */}
              {ammunition.length >= 2 && selectedArmor.length > 0 && (
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-tarkov-light mb-6 flex items-center gap-2">
                    <TrophyIcon className="w-6 h-6 text-purple-400" />
                    Comparação Direta de Munições
                  </h3>
                  
                  <div className="space-y-6">
                    {ammunition.slice(0, 2).map((ammo1, index1) => 
                      ammunition.slice(index1 + 1).map((ammo2, index2) => {
                        const comparison = calculations.getComparisonResult(ammo1, ammo2);
                        
                        return (
                          <div key={`comparison-${ammo1.item.id}-${ammo2.item.id}`} className="bg-tarkov-dark/30 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-semibold text-tarkov-light">
                                {ammo1.item.shortName} vs {ammo2.item.shortName}
                              </h4>
                              {comparison && (
                                <Badge 
                                  variant="secondary" 
                                  className={`${
                                    comparison.winner === ammo1.item.name 
                                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                      : comparison.winner === ammo2.item.name
                                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                      : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                  }`}
                                >
                                  {comparison.winner}
                                </Badge>
                              )}
                            </div>
                            
                            {comparison ? (
                              <div className="grid grid-cols-2 gap-6">
                                <div className="text-center">
                                  <h5 className="font-semibold text-tarkov-light mb-3">{ammo1.item.shortName}</h5>
                                  <div className="space-y-2">
                                    <div>
                                      <div className="text-lg font-bold text-tarkov-light">
                                        {comparison.ammo1.damage.averageDamage.toFixed(1)}
                                      </div>
                                      <div className="text-xs text-tarkov-muted">Dano Médio</div>
                                    </div>
                                    <div>
                                      <div className="text-lg font-bold text-blue-400">
                                        {comparison.ammo1.damage.penetrationChance.toFixed(1)}%
                                      </div>
                                      <div className="text-xs text-tarkov-muted">Penetração</div>
                                    </div>
                                    <div>
                                      <div className="text-lg font-bold text-orange-400">
                                        {comparison.ammo1.ttk.shotsToKill}
                                      </div>
                                      <div className="text-xs text-tarkov-muted">Tiros para Matar</div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="text-center">
                                  <h5 className="font-semibold text-tarkov-light mb-3">{ammo2.item.shortName}</h5>
                                  <div className="space-y-2">
                                    <div>
                                      <div className="text-lg font-bold text-tarkov-light">
                                        {comparison.ammo2.damage.averageDamage.toFixed(1)}
                                      </div>
                                      <div className="text-xs text-tarkov-muted">Dano Médio</div>
                                    </div>
                                    <div>
                                      <div className="text-lg font-bold text-blue-400">
                                        {comparison.ammo2.damage.penetrationChance.toFixed(1)}%
                                      </div>
                                      <div className="text-xs text-tarkov-muted">Penetração</div>
                                    </div>
                                    <div>
                                      <div className="text-lg font-bold text-orange-400">
                                        {comparison.ammo2.ttk.shotsToKill}
                                      </div>
                                      <div className="text-xs text-tarkov-muted">Tiros para Matar</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center text-tarkov-muted">
                                Comparação indisponível
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Penetration View */}
          {activeView === 'penetration' && (
            <div className="space-y-8">
              {/* Penetration Analysis Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-tarkov-light mb-2 flex items-center justify-center gap-3">
                  <ShieldCheckIcon className="w-7 h-7 text-blue-400" />
                  Análise de Capacidade de Penetração
                </h2>
                <p className="text-tarkov-muted max-w-2xl mx-auto">
                  Compare a eficácia de cada munição contra diferentes classes de armadura e sua capacidade de penetração.
                </p>
              </div>

              {/* Penetration Stats */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-tarkov-light mb-6 flex items-center gap-2">
                  <ShieldCheckIcon className="w-6 h-6 text-blue-400" />
                  Poder de Penetração
                </h3>
                
                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${ammunition.length}, 1fr)` }}>
                  {ammunition.map((ammo) => {
                    const isBestPen = ammo.penetrationPower === calculations.bestPenetration;
                    const penetrationInfo = calculations.getPenetrationLevel(ammo.penetrationPower);
                    const penPercentage = (ammo.penetrationPower / calculations.bestPenetration) * 100;
                    
                    return (
                      <div key={ammo.item.id} className="bg-tarkov-dark/30 rounded-xl p-6 text-center">
                        <div className="mb-4">
                          <div className={`text-4xl font-bold mb-2 ${isBestPen ? 'text-blue-400' : 'text-tarkov-light'}`}>
                            {ammo.penetrationPower}
                            {isBestPen && <TrophyIcon className="inline w-6 h-6 ml-2 text-yellow-400" />}
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={`bg-gradient-to-r ${penetrationInfo.color} ${penetrationInfo.textColor} border-current/30 text-sm px-3 py-1`}
                          >
                            {penetrationInfo.level}
                          </Badge>
                        </div>
                        
                        {/* Penetration Bar */}
                        <div className="w-full bg-tarkov-secondary/30 rounded-full h-4 mb-3">
                          <div
                            className={`h-4 rounded-full transition-all duration-500 bg-gradient-to-r ${penetrationInfo.color}`}
                            style={{ width: `${penPercentage}%` }}
                          ></div>
                        </div>
                        
                        <p className="text-xs text-tarkov-muted mb-3">{penetrationInfo.description}</p>
                        
                        <div className="text-sm">
                          <div className="text-tarkov-light font-semibold">{ammo.penetrationChance || 0}%</div>
                          <div className="text-tarkov-muted text-xs">Chance de Penetração</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Ballistics View */}
          {activeView === 'ballistics' && (
            <div className="space-y-8">
              {/* Ballistics Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-tarkov-light mb-2 flex items-center justify-center gap-3">
                  <BeakerIcon className="w-7 h-7 text-purple-400" />
                  Propriedades Balísticas e Modificadores
                </h2>
                <p className="text-tarkov-muted max-w-2xl mx-auto">
                  Analise modificadores de precisão, recuo e propriedades físicas que afetam o desempenho das munições.
                </p>
              </div>

              {/* Modifiers Section */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-tarkov-light mb-6 flex items-center gap-2">
                  <ArrowPathIcon className="w-6 h-6 text-purple-400" />
                  Modificadores de Performance
                </h3>
                
                <div className="grid gap-6 mb-8" style={{ gridTemplateColumns: `repeat(${ammunition.length}, 1fr)` }}>
                  {ammunition.map((ammo) => (
                    <div key={ammo.item.id} className="bg-tarkov-dark/30 rounded-xl p-6">
                      <h4 className="font-semibold text-tarkov-light mb-4 text-center">{ammo.item.shortName}</h4>
                      
                      <div className="space-y-4">
                        {/* Accuracy */}
                        <div className="flex justify-between items-center">
                          <span className="text-tarkov-muted text-sm">Precisão:</span>
                          <span className={`font-bold ${
                            ammo.accuracyModifier >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {ammo.accuracyModifier > 0 ? '+' : ''}{ammo.accuracyModifier}%
                          </span>
                        </div>
                        
                        {/* Recoil */}
                        <div className="flex justify-between items-center">
                          <span className="text-tarkov-muted text-sm">Recuo:</span>
                          <span className={`font-bold ${
                            ammo.recoilModifier <= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {ammo.recoilModifier > 0 ? '+' : ''}{ammo.recoilModifier}%
                          </span>
                        </div>
                        
                        {/* Initial Speed */}
                        <div className="flex justify-between items-center">
                          <span className="text-tarkov-muted text-sm">Vel. Inicial:</span>
                          <span className="font-bold text-tarkov-light">
                            {ammo.initialSpeed || 0} m/s
                          </span>
                        </div>
                        
                        {/* Weight */}
                        <div className="flex justify-between items-center">
                          <span className="text-tarkov-muted text-sm">Peso:</span>
                          <span className="font-bold text-tarkov-light">{ammo.weight} kg</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ballistic Properties */}
              <div className="bg-gradient-to-br from-tarkov-secondary/20 to-tarkov-secondary/10 border border-tarkov-secondary/30 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-tarkov-light mb-6 flex items-center gap-2">
                  <ClockIcon className="w-6 h-6 text-orange-400" />
                  Propriedades Especiais
                </h3>
                
                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${ammunition.length}, 1fr)` }}>
                  {ammunition.map((ammo) => (
                    <div key={ammo.item.id} className="bg-tarkov-dark/30 rounded-xl p-6 text-center">
                      <h4 className="font-semibold text-tarkov-light mb-4">{ammo.item.shortName}</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-2xl font-bold text-orange-400">{ammo.fragmentationChance}%</div>
                          <div className="text-xs text-tarkov-muted">Fragmentação</div>
                        </div>
                        
                        <div>
                          <div className="text-2xl font-bold text-yellow-400">{ammo.ricochetChance || 0}%</div>
                          <div className="text-xs text-tarkov-muted">Ricochete</div>
                        </div>
                        
                        <div>
                          <div className="text-lg font-bold text-tarkov-light">{ammo.stackMaxSize}</div>
                          <div className="text-xs text-tarkov-muted">Stack Máximo</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Economics View */}
          {activeView === 'economics' && (
            <div className="space-y-8">
              {/* Economics Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-tarkov-light mb-2 flex items-center justify-center gap-3">
                  <CurrencyDollarIcon className="w-7 h-7 text-green-400" />
                  Análise Econômica e Custo-Benefício
                </h2>
                <p className="text-tarkov-muted max-w-2xl mx-auto">
                  Compare preços, eficiência e custo-benefício para encontrar a melhor munição para seu orçamento.
                </p>
              </div>

              {/* Price Comparison */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-tarkov-light mb-6 flex items-center gap-2">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
                  Comparação de Preços
                </h3>
                
                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${ammunition.length}, 1fr)` }}>
                  {ammunition.map((ammo) => {
                    const bestPrice = calculations.getBestPrice(ammo);
                    const isBestPrice = bestPrice && bestPrice.price === calculations.bestPrice;
                    
                    return (
                      <div key={ammo.item.id} className="bg-tarkov-dark/30 rounded-xl p-6 text-center">
                        <h4 className="font-semibold text-tarkov-light mb-4">{ammo.item.shortName}</h4>
                        
                        {bestPrice ? (
                          <>
                            <div className={`text-3xl font-bold mb-2 ${isBestPrice ? 'text-green-400' : 'text-tarkov-light'}`}>
                              {bestPrice.price.toLocaleString()}
                              {isBestPrice && <TrophyIcon className="inline w-5 h-5 ml-2 text-yellow-400" />}
                            </div>
                            <div className="text-sm text-tarkov-muted mb-2">{bestPrice.currency}</div>
                            <Badge variant="secondary" className="border-green-500/30 text-green-400 bg-green-500/10">
                              {bestPrice.source}
                            </Badge>
                          </>
                        ) : (
                          <div className="text-lg text-tarkov-muted">Indisponível</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Efficiency Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Damage Efficiency */}
                <div className="bg-gradient-to-br from-tarkov-secondary/20 to-tarkov-secondary/10 border border-tarkov-secondary/30 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                    <ArrowTrendingUpIcon className="w-5 h-5 text-red-400" />
                    Eficiência de Dano
                  </h3>
                  
                  <div className="space-y-4">
                    {ammunition.map((ammo) => {
                      const efficiency = calculations.getEfficiency(ammo);
                      const isBest = efficiency === calculations.bestEfficiency && efficiency > 0;
                      
                      return (
                        <div key={ammo.item.id} className="flex justify-between items-center p-3 bg-tarkov-dark/30 rounded-lg">
                          <span className="text-tarkov-light font-medium">{ammo.item.shortName}</span>
                          <div className="text-right">
                            <div className={`font-bold ${isBest ? 'text-red-400' : 'text-tarkov-light'}`}>
                              {efficiency > 0 ? efficiency.toFixed(4) : 'N/A'}
                              {isBest && <span className="text-xs ml-1">👑</span>}
                            </div>
                            <div className="text-xs text-tarkov-muted">dano/rublo</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Penetration Efficiency */}
                <div className="bg-gradient-to-br from-tarkov-secondary/20 to-tarkov-secondary/10 border border-tarkov-secondary/30 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                    <ArrowTrendingUpIcon className="w-5 h-5 text-blue-400" />
                    Eficiência de Penetração
                  </h3>
                  
                  <div className="space-y-4">
                    {ammunition.map((ammo) => {
                      const penEfficiency = calculations.getPenetrationEfficiency(ammo);
                      const isBest = penEfficiency === calculations.bestPenEfficiency && penEfficiency > 0;
                      
                      return (
                        <div key={ammo.item.id} className="flex justify-between items-center p-3 bg-tarkov-dark/30 rounded-lg">
                          <span className="text-tarkov-light font-medium">{ammo.item.shortName}</span>
                          <div className="text-right">
                            <div className={`font-bold ${isBest ? 'text-blue-400' : 'text-tarkov-light'}`}>
                              {penEfficiency > 0 ? penEfficiency.toFixed(4) : 'N/A'}
                              {isBest && <span className="text-xs ml-1">👑</span>}
                            </div>
                            <div className="text-xs text-tarkov-muted">pen/rublo</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
