'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES, SupportedLanguage } from '@/contexts/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage, isLoading } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fechar dropdown com Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  const handleLanguageSelect = (lang: SupportedLanguage) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const getFlagEmoji = (lang: SupportedLanguage): string => {
    const flags: Record<SupportedLanguage, string> = {
      cs: '🇨🇿',
      de: '🇩🇪',
      en: '🇺🇸',
      es: '🇪🇸',
      fr: '🇫🇷',
      hu: '🇭🇺',
      it: '🇮🇹',
      ja: '🇯🇵',
      ko: '🇰🇷',
      pl: '🇵🇱',
      pt: '🇧🇷',
      ro: '🇷🇴',
      ru: '🇷🇺',
      sk: '🇸🇰',
      tr: '🇹🇷',
      zh: '🇨🇳'
    };
    return flags[lang] || '🌐';
  };

  if (isLoading) {
    return (
      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        aria-label={`Idioma atual: ${SUPPORTED_LANGUAGES[language]}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-lg" role="img" aria-label="Bandeira">
          {getFlagEmoji(language)}
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
          {language.toUpperCase()}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          role="listbox"
          aria-label="Selecionar idioma"
        >
          <div className="py-2">
            {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => {
              const langCode = code as SupportedLanguage;
              const isSelected = langCode === language;
              
              return (
                <button
                  key={code}
                  onClick={() => handleLanguageSelect(langCode)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${
                    isSelected
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="text-lg" role="img" aria-label="Bandeira">
                    {getFlagEmoji(langCode)}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                        {code}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-orange-600 dark:text-orange-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
