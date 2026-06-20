import { cities } from '@/lib/data';
import { getCategorySeoMetadata } from '@/lib/seo-city';

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

export default function CategoryLayout({ children }) {
  return children;
}
