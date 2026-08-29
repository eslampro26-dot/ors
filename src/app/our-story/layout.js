const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://orluxus.com';

export const metadata = {
  title: 'Our Story & Heritage | ORLUXUS Luxury Travel Egypt',
  description: 'Learn about ORLUXUS - Egypt’s premier family-focused luxury travel agency. Our mission, values, and dedication to unforgettable Red Sea and cultural excursions.',
  keywords: 'About ORLUXUS, Egypt luxury travel company, Red Sea excursions agency, Sharm El Sheikh luxury tours, ORLUXUS story',
  alternates: {
    canonical: `${SITE_URL}/our-story`,
    languages: {
      en: `${SITE_URL}/our-story`,
      ar: `${SITE_URL}/ar/our-story`,
      'x-default': `${SITE_URL}/our-story`,
    }
  },
  openGraph: {
    title: 'Our Story & Heritage | ORLUXUS Luxury Travel Egypt',
    description: 'Learn about ORLUXUS - Egypt’s premier family-focused luxury travel agency. Our mission, values, and dedication to unforgettable Red Sea and cultural excursions.',
    url: `${SITE_URL}/our-story`,
    siteName: 'ORLUXUS',
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: 'ORLUXUS Our Story' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Story & Heritage | ORLUXUS Luxury Travel Egypt',
    description: 'Learn about ORLUXUS - Egypt’s premier luxury travel agency.',
    images: [`${SITE_URL}/og-image.jpg`],
  }
};

export default function OurStoryLayout({ children }) {
  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About ORLUXUS',
    url: `${SITE_URL}/our-story`,
    description: 'ORLUXUS provides authentic, VIP, and family-first travel experiences across Egypt.',
    publisher: {
      '@type': 'TravelAgency',
      name: 'ORLUXUS',
      url: SITE_URL,
      logo: `${SITE_URL}/logo_gold_full.png`
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />
      {children}
    </>
  );
}
