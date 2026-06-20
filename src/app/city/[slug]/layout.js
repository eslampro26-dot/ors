import { cities } from '@/lib/data';
import { getCitySeoMetadata } from '@/lib/seo-city';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const city = cities.find(c => c.slug === slug);
  if (!city) return {};

  // Try to infer locale from the URL (Next.js doesn't pass it directly in app router without i18n routing)
  // Default to English; Arabic handled via /ar route
  const locale = 'en';

  const meta = getCitySeoMetadata(slug, locale);
  if (!meta) {
    // Fallback: generate from city data if no custom SEO defined
    return {
      title: `${city.nameEn} Tours & Trips 2025 | ORLUXUS`,
      description: city.descriptionEn?.slice(0, 160) || `Discover the best tours and activities in ${city.nameEn} with ORLUXUS.`,
      robots: { index: true, follow: true },
    };
  }

  return meta;
}

// Re-export to make this a proper layout
export default function CityLayout({ children }) {
  return children;
}
