import { useState, useEffect } from 'react';

// Google AdSense Integration
export class AdSenseManager {
  private static instance: AdSenseManager;
  private isLoaded = false;
  private adClientId: string;

  constructor(adClientId: string) {
    this.adClientId = adClientId;
  }

  static getInstance(adClientId?: string): AdSenseManager {
    if (!AdSenseManager.instance && adClientId) {
      AdSenseManager.instance = new AdSenseManager(adClientId);
    }
    return AdSenseManager.instance;
  }

  async loadAdSense(): Promise<void> {
    if (this.isLoaded) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.setAttribute('data-ad-client', this.adClientId);
      
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load AdSense'));
      };
      
      document.head.appendChild(script);
    });
  }

  createAd(adSlot: string, adFormat: string, adStyle?: any): void {
    if (!this.isLoaded) {
      console.warn('AdSense not loaded yet');
      return;
    }

    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({
        google_ad_client: this.adClientId,
        enable_page_level_ads: false,
        overlays: { bottom: true }
      });
    } catch (error) {
      console.warn('AdSense push error:', error);
    }
  }

  // Detectar se AdSense foi bloqueado
  async isAdBlocked(): Promise<boolean> {
    try {
      await this.loadAdSense();
      
      // Verificar se o script carregou corretamente
      const adSenseLoaded = !!(window as any).adsbygoogle;
      
      if (!adSenseLoaded) return true;
      
      // Verificar se elementos de anúncio são removidos
      const testAd = document.createElement('div');
      testAd.innerHTML = '&nbsp;';
      testAd.className = 'adsbox';
      testAd.style.cssText = 'position:absolute;left:-10000px;top:-1000px;width:1px;height:1px;';
      document.body.appendChild(testAd);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const isBlocked = !document.body.contains(testAd) || 
        testAd.offsetHeight === 0 || 
        testAd.offsetWidth === 0;
      
      if (document.body.contains(testAd)) {
        document.body.removeChild(testAd);
      }
      
      return isBlocked;
    } catch (error) {
      return true;
    }
  }
}

// Configurações de anúncios
export const AD_CONFIGS = {
  // Banners
  BANNER_728x90: {
    slot: '1234567890',
    format: 'auto',
    style: { display: 'block' }
  },
  BANNER_300x250: {
    slot: '1234567891',
    format: 'auto',
    style: { display: 'block' }
  },
  BANNER_320x50: {
    slot: '1234567892',
    format: 'auto',
    style: { display: 'block' }
  },
  
  // Responsive
  RESPONSIVE_LEADERBOARD: {
    slot: '1234567893',
    format: 'auto',
    style: { display: 'block' }
  },
  RESPONSIVE_SIDEBAR: {
    slot: '1234567894',
    format: 'auto',
    style: { display: 'block' }
  },
  
  // In-Article
  IN_ARTICLE: {
    slot: '1234567895',
    format: 'fluid',
    style: { display: 'block', textAlign: 'center' }
  }
};

// Hook para gerenciar AdSense
export function useAdSense(adClientId: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const adSense = AdSenseManager.getInstance(adClientId);
    
    adSense.loadAdSense()
      .then(() => {
        setIsLoaded(true);
        return adSense.isAdBlocked();
      })
      .then((blocked) => {
        setIsBlocked(blocked);
      })
      .catch((err) => {
        setError(err.message);
        setIsBlocked(true);
      });
  }, [adClientId]);

  return {
    isLoaded,
    isBlocked,
    error,
    createAd: (slot: string, format: string, style?: any) => {
      const adSense = AdSenseManager.getInstance();
      adSense.createAd(slot, format, style);
    }
  };
}
