'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Idiomas disponíveis na API Tarkov.dev
export type SupportedLanguage = 'cs' | 'de' | 'en' | 'es' | 'fr' | 'hu' | 'it' | 'ja' | 'ko' | 'pl' | 'pt' | 'ro' | 'ru' | 'sk' | 'tr' | 'zh';

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, string> = {
  cs: 'Čeština',
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  hu: 'Magyar',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
  pl: 'Polski',
  pt: 'Português',
  ro: 'Română',
  ru: 'Русский',
  sk: 'Slovenčina',
  tr: 'Türkçe',
  zh: '中文'
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'tarkov-language';

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<SupportedLanguage>('pt');
  const [isLoading, setIsLoading] = useState(true);

  // Carregar idioma do localStorage na inicialização
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && Object.keys(SUPPORTED_LANGUAGES).includes(savedLanguage)) {
        setLanguageState(savedLanguage as SupportedLanguage);
      } else {
        // Detectar idioma do navegador como fallback
        const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
        if (Object.keys(SUPPORTED_LANGUAGES).includes(browserLang)) {
          setLanguageState(browserLang);
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar idioma do localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Erro ao salvar idioma no localStorage:', error);
      // Ainda assim atualiza o estado mesmo se não conseguir salvar
      setLanguageState(lang);
    }
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage deve ser usado dentro de um LanguageProvider');
  }
  return context;
}
