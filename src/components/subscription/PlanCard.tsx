'use client';

import { useState } from 'react';
import { SubscriptionPlan, BillingInterval } from '@/types/subscription';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { CheckIcon, StarIcon, TrophyIcon } from '@heroicons/react/24/solid';
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
    <Card 
      className={`
        relative p-8 transition-all duration-300 hover:border-tarkov-accent/50
        ${plan.isPopular ? 'border-tarkov-accent/30 shadow-lg shadow-tarkov-accent/10' : ''}
        ${isCurrentPlan ? 'ring-2 ring-tarkov-success' : ''}
      `}
    >
      {/* Popular Badge */}
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-tarkov-accent text-white px-4 py-1">
            <StarIcon className="w-4 h-4 mr-1" />
            Mais Popular
          </Badge>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge className="bg-tarkov-success text-white px-3 py-1">
            <CheckIcon className="w-4 h-4 mr-1" />
            Seu Plano
          </Badge>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-tarkov-accent/20 rounded-xl flex items-center justify-center mx-auto mb-4">
          {plan.name === 'Free' ? (
            <StarIcon className="w-8 h-8 text-tarkov-accent" />
          ) : (
            <TrophyIcon className="w-8 h-8 text-tarkov-accent" />
          )}
        </div>
        <h3 className="text-2xl font-bold text-tarkov-light mb-2">
          {plan.name}
        </h3>
        <p className="text-tarkov-muted">
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
            <span className="text-tarkov-muted ml-2 text-lg">
              /{isYearly ? 'ano' : 'mês'}
            </span>
          )}
        </div>
        
        {yearlyDiscount > 0 && (
          <Badge className="bg-tarkov-success/20 text-tarkov-success border-tarkov-success/30">
            Economize {yearlyDiscount}%
          </Badge>
        )}
      </div>

      {/* Features */}
      <div className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start">
            <div className="w-5 h-5 bg-tarkov-accent/20 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
              <CheckIcon className="w-3 h-3 text-tarkov-accent" />
            </div>
            <div className="flex-1">
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
          w-full py-3 font-semibold transition-all duration-300
          ${plan.name === 'Free' 
            ? 'bg-tarkov-accent hover:bg-tarkov-accent/90 text-white' 
            : plan.isPopular
              ? 'bg-tarkov-accent hover:bg-tarkov-accent/90 text-white'
              : 'bg-tarkov-secondary hover:bg-tarkov-hover text-tarkov-light'
          }
        `}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            Carregando...
          </div>
        ) : plan.name === 'Free' ? (
          'Usar Gratuitamente'
        ) : isCurrentPlan ? (
          <>
            <CheckIcon className="w-4 h-4 mr-2 inline" />
            Plano Atual
          </>
        ) : (
          <>
            <StarIcon className="w-4 h-4 mr-2 inline" />
            Assinar {plan.name}
          </>
        )}
      </Button>
    </Card>
  );
}