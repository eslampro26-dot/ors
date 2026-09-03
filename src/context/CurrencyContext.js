'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SUPPORTED_CURRENCIES,
  DEFAULT_EXCHANGE_RATES,
  DEFAULT_CURRENCY,
  convertFromEur,
  calculateEgpSettlement,
  formatDualPrice
} from '@/lib/currency';

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY);
  const [rates, setRates] = useState(DEFAULT_EXCHANGE_RATES);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initialize from localStorage or cookie on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('orluxus_currency');
      if (saved && SUPPORTED_CURRENCIES[saved]) {
        setCurrencyState(saved);
      } else {
        const cookieMatch = document.cookie.match(/orluxus_currency=([^;]*)/);
        if (cookieMatch && SUPPORTED_CURRENCIES[cookieMatch[1]]) {
          setCurrencyState(cookieMatch[1]);
        }
      }
    } catch (e) {
      console.warn('Could not read currency preference:', e);
    }
  }, []);

  // 2. Fetch live exchange rates from API route
  useEffect(() => {
    let isMounted = true;
    async function fetchRates() {
      try {
        const res = await fetch('/api/exchange-rates');
        if (res.ok) {
          const data = await res.json();
          if (data?.rates && isMounted) {
            setRates(data.rates);
          }
        }
      } catch (err) {
        console.warn('Could not fetch exchange rates:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchRates();
    return () => { isMounted = false; };
  }, []);

  // 3. Change Currency Handler
  const setCurrency = useCallback((newCurrency) => {
    if (!SUPPORTED_CURRENCIES[newCurrency]) return;
    setCurrencyState(newCurrency);

    try {
      localStorage.setItem('orluxus_currency', newCurrency);
      document.cookie = `orluxus_currency=${newCurrency}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (e) {
      console.warn('Could not save currency preference:', e);
    }
  }, []);

  // Convert helper
  const convert = useCallback((amountEur) => {
    return convertFromEur(amountEur, currency, rates);
  }, [currency, rates]);

  // Calculate EGP helper
  const getEgpSettlement = useCallback((amount, fromCurrency = currency) => {
    return calculateEgpSettlement(amount, fromCurrency, rates);
  }, [currency, rates]);

  // Dual price formatter helper
  const formatDual = useCallback((amountEur, isAr = false) => {
    return formatDualPrice(amountEur, currency, rates, isAr);
  }, [currency, rates]);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        currencyDetails: SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.EUR,
        supportedCurrencies: SUPPORTED_CURRENCIES,
        rates,
        convert,
        getEgpSettlement,
        formatDual,
        isLoading
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Return safe fallback if rendered outside provider
    return {
      currency: DEFAULT_CURRENCY,
      setCurrency: () => {},
      currencyDetails: SUPPORTED_CURRENCIES.EUR,
      supportedCurrencies: SUPPORTED_CURRENCIES,
      rates: DEFAULT_EXCHANGE_RATES,
      convert: (amt) => Number(amt) || 0,
      getEgpSettlement: (amt) => calculateEgpSettlement(amt, DEFAULT_CURRENCY, DEFAULT_EXCHANGE_RATES),
      formatDual: (amt, isAr) => formatDualPrice(amt, DEFAULT_CURRENCY, DEFAULT_EXCHANGE_RATES, isAr),
      isLoading: false
    };
  }
  return context;
}
