'use client';

import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import { useLanguage } from '@/context/LanguageContext';

export default function SharmElSheikhToursPage() {
  const { locale } = useLanguage();
  const isRTL = locale === 'ar';

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
            {locale === 'ar' ? 'رحلات شرم الشيخ: الدليل الكامل للأنشطة والجولات' : 'Sharm El Sheikh Tours: Complete Guide to Activities & Excursions'}
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: 'var(--text-secondary)',
            maxWidth: '800px',
            marginBottom: '2rem',
            lineHeight: '1.8'
          }}>
            {locale === 'ar' 
              ? 'اكتشف أجمل رحلات شرم الشيخ والأنشطة الترفيهية. جولات القارب الزجاجي، الغوص، رحلات الصحراء، وجولات المدينة مع أفضل العروض.'
              : 'Discover the beauty of Sharm El Sheikh with our comprehensive guide. Glass boat tours, snorkeling, diving, desert safaris, and city tours with the best deals.'
            }
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/city/sharm-el-sheikh/sea-trips" className="btn btn-primary">
              {locale === 'ar' ? 'استكشف رحلات البحر' : 'Explore Sea Trips'}
            </Link>
            <Link href="/city/sharm-el-sheikh/desert-safaris" className="btn btn-secondary">
              {locale === 'ar' ? 'استكشف رحلات الصحراء' : 'Explore Desert Safaris'}
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
            {locale === 'ar' ? 'أفضل الأنشطة في شرم الشيخ' : 'Top Activities in Sharm El Sheikh'}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Glass Boat Tours */}
            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>🚤</div>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {locale === 'ar' ? 'جولات القارب الزجاجي' : 'Glass Boat Tours'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {locale === 'ar'
                  ? 'استمتع بمشاهدة الشعاب المرجانية الملونة والأسماك الاستوائية من قارب زجاجي آمن ومريح.'
                  : 'Enjoy viewing colorful coral reefs and tropical fish from a safe and comfortable glass boat.'
                }
              </p>
              <Link href="/city/sharm-el-sheikh/sea-trips" className="btn btn-primary" style={{ width: '100%' }}>
                {locale === 'ar' ? 'احجز الآن' : 'Book Now'}
              </Link>
            </div>

            {/* Snorkeling & Diving */}
            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>🤿</div>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {locale === 'ar' ? 'الغوص وال Snorkeling' : 'Snorkeling & Diving'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {locale === 'ar'
                  ? 'استكشف عالم البحار الساحر مع أفضل مواقع الغوص في شرم الشيخ وشعابها المرجانية الشهيرة.'
                  : 'Explore the magical underwater world with the best diving spots in Sharm El Sheikh and its famous coral reefs.'
                }
              </p>
              <Link href="/city/sharm-el-sheikh/sea-trips" className="btn btn-primary" style={{ width: '100%' }}>
                {locale === 'ar' ? 'احجز الآن' : 'Book Now'}
              </Link>
            </div>

            {/* Desert Safari */}
            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>🏜️</div>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {locale === 'ar' ? 'رحلات السفاري الصحراوية' : 'Desert Safari Adventures'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {locale === 'ar'
                  ? 'مغامرة مثيرة في الصحراء مع ركوب الجمال، ركوب quad bike، وعشاء بدوي تقليدي.'
                  : 'An exciting desert adventure with camel riding, quad biking, and traditional Bedouin dinner.'
                }
              </p>
              <Link href="/city/sharm-el-sheikh/desert-safaris" className="btn btn-primary" style={{ width: '100%' }}>
                {locale === 'ar' ? 'احجز الآن' : 'Book Now'}
              </Link>
            </div>

            {/* City Tours */}
            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>🏙️</div>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {locale === 'ar' ? 'جولات المدينة' : 'City Tours'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {locale === 'ar'
                  ? 'استكشف السوق القديم، نعمة باي، ومناطق التسوق والترفيه في شرم الشيخ.'
                  : 'Explore the Old Market, Naama Bay, and shopping and entertainment areas in Sharm El Sheikh.'
                }
              </p>
              <Link href="/city/sharm-el-sheikh/city-tours" className="btn btn-primary" style={{ width: '100%' }}>
                {locale === 'ar' ? 'احجز الآن' : 'Book Now'}
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
            {locale === 'ar' ? 'لماذا تختار شرم الشيخ؟' : 'Why Choose Sharm El Sheikh?'}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌊</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {locale === 'ar' ? 'شواطئ خلابة' : 'Stunning Beaches'}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {locale === 'ar' ? 'شواطئ رملية بيضاء ومياه صافية مثالية للسباحة والاسترخاء.' : 'White sandy beaches and crystal clear waters perfect for swimming and relaxation.'}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐠</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {locale === 'ar' ? 'شعاب مرجانية' : 'Coral Reefs'}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {locale === 'ar' ? 'من بين أفضل الشعاب المرجانية في العالم للغوص وال snorkeling.' : 'Among the best coral reefs in the world for diving and snorkeling.'}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☀️</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {locale === 'ar' ? 'طقس مشمس' : 'Sunny Weather'}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {locale === 'ar' ? 'أكثر من 300 يوم مشمس في السنة، مثالي للسياحة على مدار العام.' : 'Over 300 sunny days per year, perfect for year-round tourism.'}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {locale === 'ar' ? 'حياة ليلية نابضة' : 'Vibrant Nightlife'}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {locale === 'ar' ? 'مطاعم، كافيهات، وأماكن ترفيهية مفتوحة حتى وقت متأخر.' : 'Restaurants, cafes, and entertainment venues open late into the night.'}
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
            {locale === 'ar' ? 'أفضل وقت لزيارة شرم الشيخ' : 'Best Time to Visit Sharm El Sheikh'}
          </h2>
          
          <div className="glass-card" style={{ padding: '3rem', borderRadius: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--gold-600)' }}>
                  {locale === 'ar' ? 'الشتاء (ديسمبر - فبراير)' : 'Winter (December - February)'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {locale === 'ar'
                    ? 'موسم الذروة السياحية مع طقس دافئ وممتع (20-25°C). مثالي للسباحة والرحلات البحرية.'
                    : 'Peak tourist season with warm and pleasant weather (20-25°C). Perfect for swimming and sea trips.'
                  }
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--gold-600)' }}>
                  {locale === 'ar' ? 'الربيع (مارس - أبريل)' : 'Spring (March - April)'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {locale === 'ar'
                    ? 'طقس رائع لجميع الأنشطة مع ازدحام معتدل. مناسب للغوص والرحلات الصحراوية.'
                    : 'Excellent weather for all activities with moderate crowds. Suitable for diving and desert adventures.'
                  }
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--gold-600)' }}>
                  {locale === 'ar' ? 'الخريف (أكتوبر - نوفمبر)' : 'Fall (October - November)'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {locale === 'ar'
                    ? 'أفضل وقت للزيارة مع طقس معتدل وحشود أقل. مثالي لجميع أنواع الرحلات.'
                    : 'The best time to visit with moderate temperatures and fewer crowds. Perfect for all types of tours.'
                  }
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--gold-600)' }}>
                  {locale === 'ar' ? 'الصيف (مايو - سبتمبر)' : 'Summer (May - September)'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {locale === 'ar'
                    ? 'حار جداً (35-40°C) لكن مثالي للغوص والرحلات البحرية. أسعار أقل وحشود أقل.'
                    : 'Very hot (35-40°C) but perfect for diving and sea trips. Lower prices and fewer crowds.'
                  }
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
            {locale === 'ar' ? 'نصائح السفر في شرم الشيخ' : 'Sharm El Sheikh Travel Tips'}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {locale === 'ar' ? '🛂 الفيزا' : '🛂 Visa'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {locale === 'ar'
                  ? 'يمكن الحصول على فيزا عند الوصول في مطار شرم الشيخ لمعظم الجنسيات.'
                  : 'Visa on arrival is available at Sharm El Sheikh airport for most nationalities.'
                }
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {locale === 'ar' ? '💰 العملة' : '💰 Currency'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {locale === 'ar'
                  ? 'الجنيه المصري (EGP) والعملات الأجنبية مقبولة في معظم الأماكن.'
                  : 'Egyptian Pound (EGP) and foreign currencies are accepted in most places.'
                }
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {locale === 'ar' ? '🚕 النقل' : '🚕 Transportation'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {locale === 'ar'
                  ? 'تتوفر سيارات الأجرة والحافلات. يمكن حجز نقل خاص من المطار.'
                  : 'Taxis and buses are available. Private transfers from the airport can be arranged.'
                }
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {locale === 'ar' ? '🏨 الإقامة' : '🏨 Accommodation'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {locale === 'ar'
                  ? 'مجموعة واسعة من الفنادق والمنتجعات من الاقتصادية إلى الفاخرة.'
                  : 'Wide range of hotels and resorts from budget to luxury options.'
                }
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
              {locale === 'ar' ? 'ابدأ مغامرتك في شرم الشيخ اليوم' : 'Start Your Sharm El Sheikh Adventure Today'}
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
              {locale === 'ar'
                ? 'احجز رحلتك الآن واستمتع بتجربة سياحية لا تُنسى في شرم الشيخ مع أورلكسوس.'
                : 'Book your trip now and enjoy an unforgettable tourism experience in Sharm El Sheikh with Orluxus.'
              }
            </p>
            <Link href="/city/sharm-el-sheikh/sea-trips" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
              {locale === 'ar' ? 'احجز رحلتك الآن' : 'Book Your Trip Now'}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
