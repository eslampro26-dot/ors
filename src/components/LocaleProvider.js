'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SUPPORTED_LOCALES, RTL_LOCALES } from '@/lib/i18n';

function detectLocaleFromPath(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  if (SUPPORTED_LOCALES.includes(firstSegment)) {
    return firstSegment;
  }
  // Check for cookie
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/NEXT_LOCALE=([^;]*)/);
    if (match && SUPPORTED_LOCALES.includes(match[1])) {
      return match[1];
    }
  }
  // Check for localStorage
  if (typeof window !== 'undefined') {
    const savedLocale = localStorage.getItem('orluxus_locale');
    if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
      return savedLocale;
    }
  }
  return 'en';
}

export default function LocaleProvider() {
  const pathname = usePathname();
  const locale = detectLocaleFromPath(pathname);

  useEffect(() => {
    const direction = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
    const fontFamily = RTL_LOCALES.includes(locale)
      ? "var(--font-ar)"
      : "var(--font-en)";

    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
    document.documentElement.dataset.scrollBehavior = 'smooth';
    document.documentElement.dataset.locale = locale;
    document.body.style.direction = direction;
    document.body.style.fontFamily = fontFamily;

    // Set locale cookie for server-side detection
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  }, [locale]);

  return null;
}
