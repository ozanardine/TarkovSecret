'use client';

import { useEffect, useState } from 'react';

interface AdSenseVerificationProps {
  className?: string;
}

export function AdSenseVerification({ className = '' }: AdSenseVerificationProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se o AdSense está carregado
    const checkAdSense = () => {
      const adSenseLoaded = !!(window as any).adsbygoogle;
      setIsVerified(adSenseLoaded);
      setIsLoading(false);
    };

    // Verificar imediatamente
    checkAdSense();

    // Verificar novamente após 2 segundos
    const timeout = setTimeout(checkAdSense, 2000);

    return () => clearTimeout(timeout);
  }, []);

  if (isLoading) {
    return (
      <div className={`text-center p-4 ${className}`}>
        <div className="animate-pulse text-gray-500 text-sm">
          Verificando AdSense...
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className={`text-center p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg ${className}`}>
        <div className="text-yellow-400 text-sm font-medium mb-2">
          ⚠️ AdSense não carregado
        </div>
        <div className="text-yellow-300 text-xs">
          Verifique se o script está sendo carregado corretamente
        </div>
      </div>
    );
  }

  return (
    <div className={`text-center p-4 bg-green-900/20 border border-green-500/30 rounded-lg ${className}`}>
      <div className="text-green-400 text-sm font-medium mb-2">
        ✅ AdSense carregado com sucesso
      </div>
      <div className="text-green-300 text-xs">
        Script: ca-pub-5475619702541266
      </div>
    </div>
  );
}

// Componente para debug do AdSense
export function AdSenseDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const info = {
      adsbygoogle: !!(window as any).adsbygoogle,
      adsbygoogleArray: (window as any).adsbygoogle || [],
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      location: window.location.href,
      timestamp: new Date().toISOString()
    };
    
    setDebugInfo(info);
  }, []);

  if (!debugInfo) {
    return <div className="text-gray-500">Carregando debug info...</div>;
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-xs">
      <h3 className="text-white font-semibold mb-2">AdSense Debug Info</h3>
      <pre className="text-gray-300 whitespace-pre-wrap">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
}
