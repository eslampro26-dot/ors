import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { internalPackages } from '@/lib/data';

export const dynamic = 'force-dynamic'; // Never statically generate — Firebase needs a live request
export const revalidate = 0; // Always fresh at request time

export async function GET() {
  const SITE_URL = 'https://orluxus.com';
  
  let items = [];

  // 1. Add static packages as starting feed items
  internalPackages.forEach(pkg => {
    items.push({
      title: pkg.nameEn || 'Egypt Tour Package',
      link: `${SITE_URL}/packages/${pkg.id}`,
      description: pkg.descriptionEn || 'Luxury Egypt Tour Package with premium services.',
      pubDate: new Date('2026-07-24T12:00:00Z').toUTCString(),
      guid: `pkg-${pkg.id}`
    });
  });

  // 2. Fetch packages from Firestore
  try {
    const packagesSnap = await getDocs(collection(db, 'packages'));
    packagesSnap.forEach((docSnap) => {
      const pkgData = docSnap.data();
      const pkgId = pkgData.pkgId || pkgData.id || docSnap.id;
      items.push({
        title: pkgData.nameEn || pkgData.nameAr || 'Egypt Luxury Package',
        link: `${SITE_URL}/packages/${pkgId}`,
        description: pkgData.descriptionEn || pkgData.descriptionAr || 'Premium tour packages in Egypt.',
        pubDate: pkgData.updatedAt ? new Date(pkgData.updatedAt).toUTCString() : new Date().toUTCString(),
        guid: `pkg-${pkgId}`
      });
    });
  } catch (err) {
    console.warn('[rss] Failed to load packages:', err.message);
  }

  // 3. Fetch trips from Firestore
  try {
    const tripsSnap = await getDocs(collection(db, 'trips'));
    tripsSnap.forEach((docSnap) => {
      const tripData = docSnap.data();
      const tripId = tripData.id || docSnap.id;
      const slug = tripData.slug || '';
      const category = tripData.category || '';
      if (slug && category) {
        items.push({
          title: tripData.titleEn || tripData.titleAr || 'Egypt Tour Excursion',
          link: `${SITE_URL}/city/${slug}/${category}`,
          description: tripData.descriptionEn || tripData.descriptionAr || 'Exclusive marine tours, safaris and excursions.',
          pubDate: tripData.updatedAt ? new Date(tripData.updatedAt).toUTCString() : new Date().toUTCString(),
          guid: `trip-${tripId}`
        });
      }
    });
  } catch (err) {
    console.warn('[rss] Failed to load trips:', err.message);
  }

  // Generate XML
  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>ORLUXUS | Premium Egypt Travel &amp; Luxury Excursions</title>
    <link>${SITE_URL}</link>
    <description>Discover premium marine trips, desert safaris, and unforgettable Egypt tours with a family-first luxury experience.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${items.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <guid isPermaLink="false">${item.guid}</guid>
      <pubDate>${item.pubDate}</pubDate>
      <description><![CDATA[${item.description}]]></description>
    </item>`).join('')}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600'
    }
  });
}
