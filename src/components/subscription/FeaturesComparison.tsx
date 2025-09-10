'use client';

import { SubscriptionPlan } from '@/types/subscription';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface FeaturesComparisonProps {
  plans: SubscriptionPlan[];
}

export function FeaturesComparison({ plans }: FeaturesComparisonProps) {
  // Coletar todas as features únicas de todos os planos
  const allFeatures = plans.reduce((acc, plan) => {
    plan.features.forEach(feature => {
      if (!acc.find(f => f.key === feature.key)) {
        acc.push(feature);
      }
    });
    return acc;
  }, [] as typeof plans[0]['features']);

  return (
    <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-700/50">
      <div className="px-10 py-8 border-b border-gray-700/50 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <h3 className="text-3xl font-bold text-white text-center mb-3">
          Comparação de Recursos
        </h3>
        <p className="text-gray-400 text-center text-lg">
          Veja todos os recursos incluídos em cada plano
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
              <th className="text-left py-6 px-8 text-lg font-bold text-white">
                Recursos
              </th>
              {plans.map((plan) => (
                <th key={plan.id} className="text-center py-6 px-8">
                  <div className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </div>
                  <div className="text-lg text-gray-400">
                    {plan.price.monthly === 0 ? 'Gratuito' : `R$ ${plan.price.monthly.toFixed(2).replace('.', ',')}/mês`}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allFeatures.map((feature, index) => (
              <tr 
                key={feature.key} 
                className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors group"
              >
                <td className="py-6 px-8 group-hover:bg-gray-800/20 transition-colors">
                  <div className="font-semibold text-white text-lg">
                    {feature.title}
                  </div>
                  {feature.description && (
                    <div className="text-sm text-gray-400 mt-2 leading-relaxed">
                      {feature.description}
                    </div>
                  )}
                </td>
                {plans.map((plan) => {
                  const hasFeature = plan.features.some(f => f.key === feature.key);
                  return (
                    <td key={plan.id} className="text-center py-6 px-8 group-hover:bg-gray-800/20 transition-colors">
                      {hasFeature ? (
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                          <CheckIcon className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto">
                          <XMarkIcon className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
