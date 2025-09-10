'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

interface AdSpaceProps {
  children?: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
}

export function AdSpace({ children, className = '', fallback }: AdSpaceProps) {
  const { canAccess, isLoading } = useAuth();
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

  // Default ad placeholder
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg p-4 text-center ${className}`}>
      <div className="text-gray-400 text-sm">
        <div className="w-full h-24 bg-gray-700 rounded flex items-center justify-center mb-2">
          <span className="text-xs">Anúncio</span>
        </div>
        <p className="text-xs">
          <a 
            href="/subscription" 
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Upgrade para Plus
          </a>{' '}
          e remova anúncios
        </p>
      </div>
    </div>
  );
}

// Hook para verificar se deve mostrar anúncios
export function useAdDisplay() {
  const { canAccess, isLoading } = useAuth();
  
  return {
    showAds: !isLoading && !canAccess('ad_free'),
    isLoading,
  };
}
