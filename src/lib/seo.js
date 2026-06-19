const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://orluxus.com';

const metadataByLocale = {
  en: {
    title: 'ORLUXUS | With A Family Spirit',
    description: 'ORLUXUS - Discover premium marine trips, desert safaris, and unforgettable Egypt tours with a family-first experience.',
    keywords: 'ORLUXUS, Egypt tours, Sharm El Sheikh, Hurghada, Marsa Alam, marine trips, desert safari, travel packages',
    image: `${SITE_URL}/og-image.jpg`,
  },
  ar: {
    title: 'أورلوكسوس | بروح العائلة',
    description: 'أورلوكسوس - اكتشف الرحلات البحرية الفاخرة والسفاري الصحراوية وجولات مصر الاستثنائية بروح عائلية.',
    keywords: 'أورلوكسوس, رحلات مصر, شرم الشيخ, الغردقة, مرسى علم, رحلات بحر, سفاري, باكدج سياحي',
    image: `${SITE_URL}/og-image-ar.jpg`,
  },
};

/**
 * Build canonical URL for a locale
 */
function getCanonicalUrl(locale) {
  return locale === 'en' ? `${SITE_URL}/` : `${SITE_URL}/${locale}/`;
}

/**
 * Generate hreflang alternates for all supported locales
 */
function getHreflangAlternates() {
  const locales = ['en', 'ar'];
  const alternates = {};
  locales.forEach((loc) => {
    alternates[loc] = getCanonicalUrl(loc);
  });
  // x-default points to the default locale
  alternates['x-default'] = getCanonicalUrl('en');
  return alternates;
}

/**
 * Get SEO metadata for a specific locale
 * Compatible with Next.js generateMetadata() API
 */
export function getSeoMetadata(locale = 'en') {
  const data = metadataByLocale[locale] || metadataByLocale.en;
  const canonical = getCanonicalUrl(locale);

  return {
    title: data.title,
    description: data.description,
    keywords: data.keywords,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical,
      languages: getHreflangAlternates(),
    },
    openGraph: {
      title: data.title,
      description: data.description,
      url: canonical,
      siteName: 'ORLUXUS',
      images: [{ url: data.image, alt: data.title, width: 1200, height: 630 }],
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.description,
      images: [data.image],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Generate page-specific SEO metadata
 * Usage: getSeoMetadata('ar', { title: 'Packages', path: '/packages' })
 */
export function getPageSeoMetadata(locale = 'en', overrides = {}) {
  const base = getSeoMetadata(locale);
  const path = overrides.path || '';
  const url = locale === 'en' ? `${SITE_URL}${path}` : `${SITE_URL}/${locale}${path}`;

  return {
    ...base,
    title: overrides.title || base.title,
    description: overrides.description || base.description,
    keywords: overrides.keywords || base.keywords,
    alternates: {
      canonical: url,
      languages: getHreflangAlternates(),
    },
    openGraph: {
      ...base.openGraph,
      title: overrides.title || base.openGraph.title,
      description: overrides.description || base.openGraph.description,
      url,
    },
    twitter: {
      ...base.twitter,
      title: overrides.title || base.twitter.title,
      description: overrides.description || base.twitter.description,
    },
  };
}
