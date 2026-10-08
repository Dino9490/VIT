import React from 'react';
import { Scale, Sun, Moon, Globe } from 'lucide-react';
import { LANGUAGES, UI_TRANSLATIONS } from '../data/translations';

export default function Header({
  language,
  setLanguage,
  isDarkMode,
  setIsDarkMode
}) {
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  return (
    <header className="header-wrapper">
      <div className="brand-section">
        <div className="brand-icon-box">
          <Scale size={24} />
        </div>
        <div className="brand-title-group">
          <h1>
            {t.appTitle}
            <span className="brand-badge">AI 2.0</span>
          </h1>
          <p className="brand-tagline">{t.tagline}</p>
        </div>
      </div>

      <div className="header-controls">
        {/* Language Selector (Stage 4: English / Tamil / Hindi) */}
        <div className="lang-selector-group" title="Select Language">
          <Globe size={16} style={{ marginLeft: 8, color: 'var(--text-muted)' }} />
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              className={`lang-btn ${language === lang.code ? 'active' : ''}`}
              onClick={() => setLanguage(lang.code)}
            >
              <span>{lang.flag}</span>
              <span>{lang.native}</span>
            </button>
          ))}
        </div>

        {/* Dark / Light Theme Toggle */}
        <button
          className="btn-icon-header"
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
