'use client';

import { useState } from 'react';
import { AdSpace } from '@/components/ui/AdSpace';

// Exemplo de como usar o sistema de anúncios completo
export function AdExample() {
  return (
    <div className="space-y-8">
      {/* 1. Anúncio Real do AdSense - Banner Principal */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">
          Anúncio Real - AdSense Banner
        </h3>
        <AdSpace 
          type="adsense"
          size="leaderboard"
          useRealAds={true}
          adSlot="1234567890" // Substitua pelo seu slot real
          className="max-w-4xl mx-auto"
        />
      </section>

      {/* 2. Anúncio Promocional - Card de Upgrade */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">
          Anúncio Promocional - Card de Upgrade
        </h3>
        <AdSpace 
          type="card"
          variant="upgrade"
          title="Upgrade para Secret Plus"
          description="Remova anúncios permanentemente e desbloqueie recursos exclusivos"
          ctaText="Fazer Upgrade Agora"
          ctaLink="/subscription"
          className="max-w-md mx-auto"
        />
      </section>

      {/* 3. Anúncio Horizontal - Oferta Especial */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">
          Anúncio Horizontal - Oferta Especial
        </h3>
        <AdSpace 
          type="horizontal"
          variant="promotional"
          title="Oferta Especial - 50% OFF"
          description="Aproveite nossa oferta limitada no Secret Plus"
          ctaText="Ver Oferta"
          ctaLink="/subscription"
          className="max-w-4xl mx-auto"
        />
      </section>

      {/* 4. Anúncio Responsivo - AdSense */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">
          Anúncio Responsivo - AdSense
        </h3>
        <AdSpace 
          type="adsense"
          size="responsive"
          useRealAds={true}
          adSlot="1234567893" // Substitua pelo seu slot real
          className="max-w-4xl mx-auto"
        />
      </section>

      {/* 5. Anúncio Sidebar - Desktop */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">
          Anúncio Sidebar - Desktop
        </h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <p className="text-gray-300">
              Conteúdo principal da página aqui...
            </p>
          </div>
          <div className="w-80">
            <AdSpace 
              type="adsense"
              size="sidebar"
              useRealAds={true}
              adSlot="1234567891" // Substitua pelo seu slot real
            />
          </div>
        </div>
      </section>

      {/* 6. Anúncio Mobile - Banner Pequeno */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">
          Anúncio Mobile - Banner Pequeno
        </h3>
        <AdSpace 
          type="adsense"
          size="small"
          useRealAds={true}
          adSlot="1234567892" // Substitua pelo seu slot real
          className="max-w-sm mx-auto"
        />
      </section>

      {/* 7. Anúncio Sponsored - Patrocinado */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">
          Anúncio Patrocinado
        </h3>
        <AdSpace 
          type="card"
          variant="sponsored"
          title="Patrocinado por Gaming Store"
          description="Encontre os melhores equipamentos para Tarkov"
          ctaText="Visitar Loja"
          ctaLink="https://gamingstore.com"
          className="max-w-md mx-auto"
        />
      </section>
    </div>
  );
}

// Hook para gerenciar anúncios de forma inteligente
export function useSmartAds() {
  const [adStrategy, setAdStrategy] = useState<'aggressive' | 'balanced' | 'minimal'>('balanced');
  
  const getAdConfig = (position: string) => {
    switch (position) {
      case 'top':
        return {
          type: 'adsense' as const,
          size: 'leaderboard' as const,
          useRealAds: true,
          className: 'max-w-4xl mx-auto my-8'
        };
      case 'inline':
        return {
          type: adStrategy === 'aggressive' ? 'adsense' as const : 'card' as const,
          size: 'medium' as const,
          variant: 'upgrade' as const,
          title: 'Upgrade para Plus',
          description: 'Remova anúncios e desbloqueie recursos',
          ctaText: 'Fazer Upgrade',
          ctaLink: '/subscription',
          className: 'max-w-md mx-auto my-6'
        };
      case 'bottom':
        return {
          type: 'adsense' as const,
          size: 'responsive' as const,
          useRealAds: true,
          className: 'max-w-4xl mx-auto my-8'
        };
      default:
        return {
          type: 'card' as const,
          variant: 'upgrade' as const,
          title: 'Upgrade para Plus',
          description: 'Remova anúncios permanentemente',
          ctaText: 'Fazer Upgrade',
          ctaLink: '/subscription',
          className: 'max-w-md mx-auto'
        };
    }
  };

  return {
    adStrategy,
    setAdStrategy,
    getAdConfig
  };
}
