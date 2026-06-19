/**
 * i18n Core Utilities
 * Central helpers for locale detection, direction, and translation
 */

export const SUPPORTED_LOCALES = ['en', 'ar', 'de', 'fr', 'es', 'it', 'ru', 'tr', 'zh', 'ja'];
export const DEFAULT_LOCALE = 'en';
export const RTL_LOCALES = ['ar'];

/**
 * Check if a locale is RTL
 */
export function isRTL(locale) {
  return RTL_LOCALES.includes(locale);
}

/**
 * Get direction for a locale
 */
export function getDirection(locale) {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

/**
 * Get font family CSS variable for a locale
 */
export function getFontFamily(locale) {
  return isRTL(locale) ? 'var(--font-ar)' : 'var(--font-en)';
}

/**
 * Detect locale from pathname (e.g., /ar/packages → 'ar')
 */
export function detectLocaleFromPath(pathname) {
  if (!pathname) return DEFAULT_LOCALE;
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  if (SUPPORTED_LOCALES.includes(firstSegment)) {
    return firstSegment;
  }
  return DEFAULT_LOCALE;
}

/**
 * Add locale prefix to a path
 * e.g., ('/packages', 'ar') → '/ar/packages'
 */
export function localizePath(path, locale) {
  const cleanPath = removeLocalePrefix(path);
  if (locale === DEFAULT_LOCALE) {
    return cleanPath || '/';
  }
  return `/${locale}${cleanPath}`;
}

/**
 * Remove locale prefix from a path
 * e.g., '/ar/packages' → '/packages'
 */
export function removeLocalePrefix(path) {
  if (!path) return '/';
  const segments = path.split('/').filter(Boolean);
  if (SUPPORTED_LOCALES.includes(segments[0])) {
    segments.shift();
  }
  return '/' + segments.join('/');
}

/**
 * Switch locale for current path
 * e.g., ('/ar/packages', 'en') → '/packages'
 * e.g., ('/packages', 'ar') → '/ar/packages'
 */
export function switchLocalePath(currentPath, newLocale) {
  const cleanPath = removeLocalePrefix(currentPath);
  return localizePath(cleanPath, newLocale);
}

/**
 * Get locale display info
 */
export const LOCALE_INFO = {
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇪🇬', dir: 'rtl' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
  ru: { name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  tr: { name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳', dir: 'ltr' },
  ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr' },
};

/**
 * Get locale info object
 */
export function getLocaleInfo(locale) {
  return LOCALE_INFO[locale] || LOCALE_INFO[DEFAULT_LOCALE];
}
