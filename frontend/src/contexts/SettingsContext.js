import React, { createContext, useState, useEffect } from 'react';

export const SettingsContext = createContext({
  lang: 'en',
  setLang: () => {},
  theme: 'light',
  setTheme: () => {},
});

export const SettingsProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('ft_lang') || 'en');
  const [theme, setTheme] = useState(() => localStorage.getItem('ft_theme') || 'light');

  useEffect(() => {
    localStorage.setItem('ft_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('ft_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <SettingsContext.Provider value={{ lang, setLang, theme, setTheme }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
