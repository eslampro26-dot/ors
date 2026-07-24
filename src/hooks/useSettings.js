'use client';

import { useState, useEffect, useCallback } from 'react';

// Module-level cache so we don't fetch on every component mount
let _cache = null;
let _promise = null;

async function fetchSettings() {
  if (_cache) return _cache;
  if (_promise) return _promise;

  _promise = fetch('/api/settings', { cache: 'no-store' })
    .then(r => r.ok ? r.json() : {})
    .then(data => { _cache = data; _promise = null; return data; })
    .catch(() => { _promise = null; return {}; });

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
  const [settings, setSettings] = useState(_cache || {});
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    if (_cache) {
      setSettings(_cache);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchSettings().then(data => {
      setSettings(data);
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
  // 1. If locale is Arabic and custom text is set in DB, use it
  if (locale === 'ar' && settings?.[arField]) return settings[arField];
  
  // 2. If locale is English and custom text is set in DB, use it
  if (locale === 'en' && settings?.[enField]) return settings[enField];

  // 3. For all 10 languages: try messages.js translation key first if available
  if (msgKey && typeof t === 'function') {
    const translated = t(msgKey);
    if (translated && translated !== msgKey) return translated;
  }

  // 4. Fallback to DB fields if msgKey is not present or untranslated
  if (settings?.[enField]) return settings[enField];
  if (settings?.[arField]) return settings[arField];

  return '';
}
