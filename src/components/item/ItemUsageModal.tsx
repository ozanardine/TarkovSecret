'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { HomeIcon } from '@heroicons/react/24/solid';
import { Badge } from '@/components/ui/Badge';

interface ItemUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  type: 'quest' | 'hideout' | 'barter';
  category: 'requirement' | 'reward';
}

const ItemUsageModal: React.FC<ItemUsageModalProps> = ({
  isOpen,
  onClose,
  item,
  type,
  category
}) => {
  if (!isOpen || !item) return null;

  const getTraderImage = (traderId: string) => {
    const traderImages: { [key: string]: string } = {
      'prapor': '/images/traders/prapor.jpg',
      'therapist': '/images/traders/therapist.jpg',
      'fence': '/images/traders/fence.jpg',
      'skier': '/images/traders/skier.jpg',
      'peacekeeper': '/images/traders/peacekeeper.jpg',
      'mechanic': '/images/traders/mechanic.jpg',
      'ragman': '/images/traders/ragman.jpg',
      'jaeger': '/images/traders/jaeger.jpg'
    };
    return traderImages[traderId.toLowerCase()];
  };

  const renderQuestDetails = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/30">
          {item.trader?.id && getTraderImage(item.trader.id) ? (
            <img
              src={getTraderImage(item.trader.id)}
              alt={item.trader.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-yellow-500/30"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center ring-2 ring-yellow-500/30">
              <span className="text-xl font-bold text-black">Q</span>
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
            <p className="text-sm text-yellow-400 font-medium">{item.trader?.name || 'Quest'}</p>
          </div>
        </div>
        
        {item.objectives && (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Objetivos
            </h4>
            <div className="space-y-3 max-h-48 overflow-y-auto minimal-scrollbar">
              {item.objectives.map((objective: any, index: number) => (
                <div key={index} className="p-4 bg-gray-800/70 rounded-lg border border-gray-700/50 hover:bg-gray-800/90 transition-colors">
                  <p className="text-gray-200 leading-relaxed">{objective.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {item.rewards && (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Recompensas
            </h4>
            <div className="space-y-3 max-h-48 overflow-y-auto minimal-scrollbar">
              {item.rewards.map((reward: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-gray-800/70 rounded-lg border border-gray-700/50 hover:bg-gray-800/90 transition-colors">
                  {reward.item?.iconLink && (
                    <img 
                  src={
                    reward.item.image8xLink || 
                    reward.item.image512pxLink || 
                    reward.item.inspectImageLink || 
                    reward.item.gridImageLink || 
                    reward.item.imageLink || 
                    reward.item.iconLink
                  } 
                  alt={reward.item.name} 
                  className="w-10 h-10 rounded-md" 
                />
                  )}
                  <span className="text-gray-200 font-medium">
                    {reward.item?.name || reward.type} {reward.count && (
                      <span className="text-yellow-400 ml-1">x{reward.count}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderHideoutDetails = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/30">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center ring-2 ring-green-500/30">
            <HomeIcon className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
            <p className="text-sm text-green-400 font-medium">Estação do Hideout</p>
          </div>
        </div>
        
        {item.levels && (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Níveis
            </h4>
            <div className="space-y-4 max-h-48 overflow-y-auto minimal-scrollbar">
              {item.levels.map((level: any, index: number) => (
                <div key={index} className="p-4 bg-gray-800/70 rounded-lg border border-gray-700/50 hover:bg-gray-800/90 transition-colors">
                  <div className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="bg-purple-500 text-white px-2 py-1 rounded-md text-sm font-bold">Nível {level.level}</span>
                  </div>
                  {level.itemRequirements && (
                    <div className="space-y-2 mb-4">
                      <div className="text-sm font-medium text-gray-300">Requisitos:</div>
                      <div className="grid gap-2">
                        {level.itemRequirements.map((req: any, reqIndex: number) => (
                          <div key={reqIndex} className="flex items-center gap-3 p-2 bg-gray-700/50 rounded-md">
                            {req.item?.iconLink && (
                              <img 
                  src={
                    req.item.image8xLink || 
                    req.item.image512pxLink || 
                    req.item.inspectImageLink || 
                    req.item.gridImageLink || 
                    req.item.imageLink || 
                    req.item.iconLink
                  } 
                  alt={req.item.name} 
                  className="w-8 h-8 rounded" 
                />
                            )}
                            <span className="text-gray-200">{req.item?.name}</span>
                            <span className="text-yellow-400 font-medium ml-auto">x{req.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {level.crafts && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-300">Crafts:</div>
                      <div className="grid gap-2">
                        {level.crafts.map((craft: any, craftIndex: number) => (
                          <div key={craftIndex} className="p-2 bg-gray-700/50 rounded-md">
                            <span className="text-gray-200">
                              {craft.rewardItems?.map((reward: any) => reward.item?.name).join(', ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBarterDetails = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/30">
          {item.trader?.id && getTraderImage(item.trader.id) ? (
            <img
              src={getTraderImage(item.trader.id)}
              alt={item.trader.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500/30"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center ring-2 ring-blue-500/30">
              <span className="text-xl font-bold text-white">T</span>
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">Troca</h3>
            <p className="text-sm text-blue-400 font-medium">{item.trader?.name || 'Comerciante'}</p>
          </div>
        </div>
        
        {item.requiredItems && (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Itens Necessários
            </h4>
            <div className="space-y-3 max-h-48 overflow-y-auto minimal-scrollbar">
              {item.requiredItems.map((req: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-gray-800/70 rounded-lg border border-gray-700/50 hover:bg-gray-800/90 transition-colors">
                  {req.item?.iconLink && (
                    <img 
                  src={
                    req.item.image8xLink || 
                    req.item.image512pxLink || 
                    req.item.inspectImageLink || 
                    req.item.gridImageLink || 
                    req.item.imageLink || 
                    req.item.iconLink
                  } 
                  alt={req.item.name} 
                  className="w-10 h-10 rounded-md" 
                />
                  )}
                  <span className="text-gray-200 font-medium flex-1">
                    {req.item?.name}
                  </span>
                  <span className="text-red-400 font-bold">x{req.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {item.rewardItems && (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Itens Recebidos
            </h4>
            <div className="space-y-3 max-h-48 overflow-y-auto minimal-scrollbar">
              {item.rewardItems.map((reward: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-gray-800/70 rounded-lg border border-gray-700/50 hover:bg-gray-800/90 transition-colors">
                  {reward.item?.iconLink && (
                    <img 
                  src={
                    reward.item.image8xLink || 
                    reward.item.image512pxLink || 
                    reward.item.inspectImageLink || 
                    reward.item.gridImageLink || 
                    reward.item.imageLink || 
                    reward.item.iconLink
                  } 
                  alt={reward.item.name} 
                  className="w-10 h-10 rounded-md" 
                />
                  )}
                  <span className="text-gray-200 font-medium flex-1">
                    {reward.item?.name}
                  </span>
                  <span className="text-green-400 font-bold">x{reward.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const getModalTitle = () => {
    const typeNames = {
      quest: 'Quest',
      hideout: 'Hideout',
      barter: 'Troca'
    };
    
    const categoryNames = {
      requirement: 'Requisito',
      reward: 'Recompensa'
    };
    
    return `${typeNames[type]} - ${categoryNames[category]}`;
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900/95 backdrop-blur-md rounded-xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-gray-700/50 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50 bg-gray-800/50">
          <h2 className="text-2xl font-bold text-white tracking-tight">{getModalTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-all duration-200 hover:bg-gray-700/50 rounded-lg p-2"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto minimal-scrollbar max-h-[calc(85vh-100px)] bg-gradient-to-b from-gray-900/50 to-gray-900">
          {type === 'quest' && renderQuestDetails()}
          {type === 'hideout' && renderHideoutDetails()}
          {type === 'barter' && renderBarterDetails()}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ItemUsageModal;