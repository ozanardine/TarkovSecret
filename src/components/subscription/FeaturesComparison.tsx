import React from 'react';
import { Check, X } from 'lucide-react';

interface Feature {
  name: string;
  free: boolean | string;
  plus: boolean | string;
  description?: string;
}

const features: Feature[] = [
  {
    name: 'Basic Item Search',
    free: true,
    plus: true,
    description: 'Search through all Tarkov items'
  },
  {
    name: 'Price Tracking',
    free: 'Limited',
    plus: 'Unlimited',
    description: 'Track item prices over time'
  },
  {
    name: 'Watchlists',
    free: '1 list',
    plus: 'Unlimited',
    description: 'Create custom item watchlists'
  },
  {
    name: 'Price Alerts',
    free: false,
    plus: true,
    description: 'Get notified when prices change'
  },
  {
    name: 'Advanced Analytics',
    free: false,
    plus: true,
    description: 'Detailed market analysis and trends'
  },
  {
    name: 'Export Data',
    free: false,
    plus: true,
    description: 'Export your data to CSV/JSON'
  },
  {
    name: 'Priority Support',
    free: false,
    plus: true,
    description: 'Get help faster with priority support'
  },
  {
    name: 'Ad-Free Experience',
    free: false,
    plus: true,
    description: 'Browse without advertisements'
  }
];

const FeatureCell: React.FC<{ value: boolean | string }> = ({ value }) => {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-5 h-5 text-green-500 mx-auto" />
    ) : (
      <X className="w-5 h-5 text-red-500 mx-auto" />
    );
  }
  
  return (
    <span className="text-sm text-gray-600 dark:text-gray-300">
      {value}
    </span>
  );
};

export const FeaturesComparison: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Feature Comparison
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Compare what's included in each plan
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Feature
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Free
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Plus
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {features.map((feature, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {feature.name}
                    </div>
                    {feature.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {feature.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <FeatureCell value={feature.free} />
                </td>
                <td className="px-6 py-4 text-center">
                  <FeatureCell value={feature.plus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeaturesComparison;