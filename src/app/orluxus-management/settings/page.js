'use client';

import { useState, useEffect } from 'react';

export default function AdminSettings() {
  const [siteName, setSiteName] = useState('ORLUXUS');
  const [whatsapp, setWhatsapp] = useState('+20100000000');
  const [currency, setCurrency] = useState('اليورو (€)');
  const [paypalEmail, setPaypalEmail] = useState('info@orluxus.com');
  
  const [allowReg, setAllowReg] = useState(true);
  const [allowPromo, setAllowPromo] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [commission, setCommission] = useState('10');

  const [email, setEmail] = useState('info@orluxus.com');
  const [facebook, setFacebook] = useState('https://facebook.com/orluxus');
  const [tiktok, setTiktok] = useState('https://www.tiktok.com/@orluxus?_r=1&_t=ZS-979ayAlnRlV');
  const [instagram, setInstagram] = useState('https://www.instagram.com/orluxus?igsh=N2lmbmg2eGJzNmVx');

  // Load from LocalStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSiteName = localStorage.getItem('orluxus_site_name');
      const savedWhatsapp = localStorage.getItem('orluxus_whatsapp');
      const savedCurrency = localStorage.getItem('orluxus_currency');
      const savedPaypalEmail = localStorage.getItem('orluxus_paypal_email');
      
      const savedAllowReg = localStorage.getItem('orluxus_allow_reg');
      const savedAllowPromo = localStorage.getItem('orluxus_allow_promo');
      const savedNotifyEmail = localStorage.getItem('orluxus_notify_email');
      const savedCommission = localStorage.getItem('orluxus_commission');

      // Load social media
      const savedEmail = localStorage.getItem('orluxus_email');
      const savedFacebook = localStorage.getItem('orluxus_facebook');
      const savedTiktok = localStorage.getItem('orluxus_tiktok');
      const savedInstagram = localStorage.getItem('orluxus_instagram');

      if (savedSiteName) setSiteName(savedSiteName);
      if (savedWhatsapp) setWhatsapp(savedWhatsapp);
      if (savedCurrency) setCurrency(savedCurrency);
      if (savedPaypalEmail) setPaypalEmail(savedPaypalEmail);
      
      if (savedAllowReg !== null) setAllowReg(savedAllowReg === 'true');
      if (savedAllowPromo !== null) setAllowPromo(savedAllowPromo === 'true');
      if (savedNotifyEmail !== null) setNotifyEmail(savedNotifyEmail === 'true');
      if (savedCommission) setCommission(savedCommission);

      if (savedEmail) setEmail(savedEmail);
      if (savedFacebook) setFacebook(savedFacebook);
      if (savedTiktok) setTiktok(savedTiktok);
      if (savedInstagram) setInstagram(savedInstagram);
    }
  }, []);

  // Save Settings to LocalStorage
  const handleSaveSettings = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('orluxus_site_name', siteName);
      localStorage.setItem('orluxus_whatsapp', whatsapp);
      localStorage.setItem('orluxus_currency', currency);
      localStorage.setItem('orluxus_paypal_email', paypalEmail);
      
      localStorage.setItem('orluxus_allow_reg', allowReg.toString());
      localStorage.setItem('orluxus_allow_promo', allowPromo.toString());
      localStorage.setItem('orluxus_notify_email', notifyEmail.toString());
      localStorage.setItem('orluxus_commission', commission);

      alert('✅ تم حفظ جميع الإعدادات بنجاح في متصفحك!');
      
      // Proactively reload/update global page titles if necessary
      window.location.reload();
    }
  };

  // Save Social Media
  const handleSaveSocialMedia = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('orluxus_email', email);
      localStorage.setItem('orluxus_facebook', facebook);
      localStorage.setItem('orluxus_tiktok', tiktok);
      localStorage.setItem('orluxus_instagram', instagram);

      alert('✅ تم حفظ روابط وسائل التواصل الاجتماعي بنجاح!');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', textAlign: 'right' }}>
      <div>
        <h2 style={{ color: 'var(--text-primary)', fontWeight: '800' }}>إعدادات المنصة</h2>
        <p style={{ color: 'var(--text-secondary)' }}>تخصيص الإعدادات العامة وبيانات التواصل وسياسات المنصة.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-xl)' }}>
        
        {/* Left side: General Settings */}
        <div className="glass-card animate-fade-in-up">
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>⚙️ الإعدادات العامة</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Site Name Input */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>اسم الموقع</label>
              <input 
                type="text" 
                value={siteName} 
                onChange={(e) => setSiteName(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  background: 'rgba(255,255,255,0.04)', 
                  color: 'white', 
                  border: '1px solid var(--border-medium)', 
                  borderRadius: '6px',
                  outline: 'none'
                }} 
              />
            </div>

            {/* Whatsapp Contact */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>رقم التواصل (WhatsApp)</label>
              <input 
                type="text" 
                value={whatsapp} 
                onChange={(e) => setWhatsapp(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  background: 'rgba(255,255,255,0.04)', 
                  color: 'white', 
                  border: '1px solid var(--border-medium)', 
                  borderRadius: '6px',
                  outline: 'none',
                  textAlign: 'left',
                  fontFamily: 'var(--font-en)'
                }} 
              />
            </div>

            {/* Default Currency */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>العملة الافتراضية</label>
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  background: 'var(--bg-tertiary)', 
                  color: 'white', 
                  border: '1px solid var(--border-medium)', 
                  borderRadius: '6px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="اليورو (€)">اليورو (€)</option>
                <option value="الدولار ($)">الدولار ($)</option>
                <option value="الجنيه المصري (EGP)">الجنيه المصري (EGP)</option>
              </select>
            </div>

            {/* PayPal Email */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>بريد PayPal المستلم</label>
              <input 
                type="email" 
                value={paypalEmail} 
                onChange={(e) => setPaypalEmail(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  background: 'rgba(255,255,255,0.04)', 
                  color: 'white', 
                  border: '1px solid var(--border-medium)', 
                  borderRadius: '6px',
                  outline: 'none',
                  textAlign: 'left',
                  fontFamily: 'var(--font-en)'
                }} 
              />
            </div>
            
            <button onClick={handleSaveSettings} className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '0.8rem' }}>
              💾 حفظ التغييرات العامة
            </button>
          </div>
        </div>

        {/* Right side: Agents & Commission Settings */}
        <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>👥 إعدادات الوكلاء والتسجيل</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Allow Auto Registration */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', cursor: 'pointer', userSelect: 'none' }}>
              <input 
                type="checkbox" 
                checked={allowReg} 
                onChange={(e) => setAllowReg(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span>السماح بتسجيل وكلاء جدد تلقائياً</span>
            </label>

            {/* Auto Upgrade to Silver */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', cursor: 'pointer', userSelect: 'none' }}>
              <input 
                type="checkbox" 
                checked={allowPromo} 
                onChange={(e) => setAllowPromo(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span>تفعيل الترقية التلقائية للمستوى الفضي</span>
            </label>

            {/* Email Notifications */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', cursor: 'pointer', userSelect: 'none' }}>
              <input 
                type="checkbox" 
                checked={notifyEmail} 
                onChange={(e) => setNotifyEmail(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span>إرسال إشعارات البريد الإلكتروني عند كل حجز</span>
            </label>
            
            {/* Default Direct Commission */}
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>نسبة خصم الوكيل المباشر الافتراضية (%)</label>
              <input 
                type="number" 
                value={commission} 
                onChange={(e) => setCommission(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  background: 'rgba(255,255,255,0.04)', 
                  color: 'white', 
                  border: '1px solid var(--border-medium)', 
                  borderRadius: '6px',
                  outline: 'none',
                  fontFamily: 'var(--font-en)'
                }} 
              />
            </div>
            
            <button onClick={handleSaveSettings} className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%', padding: '0.8rem' }}>
              💾 حفظ إعدادات الوكلاء
            </button>
          </div>
        </div>

        {/* Social Media Settings */}
        <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.2s', gridColumn: 'span 1' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>📱 وسائل التواصل الاجتماعي</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Email */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>📧 البريد الإلكتروني</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  background: 'rgba(255,255,255,0.04)', 
                  color: 'white', 
                  border: '1px solid var(--border-medium)', 
                  borderRadius: '6px',
                  outline: 'none'
                }} 
              />
            </div>

            {/* Facebook */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>👍 رابط فيسبوك</label>
              <input 
                type="url" 
                value={facebook} 
                onChange={(e) => setFacebook(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  background: 'rgba(255,255,255,0.04)', 
                  color: 'white', 
                  border: '1px solid var(--border-medium)', 
                  borderRadius: '6px',
                  outline: 'none',
                  direction: 'ltr'
                }} 
              />
            </div>

            {/* TikTok */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>🎵 رابط تيك توك</label>
              <input 
                type="url" 
                value={tiktok} 
                onChange={(e) => setTiktok(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  background: 'rgba(255,255,255,0.04)', 
                  color: 'white', 
                  border: '1px solid var(--border-medium)', 
                  borderRadius: '6px',
                  outline: 'none',
                  direction: 'ltr'
                }} 
              />
            </div>

            {/* Instagram */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>📷 رابط إنستغرام</label>
              <input 
                type="url" 
                value={instagram} 
                onChange={(e) => setInstagram(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  background: 'rgba(255,255,255,0.04)', 
                  color: 'white', 
                  border: '1px solid var(--border-medium)', 
                  borderRadius: '6px',
                  outline: 'none',
                  direction: 'ltr'
                }} 
              />
            </div>
            
            <button onClick={handleSaveSocialMedia} className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '0.8rem', background: 'linear-gradient(135deg, #c084fc, #7c3aed)' }}>
              💾 حفظ وسائل التواصل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
