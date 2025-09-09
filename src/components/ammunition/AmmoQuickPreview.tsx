'use client';

import { useState } from 'react';
import { Ammo } from '@/types/tarkov';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import ClickableItemImage from '@/components/ui/ClickableItemImage';
import { BodyDamageVisualization } from './BodyDamageVisualization';
import {
  XMarkIcon,
  BoltIcon,
  ShieldCheckIcon,
  ScaleIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  ChartBarIcon,
  BeakerIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface AmmoQuickPreviewProps {
  ammo: Ammo | null;
  isOpen: boolean;
  onClose: () => void;
  onViewFull?: (ammo: Ammo) => void;
}

export function AmmoQuickPreview({
  ammo,
  isOpen,
  onClose,
  onViewFull
}: AmmoQuickPreviewProps) {
  if (!ammo) return null;
  
  const [activeTab, setActiveTab] = useState<'stats' | 'ballistics' | 'economy'>('stats');

  // Determinar nível de penetração
  const getPenetrationLevel = (penetrationPower: number) => {
    if (penetrationPower >= 50) return { level: 'Muito Alta', color: 'bg-red-500', textColor: 'text-red-400' };
    if (penetrationPower >= 40) return { level: 'Alta', color: 'bg-orange-500', textColor: 'text-orange-400' };
    if (penetrationPower >= 30) return { level: 'Média', color: 'bg-yellow-500', textColor: 'text-yellow-400' };
    if (penetrationPower >= 20) return { level: 'Baixa', color: 'bg-blue-500', textColor: 'text-blue-400' };
    return { level: 'Muito Baixa', color: 'bg-gray-500', textColor: 'text-gray-400' };
  };

  const penetrationInfo = getPenetrationLevel(ammo.penetrationPower);

  // Calcular eficiência
  const getBestTrader = () => {
    if (!ammo.item.buyFor || ammo.item.buyFor.length === 0) return null;
    return ammo.item.buyFor.reduce((best, current) => {
      if (!best || current.price < best.price) return current;
      return best;
    });
  };

  const bestTrader = getBestTrader();
  const damagePerRuble = bestTrader ? (ammo.damage / bestTrader.price) : 0;

  const tabs = [
    { id: 'stats', label: 'Estatísticas', icon: ChartBarIcon },
    { id: 'ballistics', label: 'Balística', icon: BeakerIcon },
    { id: 'economy', label: 'Economia', icon: CurrencyDollarIcon }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-tarkov-dark border border-tarkov-secondary/30 rounded-xl" showCloseButton={false}>
        {/* Header */}
        <div className="bg-tarkov-secondary/20 p-6 border-b border-tarkov-secondary/30">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <ClickableItemImage
                src={ammo.item.image || ammo.item.icon || ''}
                alt={ammo.item.name}
                size={64}
                className="rounded-lg border border-tarkov-secondary/30"
              />
              
              <div>
                <h2 className="text-xl font-bold text-tarkov-light mb-1">
                  {ammo.item.name}
                </h2>
                <div className="flex items-center gap-3 text-sm text-tarkov-muted mb-2">
                  <span>{ammo.caliber}</span>
                  <span>•</span>
                  <span>{ammo.ammoType}</span>
                  {ammo.tracer && (
                    <>
                      <span>•</span>
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        <SparklesIcon className="w-3 h-3 mr-1" />
                        Tracer
                      </Badge>
                    </>
                  )}
                </div>
                <p className="text-sm text-tarkov-muted max-w-md">
                  {ammo.item.description || 'Munição para uso em combate.'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {onViewFull && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewFull(ammo)}
                  className="text-tarkov-light border-tarkov-secondary/30"
                >
                  <EyeIcon className="w-4 h-4 mr-1" />
                  Ver Completo
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-tarkov-muted hover:text-tarkov-light"
              >
                <XMarkIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <BoltIcon className="w-4 h-4 text-red-400 mr-1" />
                <span className="text-xs text-tarkov-muted">Dano</span>
              </div>
              <div className="text-lg font-bold text-red-400">{ammo.damage}</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <ShieldCheckIcon className="w-4 h-4 text-blue-400 mr-1" />
                <span className="text-xs text-tarkov-muted">Penetração</span>
              </div>
              <div className={`text-lg font-bold ${penetrationInfo.textColor}`}>
                {ammo.penetrationPower}
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <ScaleIcon className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-xs text-tarkov-muted">Peso</span>
              </div>
              <div className="text-lg font-bold text-tarkov-light">{ammo.weight}kg</div>
            </div>
            
            {bestTrader && (
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <CurrencyDollarIcon className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-xs text-tarkov-muted">Preço</span>
                </div>
                <div className="text-lg font-bold text-green-400">
                  {bestTrader.price.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-tarkov-secondary/30">
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors
                  ${activeTab === tab.id
                    ? 'bg-tarkov-accent/20 text-tarkov-accent border-b-2 border-tarkov-accent'
                    : 'text-tarkov-muted hover:text-tarkov-light hover:bg-tarkov-secondary/10'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Damage & Penetration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-tarkov-light flex items-center gap-2">
                    <BoltIcon className="w-5 h-5 text-red-400" />
                    Dano por Parte do Corpo
                  </h3>
                  
                  {/* Visualização corporal */}
                  <div className="flex justify-center mb-4">
                    <BodyDamageVisualization ammo={ammo} />
                  </div>

                  {/* Stats detalhados */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-tarkov-muted">Dano Base:</span>
                      <span className="font-semibold text-red-400">{ammo.damage}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-tarkov-muted">Dano à Armadura:</span>
                      <span className="font-semibold text-orange-400">{ammo.armorDamage}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-tarkov-muted">Sangramento Leve:</span>
                      <span className="font-semibold text-tarkov-light">{ammo.lightBleedModifier || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-tarkov-muted">Sangramento Pesado:</span>
                      <span className="font-semibold text-tarkov-light">{ammo.heavyBleedModifier || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-tarkov-light flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-blue-400" />
                    Penetração
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-tarkov-muted">Poder de Penetração:</span>
                      <span className={`font-semibold ${penetrationInfo.textColor}`}>
                        {ammo.penetrationPower}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-tarkov-muted">Chance de Penetração:</span>
                      <span className="font-semibold text-blue-400">{ammo.penetrationChance || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-tarkov-muted">Nível:</span>
                      <Badge variant="secondary" className={`${penetrationInfo.color}/20 ${penetrationInfo.textColor} border-current/30`}>
                        {penetrationInfo.level}
                      </Badge>
                    </div>
                    
                    {/* Penetration Bar */}
                    <div className="space-y-1">
                      <span className="text-xs text-tarkov-muted">Visualização de Penetração</span>
                      <div className="w-full bg-tarkov-secondary/30 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${penetrationInfo.color}`}
                          style={{ width: `${Math.min((ammo.penetrationPower / 60) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-tarkov-light">Fragmentação</h4>
                  <div className="flex justify-between">
                    <span className="text-tarkov-muted">Chance:</span>
                    <span className="font-semibold text-tarkov-light">{ammo.fragmentationChance}%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-tarkov-light">Ricochete</h4>
                  <div className="flex justify-between">
                    <span className="text-tarkov-muted">Chance:</span>
                    <span className="font-semibold text-tarkov-light">{ammo.ricochetChance}%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-tarkov-light">Stamina</h4>
                  <div className="flex justify-between">
                    <span className="text-tarkov-muted">Burn/Dano:</span>
                    <span className="font-semibold text-tarkov-light">{ammo.staminaBurnPerDamage || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ballistics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-tarkov-light flex items-center gap-2">
                    <ArrowPathIcon className="w-5 h-5 text-purple-400" />
                    Modificadores de Arma
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-tarkov-muted">Modificador de Precisão:</span>
                      <span className={`font-semibold ${ammo.accuracyModifier >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {ammo.accuracyModifier > 0 ? '+' : ''}{ammo.accuracyModifier}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-tarkov-muted">Modificador de Recuo:</span>
                      <span className={`font-semibold ${ammo.recoilModifier <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {ammo.recoilModifier > 0 ? '+' : ''}{ammo.recoilModifier}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-tarkov-light flex items-center gap-2">
                    <BeakerIcon className="w-5 h-5 text-blue-400" />
                    Características Físicas
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-tarkov-muted">Velocidade Inicial:</span>
                      <span className="font-semibold text-tarkov-light">
                        {ammo.initialSpeed ? `${ammo.initialSpeed} m/s` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-tarkov-muted">Peso:</span>
                      <span className="font-semibold text-tarkov-light">{ammo.weight}kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-tarkov-muted">Projéteis:</span>
                      <span className="font-semibold text-tarkov-light">
                        {ammo.projectileCount || 1}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desvio de Penetração */}
              {ammo.penetrationPowerDeviation && (
                <div className="bg-tarkov-secondary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-tarkov-light mb-2 flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" />
                    Desvio de Penetração
                  </h4>
                  <p className="text-sm text-tarkov-muted">
                    Variação de ±{ammo.penetrationPowerDeviation} no poder de penetração
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'economy' && (
            <div className="space-y-6">
              {/* Traders */}
              {ammo.item.buyFor && ammo.item.buyFor.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-tarkov-light mb-4 flex items-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
                    Onde Comprar
                  </h3>
                  
                  <div className="grid gap-3">
                    {ammo.item.buyFor.map((trader, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-tarkov-secondary/20 rounded-lg"
                      >
                        <div>
                          <div className="font-semibold text-tarkov-light">{trader.source}</div>
                          {trader.requirements && trader.requirements.length > 0 && (
                            <div className="text-xs text-tarkov-muted">
                              {trader.requirements.map(req => `${req.type}: ${req.value}`).join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-400">
                            {trader.price.toLocaleString()} {trader.currency}
                          </div>
                          {bestTrader && trader.source === bestTrader.source && (
                            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                              Melhor Preço
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Análise de Eficiência */}
              {damagePerRuble > 0 && (
                <div className="bg-tarkov-secondary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-tarkov-light mb-3 flex items-center gap-2">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-purple-400" />
                    Análise de Eficiência
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-tarkov-muted">Dano por Rublo:</span>
                      <div className="font-semibold text-purple-400">
                        {damagePerRuble.toFixed(3)}
                      </div>
                    </div>
                    <div>
                      <span className="text-tarkov-muted">Penetração por Rublo:</span>
                      <div className="font-semibold text-purple-400">
                        {bestTrader ? (ammo.penetrationPower / bestTrader.price).toFixed(3) : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stack info */}
              <div className="bg-tarkov-secondary/20 rounded-lg p-4">
                <h4 className="font-semibold text-tarkov-light mb-2">
                  Informações de Stack
                </h4>
                <div className="text-sm text-tarkov-muted">
                  Máximo por stack: <span className="font-semibold text-tarkov-light">{ammo.stackMaxSize}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
