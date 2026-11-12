'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const TEXTS = {
  ar: {
    title: 'تطبيق ORLUXUS',
    subtitle: 'ثبّت التطبيق على هاتفك لتجربة أسرع وأسهل لحجز رحلاتك',
    tag: '⚡ تطبيق خفيف وسريع',
    rating: '4.9 ★★★★★ (تطبيق معتمد)',
    installBtn: '📲 تثبيت التطبيق الآن',
    dismissBtn: 'لاحقاً',
    installedMsg: '✅ تم تثبيت التطبيق بنجاح!',
    iosTitle: '📱 لتثبيت التطبيق على آيفون:',
    iosStep1: '1. اضغط على زر المشاركة',
    iosStep1Icon: '⎋',
    iosStep1Desc: 'في أسفل شاشة Safari',
    iosStep2: '2. اختر "إضافة إلى الشاشة الرئيسية"',
    iosStep2Icon: '➕',
    iosStep2Desc: 'مرر للأسفل في القائمة',
    iosStep3: '3. اضغط "إضافة" في الأعلى',
    iosStep3Icon: '✓',
    iosStep3Desc: 'سيظهر التطبيق على شاشتك',
    androidFallback: '📋 لتثبيت التطبيق:',
    androidStep1: '1. اضغط على قائمة المتصفح (⋮) في الأعلى',
    androidStep2: '2. اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"',
    androidStep3: '3. اضغط "تثبيت" للتأكيد',
  },
  en: {
    title: 'ORLUXUS App',
    subtitle: 'Install the app on your device for faster booking & exclusive access',
    tag: '⚡ Fast & Lightweight PWA',
    rating: '4.9 ★★★★★ (Verified App)',
    installBtn: '📲 Install App Now',
    dismissBtn: 'Not Now',
    installedMsg: '✅ App installed successfully!',
    iosTitle: '📱 To install on iPhone / iPad:',
    iosStep1: '1. Tap the Share button',
    iosStep1Icon: '⎋',
    iosStep1Desc: 'at the bottom of Safari',
    iosStep2: '2. Select "Add to Home Screen"',
    iosStep2Icon: '➕',
    iosStep2Desc: 'scroll down in the menu',
    iosStep3: '3. Tap "Add" at the top right',
    iosStep3Icon: '✓',
    iosStep3Desc: 'The app will appear on your home screen',
    androidFallback: '📋 To install the app:',
    androidStep1: '1. Tap the browser menu (⋮) at the top',
    androidStep2: '2. Select "Install app" or "Add to Home screen"',
    androidStep3: '3. Tap "Install" to confirm',
  },
  de: {
    title: 'ORLUXUS App',
    subtitle: 'Installieren Sie die App für ein schnelleres Buchungserlebnis',
    tag: '⚡ Schnell & Leicht',
    rating: '4.9 ★★★★★',
    installBtn: '📲 App jetzt installieren',
    dismissBtn: 'Später',
    installedMsg: '✅ App erfolgreich installiert!',
    iosTitle: '📱 Installation auf iPhone:',
    iosStep1: '1. Tippen Sie auf Teilen',
    iosStep1Icon: '⎋',
    iosStep1Desc: 'unten in Safari',
    iosStep2: '2. Wählen Sie "Zum Home-Bildschirm"',
    iosStep2Icon: '➕',
    iosStep2Desc: 'scrollen Sie im Menü',
    iosStep3: '3. Tippen Sie auf "Hinzufügen"',
    iosStep3Icon: '✓',
    iosStep3Desc: 'Die App erscheint auf Ihrem Bildschirm',
    androidFallback: '📋 So installieren Sie die App:',
    androidStep1: '1. Tippen Sie auf das Menü (⋮) oben',
    androidStep2: '2. Wählen Sie "App installieren"',
    androidStep3: '3. Tippen Sie auf "Installieren"',
  },
  fr: {
    title: 'Application ORLUXUS',
    subtitle: 'Installez l\'application pour une réservation plus rapide et fluide',
    tag: '⚡ Rapide & Légère',
    rating: '4.9 ★★★★★',
    installBtn: '📲 Installer l\'application',
    dismissBtn: 'Plus tard',
    installedMsg: '✅ Application installée avec succès !',
    iosTitle: '📱 Installation sur iPhone :',
    iosStep1: '1. Appuyez sur Partager',
    iosStep1Icon: '⎋',
    iosStep1Desc: 'en bas de Safari',
    iosStep2: '2. Sélectionnez "Sur l\'écran d\'accueil"',
    iosStep2Icon: '➕',
    iosStep2Desc: 'faites défiler le menu',
    iosStep3: '3. Appuyez sur "Ajouter"',
    iosStep3Icon: '✓',
    iosStep3Desc: 'L\'app apparaîtra sur votre écran',
    androidFallback: '📋 Pour installer l\'application :',
    androidStep1: '1. Appuyez sur le menu (⋮) en haut',
    androidStep2: '2. Choisissez "Installer l\'application"',
    androidStep3: '3. Appuyez sur "Installer"',
  },
  ru: {
    title: 'Приложение ORLUXUS',
    subtitle: 'Установите приложение для быстрого и удобного бронирования',
    tag: '⚡ Быстро и удобно',
    rating: '4.9 ★★★★★',
    installBtn: '📲 Установить приложение',
    dismissBtn: 'Позже',
    installedMsg: '✅ Приложение успешно установлено!',
    iosTitle: '📱 Установка на iPhone:',
    iosStep1: '1. Нажмите "Поделиться"',
    iosStep1Icon: '⎋',
    iosStep1Desc: 'внизу Safari',
    iosStep2: '2. Выберите "На экран «Домой»"',
    iosStep2Icon: '➕',
    iosStep2Desc: 'прокрутите меню вниз',
    iosStep3: '3. Нажмите "Добавить"',
    iosStep3Icon: '✓',
    iosStep3Desc: 'Приложение появится на экране',
    androidFallback: '📋 Для установки:',
    androidStep1: '1. Нажмите меню (⋮) вверху',
    androidStep2: '2. Выберите "Установить приложение"',
    androidStep3: '3. Нажмите "Установить"',
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
  const [isSafari, setIsSafari] = useState(false);

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

    // 2. Check if user dismissed auto-banner recently (within last 3 days)
    let isRecentlyDismissed = false;
    try {
      const dismissedUntil = localStorage.getItem('orluxus_pwa_dismissed');
      if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
        isRecentlyDismissed = true;
      }
    } catch (e) { /* ignore */ }

    // 3. Detect iOS / Mobile
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isSafariBrowser = /safari/.test(ua) && !/chrome/.test(ua) && !/crios/.test(ua) && !/fxios/.test(ua);
    setIsIOS(isIosDevice);
    setIsSafari(isSafariBrowser);

    // 4. Pick up early-captured beforeinstallprompt if it fired before React hydrated
    let promptFired = false;
    if (window.__deferredPwaPrompt) {
      promptFired = true;
      setDeferredPrompt(window.__deferredPwaPrompt);
      if (!isRecentlyDismissed) {
        setTimeout(() => setIsVisible(true), 2000);
      }
    }

    // 5. Listen for Chrome/Android "beforeinstallprompt"
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      promptFired = true;
      window.__deferredPwaPrompt = e;
      setDeferredPrompt(e);
      if (!isRecentlyDismissed) {
        setTimeout(() => {
          setIsVisible(true);
        }, 2500);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 6. Fallback: if mobile and beforeinstallprompt didn't fire after 3.5 seconds
    const isMobile = /android|iphone|ipad|ipod|mobile/i.test(ua);
    const fallbackTimer = setTimeout(() => {
      if (!isRecentlyDismissed && !promptFired && (isMobile || isIosDevice)) {
        setIsVisible(true);
        if (isIosDevice) {
          setShowIOSGuide(true);
        }
      }
    }, 3500);

    // 7. Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
      window.__deferredPwaPrompt = null;
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // 8. Custom trigger listener (always active even if user dismissed auto-banner before)
    const handleCustomTrigger = async () => {
      const activePrompt = window.__deferredPwaPrompt;
      if (activePrompt) {
        try {
          activePrompt.prompt();
          const { outcome } = await activePrompt.userChoice;
          window.__deferredPwaPrompt = null;
          setDeferredPrompt(null);
          if (outcome === 'accepted') {
            setIsVisible(false);
            setIsInstalled(true);
            return;
          }
        } catch (err) {
          console.error('PWA install error:', err);
        }
      }
      // Show banner with guide open immediately so user always sees actionable steps
      setIsVisible(true);
      if (isIosDevice) {
        setShowIOSGuide(true);
        setShowAndroidTip(false);
      } else {
        setShowAndroidTip(true);
        setShowIOSGuide(false);
      }
    };
    window.addEventListener('open-pwa-install', handleCustomTrigger);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('open-pwa-install', handleCustomTrigger);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    const activePrompt = deferredPrompt || (typeof window !== 'undefined' ? window.__deferredPwaPrompt : null);
    if (activePrompt) {
      // Native Chrome/Android installation prompt
      try {
        activePrompt.prompt();
        const { outcome } = await activePrompt.userChoice;
        if (outcome === 'accepted') {
          setIsVisible(false);
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
        if (typeof window !== 'undefined') window.__deferredPwaPrompt = null;
      } catch (err) {
        console.error('PWA install error:', err);
        setShowAndroidTip(true);
      }
    } else if (isIOS) {
      setShowIOSGuide((prev) => !prev);
      setShowAndroidTip(false);
    } else {
      setShowAndroidTip((prev) => !prev);
      setShowIOSGuide(false);
    }
  }, [deferredPrompt, isIOS]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    // Dismiss for 3 days
    const threeDays = Date.now() + 3 * 24 * 60 * 60 * 1000;
    try {
      localStorage.setItem('orluxus_pwa_dismissed', String(threeDays));
    } catch (e) {
      // ignore
    }
  }, []);

  if (!isVisible || isInstalled) return null;

  const stepBoxStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    background: 'rgba(255, 255, 255, 0.04)',
    borderRadius: '8px',
    marginBottom: '6px',
  };

  const stepIconStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'rgba(201, 162, 39, 0.2)',
    border: '1px solid rgba(201, 162, 39, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    flexShrink: 0,
  };

  const stepTextStyle = {
    flex: 1,
    fontSize: '0.78rem',
    color: '#e5e7eb',
    lineHeight: 1.4,
  };

  const stepTitleStyle = {
    fontWeight: '700',
    color: '#fff',
    display: 'block',
  };

  const stepDescStyle = {
    color: 'rgba(255, 255, 255, 0.6)',
    display: 'block',
    fontSize: '0.72rem',
  };

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
        background: 'rgba(10, 14, 26, 0.96)',
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
            width={56}
            height={56}
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

      {/* iOS Instructions — Step by Step visual guide */}
      {showIOSGuide && (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(201, 162, 39, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '12px',
          }}
        >
          <div style={{ fontWeight: '700', color: '#d4aa30', marginBottom: '8px', fontSize: '0.82rem' }}>
            {t.iosTitle}
          </div>
          
          <div style={stepBoxStyle}>
            <div style={stepIconStyle}>{t.iosStep1Icon}</div>
            <div style={stepTextStyle}>
              <span style={stepTitleStyle}>{t.iosStep1}</span>
              <span style={stepDescStyle}>{t.iosStep1Desc}</span>
            </div>
          </div>

          <div style={stepBoxStyle}>
            <div style={stepIconStyle}>{t.iosStep2Icon}</div>
            <div style={stepTextStyle}>
              <span style={stepTitleStyle}>{t.iosStep2}</span>
              <span style={stepDescStyle}>{t.iosStep2Desc}</span>
            </div>
          </div>

          <div style={{...stepBoxStyle, marginBottom: 0}}>
            <div style={stepIconStyle}>{t.iosStep3Icon}</div>
            <div style={stepTextStyle}>
              <span style={stepTitleStyle}>{t.iosStep3}</span>
              <span style={stepDescStyle}>{t.iosStep3Desc}</span>
            </div>
          </div>
        </div>
      )}

      {/* Android/Desktop Browser Menu — Step by Step guide */}
      {showAndroidTip && (
        <div
          style={{
            background: 'rgba(201, 162, 39, 0.08)',
            border: '1px solid rgba(201, 162, 39, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '12px',
          }}
        >
          <div style={{ fontWeight: '700', color: '#d4aa30', marginBottom: '8px', fontSize: '0.82rem' }}>
            {t.androidFallback}
          </div>
          
          <div style={{ fontSize: '0.78rem', color: '#fef3c7', lineHeight: 1.6 }}>
            <div style={{ marginBottom: '4px' }}>{t.androidStep1}</div>
            <div style={{ marginBottom: '4px' }}>{t.androidStep2}</div>
            <div>{t.androidStep3}</div>
          </div>
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
