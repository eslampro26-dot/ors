import { cities, internalPackages } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap() {
  const SITE_URL = 'https://orluxus.com';
  const entries = [];
  
  // Helper to add localized entries
  const addPage = (path, priority = 0.5, lastMod = new Date()) => {
    const locales = ['', '/ar', '/de', '/fr', '/es', '/it', '/ru', '/tr'];
    locales.forEach((loc) => {
      entries.push({
        url: `${SITE_URL}${loc}${path === '' ? '/' : path}`,
        lastModified: lastMod,
        changeFrequency: path === '' ? 'daily' : 'weekly',
        priority,
      });
    });
  };

  // 1. Static Core Routes
  addPage('', 1.0);
  addPage('/our-story', 0.8);
  addPage('/reviews', 0.8);
  addPage('/entertainment', 0.7);

  // 2. Dynamic City and Category Routes
  cities.forEach((city) => {
    addPage(`/city/${city.slug}`, 0.9);
    city.categories.forEach((cat) => {
      addPage(`/city/${city.slug}/${cat.id}`, 0.8);
    });
  });

  // 3. Dynamic Static Packages (Fallbacks)
  internalPackages.forEach((pkg) => {
    addPage(`/packages/${pkg.id}`, 0.9);
  });

  // 4. Dynamic Live Packages from Firestore
  try {
    const packagesSnap = await getDocs(collection(db, 'packages'));
    packagesSnap.forEach((docSnap) => {
      const pkgData = docSnap.data();
      const pkgId = pkgData.pkgId || pkgData.id || docSnap.id;
      if (pkgId && !internalPackages.some(p => p.id === pkgId)) {
        addPage(`/packages/${pkgId}`, 0.9, pkgData.updatedAt ? new Date(pkgData.updatedAt) : new Date());
      }
    });
  } catch (err) {
    console.warn('[sitemap] Failed to fetch dynamic packages from Firestore:', err.message);
  }

  // 5. Dynamic Live Trips from Firestore
  try {
    const tripsSnap = await getDocs(collection(db, 'trips'));
    tripsSnap.forEach((docSnap) => {
      const tripData = docSnap.data();
      const tripId = tripData.id || docSnap.id;
      const slug = tripData.slug || '';
      const category = tripData.category || '';
      if (slug && category) {
        addPage(`/city/${slug}/${category}`, 0.9, tripData.updatedAt ? new Date(tripData.updatedAt) : new Date());
      }
    });
  } catch (err) {
    console.warn('[sitemap] Failed to fetch dynamic trips from Firestore:', err.message);
  }

  return entries;
}
