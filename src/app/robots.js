export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/agent/',
        '/orluxus-management/',
        '/checkout/',
        '/booking-confirmation/',
        '/api/'
      ],
    },
    sitemap: 'https://www.orluxus.com/sitemap.xml',
  };
}
