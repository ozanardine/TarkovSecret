'use client';

import { useState } from 'react';
import { XMarkIcon, ShieldExclamationIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface AdBlockerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdBlockerModal({ isOpen, onClose }: AdBlockerModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleUpgrade = () => {
    window.location.href = '/subscription';
  };

  const handleWhitelist = () => {
    // Instruções para adicionar à lista branca
    const instructions = `
Para desabilitar o bloqueador de anúncios no Secret Tarkov:

1. Clique no ícone do bloqueador de anúncios na barra de ferramentas
2. Selecione "Desabilitar neste site" ou "Adicionar à lista branca"
3. Recarregue a página

Ou faça upgrade para Secret Plus e remova todos os anúncios permanentemente!
    `;
    
    alert(instructions);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`transform transition-all duration-300 ${
        isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      }`}>
        <Card className="relative max-w-2xl w-full bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/30 backdrop-blur-sm">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldExclamationIcon className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">
                Bloqueador de Anúncios Detectado
              </h2>
              
              <p className="text-gray-300 text-lg leading-relaxed">
                Detectamos que você está usando um bloqueador de anúncios. 
                Para continuar usando o Secret Tarkov gratuitamente, 
                precisamos exibir alguns anúncios.
              </p>
            </div>

            {/* Warning Box */}
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-6 mb-8">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                    Por que precisamos de anúncios?
                  </h3>
                  <p className="text-yellow-200 text-sm leading-relaxed">
                    Os anúncios nos ajudam a manter o Secret Tarkov gratuito para todos os jogadores. 
                    Eles cobrem os custos de servidores, desenvolvimento e manutenção da plataforma.
                  </p>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Whitelist Option */}
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-300 mb-3">
                    Desabilitar Bloqueador
                  </h3>
                  <p className="text-blue-200 text-sm mb-4">
                    Adicione o Secret Tarkov à lista branca do seu bloqueador de anúncios.
                  </p>
                  <Button
                    onClick={handleWhitelist}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                  >
                    Ver Instruções
                  </Button>
                </div>

                {/* Upgrade Option */}
                <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">
                    Upgrade para Plus
                  </h3>
                  <p className="text-purple-200 text-sm mb-4">
                    Remova todos os anúncios permanentemente com o Secret Plus.
                  </p>
                  <Button
                    onClick={handleUpgrade}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                  >
                    Fazer Upgrade
                  </Button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="text-center pt-4">
                <p className="text-gray-400 text-sm">
                  Você pode fechar este modal, mas os anúncios continuarão bloqueados até que 
                  uma das opções acima seja escolhida.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
