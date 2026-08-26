'use client';

import { useState, useEffect, useCallback } from 'react';

// Module-level cache so we don't fetch on every component mount
let _cache = null;
let _promise = null;

async function fetchSettings(retries = 2) {
  if (_cache) return _cache;
  if (_promise) return _promise;

  _promise = (async () => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const r = await fetch('/api/settings', { cache: 'no-store' });
        if (r.ok) {
          const data = await r.json();
          _cache = data;
          _promise = null;
          return data;
        }
      } catch (e) {
        if (attempt < retries) {
          await new Promise(res => setTimeout(res, 500 * (attempt + 1)));
        }
      }
    }
    _promise = null;
    return {};
  })();

  return _promise;
}

// Call this anywhere to invalidate cache (after admin saves)
export function invalidateSettingsCache() {
  _cache = null;
}

/**
 * Returns settings loaded from Firebase via /api/settings.
 * Falls back to empty object while loading.
 */
export function useSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (_cache) {
      setSettings(_cache);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchSettings().then(data => {
      setSettings(data || {});
      setLoading(false);
    });
  }, []);

  const reload = useCallback(async () => {
    _cache = null;
    _promise = null;
    const data = await fetchSettings();
    setSettings(data);
  }, []);

  return { settings, loading, reload };
}

/**
 * Get a bilingual policy text based on locale.
 * Checks the DB field first (arField / enField), falls back to messages.js body via t().
 *
 * @param {object} settings - from useSettings()
 * @param {string} arField  - DB field name for Arabic, e.g. 'visionAr' or 'vision'
 * @param {string} enField  - DB field name for English, e.g. 'visionEn'
 * @param {string} locale   - current locale
 * @param {function} t      - translation function
 * @param {string} msgKey   - messages.js key, e.g. 'footer.visionBody'
 * @returns {string}
 */
export function getPolicyText(settings, arField, enField, locale, t, msgKey) {
  if (!settings) settings = {};

  // Normalize locale key for DB property lookup (e.g. 'De', 'Fr', 'Es', 'It', 'Ru', 'Tr', 'Zh', 'Ja')
  const localeSuffix = locale ? (locale.charAt(0).toUpperCase() + locale.slice(1).toLowerCase()) : 'En';
  const customFieldForLocale = arField ? arField.replace(/Ar$/, '') + localeSuffix : null;

  // 1. If custom DB text exists specifically for current locale
  if (locale === 'ar' && settings[arField]) return settings[arField];
  if (locale === 'en' && settings[enField]) return settings[enField];
  if (customFieldForLocale && settings[customFieldForLocale]) return settings[customFieldForLocale];

  // 2. Return admin custom text (English first, then Arabic) so <TranslatedText> translates it dynamically
  if (settings[enField]) return settings[enField];
  if (settings[arField]) return settings[arField];

  // 3. Fallback: try messages.js if no custom DB text exists
  if (msgKey && typeof t === 'function') {
    const translated = t(msgKey);
    if (translated && translated !== msgKey) return translated;
  }

  return '';
}
