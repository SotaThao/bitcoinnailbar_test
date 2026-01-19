import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations, Language } from '../../utils/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (path: string) => {
    const keys = path.split('.');
    let value: any = translations[language];
    
    for (const key of keys) {
      if (value === undefined) return path;
      value = value[key];
    }
    
    return value === undefined ? path : value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Default fallback with proper translation function
const defaultContext: LanguageContextType = {
  language: 'en',
  setLanguage: () => console.warn('setLanguage called without LanguageProvider'),
  t: (path: string) => {
    // Use the same translation logic as the provider
    const keys = path.split('.');
    let value: any = translations['en'];
    
    for (const key of keys) {
      if (value === undefined) return path;
      value = value[key];
    }
    
    return value === undefined ? path : value;
  },
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Instead of crashing, return a safe default context
    // This handles cases where components are rendered in isolation (like Figma previews)
    return defaultContext;
  }
  return context;
}