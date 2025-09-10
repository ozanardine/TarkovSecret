'use client';

import { BillingInterval } from '@/types/subscription';

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
      <div className="bg-tarkov-secondary/50 rounded-lg p-1 flex border border-tarkov-border relative">
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
            px-6 py-3 text-sm font-medium rounded-md transition-all duration-200
            ${selectedInterval === 'yearly'
              ? 'bg-tarkov-accent text-black'
              : 'text-tarkov-muted hover:text-tarkov-light'
            }
          `}
        >
          Anual
        </button>
      </div>
    </div>
  );
}
