import Navbar from '@/components/navigation/Navbar';

export default function EntertainmentPage() {
  return (
    <main style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar />
      
      {/* Hero */}
      <div style={{
        paddingTop: 'calc(var(--nav-height) + 4rem)',
        paddingBottom: '4rem',
        textAlign: 'center',
        background: 'var(--gradient-hero)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div className="container animate-fade-in-up">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎭</div>
          <h1 className="section-title">ترفيهي</h1>
          <p className="section-subtitle">أهم الفعاليات والحفلات الترفيهية في جميع أنحاء مصر</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)' }}>الفعاليات المتاحة</h2>
          <span className="badge badge-ocean">المتاح: 0 من أصل 20 خانة</span>
        </div>

        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem', opacity: 0.5 }}>🎟️</span>
          <h3 style={{ marginBottom: '1rem' }}>لا توجد فعاليات مضافة حالياً في هذا القسم</h3>
          <p style={{ color: 'var(--text-secondary)' }}>يمكنك إضافة الفعاليات في هذه القائمة من خلال لوحة تحكم الإدارة.</p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '2rem' }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{ 
                width: '40px', height: '40px', 
                borderRadius: '4px', border: '1px dashed var(--border-medium)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', color: 'var(--text-tertiary)'
              }}>
                {i+1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
