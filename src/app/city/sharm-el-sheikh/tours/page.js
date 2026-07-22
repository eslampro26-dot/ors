'use client';

import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import { useLanguage } from '@/context/LanguageContext';

const translations = {
  ar: {
    title: 'رحلات شرم الشيخ: الدليل الكامل للأنشطة والجولات',
    subtitle: 'اكتشف أجمل رحلات شرم الشيخ والأنشطة الترفيهية. جولات القارب الزجاجي، الغوص، رحلات الصحراء، وجولات المدينة مع أفضل العروض.',
    exploreSeaTrips: 'استكشف رحلات البحر',
    exploreDesertSafaris: 'استكشف رحلات الصحراء',
    topActivities: 'أفضل الأنشطة في شرم الشيخ',
    glassBoatTours: 'جولات القارب الزجاجي',
    glassBoatDesc: 'استمتع بمشاهدة الشعاب المرجانية الملونة والأسماك الاستوائية من قارب زجاجي آمن ومريح.',
    snorkelingDiving: 'الغوص وال Snorkeling',
    snorkelingDesc: 'استكشف عالم البحار الساحر مع أفضل مواقع الغوص في شرم الشيخ وشعابها المرجانية الشهيرة.',
    desertSafari: 'رحلات السفاري الصحراوية',
    desertSafariDesc: 'مغامرة مثيرة في الصحراء مع ركوب الجمال، ركوب quad bike، وعشاء بدوي تقليدي.',
    cityTours: 'جولات المدينة',
    cityToursDesc: 'استكشف السوق القديم، نعمة باي، ومناطق التسوق والترفيه في شرم الشيخ.',
    bookNow: 'احجز الآن',
    whyChoose: 'لماذا تختار شرم الشيخ؟',
    stunningBeaches: 'شواطئ خلابة',
    stunningBeachesDesc: 'شواطئ رملية بيضاء ومياه صافية مثالية للسباحة والاسترخاء.',
    coralReefs: 'شعاب مرجانية',
    coralReefsDesc: 'من بين أفضل الشعاب المرجانية في العالم للغوص وال snorkeling.',
    sunnyWeather: 'طقس مشمس',
    sunnyWeatherDesc: 'أكثر من 300 يوم مشمس في السنة، مثالي للسياحة على مدار العام.',
    vibrantNightlife: 'حياة ليلية نابضة',
    vibrantNightlifeDesc: 'مطاعم، كافيهات، وأماكن ترفيهية مفتوحة حتى وقت متأخر.',
    bestTimeToVisit: 'أفضل وقت لزيارة شرم الشيخ',
    winter: 'الشتاء (ديسمبر - فبراير)',
    winterDesc: 'موسم الذروة السياحية مع طقس دافئ وممتع (20-25°C). مثالي للسباحة والرحلات البحرية.',
    spring: 'الربيع (مارس - أبريل)',
    springDesc: 'طقس رائع لجميع الأنشطة مع ازدحام معتدل. مناسب للغوص والرحلات الصحراوية.',
    fall: 'الخريف (أكتوبر - نوفمبر)',
    fallDesc: 'أفضل وقت للزيارة مع طقس معتدل وحشود أقل. مثالي لجميع أنواع الرحلات.',
    summer: 'الصيف (مايو - سبتمبر)',
    summerDesc: 'حار جداً (35-40°C) لكن مثالي للغوص والرحلات البحرية. أسعار أقل وحشود أقل.',
    travelTips: 'نصائح السفر في شرم الشيخ',
    visa: '🛂 الفيزا',
    visaDesc: 'يمكن الحصول على فيزا عند الوصول في مطار شرم الشيخ لمعظم الجنسيات.',
    currency: '💰 العملة',
    currencyDesc: 'الجنيه المصري (EGP) والعملات الأجنبية مقبولة في معظم الأماكن.',
    transportation: '🚕 النقل',
    transportationDesc: 'تتوفر سيارات الأجارة والحافلات. يمكن حجز نقل خاص من المطار.',
    accommodation: '🏨 الإقامة',
    accommodationDesc: 'مجموعة واسعة من الفنادق والمنتجعات من الاقتصادية إلى الفاخرة.',
    ctaTitle: 'ابدأ مغامرتك في شرم الشيخ اليوم',
    ctaDesc: 'احجز رحلتك الآن واستمتع بتجربة سياحية لا تُنسى في شرم الشيخ مع أورلكسوس.',
    ctaButton: 'احجز رحلتك الآن'
  },
  en: {
    title: 'Sharm El Sheikh Tours: Complete Guide to Activities & Excursions',
    subtitle: 'Discover the beauty of Sharm El Sheikh with our comprehensive guide. Glass boat tours, snorkeling, diving, desert safaris, and city tours with the best deals.',
    exploreSeaTrips: 'Explore Sea Trips',
    exploreDesertSafaris: 'Explore Desert Safaris',
    topActivities: 'Top Activities in Sharm El Sheikh',
    glassBoatTours: 'Glass Boat Tours',
    glassBoatDesc: 'Enjoy viewing colorful coral reefs and tropical fish from a safe and comfortable glass boat.',
    snorkelingDiving: 'Snorkeling & Diving',
    snorkelingDesc: 'Explore the magical underwater world with the best diving spots in Sharm El Sheikh and its famous coral reefs.',
    desertSafari: 'Desert Safari Adventures',
    desertSafariDesc: 'An exciting desert adventure with camel riding, quad biking, and traditional Bedouin dinner.',
    cityTours: 'City Tours',
    cityToursDesc: 'Explore the Old Market, Naama Bay, and shopping and entertainment areas in Sharm El Sheikh.',
    bookNow: 'Book Now',
    whyChoose: 'Why Choose Sharm El Sheikh?',
    stunningBeaches: 'Stunning Beaches',
    stunningBeachesDesc: 'White sandy beaches and crystal clear waters perfect for swimming and relaxation.',
    coralReefs: 'Coral Reefs',
    coralReefsDesc: 'Among the best coral reefs in the world for diving and snorkeling.',
    sunnyWeather: 'Sunny Weather',
    sunnyWeatherDesc: 'Over 300 sunny days per year, perfect for year-round tourism.',
    vibrantNightlife: 'Vibrant Nightlife',
    vibrantNightlifeDesc: 'Restaurants, cafes, and entertainment venues open late into the night.',
    bestTimeToVisit: 'Best Time to Visit Sharm El Sheikh',
    winter: 'Winter (December - February)',
    winterDesc: 'Peak tourist season with warm and pleasant weather (20-25°C). Perfect for swimming and sea trips.',
    spring: 'Spring (March - April)',
    springDesc: 'Excellent weather for all activities with moderate crowds. Suitable for diving and desert adventures.',
    fall: 'Fall (October - November)',
    fallDesc: 'The best time to visit with moderate temperatures and fewer crowds. Perfect for all types of tours.',
    summer: 'Summer (May - September)',
    summerDesc: 'Very hot (35-40°C) but perfect for diving and sea trips. Lower prices and fewer crowds.',
    travelTips: 'Sharm El Sheikh Travel Tips',
    visa: '🛂 Visa',
    visaDesc: 'Visa on arrival is available at Sharm El Sheikh airport for most nationalities.',
    currency: '💰 Currency',
    currencyDesc: 'Egyptian Pound (EGP) and foreign currencies are accepted in most places.',
    transportation: '🚕 Transportation',
    transportationDesc: 'Taxis and buses are available. Private transfers from the airport can be arranged.',
    accommodation: '🏨 Accommodation',
    accommodationDesc: 'Wide range of hotels and resorts from budget to luxury options.',
    ctaTitle: 'Start Your Sharm El Sheikh Adventure Today',
    ctaDesc: 'Book your trip now and enjoy an unforgettable tourism experience in Sharm El Sheikh with Orluxus.',
    ctaButton: 'Book Your Trip Now'
  }
};

export default function SharmElSheikhToursPage() {
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
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
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
            <Link href="/city/sharm-el-sheikh/sea-trips" className="btn btn-primary">
              {t.exploreSeaTrips}
            </Link>
            <Link href="/city/sharm-el-sheikh/desert-safaris" className="btn btn-secondary">
              {t.exploreDesertSafaris}
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
            {/* Glass Boat Tours */}
            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>🚤</div>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.glassBoatTours}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {t.glassBoatDesc}
              </p>
              <Link href="/city/sharm-el-sheikh/sea-trips" className="btn btn-primary" style={{ width: '100%' }}>
                {t.bookNow}
              </Link>
            </div>

            {/* Snorkeling & Diving */}
            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>🤿</div>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.snorkelingDiving}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {t.snorkelingDesc}
              </p>
              <Link href="/city/sharm-el-sheikh/sea-trips" className="btn btn-primary" style={{ width: '100%' }}>
                {t.bookNow}
              </Link>
            </div>

            {/* Desert Safari */}
            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>🏜️</div>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.desertSafari}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {t.desertSafariDesc}
              </p>
              <Link href="/city/sharm-el-sheikh/desert-safaris" className="btn btn-primary" style={{ width: '100%' }}>
                {t.bookNow}
              </Link>
            </div>

            {/* City Tours */}
            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>🏙️</div>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.cityTours}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {t.cityToursDesc}
              </p>
              <Link href="/city/sharm-el-sheikh/city-tours" className="btn btn-primary" style={{ width: '100%' }}>
                {t.bookNow}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Sharm El Sheikh */}
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
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌊</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.stunningBeaches}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {t.stunningBeachesDesc}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐠</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.coralReefs}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {t.coralReefsDesc}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☀️</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.sunnyWeather}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {t.sunnyWeatherDesc}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.vibrantNightlife}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {t.vibrantNightlifeDesc}
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
          <div className="glass-card" style={{ padding: '3rem', borderRadius: '12px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              {t.ctaTitle}
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
              {t.ctaDesc}
            </p>
            <Link href="/city/sharm-el-sheikh/sea-trips" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
              {t.ctaButton}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
