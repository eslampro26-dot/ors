'use client';

import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import OptimizedImage from '@/components/OptimizedImage';
import { useLanguage } from '@/context/LanguageContext';


export default function EgyptToursPage() {
  const { locale } = useLanguage();
  const isRTL = locale === 'ar';

  return (
    <main style={{ minHeight: '100vh', background: 'transparent' }}>
      <Navbar />
      
      {/* Hero Section */}
      <section style={{
        paddingTop: 'calc(var(--nav-height) + 4rem)',
        paddingBottom: '4rem',
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
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
            {locale === 'ar' ? 'رحلات مصر: الدليل الشامل للسياحة في مصر 2024' : 'Egypt Tours: The Ultimate Travel Guide for 2024'}
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: 'var(--text-secondary)',
            maxWidth: '800px',
            marginBottom: '2rem',
            lineHeight: '1.8'
          }}>
            {locale === 'ar' 
              ? 'اكتشف أجمل رحلات مصر والسياحة في هذا البلد العريق. دليلك الشامل لزيارة القاهرة، شرم الشيخ، الغردقة، الأقصر، أسوان، ودبي مع أفضل العروض والأسعار.'
              : 'Discover the beauty of Egypt with our comprehensive travel guide. Your complete resource for visiting Cairo, Sharm El Sheikh, Hurghada, Luxor, Aswan, and Dubai with the best deals and prices.'
            }
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/city/sharm-el-sheikh/sea-trips" className="btn btn-primary">
              {locale === 'ar' ? 'استكشف رحلات شرم الشيخ' : 'Explore Sharm El Sheikh Tours'}
            </Link>
            <Link href="/city/hurghada/sea-trips" className="btn btn-secondary">
              {locale === 'ar' ? 'استكشف رحلات الغردقة' : 'Explore Hurghada Tours'}
            </Link>
          </div>
        </div>
      </section>

      {/* Best Cities to Visit */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '3rem',
            color: 'var(--text-primary)',
            textAlign: isRTL ? 'right' : 'left'
          }}>
            {locale === 'ar' ? 'أفضل المدن للزيارة في مصر' : 'Best Cities to Visit in Egypt'}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Sharm El Sheikh */}
            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>⛵</div>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {locale === 'ar' ? 'شرم الشيخ' : 'Sharm El Sheikh'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {locale === 'ar'
                  ? 'وجهة سياحية عالمية مشهورة بشواطئها الخلابة ومرافق الغوص المتميزة والأنشطة الترفيهية المتنوعة.'
                  : 'A world-renowned destination famous for its stunning beaches, excellent diving facilities, and diverse entertainment activities.'
                }
              </p>
              <Link href="/city/sharm-el-sheikh/sea-trips" className="btn btn-primary" style={{ width: '100%' }}>
                {locale === 'ar' ? 'اكتشف المزيد' : 'Discover More'}
              </Link>
            </div>

            {/* Hurghada */}
            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>🏖️</div>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {locale === 'ar' ? 'الغردقة' : 'Hurghada'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {locale === 'ar'
                  ? 'مدينة ساحلية ساحرة تتميز بجزرها الجميلة وشعابها المرجانية الغنية والحياة الليلية النابضة.'
                  : 'A charming coastal city featuring beautiful islands, rich coral reefs, and vibrant nightlife.'
                }
              </p>
              <Link href="/city/hurghada/sea-trips" className="btn btn-primary" style={{ width: '100%' }}>
                {locale === 'ar' ? 'اكتشف المزيد' : 'Discover More'}
              </Link>
            </div>

            {/* Cairo */}
            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>🏛️</div>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {locale === 'ar' ? 'القاهرة' : 'Cairo'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {locale === 'ar'
                  ? 'عاصمة مصر التاريخية التي تضم الأهرامات العظيمة والمتاحف الشهيرة والأسواق التقليدية.'
                  : 'Egypt\'s historic capital featuring the Great Pyramids, famous museums, and traditional markets.'
                }
              </p>
              <Link href="/city/cairo/pyramids-tours" className="btn btn-primary" style={{ width: '100%' }}>
                {locale === 'ar' ? 'اكتشف المزيد' : 'Discover More'}
              </Link>
            </div>

            {/* Luxor & Aswan */}
            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem' }}>👑</div>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {locale === 'ar' ? 'الأقصر وأسوان' : 'Luxor & Aswan'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {locale === 'ar'
                  ? 'موطن الحضارة المصرية القديمة مع معابد ضخمة وادي الملوك والرحلات النيلية الساحرة.'
                  : 'Home to ancient Egyptian civilization with massive temples, the Valley of the Kings, and enchanting Nile cruises.'
                }
              </p>
              <Link href="/city/luxor/east-bank" className="btn btn-primary" style={{ width: '100%' }}>
                {locale === 'ar' ? 'اكتشف المزيد' : 'Discover More'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Types of Tours */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-tertiary)' }}>
        <div className="container">
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '3rem',
            color: 'var(--text-primary)',
            textAlign: isRTL ? 'right' : 'left'
          }}>
            {locale === 'ar' ? 'أنواع الرحلات المتاحة في مصر' : 'Types of Tours Available in Egypt'}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⛵</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {locale === 'ar' ? 'رحلات بحرية' : 'Sea Trips'}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {locale === 'ar' ? 'جولات القارب الزجاجي، الغوص، وال snorkeling' : 'Glass boat tours, diving, and snorkeling'}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏜️</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {locale === 'ar' ? 'رحلات صحراوية' : 'Desert Safaris'}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {locale === 'ar' ? 'رحلات السفاري، ركوب الجمال، وعشاء البدو' : 'Safari adventures, camel rides, and Bedouin dinners'}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏛️</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {locale === 'ar' ? 'جولات المدن' : 'City Tours'}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {locale === 'ar' ? 'جولات سياحية في المدن والمتاحف والأسواق' : 'Sightseeing tours, museums, and markets'}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👑</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {locale === 'ar' ? 'رحلات فاخرة' : 'Luxury Tours'}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {locale === 'ar' ? 'تجارب VIP وخدمات فاخرة حصرية' : 'VIP experiences and exclusive luxury services'}
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
            {locale === 'ar' ? 'أفضل وقت لزيارة مصر' : 'Best Time to Visit Egypt'}
          </h2>
          
          <div className="glass-card" style={{ padding: '3rem', borderRadius: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--gold-600)' }}>
                  {locale === 'ar' ? 'الخريف (أكتوبر - نوفمبر)' : 'Fall (October - November)'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {locale === 'ar'
                    ? 'أفضل وقت للزيارة مع طقس معتدل وحشود أقل. مثالي لاستكشاف المعالم التاريخية والقيام بالرحلات البحرية.'
                    : 'The best time to visit with moderate temperatures and fewer crowds. Perfect for exploring historical sites and sea trips.'
                  }
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--gold-600)' }}>
                  {locale === 'ar' ? 'الشتاء (ديسمبر - فبراير)' : 'Winter (December - February)'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {locale === 'ar'
                    ? 'موسم الذروة السياحية مع طقس دافئ وممتع. مثالي للزيارات الثقافية والرحلات الصحراوية.'
                    : 'Peak tourist season with warm and pleasant weather. Ideal for cultural visits and desert adventures.'
                  }
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--gold-600)' }}>
                  {locale === 'ar' ? 'الربيع (مارس - أبريل)' : 'Spring (March - April)'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {locale === 'ar'
                    ? 'طقس رائع للأنشطة الخارجية مع ازدحام معتدل. مناسب لجميع أنواع الرحلات.'
                    : 'Excellent weather for outdoor activities with moderate crowds. Suitable for all types of tours.'
                  }
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--gold-600)' }}>
                  {locale === 'ar' ? 'الصيف (مايو - سبتمبر)' : 'Summer (May - September)'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {locale === 'ar'
                    ? 'حار جداً لكن مثالي للرحلات البحرية والغوص. أسعار أقل وحشود أقل.'
                    : 'Very hot but perfect for sea trips and diving. Lower prices and fewer crowds.'
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
            {locale === 'ar' ? 'نصائح السفر في مصر' : 'Egypt Travel Tips'}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {locale === 'ar' ? '🛂 الفيزا' : '🛂 Visa'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {locale === 'ar'
                  ? 'معظم الجنسيات يمكنها الحصول على فيزا عند الوصول أو e-visa عبر الإنترنت. تحقق من متطلبات بلدك قبل السفر.'
                  : 'Most nationalities can get visa on arrival or e-visa online. Check your country\'s requirements before traveling.'
                }
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {locale === 'ar' ? '💰 العملة' : '💰 Currency'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {locale === 'ar'
                  ? 'الجنيه المصري (EGP) هو العملة الرسمية. يمكنك استخدام البطاقات الدولية في معظم الأماكن.'
                  : 'Egyptian Pound (EGP) is the official currency. International cards are accepted in most places.'
                }
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {locale === 'ar' ? '🛡️ السلامة' : '🛡️ Safety'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {locale === 'ar'
                  ? 'مصر آمنة للسياح. اتبع النصائح الأساسية وتجنب المناطق النائية غير الموصى بها.'
                  : 'Egypt is safe for tourists. Follow basic precautions and avoid remote areas not recommended for travel.'
                }
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {locale === 'ar' ? '🚕 النقل' : '🚕 Transportation'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {locale === 'ar'
                  ? 'تتوفر سيارات الأجرة، الحافلات، والقطارات بين المدن. يمكن حجز نقل خاص مع مرشدين.'
                  : 'Taxis, buses, and trains are available between cities. Private transfers with guides can be arranged.'
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="glass-card" style={{ padding: '3rem', borderRadius: '12px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              {locale === 'ar' ? 'ابدأ مغامرتك في مصر اليوم' : 'Start Your Egypt Adventure Today'}
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
              {locale === 'ar'
                ? 'احجز رحلتك الآن واستمتع بتجربة سياحية لا تُنسى مع أورلكسوس. نقدم أفضل الأسعار والخدمات.'
                : 'Book your trip now and enjoy an unforgettable tourism experience with Orluxus. We offer the best prices and services.'
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
