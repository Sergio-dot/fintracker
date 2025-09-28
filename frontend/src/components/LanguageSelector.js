import React, { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';

const LanguageSelector = () => {
  const { lang, setLang } = useContext(SettingsContext);

  return (
    <select
      className="lang-select"
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      aria-label="Language selector"
    >
      <option value="en">English</option>
      <option value="it">Italiano</option>
    </select>
  );
};

export default LanguageSelector;
