'use client';

import { PageLayout } from '@/components/layout/Layout';
import { AdSpace } from '@/components/ui/AdSpace';
import { AdSenseVerification, AdSenseDebug } from '@/components/ads/AdSenseVerification';
import { useState } from 'react';

export default function TestAdSensePage() {
  const [showDebug, setShowDebug] = useState(false);

  return (
    <PageLayout 
      title="Teste do Google AdSense"
      description="Página para testar a integração com o Google AdSense"
      className="max-w-6xl mx-auto"
    >
      <div className="space-y-8">
        {/* Status do AdSense */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            Status do AdSense
          </h2>
          <AdSenseVerification />
          
          <div className="mt-4">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm"
            >
              {showDebug ? 'Ocultar' : 'Mostrar'} Debug Info
            </button>
          </div>
          
          {showDebug && (
            <div className="mt-4">
              <AdSenseDebug />
            </div>
          )}
        </section>

        {/* Teste de Anúncios Reais */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            Anúncios Reais do AdSense
          </h2>
          
          <div className="space-y-6">
            {/* Banner Leaderboard */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Banner Leaderboard (728x90)
              </h3>
              <AdSpace 
                type="adsense"
                size="leaderboard"
                useRealAds={true}
                className="max-w-4xl mx-auto"
              />
            </div>

            {/* Banner Responsivo */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Banner Responsivo
              </h3>
              <AdSpace 
                type="adsense"
                size="responsive"
                useRealAds={true}
                className="max-w-4xl mx-auto"
              />
            </div>

            {/* Banner 300x250 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Banner 300x250 (Medium Rectangle)
              </h3>
              <AdSpace 
                type="adsense"
                size="medium"
                useRealAds={true}
                className="max-w-sm mx-auto"
              />
            </div>
          </div>
        </section>

        {/* Teste de Anúncios Promocionais */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            Anúncios Promocionais (Fallback)
          </h2>
          
          <div className="space-y-6">
            {/* Card de Upgrade */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Card de Upgrade
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
            </div>

            {/* Banner Horizontal */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Banner Horizontal
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
            </div>
          </div>
        </section>

        {/* Informações Técnicas */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            Informações Técnicas
          </h2>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="text-white font-semibold mb-2">Configuração Atual</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• Client ID: ca-pub-5475619702541266</li>
                  <li>• Script: Carregado globalmente</li>
                  <li>• Detecção de bloqueadores: Ativa</li>
                  <li>• Fallback: Anúncios promocionais</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-2">Próximos Passos</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• Configurar slots no AdSense</li>
                  <li>• Atualizar AD_CONFIGS</li>
                  <li>• Testar em produção</li>
                  <li>• Monitorar performance</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Instruções */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            Instruções para Configuração
          </h2>
          
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
            <ol className="text-gray-300 space-y-2 list-decimal list-inside">
              <li>Acesse o <a href="https://www.google.com/adsense/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Google AdSense</a></li>
              <li>Adicione seu site: <code className="bg-gray-700 px-2 py-1 rounded">https://tarkovsecret.vercel.app</code></li>
              <li>Crie os slots de anúncios necessários</li>
              <li>Atualize os IDs dos slots em <code className="bg-gray-700 px-2 py-1 rounded">src/lib/adsense.ts</code></li>
              <li>Teste os anúncios em produção</li>
              <li>Monitore a performance no painel do AdSense</li>
            </ol>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
