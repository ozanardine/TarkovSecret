'use client';

import { BillingInterval } from '@/types/subscription';
import { Badge } from '@/components/ui/Badge';

interface BillingIntervalSelectorProps {
  selectedInterval: BillingInterval;
  onIntervalChange: (interval: BillingInterval) => void;
}

export function BillingIntervalSelector({ 
  selectedInterval, 
  onIntervalChange 
}: BillingIntervalSelectorProps) {
  return (
    <div className="flex items-center justify-center mb-12">
      <div className="bg-tarkov-secondary/50 rounded-lg p-1 flex border border-tarkov-border">
        <button
          onClick={() => onIntervalChange('monthly')}
          className={`
            px-6 py-3 text-sm font-medium rounded-md transition-all duration-200
            ${selectedInterval === 'monthly'
              ? 'bg-tarkov-accent text-black'
              : 'text-tarkov-muted hover:text-tarkov-light'
            }
          `}
        >
          Mensal
        </button>
        <button
          onClick={() => onIntervalChange('yearly')}
          className={`
            px-6 py-3 text-sm font-medium rounded-md transition-all duration-200 relative
            ${selectedInterval === 'yearly'
              ? 'bg-tarkov-accent text-black'
              : 'text-tarkov-muted hover:text-tarkov-light'
            }
          `}
        >
          Anual
          <Badge className="absolute -top-2 -right-2 bg-tarkov-success text-white text-xs px-2 py-0.5">
            Economize 17%
          </Badge>
        </button>
      </div>
    </div>
  );
}
