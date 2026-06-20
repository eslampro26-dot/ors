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

  // Inline SVG golden compass logo - always visible on any background
  const LogoIcon = () => (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      {/* Outer ring */}
      <circle cx="50" cy="50" r="44" stroke="url(#goldGrad)" strokeWidth="3" fill="none" opacity="0.7"/>
      {/* Wave / ocean */}
      <path d="M20 62 Q32 55 44 62 Q56 69 68 62 Q80 55 90 62" stroke="url(#goldGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M15 70 Q27 63 39 70 Q51 77 63 70 Q75 63 87 70" stroke="url(#goldGrad)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
      {/* Compass needle - north */}
      <path d="M50 18 L56 50 L50 45 L44 50 Z" fill="url(#goldGrad)"/>
      {/* Compass needle - south */}
      <path d="M50 82 L56 50 L50 55 L44 50 Z" fill="url(#goldGrad)" opacity="0.5"/>
      {/* Center dot */}
      <circle cx="50" cy="50" r="4" fill="url(#goldGrad)"/>
      {/* N letter */}
      <text x="50" y="14" textAnchor="middle" fill="#D97706" fontSize="10" fontWeight="800" fontFamily="Inter,sans-serif">N</text>
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24"/>
          <stop offset="50%" stopColor="#F59E0B"/>
          <stop offset="100%" stopColor="#D97706"/>
        </linearGradient>
      </defs>
    </svg>
  );

  if (!isReady) {
    return (
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            <LogoIcon />
            <span className={styles.logoMain}>ORLUXUS</span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav ref={navRef} className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.navContainer}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <LogoIcon />
          <span className={styles.logoMain}>ORLUXUS</span>
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
                  <p className={styles.megaDesc}>Complete internal vacation packages including hotel accommodations, flights, and transfers.</p>
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
                      <p className={styles.megaDesc}>{locCity.description}</p>
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

          {/* Language Switcher */}
          <LanguageSwitcher onLanguageChange={() => setMobileOpen(false)} />

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>

        {/* Mobile Toggle */}
        <button className={styles.mobileToggle} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          <span className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && <div className={styles.overlay} onClick={() => setMobileOpen(false)} />}
    </nav>
  );
}
