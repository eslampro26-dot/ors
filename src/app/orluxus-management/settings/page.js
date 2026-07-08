'use client';

import { useState, useEffect } from 'react';

export default function AdminSettings() {
  const [siteName, setSiteName] = useState('ORLUXUS');
  const [whatsapp, setWhatsapp] = useState('+20100000000');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [currency, setCurrency] = useState('اليورو (€)');
  const [paypalEmail, setPaypalEmail] = useState('info@orluxus.com');

  // SMTP Email Settings
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [companyEmail, setCompanyEmail] = useState('info@orluxus.com');
  const [smtpTestStatus, setSmtpTestStatus] = useState(''); // '', 'testing', 'ok', 'fail'

  const [additionalPrices, setAdditionalPrices] = useState({
    'sea-trips': { economy: '', business: '', vip: '' },
    'desert-trips': { economy: '', business: '', vip: '' },
    'city-tours': { economy: '', business: '', vip: '' },
    'packages': { economy: '', business: '', vip: '' },
    'restaurants': { economy: '', business: '', vip: '' },
    'entertainment': { economy: '', business: '', vip: '' }
  });
  
  const defaultAddons = [
    { id: 'guide', nameEn: 'Private Tour Guide', nameAr: 'مرشد سياحي خاص', price: 25, unit: 'booking', descAr: 'مرشد سياحي مرخص يرافقكم طوال الرحلة لشرح المعالم وتسهيل الدخول.', descEn: 'A licensed tour guide to accompany you throughout the trip.' },
    { id: 'lunch', nameEn: 'Lunch & Soft Drinks / person', nameAr: 'وجبة غداء ومشروبات / للفرد', price: 15, unit: 'person', descAr: 'وجبة غداء بوفيه مفتوح أو قائمة طعام محددة مع مشروبات غازية ومياه معدنية.', descEn: 'Buffet or set menu lunch with soft drinks and mineral water.' },
    { id: 'transfer', nameEn: 'Round-trip Private Transfer', nameAr: 'انتقالات خاصة ذهاب وعودة', price: 30, unit: 'booking', descAr: 'سيارة خاصة حديثة ومكيفة تنقلكم من الفندق إلى مكان الرحلة وتعود بكم بعد الانتهاء.', descEn: 'Modern private air-conditioned vehicle to and from your hotel.' },
    { id: 'photos', nameEn: 'Professional Photography Session', nameAr: 'جلسة تصوير احترافية', price: 20, unit: 'booking', descAr: 'مصور محترف يرافقكم لالتقاط أجمل اللحظات وتسليمكم الصور بنظام رقمي عالي الجودة.', descEn: 'A professional photographer to capture your best memories.' },
  ];
  const [checkoutAddons, setCheckoutAddons] = useState(defaultAddons);
  
  const [allowReg, setAllowReg] = useState(true);
  const [allowPromo, setAllowPromo] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [commission, setCommission] = useState('10');

  const [email, setEmail] = useState('info@orluxus.com');
  const [facebook, setFacebook] = useState('https://facebook.com/orluxus');
  const [tiktok, setTiktok] = useState('https://www.tiktok.com/@orluxus?_r=1&_t=ZS-979ayAlnRlV');
  const [instagram, setInstagram] = useState('https://www.instagram.com/orluxus?igsh=N2lmbmg2eGJzNmVx');

  // Policy & Content States
  const [vision, setVision] = useState('رؤيتنا هي تقديم أرقى مستويات الخدمة السياحية الفاخرة في مصر بروح عائلية دافئة، لتكون كل رحلة قصة لا تُنسى لضيوفنا.');
  const [goals, setGoals] = useState('نهدف إلى توفير حجز فوري آمن، وتنظيم رحلات استثنائية ذات جودة عالية، وتوفير أقصى درجات الراحة والأمان لعملائنا.');
  const [sustainability, setSustainability] = useState('نلتزم في أورلوكسوس بحماية البيئة البحرية والشواطئ المصرية، ودعم المجتمعات المحلية عبر توفير فرص عمل مستدامة وتطبيق أعلى معايير السياحة الخضراء.');
  const [staff, setStaff] = useState('فريقنا يتكون من مرشدين سياحيين محترفين وخبراء محليين مدربين على أعلى معايير الضيافة والسلامة لضمان خدمة استثنائية على مدار الساعة.');
  const [legalCompany, setLegalCompany] = useState('أورلوكسوس هي شركة سياحية مسجلة ومرخصة رسمياً من وزارة السياحة المصرية، وتخضع للقوانين المصرية المنظمة للنشاط السياحي.');
  const [legalCancellation, setLegalCancellation] = useState('يمكن إلغاء الحجز مجاناً قبل 48 ساعة من موعد الرحلة. في حال الإلغاء المتأخر أو عدم الحضور، يتم تطبيق رسوم إلغاء تعادل قيمة الليلة الأولى أو 50% من قيمة الرحلة حسب نوع البرنامج.');
  const [dataProtection, setDataProtection] = useState('نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. لن يتم مشاركة معلوماتك أو تفاصيل حجزك مع أي أطراف ثالثة إلا لغرض إتمام الحجز وتقديم الخدمة.');

  // Load from API on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.siteName) setSiteName(data.siteName);
          if (data.whatsapp) setWhatsapp(data.whatsapp);
          if (data.emergencyPhone !== undefined) setEmergencyPhone(data.emergencyPhone);
          if (data.currency) setCurrency(data.currency);
          if (data.paypalEmail) setPaypalEmail(data.paypalEmail);
          if (data.checkoutAddons) setCheckoutAddons(data.checkoutAddons);
          if (data.additionalPrices) setAdditionalPrices(data.additionalPrices);

          // SMTP Settings
          if (data.smtpHost) setSmtpHost(data.smtpHost);
          if (data.smtpPort) setSmtpPort(data.smtpPort);
          if (data.smtpUser) setSmtpUser(data.smtpUser);
          if (data.smtpPass) setSmtpPass(data.smtpPass);
          if (data.companyEmail) setCompanyEmail(data.companyEmail);
          
          if (data.allowReg !== undefined) setAllowReg(data.allowReg === true || data.allowReg === 'true');
          if (data.allowPromo !== undefined) setAllowPromo(data.allowPromo === true || data.allowPromo === 'true');
          if (data.notifyEmail !== undefined) setNotifyEmail(data.notifyEmail === true || data.notifyEmail === 'true');
          if (data.commission) setCommission(data.commission);

          if (data.email) setEmail(data.email);
          if (data.facebook) setFacebook(data.facebook);
          if (data.tiktok) setTiktok(data.tiktok);
          if (data.instagram) setInstagram(data.instagram);

          if (data.vision) setVision(data.vision);
          if (data.goals) setGoals(data.goals);
          if (data.sustainability) setSustainability(data.sustainability);
          if (data.staff) setStaff(data.staff);
          if (data.legalCompany) setLegalCompany(data.legalCompany);
          if (data.legalCancellation) setLegalCancellation(data.legalCancellation);
          if (data.dataProtection) setDataProtection(data.dataProtection);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  // Save Settings to Database
  const handleSaveSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName,
          whatsapp,
          emergencyPhone,
          currency,
          paypalEmail,
          allowReg,
          allowPromo,
          notifyEmail,
          commission,
          checkoutAddons,
          additionalPrices,
          smtpHost,
          smtpPort,
          smtpUser,
          smtpPass,
          companyEmail,
        })
      });
      if (res.ok) {
        alert('✅ تم حفظ جميع الإعدادات بنجاح في قاعدة البيانات!');
      } else {
        alert('❌ فشل حفظ الإعدادات!');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('❌ فشل حفظ الإعدادات!');
    }
  };

  // Save Social Media
  const handleSaveSocialMedia = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'social',
          data: {
            email,
            facebook,
            tiktok,
            instagram
          }
        })
      });
      if (res.ok) {
        alert('✅ تم حفظ روابط وسائل التواصل الاجتماعي بنجاح!');
      } else {
        alert('❌ فشل حفظ روابط التواصل!');
      }
    } catch (err) {
      console.error('Error saving social media settings:', err);
      alert('❌ فشل حفظ روابط التواصل!');
    }
  };

  // Save Policy & About Contents
  const handleSaveContent = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vision,
          goals,
          sustainability,
          staff,
          legalCompany,
          legalCancellation,
          dataProtection
        })
      });
      if (res.ok) {
        alert('✅ تم حفظ نصوص السياسات والتعريف بنجاح!');
      } else {
        alert('❌ فشل حفظ نصوص السياسات!');
      }
    } catch (err) {
      console.error('Error saving policies:', err);
      alert('❌ فشل حفظ نصوص السياسات!');
    }
  };

  const handleTestSmtp = async () => {
    if (!smtpUser || !smtpPass) {
      alert('الرجاء إدخال الإيميل وكلمة المرور أولاً لتجربة الاتصال!');
      return;
    }
    setSmtpTestStatus('testing');
    try {
      const res = await fetch('/api/send-booking-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          smtpHost,
          smtpPort,
          smtpUser,
          smtpPass,
          companyEmail,
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSmtpTestStatus('ok');
          alert('✅ تم الاتصال وإرسال إيميل التجربة بنجاح إلى: ' + companyEmail);
        } else {
          setSmtpTestStatus('fail');
          alert('❌ فشل الاتصال: ' + (data.error || 'خطأ غير معروف'));
        }
      } else {
        setSmtpTestStatus('fail');
        alert('❌ فشل الاتصال بالخادم!');
      }
    } catch (err) {
      console.error(err);
      setSmtpTestStatus('fail');
      alert('❌ حدث خطأ غير متوقع أثناء الاتصال!');
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

            {/* Emergency Contact */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>رقم الطوارئ</label>
              <input 
                type="text" 
                value={emergencyPhone} 
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="+201..."
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

        {/* SMTP Email Settings Card */}
        <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>📧 إعدادات البريد الإلكتروني (SMTP)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* SMTP Host */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>خادم SMTP (SMTP Host)</label>
              <input 
                type="text" 
                value={smtpHost} 
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="smtp.gmail.com"
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

            {/* SMTP Port */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>منفذ SMTP (SMTP Port)</label>
              <input 
                type="text" 
                value={smtpPort} 
                onChange={(e) => setSmtpPort(e.target.value)}
                placeholder="587"
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

            {/* SMTP User */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>إيميل المُرسِل (SMTP User)</label>
              <input 
                type="email" 
                value={smtpUser} 
                onChange={(e) => setSmtpUser(e.target.value)}
                placeholder="example@gmail.com"
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

            {/* SMTP Password */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>كلمة مرور التطبيق (App Password)</label>
              <input 
                type="password" 
                value={smtpPass} 
                onChange={(e) => setSmtpPass(e.target.value)}
                placeholder="••••••••••••••••"
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

            {/* Company Notification Email */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>إيميل الشركة المستلم للفواتير</label>
              <input 
                type="email" 
                value={companyEmail} 
                onChange={(e) => setCompanyEmail(e.target.value)}
                placeholder="info@orluxus.com"
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

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button 
                onClick={handleSaveSettings} 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '0.8rem' }}
              >
                💾 حفظ الإعدادات
              </button>
              <button 
                onClick={handleTestSmtp} 
                className="btn btn-secondary" 
                style={{ 
                  padding: '0.8rem 1.2rem', 
                  background: smtpTestStatus === 'ok' ? '#10b981' : smtpTestStatus === 'fail' ? '#ef4444' : 'transparent',
                  color: smtpTestStatus === 'ok' || smtpTestStatus === 'fail' ? 'white' : 'var(--text-primary)'
                }}
                disabled={smtpTestStatus === 'testing'}
              >
                {smtpTestStatus === 'testing' ? '⏳ جاري الفحص...' : '⚡ تجربة الاتصال'}
              </button>
            </div>
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

        {/* أسعار الأشخاص الإضافيين حسب فئة الخدمة والدرجة */}
        <div className="glass-card animate-fade-in-up" style={{ gridColumn: 'span 2', animationDelay: '0.25s' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>💰 أسعار الأشخاص الإضافيين حسب القسم والفئة</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            حدد سعر الفرد الإضافي (من الشخص الثاني فما فوق) لكل قسم وفئة خدمة. إذا تُرِك فارغاً، سيتم احتساب السعر الكامل للشخص الإضافي.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[
              { id: 'sea-trips', name: '⛵ الرحلات البحرية (Sea Trips)' },
              { id: 'desert-trips', name: '🏜️ الرحلات الصحراوية (Desert Trips)' },
              { id: 'city-tours', name: '🏛️ جولات المدينة (City Tours)' },
              { id: 'packages', name: '📦 باكدجات مصر الشاملة (Packages)' },
              { id: 'restaurants', name: '🍽️ حجوزات المطاعم (Restaurants)' },
              { id: 'entertainment', name: '🎭 العروض والترفيه (Entertainment)' }
            ].map(cat => (
              <div key={cat.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ color: 'var(--gold-400)', marginBottom: '0.8rem', borderBottom: '1px dashed rgba(255,255,255,0.05)', paddingBottom: '0.4rem' }}>{cat.name}</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['economy', 'business', 'vip'].map(tier => (
                    <div key={tier} style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'capitalize' }}>
                        {tier === 'economy' ? 'اقتصادي' : tier === 'business' ? 'بيزنس' : 'VIP'}
                      </label>
                      <input
                        type="number"
                        style={{ 
                          width: '100%', 
                          padding: '6px 10px', 
                          background: 'rgba(255,255,255,0.04)', 
                          color: 'white', 
                          border: '1px solid var(--border-medium)', 
                          borderRadius: '4px',
                          outline: 'none',
                          fontSize: '0.85rem'
                        }}
                        value={additionalPrices[cat.id]?.[tier] || ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          setAdditionalPrices(prev => ({
                            ...prev,
                            [cat.id]: {
                              ...prev[cat.id],
                              [tier]: val
                            }
                          }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <button onClick={handleSaveSettings} className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%', padding: '0.8rem' }}>
            💾 حفظ أسعار الأشخاص الإضافيين
          </button>
        </div>
      </div>

      {/* 📄 إدارة نصوص التعريف والسياسات (About Us & Policies) */}
      <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.3s', marginTop: 'var(--space-md)' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>📄 إدارة نصوص التعريف والسياسات (تظهر للعملاء في الفوتر)</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Column 1: About Us */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ color: 'var(--gold-400)', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '0.3rem' }}>عن أورلوكسوس</h4>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>رؤيتنا</label>
              <textarea value={vision} onChange={(e) => setVision(e.target.value)} rows="3" style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '6px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>أهدافنا</label>
              <textarea value={goals} onChange={(e) => setGoals(e.target.value)} rows="3" style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '6px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>الاستدامة</label>
              <textarea value={sustainability} onChange={(e) => setSustainability(e.target.value)} rows="3" style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '6px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>موظفونا</label>
              <textarea value={staff} onChange={(e) => setStaff(e.target.value)} rows="3" style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '6px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
          </div>

          {/* Column 2: Legal & Data Protection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ color: 'var(--gold-400)', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '0.3rem' }}>السياسات والقانونية</h4>

            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>الوضع القانوني للشركة</label>
              <textarea value={legalCompany} onChange={(e) => setLegalCompany(e.target.value)} rows="3" style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '6px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>سياسة الإلغاء</label>
              <textarea value={legalCancellation} onChange={(e) => setLegalCancellation(e.target.value)} rows="4" style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '6px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>حماية البيانات والخصوصية</label>
              <textarea value={dataProtection} onChange={(e) => setDataProtection(e.target.value)} rows="4" style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '6px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
          </div>
        </div>

        {/* Section 6: Checkout Add-ons (الخدمات الإضافية في صفحة الدفع) */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">الخدمات الإضافية في صفحة الدفع (Checkout Add-ons)</h2>
          </div>
          <div className="admin-card-body">
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              هذه الإضافات ستظهر للعميل أثناء عملية الحجز ليتمكن من اختيارها. يمكنك تعديل أسعارها ومسمياتها بحرية.
            </p>
            {checkoutAddons.map((addon, index) => (
              <div key={addon.id || index} style={{ marginBottom: '1.2rem', padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>

                {/* Header: title + delete */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: '700', color: 'var(--gold-400)', fontSize: '0.9rem' }}>
                    #{index + 1} — {addon.nameAr || addon.nameEn || 'خدمة جديدة'}
                  </span>
                  <button
                    onClick={() => setCheckoutAddons(checkoutAddons.filter((_, i) => i !== index))}
                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '6px', padding: '4px 14px', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    🗑️ حذف
                  </button>
                </div>

                {/* Row 1: Names */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 'bold' }}>الاسم بالعربية</label>
                    <input type="text" value={addon.nameAr}
                      onChange={(e) => { const n=[...checkoutAddons]; n[index]={...n[index],nameAr:e.target.value}; setCheckoutAddons(n); }}
                      style={{ width:'100%', padding:'8px 12px', background:'rgba(255,255,255,0.05)', color:'white', border:'1px solid var(--border-medium)', borderRadius:'6px', outline:'none', boxSizing:'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 'bold' }}>الاسم بالإنجليزية</label>
                    <input type="text" value={addon.nameEn}
                      onChange={(e) => { const n=[...checkoutAddons]; n[index]={...n[index],nameEn:e.target.value}; setCheckoutAddons(n); }}
                      style={{ width:'100%', padding:'8px 12px', background:'rgba(255,255,255,0.05)', color:'white', border:'1px solid var(--border-medium)', borderRadius:'6px', outline:'none', fontFamily:'var(--font-en)', boxSizing:'border-box' }}
                    />
                  </div>
                </div>

                {/* Row 2: Price + Unit */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 'bold' }}>السعر (€)</label>
                    <input type="number" value={addon.price}
                      onChange={(e) => { const n=[...checkoutAddons]; n[index]={...n[index],price:Number(e.target.value)}; setCheckoutAddons(n); }}
                      style={{ width:'100%', padding:'8px 12px', background:'rgba(255,255,255,0.05)', color:'white', border:'1px solid var(--border-medium)', borderRadius:'6px', outline:'none', fontFamily:'var(--font-en)', boxSizing:'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 'bold' }}>حساب السعر</label>
                    <select value={addon.unit || 'booking'}
                      onChange={(e) => { const n=[...checkoutAddons]; n[index]={...n[index],unit:e.target.value}; setCheckoutAddons(n); }}
                      style={{ width:'100%', padding:'8px 12px', background:'#0c0f17', color:'white', border:'1px solid var(--border-medium)', borderRadius:'6px', outline:'none', cursor:'pointer', boxSizing:'border-box' }}
                    >
                      <option value="booking">للحجز بالكامل (Flat Rate)</option>
                      <option value="person">لكل فرد (Per Person)</option>
                    </select>
                  </div>
                </div>

                {/* Row 3: Descriptions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 'bold' }}>الوصف (بالعربية)</label>
                    <input type="text" placeholder="وصف تفصيلي يظهر للعميل..." value={addon.descAr || ''}
                      onChange={(e) => { const n=[...checkoutAddons]; n[index]={...n[index],descAr:e.target.value}; setCheckoutAddons(n); }}
                      style={{ width:'100%', padding:'8px 12px', background:'rgba(255,255,255,0.05)', color:'white', border:'1px solid var(--border-medium)', borderRadius:'6px', outline:'none', fontSize:'0.85rem', boxSizing:'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 'bold' }}>الوصف (بالإنجليزية)</label>
                    <input type="text" placeholder="Detailed description shown to client..." value={addon.descEn || ''}
                      onChange={(e) => { const n=[...checkoutAddons]; n[index]={...n[index],descEn:e.target.value}; setCheckoutAddons(n); }}
                      style={{ width:'100%', padding:'8px 12px', background:'rgba(255,255,255,0.05)', color:'white', border:'1px solid var(--border-medium)', borderRadius:'6px', outline:'none', fontSize:'0.85rem', fontFamily:'var(--font-en)', boxSizing:'border-box' }}
                    />
                  </div>
                </div>

              </div>
            ))}
            <button
              className="btn btn-secondary"
              style={{ marginTop: '0.5rem' }}
              onClick={() => setCheckoutAddons([...checkoutAddons, { id: `custom-${Date.now()}`, nameEn: '', nameAr: '', price: 0, unit: 'booking', descAr: '', descEn: '' }])}
            >
              + إضافة خدمة جديدة
            </button>
            <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
              <button className="btn btn-primary" onClick={handleSaveSettings}>حفظ الخدمات الإضافية</button>
            </div>
          </div>
        </div>

        <button onClick={handleSaveContent} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', background: 'linear-gradient(135deg, var(--gold-600), var(--gold-400))' }}>
          💾 حفظ نصوص السياسات والتعريف
        </button>
      </div>
    </div>
  );
}
