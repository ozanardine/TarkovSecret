'use client';

import { useState } from 'react';
import { Ammo } from '@/types/tarkov';
import { ArmorItemSelector, ArmorItem } from './ArmorItemSelector';
import { calculateZoneDamage, calculateTimeToKill } from '@/lib/damage-calculations';

interface BodyDamageVisualizationProps {
  ammo: Ammo;
  className?: string;
  showArmorSelector?: boolean;
}

interface BodyPart {
  id: string;
  name: string;
  multiplier: number;
  color: string;
  textColor: string;
  canBeArmored: boolean;
}

// Mapeamento de zonas para IDs das partes do corpo
const zoneToBodyPartMap: { [key: string]: string } = {
  head: 'head',
  thorax: 'thorax', 
  stomach: 'stomach',
  leftArm: 'leftArm',
  rightArm: 'rightArm',
  leftLeg: 'leftLeg',
  rightLeg: 'rightLeg',
};

// Multiplicadores de dano baseados no Tarkov
const bodyParts: BodyPart[] = [
  { id: 'head', name: 'Cabeça', multiplier: 2.0, color: 'bg-red-500', textColor: 'text-red-400', canBeArmored: true },
  { id: 'thorax', name: 'Tórax', multiplier: 1.0, color: 'bg-orange-500', textColor: 'text-orange-400', canBeArmored: true },
  { id: 'stomach', name: 'Estômago', multiplier: 1.5, color: 'bg-yellow-500', textColor: 'text-yellow-400', canBeArmored: false },
  { id: 'rightArm', name: 'Braço D.', multiplier: 0.7, color: 'bg-blue-500', textColor: 'text-blue-400', canBeArmored: true },
  { id: 'leftArm', name: 'Braço E.', multiplier: 0.7, color: 'bg-blue-500', textColor: 'text-blue-400', canBeArmored: true },
  { id: 'rightLeg', name: 'Perna D.', multiplier: 0.65, color: 'bg-purple-500', textColor: 'text-purple-400', canBeArmored: false },
  { id: 'leftLeg', name: 'Perna E.', multiplier: 0.65, color: 'bg-purple-500', textColor: 'text-purple-400', canBeArmored: false },
];

// Proteção base por classe de armadura
const classProtectionMap: { [key: number]: number } = {
  1: 15,
  2: 25,
  3: 35,
  4: 45,
  5: 55,
  6: 65,
};

export function BodyDamageVisualization({ ammo, className = '', showArmorSelector = true }: BodyDamageVisualizationProps) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [selectedArmorItems, setSelectedArmorItems] = useState<ArmorItem[]>([]);

  // Função auxiliar para mapear IDs de partes do corpo para zonas do Tarkov
  const mapBodyPartToZone = (bodyPartId: string): string => {
    const mapping: Record<string, string> = {
      'head': 'head',
      'thorax': 'thorax',
      'stomach': 'stomach',
      'rightArm': 'rightarm',
      'leftArm': 'leftarm',
      'rightLeg': 'rightleg',
      'leftLeg': 'leftleg'
    };
    return mapping[bodyPartId] || bodyPartId;
  };

  // Verifica se uma parte do corpo está protegida por algum item de armadura
  const getProtectionForBodyPart = (bodyPartId: string): ArmorItem | null => {
    for (const armorItem of selectedArmorItems) {
      if (armorItem.zones.includes(bodyPartId)) {
        return armorItem;
      }
    }
    return null;
  };

  const calculateEffectiveDamage = (bodyPart: BodyPart) => {
    const baseDamage = ammo.damage * bodyPart.multiplier;
    const zone = mapBodyPartToZone(bodyPart.id);
    
    // Usa a nova função de cálculo de dano por zona
    const damageCalc = calculateZoneDamage(ammo, zone, selectedArmorItems);
    
    // Aplica o multiplicador da parte do corpo ao dano efetivo
    return Math.round(damageCalc.effectiveDamage * bodyPart.multiplier);
  };
  
  // Função para obter informações detalhadas de dano para uma parte do corpo
  const getDamageDetails = (bodyPart: BodyPart) => {
    const zone = mapBodyPartToZone(bodyPart.id);
    const damageCalc = calculateZoneDamage(ammo, zone, selectedArmorItems);
    const ttk = calculateTimeToKill(ammo, zone, selectedArmorItems);
    
    return {
      ...damageCalc,
      finalDamage: Math.round(damageCalc.effectiveDamage * bodyPart.multiplier),
      shotsToKill: ttk.shotsToKill
    };
  };

  const handleArmorSelect = (item: ArmorItem) => {
    setSelectedArmorItems(prev => {
      // Remove itens do mesmo tipo (só pode ter 1 capacete, 1 colete, etc)
      const filtered = prev.filter(existing => existing.type !== item.type);
      return [...filtered, item];
    });
  };

  const handleArmorRemove = (itemId: string) => {
    setSelectedArmorItems(prev => prev.filter(item => item.item.id !== itemId));
  };

  const getIntensityOpacity = (damage: number) => {
    const maxDamage = ammo.damage * 2.0; // Cabeça tem o maior multiplicador
    const intensity = Math.min(damage / maxDamage, 1);
    return Math.max(0.3, intensity); // Mínimo 30% de opacidade
  };

  return (
    <div className={`relative ${className}`}>
      {/* Seletor de Itens de Armadura */}
      {showArmorSelector && (
        <ArmorItemSelector
          selectedItems={selectedArmorItems}
          onItemSelect={handleArmorSelect}
          onItemRemove={handleArmorRemove}
          className="mb-4"
        />
      )}

      {/* Silhueta Humana Realística SVG - Inspirada no Tarkov */}
      <div className="relative w-40 h-56 mx-auto">
        <svg
          viewBox="0 0 120 180"
          className="w-full h-full drop-shadow-lg"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Definições de gradientes para realismo */}
          <defs>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4a5568" />
              <stop offset="100%" stopColor="#2d3748" />
            </linearGradient>
            <filter id="innerShadow">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
              <feOffset dx="1" dy="1" result="offset"/>
              <feFlood floodColor="#000000" floodOpacity="0.3"/>
              <feComposite in2="offset" operator="in"/>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Cabeça - Formato mais realístico */}
          <path
            d="M 60 8 
               C 52 8, 45 12, 45 20
               C 45 25, 47 28, 50 30
               C 52 32, 55 33, 60 33
               C 65 33, 68 32, 70 30
               C 73 28, 75 25, 75 20
               C 75 12, 68 8, 60 8 Z"
            className={`transition-all duration-300 cursor-pointer stroke-2 ${
              hoveredPart === 'head' 
                ? 'stroke-red-400 drop-shadow-lg' 
                : 'stroke-tarkov-border/60'
            }`}
            fill={hoveredPart === 'head' ? '#ef4444' : 'url(#bodyGradient)'}
            fillOpacity={getIntensityOpacity(calculateEffectiveDamage(bodyParts[0]))}
            onMouseEnter={() => setHoveredPart('head')}
            onMouseLeave={() => setHoveredPart(null)}
            role="button"
            aria-label={`Cabeça - ${calculateEffectiveDamage(bodyParts[0])} de dano`}
            tabIndex={0}
            filter="url(#innerShadow)"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setHoveredPart(hoveredPart === 'head' ? null : 'head');
              }
            }}
          />

          {/* Pescoço */}
          <rect
            x="55"
            y="33"
            width="10"
            height="8"
            rx="2"
            fill="url(#bodyGradient)"
            stroke="none"
            opacity="0.8"
          />

          {/* Tórax - Formato anatômico */}
          <path
            d="M 42 41
               C 40 41, 38 43, 38 45
               L 38 70
               C 38 75, 40 78, 45 80
               L 75 80
               C 80 78, 82 75, 82 70
               L 82 45
               C 82 43, 80 41, 78 41
               Z"
            className={`transition-all duration-300 cursor-pointer stroke-2 ${
              hoveredPart === 'thorax' 
                ? 'stroke-orange-400 drop-shadow-lg' 
                : 'stroke-tarkov-border/60'
            }`}
            fill={hoveredPart === 'thorax' ? '#f97316' : 'url(#bodyGradient)'}
            fillOpacity={getIntensityOpacity(calculateEffectiveDamage(bodyParts[1]))}
            onMouseEnter={() => setHoveredPart('thorax')}
            onMouseLeave={() => setHoveredPart(null)}
            filter="url(#innerShadow)"
          />

          {/* Estômago - Formato mais estreito */}
          <path
            d="M 45 80
               C 43 80, 41 82, 41 84
               L 41 98
               C 41 102, 43 105, 47 105
               L 73 105
               C 77 105, 79 102, 79 98
               L 79 84
               C 79 82, 77 80, 75 80
               Z"
            className={`transition-all duration-300 cursor-pointer stroke-2 ${
              hoveredPart === 'stomach' 
                ? 'stroke-yellow-400 drop-shadow-lg' 
                : 'stroke-tarkov-border/60'
            }`}
            fill={hoveredPart === 'stomach' ? '#eab308' : 'url(#bodyGradient)'}
            fillOpacity={getIntensityOpacity(calculateEffectiveDamage(bodyParts[2]))}
            onMouseEnter={() => setHoveredPart('stomach')}
            onMouseLeave={() => setHoveredPart(null)}
            filter="url(#innerShadow)"
          />

          {/* Braço Direito - Formato anatômico */}
          <path
            d="M 82 45
               C 85 45, 88 47, 90 50
               L 95 70
               C 96 75, 95 80, 92 83
               L 88 85
               C 85 87, 82 85, 82 82
               L 82 50
               Z"
            className={`transition-all duration-300 cursor-pointer stroke-2 ${
              hoveredPart === 'rightArm' 
                ? 'stroke-blue-400 drop-shadow-lg' 
                : 'stroke-tarkov-border/60'
            }`}
            fill={hoveredPart === 'rightArm' ? '#3b82f6' : 'url(#bodyGradient)'}
            fillOpacity={getIntensityOpacity(calculateEffectiveDamage(bodyParts[3]))}
            onMouseEnter={() => setHoveredPart('rightArm')}
            onMouseLeave={() => setHoveredPart(null)}
            filter="url(#innerShadow)"
          />

          {/* Braço Esquerdo - Formato anatômico */}
          <path
            d="M 38 45
               C 35 45, 32 47, 30 50
               L 25 70
               C 24 75, 25 80, 28 83
               L 32 85
               C 35 87, 38 85, 38 82
               L 38 50
               Z"
            className={`transition-all duration-300 cursor-pointer stroke-2 ${
              hoveredPart === 'leftArm' 
                ? 'stroke-blue-400 drop-shadow-lg' 
                : 'stroke-tarkov-border/60'
            }`}
            fill={hoveredPart === 'leftArm' ? '#3b82f6' : 'url(#bodyGradient)'}
            fillOpacity={getIntensityOpacity(calculateEffectiveDamage(bodyParts[4]))}
            onMouseEnter={() => setHoveredPart('leftArm')}
            onMouseLeave={() => setHoveredPart(null)}
            filter="url(#innerShadow)"
          />

          {/* Perna Direita - Formato mais realístico */}
          <path
            d="M 65 105
               C 67 105, 69 107, 69 109
               L 72 160
               C 72 165, 70 170, 67 172
               L 62 174
               C 59 176, 56 174, 56 171
               L 56 109
               C 56 107, 58 105, 60 105
               Z"
            className={`transition-all duration-300 cursor-pointer stroke-2 ${
              hoveredPart === 'rightLeg' 
                ? 'stroke-purple-400 drop-shadow-lg' 
                : 'stroke-tarkov-border/60'
            }`}
            fill={hoveredPart === 'rightLeg' ? '#a855f7' : 'url(#bodyGradient)'}
            fillOpacity={getIntensityOpacity(calculateEffectiveDamage(bodyParts[5]))}
            onMouseEnter={() => setHoveredPart('rightLeg')}
            onMouseLeave={() => setHoveredPart(null)}
            filter="url(#innerShadow)"
          />

          {/* Perna Esquerda - Formato mais realístico */}
          <path
            d="M 55 105
               C 53 105, 51 107, 51 109
               L 48 160
               C 48 165, 50 170, 53 172
               L 58 174
               C 61 176, 64 174, 64 171
               L 64 109
               C 64 107, 62 105, 60 105
               Z"
            className={`transition-all duration-300 cursor-pointer stroke-2 ${
              hoveredPart === 'leftLeg' 
                ? 'stroke-purple-400 drop-shadow-lg' 
                : 'stroke-tarkov-border/60'
            }`}
            fill={hoveredPart === 'leftLeg' ? '#a855f7' : 'url(#bodyGradient)'}
            fillOpacity={getIntensityOpacity(calculateEffectiveDamage(bodyParts[6]))}
            onMouseEnter={() => setHoveredPart('leftLeg')}
            onMouseLeave={() => setHoveredPart(null)}
            filter="url(#innerShadow)"
          />

          {/* Detalhes anatômicos sutis */}
          <circle cx="60" cy="50" r="1" fill="#2d3748" opacity="0.3" />
          <circle cx="60" cy="90" r="0.5" fill="#2d3748" opacity="0.3" />
        </svg>

        {/* Labels de Dano */}
        {hoveredPart && (() => {
          const bodyPart = bodyParts.find(part => part.id === hoveredPart)!;
          const damageDetails = getDamageDetails(bodyPart);
          
          return (
            <div className="absolute -right-32 top-0 bg-tarkov-dark/95 border border-tarkov-secondary/30 rounded-lg p-3 min-w-[120px] z-10 shadow-lg">
              <div className="text-xs text-tarkov-muted mb-1">
                {bodyPart.name}
              </div>
              <div className={`text-lg font-bold ${bodyPart.textColor}`}>
                {damageDetails.finalDamage}
              </div>
              <div className="text-xs text-tarkov-muted">
                {(bodyPart.multiplier * 100).toFixed(0)}% multiplicador
              </div>
              
              {damageDetails.protectingArmor ? (
                <>
                  <div className="text-xs text-blue-400 mt-1">
                    🛡️ {damageDetails.protectingArmor.item.shortName}
                  </div>
                  <div className="text-xs text-yellow-400">
                    Classe {damageDetails.protectingArmor.class}
                  </div>
                  <div className="text-xs text-green-400">
                    {damageDetails.penetrationChance.toFixed(1)}% penetração
                  </div>
                </>
              ) : (
                <div className="text-xs text-gray-400 mt-1">
                  Sem proteção
                </div>
              )}
              
              <div className="text-xs text-orange-400 mt-1">
                {damageDetails.shotsToKill} tiro{damageDetails.shotsToKill > 1 ? 's' : ''} para matar
              </div>
            </div>
          );
        })()}
      </div>

      {/* Legenda Compacta */}
      <div className="mt-4 grid grid-cols-2 gap-1 text-xs">
        {bodyParts.slice(0, 4).map(part => {
          const protectingArmor = getProtectionForBodyPart(part.id);
          return (
            <div key={part.id} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${part.color} ${protectingArmor ? 'ring-1 ring-blue-400' : ''}`}></div>
              <span className="text-tarkov-muted truncate">{part.name}</span>
              <span className={`font-semibold ${part.textColor}`}>
                {calculateEffectiveDamage(part)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Segunda linha da legenda */}
      <div className="grid grid-cols-3 gap-1 text-xs mt-1">
        {bodyParts.slice(4).map(part => {
          const protectingArmor = getProtectionForBodyPart(part.id);
          return (
            <div key={part.id} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${part.color} ${protectingArmor ? 'ring-1 ring-blue-400' : ''}`}></div>
              <span className="text-tarkov-muted truncate text-[10px]">{part.name}</span>
              <span className={`font-semibold ${part.textColor} text-[10px]`}>
                {calculateEffectiveDamage(part)}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Indicador de armadura */}
      {selectedArmorItems.length > 0 && (
        <div className="mt-2 text-center">
          <div className="text-xs text-blue-400">
            🛡️ Partes protegidas têm anel azul
          </div>
        </div>
      )}
    </div>
  );
}
