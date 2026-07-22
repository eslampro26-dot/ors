'use client';

import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import { useLanguage } from '@/context/LanguageContext';

const translations = {
  ar: {
    title: 'رحلات القاهرة: الدليل الكامل للأهرامات والمتاحف والمعالم',
    subtitle: 'اكتشف عاصمة مصر التاريخية مع جولات الأهرامات، المتحف المصري، القاهرة الإسلامية، وخان الخليلي. تجربة ثقافية لا تُنسى.',
    explorePyramids: 'استكشف جولات الأهرامات',
    exploreMuseums: 'استكشف المتاحف',
    topAttractions: 'أفضل المعالم في القاهرة',
    greatPyramids: 'الأهرامات العظيمة',
    greatPyramidsDesc: 'أحد عجائب الدنيا السبع القديمة. استكشف أهرامات الجيزة وأبو الهول مع مرشد محترف.',
    egyptianMuseum: 'المتحف المصري',
    egyptianMuseumDesc: 'أكبر متحف في العالم للآثار المصرية القديمة. استمتع بمشاهدة كنوز توت عنخ آمون.',
    islamicCairo: 'القاهرة الإسلامية',
    islamicCairoDesc: 'استكشف المساجد التاريخية والقصور والأسواق التقليدية في القاهرة القديمة.',
    khanElKhalili: 'خان الخليلي',
    khanElKhaliliDesc: 'سوق تقليدي شهير يبيع الهدايا التذكارية والتحف والمنتجات اليدوية.',
    bookNow: 'احجز الآن',
    whyChoose: 'لماذا تختار القاهرة؟',
    richHistory: 'تاريخ عريق',
    richHistoryDesc: 'أكثر من 7000 عام من الحضارة والتاريخ والمعالم الأثرية.',
    worldClassMuseums: 'متاحف عالمية',
    worldClassMuseumsDesc: 'مجموعة فريدة من المتاحف تحتوي على كنوز مصر القديمة.',
    islamicArchitecture: 'عمارة إسلامية',
    islamicArchitectureDesc: 'مساجد وقصور تاريخية تعكس عظمة العمارة الإسلامية.',
    egyptianCuisine: 'مطبخ مصري',
    egyptianCuisineDesc: 'استمتع بالمأكولات المصرية التقليدية في المطاعم المحلية.',
    bestTimeToVisit: 'أفضل وقت لزيارة القاهرة',
    fall: 'الخريف (أكتوبر - نوفمبر)',
    fallDesc: 'أفضل وقت للزيارة مع طقس معتدل وحشود أقل. مثالي لاستكشاف المعالم التاريخية.',
    winter: 'الشتاء (ديسمبر - فبراير)',
    winterDesc: 'طقس دافئ وممتع (15-20°C). مثالي للزيارات الثقافية والجولات السياحية.',
    spring: 'الربيع (مارس - أبريل)',
    springDesc: 'طقس رائع لجميع الأنشطة مع ازدحام معتدل. مناسب لجميع أنواع الجولات.',
    summer: 'الصيف (مايو - سبتمبر)',
    summerDesc: 'حار جداً (35-40°C) لكن مثالي للزيارات الداخلية للمتاحف. أسعار أقل وحشود أقل.',
    travelTips: 'نصائح السفر في القاهرة',
    visa: '🛂 الفيزا',
    visaDesc: 'يمكن الحصول على فيزا عند الوصول في مطار القاهرة لمعظم الجنسيات.',
    currency: '💰 العملة',
    currencyDesc: 'الجنيه المصري (EGP) والعملات الأجنبية مقبولة في معظم الأماكن.',
    transportation: '🚕 النقل',
    transportationDesc: 'تتوفر سيارات الأجارة والحافلات والمترو. يمكن حجز نقل خاص مع مرشد.',
    accommodation: '🏨 الإقامة',
    accommodationDesc: 'مجموعة واسعة من الفنادق من الاقتصادية إلى الفاخرة في جميع أنحاء المدينة.',
    ctaTitle: 'ابدأ مغامرتك في القاهرة اليوم',
    ctaDesc: 'احجز رحلتك الآن واستمتع بتجربة ثقافية لا تُنسى في القاهرة مع أورلكسوس.',
    ctaButton: 'احجز رحلتك الآن'
  },
  en: {
    title: 'Cairo Tours: Complete Guide to Pyramids, Museums & Sightseeing',
    subtitle: 'Discover Egypt\'s historic capital with Pyramids tours, Egyptian Museum, Islamic Cairo, and Khan El Khalili. An unforgettable cultural experience.',
    explorePyramids: 'Explore Pyramids Tours',
    exploreMuseums: 'Explore Museums',
    topAttractions: 'Top Attractions in Cairo',
    greatPyramids: 'The Great Pyramids',
    greatPyramidsDesc: 'One of the Seven Wonders of the Ancient World. Explore the Giza Pyramids and Sphinx with a professional guide.',
    egyptianMuseum: 'Egyptian Museum',
    egyptianMuseumDesc: 'The largest museum in the world for ancient Egyptian antiquities. Enjoy viewing Tutankhamun\'s treasures.',
    islamicCairo: 'Islamic Cairo',
    islamicCairoDesc: 'Explore historic mosques, palaces, and traditional markets in Old Cairo.',
    khanElKhalili: 'Khan El Khalili',
    khanElKhaliliDesc: 'Famous traditional market selling souvenirs, antiques, and handmade products.',
    bookNow: 'Book Now',
    whyChoose: 'Why Choose Cairo?',
    richHistory: 'Rich History',
    richHistoryDesc: 'Over 7000 years of civilization, history, and archaeological sites.',
    worldClassMuseums: 'World-Class Museums',
    worldClassMuseumsDesc: 'Unique collection of museums containing treasures of ancient Egypt.',
    islamicArchitecture: 'Islamic Architecture',
    islamicArchitectureDesc: 'Historic mosques and palaces reflecting the greatness of Islamic architecture.',
    egyptianCuisine: 'Egyptian Cuisine',
    egyptianCuisineDesc: 'Enjoy traditional Egyptian food at local restaurants.',
    bestTimeToVisit: 'Best Time to Visit Cairo',
    fall: 'Fall (October - November)',
    fallDesc: 'The best time to visit with moderate temperatures and fewer crowds. Perfect for exploring historical sites.',
    winter: 'Winter (December - February)',
    winterDesc: 'Warm and pleasant weather (15-20°C). Ideal for cultural visits and sightseeing tours.',
    spring: 'Spring (March - April)',
    springDesc: 'Excellent weather for all activities with moderate crowds. Suitable for all types of tours.',
    summer: 'Summer (May - September)',
    summerDesc: 'Very hot (35-40°C) but perfect for indoor museum visits. Lower prices and fewer crowds.',
    travelTips: 'Cairo Travel Tips',
    visa: '🛂 Visa',
    visaDesc: 'Visa on arrival is available at Cairo airport for most nationalities.',
    currency: '💰 Currency',
    currencyDesc: 'Egyptian Pound (EGP) and foreign currencies are accepted in most places.',
    transportation: '🚕 Transportation',
    transportationDesc: 'Taxis, buses, and metro are available. Private transfers with guides can be arranged.',
    accommodation: '🏨 Accommodation',
    accommodationDesc: 'Wide range of hotels from budget to luxury options throughout the city.',
    ctaTitle: 'Start Your Cairo Adventure Today',
    ctaDesc: 'Book your trip now and enjoy an unforgettable cultural experience in Cairo with Orluxus.',
    ctaButton: 'Book Your Trip Now'
  }
};

export default function CairoToursPage() {
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
        background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.15) 0%, rgba(0, 242, 254, 0.15) 100%)',
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
            <Link href="/city/cairo/pyramids-tours" className="btn btn-primary">
              {t.explorePyramids}
            </Link>
            <Link href="/city/cairo/museum-tours" className="btn btn-secondary">
              {t.exploreMuseums}
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>🏛️</div>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.greatPyramids}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {t.greatPyramidsDesc}
              </p>
              <Link href="/city/cairo/pyramids-tours" className="btn btn-primary" style={{ width: '100%' }}>
                {t.bookNow}
              </Link>
            </div>

            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>🏺</div>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.egyptianMuseum}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {t.egyptianMuseumDesc}
              </p>
              <Link href="/city/cairo/museum-tours" className="btn btn-primary" style={{ width: '100%' }}>
                {t.bookNow}
              </Link>
            </div>

            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>🕌</div>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.islamicCairo}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {t.islamicCairoDesc}
              </p>
              <Link href="/city/cairo/islamic-cairo" className="btn btn-primary" style={{ width: '100%' }}>
                {t.bookNow}
              </Link>
            </div>

            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>🛍️</div>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.khanElKhalili}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {t.khanElKhaliliDesc}
              </p>
              <Link href="/city/cairo/islamic-cairo" className="btn btn-primary" style={{ width: '100%' }}>
                {t.bookNow}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Cairo */}
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
                {t.richHistory}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {t.richHistoryDesc}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏺</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.worldClassMuseums}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {t.worldClassMuseumsDesc}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🕌</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.islamicArchitecture}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {t.islamicArchitectureDesc}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {t.egyptianCuisine}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {t.egyptianCuisineDesc}
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
                  {t.fall}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {t.fallDesc}
                </p>
              </div>

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
          <div className="glass-card" style={{ padding: '3rem', borderRadius: '12px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%)' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              {t.ctaTitle}
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
              {t.ctaDesc}
            </p>
            <Link href="/city/cairo/pyramids-tours" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
              {t.ctaButton}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
