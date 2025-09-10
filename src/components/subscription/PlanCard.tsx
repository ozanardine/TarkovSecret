'use client';

import { useState } from 'react';
import { SubscriptionPlan, BillingInterval } from '@/types/subscription';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckIcon, StarIcon } from '@heroicons/react/24/solid';
import { useCheckout } from '@/hooks/useCheckout';

interface PlanCardProps {
  plan: SubscriptionPlan;
  selectedInterval: BillingInterval;
  onSelectPlan: (planId: string, interval: BillingInterval) => void;
  isCurrentPlan?: boolean;
}

export function PlanCard({ 
  plan, 
  selectedInterval, 
  onSelectPlan, 
  isCurrentPlan = false 
}: PlanCardProps) {
  const { createCheckoutSession, isLoading } = useCheckout();

  const handleSelectPlan = async () => {
    if (plan.name === 'Free') {
      // Para o plano gratuito, redirecionar para a página principal
      window.location.href = '/';
      return;
    }

    const priceId = selectedInterval === 'yearly' 
      ? plan.stripe.priceIdYearly 
      : plan.stripe.priceIdMonthly;

    if (!priceId) {
      console.error('Price ID not available for this plan');
      return;
    }

    await createCheckoutSession(priceId);
  };

  const price = selectedInterval === 'monthly' ? plan.price.monthly : plan.price.yearly;
  const isYearly = selectedInterval === 'yearly';
  const yearlyDiscount = isYearly && plan.price.yearly > 0 
    ? Math.round(((plan.price.monthly * 12 - plan.price.yearly) / (plan.price.monthly * 12)) * 100)
    : 0;

  return (
    <div className={`
      relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl
      ${plan.isPopular 
        ? 'border-blue-500 dark:border-blue-400 scale-105' 
        : 'border-gray-200 dark:border-gray-700'
      }
      ${isCurrentPlan ? 'ring-2 ring-green-500 dark:ring-green-400' : ''}
    `}>
      {plan.isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-500 text-white px-4 py-1 text-sm font-semibold">
            <StarIcon className="w-4 h-4 mr-1" />
            Mais Popular
          </Badge>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-4 right-4">
          <Badge className="bg-green-500 text-white px-3 py-1 text-sm font-semibold">
            Seu Plano
          </Badge>
        </div>
      )}

      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {plan.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {plan.description}
          </p>
        </div>

        {/* Pricing */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              R$ {price.toFixed(2).replace('.', ',')}
            </span>
            {price > 0 && (
              <span className="text-gray-600 dark:text-gray-300 ml-2">
                /{isYearly ? 'ano' : 'mês'}
              </span>
            )}
          </div>
          
          {yearlyDiscount > 0 && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium">
              Economize {yearlyDiscount}%
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-gray-900 dark:text-white font-medium text-sm">
                  {feature.title}
                </div>
                {feature.description && (
                  <div className="text-gray-600 dark:text-gray-300 text-xs mt-1">
                    {feature.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleSelectPlan}
          disabled={isLoading}
          className={`
            w-full py-3 text-sm font-semibold rounded-lg transition-all duration-200
            ${plan.name === 'Free' 
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600' 
              : plan.isPopular
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Carregando...
            </div>
          ) : plan.name === 'Free' ? (
            'Usar Gratuitamente'
          ) : isCurrentPlan ? (
            'Plano Atual'
          ) : (
            `Assinar Secret Plus`
          )}
        </Button>
      </div>
    </div>
  );
}
