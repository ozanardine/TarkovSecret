'use client';

import { SubscriptionPlan } from '@/types/subscription';
import { Card } from '@/components/ui/Card';
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
    <Card className="overflow-hidden">
      <div className="p-6 border-b border-tarkov-border bg-tarkov-secondary/30">
        <h3 className="text-2xl font-bold text-tarkov-light text-center mb-2">
          Comparação de Recursos
        </h3>
        <p className="text-tarkov-muted text-center">
          Veja todos os recursos incluídos em cada plano
        </p>
      </div>
  );
}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-tarkov-border bg-tarkov-secondary/20">
              <th className="text-left py-4 px-6 text-base font-semibold text-tarkov-light">
                Recursos
              </th>
              {plans.map((plan) => (
                <th key={plan.id} className="text-center py-4 px-6">
                  <div className="text-lg font-bold text-tarkov-light mb-1">
                    {plan.name}
                  </div>
                  <div className="text-sm text-tarkov-muted">
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
                className={`border-b border-tarkov-border/30 hover:bg-tarkov-secondary/10 transition-colors ${
                  index % 2 === 0 ? 'bg-tarkov-secondary/5' : ''
                }`}
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
                        <div className="w-6 h-6 bg-tarkov-success rounded-full flex items-center justify-center mx-auto">
                          <CheckIcon className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-tarkov-secondary rounded-full flex items-center justify-center mx-auto">
                          <XMarkIcon className="w-4 h-4 text-tarkov-muted" />
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
    </Card>