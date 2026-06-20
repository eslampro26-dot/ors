import { cities, internalPackages } from '@/lib/data';

export default async function sitemap() {
  const SITE_URL = 'https://orluxus.com';
  
  const entries = [];
  
  // Helper to add localized entries
  const addPage = (path, priority = 0.5) => {
    // 1. English (Default)
    entries.push({
      url: `${SITE_URL}${path === '' ? '/' : path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority,
    });
    // 2. Arabic
    entries.push({
      url: `${SITE_URL}/ar${path === '' ? '/' : path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority,
    });
  };

  // Static core routes
  addPage('', 1.0); // Home page
  addPage('/our-story', 0.8);
  addPage('/reviews', 0.8);
  addPage('/entertainment', 0.7);

  // Dynamic City and Category routes
  cities.forEach((city) => {
    addPage(`/city/${city.slug}`, 0.9);
    
    city.categories.forEach((cat) => {
      addPage(`/city/${city.slug}/${cat.id}`, 0.8);
    });
  });

  // Dynamic Package routes
  internalPackages.forEach((pkg) => {
    addPage(`/packages/${pkg.id}`, 0.9);
  });

  return entries;
}
