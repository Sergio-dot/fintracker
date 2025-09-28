import React, { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';

const SunIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" className="theme-icon" aria-hidden>
    <path fill="currentColor" d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79 1.8-1.79zM1 13h3v-2H1v2zm10-9h2V1h-2v3zm7.03 1.05l1.79-1.79-1.79-1.79-1.8 1.79 1.8 1.79zM20 11v2h3v-2h-3zM12 6a6 6 0 100 12 6 6 0 000-12zm0 10a4 4 0 110-8 4 4 0 010 8zm-8.24 2.16l1.8 1.79 1.79-1.79-1.79-1.8-1.8 1.8zM12 23h2v-3h-2v3zm6.04-2.37l1.79 1.79 1.8-1.79-1.8-1.8-1.79 1.8z" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" className="theme-icon" aria-hidden>
    <path fill="currentColor" d="M12.74 2.4a9 9 0 108.86 12.88 7 7 0 01-8.86-12.88z" />
  </svg>
);

const ThemeToggle = () => {
  const { theme, setTheme } = useContext(SettingsContext);

  const toggle = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <button
      className="theme-toggle"
      data-theme={theme}
      onClick={toggle}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <div className="theme-knob" role="presentation">
        {theme === 'light' ? <SunIcon /> : <MoonIcon />}
      </div>
    </button>
  );
};

export default ThemeToggle;
