'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface AdBlockerDetection {
  isAdBlockerDetected: boolean;
  isLoading: boolean;
  showAdBlockerModal: boolean;
  dismissModal: () => void;
}

export function useAdBlockerDetection(): AdBlockerDetection {
  const { canAccess, isLoading: authLoading } = useAuth();
  const [isAdBlockerDetected, setIsAdBlockerDetected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdBlockerModal, setShowAdBlockerModal] = useState(false);

  useEffect(() => {
    // Se usuário tem Plus, não precisa verificar bloqueadores
    if (canAccess('ad_free')) {
      setIsLoading(false);
      return;
    }

    const detectAdBlocker = async () => {
      try {
        // Método 1: Tentar carregar um script de anúncio conhecido
        const adScript = document.createElement('script');
        adScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        adScript.async = true;
        
        const adBlockerDetected = await new Promise<boolean>((resolve) => {
          let timeout: NodeJS.Timeout;
          
          adScript.onload = () => {
            clearTimeout(timeout);
            resolve(false); // Script carregou, não há bloqueador
          };
          
          adScript.onerror = () => {
            clearTimeout(timeout);
            resolve(true); // Script falhou, provavelmente bloqueado
          };
          
          // Timeout de 3 segundos
          timeout = setTimeout(() => {
            resolve(true); // Timeout, provavelmente bloqueado
          }, 3000);
          
          document.head.appendChild(adScript);
        });

        // Método 2: Verificar se elementos de anúncio são removidos
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        testAd.style.cssText = 'position:absolute;left:-10000px;top:-1000px;width:1px;height:1px;';
        document.body.appendChild(testAd);
        
        // Aguardar um pouco para o bloqueador processar
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const isAdElementRemoved = !document.body.contains(testAd) || 
          testAd.offsetHeight === 0 || 
          testAd.offsetWidth === 0;
        
        // Limpar elemento de teste
        if (document.body.contains(testAd)) {
          document.body.removeChild(testAd);
        }

        // Método 3: Verificar propriedades do navegador
        const hasAdBlockerProperties = (
          // uBlock Origin
          (window as any).uBlockOrigin !== undefined ||
          // AdBlock Plus
          (window as any).adblockplus !== undefined ||
          // AdGuard
          (window as any).adguard !== undefined ||
          // Ghostery
          (window as any).ghostery !== undefined ||
          // Verificar se funções de anúncio foram sobrescritas
          typeof (window as any).adsbygoogle === 'undefined' ||
          // Verificar se elementos com classes de anúncio são removidos
          isAdElementRemoved
        );

        const adBlockerFound = adBlockerDetected || hasAdBlockerProperties;
        setIsAdBlockerDetected(adBlockerFound);
        
        // Mostrar modal se bloqueador for detectado
        if (adBlockerFound) {
          setShowAdBlockerModal(true);
        }

      } catch (error) {
        console.warn('Erro ao detectar bloqueador de anúncios:', error);
        // Em caso de erro, assumir que não há bloqueador
        setIsAdBlockerDetected(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Aguardar um pouco antes de detectar para evitar falsos positivos
    const timeout = setTimeout(detectAdBlocker, 1000);
    
    return () => {
      clearTimeout(timeout);
    };
  }, [canAccess]);

  const dismissModal = () => {
    setShowAdBlockerModal(false);
    // Salvar no localStorage que o usuário dispensou o modal
    localStorage.setItem('adblocker_modal_dismissed', 'true');
  };

  // Verificar se o modal já foi dispensado
  useEffect(() => {
    if (isAdBlockerDetected && !authLoading) {
      const wasDismissed = localStorage.getItem('adblocker_modal_dismissed') === 'true';
      if (!wasDismissed) {
        setShowAdBlockerModal(true);
      }
    }
  }, [isAdBlockerDetected, authLoading]);

  return {
    isAdBlockerDetected,
    isLoading: isLoading || authLoading,
    showAdBlockerModal,
    dismissModal
  };
}
