'use client';

import { useState, useEffect } from 'react';
import { getSettings, saveSettings, clearAllData } from '@/lib/db';

export default function AdminSettings() {
  const [siteName, setSiteName] = useState('ORLUXUS');
  const [whatsapp, setWhatsapp] = useState('+20100000000');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [currency, setCurrency] = useState('Euro (€)');
  const [paypalEmail, setPaypalEmail] = useState('info@orluxus.com');

  // SMTP Email Settings
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [companyEmail, setCompanyEmail] = useState('info@orluxus.com');
  const [smtpTestStatus, setSmtpTestStatus] = useState(''); // '', 'testing', 'ok', 'fail'

  // Paytabs Payment Gateway Settings
  const [paytabsProfileId, setPaytabsProfileId] = useState('');
  const [paytabsServerKey, setPaytabsServerKey] = useState('');
  const [paytabsApiUrl, setPaytabsApiUrl] = useState('https://secure.paytabs.com/payment/request');
  const [paytabsEnabled, setPaytabsEnabled] = useState(false);
  
  const defaultAddons = [
    { id: 'guide', nameEn: 'Private Tour Guide', nameAr: 'Private Tour Guide', price: 25, unit: 'booking', descAr: 'A licensed tour guide to accompany you throughout the trip.', descEn: 'A licensed tour guide to accompany you throughout the trip.' },
    { id: 'lunch', nameEn: 'Lunch & Soft Drinks / person', nameAr: 'Lunch & Soft Drinks / person', price: 15, unit: 'person', descAr: 'Buffet or set menu lunch with soft drinks and mineral water.', descEn: 'Buffet or set menu lunch with soft drinks and mineral water.' },
    { id: 'transfer', nameEn: 'Round-trip Private Transfer', nameAr: 'Round-trip Private Transfer', price: 30, unit: 'booking', descAr: 'Modern private air-conditioned vehicle to and from your hotel.', descEn: 'Modern private air-conditioned vehicle to and from your hotel.' },
    { id: 'photos', nameEn: 'Professional Photography Session', nameAr: 'Professional Photography Session', price: 20, unit: 'booking', descAr: 'A professional photographer to capture your best memories.', descEn: 'A professional photographer to capture your best memories.' },
  ];
  const [checkoutAddons, setCheckoutAddons] = useState(defaultAddons);

  const defaultSpecialRequests = [
    { id: 'veg_food', labelEn: 'Vegetarian Food', labelAr: 'Vegetarian Food' },
    { id: 'halal_food', labelEn: 'Halal Food', labelAr: 'Halal Food' },
    { id: 'kids_menu', labelEn: 'Kids Menu', labelAr: 'Kids Menu' },
    { id: 'wheelchair', labelEn: 'Wheelchair Access', labelAr: 'Wheelchair Access' },
    { id: 'early_checkin', labelEn: 'Early Check-in', labelAr: 'Early Check-in' },
    { id: 'late_checkout', labelEn: 'Late Check-out', labelAr: 'Late Check-out' },
    { id: 'airport_pickup', labelEn: 'Airport Pickup', labelAr: 'Airport Pickup' },
    { id: 'private_guide', labelEn: 'Private Guide', labelAr: 'Private Guide' },
    { id: 'photography', labelEn: 'Professional Photography', labelAr: 'Professional Photography' },
    { id: 'birthday_cake', labelEn: 'Birthday Cake', labelAr: 'Birthday Cake' },
    { id: 'romantic_setup', labelEn: 'Romantic Setup', labelAr: 'Romantic Setup' },
    { id: 'snorkeling_gear', labelEn: 'Snorkeling Gear', labelAr: 'Snorkeling Gear' },
  ];
  const [specialRequestsList, setSpecialRequestsList] = useState(defaultSpecialRequests);
  
  const [allowReg, setAllowReg] = useState(true);
  const [allowPromo, setAllowPromo] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [commission, setCommission] = useState('10');

  const [email, setEmail] = useState('info@orluxus.com');
  const [facebook, setFacebook] = useState('https://facebook.com/orluxus');
  const [tiktok, setTiktok] = useState('https://www.tiktok.com/@orluxus?_r=1&_t=ZS-979ayAlnRlV');
  const [instagram, setInstagram] = useState('https://www.instagram.com/orluxus?igsh=N2lmbmg2eGJzNmVx');

  // Policy & Content States (Bilingual)
  const [vision, setVision] = useState('Our vision is to provide the highest levels of luxury tourism in Egypt with a warm family spirit, making every journey an unforgettable story.');
  const [visionEn, setVisionEn] = useState('Our vision is to provide the highest levels of luxury tourism in Egypt with a warm family spirit, making every journey an unforgettable story.');
  
  const [goals, setGoals] = useState('We aim to provide secure instant bookings, organize exceptional high-quality tours, and deliver the utmost comfort and safety.');
  const [goalsEn, setGoalsEn] = useState('We aim to provide secure instant bookings, organize exceptional high-quality tours, and deliver the utmost comfort and safety.');
  
  const [sustainability, setSustainability] = useState('We are committed to protecting the marine environment, supporting local communities through sustainable employment, and applying green tourism standards.');
  const [sustainabilityEn, setSustainabilityEn] = useState('We are committed to protecting the marine environment, supporting local communities through sustainable employment, and applying green tourism standards.');
  
  const [staff, setStaff] = useState('Our team consists of professional tour guides and local experts trained to the highest hospitality standards.');
  const [staffEn, setStaffEn] = useState('Our team consists of professional tour guides and local experts trained to the highest hospitality standards.');
  
  const [legalCompany, setLegalCompany] = useState('ORLUXUS is a fully registered and licensed tourism company operating under the regulations of the Egyptian Ministry of Tourism.');
  const [legalCompanyEn, setLegalCompanyEn] = useState('ORLUXUS is a fully registered and licensed tourism company operating under the regulations of the Egyptian Ministry of Tourism.');
  
  const [legalCancellation, setLegalCancellation] = useState('Cancellations made 48 hours prior to the trip are free. Late cancellations or no-shows are subject to fees up to 50% depending on the program.');
  const [legalCancellationEn, setLegalCancellationEn] = useState('Cancellations made 48 hours prior to the trip are free. Late cancellations or no-shows are subject to fees up to 50% depending on the program.');
  
  const [dataProtection, setDataProtection] = useState('We respect your privacy and commit to protecting your personal data. We do not share your information with third parties except for bookings.');
  const [dataProtectionEn, setDataProtectionEn] = useState('We respect your privacy and commit to protecting your personal data. We do not share your information with third parties except for bookings.');

  // Terms & Conditions
  const [termsAr, setTermsAr] = useState('1. الحجز ملزم وغير قابل للإلغاء إلا قبل 48 ساعة من موعد الرحلة.\n2. الدفع نقداً عند انطلاق الرحلة أو عبر التحويل البنكي.\n3. الشركة غير مسؤولة عن التأخير الناتج عن ظروف قاهرة.\n4. يجب احترام مواعيد الانطلاق المحددة.\n5. يحق للشركة تعديل البرنامج في حالات الطوارئ.');
  const [termsEn, setTermsEn] = useState('1. Booking is binding and non-refundable unless cancelled 48 hours before the trip.\n2. Payment is cash on arrival or via bank transfer.\n3. Company is not responsible for delays due to force majeure.\n4. Scheduled departure times must be respected.\n5. Company reserves the right to modify the program in emergencies.');

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
          if (data.specialRequestsList) setSpecialRequestsList(data.specialRequestsList);

          // SMTP Settings
          if (data.smtpHost) setSmtpHost(data.smtpHost);
          if (data.smtpPort) setSmtpPort(data.smtpPort);
          if (data.smtpUser) setSmtpUser(data.smtpUser);
          if (data.smtpPass) setSmtpPass(data.smtpPass);
          if (data.companyEmail) setCompanyEmail(data.companyEmail);
          
          // Paytabs Settings
          if (data.paytabsProfileId) setPaytabsProfileId(data.paytabsProfileId);
          if (data.paytabsServerKey) setPaytabsServerKey(data.paytabsServerKey);
          if (data.paytabsApiUrl) setPaytabsApiUrl(data.paytabsApiUrl);
          if (data.paytabsEnabled !== undefined) setPaytabsEnabled(data.paytabsEnabled === true || data.paytabsEnabled === 'true');
          
          if (data.allowReg !== undefined) setAllowReg(data.allowReg === true || data.allowReg === 'true');
          if (data.allowPromo !== undefined) setAllowPromo(data.allowPromo === true || data.allowPromo === 'true');
          if (data.notifyEmail !== undefined) setNotifyEmail(data.notifyEmail === true || data.notifyEmail === 'true');
          if (data.commission) setCommission(data.commission);

          if (data.email) setEmail(data.email);
          if (data.facebook) setFacebook(data.facebook);
          if (data.tiktok) setTiktok(data.tiktok);
          if (data.instagram) setInstagram(data.instagram);

           if (data.vision) setVision(data.vision);
          if (data.visionEn) setVisionEn(data.visionEn);
          if (data.goals) setGoals(data.goals);
          if (data.goalsEn) setGoalsEn(data.goalsEn);
          if (data.sustainability) setSustainability(data.sustainability);
          if (data.sustainabilityEn) setSustainabilityEn(data.sustainabilityEn);
          if (data.staff) setStaff(data.staff);
          if (data.staffEn) setStaffEn(data.staffEn);
          if (data.legalCompany) setLegalCompany(data.legalCompany);
          if (data.legalCompanyEn) setLegalCompanyEn(data.legalCompanyEn);
          if (data.legalCancellation) setLegalCancellation(data.legalCancellation);
          if (data.legalCancellationEn) setLegalCancellationEn(data.legalCancellationEn);
          if (data.dataProtection) setDataProtection(data.dataProtection);
          if (data.dataProtectionEn) setDataProtectionEn(data.dataProtectionEn);
          if (data.termsAr) setTermsAr(data.termsAr);
          if (data.termsEn) setTermsEn(data.termsEn);
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
          specialRequestsList,
          smtpHost,
          smtpPort,
          smtpUser,
          smtpPass,
          companyEmail,
          paytabsProfileId,
          paytabsServerKey,
          paytabsApiUrl,
          paytabsEnabled,
        })
      });
      if (res.ok) {
        alert('✅ All settings saved successfully in the database!');
      } else {
        alert('❌ Failed to save settings!');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('❌ Failed to save settings!');
    }
  };

  // Clear All Data
  const handleClearAllData = async () => {
    if (!confirm('⚠️ WARNING: This will permanently delete ALL data including bookings, agents, promo codes, reviews, and settings. This action cannot be undone. Are you absolutely sure you want to proceed?')) {
      return;
    }
    
    if (!confirm('⚠️ FINAL WARNING: All data will be deleted forever. Type "DELETE" to confirm.')) {
      return;
    }

    try {
      const result = await clearAllData();
      if (result.success) {
        alert('✅ All data has been cleared successfully! The page will now reload.');
        window.location.reload();
      } else {
        alert(`❌ Failed to clear data: ${result.error}`);
      }
    } catch (err) {
      console.error('Error clearing data:', err);
      alert('❌ An error occurred while clearing data!');
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
        alert('✅ Social media links saved successfully!');
      } else {
        alert('❌ Failed to save social media links!');
      }
    } catch (err) {
      console.error('Error saving social media settings:', err);
      alert('❌ Failed to save social media links!');
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
          visionEn,
          goals,
          goalsEn,
          sustainability,
          sustainabilityEn,
          staff,
          staffEn,
          legalCompany,
          legalCompanyEn,
          legalCancellation,
          legalCancellationEn,
          dataProtection,
          dataProtectionEn,
          termsAr,
          termsEn
        })
      });
      if (res.ok) {
        alert('✅ Policies and description texts saved successfully!');
      } else {
        alert('❌ Failed to save policy texts!');
      }
    } catch (err) {
      console.error('Error saving policies:', err);
      alert('❌ Failed to save policy texts!');
    }
  };

  const handleTestSmtp = async () => {
    if (!smtpUser || !smtpPass) {
      alert('Please enter email and app password first to test connection!');
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
          alert('✅ Connection successful! Test email sent to: ' + companyEmail);
        } else {
          setSmtpTestStatus('fail');
          alert('❌ Connection failed: ' + (data.error || 'Unknown error'));
        }
      } else {
        setSmtpTestStatus('fail');
        alert('❌ Server connection failed!');
      }
    } catch (err) {
      console.error(err);
      setSmtpTestStatus('fail');
      alert('❌ An unexpected error occurred during connection!');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', textAlign: 'left' }}>
      <div>
        <h2 style={{ color: 'var(--text-primary)', fontWeight: '800' }}>Platform Settings</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Customize general settings, contact details, and platform policies.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-xl)', maxWidth: '100%' }}>
        
        {/* Left side: General Settings */}
        <div className="glass-card animate-fade-in-up">
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>⚙️ General Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Site Name Input */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Site Name</label>
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
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>WhatsApp Contact Number</label>
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
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Emergency Phone Number</label>
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
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Default Currency</label>
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
                <option value="Euro (€)">Euro (€)</option>
                <option value="USD ($)">USD ($)</option>
                <option value="EGP (EGP)">EGP (EGP)</option>
              </select>
            </div>

            {/* PayPal Email */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Recipient PayPal Email</label>
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
              💾 Save General Settings
            </button>
          </div>
        </div>

        {/* Right side: Agents & Commission Settings */}
        <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>👥 Agent &amp; Registration Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Allow Auto Registration */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', cursor: 'pointer', userSelect: 'none' }}>
              <input 
                type="checkbox" 
                checked={allowReg} 
                onChange={(e) => setAllowReg(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span>Allow automatic new agent registration</span>
            </label>

            {/* Auto Upgrade to Silver */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', cursor: 'pointer', userSelect: 'none' }}>
              <input 
                type="checkbox" 
                checked={allowPromo} 
                onChange={(e) => setAllowPromo(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span>Enable automatic upgrade to Silver tier</span>
            </label>

            {/* Email Notifications */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', cursor: 'pointer', userSelect: 'none' }}>
              <input 
                type="checkbox" 
                checked={notifyEmail} 
                onChange={(e) => setNotifyEmail(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span>Send email notifications for every booking</span>
            </label>
            
            {/* Default Direct Commission */}
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Default Direct Agent Commission (%)</label>
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
              💾 Save Agent Settings
            </button>
          </div>
        </div>

        {/* SMTP Email Settings Card */}
        <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>📧 Email Settings (SMTP)</h3>
          
          {(!smtpUser || !smtpPass) && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '0.8rem 1rem', borderRadius: '8px', color: '#f87171', fontSize: '0.82rem', marginBottom: '1.2rem', fontWeight: '700', lineHeight: '1.5' }}>
              ⚠️ Important Notice: SMTP credentials are not configured yet. Automatic booking confirmation and invoice emails will not be sent to customers until valid SMTP username and app password are saved and tested.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* SMTP Host */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>SMTP Host</label>
              <input 
                type="text" 
                value={smtpHost} 
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="smtp.gmail.com"
                autoComplete="off"
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
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>SMTP Port</label>
              <input 
                type="text" 
                value={smtpPort} 
                onChange={(e) => setSmtpPort(e.target.value)}
                placeholder="587"
                autoComplete="off"
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
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>SMTP User (Sender Email)</label>
              <input 
                type="email" 
                value={smtpUser} 
                onChange={(e) => setSmtpUser(e.target.value)}
                placeholder="example@gmail.com"
                autoComplete="off"
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
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>App Password</label>
              <input 
                type="password" 
                value={smtpPass} 
                onChange={(e) => setSmtpPass(e.target.value)}
                placeholder="••••••••••••••••"
                autoComplete="new-password"
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
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Company Invoice Recipient Email</label>
              <input 
                type="email" 
                value={companyEmail} 
                autoComplete="off"
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
                💾 Save Settings
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
                {smtpTestStatus === 'testing' ? '⏳ Testing...' : '⚡ Test Connection'}
              </button>
            </div>
          </div>
        </div>

        {/* Paytabs Payment Gateway Settings */}
        <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.16s' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>💳 Paytabs Payment Gateway</h3>
          
          {(!paytabsProfileId || !paytabsServerKey) && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '0.8rem 1rem', borderRadius: '8px', color: '#f87171', fontSize: '0.82rem', marginBottom: '1.2rem', fontWeight: '700', lineHeight: '1.5' }}>
              ⚠️ Important Notice: Paytabs credentials are not configured yet. Paytabs payment option will not be available to customers until valid Profile ID and Server Key are saved.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Enable Paytabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <input 
                type="checkbox" 
                checked={paytabsEnabled}
                onChange={(e) => setPaytabsEnabled(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <div>
                <label style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 'bold', cursor: 'pointer' }}>Enable Paytabs Payment</label>
                <span style={{ display: 'block', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Allow customers to pay using Paytabs payment gateway</span>
              </div>
            </div>

            {/* Paytabs Profile ID */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Paytabs Profile ID</label>
              <input 
                type="text" 
                value={paytabsProfileId} 
                onChange={(e) => setPaytabsProfileId(e.target.value)}
                placeholder="Enter your Paytabs Profile ID"
                autoComplete="off"
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

            {/* Paytabs Server Key */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Paytabs Server Key</label>
              <input 
                type="password" 
                value={paytabsServerKey} 
                onChange={(e) => setPaytabsServerKey(e.target.value)}
                placeholder="Enter your Paytabs Server Key"
                autoComplete="new-password"
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

            {/* Paytabs API URL */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Paytabs API URL</label>
              <input 
                type="url" 
                value={paytabsApiUrl} 
                onChange={(e) => setPaytabsApiUrl(e.target.value)}
                placeholder="https://secure.paytabs.com/payment/request"
                autoComplete="off"
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

            {/* Save Button */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                onClick={handleSaveSettings} 
                className="btn btn-primary" 
                style={{ 
                  padding: '0.8rem 1.2rem', 
                  fontWeight: 'bold'
                }}
              >
                💾 Save Paytabs Settings
              </button>
            </div>
          </div>
        </div>

        {/* Social Media Settings */}
        <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.2s', gridColumn: 'span 1' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>📱 Social Media Links</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Email */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>📧 Public Support Email</label>
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
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>👍 Facebook URL</label>
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
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>🎵 TikTok URL</label>
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
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>📷 Instagram URL</label>
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
              💾 Save Social Media
            </button>
          </div>
        </div>
      </div>

      {/* About Us & Policy Texts */}
      <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.3s', marginTop: 'var(--space-md)' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>📄 Manage About Us &amp; Policy Texts (Footer Links)</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem', maxWidth: '100%' }}>
          
          {/* Column 1: About Us */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ color: 'var(--gold-400)', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '0.3rem' }}>About ORLUXUS</h4>
            
            <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <span style={{ display: 'block', color: 'var(--gold-400)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Vision</span>
              <label style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>In Arabic 🇸🇦</label>
              <textarea value={vision} onChange={(e) => setVision(e.target.value)} rows="2" style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '6px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', marginBottom: '0.5rem' }} />
              <label style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>In English 🇬🇧</label>
              <textarea value={visionEn} onChange={(e) => setVisionEn(e.target.value)} rows="2" style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '6px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>

            <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <span style={{ display: 'block', color: 'var(--gold-400)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Goals</span>
              <label style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>In Arabic 🇸🇦</label>
              <textarea value={goals} onChange={(e) => setGoals(e.target.value)} rows="2" style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '6px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', marginBottom: '0.5rem' }} />
              <label style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>In English 🇬🇧</label>
              <textarea value={goalsEn} onChange={(e) => setGoalsEn(e.target.value)} rows="2" style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '6px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>

            <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <span style={{ display: 'block', color: 'var(--gold-400)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Sustainability</span>
              <label style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>In Arabic 🇸🇦</label>
              <textarea value={sustainability} onChange={(e) => setSustainability(e.target.value)} rows="2" style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '6px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', marginBottom: '0.5rem' }} />
              <label style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>In English 🇬🇧</label>
              <textarea value={sustainabilityEn} onChange={(e) => setSustainabilityEn(e.target.value)} rows="2" style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '6px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>

            <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <span style={{ display: 'block', color: 'var(--gold-400)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Staff</span>
              <label style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>In Arabic 🇸🇦</label>
              <textarea value={staff} onChange={(e) => setStaff(e.target.value)} rows="2" style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '6px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', marginBottom: '0.5rem' }} />
              <label style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>In English 🇬🇧</label>
              <textarea value={staffEn} onChange={(e) => setStaffEn(e.target.value)} rows="2" style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '6px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
          </div>

          {/* Column 2: Legal & Data Protection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ color: 'var(--gold-400)', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '0.3rem' }}>Legal &amp; Policies</h4>

            <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <span style={{ display: 'block', color: 'var(--gold-400)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Company Legal Status</span>
              <label style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>In Arabic 🇸🇦</label>
              <textarea value={legalCompany} onChange={(e) => setLegalCompany(e.target.value)} rows="2" style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '6px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', marginBottom: '0.5rem' }} />
              <label style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>In English 🇬🇧</label>
              <textarea value={legalCompanyEn} onChange={(e) => setLegalCompanyEn(e.target.value)} rows="2" style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '6px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>

            <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <span style={{ display: 'block', color: 'var(--gold-400)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Cancellation Policy</span>
              <label style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>In Arabic 🇸🇦</label>
              <textarea value={legalCancellation} onChange={(e) => setLegalCancellation(e.target.value)} rows="3" style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '6px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', marginBottom: '0.5rem' }} />
              <label style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>In English 🇬🇧</label>
              <textarea value={legalCancellationEn} onChange={(e) => setLegalCancellationEn(e.target.value)} rows="3" style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '6px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>

            <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <span style={{ display: 'block', color: 'var(--gold-400)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Data Protection &amp; Privacy</span>
              <label style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>In Arabic 🇸🇦</label>
              <textarea value={dataProtection} onChange={(e) => setDataProtection(e.target.value)} rows="3" style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '6px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', marginBottom: '0.5rem' }} />
              <label style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>In English 🇬🇧</label>
              <textarea value={dataProtectionEn} onChange={(e) => setDataProtectionEn(e.target.value)} rows="3" style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '6px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
          </div>

          {/* Column 3: Terms & Conditions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ color: 'var(--gold-400)', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '0.3rem' }}>Terms &amp; Conditions (Invoice Footer)</h4>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Terms in Arabic 🇸🇦</label>
              <textarea value={termsAr} onChange={(e) => setTermsAr(e.target.value)} rows="6" style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '6px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} placeholder="Write terms and conditions in Arabic..." />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Terms in English 🇬🇧</label>
              <textarea value={termsEn} onChange={(e) => setTermsEn(e.target.value)} rows="6" style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '6px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} placeholder="Write terms and conditions in English..." />
            </div>
          </div>
        </div>

        <button onClick={handleSaveContent} className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%', padding: '0.8rem', background: 'linear-gradient(135deg, #10b981, #059669)' }}>
          💾 Save Policy &amp; Description Texts
        </button>
      </div>

      {/* Section 6: Checkout Add-ons */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Checkout Add-ons Management</h2>
        </div>
        <div className="admin-card-body">
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            These add-ons will appear during customer checkout. You can customize titles, prices, and descriptions freely.
          </p>
          {checkoutAddons.map((addon, index) => (
            <div key={addon.id || index} style={{ marginBottom: '1.2rem', padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>

              {/* Header: title + delete */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontWeight: '700', color: 'var(--gold-400)', fontSize: '0.9rem' }}>
                  #{index + 1} — {addon.nameEn || addon.nameAr || 'New Addon'}
                </span>
                <button
                  onClick={() => setCheckoutAddons(checkoutAddons.filter((_, i) => i !== index))}
                  style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '6px', padding: '4px 14px', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  🗑️ Delete
                </button>
              </div>

              {/* Row 1: Names */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 'bold' }}>Name (Arabic)</label>
                  <input type="text" value={addon.nameAr}
                    onChange={(e) => { const n=[...checkoutAddons]; n[index]={...n[index],nameAr:e.target.value}; setCheckoutAddons(n); }}
                    style={{ width:'100%', padding:'8px 12px', background:'rgba(255,255,255,0.05)', color:'white', border:'1px solid var(--border-medium)', borderRadius:'6px', outline:'none', boxSizing:'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 'bold' }}>Name (English)</label>
                  <input type="text" value={addon.nameEn}
                    onChange={(e) => { const n=[...checkoutAddons]; n[index]={...n[index],nameEn:e.target.value}; setCheckoutAddons(n); }}
                    style={{ width:'100%', padding:'8px 12px', background:'rgba(255,255,255,0.05)', color:'white', border:'1px solid var(--border-medium)', borderRadius:'6px', outline:'none', fontFamily:'var(--font-en)', boxSizing:'border-box' }}
                  />
                </div>
              </div>

              {/* Row 2: Price + Unit */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 'bold' }}>Price (€)</label>
                  <input type="number" value={addon.price}
                    onChange={(e) => { const n=[...checkoutAddons]; n[index]={...n[index],price:Number(e.target.value)}; setCheckoutAddons(n); }}
                    style={{ width:'100%', padding:'8px 12px', background:'rgba(255,255,255,0.05)', color:'white', border:'1px solid var(--border-medium)', borderRadius:'6px', outline:'none', fontFamily:'var(--font-en)', boxSizing:'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 'bold' }}>Billing Calculation</label>
                  <select value={addon.unit || 'booking'}
                    onChange={(e) => { const n=[...checkoutAddons]; n[index]={...n[index],unit:e.target.value}; setCheckoutAddons(n); }}
                    style={{ width:'100%', padding:'8px 12px', background:'#0c0f17', color:'white', border:'1px solid var(--border-medium)', borderRadius:'6px', outline:'none', cursor:'pointer', boxSizing:'border-box' }}
                  >
                    <option value="booking">Flat Rate (Per Booking)</option>
                    <option value="person">Per Person</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Descriptions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 'bold' }}>Description (Arabic)</label>
                  <input type="text" placeholder="Arabic description text..." value={addon.descAr || ''}
                    onChange={(e) => { const n=[...checkoutAddons]; n[index]={...n[index],descAr:e.target.value}; setCheckoutAddons(n); }}
                    style={{ width:'100%', padding:'8px 12px', background:'rgba(255,255,255,0.05)', color:'white', border:'1px solid var(--border-medium)', borderRadius:'6px', outline:'none', fontSize:'0.85rem', boxSizing:'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 'bold' }}>Description (English)</label>
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
            onClick={() => setCheckoutAddons([...checkoutAddons, { id: `custom-${Date.now()}`, nameEn: 'New Add-on', nameAr: 'New Add-on', price: 15, unit: 'booking', descAr: 'Description of add-on', descEn: 'Description of add-on' }])}
          >
            ➕ Add New Add-on
          </button>
          <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
            <button className="btn btn-primary" onClick={handleSaveSettings}>💾 Save Checkout Add-ons</button>
          </div>
        </div>
      </div>

      {/* Section 7: Trip Special Requests Management */}
      <div className="admin-card" style={{ marginTop: 'var(--space-md)' }}>
        <div className="admin-card-header">
          <h2 className="admin-card-title">🎯 Trip Special Requests Options</h2>
        </div>
        <div className="admin-card-body">
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Manage the special request checkboxes (e.g., Vegetarian Food, Airport Pickup) available when creating or editing trips.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {specialRequestsList.map((req, idx) => (
              <div key={req.id || idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gold-400)', fontWeight: 'bold' }}>#{idx + 1} ({req.id})</span>
                  <button
                    onClick={() => setSpecialRequestsList(specialRequestsList.filter((_, i) => i !== idx))}
                    style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#ef4444', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    🗑️ Delete
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Name (Arabic)"
                    value={req.labelAr || ''}
                    onChange={(e) => {
                      const updated = [...specialRequestsList];
                      updated[idx] = { ...updated[idx], labelAr: e.target.value };
                      setSpecialRequestsList(updated);
                    }}
                    style={{ flex: 1, padding: '6px 10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '4px', fontSize: '0.85rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Name (English)"
                    value={req.labelEn || ''}
                    onChange={(e) => {
                      const updated = [...specialRequestsList];
                      updated[idx] = { ...updated[idx], labelEn: e.target.value };
                      setSpecialRequestsList(updated);
                    }}
                    style={{ flex: 1, padding: '6px 10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-medium)', borderRadius: '4px', fontSize: '0.85rem', fontFamily: 'var(--font-en)' }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setSpecialRequestsList([...specialRequestsList, { id: `req_${Date.now()}`, labelEn: 'New Special Request', labelAr: 'New Special Request' }])}
            >
              ➕ Add New Special Request Option
            </button>
            <button className="btn btn-primary" onClick={handleSaveSettings}>
              💾 Save Special Requests Options
            </button>
          </div>
        </div>
      </div>

      {/* Section 8: System Reset */}
      <div className="admin-card" style={{ marginTop: 'var(--space-md)', border: '2px solid rgba(239, 68, 68, 0.3)' }}>
        <div className="admin-card-header" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
          <h2 className="admin-card-title" style={{ color: '#ef4444' }}>⚠️ System Reset - Clear All Data</h2>
        </div>
        <div className="admin-card-body">
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            <strong>DANGER ZONE:</strong> This will permanently delete ALL data including:
          </p>
          <ul style={{ color: 'var(--text-tertiary)', marginBottom: '1rem', fontSize: '0.85rem', paddingLeft: '1.5rem' }}>
            <li>All bookings and reservations</li>
            <li>All agents and their data</li>
            <li>All promo codes</li>
            <li>All reviews</li>
            <li>All settings and configurations</li>
          </ul>
          <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
            This action cannot be undone. Use with extreme caution!
          </p>
          <button
            className="btn"
            style={{ 
              background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
              color: 'white',
              padding: '1rem 2rem',
              fontWeight: 'bold'
            }}
            onClick={handleClearAllData}
          >
            🗑️ Clear All System Data
          </button>
        </div>
      </div>
    </div>
  );
}
