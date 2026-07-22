'use client';

import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import { useLanguage } from '@/context/LanguageContext';

const translations = {
  ar: {
    title: 'رحلات الأقصر وأسوان: الدليل الكامل للمعابد والرحلات النيلية',
    subtitle: 'اكتشف موطن الحضارة المصرية القديمة مع معابد ضخمة، وادي الملوك، والرحلات النيلية الساحرة بين الأقصر وأسوان.',
    exploreLuxor: 'استكشف الأقصر',
    exploreAswan: 'استكشف أسوان',
    topAttractions: 'أفضل المعالم في الأقصر وأسوان',
    valleyOfKings: 'وادي الملوك',
    valleyOfKingsDesc: 'موقع دفن ملوك مصر القديمة. استكشف مقابر توت عنخ آمون ورمسيس الثاني.',
    karnakTemple: 'معبد الكرنك',
    karnakTempleDesc: 'أكبر مكان ديني في العالم. استمتع بمشاهدة الأعمدة الضخمة والتماثيل.',
    abuSimbel: 'أبو سمبل',
    abuSimbelDesc: 'معبد رمسيس الثاني الشهير المنحوت في الصخر. معجزة هندسية قديمة.',
    nileCruise: 'الرحلات النيلية',
    nileCruiseDesc: 'رحلة ساحرة على نهر النيل بين الأقصر وأسوان مع إقامة فاخرة ومعالم تاريخية.',
    bookNow: 'احجز الآن',
    whyChoose: 'لماذا تختار الأقصر وأسوان؟',
    ancientCivilization: 'حضارة قديمة',
    ancientCivilizationDesc: 'موطن الحضارة المصرية القديمة مع معابد ضخمة ومقابر ملكية.',
    nileCruises: 'رحلات نيلية',
    nileCruisesDesc: 'تجربة فريدة على نهر النيل مع إقامة فاخرة ومعالم تاريخية.',
    valleyOfKings2: 'وادي الملوك',
    valleyOfKings2Desc: 'موقع دفن ملوك مصر القديمة مع مقابر محفوظة بشكل ممتاز.',
    massiveTemples: 'معابد ضخمة',
    massiveTemplesDesc: 'معابد ضخمة مثل الكرنك وأبو سمبل تعرض عظمة مصر القديمة.',
    bestTimeToVisit: 'أفضل وقت لزيارة الأقصر وأسوان',
    winter: 'الشتاء (ديسمبر - فبراير)',
    winterDesc: 'أفضل وقت للزيارة مع طقس دافئ وممتع (20-25°C). مثالي للجولات السياحية والرحلات النيلية.',
    spring: 'الربيع (مارس - أبريل)',
    springDesc: 'طقس رائع لجميع الأنشطة مع ازدحام معتدل. مناسب لاستكشاف المعابد.',
    fall: 'الخريف (أكتوبر - نوفمبر)',
    fallDesc: 'طقس معتدل وحشود أقل. مثالي للرحلات النيلية والجولات السياحية.',
    summer: 'الصيف (مايو - سبتمبر)',
    summerDesc: 'حار جداً (40-45°C) لكن مثالي للزيارات الصباحية والمسائية. أسعار أقل وحشود أقل.',
    travelTips: 'نصائح السفر في الأقصر وأسوان',
    visa: '🛂 الفيزا',
    visaDesc: 'يمكن الحصول على فيزا عند الوصول في مطار الأقصر أو أسوان لمعظم الجنسيات.',
    currency: '💰 العملة',
    currencyDesc: 'الجنيه المصري (EGP) والعملات الأجنبية مقبولة في معظم الأماكن.',
    transportation: '🚕 النقل',
    transportationDesc: 'تتوفر سيارات الأجارة والحافلات والقطار. يمكن حجز نقل خاص مع مرشد.',
    accommodation: '🏨 الإقامة',
    accommodationDesc: 'مجموعة واسعة من الفنادق والمنتجعات والسفن النيلية من الاقتصادية إلى الفاخرة.',
    ctaTitle: 'ابدأ مغامرتك في الأقصر وأسوان اليوم',
    ctaDesc: 'احجز رحلتك الآن واستمتع بتجربة تاريخية لا تُنسى في الأقصر وأسوان مع أورلكسوس.',
    ctaButton: 'احجز رحلتك الآن'
  },
  en: {
    title: 'Luxor Aswan Tours: Complete Guide to Temples & Nile Cruises',
    subtitle: 'Discover the home of ancient Egyptian civilization with massive temples, the Valley of the Kings, and enchanting Nile cruises between Luxor and Aswan.',
    exploreLuxor: 'Explore Luxor',
    exploreAswan: 'Explore Aswan',
    topAttractions: 'Top Attractions in Luxor & Aswan',
    valleyOfKings: 'Valley of the Kings',
    valleyOfKingsDesc: 'Burial site of ancient Egyptian pharaohs. Explore the tombs of Tutankhamun and Ramses II.',
    karnakTemple: 'Karnak Temple',
    karnakTempleDesc: 'The largest religious site in the world. Enjoy viewing massive columns and statues.',
    abuSimbel: 'Abu Simbel',
    abuSimbelDesc: 'Famous temple of Ramses II carved into rock. An ancient engineering marvel.',
    nileCruise: 'Nile Cruises',
    nileCruiseDesc: 'An enchanting journey on the Nile River between Luxor and Aswan with luxury accommodation and historical sites.',
    bookNow: 'Book Now',
    whyChoose: 'Why Choose Luxor & Aswan?',
    ancientCivilization: 'Ancient Civilization',
    ancientCivilizationDesc: 'Home of ancient Egyptian civilization with massive temples and royal tombs.',
    nileCruises: 'Nile Cruises',
    nileCruisesDesc: 'Unique experience on the Nile River with luxury accommodation and historical sites.',
    valleyOfKings2: 'Valley of Kings',
    valleyOfKings2Desc: 'Burial site of ancient Egyptian pharaohs with exceptionally preserved tombs.',
    massiveTemples: 'Massive Temples',
    massiveTemplesDesc: 'Massive temples like Karnak and Abu Simbel showcasing the greatness of ancient Egypt.',
    bestTimeToVisit: 'Best Time to Visit Luxor & Aswan',
    winter: 'Winter (December - February)',
    winterDesc: 'The best time to visit with warm and pleasant weather (20-25°C). Perfect for sightseeing and Nile cruises.',
    spring: 'Spring (March - April)',
    springDesc: 'Excellent weather for all activities with moderate crowds. Suitable for temple exploration.',
    fall: 'Fall (October - November)',
    fallDesc: 'Moderate temperatures and fewer crowds. Perfect for Nile cruises and sightseeing.',
    summer: 'Summer (May - September)',
    summerDesc: 'Very hot (40-45°C) but perfect for morning and evening visits. Lower prices and fewer crowds.',
    travelTips: 'Luxor & Aswan Travel Tips',
    visa: '🛂 Visa',
    visaDesc: 'Visa on arrival is available at Luxor or Aswan airports for most nationalities.',
    currency: '💰 Currency',
    currencyDesc: 'Egyptian Pound (EGP) and foreign currencies are accepted in most places.',
    transportation: '🚕 Transportation',
    transportationDesc: 'Taxis, buses, and trains are available. Private transfers with guides can be arranged.',
    accommodation: '🏨 Accommodation',
    accommodationDesc: 'Wide range of hotels, resorts, and Nile cruise ships from budget to luxury options.',
    ctaTitle: 'Start Your Luxor & Aswan Adventure Today',
    ctaDesc: 'Book your trip now and enjoy an unforgettable historical experience in Luxor and Aswan with Orluxus.',
    ctaButton: 'Book Your Trip Now'
  }
};

export default function LuxorAswanToursPage() {
  const { locale } = useLanguage();
  const isRTL = locale === 'ar';
  const t = translations[locale] || translations.en;

  return (
    <main style={{ minHeight: '100vh', background: 'transparent' }}>
      <Navbar />
      
      {/* Hero Section */}
      <section style={{
        paddingTop: 'calc(var(--nav-height) + 4rem)',
        paddingBottom: '4rem',
        background: 'linear-gradient(135deg, rgba(250, 112, 154, 0.15) 0%, rgba(254, 225, 64, 0.15) 100%)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div className="container" style={{ textAlign: isRTL ? 'right' : 'left' }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '800',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)',
            lineHeight: '1.2'
          }}>
            {t.title}
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: 'var(--text-secondary)',
            maxWidth: '800px',
            marginBottom: '2rem',
            lineHeight: '1.8'
          }}>
            {t.subtitle}
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/city/luxor/east-bank" className="btn btn-primary">
              {t.exploreLuxor}
            </Link>
            <Link href="/city/aswan-tours" className="btn btn-secondary">
              {t.exploreAswan}
            </Link>
          </div>
        </div>
      </section>

      {/* Top Attractions */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '3rem',
            color: 'var(--text-primary)',
            textAlign: isRTL ? 'right' : 'left'
          }}>
            {t.topAttractions}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>👑</div>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.valleyOfKings}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {t.valleyOfKingsDesc}
              </p>
              <Link href="/city/luxor/west-bank" className="btn btn-primary" style={{ width: '100%' }}>
                {t.bookNow}
              </Link>
            </div>

            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>🏛️</div>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.karnakTemple}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {t.karnakTempleDesc}
              </p>
              <Link href="/city/luxor/east-bank" className="btn btn-primary" style={{ width: '100%' }}>
                {t.bookNow}
              </Link>
            </div>

            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>🗿</div>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.abuSimbel}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {t.abuSimbelDesc}
              </p>
              <Link href="/city/aswan-tours" className="btn btn-primary" style={{ width: '100%' }}>
                {t.bookNow}
              </Link>
            </div>

            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>🚢</div>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.nileCruise}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {t.nileCruiseDesc}
              </p>
              <Link href="/city/luxor/east-bank" className="btn btn-primary" style={{ width: '100%' }}>
                {t.bookNow}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Luxor & Aswan */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-tertiary)' }}>
        <div className="container">
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '3rem',
            color: 'var(--text-primary)',
            textAlign: isRTL ? 'right' : 'left'
          }}>
            {t.whyChoose}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏛️</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.ancientCivilization}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {t.ancientCivilizationDesc}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚢</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.nileCruises}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {t.nileCruisesDesc}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👑</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.valleyOfKings2}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {t.valleyOfKings2Desc}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗿</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.massiveTemples}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {t.massiveTemplesDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Best Time to Visit */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '3rem',
            color: 'var(--text-primary)',
            textAlign: isRTL ? 'right' : 'left'
          }}>
            {t.bestTimeToVisit}
          </h2>
          
          <div className="glass-card" style={{ padding: '3rem', borderRadius: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--gold-600)' }}>
                  {t.winter}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {t.winterDesc}
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--gold-600)' }}>
                  {t.spring}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {t.springDesc}
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--gold-600)' }}>
                  {t.fall}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {t.fallDesc}
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--gold-600)' }}>
                  {t.summer}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {t.summerDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Travel Tips */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-tertiary)' }}>
        <div className="container">
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '3rem',
            color: 'var(--text-primary)',
            textAlign: isRTL ? 'right' : 'left'
          }}>
            {t.travelTips}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.visa}
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {t.visaDesc}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.currency}
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {t.currencyDesc}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.transportation}
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {t.transportationDesc}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.accommodation}
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {t.accommodationDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="glass-card" style={{ padding: '3rem', borderRadius: '12px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(250, 112, 154, 0.1) 0%, rgba(254, 225, 64, 0.1) 100%)' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              {t.ctaTitle}
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
              {t.ctaDesc}
            </p>
            <Link href="/city/luxor/east-bank" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
              {t.ctaButton}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
