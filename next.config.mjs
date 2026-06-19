/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Source Directory ───
  srcDir: './src',

  // ─── Image Optimization ───
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: '*.firebasestorage.app' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year for CDN
  },

  // ─── CDN & Cache Headers ───
  async headers() {
    return [
      {
        // Static assets: aggressive caching for CDN
        source: '/:path*(\\.ico|\\.png|\\.jpg|\\.jpeg|\\.gif|\\.svg|\\.webp|\\.avif|\\.woff2|\\.woff|\\.ttf|\\.eot)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        // HTML pages: short cache with revalidation
        source: '/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate, s-maxage=3600' },
          { key: 'X-Content-Language', value: 'en, ar' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://www.paypalobjects.com https://apis.google.com https://fonts.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://res.cloudinary.com https://*.googleusercontent.com https://firebasestorage.googleapis.com https://*.firebasestorage.app",
              "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.firebasestorage.app https://www.paypal.com",
              "frame-src https://www.paypal.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // ─── Redirects ───
  async redirects() {
    return [
      {
        source: '/ar',
        destination: '/ar/',
        permanent: true,
      },
    ];
  },

  // ─── Performance Optimizations ───
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  poweredByHeader: false, // Security: remove X-Powered-By
  compress: true, // Enable gzip compression
  reactStrictMode: true,
  productionBrowserSourceMaps: false, // Disable source maps in production for smaller bundle
};

export default nextConfig;
