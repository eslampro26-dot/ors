import { cities } from '@/lib/data';
import { getCategorySeoMetadata } from '@/lib/seo-city';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://orluxus.com';

export async function generateMetadata({ params }) {
  const { slug, category } = await params;
  const city = cities.find(c => c.slug === slug);
  if (!city) return {};

  const locale = 'en';

  const meta = getCategorySeoMetadata(
    slug,
    category,
    city.nameEn,
    city.nameAr,
    locale
  );

  if (!meta) {
    return {
      title: `${city.nameEn} ${category.replace(/-/g, ' ')} | ORLUXUS`,
      description: `Book the best ${category.replace(/-/g, ' ')} in ${city.nameEn} with ORLUXUS. Competitive prices, family-friendly experiences, instant booking.`,
      robots: { index: true, follow: true },
    };
  }

  return meta;
}

export default async function CategoryLayout({ children, params }) {
  const { slug, category } = await params;
  const city = cities.find(c => c.slug === slug);
  const categoryTitle = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

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
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryTitle,
        item: `${SITE_URL}/city/${slug}/${category}`
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
