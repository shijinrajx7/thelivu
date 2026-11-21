import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getPreferences, savePreferences } from '../lib/storage';
import type { UserPreferences } from '../lib/types';
import { t, type Language } from '../lib/i18n';

interface PreferencesContextValue {
  preferences: UserPreferences;
  language: Language;
  setLanguage: (language: Language) => void;
  theme: UserPreferences['theme'];
  toggleTheme: () => void;
  text: (key: string) => string;
}
const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(() => getPreferences());
  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.lang = preferences.language === 'ml' ? 'ml' : preferences.language === 'hi' ? 'hi' : 'en';
    savePreferences(preferences);
  }, [preferences]);
  const value = useMemo<PreferencesContextValue>(() => ({
    preferences,
    language: preferences.language,
    setLanguage: (language) => setPreferences((current) => ({ ...current, language })),
    theme: preferences.theme,
    toggleTheme: () => setPreferences((current) => ({ ...current, theme: current.theme === 'dark' ? 'light' : 'dark' })),
    text: (key) => t(preferences.language, key),
  }), [preferences]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used inside PreferencesProvider.');
  return context;
}
