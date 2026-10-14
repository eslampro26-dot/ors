'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  SUPPORTED_LEGAL_LANGUAGES, 
  getLegalUI, 
  getTermsAndConditions, 
  getCancellationPolicy 
} from '@/lib/legalPoliciesData';

export default function TermsAndCancellationPage() {
  const [currentLang, setCurrentLang] = useState('ar');
  const [activeTab, setActiveTab] = useState('both'); // 'both' | 'terms' | 'cancellation'
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'hotels' | 'restaurants' | 'yachts' | 'tours'

  const langMeta = SUPPORTED_LEGAL_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LEGAL_LANGUAGES[0];
  const isRtl = langMeta.dir === 'rtl';

  const ui = getLegalUI(currentLang);
  const terms = getTermsAndConditions(currentLang);
  const cancellation = getCancellationPolicy(currentLang);

  // Category specific policies based on selected language
  const CATEGORY_POLICIES = {
    hotels: {
      icon: '🏨',
      name: isRtl ? 'الفنادق والمنتجعات' : 'Hotels & Resorts',
      rules: isRtl ? [
        'تسجيل الوصول من الساعة 14:00 وتسجيل المغادرة حتى الساعة 12:00 ظهراً.',
        'الإلغاء المجاني متاح حتى 48 ساعة قبل موعد الوصول المحدد في الحجز.',
        'يُشترط تقديم جواز سفر أو بطاقة هوية وطنية سارية لجميع النزلاء عند تسجيل الوصول.',
        'التأمين المسترد يتبع سياسة الفندق ويُعاد عند المغادرة بعد فحص الغرفة.',
        'الطلبات الخاصة (سرير إضافي، إطلالة معينة) تخضع لتوفر الفندق وقت الوصول.'
      ] : [
        'Check-in is from 14:00 and check-out is until 12:00 noon.',
        'Free cancellation is available up to 48 hours prior to scheduled check-in.',
        'Valid passport or national ID is strictly required for all guests upon check-in.',
        'Security deposit is subject to hotel policy and refunded upon inspection at check-out.',
        'Special requests (extra bed, view) are subject to hotel availability upon arrival.'
      ]
    },
    restaurants: {
      icon: '🍽️',
      name: isRtl ? 'المطاعم والضيافة الفاخرة' : 'Fine Dining & Restaurants',
      rules: isRtl ? [
        'يتم تأكيد طاولة الحجز مع فترة سماح بحد أقصى 20 دقيقة من الموعد المحدد.',
        'الإلغاء أو تعديل عدد الأفراد متاح قبل 6 ساعات من موعد الحجز.',
        'الالتزام بالزي الأنيق (Smart Casual) المعتمد في المطاعم الفاخرة.',
        'يُرجى إخطارنا بأي حساسية طعام مسبقاً عند تأكيد الحجز لضمان سلامتكم.',
        'الحد الأدنى للإنفاق (إن وجد) يتم توضيحه مسبقاً في تفاصيل الحجز.'
      ] : [
        'Table reservation is held with a maximum grace period of 20 minutes.',
        'Cancellation or guest count modification is available up to 6 hours before reservation.',
        'Smart Casual dress code is strictly enforced across partner luxury restaurants.',
        'Please inform us of any food allergies in advance upon booking confirmation.',
        'Minimum charge (if applicable) is clearly stated in the reservation confirmation.'
      ]
    },
    yachts: {
      icon: '⛵',
      name: isRtl ? 'اليخوت والأنشطة البحرية' : 'Luxury Yachts & Marine Tours',
      rules: isRtl ? [
        'تخضع جميع الرحلات البحرية لتصاريح حرس الحدود والأحوال الجوية لسلامتكم.',
        'في حال إلغاء الرحلة بقرار من سلطات الميناء لسوء الأحوال الجوية، يُعاد المبلغ كاملاً 100% فوراً.',
        'الإلغاء المجاني متاح قبل 48 ساعة من موعد انطلاق اليخت.',
        'الالتزام الصارم بتعليمات القبطان وسترات النجاة ومعدات السلامة البحرية.',
        'رسوم المحميات الطبيعية والبيئة مشمولة وفق ما هو موضح في قسيمة الحجز.'
      ] : [
        'All marine trips are strictly subject to Coast Guard permits and sea weather conditions.',
        'If trip is canceled by port authority due to weather, a 100% full refund is issued immediately.',
        'Free cancellation is available up to 48 hours prior to yacht departure.',
        'Strict compliance with the captain’s safety instructions and life jackets is mandatory.',
        'National park and marine sanctuary environmental fees are included as stated on voucher.'
      ]
    },
    tours: {
      icon: '🚗',
      name: isRtl ? 'الجولات والرحلات البرية' : 'Private Tours & Transfers',
      rules: isRtl ? [
        'موعد الاستلام من الفندق محدد بدقة، يرجى التواجد في بهو الفندق قبل 10 دقائق.',
        'الإلغاء المجاني متاح قبل 24 ساعة من موعد بدء الجولة أو النقل الخاص.',
        'السيارات المستخدمة حديثة، مكيفة، ومؤمنة بالكامل مع سائقين معتمدين.',
        'أي تعديل في مسار الرحلة الخاصة يتم بالتنسيق المسبق مع خدمة العملاء.',
        'الأمتعة والأغراض الشخصية تقع تحت مسؤولية الضيف داخل المركبة.'
      ] : [
        'Hotel pickup time is fixed; please be present in the hotel lobby 10 minutes prior.',
        'Free cancellation is available up to 24 hours prior to tour departure or transfer.',
        'All vehicles are modern, air-conditioned, and fully insured with certified drivers.',
        'Any route modification for private tours must be coordinated in advance with support.',
        'Personal belongings remain the guest’s responsibility inside the vehicle.'
      ]
    }
  };

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        backgroundImage: `linear-gradient(180deg, rgba(253, 251, 247, 0.93) 0%, rgba(248, 246, 240, 0.96) 100%), url('/egypt_bg.jpg')`,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#1f2937',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Cairo", "Tajawal", Helvetica, Arial, sans-serif',
        lineHeight: 1.7
      }}
    >
      {/* Top Brand Navigation */}
      <nav className="hide-print" style={{
        padding: '14px 24px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderBottom: '1px solid rgba(201, 162, 39, 0.35)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link href="/" style={{ 
            color: '#8c6a12', 
            textDecoration: 'none', 
            fontWeight: '900', 
            fontSize: '1.35rem', 
            letterSpacing: '1px',
            fontFamily: 'var(--font-en, serif)'
          }}>
            ORLUXUS
          </Link>
          <span style={{ 
            color: '#6b7280', 
            fontSize: '0.85rem',
            fontWeight: '600',
            borderLeft: isRtl ? 'none' : '1px solid #d1d5db',
            borderRight: isRtl ? '1px solid #d1d5db' : 'none',
            paddingLeft: isRtl ? '0' : '12px',
            paddingRight: isRtl ? '12px' : '0'
          }}>
            {ui.portalBadge}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              background: '#ffffff',
              border: '1px solid #d1d5db',
              color: '#374151',
              borderRadius: '8px',
              padding: '7px 16px',
              fontSize: '0.85rem',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            {ui.returnHome}
          </Link>
        </div>
      </nav>

      {/* Language Selector Bar (10 Languages with Flags) */}
      <div className="hide-print" style={{
        background: 'rgba(255, 255, 255, 0.88)',
        borderBottom: '1px solid rgba(201, 162, 39, 0.25)',
        padding: '10px 20px',
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <span style={{ 
            fontSize: '0.85rem', 
            fontWeight: '700', 
            color: '#8c6a12',
            marginRight: isRtl ? '0' : '6px',
            marginLeft: isRtl ? '6px' : '0'
          }}>
            🌐 {ui.selectLanguage}
          </span>
          {SUPPORTED_LEGAL_LANGUAGES.map((lang) => {
            const isActive = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setCurrentLang(lang.code)}
                style={{
                  background: isActive ? 'linear-gradient(135deg, #c9a227, #aa841a)' : '#ffffff',
                  color: isActive ? '#ffffff' : '#374151',
                  border: isActive ? '1px solid #aa841a' : '1px solid #e5e7eb',
                  borderRadius: '20px',
                  padding: '5px 12px',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isActive ? '0 2px 8px rgba(201, 162, 39, 0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 20px 60px 20px' }}>
        
        {/* Hero Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(201, 162, 39, 0.12)',
            color: '#8c6a12',
            padding: '5px 16px',
            borderRadius: '20px',
            fontSize: '0.82rem',
            fontWeight: '700',
            marginBottom: '12px',
            border: '1px solid rgba(201, 162, 39, 0.35)'
          }}>
            <span>⚖️</span>
            <span>{ui.portalBadge}</span>
          </div>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 3.2vw, 2.3rem)',
            fontWeight: '900',
            color: '#111827',
            margin: '0 0 10px 0',
            letterSpacing: '-0.5px'
          }}>
            {ui.pageTitle}
          </h1>
          <p style={{
            maxWidth: '820px',
            margin: '0 auto',
            color: '#4b5563',
            fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)',
            lineHeight: '1.6'
          }}>
            {ui.pageSubtitle}
          </p>
        </div>

        {/* Egyptian Law Precedence Warning Banner */}
        <div style={{
          background: 'rgba(254, 243, 199, 0.9)',
          border: '1px solid #f59e0b',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '25px',
          fontSize: '0.86rem',
          color: '#92400e',
          lineHeight: '1.65',
          backdropFilter: 'blur(6px)',
          boxShadow: '0 2px 10px rgba(245, 158, 11, 0.08)'
        }}>
          {ui.prevailWarning}
        </div>

        {/* Category Specific Filter Tabs */}
        <div className="hide-print" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '12px 16px',
          borderRadius: '14px',
          border: '1px solid rgba(201, 162, 39, 0.3)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          marginBottom: '20px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '0.82rem', fontWeight: '800', color: '#8c6a12', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {isRtl ? '📌 فرز الشروط والسياسات بحسب نوع الخدمة' : '📌 Filter Policies by Service Category'}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {[
              { id: 'all', icon: '🌐', label: isRtl ? 'جميع الخدمات' : 'All Services' },
              { id: 'hotels', icon: '🏨', label: isRtl ? 'الفنادق والمنتجعات' : 'Hotels & Resorts' },
              { id: 'restaurants', icon: '🍽️', label: isRtl ? 'المطاعم الفاخرة' : 'Fine Dining' },
              { id: 'yachts', icon: '⛵', label: isRtl ? 'اليخوت والأنشطة البحرية' : 'Yachts & Marine' },
              { id: 'tours', icon: '🚗', label: isRtl ? 'الجولات والرحلات البرية' : 'Tours & Transfers' },
            ].map(cat => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: isActive ? 'linear-gradient(135deg, #c9a227 0%, #aa841a 100%)' : '#f9fafb',
                    color: isActive ? '#ffffff' : '#374151',
                    border: isActive ? '1px solid #8c6a12' : '1px solid #e5e7eb',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: isActive ? '0 2px 8px rgba(201, 162, 39, 0.35)' : 'none'
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Display Category Specific Highlight Card when a specific category is selected */}
        {activeCategory !== 'all' && CATEGORY_POLICIES[activeCategory] && (
          <div style={{
            background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
            border: '2px solid #f59e0b',
            borderRadius: '14px',
            padding: '20px 24px',
            marginBottom: '26px',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.12)'
          }}>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '1.15rem',
              fontWeight: '900',
              color: '#92400e',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>{CATEGORY_POLICIES[activeCategory].icon}</span>
              <span>{isRtl ? `الشروط والأحكام الخاصة بـ: ${CATEGORY_POLICIES[activeCategory].name}` : `Specific Terms for: ${CATEGORY_POLICIES[activeCategory].name}`}</span>
            </h3>
            <ul style={{
              margin: 0,
              padding: isRtl ? '0 1.4rem 0 0' : '0 0 0 1.4rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {CATEGORY_POLICIES[activeCategory].rules.map((rule, rIdx) => (
                <li key={rIdx} style={{ fontSize: '0.9rem', color: '#78350f', lineHeight: '1.7', fontWeight: '500' }}>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* View Switcher Tabs */}
        <div className="hide-print" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '26px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveTab('both')}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === 'both' ? '#c9a227' : '#ffffff',
              color: activeTab === 'both' ? '#ffffff' : '#374151',
              border: activeTab === 'both' ? '1px solid #aa841a' : '1px solid #d1d5db',
              boxShadow: activeTab === 'both' ? '0 4px 14px rgba(201, 162, 39, 0.25)' : '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            {ui.tabBoth}
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === 'terms' ? '#c9a227' : '#ffffff',
              color: activeTab === 'terms' ? '#ffffff' : '#374151',
              border: activeTab === 'terms' ? '1px solid #aa841a' : '1px solid #d1d5db',
              boxShadow: activeTab === 'terms' ? '0 4px 14px rgba(201, 162, 39, 0.25)' : '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            {ui.tabTerms}
          </button>
          <button
            onClick={() => setActiveTab('cancellation')}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === 'cancellation' ? '#c9a227' : '#ffffff',
              color: activeTab === 'cancellation' ? '#ffffff' : '#374151',
              border: activeTab === 'cancellation' ? '1px solid #aa841a' : '1px solid #d1d5db',
              boxShadow: activeTab === 'cancellation' ? '0 4px 14px rgba(201, 162, 39, 0.25)' : '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            {ui.tabCancellation}
          </button>
        </div>

        {/* Dual Split Content Container */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: activeTab === 'both' ? 'repeat(auto-fit, minmax(min(100%, 580px), 1fr))' : '1fr',
          gap: '24px',
          alignItems: 'start'
        }}>
          
          {/* SECTION 1: TERMS & CONDITIONS */}
          {(activeTab === 'both' || activeTab === 'terms') && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.94)',
              borderRadius: '16px',
              border: '1px solid rgba(201, 162, 39, 0.35)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05), 0 0 20px rgba(201, 162, 39, 0.08)',
              padding: 'clamp(20px, 3vw, 32px)',
              backdropFilter: 'blur(16px)'
            }}>
              {/* Column Header */}
              <div style={{
                borderBottom: '2px solid rgba(201, 162, 39, 0.35)',
                paddingBottom: '16px',
                marginBottom: '20px'
              }}>
                <span style={{
                  background: '#8c6a12',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {ui.part1Title}
                </span>
                <h2 style={{
                  fontSize: 'clamp(1.15rem, 2vw, 1.45rem)',
                  color: '#111827',
                  margin: '10px 0 6px 0',
                  fontWeight: '800'
                }}>
                  {terms.title}
                </h2>
                <div style={{
                  background: 'rgba(201, 162, 39, 0.08)',
                  border: '1px solid rgba(201, 162, 39, 0.25)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginTop: '12px',
                  fontSize: '0.84rem',
                  color: '#4b5563',
                  lineHeight: '1.6'
                }}>
                  {terms.importantNotice}
                </div>
              </div>

              {/* Sections List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {terms.sections.map((section) => (
                  <article 
                    key={section.num}
                    style={{
                      background: '#ffffff',
                      borderRadius: '10px',
                      padding: '16px 18px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)'
                    }}
                  >
                    <h3 style={{
                      margin: '0 0 10px 0',
                      fontSize: '0.98rem',
                      color: '#8c6a12',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '8px'
                    }}>
                      <span>{section.title}</span>
                    </h3>
                    <div style={{
                      color: '#374151',
                      fontSize: '0.88rem',
                      lineHeight: '1.75',
                      whiteSpace: 'pre-line'
                    }}>
                      {section.content}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: CANCELLATION & REFUND POLICY */}
          {(activeTab === 'both' || activeTab === 'cancellation') && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.94)',
              borderRadius: '16px',
              border: '1px solid rgba(201, 162, 39, 0.35)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05), 0 0 20px rgba(201, 162, 39, 0.08)',
              padding: 'clamp(20px, 3vw, 32px)',
              backdropFilter: 'blur(16px)'
            }}>
              {/* Column Header */}
              <div style={{
                borderBottom: '2px solid rgba(201, 162, 39, 0.35)',
                paddingBottom: '16px',
                marginBottom: '20px'
              }}>
                <span style={{
                  background: '#c9a227',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {ui.part2Title}
                </span>
                <h2 style={{
                  fontSize: 'clamp(1.15rem, 2vw, 1.45rem)',
                  color: '#111827',
                  margin: '10px 0 6px 0',
                  fontWeight: '800'
                }}>
                  {cancellation.title}
                </h2>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#6b7280', fontStyle: 'italic' }}>
                  {cancellation.subtitle}
                </p>

                {/* Preamble */}
                {cancellation.preamble && (
                  <div style={{
                    background: 'rgba(201, 162, 39, 0.08)',
                    border: '1px solid rgba(201, 162, 39, 0.25)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    marginTop: '12px'
                  }}>
                    <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#8c6a12', marginBottom: '4px' }}>
                      ⚖️ {cancellation.preamble.title}
                    </div>
                    {cancellation.preamble.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} style={{ margin: '4px 0', fontSize: '0.84rem', color: '#4b5563', whiteSpace: 'pre-line' }}>
                        {p}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Articles List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {cancellation.articles.map((article) => (
                  <article
                    key={article.num}
                    style={{
                      background: '#ffffff',
                      borderRadius: '10px',
                      padding: '16px 18px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)'
                    }}
                  >
                    <h3 style={{
                      margin: '0 0 10px 0',
                      fontSize: '0.98rem',
                      color: '#8c6a12',
                      fontWeight: '800'
                    }}>
                      {article.title}
                    </h3>
                    {article.intro && (
                      <p style={{ margin: '0 0 10px 0', fontSize: '0.86rem', color: '#4b5563', fontStyle: 'italic' }}>
                        {article.intro}
                      </p>
                    )}
                    {article.clauses && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {article.clauses.map((clause, cIdx) => (
                          <div key={cIdx} style={{ fontSize: '0.88rem', color: '#374151', lineHeight: '1.75', whiteSpace: 'pre-line' }}>
                            {clause}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Article 9: Statutory Table */}
                    {article.table && (
                      <div style={{ marginTop: '14px', overflowX: 'auto' }}>
                        <table style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontSize: '0.82rem',
                          background: '#fafafa',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid #e5e7eb'
                        }}>
                          <thead>
                            <tr style={{ background: 'rgba(201, 162, 39, 0.12)', color: '#8c6a12', borderBottom: '1px solid rgba(201, 162, 39, 0.25)' }}>
                              <th style={{ padding: '8px 12px', textAlign: isRtl ? 'right' : 'left', fontWeight: '700' }}>{ui.thLaw}</th>
                              <th style={{ padding: '8px 12px', textAlign: isRtl ? 'right' : 'left', fontWeight: '700' }}>{ui.thArticle}</th>
                              <th style={{ padding: '8px 12px', textAlign: isRtl ? 'right' : 'left', fontWeight: '700' }}>{ui.thPurpose}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {article.table.map((row, rIdx) => (
                              <tr key={rIdx} style={{ borderBottom: '1px solid #f3f4f6', background: rIdx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                                <td style={{ padding: '8px 12px', fontWeight: '600', color: '#1f2937' }}>{row.law}</td>
                                <td style={{ padding: '8px 12px', color: '#8c6a12', fontWeight: '600' }}>{row.article}</td>
                                <td style={{ padding: '8px 12px', color: '#4b5563', lineHeight: '1.5' }}>{row.purpose}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer style={{
          marginTop: '40px',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '0.84rem',
          borderTop: '1px solid rgba(201, 162, 39, 0.25)',
          paddingTop: '20px'
        }}>
          <p style={{ margin: '0 0 6px 0', fontWeight: '700', color: '#8c6a12' }}>
            {ui.footerCompany}
          </p>
          <p style={{ margin: '0 0 10px 0' }}>
            📍 {ui.footerAddress}
          </p>
          <p style={{ margin: 0, fontSize: '0.78rem' }}>
            © {new Date().getFullYear()} ORLUXUS. {ui.lawBadge || 'All rights reserved.'}
          </p>
        </footer>

      </main>

      {/* Block Printing Completely */}
      <style jsx global>{`
        @media print {
          body, html, main, nav {
            display: none !important;
            visibility: hidden !important;
          }
        }
      `}</style>
    </div>
  );
}
