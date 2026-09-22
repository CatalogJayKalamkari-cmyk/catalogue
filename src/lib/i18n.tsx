import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as en from './translations/en';
import * as te from './translations/te';
import * as hi from './translations/hi';
import * as ta from './translations/ta';
import * as kn from './translations/kn';
import * as ml from './translations/ml';
import * as mr from './translations/mr';
import * as bn from './translations/bn';

const packs = { en, te, hi, ta, kn, ml, mr, bn };

export type Lang = keyof typeof packs;
export type TranslationKey = keyof typeof en.ui;

export const LANGUAGE_LABELS: Record<Lang, string> = {
  en: 'English',
  te: 'తెలుగు',
  hi: 'हिन्दी',
  ta: 'தமிழ்',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  mr: 'मराठी',
  bn: 'বাংলা',
};

const VALID_LANGS = Object.keys(packs) as Lang[];
const STORAGE_KEY = 'catalogue-lang';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  tc: (categoryName: string) => string;
  tt: (typeName: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && (VALID_LANGS as string[]).includes(stored) ? (stored as Lang) : 'en';
  } catch {
    return 'en';
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readStoredLang);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore storage errors (private browsing, etc.)
    }
  }, [lang]);

  function t(key: TranslationKey, vars?: Record<string, string | number>): string {
    const template = packs[lang].ui[key] ?? packs.en.ui[key] ?? key;
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (_: string, k: string) => String(vars[k] ?? ''));
  }

  function tc(categoryName: string): string {
    if (lang === 'en') return categoryName;
    return packs[lang].categories[categoryName] ?? categoryName;
  }

  function tt(typeName: string): string {
    if (lang === 'en') return typeName;
    return packs[lang].types[typeName] ?? typeName;
  }

  return <LanguageContext.Provider value={{ lang, setLang, t, tc, tt }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
