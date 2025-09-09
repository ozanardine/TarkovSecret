'use client';

import { useState, useEffect } from 'react';
import ClickableItemImage from '@/components/ui/ClickableItemImage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useArmor } from '@/hooks/useArmor';
import { Armor } from '@/types/tarkov';
import { Loading } from '@/components/ui/Loading';

// Usamos o tipo Armor da API, mas criamos uma interface estendida para categorização
export interface ArmorItem extends Armor {
  type: 'helmet' | 'armor' | 'rig';
}

interface ArmorItemSelectorProps {
  selectedItems: ArmorItem[];
  onItemSelect: (item: ArmorItem) => void;
  onItemRemove: (itemId: string) => void;
  className?: string;
}

// Função para determinar o tipo de armadura baseado nas zonas e tipos
const determineArmorType = (armor: Armor): 'helmet' | 'armor' | 'rig' => {
  const zones = armor.zones;
  const types = armor.item.types;
  const itemName = armor.item.name.toLowerCase();
  const armorType = armor.armorType?.toLowerCase();
  

  
  // Se é capacete (protege cabeça ou tem tipo helmet)
  if (zones.some(zone => zone.toLowerCase().includes('head')) || 
      armorType === 'helmet' ||
      types.some(type => type.toLowerCase().includes('helmet')) ||
      itemName.includes('helmet') || itemName.includes('cap') || itemName.includes('hat')) {
    return 'helmet';
  }
  
  // Se tem "rig" no tipo ou nome, ou protege múltiplas zonas incluindo braços
  if (types.some(type => type.toLowerCase().includes('rig')) || 
      itemName.includes('rig') ||
      itemName.includes('carrier') ||
      (zones.includes('leftArm') && zones.includes('rightArm')) ||
      (zones.includes('LeftArm') && zones.includes('RightArm'))) {
    return 'rig';
  }
  
  // Caso contrário, é armadura corporal
  return 'armor';
};

export function ArmorItemSelector({ selectedItems, onItemSelect, onItemRemove, className = '' }: ArmorItemSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'helmet' | 'armor' | 'rig'>('helmet');
  const { armor: apiArmor, loading, error } = useArmor();
  
  // Converte armadura da API para ArmorItem com categorização
  const armorItems: ArmorItem[] = apiArmor.map(armor => ({
    ...armor,
    type: determineArmorType(armor)
  }));

  const categories = [
    { key: 'helmet' as const, label: 'Capacetes', icon: '🪖' },
    { key: 'armor' as const, label: 'Coletes', icon: '🦺' },
    { key: 'rig' as const, label: 'Plate Carriers', icon: '🎽' },
  ];

  const filteredItems = armorItems.filter(item => item.type === activeCategory);
  const selectedItemIds = selectedItems.map(item => item.id);

  const getProtectionSummary = (item: ArmorItem) => {
    const zoneNames = {
      head: 'Cabeça',
      thorax: 'Tórax', 
      stomach: 'Estômago',
      leftArm: 'Braço E',
      rightArm: 'Braço D',
      leftLeg: 'Perna E',
      rightLeg: 'Perna D',
    };

    return item.zones.map(zone => zoneNames[zone as keyof typeof zoneNames]).join(', ');
  };

  const getClassColor = (armorClass: number) => {
    const colors = {
      1: 'bg-green-600',
      2: 'bg-green-500', 
      3: 'bg-yellow-500',
      4: 'bg-orange-500',
      5: 'bg-red-500',
      6: 'bg-purple-600',
    };
    return colors[armorClass as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className={`bg-tarkov-secondary/10 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-tarkov-secondary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-tarkov-light">
              🛡️ Equipamentos de Proteção
            </span>
            {selectedItems.length > 0 && (
              <Badge variant="secondary" className="bg-tarkov-accent/20 text-tarkov-accent text-xs">
                {selectedItems.length} equipado{selectedItems.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
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

        {/* Selected Items Preview */}
        {selectedItems.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedItems.map(item => (
              <div
                key={item.item.id}
                className="flex items-center gap-1 bg-tarkov-dark/50 rounded px-2 py-1"
              >
                <ClickableItemImage
                  src={item.item.image || item.item.iconLink || ''}
                  alt={item.item.name}
                  size={16}
                />
                <span className="text-xs text-tarkov-light">{item.item.shortName}</span>
                <div className={`w-3 h-3 rounded text-xs flex items-center justify-center text-white ${getClassColor(item.class)}`}>
                  {item.class}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onItemRemove(item.item.id)}
                  className="p-0 h-4 w-4 text-red-400 hover:text-red-300"
                >
                  <XMarkIcon className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3">
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-4">
              <Loading />
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="text-center py-4 text-red-400 text-sm">
              Erro ao carregar armaduras: {error}
            </div>
          )}
          
          {/* Content */}
          {!loading && !error && (
            <>
              {/* Category Tabs */}
              <div className="flex gap-1 mb-3">
                {categories.map(category => (
                  <button
                    key={category.key}
                    onClick={() => setActiveCategory(category.key)}
                    className={`
                      flex items-center gap-1 px-3 py-1 text-xs rounded transition-colors
                      ${activeCategory === category.key
                        ? 'bg-tarkov-accent/20 text-tarkov-accent'
                        : 'bg-tarkov-secondary/20 text-tarkov-muted hover:text-tarkov-light'
                      }
                    `}
                  >
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                  </button>
                ))}
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {filteredItems.map(item => {
              const isSelected = selectedItemIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`
                    border rounded-lg p-2 cursor-pointer transition-all duration-200
                    ${isSelected
                      ? 'border-tarkov-accent bg-tarkov-accent/10'
                      : 'border-tarkov-secondary/30 hover:border-tarkov-secondary/50 bg-tarkov-dark/30'
                    }
                  `}
                  onClick={() => isSelected ? onItemRemove(item.id) : onItemSelect(item)}
                >
                  <div className="flex items-start gap-2">
                    <ClickableItemImage
                      src={item.item.image || item.item.iconLink || ''}
                      alt={item.item.name}
                      size={32}
                      className="flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-sm font-semibold text-tarkov-light truncate">
                          {item.item.shortName}
                        </span>
                        <div className={`w-4 h-4 rounded text-xs flex items-center justify-center text-white ${getClassColor(item.class)}`}>
                          {item.class}
                        </div>
                      </div>
                      
                      <div className="text-xs text-tarkov-muted mb-1">
                        {item.durability} HP • {item.material.name}
                      </div>
                      
                      <div className="text-xs text-blue-400">
                        {getProtectionSummary(item)}
                      </div>
                      
                      {(item.ergonomicsPenalty !== 0 || item.movementPenalty !== 0) && (
                        <div className="flex gap-2 text-xs mt-1">
                          {item.ergonomicsPenalty !== 0 && (
                            <span className="text-red-400">
                              Ergo: {item.ergonomicsPenalty}
                            </span>
                          )}
                          {item.movementPenalty !== 0 && (
                            <span className="text-red-400">
                              Mov: {item.movementPenalty}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-4 text-tarkov-muted text-sm">
                  Nenhum item encontrado nesta categoria
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
