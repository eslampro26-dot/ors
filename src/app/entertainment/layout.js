const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://orluxus.com';

export const metadata = {
  title: 'Nightlife, Shows & Entertainment in Egypt | ORLUXUS',
  description: 'Experience top entertainment in Sharm El Sheikh, Hurghada & Cairo. Bedouin dinner shows, beach parties, music clubs, and evening excursions with VIP entry.',
  keywords: 'Egypt nightlife, Sharm El Sheikh evening shows, Hurghada parties, Bedouin dinner show, Fantasia Alf Leila Wa Leila, ORLUXUS entertainment',
  alternates: {
    canonical: `${SITE_URL}/entertainment`,
    languages: {
      en: `${SITE_URL}/entertainment`,
      ar: `${SITE_URL}/ar/entertainment`,
      'x-default': `${SITE_URL}/entertainment`,
    }
  },
  openGraph: {
    title: 'Nightlife, Shows & Entertainment in Egypt | ORLUXUS',
    description: 'Experience top entertainment in Egypt with VIP access and curated evening shows.',
    url: `${SITE_URL}/entertainment`,
    siteName: 'ORLUXUS',
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: 'ORLUXUS Egypt Entertainment' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nightlife, Shows & Entertainment in Egypt | ORLUXUS',
    description: 'Experience top entertainment in Egypt with VIP access.',
    images: [`${SITE_URL}/og-image.jpg`],
  }
};

export default function EntertainmentLayout({ children }) {
  return children;
}
