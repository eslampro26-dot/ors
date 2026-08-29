import { cities } from '@/lib/data';
import { getCitySeoMetadata } from '@/lib/seo-city';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://orluxus.com';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const city = cities.find(c => c.slug === slug);
  if (!city) return {};

  const locale = 'en';
  const meta = getCitySeoMetadata(slug, locale);
  if (!meta) {
    return {
      title: `${city.nameEn} Tours & Trips | ORLUXUS`,
      description: city.descriptionEn?.slice(0, 160) || `Discover the best tours and activities in ${city.nameEn} with ORLUXUS.`,
      robots: { index: true, follow: true },
    };
  }

  return meta;
}

export default async function CityLayout({ children, params }) {
  const { slug } = await params;
  const city = cities.find(c => c.slug === slug);

  const breadcrumbJson = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: city?.nameEn || slug,
        item: `${SITE_URL}/city/${slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }}
      />
      {children}
    </>
  );
}
