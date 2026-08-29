import { cities, internalPackages } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap() {
  const SITE_URL = 'https://orluxus.com';
  const urlMap = new Map();
  
  // Helper to add localized entries
  const addPage = (path, priority = 0.5, lastMod = new Date(), changeFrequency = 'weekly') => {
    const locales = ['', '/ar', '/de', '/fr', '/es', '/it', '/ru', '/tr'];
    locales.forEach((loc) => {
      const cleanPath = path === '' ? '/' : (path.startsWith('/') ? path : `/${path}`);
      const fullUrl = `${SITE_URL}${loc}${cleanPath === '/' ? '' : cleanPath}`;
      const finalUrl = fullUrl.endsWith('/') && fullUrl !== `${SITE_URL}/` && !fullUrl.endsWith('.xml') ? fullUrl.slice(0, -1) : fullUrl;
      
      // Store in map to prevent any duplicate URLs
      urlMap.set(finalUrl, {
        url: finalUrl,
        lastModified: lastMod,
        changeFrequency: path === '' ? 'daily' : changeFrequency,
        priority,
      });
    });
  };

  // 1. Static Core Routes
  addPage('', 1.0, new Date(), 'daily');
  addPage('/our-story', 0.8, new Date(), 'weekly');
  addPage('/reviews', 0.8, new Date(), 'weekly');
  addPage('/entertainment', 0.8, new Date(), 'weekly');

  // 2. City Destination Pages and Categories
  cities.forEach((city) => {
    addPage(`/city/${city.slug}`, 0.9, new Date(), 'weekly');
    
    // Dedicated city tour pages
    addPage(`/city/${city.slug}/tours`, 0.85, new Date(), 'weekly');
    
    if (city.categories && Array.isArray(city.categories)) {
      city.categories.forEach((cat) => {
        addPage(`/city/${city.slug}/${cat.id}`, 0.8, new Date(), 'weekly');
      });
    }
  });

  // Dedicated specialized tour landing pages
  const specificTours = ['cairo', 'luxor', 'sharm-el-sheikh', 'hurghada'];
  specificTours.forEach((tourCity) => {
    addPage(`/city/${tourCity}/tours`, 0.85, new Date(), 'weekly');
  });

  // 3. Static Packages from Lib Data
  internalPackages.forEach((pkg) => {
    if (pkg.id) {
      addPage(`/packages/${pkg.id}`, 0.9, new Date(), 'weekly');
    }
  });

  // 4. Dynamic Live Packages from Firestore
  try {
    const packagesSnap = await getDocs(collection(db, 'packages'));
    packagesSnap.forEach((docSnap) => {
      const pkgData = docSnap.data();
      const pkgId = pkgData.pkgId || pkgData.id || docSnap.id;
      if (pkgId) {
        addPage(`/packages/${pkgId}`, 0.9, pkgData.updatedAt ? new Date(pkgData.updatedAt) : new Date(), 'weekly');
      }
    });
  } catch (err) {
    console.warn('[sitemap] Failed to fetch dynamic packages from Firestore:', err.message);
  }

  // 5. Dynamic Live Trips & Categories from Firestore
  try {
    const tripsSnap = await getDocs(collection(db, 'trips'));
    tripsSnap.forEach((docSnap) => {
      const tripData = docSnap.data();
      const slug = tripData.slug || tripData.citySlug || '';
      const category = tripData.category || tripData.catId || '';
      if (slug && category) {
        addPage(`/city/${slug}/${category}`, 0.8, tripData.updatedAt ? new Date(tripData.updatedAt) : new Date(), 'weekly');
      }
    });
  } catch (err) {
    console.warn('[sitemap] Failed to fetch dynamic trips from Firestore:', err.message);
  }

  return Array.from(urlMap.values());
}
