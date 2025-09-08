'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import ClickableItemImage from '@/components/ui/ClickableItemImage';
import { cn } from '@/lib/utils';

interface RequiredItem {
  item: {
    id: string;
    name: string;
    shortName?: string;
    iconLink?: string;
  };
  count?: number;
  quantity?: number;
  foundInRaid?: boolean;
}

interface RewardItem {
  item: {
    id: string;
    name: string;
    shortName?: string;
    iconLink?: string;
  };
  count?: number;
  quantity?: number;
}

interface ItemRequirementsDropdownProps {
  title: string;
  subtitle?: string;
  requiredItems: RequiredItem[];
  rewardItems?: RewardItem[];
  currentItemId: string;
  badgeVariant?: 'default' | 'destructive' | 'outline' | 'secondary';
  badgeColor?: string;
  icon?: React.ReactNode;
}

export function ItemRequirementsDropdown({
  title,
  subtitle,
  requiredItems,
  rewardItems,
  currentItemId,
  badgeVariant = 'outline',
  badgeColor,
  icon
}: ItemRequirementsDropdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!requiredItems || requiredItems.length === 0) {
    return null;
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
      {/* Header */}
      <button
        onClick={toggleExpanded}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-gray-400">{icon}</div>}
          <div className="text-left">
            <h4 className="text-base font-semibold text-white truncate">{title}</h4>
            {subtitle && (
              <p className="text-sm text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={badgeVariant} 
            className={cn(
              "font-bold",
              badgeColor || "text-blue-400 bg-blue-500/20 border-blue-400/30"
            )}
          >
            {requiredItems.length} ite{requiredItems.length !== 1 ? 'ns' : 'm'}
          </Badge>
          {isExpanded ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-white/10 p-4 bg-white/2">
          <div className="space-y-4">
            {/* Required Items Section */}
            <div className="space-y-3">
              <h5 className="text-xs font-medium text-gray-400 uppercase tracking-wide">Itens Necessários</h5>
              {requiredItems.map((req, index) => {
                const quantity = req.count || req.quantity || 1;
                const isCurrentItem = req.item.id === currentItemId;
                
                return (
                  <div 
                    key={index} 
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-all",
                      isCurrentItem 
                        ? "bg-tarkov-accent/20 border border-tarkov-accent/40 ring-1 ring-tarkov-accent/30" 
                        : "bg-white/5 hover:bg-white/10"
                    )}
                  >
                    {/* Item Image */}
                    {req.item.iconLink && (
                      <div className="flex-shrink-0">
                        <ClickableItemImage
                          src={req.item.iconLink}
                          alt={req.item.name}
                          size="md"
                          name={req.item.name}
                          className={cn(
                            "transition-all",
                            isCurrentItem && "ring-2 ring-tarkov-accent"
                          )}
                        />
                      </div>
                    )}

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        isCurrentItem ? "text-tarkov-accent" : "text-white"
                      )}>
                        {req.item.name}
                      </p>
                      {req.item.shortName && (
                        <p className="text-xs text-gray-400 truncate">
                          {req.item.shortName}
                        </p>
                      )}
                      {isCurrentItem && (
                        <p className="text-xs text-tarkov-accent font-medium mt-1">
                          ★ Item atual da busca
                        </p>
                      )}
                    </div>

                    {/* Quantity and Badges */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {req.foundInRaid && (
                        <Badge 
                          variant="outline" 
                          className="text-orange-400 bg-orange-500/20 border-orange-400/30 text-xs"
                        >
                          FiR
                        </Badge>
                      )}
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs font-bold",
                          isCurrentItem 
                            ? "text-tarkov-accent bg-tarkov-accent/20 border-tarkov-accent/40"
                            : "text-red-400 bg-red-500/20 border-red-400/30"
                        )}
                      >
                        {quantity}x
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reward Items Section */}
            {rewardItems && rewardItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent flex-1"></div>
                  <h5 className="text-xs font-medium text-green-400 uppercase tracking-wide px-2">Itens Recebidos</h5>
                  <div className="h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent flex-1"></div>
                </div>
                {rewardItems.map((reward, index) => {
                  const quantity = reward.count || reward.quantity || 1;
                  
                  return (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-3 rounded-lg transition-all bg-green-500/10 border border-green-400/20 hover:bg-green-500/15"
                    >
                      {/* Item Image */}
                      {reward.item.iconLink && (
                        <div className="flex-shrink-0">
                          <ClickableItemImage
                            src={reward.item.iconLink}
                            alt={reward.item.name}
                            size="md"
                            name={reward.item.name}
                            className="ring-2 ring-green-400/50"
                          />
                        </div>
                      )}

                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-green-300">
                          {reward.item.name}
                        </p>
                        {reward.item.shortName && (
                          <p className="text-xs text-green-400/70 truncate">
                            {reward.item.shortName}
                          </p>
                        )}
                        <p className="text-xs text-green-400 font-medium mt-1">
                          ✓ Item recebido na troca
                        </p>
                      </div>

                      {/* Quantity Badge */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge 
                          variant="outline" 
                          className="text-xs font-bold text-green-400 bg-green-500/20 border-green-400/40"
                        >
                          {quantity}x
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemRequirementsDropdown;