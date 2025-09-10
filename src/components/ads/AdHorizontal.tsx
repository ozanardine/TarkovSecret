'use client';

import { useAuth } from '@/hooks/useAuth';
import { useAdBlockerDetection } from '@/hooks/useAdBlockerDetection';
import { useState, useEffect } from 'react';
import { ArrowRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface AdHorizontalProps {
  className?: string;
  variant?: 'upgrade' | 'sponsored' | 'promotional';
  title?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  showCloseButton?: boolean;
}

export function AdHorizontal({ 
  className = '',
  variant = 'upgrade',
  title,
  description,
  ctaText,
  ctaLink = '/subscription',
  showCloseButton = true
}: AdHorizontalProps) {
  const { canAccess } = useAuth();
  const { isAdBlockerDetected, isLoading } = useAdBlockerDetection();
  const [isVisible, setIsVisible] = useState(true);
  const [adLoaded, setAdLoaded] = useState(false);

  // Se usuário tem Plus, não mostrar anúncios
  if (canAccess('ad_free')) {
    return null;
  }

  // Se ainda está carregando, mostrar placeholder
  if (isLoading) {
    return (
      <div className={`bg-gray-800 border border-gray-700 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse flex items-center space-x-4">
          <div className="h-12 w-12 bg-gray-700 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="h-8 w-20 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Se bloqueador detectado, mostrar aviso
  if (isAdBlockerDetected) {
    return (
      <div className={`bg-red-900/20 border border-red-500/30 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 text-sm font-medium mb-1">
              Anúncio Bloqueado
            </div>
            <div className="text-red-300 text-xs">
              Desabilite o bloqueador para ver anúncios
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Simular carregamento de anúncio
  useEffect(() => {
    const timer = setTimeout(() => {
      setAdLoaded(true);
    }, 800 + Math.random() * 1200); // 0.8-2 segundos

    return () => clearTimeout(timer);
  }, []);

  if (!adLoaded) {
    return (
      <div className={`bg-gray-800 border border-gray-700 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse flex items-center space-x-4">
          <div className="h-12 w-12 bg-gray-700 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="h-8 w-20 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isVisible) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'sponsored':
        return {
          bg: 'bg-gradient-to-r from-cyan-900/20 to-blue-900/20',
          border: 'border-cyan-500/30',
          text: 'text-cyan-300',
          accent: 'text-cyan-400',
          button: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
        };
      case 'promotional':
        return {
          bg: 'bg-gradient-to-r from-orange-900/20 to-red-900/20',
          border: 'border-orange-500/30',
          text: 'text-orange-300',
          accent: 'text-orange-400',
          button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500'
        };
      default: // upgrade
        return {
          bg: 'bg-gradient-to-r from-purple-900/20 to-pink-900/20',
          border: 'border-purple-500/30',
          text: 'text-purple-300',
          accent: 'text-purple-400',
          button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
        };
    }
  };

  const styles = getVariantStyles();
  const defaultTitle = variant === 'upgrade' ? 'Upgrade para Secret Plus' : 
                      variant === 'promotional' ? 'Oferta Especial' :
                      'Anúncio Patrocinado';
  const defaultDescription = variant === 'upgrade' ? 
    'Remova anúncios e desbloqueie recursos exclusivos' :
    variant === 'promotional' ?
    'Aproveite nossa promoção limitada' :
    'Descubra mais sobre nossos produtos';
  const defaultCtaText = variant === 'upgrade' ? 'Fazer Upgrade' : 
                        variant === 'promotional' ? 'Aproveitar' :
                        'Saiba Mais';

  return (
    <div className={`relative ${styles.bg} border ${styles.border} rounded-lg p-4 ${className}`}>
      {/* Close Button */}
      {showCloseButton && (
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}

      {/* Ad Content */}
      <div className="flex items-center space-x-4">
        {/* Icon */}
        <div className={`w-12 h-12 ${styles.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <div className={`w-6 h-6 ${styles.accent} font-bold text-lg`}>★</div>
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold ${styles.text} mb-1`}>
            {title || defaultTitle}
          </h3>
          <p className={`text-sm ${styles.text} opacity-80`}>
            {description || defaultDescription}
          </p>
        </div>

        {/* CTA Button */}
        <div className="flex-shrink-0">
          <a
            href={ctaLink}
            className={`inline-flex items-center ${styles.button} text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105`}
          >
            {ctaText || defaultCtaText}
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </a>
        </div>
      </div>

      {/* Ad Label */}
      <div className="absolute bottom-1 right-1 text-xs text-gray-400">
        Anúncio
      </div>
    </div>
  );
}
