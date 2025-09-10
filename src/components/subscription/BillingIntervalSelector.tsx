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
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex">
        <button
          onClick={() => onIntervalChange('monthly')}
          className={`
            px-6 py-2 text-sm font-medium rounded-md transition-all duration-200
            ${selectedInterval === 'monthly'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }
          `}
        >
          Mensal
        </button>
        <button
          onClick={() => onIntervalChange('yearly')}
          className={`
            px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 relative
            ${selectedInterval === 'yearly'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }
          `}
        >
          Anual
          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
            -17%
          </span>
        </button>
      </div>
    </div>
  );
}
