'use client';

import { useState, useEffect, useRef } from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { useLanguage } from '@/context/LanguageContext';
import styles from './CurrencySwitcher.module.css';

export default function CurrencySwitcher({ onCurrencyChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const { currency, setCurrency, supportedCurrencies, currencyDetails, isLoading } = useCurrency();
  const { locale } = useLanguage();
  const switcherRef = useRef(null);
  const isAr = locale === 'ar';

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

  const handleSelect = (code) => {
    setCurrency(code);
    setIsOpen(false);
    if (onCurrencyChange) {
      onCurrencyChange(code);
    }
  };

  const currencyList = Object.values(supportedCurrencies || {});

  return (
    <div className={styles.switcher} ref={switcherRef}>
      <button
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Currency"
        title={isAr ? 'تغيير العملة' : 'Change Currency'}
      >
        <span className={styles.currentFlag}>{currencyDetails?.flag || '€'}</span>
        <span className={styles.currentCode}>{currencyDetails?.code || 'EUR'}</span>
        <svg
          className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
        >
          <path
            d="M2 3.5L5 6.5L8 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className={`${styles.dropdown} ${isOpen ? styles.dropdownOpen : ''}`}>
        <div className={styles.dropdownHeader}>
          <span className={styles.dropdownTitle}>
            {isAr ? '💱 العملة المعتمدة' : '💱 Select Currency'}
          </span>
        </div>
        <div className={styles.currencyList}>
          {currencyList.map((item) => {
            const isActive = item.code === currency;
            return (
              <button
                key={item.code}
                className={`${styles.currencyOption} ${isActive ? styles.currencyOptionActive : ''}`}
                onClick={() => handleSelect(item.code)}
              >
                <div className={styles.optionLeft}>
                  <span className={styles.optionFlag}>{item.flag}</span>
                  <span className={styles.optionCode}>{item.code}</span>
                  <span className={styles.optionName}>
                    {isAr ? item.nameAr : item.nameEn}
                  </span>
                </div>
                <span className={styles.optionSymbol}>{item.symbol}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
