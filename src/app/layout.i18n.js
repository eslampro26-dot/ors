import "./globals.css";
import SplashScreen from "@/components/SplashScreen";
import LocaleProvider from "@/components/LocaleProvider";
import { getSeoMetadata } from "@/lib/seo";
import { LanguageProvider } from "@/context/LanguageContext";

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
        <link rel="alternate" hrefLang="en" href="https://orluxus.com/" />
        <link rel="alternate" hrefLang="ar" href="https://orluxus.com/ar/" />
        <link rel="alternate" hrefLang="x-default" href="https://orluxus.com/" />
      </head>
      <body suppressHydrationWarning>
        <LanguageProvider>
          <SplashScreen />
          <LocaleProvider />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}

