'use client';

import { useAuth } from '@/hooks/useAuth';
import { useAdBlockerDetection } from '@/hooks/useAdBlockerDetection';
import { useAdSense, AD_CONFIGS } from '@/lib/adsense';
import { useState, useEffect, useRef } from 'react';

interface AdSenseBannerProps {
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'leaderboard' | 'sidebar' | 'responsive';
  position?: 'top' | 'bottom' | 'inline' | 'sidebar';
  adSlot?: string;
}

const adSizes = {
  small: 'w-300 h-100',
  medium: 'w-728 h-90',
  large: 'w-970 h-250',
  leaderboard: 'w-728 h-90',
  sidebar: 'w-300 h-600',
  responsive: 'w-full h-auto'
};

export function AdSenseBanner({ 
  className = '', 
  size = 'medium', 
  position = 'inline',
  adSlot
}: AdSenseBannerProps) {
  const { canAccess } = useAuth();
  const { isAdBlockerDetected, isLoading } = useAdBlockerDetection();
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);
  
  // Seu AdSense Client ID - substitua pelo seu
  const AD_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-5475619702541266';
  const { isLoaded, isBlocked, createAd } = useAdSense(AD_CLIENT_ID);

  // Se usuário tem Plus, não mostrar anúncios
  if (canAccess('ad_free')) {
    return null;
  }

  // Se ainda está carregando, mostrar placeholder
  if (isLoading || !isLoaded) {
    return (
      <div className={`${adSizes[size]} bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center ${className}`}>
        <div className="animate-pulse text-gray-500 text-sm">Carregando anúncio...</div>
      </div>
    );
  }

  // Se bloqueador detectado, mostrar aviso
  if (isAdBlockerDetected || isBlocked) {
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

  // Carregar anúncio quando componente montar
  useEffect(() => {
    if (isLoaded && !isBlocked && adRef.current) {
      try {
        // Usar slot personalizado ou padrão baseado no tamanho
        const slot = adSlot || getDefaultSlot(size);
        const config = getAdConfig(size);
        
        // Criar elemento de anúncio
        const adElement = document.createElement('ins');
        adElement.className = 'adsbygoogle';
        adElement.style.display = 'block';
        adElement.setAttribute('data-ad-client', AD_CLIENT_ID);
        adElement.setAttribute('data-ad-slot', slot);
        adElement.setAttribute('data-ad-format', config.format);
        adElement.setAttribute('data-full-width-responsive', 'true');
        
        // Aplicar estilos
        Object.assign(adElement.style, config.style);
        
        // Adicionar ao DOM
        adRef.current.appendChild(adElement);
        
        // Inicializar anúncio
        setTimeout(() => {
          try {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            setAdLoaded(true);
          } catch (error) {
            console.warn('AdSense push error:', error);
            setAdError(true);
          }
        }, 100);
        
      } catch (error) {
        console.warn('AdSense creation error:', error);
        setAdError(true);
      }
    }
  }, [isLoaded, isBlocked, size, adSlot]);

  if (adError) {
    return (
      <div className={`${adSizes[size]} bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <div className="text-gray-400 text-sm font-medium mb-2">
            Erro ao carregar anúncio
          </div>
          <div className="text-gray-500 text-xs">
            Tente recarregar a página
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${adSizes[size]} ${className}`}>
      <div ref={adRef} className="w-full h-full" />
      {!adLoaded && (
        <div className="absolute inset-0 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center">
          <div className="animate-pulse text-gray-500 text-sm">Carregando anúncio...</div>
        </div>
      )}
    </div>
  );
}

// Função para obter slot padrão baseado no tamanho
function getDefaultSlot(size: string): string {
  switch (size) {
    case 'small':
      return AD_CONFIGS.BANNER_300x250.slot;
    case 'medium':
    case 'leaderboard':
      return AD_CONFIGS.BANNER_728x90.slot;
    case 'large':
      return AD_CONFIGS.BANNER_728x90.slot;
    case 'sidebar':
      return AD_CONFIGS.RESPONSIVE_SIDEBAR.slot;
    case 'responsive':
      return AD_CONFIGS.RESPONSIVE_LEADERBOARD.slot;
    default:
      return AD_CONFIGS.BANNER_728x90.slot;
  }
}

// Função para obter configuração do anúncio
function getAdConfig(size: string) {
  switch (size) {
    case 'small':
      return AD_CONFIGS.BANNER_300x250;
    case 'medium':
    case 'leaderboard':
      return AD_CONFIGS.BANNER_728x90;
    case 'large':
      return AD_CONFIGS.BANNER_728x90;
    case 'sidebar':
      return AD_CONFIGS.RESPONSIVE_SIDEBAR;
    case 'responsive':
      return AD_CONFIGS.RESPONSIVE_LEADERBOARD;
    default:
      return AD_CONFIGS.BANNER_728x90;
  }
}
