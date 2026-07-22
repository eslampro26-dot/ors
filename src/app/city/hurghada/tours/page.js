'use client';

import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import { useLanguage } from '@/context/LanguageContext';

const translations = {
  ar: {
    title: 'رحلات الغردقة: الدليل الكامل للأنشطة والجولات',
    subtitle: 'اكتشف أجمل رحلات الغردقة والأنشطة الترفيهية. رحلات الجزر، مشاهدة الدلافين، الغواصة، رحلات الصحراء، وجولات المدينة مع أفضل العروض.',
    exploreSeaTrips: 'استكشف رحلات البحر',
    exploreDesertTrips: 'استكشف رحلات الصحراء',
    topActivities: 'أفضل الأنشطة في الغردقة',
    islandTours: 'رحلات الجزر',
    islandToursDesc: 'استمتع بزيارة جزر جميلة مثل جزة جفتون وجزة أبو منقار مع السباحة وال snorkeling.',
    dolphinWatching: 'مشاهدة الدلافين',
    dolphinWatchingDesc: 'تجربة لا تُنسى لمشاهدة الدلافين في بيئتها الطبيعية والسباحة معها.',
    submarineTour: 'رحلة الغواصة',
    submarineTourDesc: 'استكشف عالم البحار من داخل غواصة حقيقية ومشاهدة الشعاب المرجانية.',
    desertSafari: 'رحلات السفاري الصحراوية',
    desertSafariDesc: 'مغامرة مثيرة في الصحراء مع ركوب quad bike، ركوب الجمال، وعشاء بدوي.',
    bookNow: 'احجز الآن',
    whyChoose: 'لماذا تختار الغردقة؟',
    beautifulIslands: 'جزر جميلة',
    beautifulIslandsDesc: 'جزر خلابة مع شواطئ رملية بيضاء ومياه صافية مثالية للسباحة.',
    richMarineLife: 'حياة بحرية غنية',
    richMarineLifeDesc: 'شعاب مرجانية ملونة وأسماك استوائية متنوعة للغوص وال snorkeling.',
    dolphins: 'الدلافين',
    dolphinsDesc: 'فرصة فريدة لمشاهدة الدلافين في بيئتها الطبيعية.',
    luxuryHotels: 'فنادق فاخرة',
    luxuryHotelsDesc: 'مجموعة واسعة من الفنادق والمنتجعات الفاخرة بأسعار معقولة.',
    bestTimeToVisit: 'أفضل وقت لزيارة الغردقة',
    winter: 'الشتاء (ديسمبر - فبراير)',
    winterDesc: 'موسم الذروة السياحية مع طقس دافئ وممتع (20-25°C). مثالي للسباحة والرحلات البحرية.',
    spring: 'الربيع (مارس - أبريل)',
    springDesc: 'طقس رائع لجميع الأنشطة مع ازدحام معتدل. مناسب للغوص والرحلات البحرية.',
    fall: 'الخريف (أكتوبر - نوفمبر)',
    fallDesc: 'أفضل وقت للزيارة مع طقس معتدل وحشود أقل. مثالي لجميع أنواع الرحلات.',
    summer: 'الصيف (مايو - سبتمبر)',
    summerDesc: 'حار جداً (35-40°C) لكن مثالي للغوص والرحلات البحرية. أسعار أقل وحشود أقل.',
    travelTips: 'نصائح السفر في الغردقة',
    visa: '🛂 الفيزا',
    visaDesc: 'يمكن الحصول على فيزا عند الوصول في مطار الغردقة لمعظم الجنسيات.',
    currency: '💰 العملة',
    currencyDesc: 'الجنيه المصري (EGP) والعملات الأجنبية مقبولة في معظم الأماكن.',
    transportation: '🚕 النقل',
    transportationDesc: 'تتوفر سيارات الأجارة والحافلات. يمكن حجز نقل خاص من المطار.',
    accommodation: '🏨 الإقامة',
    accommodationDesc: 'مجموعة واسعة من الفنادق والمنتجعات من الاقتصادية إلى الفاخرة.',
    ctaTitle: 'ابدأ مغامرتك في الغردقة اليوم',
    ctaDesc: 'احجز رحلتك الآن واستمتع بتجربة سياحية لا تُنسى في الغردقة مع أورلكسوس.',
    ctaButton: 'احجز رحلتك الآن'
  },
  en: {
    title: 'Hurghada Tours: Complete Guide to Activities & Excursions',
    subtitle: 'Discover the beauty of Hurghada with our comprehensive guide. Island tours, dolphin watching, submarine, desert safaris, and city tours with the best deals.',
    exploreSeaTrips: 'Explore Sea Trips',
    exploreDesertTrips: 'Explore Desert Trips',
    topActivities: 'Top Activities in Hurghada',
    islandTours: 'Island Tours',
    islandToursDesc: 'Enjoy visiting beautiful islands like Giftun Island and Abu Monqar Island with swimming and snorkeling.',
    dolphinWatching: 'Dolphin Watching',
    dolphinWatchingDesc: 'An unforgettable experience watching dolphins in their natural habitat and swimming with them.',
    submarineTour: 'Submarine Tour',
    submarineTourDesc: 'Explore the underwater world from inside a real submarine and view coral reefs.',
    desertSafari: 'Desert Safari Adventures',
    desertSafariDesc: 'An exciting desert adventure with quad biking, camel riding, and Bedouin dinner.',
    bookNow: 'Book Now',
    whyChoose: 'Why Choose Hurghada?',
    beautifulIslands: 'Beautiful Islands',
    beautifulIslandsDesc: 'Stunning islands with white sandy beaches and crystal clear waters perfect for swimming.',
    richMarineLife: 'Rich Marine Life',
    richMarineLifeDesc: 'Colorful coral reefs and diverse tropical fish for diving and snorkeling.',
    dolphins: 'Dolphins',
    dolphinsDesc: 'Unique opportunity to watch dolphins in their natural habitat.',
    luxuryHotels: 'Luxury Hotels',
    luxuryHotelsDesc: 'Wide range of luxury hotels and resorts at reasonable prices.',
    bestTimeToVisit: 'Best Time to Visit Hurghada',
    winter: 'Winter (December - February)',
    winterDesc: 'Peak tourist season with warm and pleasant weather (20-25°C). Perfect for swimming and sea trips.',
    spring: 'Spring (March - April)',
    springDesc: 'Excellent weather for all activities with moderate crowds. Suitable for diving and sea trips.',
    fall: 'Fall (October - November)',
    fallDesc: 'The best time to visit with moderate temperatures and fewer crowds. Perfect for all types of tours.',
    summer: 'Summer (May - September)',
    summerDesc: 'Very hot (35-40°C) but perfect for diving and sea trips. Lower prices and fewer crowds.',
    travelTips: 'Hurghada Travel Tips',
    visa: '🛂 Visa',
    visaDesc: 'Visa on arrival is available at Hurghada airport for most nationalities.',
    currency: '💰 Currency',
    currencyDesc: 'Egyptian Pound (EGP) and foreign currencies are accepted in most places.',
    transportation: '🚕 Transportation',
    transportationDesc: 'Taxis and buses are available. Private transfers from the airport can be arranged.',
    accommodation: '🏨 Accommodation',
    accommodationDesc: 'Wide range of hotels and resorts from budget to luxury options.',
    ctaTitle: 'Start Your Hurghada Adventure Today',
    ctaDesc: 'Book your trip now and enjoy an unforgettable tourism experience in Hurghada with Orluxus.',
    ctaButton: 'Book Your Trip Now'
  }
};

export default function HurghadaToursPage() {
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
        background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.15) 0%, rgba(245, 87, 108, 0.15) 100%)',
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
            <Link href="/city/hurghada/sea-trips" className="btn btn-primary">
              {t.exploreSeaTrips}
            </Link>
            <Link href="/city/hurghada/desert-trips" className="btn btn-secondary">
              {t.exploreDesertTrips}
            </Link>
          </div>
        </div>
      </section>

      {/* Top Activities */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '3rem',
            color: 'var(--text-primary)',
            textAlign: isRTL ? 'right' : 'left'
          }}>
            {t.topActivities}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>🏝️</div>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.islandTours}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {t.islandToursDesc}
              </p>
              <Link href="/city/hurghada/sea-trips" className="btn btn-primary" style={{ width: '100%' }}>
                {t.bookNow}
              </Link>
            </div>

            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>🐬</div>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.dolphinWatching}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {t.dolphinWatchingDesc}
              </p>
              <Link href="/city/hurghada/sea-trips" className="btn btn-primary" style={{ width: '100%' }}>
                {t.bookNow}
              </Link>
            </div>

            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>🚢</div>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.submarineTour}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {t.submarineTourDesc}
              </p>
              <Link href="/city/hurghada/sea-trips" className="btn btn-primary" style={{ width: '100%' }}>
                {t.bookNow}
              </Link>
            </div>

            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>🏜️</div>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.desertSafari}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {t.desertSafariDesc}
              </p>
              <Link href="/city/hurghada/desert-trips" className="btn btn-primary" style={{ width: '100%' }}>
                {t.bookNow}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Hurghada */}
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
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏝️</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.beautifulIslands}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {t.beautifulIslandsDesc}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐠</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.richMarineLife}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {t.richMarineLifeDesc}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐬</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.dolphins}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {t.dolphinsDesc}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏨</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.luxuryHotels}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {t.luxuryHotelsDesc}
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
          <div className="glass-card" style={{ padding: '3rem', borderRadius: '12px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%)' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              {t.ctaTitle}
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
              {t.ctaDesc}
            </p>
            <Link href="/city/hurghada/sea-trips" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
              {t.ctaButton}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
