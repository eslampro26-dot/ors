'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import { validatePromoCode, addBooking, getSettings } from '@/lib/db';
import { createDafahCheckoutSession } from '@/lib/dafah';
import { useLanguage } from '@/context/LanguageContext';
import DafahSimulatedGateway from '@/components/DafahSimulatedGateway';


function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale, t: tGlobal, isReady } = useLanguage();

  // Quick translation helper
  const translate = (key) => {
    const dict = {
      en: {
        title: 'Booking & Traveler Details',
        subtitle: 'Please fill traveler details correctly to confirm booking.',
        nameLabel: 'Traveler\'s Full Name *',
        namePlaceholder: 'First and last name as in passport',
        phoneLabel: 'Contact Phone Number *',
        whatsappLabel: 'WhatsApp Number (optional)',
        whatsappPlaceholder: 'Same number or another',
        dateLabel: 'Excursion Start Date *',
        travelersLabel: 'Number of Travelers (persons)',
        promoQuestion: 'Do you have a discount code or agent referral code?',
        promoPlaceholder: 'Enter discount code (e.g. AHMED10)',
        applyBtn: 'Apply',
        submitBtn: '🔒 Proceed to Secure Payment Options',
        secureGateways: '💳 Secure Payment Gateways',
        paymentDesc: 'Please pay securely to confirm your booking immediately.',
        payPalTitle: '1. Pay with Credit Card or PayPal:',
        cashTitle: '2. Pay Cash on Arrival:',
        cashDesc: 'You can secure your booking now and pay later when the tour starts.',
        cashBtn: 'Confirm Booking & Pay Cash on Arrival',
        editBtn: '← Edit Booking & Traveler Details',
        payingMessage: 'Connecting to PayPal secure server...',
        fillAlert: 'Please fill all required fields!',
        sslSecure: '🔒 SSL SECURE CONNECTION',
        summary: 'Order Summary',
        serviceRequested: 'Service Requested',
        basePrice: 'Base Price',
        travelers: 'Travelers',
        discount: 'Discount (Promo Code)',
        totalDue: 'Total Due',
        appliedPromo: 'Applied promo code: {code}',
        sslNotice: 'All payment details are processed under high-level SSL encryption protocols.',
        dafahTitle: '3. Pay securely with Credit Card (Visa / MasterCard / Mada):',
        dafahBtn: '💳 Pay Securely with Credit Card',
      },
      ar: {
        title: 'بيانات الحجز والمسافرين',
        subtitle: 'الرجاء ملء بيانات المسافر بشكل صحيح لتثبيت الحجز.',
        nameLabel: 'اسم المسافر الكامل *',
        namePlaceholder: 'الاسم الأول والأخير كما في جواز السفر',
        phoneLabel: 'رقم الهاتف للتواصل *',
        whatsappLabel: 'رقم الواتساب (اختياري)',
        whatsappPlaceholder: 'نفس الرقم أو رقم آخر',
        dateLabel: 'تاريخ انطلاق الرحلة *',
        travelersLabel: 'عدد المسافرين (الأشخاص)',
        promoQuestion: 'هل لديك كود خصم أو رمز وكيل إحالة؟',
        promoPlaceholder: 'أدخل كود الخصم (مثال: AHMED10)',
        applyBtn: 'تطبيق',
        submitBtn: '🔒 الانتقال إلى خيارات الدفع الآمنة',
        secureGateways: '💳 بوابات الدفع الآمنة',
        paymentDesc: 'الرجاء الدفع بأمان تام لتأكيد حجزك فوراً.',
        payPalTitle: '1. الدفع بالبطاقات البنكية أو باي بال:',
        cashTitle: '2. الدفع كاش عند الوصول:',
        cashDesc: 'يمكنك تثبيت حجزك الآن والدفع لاحقاً عند انطلاق الرحلة.',
        cashBtn: '📝 تأكيد الحجز والدفع كاش عند الوصول',
        editBtn: '← تعديل بيانات الحجز والمسافرين',
        payingMessage: 'جاري الاتصال بالخادم الآمن لباي بال...',
        fillAlert: 'الرجاء ملء جميع الحقول المطلوبة!',
        sslSecure: '🔒 اتصال SSL آمن',
        summary: 'ملخص الطلب',
        serviceRequested: 'الخدمة المطلوبة',
        basePrice: 'السعر الأساسي',
        travelers: 'عدد المسافرين',
        discount: 'الخصم (كود الخصم)',
        totalDue: 'إجمالي المستحق',
        appliedPromo: 'كود الخصم المطبق: {code}',
        sslNotice: 'يتم معالجة جميع تفاصيل الدفع تحت بروتوكولات تشفير SSL عالية المستوى.',
        dafahTitle: '3. الدفع الآمن بالبطاقة البنكية (فيزا / ماستركارد / مدى):',
        dafahBtn: '💳 الدفع الآمن بالبطاقة البنكية (عبر بوابة دفة)',
      }
    };
    const activeDict = dict[locale] || dict.en;
    return activeDict[key] || dict.en[key] || key;
  };

  // Parse query parameters
  const tripId = searchParams.get('tripId') || '';
  const basePrice = parseFloat(searchParams.get('price') || '0');
  const titleAr = searchParams.get('titleAr') || '';
  const titleEn = searchParams.get('titleEn') || '';
  const type = searchParams.get('type') || 'trip';

  // Customer State
  const [travelers, setTravelers] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  
  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [promoDetails, setPromoDetails] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Payment step
  const [checkoutStep, setCheckoutStep] = useState('details'); // details, payment, success, failed
  const [paymentTxId, setPaymentTxId] = useState('');
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSettings();
        if (data) setSettings(data);
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    };
    loadSettings();
  }, []);

  const paypalEmail = settings?.paypalEmail || 'info@orluxus.com';

  const handleDafahPayment = () => {
    const baseDafahUrl = createDafahCheckoutSession({
      tripId,
      title: titleAr || titleEn || 'Travel Excursion',
      amount: totalAmount,
      customerName,
      phone,
      whatsapp: whatsapp || phone,
      date: bookingDate,
      travelers
    });
    const url = new URL(baseDafahUrl, window.location.origin);
    url.searchParams.set('promoCode', promoDetails ? promoDetails.code : '');
    url.searchParams.set('discountAmount', discountAmount.toString());
    url.searchParams.set('originalAmount', originalTotal.toString());
    url.searchParams.set('agentId', promoDetails ? promoDetails.agentId || '' : '');
    url.searchParams.set('agentName', promoDetails ? promoDetails.agentName || '' : 'مباشر (بدون وكيل)');
    url.searchParams.set('city', searchParams.get('city') || 'شرم الشيخ');
    
    router.push(url.pathname + url.search);
  };

  // Status check parameters (from return URLs)
  const statusParam = searchParams.get('status') || '';
  const txParam = searchParams.get('tx') || '';
  const nameParam = searchParams.get('customerName') || '';
  const phoneParam = searchParams.get('phone') || '';
  const whatsappParam = searchParams.get('whatsapp') || '';
  const dateParam = searchParams.get('date') || '';
  const travelersParam = parseInt(searchParams.get('travelers') || '1', 10);
  const amountParam = parseFloat(searchParams.get('amount') || '0');
  const titleParam = searchParams.get('title') || '';
  const promoParam = searchParams.get('promoCode') || '';
  const discountParam = parseFloat(searchParams.get('discountAmount') || '0');
  const originalParam = parseFloat(searchParams.get('originalAmount') || '0');
  const agentNameParam = searchParams.get('agentName') || '';

  // Price Calculations
  const originalTotal = basePrice * travelers;
  let discountAmount = 0;
  if (promoDetails) {
    if (promoDetails.discountType === 'percentage') {
      discountAmount = originalTotal * (promoDetails.discountValue / 100);
    } else {
      discountAmount = promoDetails.discountValue * travelers; // fixed per traveler
    }
  }
  // Clamp discount
  discountAmount = Math.min(originalTotal, discountAmount);
  const totalAmount = originalTotal - discountAmount;

  // Handle Promo Verification
  const handleApplyPromo = async (e) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    
    if (!promoInput.trim()) {
      setPromoError('الرجاء كتابة الكود أولاً!');
      return;
    }

    try {
      const validation = await validatePromoCode(promoInput);
      if (!validation.isValid) {
        setPromoError(validation.reason);
        setPromoDetails(null);
      } else {
        setPromoDetails(validation);
        let valueStr = validation.discountType === 'percentage' ? `${validation.discountValue}%` : `€${validation.discountValue}`;
        setPromoSuccess(`تم تطبيق كود الخصم بنجاح! قيمة الخصم: ${valueStr} (الوكيل: ${validation.agentName})`);
      }
    } catch (err) {
      console.error('Error applying promo:', err);
      setPromoError('حدث خطأ في التحقق من كود الخصم');
    }
  };

  // Handle Details Form Submission
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!customerName || !phone || !bookingDate) {
      alert(translate('fillAlert'));
      return;
    }
    setCheckoutStep('payment');
  };

  // Load PayPal SDK Dynamically
  useEffect(() => {
    if (checkoutStep !== 'payment' || window.paypal) {
      if (window.paypal) setPaypalLoaded(true);
      return;
    }

    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=EUR&disable-funding=credit`;
    script.async = true;
    script.onload = () => {
      setPaypalLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load PayPal SDK');
    };
    document.body.appendChild(script);
  }, [checkoutStep]);

  // Render PayPal Buttons once SDK is loaded
  useEffect(() => {
    if (!paypalLoaded || !window.paypal || checkoutStep !== 'payment') return;

    const container = document.getElementById('paypal-button-container');
    if (container) container.innerHTML = '';

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'pill',
        label: 'pay'
      },
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            description: titleEn || titleAr || 'Egypt Travel Tour',
            amount: {
              currency_code: 'EUR',
              value: totalAmount.toFixed(2)
            }
          }]
        });
      },
      onApprove: async (data, actions) => {
        return actions.order.capture().then(async (details) => {
          const txId = details.id || `pp-tx-${Date.now()}`;
          setPaymentTxId(txId);

          // Save booking immediately on approval (fixes H-4)
          try {
            await addBooking({
              id: `BK-${txId.replace('pp-tx-', '')}`,
              customer: customerName,
              phone: phone,
              whatsapp: whatsapp || phone,
              service: titleEn || titleAr || 'Travel Excursion',
              city: searchParams.get('city') || 'شرم الشيخ',
              agentId: promoDetails ? promoDetails.agentId || null : null,
              agentName: promoDetails ? promoDetails.agentName : 'مباشر (بدون وكيل)',
              originalAmount: originalTotal,
              discountAmount: discountAmount,
              finalAmount: totalAmount,
              travelers: travelers,
              status: 'مؤكد',
              promoCode: promoDetails ? promoDetails.code : '',
              paymentType: 'paypal',
              txId: txId
            });
          } catch (err) {
            console.error('Error saving booking on PayPal approval:', err);
          }
          
          // Redirect to success screen locally with all booking data + promo/agent details
          const successUrl = `/checkout?status=success&tx=${txId}&tripId=${tripId}&amount=${totalAmount}&originalAmount=${originalTotal}&discountAmount=${discountAmount}&promoCode=${promoDetails ? promoDetails.code : ''}&agentId=${promoDetails ? promoDetails.agentId || '' : ''}&agentName=${encodeURIComponent(promoDetails ? promoDetails.agentName : 'مباشر (بدون وكيل)')}&customerName=${encodeURIComponent(customerName)}&phone=${encodeURIComponent(phone)}&whatsapp=${encodeURIComponent(whatsapp || phone)}&date=${encodeURIComponent(bookingDate)}&travelers=${travelers}&title=${encodeURIComponent(titleEn || titleAr)}`;
          router.push(successUrl);
        });
      },
      onError: (err) => {
        console.error('PayPal Error: ', err);
        router.push(`/checkout?status=failed&tripId=${tripId}&price=${basePrice}&titleAr=${encodeURIComponent(titleAr)}&type=${type}`);
      }
    }).render('#paypal-button-container');
  }, [paypalLoaded, checkoutStep, totalAmount]);

  // Mock cash / onsite payment completion
  const handleCashPayment = async () => {
    const txId = `cash-tx-${Date.now()}`;

    // Save booking immediately on cash option select (fixes H-4)
    try {
      await addBooking({
        id: `BK-${txId.replace('cash-tx-', '')}`,
        customer: customerName,
        phone: phone,
        whatsapp: whatsapp || phone,
        service: titleEn || titleAr || 'Travel Excursion',
        city: searchParams.get('city') || 'شرم الشيخ',
        agentId: promoDetails ? promoDetails.agentId || null : null,
        agentName: promoDetails ? promoDetails.agentName : 'مباشر (بدون وكيل)',
        originalAmount: originalTotal,
        discountAmount: discountAmount,
        finalAmount: totalAmount,
        travelers: travelers,
        status: 'مؤكد',
        promoCode: promoDetails ? promoDetails.code : '',
        paymentType: 'cash',
        txId: txId
      });
    } catch (err) {
      console.error('Error saving booking on cash payment:', err);
    }

    const successUrl = `/checkout?status=success&tx=${txId}&tripId=${tripId}&amount=${totalAmount}&originalAmount=${originalTotal}&discountAmount=${discountAmount}&promoCode=${promoDetails ? promoDetails.code : ''}&agentId=${promoDetails ? promoDetails.agentId || '' : ''}&agentName=${encodeURIComponent(promoDetails ? promoDetails.agentName : 'مباشر (بدون وكيل)')}&customerName=${encodeURIComponent(customerName)}&phone=${encodeURIComponent(phone)}&whatsapp=${encodeURIComponent(whatsapp || phone)}&date=${encodeURIComponent(bookingDate)}&travelers=${travelers}&title=${encodeURIComponent(titleEn || titleAr)}&paymentType=onsite`;
    router.push(successUrl);
  };

  const gatewayModeParam = searchParams.get('gatewayMode') || '';
  if (gatewayModeParam === 'true') {
    return (
      <DafahSimulatedGateway 
        searchParams={searchParams}
        router={router}
        addBooking={addBooking}
        locale={locale}
      />
    );
  }

  // 1. PAYMENT SUCCESS SCREEN
  if (statusParam === 'success' || checkoutStep === 'success') {
    const isOnsite = searchParams.get('paymentType') === 'onsite';
    return (
      <main style={{ minHeight: '100vh', paddingBottom: '5rem', background: 'var(--bg-primary)' }}>
        <Navbar />
        
        <div className="container" style={{ paddingTop: 'calc(var(--nav-height) + 3rem)', maxWidth: '800px' }}>
          {/* Confirmed Card */}
          <div className="glass-card" style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            marginBottom: '2rem',
            background: 'var(--gradient-card)',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--gold-400)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '2px solid var(--emerald-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              margin: '0 auto 1.5rem auto',
              color: 'var(--emerald-500)'
            }}>
              ✓
            </div>

            <h1 className="section-title" style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '2rem' }}>
              {isOnsite ? 'Booking Registered Successfully!' : 'Payment Confirmed Successfully!'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              {isOnsite ? 'Your booking has been received. You will pay cash on arrival!' : 'We are delighted to register your booking. Payment is confirmed and the invoice has been issued.'}
            </p>
          </div>

          {/* Luxurious Invoice Sheet */}
          <div id="invoice-sheet" className="glass-card" style={{
            padding: '3rem',
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-medium)',
            color: '#1e293b'
          }}>
            {/* Invoice Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f1f5f9', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ textAlign: 'left' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#b45309', margin: 0, letterSpacing: '2px', fontFamily: 'var(--font-en)' }}>ORLUXUS</h2>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>With A Family Spirit 🇪🇬</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Booking Invoice</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontFamily: 'var(--font-en)' }}>Invoice #{txParam.replace('pp-tx-', '').replace('cash-tx-', '').replace('dafah-tx-', '')}</span>
              </div>
            </div>

            {/* Customer & Date Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2.5rem', textAlign: 'left' }}>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Traveler Details</h4>
                <p style={{ margin: '0 0 0.3rem 0', fontWeight: 'bold', fontSize: '1.05rem' }}>{nameParam}</p>
                <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: '#475569' }}>📞 {phoneParam}</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>💬 {whatsappParam}</p>
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Booking Info</h4>
                <p style={{ margin: '0 0 0.3rem 0', fontWeight: 'bold' }}>Scheduled Date: {dateParam}</p>
                <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: '#475569' }}>Travelers: {travelersParam} Persons</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: isOnsite ? '#f59e0b' : '#10b981', fontWeight: 'bold' }}>
                  Gateway: {isOnsite ? 'Cash on Site' : (searchParams.get('paymentType') === 'card' ? 'Dafah Credit Card' : 'PayPal Secure Gateway')}
                </p>
              </div>
            </div>

            {/* Invoice Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2.5rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', fontSize: '0.9rem', color: '#475569' }}>Service Description</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', color: '#475569' }}>Qty</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', fontSize: '0.9rem', color: '#475569' }}>Rate</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', fontSize: '0.9rem', color: '#475569' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1.2rem 1rem', fontSize: '1rem', fontWeight: '600', textAlign: 'left' }}>{titleParam || 'Egypt Travel Package'}</td>
                  <td style={{ padding: '1.2rem 1rem', textAlign: 'center', fontFamily: 'var(--font-en)' }}>{travelersParam}</td>
                  <td style={{ padding: '1.2rem 1rem', textAlign: 'right', fontFamily: 'var(--font-en)' }}>€{(originalParam / travelersParam).toFixed(2)}</td>
                  <td style={{ padding: '1.2rem 1rem', textAlign: 'right', fontFamily: 'var(--font-en)', fontWeight: 'bold' }}>€{originalParam.toFixed(2)}</td>
                </tr>
                {discountParam > 0 && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fef2f2' }}>
                    <td style={{ padding: '0.8rem 1rem', fontSize: '0.9rem', color: '#dc2626', textAlign: 'left', fontWeight: 'bold' }}>
                      خصم ترويجي تطبيقي (الكود: {promoParam})
                    </td>
                    <td style={{ padding: '0.8rem 1rem', textAlign: 'center' }}>-</td>
                    <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>-</td>
                    <td style={{ padding: '0.8rem 1rem', textAlign: 'right', fontFamily: 'var(--font-en)', color: '#dc2626', fontWeight: 'bold' }}>
                      -€{discountParam.toFixed(2)}
                    </td>
                  </tr>
                )}
                {agentNameParam && agentNameParam !== 'مباشر (بدون وكيل)' && (
                  <tr style={{ background: '#f8fafc' }}>
                    <td colSpan="4" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#475569', textAlign: 'right', fontStyle: 'italic' }}>
                      تم الحجز بتوصية من الوكيل المعتمد: <strong>{agentNameParam}</strong>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Total Block */}
            <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>Payment Status</span>
                <span style={{ 
                  color: isOnsite ? '#b45309' : '#10b981', 
                  fontWeight: 'bold', 
                  fontSize: '1rem', 
                  background: isOnsite ? '#fef3c7' : '#ecfdf5', 
                  padding: '4px 12px', 
                  borderRadius: '9999px', 
                  display: 'inline-block', 
                  marginTop: '0.3rem' 
                }}>
                  {isOnsite ? 'PAY ON ARRIVAL' : 'PAID IN FULL'}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Total Booking Value</span>
                <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#b45309', fontFamily: 'var(--font-en)', marginTop: '0.2rem' }}>
                  €{amountParam.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Verification Footer text */}
            <div style={{ textAlign: 'center', marginTop: '3rem', fontSize: '0.8rem', color: '#94a3b8', borderTop: '1px dashed #e2e8f0', paddingTop: '1.5rem' }}>
              Thank you for choosing ORLUXUS. We wish you an amazing family trip.
            </div>
          </div>

          {/* Invoice Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }} className="hide-print">
            <button 
              onClick={() => window.print()} 
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem' }}
            >
              🖨️ Print Invoice / Save as PDF
            </button>
            <Link href="/" className="btn btn-secondary" style={{ padding: '0.8rem 1.5rem' }}>
              Return to Home
            </Link>
          </div>
        </div>

        <style jsx global>{`
          @media print {
            body {
              background: #ffffff !important;
              color: #000000 !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .hide-print, navbar, header, footer, nav {
              display: none !important;
            }
            #invoice-sheet {
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
              background: #ffffff !important;
            }
            main {
              padding: 0 !important;
            }
          }
        `}</style>
      </main>
    );
  }

  // 2. PAYMENT FAILED SCREEN
  if (statusParam === 'failed') {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="container" style={{ maxWidth: '500px', textAlign: 'center' }}>
          <div className="glass-card" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.1)',
              border: '2px solid var(--coral-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              color: 'var(--coral-500)'
            }}>
              ✕
            </div>

            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', fontWeight: '800' }}>Payment Cancelled</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              We could not complete your transaction securely. Please retry or choose another payment method.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '0.8rem', marginTop: '1rem' }}>
              <button onClick={() => setCheckoutStep('details')} className="btn btn-primary">
                Retry Booking Form
              </button>
              <Link href="/" className="btn btn-secondary">
                Cancel & Return to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 3. SECURE GATEWAY / PAYMENT METHOD CHOICE
  if (checkoutStep === 'payment') {
    return (
      <main style={{ minHeight: '100vh', paddingBottom: '5rem', background: 'var(--bg-primary)' }}>
        <Navbar />
        
        <div className="container" style={{ paddingTop: 'calc(var(--nav-height) + 3rem)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-2xl)', alignItems: 'start' }}>
            
            {/* Left side: Payment selector */}
            <div className="glass-card animate-fade-in-up" style={{ padding: '2.5rem', textAlign: locale === 'ar' ? 'right' : 'left' }}>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{translate('secureGateways')}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>{translate('paymentDesc')}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Method 1: PayPal Smart Buttons */}
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontWeight: 'bold' }}>{translate('payPalTitle')}</h4>
                  
                  {!paypalLoaded ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                      {translate('payingMessage')}
                    </div>
                  ) : null}
                  
                  <div id="paypal-button-container" style={{ minHeight: '150px' }}></div>
                </div>

                <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

                {/* Method 2: On-site payment */}
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>{translate('cashTitle')}</h4>
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginBottom: '1rem' }}>{translate('cashDesc')}</p>
                  
                  <button 
                    onClick={handleCashPayment} 
                    className="btn btn-secondary" 
                    style={{ width: '100%', padding: '1rem', fontWeight: 'bold', fontSize: '1rem' }}
                  >
                    {translate('cashBtn')}
                  </button>
                </div>

                <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

                {/* Method 3: Dafah Credit Card simulated gateway */}
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>{translate('dafahTitle')}</h4>
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                    {locale === 'ar' ? 'ادفع بأمان وسهولة ببطاقة مدى أو فيزا أو ماستركارد عبر بوابة دفة المشفرة.' : 'Pay securely using Mada, Visa, or Mastercard via Dafah secure gateway.'}
                  </p>
                  
                  <button 
                    onClick={handleDafahPayment} 
                    className="btn btn-primary" 
                    style={{ 
                      width: '100%', 
                      padding: '1rem', 
                      fontWeight: 'bold', 
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, var(--gold-400), var(--gold-700))',
                      color: 'white',
                      border: 'none',
                      boxShadow: '0 4px 15px rgba(251, 191, 36, 0.2)'
                    }}
                  >
                    {translate('dafahBtn')}
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setCheckoutStep('details')} 
                style={{ marginTop: '2rem', color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', flexDirection: locale === 'ar' ? 'row' : 'row-reverse' }}
              >
                {translate('editBtn')}
              </button>
            </div>

            {/* Right side: Order Summary */}
            <div className="glass-card animate-fade-in-up" style={{ padding: '2.5rem', border: '1px solid var(--border-accent)', boxShadow: 'var(--shadow-glow-gold)', textAlign: 'left' }}>
              <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem' }}>Order Summary</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Service Requested</span>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '0.2rem' }}>{titleEn || titleAr || 'Travel Excursion'}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'var(--font-en)' }}>{titleAr}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Base Price</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>€{basePrice}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Travelers</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>{travelers}</span>
                </div>

                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--coral-500)' }}>
                    <span>Discount (Promo Code)</span>
                    <span style={{ fontWeight: 'bold', fontFamily: 'var(--font-en)' }}>-€{discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '2px solid var(--border-medium)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Total Due</span>
                <div style={{ fontFamily: 'var(--font-en)', fontWeight: '800', fontSize: '2rem', color: 'var(--gold-600)' }}>
                  €{totalAmount.toFixed(2)}
                </div>
              </div>

              {promoDetails && (
                <div style={{ marginTop: '1.5rem', padding: '0.8rem', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--gold-400)', textAlign: 'right' }}>
                  كود الخصم المطبق: <strong>{promoDetails.code}</strong> (خصم {promoDetails.discountType === 'percentage' ? `${promoDetails.discountValue}%` : `€${promoDetails.discountValue}`})
                </div>
              )}

              <div style={{ marginTop: '2.5rem', display: 'flex', gap: '0.5rem', color: '#10b981', background: 'rgba(16,185,129,0.06)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.8rem', lineHeight: '1.4', border: '1px solid rgba(16,185,129,0.12)' }}>
                <span>🔒 SSL SECURE CONNECTION</span>
              </div>
            </div>

          </div>
        </div>
      </main>
    );
  }

  // 4. DEFAULT INFO FORM STEP (details)
  return (
    <main style={{ minHeight: '100vh', paddingBottom: '5rem', background: 'var(--bg-primary)' }}>
      <Navbar />

      <div className="container" style={{ paddingTop: 'calc(var(--nav-height) + 3rem)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-2xl)', alignItems: 'start', flexDirection: locale === 'ar' ? 'row' : 'row-reverse' }}>
          
          {/* Form */}
          <div className="glass-card animate-fade-in-up" style={{ padding: '2.5rem', textAlign: locale === 'ar' ? 'right' : 'left' }}>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{translate('title')}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>{translate('subtitle')}</p>

            <form onSubmit={handleProceedToPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Full Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{translate('nameLabel')}</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={translate('namePlaceholder')} 
                  style={{
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-secondary)',
                    outline: 'none',
                    fontSize: '1rem',
                    color: 'var(--text-primary)',
                    textAlign: locale === 'ar' ? 'right' : 'left'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Phone */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{translate('phoneLabel')}</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 1000..." 
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-medium)',
                      background: 'var(--bg-secondary)',
                      outline: 'none',
                      fontSize: '1rem',
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                      fontFamily: 'var(--font-en)'
                    }}
                    required
                  />
                </div>

                {/* WhatsApp */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{translate('whatsappLabel')}</label>
                  <input 
                    type="tel" 
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder={translate('whatsappPlaceholder')} 
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-medium)',
                      background: 'var(--bg-secondary)',
                      outline: 'none',
                      fontSize: '1rem',
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                      fontFamily: 'var(--font-en)'
                    }}
                  />
                </div>
              </div>

              {/* Date selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{translate('dateLabel')}</label>
                <input 
                  type="date" 
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  style={{
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-secondary)',
                    outline: 'none',
                    fontSize: '1rem',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-en)'
                  }}
                  required
                />
              </div>

              {/* Travelers count */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{translate('travelersLabel')}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'flex-start', flexDirection: locale === 'ar' ? 'row-reverse' : 'row' }}>
                  <button 
                    type="button" 
                    onClick={() => setTravelers(prev => Math.max(1, prev - 1))}
                    style={{
                      width: '40px', height: '40px',
                      borderRadius: '50%',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-medium)',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      color: 'var(--text-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', width: '30px', textAlign: 'center', fontFamily: 'var(--font-en)' }}>{travelers}</span>
                  <button 
                    type="button" 
                    onClick={() => setTravelers(prev => prev + 1)}
                    style={{
                      width: '40px', height: '40px',
                      borderRadius: '50%',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-medium)',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      color: 'var(--text-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Promo Code Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.2rem' }}>
                <label style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{translate('promoQuestion')}</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: locale === 'ar' ? 'row' : 'row-reverse' }}>
                  <input 
                    type="text" 
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder={translate('promoPlaceholder')}
                    style={{
                      flex: 1,
                      padding: '0.8rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-medium)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '1rem',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}
                  />
                  <button 
                    onClick={handleApplyPromo}
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '0 1.5rem', fontWeight: 'bold' }}
                  >
                    {translate('applyBtn')}
                  </button>
                </div>
                {promoError && (
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--coral-500)', fontWeight: 'bold' }}>
                    ⚠️ {promoError}
                  </p>
                )}
                {promoSuccess && (
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--emerald-500)', fontWeight: 'bold' }}>
                    ✓ {promoSuccess}
                  </p>
                )}
              </div>

              {/* Pay Button */}
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ width: '100%', padding: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', fontSize: '1.05rem' }}
              >
                {translate('submitBtn')}
              </button>

            </form>
          </div>

          {/* Order Summary */}
          <div className="glass-card animate-fade-in-up" style={{ padding: '2.5rem', border: '1px solid var(--border-accent)', boxShadow: 'var(--shadow-glow-gold)', textAlign: 'left' }}>
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Service Requested</span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '0.2rem' }}>{titleEn || titleAr || 'Travel Excursion'}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'var(--font-en)' }}>{titleAr}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Base Price</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>€{basePrice}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Travelers</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>{travelers}</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--coral-500)' }}>
                  <span>Discount (Promo Code)</span>
                  <span style={{ fontWeight: 'bold', fontFamily: 'var(--font-en)' }}>-€{discountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div style={{ borderTop: '2px solid var(--border-medium)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Total Due</span>
              <div style={{ fontFamily: 'var(--font-en)', fontWeight: '800', fontSize: '2rem', color: 'var(--gold-600)' }}>
                €{totalAmount.toFixed(2)}
              </div>
            </div>

            {promoDetails && (
              <div style={{ marginTop: '1.5rem', padding: '0.8rem', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--gold-400)', textAlign: 'right' }}>
                كود الخصم المطبق: <strong>{promoDetails.code}</strong> (خصم {promoDetails.discountType === 'percentage' ? `${promoDetails.discountValue}%` : `€${promoDetails.discountValue}`})
              </div>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.8rem', lineHeight: '1.4' }}>
              <span>🔒</span>
              <span>All payment details are processed under high-level SSL encryption protocols.</span>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        Loading payment checkout...
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
