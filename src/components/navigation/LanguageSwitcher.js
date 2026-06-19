'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './LanguageSwitcher.module.css';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', nameEn: 'English' },
  { code: 'ar', name: 'العربية', flag: '🇪🇬', nameEn: 'Arabic' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', nameEn: 'German' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', nameEn: 'French' },
  { code: 'es', name: 'Español', flag: '🇪🇸', nameEn: 'Spanish' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', nameEn: 'Italian' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', nameEn: 'Russian' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', nameEn: 'Turkish' },
  { code: 'zh', name: '中文', flag: '🇨🇳', nameEn: 'Chinese' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', nameEn: 'Japanese' },
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { locale, setLocale, t, isReady } = useLanguage();
  const switcherRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLanguageSelect = (lang) => {
    setLocale(lang.code);
    setIsOpen(false);
  };

  const currentLang = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0];

  if (!isReady) {
    return (
      <div className={styles.switcher}>
        <button className={styles.trigger} disabled>
          <span className={styles.currentFlag}>🇬🇧</span>
          <span className={styles.currentName}>EN</span>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.switcher} ref={switcherRef}>
      <button
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
      >
        <span className={styles.currentFlag}>{currentLang.flag}</span>
        <span className={styles.currentName}>{currentLang.code.toUpperCase()}</span>
        <svg
          className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}
          width="10" height="10" viewBox="0 0 10 10" fill="none"
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={`${styles.dropdown} ${isOpen ? styles.dropdownOpen : ''}`}>
        <div className={styles.dropdownHeader}>
          <span className={styles.dropdownTitle}>🌍 {t('language.select')}</span>
        </div>
        <div className={styles.langGrid}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`${styles.langOption} ${currentLang.code === lang.code ? styles.langOptionActive : ''}`}
              onClick={() => handleLanguageSelect(lang)}
            >
              <span className={styles.langFlag}>{lang.flag}</span>
              <div className={styles.langInfo}>
                <span className={styles.langName}>{lang.name}</span>
              </div>
              {currentLang.code === lang.code && (
                <svg className={styles.checkIcon} width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
