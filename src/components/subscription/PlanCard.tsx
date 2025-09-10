'use client';

import { useState } from 'react';
import { SubscriptionPlan, BillingInterval } from '@/types/subscription';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckIcon, StarIcon, FireIcon, ArrowRightIcon, PlayIcon } from '@heroicons/react/24/solid';
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
      group relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border-2 transition-all duration-500 hover:scale-105 hover:shadow-3xl
      ${plan.isPopular 
        ? 'border-gradient-to-r from-blue-500 to-purple-500 scale-105 shadow-blue-500/20' 
        : 'border-gray-700/50 hover:border-gray-600'
      }
      ${isCurrentPlan ? 'ring-2 ring-green-500 shadow-green-500/20' : ''}
    `}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {plan.isPopular && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
          <div className="relative">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 text-sm font-bold shadow-lg">
              <StarIcon className="w-4 h-4 mr-2 animate-pulse" />
              Mais Popular
            </Badge>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-50"></div>
          </div>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-6 right-6 z-10">
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 text-sm font-bold shadow-lg">
            <CheckIcon className="w-4 h-4 mr-1" />
            Seu Plano
          </Badge>
        </div>
      )}

      <div className="relative p-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
            <StarIcon className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
            {plan.name}
          </h3>
          <p className="text-gray-400 text-lg">
            {plan.description}
          </p>
        </div>

        {/* Pricing */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <span className="text-6xl font-black text-white group-hover:text-blue-300 transition-colors">
              R$ {price.toFixed(2).replace('.', ',')}
            </span>
            {price > 0 && (
              <span className="text-gray-400 ml-3 text-xl">
                /{isYearly ? 'ano' : 'mês'}
              </span>
            )}
          </div>
          
          {yearlyDiscount > 0 && (
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 text-sm font-bold border border-green-500/30">
              <FireIcon className="w-4 h-4 mr-2" />
              Economize {yearlyDiscount}%
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-5 mb-10">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start group/feature">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4 mt-0.5 flex-shrink-0 group-hover/feature:scale-110 transition-transform">
                <CheckIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold text-base group-hover/feature:text-blue-300 transition-colors">
                  {feature.title}
                </div>
                {feature.description && (
                  <div className="text-gray-400 text-sm mt-1 leading-relaxed">
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
            group/btn relative w-full py-4 text-lg font-bold rounded-2xl transition-all duration-300 transform hover:scale-105
            ${plan.name === 'Free' 
              ? 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white shadow-lg hover:shadow-xl' 
              : plan.isPopular
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white shadow-2xl hover:shadow-blue-500/25'
                : 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white shadow-lg hover:shadow-xl'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
              Carregando...
            </div>
          ) : plan.name === 'Free' ? (
            <span className="flex items-center justify-center">
              <PlayIcon className="w-5 h-5 mr-2 group-hover/btn:scale-110 transition-transform" />
              Usar Gratuitamente
            </span>
          ) : isCurrentPlan ? (
            <span className="flex items-center justify-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              Plano Atual
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <StarIcon className="w-5 h-5 mr-2 group-hover/btn:animate-pulse" />
              Assinar Secret Plus
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </span>
          )}
          
          {/* Button Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-0 group-hover/btn:opacity-30 transition-opacity"></div>
        </Button>
      </div>
    </div>
  );
}
