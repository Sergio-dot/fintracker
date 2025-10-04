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
    // also toggle the `dark` class so Tailwind's class-based dark mode works
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <SettingsContext.Provider value={{ lang, setLang, theme, setTheme }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
