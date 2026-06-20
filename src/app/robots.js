export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/agent/', '/orluxus-management/', '/checkout/'],
    },
    sitemap: 'https://orluxus.com/sitemap.xml',
  };
}
