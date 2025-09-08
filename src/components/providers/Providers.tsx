'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { ToastProvider } from '@/components/ui/Toast';
import { LanguageProvider } from '@/contexts/LanguageContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a1a',
              color: '#f5f5f5',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#f5f5f5',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f5f5f5',
              },
            },
            loading: {
              iconTheme: {
                primary: '#d4af37',
                secondary: '#f5f5f5',
              },
            },
          }}
        />
        
        {/* Portal for modals */}
        <div id="modal-root" />
        
        {/* Portal for tooltips */}
        <div id="tooltip-root" />
      </LanguageProvider>
    </SessionProvider>
  );
}