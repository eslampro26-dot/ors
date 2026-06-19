'use client';

import { useState, useEffect, use } from 'react';
import { internalPackages, getLocalizedPackage, getTripTiers } from '@/lib/data';
import { getPackages } from '@/lib/db';
import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import { notFound } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function PackagePage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { locale, t, isReady } = useLanguage();
  const pkg = internalPackages.find(p => p.id === id);

  if (!pkg) {
    notFound();
  }

  const [items, setItems] = useState([]);
  
  // Track selected tier per package item
  const [selectedTiers, setSelectedTiers] = useState({});

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const data = await getPackages(id);
        setItems(data || []);
        
        const initialTiers = {};
        (data || []).forEach(item => {
          initialTiers[item.id] = 'economy';
        });
        setSelectedTiers(initialTiers);
      } catch (err) {
        console.error('Error loading package items:', err);
      }
    };
    loadPackages();
  }, [id]);

  const handleTierSelect = (itemId, tierId) => {
    setSelectedTiers(prev => ({
      ...prev,
      [itemId]: tierId
    }));
  };

  const locPkg = getLocalizedPackage(pkg, locale);

  if (!isReady) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading Package...</div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '4rem', background: 'var(--bg-primary)' }}>
      <Navbar />
      
      {/* Package Hero */}
      <div style={{
        paddingTop: 'calc(var(--nav-height) + 4rem)',
        paddingBottom: '4rem',
        textAlign: 'center',
        background: 'var(--gradient-hero)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div className="container animate-fade-in-up">
          <div className="badge badge-coral" style={{ marginBottom: '1rem', letterSpacing: '1px' }}>EGYPT DOMESTIC PACKAGE</div>
          <h1 className="section-title" style={{ fontSize: '2.8rem' }}>{locPkg.name}</h1>
          <p className="section-subtitle">{locPkg.description}</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexDirection: locale === 'ar' ? 'row-reverse' : 'row' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '800' }}>{t('common.availableOffers')}</h2>
          <span className="badge badge-ocean">{t('common.activeSlots', { active: items.length })}</span>
        </div>

        {items.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 'var(--space-xl)'
          }}>
            {items.map((item, idx) => {
              const currentTierId = selectedTiers[item.id] || 'economy';
              const tiers = getTripTiers(item);
              const activeTier = tiers.find(t => t.id === currentTierId) || tiers[0];
              
              return (
                <div key={item.id} className="glass-card stagger-children" style={{ 
                  padding: 'var(--space-xl)', 
                  overflow: 'hidden', 
                  animationDelay: `${idx * 0.1}s`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-md)',
                  textAlign: locale === 'ar' ? 'right' : 'left'
                }}>
                  {/* Title */}
                  <div style={{ flex: 1, textAlign: locale === 'ar' ? 'right' : 'left' }}>
                    <h3 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)', fontWeight: '800', marginBottom: '4px' }}>
                      {locale === 'ar' ? item.titleAr : (item.titleEn || item.titleAr)}
                    </h3>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                      {locale === 'ar' ? (item.titleEn || '') : item.titleAr}
                    </span>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.7, textAlign: locale === 'ar' ? 'right' : 'left' }}>
                      {item.description}
                    </p>
                  )}

                  {/* Tier Switcher Buttons */}
                  <div style={{
                    display: 'flex',
                    background: 'var(--bg-tertiary)',
                    padding: '4px',
                    borderRadius: '12px',
                    gap: '4px',
                    direction: 'ltr'
                  }}>
                    {tiers.map(tier => {
                      const isSelected = tier.id === currentTierId;
                      let icon = '🥉';
                      let badgeColor = 'rgba(205, 127, 50, 0.15)';
                      let textColor = '#cd7f32';
                      
                      if (tier.id === 'business') {
                        icon = '🥈';
                        badgeColor = 'rgba(149, 165, 166, 0.15)';
                        textColor = '#7f8c8d';
                      } else if (tier.id === 'vip') {
                        icon = '🥇';
                        badgeColor = 'rgba(243, 156, 18, 0.15)';
                        textColor = '#f39c12';
                      }

                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => handleTierSelect(item.id, tier.id)}
                          style={{
                            flex: 1,
                            padding: '6px 4px',
                            borderRadius: '8px',
                            fontSize: '0.72rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '2px',
                            transition: 'all 0.2s ease',
                            background: isSelected ? badgeColor : 'transparent',
                            color: isSelected ? textColor : 'var(--text-tertiary)',
                            border: isSelected ? `1px solid ${textColor}40` : '1px solid transparent',
                            boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
                          }}
                        >
                          <span>{icon}</span>
                          <span>{tier.names[locale] || tier.names.en}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Tier Description */}
                  <p style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.4',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    textAlign: locale === 'ar' ? 'right' : 'left'
                  }}>
                    {activeTier.descriptions[locale] || activeTier.descriptions.en}
                  </p>

                  {/* Price & Duration */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    background: 'var(--bg-tertiary)',
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    flexDirection: locale === 'ar' ? 'row-reverse' : 'row'
                  }}>
                    <div style={{ textAlign: locale === 'ar' ? 'right' : 'left' }}>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>{t('common.from')}</span>
                      <div style={{ fontFamily: 'var(--font-en)', fontWeight: '800', color: 'var(--gold-600)', fontSize: 'var(--font-size-2xl)' }}>
                        {item.currency || '€'}{activeTier.price}
                      </div>
                    </div>
                    <div style={{ textAlign: locale === 'ar' ? 'left' : 'right' }}>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>Duration</span>
                      <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: 'var(--font-size-sm)' }}>
                        ⏱️ {item.duration || 'Not specified'}
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', flexDirection: locale === 'ar' ? 'row-reverse' : 'row' }}>
                    <span>⭐ {item.rating || '5.0'} ({item.reviews || '1'} reviews)</span>
                  </div>

                  {/* Book Button */}
                  <Link 
                    href={`/checkout?tripId=${item.id}&price=${activeTier.price}&titleAr=${encodeURIComponent(item.titleAr + ' - ' + activeTier.names.ar)}&titleEn=${encodeURIComponent((item.titleEn || item.titleAr) + ' - ' + activeTier.names.en)}&type=package`}
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: 'auto', display: 'inline-flex', justifyContent: 'center' }}
                  >
                    {t('common.bookNow')}
                  </Link>
                </div>
              );
            })}

            {/* Empty Slots */}
            {Array.from({ length: Math.max(0, 20 - items.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="glass-card" style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                padding: 'var(--space-2xl)',
                borderStyle: 'dashed',
                opacity: 0.35,
                minHeight: '280px'
              }}>
                <span style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-tertiary)' }}>+</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t('common.emptySlot', { num: items.length + i + 1 })}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>{t('common.noTours')}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{t('common.noToursDesc')}</p>
          </div>
        )}
      </div>
    </main>
  );
}
