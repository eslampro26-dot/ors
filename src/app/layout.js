import "./globals.css";
import SplashScreen from "@/components/SplashScreen";
import LocaleProvider from "@/components/LocaleProvider";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import ErrorBoundary from "@/components/ErrorBoundary";
import ToastProvider from "@/components/Toast";
import SkipToContent from "@/components/SkipToContent";
import { getSeoMetadata } from "@/lib/seo";
import { LanguageProvider } from "@/context/LanguageContext";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import GlobalBackground from "@/components/GlobalBackground";
import { Playfair_Display, Inter, Poppins, Tajawal } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700', '800', '900'],
  variable: '--font-tajawal',
  display: 'swap',
});

const RTL_LOCALES = ['ar'];

function getDirection(locale) {
  return RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 0.25,
  maximumScale: 5,
  userScalable: true,
};

export async function generateMetadata({ params }) {
  const locale = params?.locale || 'en';
  return getSeoMetadata(locale);
}

export default function RootLayout({ children, params }) {
  const locale = params?.locale || 'en';
  const dir = getDirection(locale);

  return (
    <html lang={locale} dir={dir} className={`${playfair.variable} ${inter.variable} ${poppins.variable} ${tajawal.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=0.25, maximum-scale=5.0, user-scalable=yes" />
        <link rel="alternate" hrefLang="en" href="https://orluxus.com/" />
        <link rel="alternate" hrefLang="ar" href="https://orluxus.com/ar/" />
        <link rel="alternate" hrefLang="x-default" href="https://orluxus.com/" />
        <link rel="alternate" type="application/rss+xml" href="https://orluxus.com/rss.xml" title="ORLUXUS RSS Feed" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#d97706" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon-32x32.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TravelAgency",
              "name": "ORLUXUS",
              "url": "https://orluxus.com",
              "logo": "https://orluxus.com/logo_gold_full.png",
              "image": "https://orluxus.com/logo_gold_full.png",
              "description": locale === 'ar' 
                ? "أورلوكسوس - اكتشف الرحلات البحرية الفاخرة والسفاري الصحراوية وجولات مصر الاستثنائية بروح عائلية."
                : "ORLUXUS - Discover premium marine trips, desert safaris, and unforgettable Egypt tours with a family-first experience.",
              "telephone": "+20100000000",
              "email": "info@orluxus.com",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Sharm El Sheikh",
                "addressRegion": "South Sinai",
                "addressCountry": "EG"
              },
              "sameAs": [
                "https://facebook.com/orluxus",
                "https://www.tiktok.com/@orluxus",
                "https://www.instagram.com/orluxus"
              ]
            })
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <GlobalBackground />
        <LanguageProvider>
          <SkipToContent />
          <SplashScreen />
          <LocaleProvider />
          <ServiceWorkerRegistrar />
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <WhatsAppFloatingButton />
          <ToastProvider />
        </LanguageProvider>
      </body>
    </html>
  );
}

