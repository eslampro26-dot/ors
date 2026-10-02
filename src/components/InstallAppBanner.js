'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const TEXTS = {
  ar: {
    title: 'تطبيق ORLUXUS',
    subtitle: 'ثبّت التطبيق على هاتفك لتجربة أسرع وأسهل لحجز رحلاتك',
    tag: '⚡ تطبيق خفيف وسريع',
    rating: '4.9 ★★★★★ (تطبيق معتمد)',
    installBtn: '📲 تثبيت التطبيق الآن',
    dismissBtn: 'لاحقاً',
    installedMsg: 'تم تثبيت التطبيق بنجاح!',
    iosTitle: 'لتثبيت التطبيق على آيفون:',
    iosStep1: '1. اضغط على زر المشاركة (Share ⎋) في أسفل المتصفح',
    iosStep2: '2. مرر للأسفل واختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen ➕)',
    androidFallback: 'اضغط على قائمة المتصفح (⋮) ثم اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"',
  },
  en: {
    title: 'ORLUXUS App',
    subtitle: 'Install the app on your device for faster booking & exclusive access',
    tag: '⚡ Fast & Lightweight PWA',
    rating: '4.9 ★★★★★ (Verified App)',
    installBtn: '📲 Install App Now',
    dismissBtn: 'Not Now',
    installedMsg: 'App installed successfully!',
    iosTitle: 'To install on iPhone / iPad:',
    iosStep1: '1. Tap the Share button (⎋) at the bottom of Safari',
    iosStep2: '2. Scroll down and tap "Add to Home Screen" (➕)',
    androidFallback: 'Tap your browser menu (⋮) and select "Install app" or "Add to Home screen"',
  },
  de: {
    title: 'ORLUXUS App',
    subtitle: 'Installieren Sie die App für ein schnelleres Buchungserlebnis',
    tag: '⚡ Schnell & Leicht',
    rating: '4.9 ★★★★★',
    installBtn: '📲 App jetzt installieren',
    dismissBtn: 'Später',
    installedMsg: 'App erfolgreich installiert!',
    iosTitle: 'Installation auf iPhone:',
    iosStep1: '1. Tippen Sie auf Teilen (⎋) in Safari',
    iosStep2: '2. Wählen Sie "Zum Home-Bildschirm" (➕)',
    androidFallback: 'Tippen Sie auf das Menü (⋮) und wählen Sie "App installieren"',
  },
  fr: {
    title: 'Application ORLUXUS',
    subtitle: 'Installez l\'application pour une réservation plus rapide et fluide',
    tag: '⚡ Rapide & Légère',
    rating: '4.9 ★★★★★',
    installBtn: '📲 Installer l\'application',
    dismissBtn: 'Plus tard',
    installedMsg: 'Application installée avec succès !',
    iosTitle: 'Installation sur iPhone :',
    iosStep1: '1. Appuyez sur Partager (⎋) dans Safari',
    iosStep2: '2. Sélectionnez "Sur l\'écran d\'accueil" (➕)',
    androidFallback: 'Appuyez sur le menu (⋮) et choisissez "Installer l\'application"',
  },
  ru: {
    title: 'Приложение ORLUXUS',
    subtitle: 'Установите приложение для быстрого и удобного бронирования',
    tag: '⚡ Быстро и удобно',
    rating: '4.9 ★★★★★',
    installBtn: '📲 Установить приложение',
    dismissBtn: 'Позже',
    installedMsg: 'Приложение успешно установлено!',
    iosTitle: 'Установка на iPhone:',
    iosStep1: '1. Нажмите "Поделиться" (⎋) в Safari',
    iosStep2: '2. Выберите "На экран «Домой»" (➕)',
    androidFallback: 'Нажмите меню (⋮) и выберите "Установить приложение"',
  },
};

export default function InstallAppBanner() {
  const { locale } = useLanguage();
  const t = TEXTS[locale] || TEXTS.en;
  const isRtl = locale === 'ar';

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidTip, setShowAndroidTip] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check if already running as installed PWA (standalone)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Check if user dismissed prompt recently (within last 3 days)
    const dismissedUntil = localStorage.getItem('orluxus_pwa_dismissed');
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      return;
    }

    // 3. Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIosDevice);

    // 4. Listen for Chrome/Android "beforeinstallprompt"
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show banner after brief delay
      setTimeout(() => {
        setIsVisible(true);
      }, 2500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. If Android / mobile and beforeinstallprompt didn't fire after 4 seconds (e.g. some browsers),
    // show our banner anyway so user can trigger installation
    const isMobile = /android|iphone|ipad|ipod|mobile/i.test(ua);
    const fallbackTimer = setTimeout(() => {
      if (isMobile && !isStandalone) {
        setIsVisible(true);
      }
    }, 3500);

    // 6. Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
      localStorage.setItem('orluxus_pwa_installed', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // 7. Custom trigger listener so any button can open install prompt
    const handleCustomTrigger = () => {
      setIsVisible(true);
    };
    window.addEventListener('open-pwa-install', handleCustomTrigger);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('open-pwa-install', handleCustomTrigger);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Native Android / Chrome installation prompt
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsVisible(false);
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('PWA install error:', err);
      }
    } else if (isIOS) {
      // Toggle iOS instruction guide
      setShowIOSGuide((prev) => !prev);
    } else {
      // Fallback for Android browsers without deferred prompt available
      setShowAndroidTip(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Dismiss for 3 days
    const threeDays = Date.now() + 3 * 24 * 60 * 60 * 1000;
    try {
      localStorage.setItem('orluxus_pwa_dismissed', String(threeDays));
    } catch (e) {
      // ignore
    }
  };

  if (!isVisible || isInstalled) return null;

  return (
    <aside
      aria-label={t.title}
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 24px)',
        maxWidth: '460px',
        zIndex: 99995,
        background: 'rgba(10, 14, 26, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(201, 162, 39, 0.4)',
        borderRadius: '16px',
        padding: '16px 18px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(201, 162, 39, 0.15)',
        animation: 'slideUpBanner 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        fontFamily: isRtl ? 'var(--font-ar, "Cairo", sans-serif)' : 'var(--font-en, sans-serif)',
      }}
    >
      <style>{`
        @keyframes slideUpBanner {
          from {
            opacity: 0;
            transform: translate(-50%, 40px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>

      {/* Close Button */}
      <button
        onClick={handleDismiss}
        aria-label="Close"
        style={{
          position: 'absolute',
          top: '10px',
          left: isRtl ? '12px' : 'auto',
          right: isRtl ? 'auto' : '12px',
          background: 'rgba(255, 255, 255, 0.08)',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.6)',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '1rem',
          lineHeight: 1,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
        }}
      >
        ✕
      </button>

      {/* Main Header: Icon + Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
        {/* App Icon */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: '#0a0e1a',
            border: '2px solid rgba(201, 162, 39, 0.6)',
            boxShadow: '0 4px 15px rgba(201, 162, 39, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <img
            src="/logo_gold_icon.png"
            alt="ORLUXUS"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.innerHTML = '👑';
              e.currentTarget.parentElement.style.fontSize = '2rem';
            }}
          />
        </div>

        {/* Title and Ratings */}
        <div style={{ flex: 1, paddingRight: isRtl ? '0' : '24px', paddingLeft: isRtl ? '24px' : '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#fff', letterSpacing: '0.5px' }}>
              {t.title}
            </h3>
            <span
              style={{
                background: 'rgba(201, 162, 39, 0.2)',
                color: '#d4aa30',
                border: '1px solid rgba(201, 162, 39, 0.4)',
                fontSize: '0.68rem',
                padding: '1px 6px',
                borderRadius: '10px',
                fontWeight: '700',
              }}
            >
              {t.tag}
            </span>
          </div>
          <div style={{ color: '#f59e0b', fontSize: '0.74rem', marginTop: '2px', fontWeight: '600' }}>
            {t.rating}
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.72)', lineHeight: 1.35 }}>
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* iOS Instructions Dropdown */}
      {showIOSGuide && (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(201, 162, 39, 0.3)',
            borderRadius: '10px',
            padding: '10px 12px',
            marginBottom: '12px',
            fontSize: '0.78rem',
            color: '#e5e7eb',
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: '700', color: '#d4aa30', marginBottom: '4px' }}>{t.iosTitle}</div>
          <div>{t.iosStep1}</div>
          <div>{t.iosStep2}</div>
        </div>
      )}

      {/* Android Browser Menu Tip */}
      {showAndroidTip && (
        <div
          style={{
            background: 'rgba(201, 162, 39, 0.1)',
            border: '1px solid rgba(201, 162, 39, 0.3)',
            borderRadius: '10px',
            padding: '10px 12px',
            marginBottom: '12px',
            fontSize: '0.78rem',
            color: '#fef3c7',
            lineHeight: 1.4,
          }}
        >
          💡 {t.androidFallback}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={handleInstallClick}
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #c9a227 0%, #eab308 50%, #ca8a04 100%)',
            color: '#0a0e1a',
            border: 'none',
            borderRadius: '10px',
            padding: '11px 16px',
            fontSize: '0.92rem',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(201, 162, 39, 0.4)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(201, 162, 39, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(201, 162, 39, 0.4)';
          }}
        >
          {t.installBtn}
        </button>

        <button
          onClick={handleDismiss}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            color: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '10px',
            padding: '11px 16px',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
          }}
        >
          {t.dismissBtn}
        </button>
      </div>
    </aside>
  );
}
