'use client';

import { useAuth } from '@/hooks/useAuth';
import { useAdBlockerDetection } from '@/hooks/useAdBlockerDetection';
import { useState, useEffect } from 'react';
import { StarIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface AdCardProps {
  className?: string;
  variant?: 'promotional' | 'upgrade' | 'sponsored';
  title?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
}

export function AdCard({ 
  className = '',
  variant = 'upgrade',
  title,
  description,
  ctaText,
  ctaLink = '/subscription'
}: AdCardProps) {
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
      <div className={`bg-gray-800 border border-gray-700 rounded-xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Se bloqueador detectado, mostrar aviso
  if (isAdBlockerDetected) {
    return (
      <div className={`bg-red-900/20 border border-red-500/30 rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-400 text-sm font-medium mb-2">
            Anúncio Bloqueado
          </div>
          <div className="text-red-300 text-xs">
            Desabilite o bloqueador para ver anúncios
          </div>
        </div>
      </div>
    );
  }

  // Simular carregamento de anúncio
  useEffect(() => {
    const timer = setTimeout(() => {
      setAdLoaded(true);
    }, 500 + Math.random() * 1500); // 0.5-2 segundos

    return () => clearTimeout(timer);
  }, []);

  if (!adLoaded) {
    return (
      <div className={`bg-gray-800 border border-gray-700 rounded-xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!isVisible) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'promotional':
        return {
          bg: 'bg-gradient-to-br from-green-900/20 to-emerald-900/20',
          border: 'border-green-500/30',
          text: 'text-green-300',
          accent: 'text-green-400',
          button: 'bg-green-600 hover:bg-green-500'
        };
      case 'sponsored':
        return {
          bg: 'bg-gradient-to-br from-blue-900/20 to-cyan-900/20',
          border: 'border-blue-500/30',
          text: 'text-blue-300',
          accent: 'text-blue-400',
          button: 'bg-blue-600 hover:bg-blue-500'
        };
      default: // upgrade
        return {
          bg: 'bg-gradient-to-br from-purple-900/20 to-pink-900/20',
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
    'Aproveite nossa oferta limitada' :
    'Descubra mais sobre nossos produtos';
  const defaultCtaText = variant === 'upgrade' ? 'Fazer Upgrade' : 'Saiba Mais';

  return (
    <div className={`relative ${styles.bg} border ${styles.border} rounded-xl p-6 ${className}`}>
      {/* Close Button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>

      {/* Ad Content */}
      <div className="pr-6">
        <div className="flex items-start mb-4">
          <div className={`w-10 h-10 ${styles.bg} rounded-lg flex items-center justify-center mr-3`}>
            <StarIcon className={`w-5 h-5 ${styles.accent}`} />
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${styles.text} mb-2`}>
              {title || defaultTitle}
            </h3>
            <p className={`text-sm ${styles.text} opacity-80`}>
              {description || defaultDescription}
            </p>
          </div>
        </div>

        <a
          href={ctaLink}
          className={`inline-block ${styles.button} text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105`}
        >
          {ctaText || defaultCtaText}
        </a>
      </div>

      {/* Ad Label */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-400">
        Anúncio
      </div>
    </div>
  );
}
