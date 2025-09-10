'use client';

import { useAdBlockerDetection } from '@/hooks/useAdBlockerDetection';
import { AdBlockerModal } from './AdBlockerModal';
import { AdBanner } from './AdBanner';
import { AdCard } from './AdCard';
import { AdHorizontal } from './AdHorizontal';

interface AdManagerProps {
  children: React.ReactNode;
}

export function AdManager({ children }: AdManagerProps) {
  const { showAdBlockerModal, dismissModal } = useAdBlockerDetection();

  return (
    <>
      {children}
      
      {/* Modal de Bloqueador de Anúncios */}
      <AdBlockerModal 
        isOpen={showAdBlockerModal} 
        onClose={dismissModal} 
      />
    </>
  );
}

// Componentes de anúncios para uso em locais específicos
export { AdBanner, AdCard, AdHorizontal, AdBlockerModal };
