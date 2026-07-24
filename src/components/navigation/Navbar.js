'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { cities, internalPackages, getLocalizedCity, getLocalizedPackage, getCategoryName } from '@/lib/data';
import styles from './Navbar.module.css';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import { useLanguage } from '@/context/LanguageContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef(null);
  const { locale, t, isReady } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDropdownToggle = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // Transparent Luxury Vector Logo
  const Logo = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, filter: 'drop-shadow(0 2px 8px rgba(201,162,39,0.3))' }}>
        <circle cx="20" cy="20" r="18.5" stroke="url(#gold-gradient)" strokeWidth="2.5" fill="none" />
        <path d="M20 7L24 16L33 20L24 24L20 33L16 24L7 20L16 16L20 7Z" fill="url(#gold-gradient)" />
        <defs>
          <linearGradient id="gold-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F59E0B" />
            <stop offset="0.5" stopColor="#FCD34D" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>
        </defs>
      </svg>
      <span className={styles.logoTextString}>ORLUXUS</span>
    </div>
  );

  if (!isReady) {
    return (
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            <Logo />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav ref={navRef} className={`${styles.navbar} ${isScrolled ? styles.scrolled : styles.transparent}`}>
      <div className={styles.navContainer}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <div className={`${styles.navLinks} ${mobileOpen ? styles.navLinksOpen : ''}`}>
          {/* 1. Home */}
          <Link href="/" className={styles.navLink} onClick={() => setMobileOpen(false)}>
            {t('nav.home')}
          </Link>

          {/* 2. Internal Packages Dropdown */}
          <div className={styles.dropdown}>
            <button
              className={`${styles.navLink} ${styles.dropdownTrigger} ${activeDropdown === 'packages' ? styles.active : ''}`}
              onClick={() => handleDropdownToggle('packages')}
            >
              <span>{t('nav.egyptPackages')}</span>
              <svg className={`${styles.chevron} ${activeDropdown === 'packages' ? styles.chevronUp : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className={`${styles.megaDropdown} ${activeDropdown === 'packages' ? styles.megaDropdownOpen : ''}`}>
              <div className={styles.megaHeader}>
                <div>
                  <h3 className={styles.megaTitle}>{t('nav.egyptPackages')}</h3>
                  <p className={styles.megaDesc}>{t('nav.egyptPackagesDesc')}</p>
                </div>
              </div>
              <div className={styles.megaGrid}>
                {internalPackages.map((pkg) => {
                  const locPkg = getLocalizedPackage(pkg, locale);
                  return (
                    <Link
                      key={pkg.id}
                      href={`/packages/${pkg.id}`}
                      className={styles.megaItem}
                      onClick={() => { setActiveDropdown(null); setMobileOpen(false); }}
                    >
                      <div>
                        <span className={styles.megaItemName}>{locPkg.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. City Dropdowns */}
          {cities.map((city) => {
            const locCity = getLocalizedCity(city, locale);
            return (
              <div key={city.id} className={styles.dropdown}>
                <button
                  className={`${styles.navLink} ${styles.dropdownTrigger} ${activeDropdown === city.id ? styles.active : ''}`}
                  onClick={() => handleDropdownToggle(city.id)}
                >
                  <span>{locCity.name}</span>
                  <svg className={`${styles.chevron} ${activeDropdown === city.id ? styles.chevronUp : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className={`${styles.megaDropdown} ${activeDropdown === city.id ? styles.megaDropdownOpen : ''}`}>
                  <div className={styles.megaHeader}>
                    <div>
                      <h3 className={styles.megaTitle}>{locCity.name}</h3>
                    </div>
                  </div>
                  <div className={styles.megaGrid}>
                    {city.categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/city/${city.slug}/${cat.id}`}
                        className={styles.megaItem}
                        onClick={() => { setActiveDropdown(null); setMobileOpen(false); }}
                      >
                        <div>
                          <span className={styles.megaItemName}>{getCategoryName(cat.id, locale)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* 4. Entertainment */}
          <Link href="/entertainment" className={styles.navLink} onClick={() => setMobileOpen(false)}>
            {t('nav.entertainment')}
          </Link>

          {/* 5. Booking Confirmation */}
          <Link href="/booking-confirmation" className={styles.navLink} onClick={() => setMobileOpen(false)}>
            {t('nav.myBooking')}
          </Link>
        </div>

        {/* Right Header Actions (Language Switcher, Theme, Mobile Toggle) - Always visible at top */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 60 }}>
          <LanguageSwitcher onLanguageChange={() => setMobileOpen(false)} />
          <ThemeToggle />
          <button className={styles.mobileToggle} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            <span className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && <div className={styles.overlay} onClick={() => setMobileOpen(false)} />}
    </nav>
  );
}
