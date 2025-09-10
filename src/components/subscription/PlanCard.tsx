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
      relative bg-tarkov-secondary/80 backdrop-blur-sm rounded-2xl shadow-dark-lg border-2 transition-all duration-200 hover:shadow-glow card-hover
      ${plan.isPopular 
        ? 'border-tarkov-accent scale-105' 
        : 'border-tarkov-border/50'
      }
      ${isCurrentPlan ? 'ring-2 ring-tarkov-success' : ''}
    `}>
      {plan.isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-tarkov-accent text-black px-4 py-1 text-sm font-semibold shadow-glow">
            <StarIcon className="w-4 h-4 mr-1" />
            Mais Popular
          </Badge>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-4 right-4">
          <Badge className="bg-tarkov-success text-white px-3 py-1 text-sm font-semibold">
            Seu Plano
          </Badge>
        </div>
      )}

      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-tarkov-light mb-2">
            {plan.name}
          </h3>
          <p className="text-tarkov-muted text-sm">
            {plan.description}
          </p>
        </div>

        {/* Pricing */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <span className="text-4xl font-bold text-tarkov-light">
              R$ {price.toFixed(2).replace('.', ',')}
            </span>
            {price > 0 && (
              <span className="text-tarkov-muted ml-2">
                /{isYearly ? 'ano' : 'mês'}
              </span>
            )}
          </div>
          
          {yearlyDiscount > 0 && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-tarkov-success/20 text-tarkov-success text-sm font-medium">
              Economize {yearlyDiscount}%
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckIcon className="w-5 h-5 text-tarkov-accent mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-tarkov-light font-medium text-sm">
                  {feature.title}
                </div>
                {feature.description && (
                  <div className="text-tarkov-muted text-xs mt-1">
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
            w-full py-3 text-sm font-semibold rounded-lg transition-all duration-200 btn-hover
            ${plan.name === 'Free' 
              ? 'bg-tarkov-tertiary text-tarkov-light hover:bg-tarkov-hover' 
              : plan.isPopular
                ? 'bg-tarkov-accent hover:bg-tarkov-accent/90 text-black shadow-glow'
                : 'bg-tarkov-secondary text-tarkov-light hover:bg-tarkov-tertiary'
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
