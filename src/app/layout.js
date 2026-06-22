import "./globals.css";
import SplashScreen from "@/components/SplashScreen";
import LocaleProvider from "@/components/LocaleProvider";
import ThemeProvider from "@/components/ThemeProvider";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import ErrorBoundary from "@/components/ErrorBoundary";
import ToastProvider from "@/components/Toast";
import SkipToContent from "@/components/SkipToContent";
import { getSeoMetadata } from "@/lib/seo";
import { LanguageProvider } from "@/context/LanguageContext";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import GlobalBackground from "@/components/GlobalBackground";


const RTL_LOCALES = ['ar'];

function getDirection(locale) {
  return RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
}

export async function generateMetadata({ params }) {
  const locale = params?.locale || 'en';
  return getSeoMetadata(locale);
}

export default function RootLayout({ children, params }) {
  const locale = params?.locale || 'en';
  const dir = getDirection(locale);

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet" />
        <link rel="alternate" hrefLang="en" href="https://orluxus.com/" />
        <link rel="alternate" hrefLang="ar" href="https://orluxus.com/ar/" />
        <link rel="alternate" hrefLang="x-default" href="https://orluxus.com/" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#d97706" />
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
          <ThemeProvider>
            <SkipToContent />
            <SplashScreen />
            <LocaleProvider />
            <ServiceWorkerRegistrar />
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
            <WhatsAppFloatingButton />
          </ThemeProvider>
          <ToastProvider />
        </LanguageProvider>
      </body>
    </html>
  );
}

