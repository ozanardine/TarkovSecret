'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { setApiLanguage } from '@/lib/tarkov-api';

/**
 * Hook que sincroniza o idioma selecionado com as chamadas da API
 * Deve ser usado em componentes que fazem chamadas para a API Tarkov.dev
 */
export function useApiLanguage() {
  const { language, isLoading } = useLanguage();

  useEffect(() => {
    if (!isLoading) {
      setApiLanguage(language);
    }
  }, [language, isLoading]);

  return {
    currentLanguage: language,
    isLanguageLoading: isLoading
  };
}
