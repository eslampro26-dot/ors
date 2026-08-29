const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://orluxus.com';

export const metadata = {
  title: 'Guest Reviews & Ratings | ORLUXUS Egypt Tours',
  description: 'Read real verified traveler reviews and testimonials for ORLUXUS luxury tours, private boat trips, desert safaris, and Nile cruises.',
  keywords: 'ORLUXUS reviews, Egypt tour reviews, Sharm El Sheikh trip ratings, Hurghada excursion testimonials, customer feedback',
  alternates: {
    canonical: `${SITE_URL}/reviews`,
    languages: {
      en: `${SITE_URL}/reviews`,
      ar: `${SITE_URL}/ar/reviews`,
      'x-default': `${SITE_URL}/reviews`,
    }
  },
  openGraph: {
    title: 'Guest Reviews & Ratings | ORLUXUS Egypt Tours',
    description: 'Read verified traveler reviews for ORLUXUS luxury tours and excursions in Egypt.',
    url: `${SITE_URL}/reviews`,
    siteName: 'ORLUXUS',
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: 'ORLUXUS Customer Reviews' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guest Reviews & Ratings | ORLUXUS Egypt Tours',
    description: 'Read verified traveler reviews for ORLUXUS luxury tours in Egypt.',
    images: [`${SITE_URL}/og-image.jpg`],
  }
};

export default function ReviewsLayout({ children }) {
  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'ORLUXUS',
    url: SITE_URL,
    image: `${SITE_URL}/logo_gold_full.png`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '148',
      bestRating: '5',
      worstRating: '1'
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
