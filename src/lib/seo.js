const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://orluxus.com';

const metadataByLocale = {
  en: {
    title: 'ORLUXUS | Egypt Tours, Red Sea Trips & Luxury Packages',
    description: 'Book the best Egypt tours with ORLUXUS. Snorkeling in Sharm El Sheikh, Hurghada boat trips, Marsa Alam diving, desert safaris, Nile cruises & all-inclusive packages. Family-friendly experiences from €20.',
    keywords: 'Egypt tours, Sharm El Sheikh tours, Hurghada day trips, Marsa Alam diving, Red Sea snorkeling, Egypt travel packages, Tiran Island cruise, Giftun Island excursion, desert safari Egypt, Nile cruise, scuba diving Egypt, things to do in Egypt, Egypt holiday, Red Sea resort, Egypt family trips, ORLUXUS',
    image: `${SITE_URL}/og-image.jpg`,
  },
  ar: {
    title: 'أورلوكسوس | رحلات مصر السياحية والباقات الفاخرة',
    description: 'احجز أفضل رحلات مصر مع أورلوكسوس. سنوركل شرم الشيخ، رحلات الغردقة البحرية، غوص مرسى علم، سفاري الصحراء، كروز النيل وباقات شاملة. رحلات عائلية من 20 يورو.',
    keywords: 'رحلات مصر، رحلات شرم الشيخ، رحلات الغردقة، غوص مرسى علم، سنوركل البحر الأحمر، باقات سياحية مصر، رحلة جزيرة تيران، جزيرة الجفتون، سفاري صحراء، كروز النيل، رحلات عائلية مصر، أورلوكسوس',
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
