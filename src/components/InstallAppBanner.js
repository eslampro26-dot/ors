'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const TEXTS = {
  ar: {
    title: 'تطبيق ORLUXUS',
    subtitle: 'ثبّت التطبيق على جهازك لتجربة أسرع وأسهل لحجز رحلاتك',
    tag: '⚡ تطبيق خفيف وسريع',
    rating: '4.9 ★★★★★ (تطبيق معتمد)',
    installBtn: '📲 تثبيت التطبيق الآن',
    installDirectBtn: '⚡ تثبيت مباشر بضغطة واحدة',
    dismissBtn: 'لاحقاً',
    tabAndroid: '🤖 أندرويد',
    tabIos: '🍎 آيفون',
    tabDesktop: '💻 كمبيوتر',
    iosNoteNonSafari: '⚠️ ملاحظة: على آيفون، افتح الموقع في متصفح Safari ليظهر لك خيار التثبيت.',
    iosTitle: '📱 خطوات التثبيت على آيفون / آيباد:',
    iosStep1: '1. اضغط على زر المشاركة (Share)',
    iosStep1Icon: '⎋',
    iosStep1Desc: 'في أسفل متصفح Safari',
    iosStep2: '2. اختر "إضافة إلى الشاشة الرئيسية"',
    iosStep2Icon: '➕',
    iosStep2Desc: 'مرر للأسفل في القائمة',
    iosStep3: '3. اضغط "إضافة" في الأعلى',
    iosStep3Icon: '✓',
    iosStep3Desc: 'سيظهر التطبيق على شاشتك مباشرة',
    androidFallback: '📋 التثبيت على أندرويد:',
    androidStep1: '1. تأكد أنك تتصفح من Google Chrome (وليس متصفح واتساب/فيسبوك)',
    androidStep2: '2. اضغط على قائمة (⋮) واختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"',
    androidStep3: '3. اضغط "تثبيت" ليظهر التطبيق فوراً',
    desktopFallback: '💻 التثبيت على الكمبيوتر:',
    desktopStep1: '1. اضغط على أيقونة التثبيت (⊕) في شريط العنوان أعلى المتصفح',
    desktopStep2: '2. أو من قائمة المتصفح (⋮) اختر "تثبيت ORLUXUS"',
    desktopStep3: '3. اضغط "تثبيت" لتشغيله كتطبيق مستقل',
  },
  en: {
    title: 'ORLUXUS App',
    subtitle: 'Install the app on your device for faster booking & exclusive access',
    tag: '⚡ Fast & Lightweight PWA',
    rating: '4.9 ★★★★★ (Verified App)',
    installBtn: '📲 Install App Now',
    installDirectBtn: '⚡ One-Tap Direct Install',
    dismissBtn: 'Not Now',
    tabAndroid: '🤖 Android',
    tabIos: '🍎 iPhone',
    tabDesktop: '💻 Desktop',
    iosNoteNonSafari: '⚠️ Note: On iPhone, please open this link in Safari to install the app.',
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
    androidFallback: '📋 Install on Android:',
    androidStep1: '1. Open in Google Chrome (not inside Facebook/WhatsApp browser)',
    androidStep2: '2. Tap menu (⋮) and select "Install app" or "Add to Home screen"',
    androidStep3: '3. Tap "Install" to confirm',
    desktopFallback: '💻 Install on Desktop:',
    desktopStep1: '1. Click the Install icon (⊕) in the address bar',
    desktopStep2: '2. Or open browser menu (⋮) → "Install ORLUXUS"',
    desktopStep3: '3. Click "Install" to launch as a standalone app',
  },
  de: {
    title: 'ORLUXUS App',
    subtitle: 'Installieren Sie die App für ein schnelleres Buchungserlebnis',
    tag: '⚡ Schnell & Leicht',
    rating: '4.9 ★★★★★',
    installBtn: '📲 App jetzt installieren',
    installDirectBtn: '⚡ Direkt installieren',
    dismissBtn: 'Später',
    tabAndroid: '🤖 Android',
    tabIos: '🍎 iPhone',
    tabDesktop: '💻 Desktop',
    iosNoteNonSafari: '⚠️ Hinweis: Auf dem iPhone bitte in Safari öffnen.',
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
    androidStep1: '1. In Google Chrome öffnen',
    androidStep2: '2. Menü (⋮) → "App installieren" wählen',
    androidStep3: '3. Auf "Installieren" tippen',
    desktopFallback: '💻 Auf dem Desktop installieren:',
    desktopStep1: '1. Auf das Installieren-Symbol (⊕) in der Adressleiste klicken',
    desktopStep2: '2. Oder Menü (⋮) → "ORLUXUS installieren"',
    desktopStep3: '3. Auf "Installieren" klicken',
  },
  fr: {
    title: 'Application ORLUXUS',
    subtitle: 'Installez l\'application pour une réservation plus rapide et fluide',
    tag: '⚡ Rapide & Légère',
    rating: '4.9 ★★★★★',
    installBtn: '📲 Installer l\'application',
    installDirectBtn: '⚡ Installation directe',
    dismissBtn: 'Plus tard',
    tabAndroid: '🤖 Android',
    tabIos: '🍎 iPhone',
    tabDesktop: '💻 PC / Mac',
    iosNoteNonSafari: '⚠️ Remarque : Sur iPhone, ouvrez le lien dans Safari.',
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
    androidFallback: '📋 Pour installer sur Android :',
    androidStep1: '1. Ouvrir dans Google Chrome',
    androidStep2: '2. Menu (⋮) → "Installer l\'application"',
    androidStep3: '3. Appuyez sur "Installer"',
    desktopFallback: '💻 Installer sur ordinateur :',
    desktopStep1: '1. Cliquez sur l\'icône d\'installation (⊕) dans la barre d\'adresse',
    desktopStep2: '2. Ou menu (⋮) → "Installer ORLUXUS"',
    desktopStep3: '3. Cliquez sur "Installer"',
  },
  ru: {
    title: 'Приложение ORLUXUS',
    subtitle: 'Установите приложение для быстрого и удобного бронирования',
    tag: '⚡ Быстро и удобно',
    rating: '4.9 ★★★★★',
    installBtn: '📲 Установить приложение',
    installDirectBtn: '⚡ Установить в 1 клик',
    dismissBtn: 'Позже',
    tabAndroid: '🤖 Android',
    tabIos: '🍎 iPhone',
    tabDesktop: '💻 ПК',
    iosNoteNonSafari: '⚠️ На iPhone откройте сайт в браузере Safari.',
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
    androidFallback: '📋 Для установки на Android:',
    androidStep1: '1. Откройте сайт в Google Chrome',
    androidStep2: '2. Меню (⋮) → "Установить приложение"',
    androidStep3: '3. Нажмите "Установить"',
    desktopFallback: '💻 Установка на компьютер:',
    desktopStep1: '1. Нажмите значок установки (⊕) в адресной строке',
    desktopStep2: '2. Или меню (⋮) → "Установить ORLUXUS"',
    desktopStep3: '3. Нажмите "Установить"',
  },
};

export default function InstallAppBanner() {
  const { locale } = useLanguage();
  const t = TEXTS[locale] || TEXTS.en;
  const isRtl = locale === 'ar';

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [platformTab, setPlatformTab] = useState('android'); // 'android' | 'ios' | 'desktop'
  const [showGuide, setShowGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIosNonSafari, setIsIosNonSafari] = useState(false);

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

    // 3. Detect device platform
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isAndroidDevice = /android/.test(ua);
    const isSafariBrowser = /safari/.test(ua) && !/chrome/.test(ua) && !/crios/.test(ua) && !/fxios/.test(ua);

    if (isIosDevice) {
      setPlatformTab('ios');
      setIsIosNonSafari(!isSafariBrowser);
    } else if (isAndroidDevice) {
      setPlatformTab('android');
    } else {
      setPlatformTab('desktop');
    }

    // 4. Pick up early-captured beforeinstallprompt if it fired before React hydrated
    let promptFired = false;
    if (window.__deferredPwaPrompt) {
      promptFired = true;
      setDeferredPrompt(window.__deferredPwaPrompt);
      if (!isRecentlyDismissed) {
        setTimeout(() => setIsVisible(true), 2000);
      }
    }

    // 5. Listen for Chrome/Android/Desktop "beforeinstallprompt"
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
          setShowGuide(true);
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

    // 8. Custom trigger listener from Navbar button (always active)
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
      setIsVisible(true);
      setShowGuide(true);
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
        setShowGuide(true);
      }
    } else {
      setShowGuide((prev) => !prev);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    const threeDays = Date.now() + 3 * 24 * 60 * 60 * 1000;
    try {
      localStorage.setItem('orluxus_pwa_dismissed', String(threeDays));
    } catch (e) {
      // ignore
    }
  }, []);

  if (!isVisible || isInstalled) return null;

  const hasDirectPrompt = Boolean(deferredPrompt || (typeof window !== 'undefined' && window.__deferredPwaPrompt));

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

  const tabBtnStyle = (active) => ({
    flex: 1,
    padding: '6px 8px',
    fontSize: '0.75rem',
    fontWeight: active ? '700' : '500',
    borderRadius: '8px',
    border: active ? '1px solid rgba(201, 162, 39, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
    background: active ? 'rgba(201, 162, 39, 0.2)' : 'rgba(255, 255, 255, 0.04)',
    color: active ? '#f59e0b' : 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

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
      >
        ✕
      </button>

      {/* Main Header: Icon + Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
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
          />
        </div>

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

      {/* Platform Guide Tabs & Instructions */}
      {showGuide && (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(201, 162, 39, 0.3)',
            borderRadius: '12px',
            padding: '10px 12px',
            marginBottom: '12px',
          }}
        >
          {/* Platform Switcher */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            <button type="button" onClick={() => setPlatformTab('android')} style={tabBtnStyle(platformTab === 'android')}>
              {t.tabAndroid}
            </button>
            <button type="button" onClick={() => setPlatformTab('ios')} style={tabBtnStyle(platformTab === 'ios')}>
              {t.tabIos}
            </button>
            <button type="button" onClick={() => setPlatformTab('desktop')} style={tabBtnStyle(platformTab === 'desktop')}>
              {t.tabDesktop}
            </button>
          </div>

          {platformTab === 'ios' && (
            <div>
              {isIosNonSafari && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '0.74rem',
                  color: '#fde68a',
                  marginBottom: '8px',
                }}>
                  {t.iosNoteNonSafari}
                </div>
              )}
              <div style={{ fontWeight: '700', color: '#d4aa30', marginBottom: '6px', fontSize: '0.8rem' }}>
                {t.iosTitle}
              </div>
              <div style={stepBoxStyle}>
                <div style={stepIconStyle}>{t.iosStep1Icon}</div>
                <div style={{ fontSize: '0.76rem', color: '#e5e7eb' }}>
                  <strong style={{ color: '#fff', display: 'block' }}>{t.iosStep1}</strong>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>{t.iosStep1Desc}</span>
                </div>
              </div>
              <div style={stepBoxStyle}>
                <div style={stepIconStyle}>{t.iosStep2Icon}</div>
                <div style={{ fontSize: '0.76rem', color: '#e5e7eb' }}>
                  <strong style={{ color: '#fff', display: 'block' }}>{t.iosStep2}</strong>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>{t.iosStep2Desc}</span>
                </div>
              </div>
              <div style={{ ...stepBoxStyle, marginBottom: 0 }}>
                <div style={stepIconStyle}>{t.iosStep3Icon}</div>
                <div style={{ fontSize: '0.76rem', color: '#e5e7eb' }}>
                  <strong style={{ color: '#fff', display: 'block' }}>{t.iosStep3}</strong>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>{t.iosStep3Desc}</span>
                </div>
              </div>
            </div>
          )}

          {platformTab === 'android' && (
            <div style={{ fontSize: '0.78rem', color: '#fef3c7', lineHeight: 1.55 }}>
              <div style={{ fontWeight: '700', color: '#d4aa30', marginBottom: '6px' }}>{t.androidFallback}</div>
              <div style={{ marginBottom: '4px' }}>{t.androidStep1}</div>
              <div style={{ marginBottom: '4px' }}>{t.androidStep2}</div>
              <div>{t.androidStep3}</div>
            </div>
          )}

          {platformTab === 'desktop' && (
            <div style={{ fontSize: '0.78rem', color: '#fef3c7', lineHeight: 1.55 }}>
              <div style={{ fontWeight: '700', color: '#d4aa30', marginBottom: '6px' }}>{t.desktopFallback}</div>
              <div style={{ marginBottom: '4px' }}>{t.desktopStep1}</div>
              <div style={{ marginBottom: '4px' }}>{t.desktopStep2}</div>
              <div>{t.desktopStep3}</div>
            </div>
          )}
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
            fontSize: '0.9rem',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(201, 162, 39, 0.4)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          {hasDirectPrompt ? t.installDirectBtn : t.installBtn}
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
        >
          {t.dismissBtn}
        </button>
      </div>
    </aside>
  );
}
