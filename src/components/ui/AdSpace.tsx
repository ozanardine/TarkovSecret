'use client';

import { useAuth } from '@/hooks/useAuth';
import { useAdBlockerDetection } from '@/hooks/useAdBlockerDetection';
import { AdBanner } from '@/components/ads/AdBanner';
import { AdCard } from '@/components/ads/AdCard';
import { AdHorizontal } from '@/components/ads/AdHorizontal';
import { AdSenseBanner } from '@/components/ads/AdSenseBanner';
import { useEffect, useState } from 'react';

interface AdSpaceProps {
  children?: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
  type?: 'banner' | 'card' | 'horizontal' | 'adsense';
  size?: 'small' | 'medium' | 'large' | 'leaderboard' | 'sidebar' | 'responsive';
  variant?: 'promotional' | 'upgrade' | 'sponsored';
  title?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  adSlot?: string;
  useRealAds?: boolean;
}

export function AdSpace({ 
  children, 
  className = '', 
  fallback,
  type = 'banner',
  size = 'medium',
  variant = 'upgrade',
  title,
  description,
  ctaText,
  ctaLink,
  adSlot,
  useRealAds = false
}: AdSpaceProps) {
  const { canAccess, isLoading } = useAuth();
  const { isAdBlockerDetected } = useAdBlockerDetection();
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    // Only show ads if user is not Plus and not loading
    if (!isLoading) {
      setShowAd(!canAccess('ad_free'));
    }
  }, [canAccess, isLoading]);

  // If user has Plus subscription, don't show ads
  if (!showAd) {
    return null;
  }

  // If user is free and we have fallback content, show it
  if (fallback) {
    return <div className={className}>{fallback}</div>;
  }

  // If user is free and we have children, show them
  if (children) {
    return <div className={className}>{children}</div>;
  }

  // Render appropriate ad component based on type
  const renderAd = () => {
    // Se usar anúncios reais e tipo for adsense
    if (useRealAds && type === 'adsense') {
      return (
        <AdSenseBanner
          className={className}
          size={size}
          adSlot={adSlot}
        />
      );
    }

    switch (type) {
      case 'card':
        return (
          <AdCard
            className={className}
            variant={variant}
            title={title}
            description={description}
            ctaText={ctaText}
            ctaLink={ctaLink}
          />
        );
      case 'horizontal':
        return (
          <AdHorizontal
            className={className}
            variant={variant}
            title={title}
            description={description}
            ctaText={ctaText}
            ctaLink={ctaLink}
          />
        );
      case 'adsense':
        return (
          <AdSenseBanner
            className={className}
            size={size}
            adSlot={adSlot}
          />
        );
      default: // banner
        return (
          <AdBanner
            className={className}
            size={size}
          />
        );
    }
  };

  return renderAd();
}

// Hook para verificar se deve mostrar anúncios
export function useAdDisplay() {
  const { canAccess, isLoading } = useAuth();
  const { isAdBlockerDetected } = useAdBlockerDetection();
  
  return {
    showAds: !isLoading && !canAccess('ad_free'),
    isLoading,
    isAdBlockerDetected,
  };
}
