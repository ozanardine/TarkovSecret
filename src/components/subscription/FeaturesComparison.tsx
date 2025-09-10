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
    <div className="bg-tarkov-secondary/80 backdrop-blur-sm rounded-2xl shadow-dark-lg overflow-hidden border border-tarkov-border/50">
      <div className="px-8 py-6 border-b border-tarkov-border/50">
        <h3 className="text-2xl font-bold text-tarkov-light text-center">
          Comparação de Recursos
        </h3>
        <p className="text-tarkov-muted text-center mt-2">
          Veja todos os recursos incluídos em cada plano
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-tarkov-border/50">
              <th className="text-left py-4 px-6 text-sm font-semibold text-tarkov-light">
                Recursos
              </th>
              {plans.map((plan) => (
                <th key={plan.id} className="text-center py-4 px-6">
                  <div className="text-lg font-bold text-tarkov-light">
                    {plan.name}
                  </div>
                  <div className="text-sm text-tarkov-muted mt-1">
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
                className="border-b border-tarkov-border/30"
              >
                <td className="py-4 px-6">
                  <div className="font-medium text-tarkov-light">
                    {feature.title}
                  </div>
                  {feature.description && (
                    <div className="text-sm text-tarkov-muted mt-1">
                      {feature.description}
                    </div>
                  )}
                </td>
                {plans.map((plan) => {
                  const hasFeature = plan.features.some(f => f.key === feature.key);
                  return (
                    <td key={plan.id} className="text-center py-4 px-6">
                      {hasFeature ? (
                        <CheckIcon className="w-6 h-6 text-tarkov-accent mx-auto" />
                      ) : (
                        <XMarkIcon className="w-6 h-6 text-tarkov-muted mx-auto" />
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
