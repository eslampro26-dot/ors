/**
 * Internationalization formatting utilities
 * Supports Arabic and English locales with proper number/date/currency formatting
 */

/**
 * Format a date value according to locale
 * @param {string|Date} value - Date to format
 * @param {string} locale - Target locale ('en' or 'ar')
 * @param {object} options - Intl.DateTimeFormat options
 */
export function formatDate(value, locale = 'en', options = {}) {
  try {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(new Date(value));
  } catch {
    return value;
  }
}

/**
 * Format a short date (e.g., "Jan 15, 2025" or "١٥ يناير ٢٠٢٥")
 */
export function formatShortDate(value, locale = 'en') {
  return formatDate(value, locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a number according to locale
 * @param {number} value - Number to format
 * @param {string} locale - Target locale
 * @param {object} options - Intl.NumberFormat options
 */
export function formatNumber(value, locale = 'en', options = {}) {
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch {
    return value;
  }
}

/**
 * Format a currency value
 * Defaults to Egyptian Pound (EGP) for Arabic, USD for English
 * @param {number} value - Amount to format
 * @param {string} locale - Target locale
 * @param {string} currency - Currency code (default: EGP)
 */
export function formatCurrency(value, locale = 'en', currency = 'EGP') {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}

/**
 * Format a percentage value
 * @param {number} value - Value between 0 and 1 (or 0-100 based on option)
 * @param {string} locale - Target locale
 */
export function formatPercent(value, locale = 'en') {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      maximumFractionDigits: 1,
    }).format(value);
  } catch {
    return `${value}%`;
  }
}

/**
 * Format a relative time (e.g., "3 days ago", "منذ ٣ أيام")
 * @param {number} value - Numeric value
 * @param {string} unit - Unit: 'second', 'minute', 'hour', 'day', 'week', 'month', 'year'
 * @param {string} locale - Target locale
 */
export function formatRelativeTime(value, unit = 'day', locale = 'en') {
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    return rtf.format(value, unit);
  } catch {
    return `${value} ${unit}${Math.abs(value) !== 1 ? 's' : ''}`;
  }
}

/**
 * Get locale-appropriate digit symbols
 * Arabic locale uses ٠١٢٣٤٥٦٧٨٩
 */
export function localizeDigits(value, locale = 'en') {
  if (locale !== 'ar') return String(value);
  try {
    return String(value).replace(/[0-9]/g, (d) =>
      '٠'.charCodeAt(0) + parseInt(d)
    );
  } catch {
    return String(value);
  }
}
