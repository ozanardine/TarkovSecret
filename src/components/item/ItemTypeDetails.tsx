'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TarkovItem } from '@/types/tarkov';
import {
  ShieldCheckIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
  FireIcon,
  EyeIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

interface ItemTypeDetailsProps {
  item: TarkovItem;
}

export function ItemTypeDetails({ item }: ItemTypeDetailsProps) {
  const isAmmo = item.types?.some(type => 
    type.toLowerCase().includes('ammo') || 
    type.toLowerCase().includes('ammunition') ||
    type.toLowerCase().includes('cartridge')
  );
  
  const isArmor = item.types?.some(type => 
    type.toLowerCase().includes('armor') || 
    type.toLowerCase().includes('vest') ||
    type.toLowerCase().includes('helmet') ||
    type.toLowerCase().includes('protection')
  );
  
  const isWeapon = item.types?.some(type => 
    type.toLowerCase().includes('weapon') || 
    type.toLowerCase().includes('gun') ||
    type.toLowerCase().includes('rifle') ||
    type.toLowerCase().includes('pistol') ||
    type.toLowerCase().includes('shotgun') ||
    type.toLowerCase().includes('smg') ||
    type.toLowerCase().includes('sniper')
  );
  
  const isMedical = item.types?.some(type => 
    type.toLowerCase().includes('medical') || 
    type.toLowerCase().includes('meds') ||
    type.toLowerCase().includes('stimulant') ||
    type.toLowerCase().includes('drug')
  );
  
  const isFood = item.types?.some(type => 
    type.toLowerCase().includes('food') || 
    type.toLowerCase().includes('drink') ||
    type.toLowerCase().includes('provisions')
  );
  
  const isContainer = item.types?.some(type => 
    type.toLowerCase().includes('container') || 
    type.toLowerCase().includes('case') ||
    type.toLowerCase().includes('bag') ||
    type.toLowerCase().includes('backpack')
  );

  const renderAmmoDetails = () => (
    <Card className="bg-tarkov-darker border-tarkov-border">
      <CardHeader>
        <h4 className="font-medium text-white flex items-center gap-2">
          <BoltIcon className="w-5 h-5 text-yellow-400" />
          Especificações de Munição
        </h4>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-tarkov-text-secondary text-sm">Dano</span>
            <div className="text-white font-semibold">
              {/* Placeholder - substituir por dados reais da API */}
              {Math.floor(Math.random() * 100) + 20}
            </div>
          </div>
          <div>
            <span className="text-tarkov-text-secondary text-sm">Penetração</span>
            <div className="text-white font-semibold">
              {Math.floor(Math.random() * 60) + 10}
            </div>
          </div>
          <div>
            <span className="text-tarkov-text-secondary text-sm">Velocidade</span>
            <div className="text-white font-semibold">
              {Math.floor(Math.random() * 500) + 300} m/s
            </div>
          </div>
          <div>
            <span className="text-tarkov-text-secondary text-sm">Fragmentação</span>
            <div className="text-white font-semibold">
              {Math.floor(Math.random() * 50)}%
            </div>
          </div>
        </div>
        
        <div>
          <span className="text-tarkov-text-secondary text-sm mb-2 block">Efetividade contra armadura</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map(level => (
              <div key={level} className="text-center">
                <div className={`w-8 h-8 rounded border-2 flex items-center justify-center text-xs font-bold ${
                  level <= 3 ? 'bg-green-500 border-green-400 text-white' :
                  level <= 4 ? 'bg-yellow-500 border-yellow-400 text-black' :
                  'bg-red-500 border-red-400 text-white'
                }`}>
                  {level}
                </div>
                <div className="text-xs text-tarkov-text-secondary mt-1">Classe {level}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderArmorDetails = () => (
    <Card className="bg-tarkov-darker border-tarkov-border">
      <CardHeader>
        <h4 className="font-medium text-white flex items-center gap-2">
          <ShieldCheckIcon className="w-5 h-5 text-blue-400" />
          Especificações de Armadura
        </h4>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-tarkov-text-secondary text-sm">Classe de Proteção</span>
            <div className="text-white font-semibold">
              Classe {Math.floor(Math.random() * 6) + 1}
            </div>
          </div>
          <div>
            <span className="text-tarkov-text-secondary text-sm">Durabilidade</span>
            <div className="text-white font-semibold">
              {Math.floor(Math.random() * 80) + 20}/{Math.floor(Math.random() * 80) + 20}
            </div>
          </div>
          <div>
            <span className="text-tarkov-text-secondary text-sm">Material</span>
            <div className="text-white font-semibold">
              {['Cerâmica', 'Kevlar', 'Aço', 'Titânio', 'UHMWPE'][Math.floor(Math.random() * 5)]}
            </div>
          </div>
          <div>
            <span className="text-tarkov-text-secondary text-sm">Penalidade de Movimento</span>
            <div className="text-white font-semibold">
              -{Math.floor(Math.random() * 30) + 5}%
            </div>
          </div>
        </div>
        
        <div>
          <span className="text-tarkov-text-secondary text-sm mb-2 block">Zonas Protegidas</span>
          <div className="flex flex-wrap gap-2">
            {['Tórax', 'Estômago', 'Braço Esquerdo', 'Braço Direito'].map(zone => (
              <Badge key={zone} variant="outline" className="text-xs">
                {zone}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderWeaponDetails = () => (
    <Card className="bg-tarkov-darker border-tarkov-border">
      <CardHeader>
        <h4 className="font-medium text-white flex items-center gap-2">
          <WrenchScrewdriverIcon className="w-5 h-5 text-red-400" />
          Especificações de Arma
        </h4>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-tarkov-text-secondary text-sm">Calibre</span>
            <div className="text-white font-semibold">
              {['5.56x45', '7.62x39', '9x19', '12/70', '.308'][Math.floor(Math.random() * 5)]}
            </div>
          </div>
          <div>
            <span className="text-tarkov-text-secondary text-sm">Taxa de Tiro</span>
            <div className="text-white font-semibold">
              {Math.floor(Math.random() * 800) + 200} RPM
            </div>
          </div>
          <div>
            <span className="text-tarkov-text-secondary text-sm">Ergonomia</span>
            <div className="text-white font-semibold">
              {Math.floor(Math.random() * 80) + 20}
            </div>
          </div>
          <div>
            <span className="text-tarkov-text-secondary text-sm">Recuo Vertical</span>
            <div className="text-white font-semibold">
              {Math.floor(Math.random() * 200) + 50}
            </div>
          </div>
          <div>
            <span className="text-tarkov-text-secondary text-sm">Recuo Horizontal</span>
            <div className="text-white font-semibold">
              {Math.floor(Math.random() * 150) + 30}
            </div>
          </div>
          <div>
            <span className="text-tarkov-text-secondary text-sm">Precisão</span>
            <div className="text-white font-semibold">
              {(Math.random() * 2 + 0.5).toFixed(2)} MOA
            </div>
          </div>
        </div>
        
        <div>
          <span className="text-tarkov-text-secondary text-sm mb-2 block">Modos de Tiro</span>
          <div className="flex gap-2">
            {['Semi', 'Auto', 'Burst'].map(mode => (
              <Badge key={mode} variant="outline" className="text-xs">
                {mode}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderMedicalDetails = () => (
    <Card className="bg-tarkov-darker border-tarkov-border">
      <CardHeader>
        <h4 className="font-medium text-white flex items-center gap-2">
          <FireIcon className="w-5 h-5 text-green-400" />
          Especificações Médicas
        </h4>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-tarkov-text-secondary text-sm">Tempo de Uso</span>
            <div className="text-white font-semibold">
              {Math.floor(Math.random() * 10) + 1}s
            </div>
          </div>
          <div>
            <span className="text-tarkov-text-secondary text-sm">Usos Restantes</span>
            <div className="text-white font-semibold">
              {Math.floor(Math.random() * 5) + 1}/{Math.floor(Math.random() * 5) + 1}
            </div>
          </div>
          <div>
            <span className="text-tarkov-text-secondary text-sm">HP Restaurado</span>
            <div className="text-white font-semibold">
              +{Math.floor(Math.random() * 100) + 10}
            </div>
          </div>
          <div>
            <span className="text-tarkov-text-secondary text-sm">Efeito</span>
            <div className="text-white font-semibold">
              {['Cura', 'Analgésico', 'Estimulante', 'Antídoto'][Math.floor(Math.random() * 4)]}
            </div>
          </div>
        </div>
        
        <div>
          <span className="text-tarkov-text-secondary text-sm mb-2 block">Partes do Corpo</span>
          <div className="flex flex-wrap gap-2">
            {['Cabeça', 'Tórax', 'Estômago', 'Braços', 'Pernas'].map(part => (
              <Badge key={part} variant="outline" className="text-xs">
                {part}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderContainerDetails = () => (
    <Card className="bg-tarkov-darker border-tarkov-border">
      <CardHeader>
        <h4 className="font-medium text-white flex items-center gap-2">
          <CubeIcon className="w-5 h-5 text-purple-400" />
          Especificações de Container
        </h4>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-tarkov-text-secondary text-sm">Espaços Internos</span>
            <div className="text-white font-semibold">
              {Math.floor(Math.random() * 20) + 4} slots
            </div>
          </div>
          <div>
            <span className="text-tarkov-text-secondary text-sm">Dimensões Internas</span>
            <div className="text-white font-semibold">
              {Math.floor(Math.random() * 6) + 2}x{Math.floor(Math.random() * 6) + 2}
            </div>
          </div>
          <div>
            <span className="text-tarkov-text-secondary text-sm">Eficiência</span>
            <div className="text-white font-semibold">
              {((Math.random() * 2) + 1).toFixed(1)}x
            </div>
          </div>
          <div>
            <span className="text-tarkov-text-secondary text-sm">Tipo</span>
            <div className="text-white font-semibold">
              {['Seguro', 'Normal', 'Especial'][Math.floor(Math.random() * 3)]}
            </div>
          </div>
        </div>
        
        <div>
          <span className="text-tarkov-text-secondary text-sm mb-2 block">Itens Aceitos</span>
          <div className="flex flex-wrap gap-2">
            {['Munição', 'Mods', 'Médicos', 'Chaves', 'Todos'].map(type => (
              <Badge key={type} variant="outline" className="text-xs">
                {type}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderFoodDetails = () => (
    <Card className="bg-tarkov-darker border-tarkov-border">
      <CardHeader>
        <h4 className="font-medium text-white flex items-center gap-2">
          <EyeIcon className="w-5 h-5 text-orange-400" />
          Especificações Nutricionais
        </h4>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-tarkov-text-secondary text-sm">Energia</span>
            <div className="text-white font-semibold">
              +{Math.floor(Math.random() * 100) + 10}
            </div>
          </div>
          <div>
            <span className="text-tarkov-text-secondary text-sm">Hidratação</span>
            <div className="text-white font-semibold">
              +{Math.floor(Math.random() * 100) + 10}
            </div>
          </div>
          <div>
            <span className="text-tarkov-text-secondary text-sm">Tempo de Uso</span>
            <div className="text-white font-semibold">
              {Math.floor(Math.random() * 10) + 1}s
            </div>
          </div>
          <div>
            <span className="text-tarkov-text-secondary text-sm">Usos</span>
            <div className="text-white font-semibold">
              {Math.floor(Math.random() * 5) + 1}
            </div>
          </div>
        </div>
        
        <div>
          <span className="text-tarkov-text-secondary text-sm mb-2 block">Efeitos</span>
          <div className="flex flex-wrap gap-2">
            {['Nutrição', 'Hidratação', 'Estimulante', 'Calmante'].map(effect => (
              <Badge key={effect} variant="outline" className="text-xs">
                {effect}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Se não há tipos específicos reconhecidos, não renderizar nada
  if (!isAmmo && !isArmor && !isWeapon && !isMedical && !isFood && !isContainer) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Detalhes Específicos do Item</h3>
      
      {isAmmo && renderAmmoDetails()}
      {isArmor && renderArmorDetails()}
      {isWeapon && renderWeaponDetails()}
      {isMedical && renderMedicalDetails()}
      {isFood && renderFoodDetails()}
      {isContainer && renderContainerDetails()}
    </div>
  );
}