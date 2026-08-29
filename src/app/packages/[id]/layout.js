import { internalPackages } from '@/lib/data';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://orluxus.com';

async function fetchPackage(id) {
  // 1. Check static data first
  const staticPkg = internalPackages.find(p => String(p.id) === String(id));
  if (staticPkg) return staticPkg;

  // 2. Check Firestore
  try {
    const snap = await getDoc(doc(db, 'packages', String(id)));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
  } catch (e) {
    console.warn('[Package Layout] Error loading package for metadata:', e.message);
  }
  return null;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const pkg = await fetchPackage(id);

  if (!pkg) {
    return {
      title: 'Luxury Egypt Tour Package | ORLUXUS',
      description: 'Discover luxury Egypt travel packages with ORLUXUS. Unforgettable experiences, 5-star service and VIP excursions.',
      robots: { index: true, follow: true }
    };
  }

  const title = `${pkg.nameEn || pkg.nameAr || 'Luxury Package'} | ORLUXUS Egypt Tours`;
  const description = (pkg.descriptionEn || pkg.descriptionAr || `Explore ${pkg.nameEn || 'Egypt'} with ORLUXUS. All-inclusive luxury package with VIP transfers, guided tours, and premium experiences.`).slice(0, 160);
  const image = pkg.image || `${SITE_URL}/images/packages/luxury-egypt.jpg`;
  const canonical = `${SITE_URL}/packages/${id}`;

  return {
    title,
    description,
    keywords: `${pkg.nameEn || ''}, ${pkg.nameAr || ''}, Egypt vacation package, luxury Egypt tour, Red Sea package, Cairo Luxor package, ORLUXUS`,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical,
      languages: {
        en: `${SITE_URL}/packages/${id}`,
        ar: `${SITE_URL}/ar/packages/${id}`,
        'x-default': `${SITE_URL}/packages/${id}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'ORLUXUS',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PackageLayout({ children, params }) {
  const { id } = await params;
  const pkg = await fetchPackage(id);

  const priceValue = pkg?.price || 150;
  const currency = pkg?.currency || 'EUR';
  const pkgName = pkg?.nameEn || pkg?.nameAr || 'ORLUXUS Tour Package';
  const pkgDesc = pkg?.descriptionEn || pkg?.descriptionAr || 'Premium tour experience in Egypt';

  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: pkgName,
    description: pkgDesc,
    image: pkg?.image ? [pkg.image] : [`${SITE_URL}/logo_gold_full.png`],
    offers: {
      '@type': 'Offer',
      price: priceValue,
      priceCurrency: currency === '€' ? 'EUR' : currency,
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/packages/${id}`,
      seller: {
        '@type': 'TravelAgency',
        name: 'ORLUXUS'
      }
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: pkg?.reviews || '12',
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
