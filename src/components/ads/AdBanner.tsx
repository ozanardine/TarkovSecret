'use client';

import { useAuth } from '@/hooks/useAuth';
import { useAdBlockerDetection } from '@/hooks/useAdBlockerDetection';
import { useState, useEffect } from 'react';

interface AdBannerProps {
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'leaderboard' | 'sidebar' | 'responsive';
  position?: 'top' | 'bottom' | 'inline' | 'sidebar';
}

const adSizes = {
  small: 'w-300 h-100',
  medium: 'w-728 h-90',
  large: 'w-970 h-250',
  leaderboard: 'w-728 h-90',
  sidebar: 'w-300 h-600',
  responsive: 'w-full h-32 sm:h-24 md:h-32 lg:h-40'
};

export function AdBanner({ 
  className = '', 
  size = 'medium', 
  position = 'inline' 
}: AdBannerProps) {
  const { canAccess } = useAuth();
  const { isAdBlockerDetected, isLoading } = useAdBlockerDetection();
  const [adLoaded, setAdLoaded] = useState(false);

  // Se usuário tem Plus, não mostrar anúncios
  if (canAccess('ad_free')) {
    return null;
  }

  // Se ainda está carregando, mostrar placeholder
  if (isLoading) {
    return (
      <div className={`${adSizes[size]} bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center ${className}`}>
        <div className="animate-pulse text-gray-500 text-sm">Carregando...</div>
      </div>
    );
  }

  // Se bloqueador detectado, mostrar aviso
  if (isAdBlockerDetected) {
    return (
      <div className={`${adSizes[size]} bg-red-900/20 border border-red-500/30 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
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
    }, 1000 + Math.random() * 2000); // 1-3 segundos

    return () => clearTimeout(timer);
  }, []);

  if (!adLoaded) {
    return (
      <div className={`${adSizes[size]} bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center ${className}`}>
        <div className="animate-pulse text-gray-500 text-sm">Carregando anúncio...</div>
      </div>
    );
  }

  // Anúncio simulado (substitua por anúncios reais)
  return (
    <div className={`${adSizes[size]} bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg overflow-hidden ${className}`}>
      <div className="w-full h-full flex items-center justify-center relative">
        {/* Anúncio Simulado */}
        <div className="text-center p-4">
          <div className="text-blue-300 text-sm font-medium mb-2">
            Anúncio Patrocinado
          </div>
          <div className="text-blue-200 text-xs mb-3">
            Upgrade para Secret Plus e remova anúncios
          </div>
          <a 
            href="/subscription"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded transition-colors"
          >
            Fazer Upgrade
          </a>
        </div>
        
        {/* Indicador de anúncio */}
        <div className="absolute top-2 right-2 text-xs text-gray-400">
          Anúncio
        </div>
      </div>
    </div>
  );
}
