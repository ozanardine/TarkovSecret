'use client';

import { useState, useMemo } from 'react';
import { Ammo } from '@/types/tarkov';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import ClickableItemImage from '@/components/ui/ClickableItemImage';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface AmmoTableProps {
  ammunition: Ammo[];
  onAmmoClick?: (ammo: Ammo) => void;
  onFavoriteToggle?: (ammoId: string) => void;
  onShare?: (ammo: Ammo) => void;
  onQuickView?: (ammo: Ammo) => void;
  onCompareToggle?: (ammo: Ammo) => void;
  favorites?: string[];
  comparisonAmmo?: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort?: (column: string) => void;
}

interface Column {
  key: string;
  label: string;
  sortable: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

const columns: Column[] = [
  { key: 'name', label: 'Munição', sortable: true, width: 'w-1/4' },
  { key: 'damage', label: 'Dano', sortable: true, width: 'w-16', align: 'center' },
  { key: 'penetration', label: 'Pen', sortable: true, width: 'w-16', align: 'center' },
  { key: 'armor', label: 'Classes', sortable: false, width: 'w-1/4', align: 'center' },
  { key: 'stats', label: 'Stats', sortable: false, width: 'w-1/6', align: 'center' },
  { key: 'price', label: 'Preço', sortable: true, width: 'w-20', align: 'center' },
  { key: 'actions', label: '', sortable: false, width: 'w-16', align: 'center' },
];

export function AmmoTable({
  ammunition,
  onAmmoClick,
  onFavoriteToggle,
  onShare,
  onQuickView,
  onCompareToggle,
  favorites = [],
  comparisonAmmo = [],
  sortBy,
  sortOrder,
  onSort
}: AmmoTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Função para obter nível de penetração
  const getPenetrationLevel = (penetrationPower: number) => {
    if (penetrationPower >= 50) return { level: 6, color: 'bg-red-500', textColor: 'text-red-400' };
    if (penetrationPower >= 40) return { level: 5, color: 'bg-orange-500', textColor: 'text-orange-400' };
    if (penetrationPower >= 30) return { level: 4, color: 'bg-yellow-500', textColor: 'text-yellow-400' };
    if (penetrationPower >= 20) return { level: 3, color: 'bg-green-500', textColor: 'text-green-400' };
    if (penetrationPower >= 10) return { level: 2, color: 'bg-blue-500', textColor: 'text-blue-400' };
    return { level: 1, color: 'bg-gray-500', textColor: 'text-gray-400' };
  };

  // Função para obter melhor preço
  const getBestPrice = (ammo: Ammo) => {
    if (!ammo.item.buyFor || ammo.item.buyFor.length === 0) return null;
    return ammo.item.buyFor.reduce((best, current) => {
      if (!best || current.price < best.price) return current;
      return best;
    });
  };

  // Função para renderizar células de classe de armadura
  const renderArmorClasses = (penetrationPower: number) => {
    const classes = [1, 2, 3, 4, 5, 6];
    return (
      <div className="flex gap-0.5 justify-center">
        {classes.map(classNum => {
          let effectiveness = 'none';
          let bgColor = 'bg-red-500';
          
          // Lógica simplificada de efetividade contra classes de armadura
          if (penetrationPower >= classNum * 8) {
            effectiveness = 'high';
            bgColor = 'bg-green-500';
          } else if (penetrationPower >= classNum * 5) {
            effectiveness = 'medium';
            bgColor = 'bg-yellow-500';
          } else if (penetrationPower >= classNum * 3) {
            effectiveness = 'low';
            bgColor = 'bg-orange-500';
          }

          return (
            <div
              key={classNum}
              className={`w-5 h-5 rounded text-xs font-bold flex items-center justify-center text-white ${bgColor}`}
              title={`Classe ${classNum}: ${effectiveness === 'high' ? 'Alta' : effectiveness === 'medium' ? 'Média' : effectiveness === 'low' ? 'Baixa' : 'Nenhuma'} efetividade`}
            >
              {classNum}
            </div>
          );
        })}
      </div>
    );
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

  const handleSort = (column: string) => {
    if (onSort) {
      onSort(column);
    }
  };

  const handleRowClick = (ammo: Ammo, e: React.MouseEvent) => {
    // Não executar se clicou em um botão
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    if (onAmmoClick) {
      onAmmoClick(ammo);
    }
  };

  return (
    <div className="bg-tarkov-dark/50 backdrop-blur-sm border border-tarkov-secondary/30 rounded-xl overflow-hidden">
      {/* Header da tabela */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[800px] table-fixed">
          <thead>
            <tr className="bg-tarkov-secondary/20 border-b border-tarkov-secondary/30">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-2 py-3 text-sm font-semibold text-tarkov-light
                    ${column.width || 'w-auto'}
                    ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                    ${column.sortable ? 'cursor-pointer hover:bg-tarkov-secondary/10 transition-colors' : ''}
                    ${column.key === 'stats' ? 'hidden lg:table-cell' : ''}
                    ${column.key === 'actions' ? 'hidden md:table-cell' : ''}
                  `}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2 justify-center">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        {sortBy === column.key ? (
                          sortOrder === 'asc' ? (
                            <ChevronUpIcon className="w-4 h-4 text-tarkov-accent" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4 text-tarkov-accent" />
                          )
                        ) : (
                          <ArrowsUpDownIcon className="w-4 h-4 text-tarkov-muted" />
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ammunition.map((ammo, index) => {
              const penetrationInfo = getPenetrationLevel(ammo.penetrationPower);
              const bestPrice = getBestPrice(ammo);
              const isHovered = hoveredRow === ammo.item.id;
              const isFavorite = favorites.includes(ammo.item.id);
              const isInComparison = comparisonAmmo.includes(ammo.item.id);

              return (
                <tr
                  key={ammo.item.id}
                  className={`
                    group border-b border-tarkov-secondary/20 transition-all duration-200 cursor-pointer
                    ${isHovered ? 'bg-tarkov-secondary/10' : 'hover:bg-tarkov-secondary/5'}
                    ${index % 2 === 0 ? 'bg-tarkov-dark/20' : ''}
                  `}
                  onMouseEnter={() => setHoveredRow(ammo.item.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={(e) => handleRowClick(ammo, e)}
                >
                  {/* Nome */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <ClickableItemImage
                        src={ammo.item.image || ammo.item.icon || ''}
                        alt={ammo.item.name}
                        size={32}
                        className="flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-tarkov-light truncate text-sm" title={ammo.item.name}>
                          {ammo.item.shortName || ammo.item.name}
                        </div>
                        <div className="text-xs text-tarkov-muted flex items-center gap-1">
                          <span>{cleanCaliberName(ammo.caliber || '')}</span>
                          {ammo.tracer && (
                            <SparklesIcon 
                              className="w-3 h-3 text-yellow-400" 
                              title="Munição tracer"
                              aria-label="Munição tracer"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Dano */}
                  <td className="px-2 py-3 text-center">
                    <span className="font-bold text-red-400 text-lg">
                      {ammo.damage}
                    </span>
                  </td>

                  {/* Penetração */}
                  <td className="px-2 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`font-bold text-lg ${penetrationInfo.textColor}`}>
                        {ammo.penetrationPower}
                      </span>
                      <div className={`w-6 h-1 rounded-full ${penetrationInfo.color}`}></div>
                    </div>
                  </td>

                  {/* Classes de Armadura */}
                  <td className="px-2 py-3">
                    {renderArmorClasses(ammo.penetrationPower)}
                  </td>

                  {/* Stats Compactos */}
                  <td className="px-2 py-3 text-center hidden lg:table-cell">
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className="flex flex-col">
                        <span className="text-tarkov-muted">Arm</span>
                        <span className="font-semibold text-orange-400">{ammo.armorDamage}%</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-tarkov-muted">Frag</span>
                        <span className="font-semibold text-purple-400">{ammo.fragmentationChance}%</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-tarkov-muted">Acc</span>
                        <span className={`font-semibold ${ammo.accuracyModifier >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {ammo.accuracyModifier > 0 ? '+' : ''}{ammo.accuracyModifier}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-tarkov-muted">Rec</span>
                        <span className={`font-semibold ${ammo.recoilModifier <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {ammo.recoilModifier > 0 ? '+' : ''}{ammo.recoilModifier}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Preço */}
                  <td className="px-2 py-3 text-center">
                    {bestPrice ? (
                      <div>
                        <div className="font-bold text-green-400 text-sm">
                          {bestPrice.price.toLocaleString()}
                        </div>
                        <div className="text-xs text-tarkov-muted truncate">
                          {bestPrice.source.slice(0, 8)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-tarkov-muted text-sm">N/A</span>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="px-2 py-3 hidden md:table-cell">
                    <div className="flex flex-col gap-1">
                      {onQuickView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickView(ammo);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                          title="Preview rápido"
                        >
                          <EyeIcon className="w-3 h-3" />
                        </Button>
                      )}
                      
                      {onCompareToggle && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCompareToggle(ammo);
                          }}
                          className={`transition-colors p-1 h-6 w-6 ${isInComparison ? 'text-tarkov-accent opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                          title={isInComparison ? 'Remover da comparação' : 'Adicionar à comparação'}
                        >
                          <ChartBarIcon className="w-3 h-3" />
                        </Button>
                      )}

                      {isFavorite && onFavoriteToggle && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onFavoriteToggle(ammo.item.id);
                          }}
                          className="text-red-500 p-1 h-6 w-6"
                          title="Remover dos favoritos"
                        >
                          <HeartSolidIcon className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {ammunition.length === 0 && (
        <div className="text-center py-12">
          <div className="text-tarkov-muted">
            Nenhuma munição encontrada
          </div>
        </div>
      )}
    </div>
  );
}
