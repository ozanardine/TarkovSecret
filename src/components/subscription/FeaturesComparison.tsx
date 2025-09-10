'use client';

import React from 'react';
import { SubscriptionPlan } from '@/types/subscription';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface FeaturesComparisonProps {
  plans: SubscriptionPlan[];
}

interface Feature {
  name: string;
  description: string;
  free: boolean | string;
  plus: boolean | string;
}

const features: Feature[] = [
  {
    name: 'Busca Básica de Itens',
    description: 'Pesquise por todos os itens do Tarkov',
    free: true,
    plus: true,
  },
  {
    name: 'Acompanhamento de Preços',
    description: 'Monitore preços ao longo do tempo',
    free: 'Limitado',
    plus: 'Ilimitado',
  },
  {
    name: 'Listas de Favoritos',
    description: 'Crie listas personalizadas de itens',
    free: '1 lista',
    plus: 'Ilimitadas',
  },
  {
    name: 'Alertas de Preço',
    description: 'Receba notificações sobre mudanças de preço',
    free: false,
    plus: true,
  },
  {
    name: 'Analytics Avançados',
    description: 'Análise detalhada do mercado e tendências',
    free: false,
    plus: true,
  },
  {
    name: 'Exportar Dados',
    description: 'Exporte seus dados para CSV/JSON',
    free: false,
    plus: true,
  },
  {
    name: 'Suporte Prioritário',
    description: 'Atendimento mais rápido e personalizado',
    free: false,
    plus: true,
  },
  {
    name: 'Experiência Sem Anúncios',
    description: 'Navegue sem interrupções publicitárias',
    free: false,
    plus: true,
  },
  {
    name: 'API Personalizada',
    description: 'Integre com suas próprias ferramentas',
    free: false,
    plus: true,
  },
  {
    name: 'Acesso Antecipado',
    description: 'Teste novas funcionalidades primeiro',
    free: false,
    plus: true,
  },
];

const FeatureCell: React.FC<{ value: boolean | string }> = ({ value }) => {
  if (typeof value === 'boolean') {
    return value ? (
      <CheckIcon className="w-5 h-5 text-green-400 mx-auto" />
    ) : (
      <XMarkIcon className="w-5 h-5 text-red-400 mx-auto" />
    );
  }
  
  return (
    <span className="text-sm text-tarkov-light text-center">
      {value}
    </span>
  );
};

export function FeaturesComparison({ plans }: FeaturesComparisonProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <h3 className="text-xl font-semibold text-tarkov-light">
          Comparação de Recursos
        </h3>
        <p className="text-tarkov-muted">
          Compare o que está incluído em cada plano
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-tarkov-secondary/50 border-b border-tarkov-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-tarkov-light">
                  Recurso
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-tarkov-light">
                  Gratuito
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-tarkov-light">
                  Plus
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tarkov-border">
              {features.map((feature, index) => (
                <tr key={index} className="hover:bg-tarkov-secondary/20 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-tarkov-light">
                        {feature.name}
                      </div>
                      <div className="text-xs text-tarkov-muted mt-1">
                        {feature.description}
                      </div>
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
      </CardContent>
    </Card>
  );
}

export default FeaturesComparison;