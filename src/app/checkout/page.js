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

  // Translations Dictionary
  const translate = (key) => {
    const dict = {
      en: {
        title: 'Booking & Traveler Details',
        subtitle: 'Please fill traveler details correctly to confirm booking.',
        nameLabel: "Traveler's Full Name *",
        namePlaceholder: 'First and last name as in passport',
        emailLabel: 'Email Address *',
        emailPlaceholder: 'name@example.com (for invoice delivery)',
        phoneLabel: 'Contact Phone Number *',
        whatsappLabel: 'WhatsApp Number (optional)',
        whatsappPlaceholder: 'Same number or another',
        dateLabel: 'Excursion Start Date *',
        travelersLabel: 'Number of Travelers (persons)',
        pickupLabel: 'Hotel Pickup Location (Optional)',
        pickupPlaceholder: 'Hotel name, room number, or address',
        extrasTitle: 'Add-ons & Premium Extras',
        extraGuide: 'Private Tour Guide (+€25)',
        extraLunch: 'Lunch & Soft Drinks (+€15 / person)',
        extraTransfer: 'Round-trip Private Transfer (+€30)',
        extraPhotos: 'Professional Photography Session (+€20)',
        promoQuestion: 'Do you have a discount code?',
        promoPlaceholder: 'Discount code (optional)',
        applyBtn: 'Apply',
        submitBtn: '🔒 Proceed to Secure Payment Options',
        secureGateways: '💳 Secure Payment Options',
        paymentDesc: 'Please select a payment option below to secure your booking.',
        payNowTab: '💳 Pay Now (Online)',
        payLaterTab: '💵 Pay Later (On Arrival)',
        payNowDesc: 'Select your preferred secure online payment method:',
        payLaterTitle: 'Pay Cash on Arrival',
        payLaterDesc: 'You can secure your booking now and pay later when the tour starts in cash.',
        cashBtn: 'Confirm Booking & Pay Cash on Arrival',
        editBtn: '← Edit Traveler Details',
        payingMessage: 'Connecting to PayPal secure server...',
        fillAlert: 'Please fill all required fields correctly!',
        sslSecure: '🔒 SSL SECURE 256-BIT CONNECTION',
        summary: 'Order Summary',
        serviceRequested: 'Service Requested',
        basePrice: 'Base Price',
        travelers: 'Travelers',
        discount: 'Discount',
        totalDue: 'Total Due',
        appliedPromo: 'Applied promo code: {code}',
        sslNotice: 'All payment details are processed under high-level SSL encryption protocols.',
        dafahTitle: 'Credit/Debit Card (Visa / MasterCard / Mada):',
        dafahBtn: '💳 Pay Securely with Card',
        bankBtn: '🏦 Bank Transfer (تحويل بنكي)',
        bankDetailsTitle: 'Company Bank Account Details',
        confirmBankBtn: 'Confirm Bank Transfer Booking',
        simulatingMsg: 'Securing transaction, please wait...',
        childrenLabel: 'Children (2-12 years)',
        infantsLabel: 'Infants (under 2 years)',
        specialRequestsLabel: 'Special Requests / Comments',
        specialRequestsPlaceholder: 'Any dietary requirements, wheelchair access, etc.',
        termsCheckbox: 'I agree to the ',
        termsAlert: 'You must agree to the terms to proceed.',
        readTerms: 'Terms and Conditions',
        readPolicy: 'Cancellation Policy',
      },
      ar: {
        title: 'بيانات الحجز والمسافرين',
        subtitle: 'الرجاء ملء بيانات المسافر بشكل صحيح لتثبيت الحجز.',
        nameLabel: 'اسم المسافر الكامل *',
        namePlaceholder: 'الاسم الأول والأخير كما في جواز السفر',
        emailLabel: 'البريد الإلكتروني *',
        emailPlaceholder: 'name@example.com (لتسليم الفاتورة)',
        phoneLabel: 'رقم الهاتف للتواصل *',
        phonePlaceholder: '01000000000',
        whatsappLabel: 'رقم الواتساب (اختياري)',
        whatsappPlaceholder: '01000000000',
        dateLabel: 'تاريخ انطلاق الرحلة *',
        travelersLabel: 'عدد المسافرين (الأشخاص)',
        pickupLabel: 'موقع الاستلام من الفندق (اختياري)',
        pickupPlaceholder: 'اسم الفندق، رقم الغرفة، أو العنوان',
        extrasTitle: 'الخدمات والإضافات الاختيارية',
        extraGuide: 'مرشد سياحي خاص (+€25)',
        extraLunch: 'وجبة غداء ومشروبات (+€15 / للفرد)',
        extraTransfer: 'انتقالات خاصة ذهاب وعودة (+€30)',
        extraPhotos: 'جلسة تصوير احترافية (+€20)',
        promoQuestion: 'هل لديك كود خصم أو رمز إحالة؟',
        promoPlaceholder: 'أدخل كود الخصم (مثال: AHMED10)',
        applyBtn: 'تطبيق',
        submitBtn: '🔒 الانتقال إلى خيارات الدفع الآمنة',
        secureGateways: '💳 خيارات الدفع الآمنة',
        paymentDesc: 'الرجاء اختيار خيار الدفع المناسب لتأكيد حجزك.',
        payNowTab: '💳 الدفع الآن (أونلاين)',
        payLaterTab: '💵 الدفع عند الوصول (كاش)',
        payNowDesc: 'اختر طريقة الدفع الإلكتروني المفضلة لديك:',
        payLaterTitle: 'الدفع كاش عند الوصول',
        payLaterDesc: 'يمكنك تثبيت حجزك الآن والدفع لاحقاً عند انطلاق الرحلة نقداً للشركة.',
        cashBtn: '📝 تأكيد الحجز والدفع كاش عند الوصول',
        editBtn: '← تعديل بيانات الحجز والمسافرين',
        payingMessage: 'جاري الاتصال بالخادم الآمن...',
        fillAlert: 'الرجاء ملء جميع الحقول المطلوبة بشكل صحيح!',
        sslSecure: '🔒 اتصال SSL آمن ومشفّر 256 بت',
        summary: 'ملخص الطلب',
        serviceRequested: 'الخدمة المطلوبة',
        basePrice: 'السعر الأساسي',
        travelers: 'عدد المسافرين',
        discount: 'الخصم',
        totalDue: 'إجمالي المستحق',
        appliedPromo: 'كود الخصم المطبق: {code}',
        sslNotice: 'يتم معالجة جميع تفاصيل الدفع تحت بروتوكولات تشفير SSL عالية المستوى.',
        dafahTitle: 'الدفع بالبطاقة البنكية (فيزا / ماستركارد / مدى):',
        dafahBtn: '💳 الدفع الآمن بالبطاقة البنكية',
        bankBtn: '🏦 التحويل البنكي (QNB / CIB)',
        bankDetailsTitle: 'تفاصيل الحساب البنكي للشركة',
        confirmBankBtn: 'تأكيد الحجز بالتحويل البنكي',
        simulatingMsg: 'جاري معالجة المعاملة بأمان، يرجى الانتظار...',
        childrenLabel: 'أطفال (2-12 سنة)',
        infantsLabel: 'رضع (أقل من سنتين)',
        specialRequestsLabel: 'طلبات خاصة / تعليقات',
        specialRequestsPlaceholder: 'أي متطلبات غذائية، أو احتياجات خاصة الخ...',
        termsCheckbox: 'أوافق على ',
        termsAlert: 'يجب الموافقة على الشروط والأحكام للمتابعة.',
        readTerms: 'الشروط والأحكام',
        readPolicy: 'سياسة الإلغاء',
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
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [selectedExtras, setSelectedExtras] = useState({});
  const [specialRequests, setSpecialRequests] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  
  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [promoDetails, setPromoDetails] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Payment State
  const [checkoutStep, setCheckoutStep] = useState('details'); // details, payment, success, failed
  const [paymentTab, setPaymentTab] = useState('now'); // now, later
  const [selectedPayMethod, setSelectedPayMethod] = useState('card'); // card, paypal, apple_pay, google_pay, bank_transfer
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
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

  // Helpers to format selected extras
  const getSelectedExtrasString = () => {
    if (!settings?.checkoutAddons) return '';
    const arr = [];
    settings.checkoutAddons.forEach(addon => {
      if (selectedExtras[addon.id]) {
        arr.push(locale === 'ar' ? addon.nameAr : addon.nameEn);
      }
    });
    return arr.join(', ');
  };

  const getSelectedExtrasCost = () => {
    if (!settings?.checkoutAddons) return 0;
    let cost = 0;
    settings.checkoutAddons.forEach(addon => {
      if (selectedExtras[addon.id]) {
        const isPerPerson = addon.unit === 'person' || addon.nameEn?.toLowerCase().includes('/ person') || addon.nameAr?.includes('للفرد') || addon.id === 'lunch';
        cost += isPerPerson ? (addon.price * travelers) : addon.price;
      }
    });
    return cost;
  };

  // Price Calculations
  const extrasTotal = getSelectedExtrasCost();
  const originalTotal = (basePrice * travelers) + extrasTotal;
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
    if (!customerName || !email || !phone || !bookingDate) {
      alert(translate('fillAlert'));
      return;
    }
    if (!termsAccepted) {
      alert(translate('termsAlert'));
      return;
    }
    setCheckoutStep('payment');
  };

  // Handle Card Payment through Dafah
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
    url.searchParams.set('email', email);
    url.searchParams.set('pickupLocation', pickupLocation);
    url.searchParams.set('extras', getSelectedExtrasString());
    url.searchParams.set('children', children.toString());
    url.searchParams.set('infants', infants.toString());
    url.searchParams.set('specialRequests', specialRequests);
    
    router.push(url.pathname + url.search);
  };

  // Simulated Apple Pay / Google Pay Payment
  const handleSimulatedWalletPayment = async (walletName) => {
    setIsSimulatingPayment(true);
    const txId = `${walletName}-tx-${Date.now()}`;
    
    setTimeout(async () => {
      try {
        await addBooking({
          id: `BK-${txId.replace(`${walletName}-tx-`, '')}`,
          customer: customerName,
          email: email,
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
          paymentType: walletName,
          txId: txId,
          pickupLocation: pickupLocation,
          extras: getSelectedExtrasString(),
          children: children,
          infants: infants,
          specialRequests: specialRequests
        });
        
        setIsSimulatingPayment(false);
        const successUrl = `/checkout?status=success&tx=${txId}&tripId=${tripId}&amount=${totalAmount}&originalAmount=${originalTotal}&discountAmount=${discountAmount}&promoCode=${promoDetails ? promoDetails.code : ''}&agentId=${promoDetails ? promoDetails.agentId || '' : ''}&agentName=${encodeURIComponent(promoDetails ? promoDetails.agentName : 'مباشر (بدون وكيل)')}&customerName=${encodeURIComponent(customerName)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&whatsapp=${encodeURIComponent(whatsapp || phone)}&date=${encodeURIComponent(bookingDate)}&travelers=${travelers}&title=${encodeURIComponent(titleEn || titleAr)}&paymentType=${walletName}&pickupLocation=${encodeURIComponent(pickupLocation)}&extras=${encodeURIComponent(getSelectedExtrasString())}`;
        router.push(successUrl);
      } catch (err) {
        console.error(`Error saving booking on ${walletName} payment:`, err);
        setIsSimulatingPayment(false);
      }
    }, 2000);
  };

  // Simulated Bank Transfer Payment
  const handleBankTransferPayment = async () => {
    setIsSimulatingPayment(true);
    const txId = `bank-tx-${Date.now()}`;
    
    setTimeout(async () => {
      try {
        await addBooking({
          id: `BK-${txId.replace('bank-tx-', '')}`,
          customer: customerName,
          email: email,
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
          status: 'قيد الانتظار', // bank transfer starts as pending confirmation
          promoCode: promoDetails ? promoDetails.code : '',
          paymentType: 'bank_transfer',
          txId: txId,
          pickupLocation: pickupLocation,
          extras: getSelectedExtrasString(),
          children: children,
          infants: infants,
          specialRequests: specialRequests
        });
        
        setIsSimulatingPayment(false);
        const successUrl = `/checkout?status=success&tx=${txId}&tripId=${tripId}&amount=${totalAmount}&originalAmount=${originalTotal}&discountAmount=${discountAmount}&promoCode=${promoDetails ? promoDetails.code : ''}&agentId=${promoDetails ? promoDetails.agentId || '' : ''}&agentName=${encodeURIComponent(promoDetails ? promoDetails.agentName : 'مباشر (بدون وكيل)')}&customerName=${encodeURIComponent(customerName)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&whatsapp=${encodeURIComponent(whatsapp || phone)}&date=${encodeURIComponent(bookingDate)}&travelers=${travelers}&title=${encodeURIComponent(titleEn || titleAr)}&paymentType=bank_transfer&pickupLocation=${encodeURIComponent(pickupLocation)}&extras=${encodeURIComponent(getSelectedExtrasString())}`;
        router.push(successUrl);
      } catch (err) {
        console.error('Error saving booking on bank transfer payment:', err);
        setIsSimulatingPayment(false);
      }
    }, 1500);
  };

  // Mock cash / onsite payment completion
  const handleCashPayment = async () => {
    const txId = `cash-tx-${Date.now()}`;

    try {
      await addBooking({
        id: `BK-${txId.replace('cash-tx-', '')}`,
        customer: customerName,
        email: email,
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
        txId: txId,
        pickupLocation: pickupLocation,
        extras: getSelectedExtrasString(),
        children: children,
        infants: infants,
        specialRequests: specialRequests
      });
    } catch (err) {
      console.error('Error saving booking on cash payment:', err);
    }

    const successUrl = `/checkout?status=success&tx=${txId}&tripId=${tripId}&amount=${totalAmount}&originalAmount=${originalTotal}&discountAmount=${discountAmount}&promoCode=${promoDetails ? promoDetails.code : ''}&agentId=${promoDetails ? promoDetails.agentId || '' : ''}&agentName=${encodeURIComponent(promoDetails ? promoDetails.agentName : 'مباشر (بدون وكيل)')}&customerName=${encodeURIComponent(customerName)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&whatsapp=${encodeURIComponent(whatsapp || phone)}&date=${encodeURIComponent(bookingDate)}&travelers=${travelers}&title=${encodeURIComponent(titleEn || titleAr)}&paymentType=onsite&pickupLocation=${encodeURIComponent(pickupLocation)}&extras=${encodeURIComponent(getSelectedExtrasString())}`;
    router.push(successUrl);
  };

  // Load PayPal SDK Dynamically
  useEffect(() => {
    if (checkoutStep !== 'payment' || window.paypal || selectedPayMethod !== 'paypal') {
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
  }, [checkoutStep, selectedPayMethod]);

  // Render PayPal Buttons once SDK is loaded
  useEffect(() => {
    if (!paypalLoaded || !window.paypal || checkoutStep !== 'payment' || selectedPayMethod !== 'paypal') return;

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

          try {
            await addBooking({
              id: `BK-${txId.replace('pp-tx-', '')}`,
              customer: customerName,
              email: email,
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
              txId: txId,
              pickupLocation: pickupLocation,
              extras: getSelectedExtrasString(),
              children: children,
              infants: infants,
              specialRequests: specialRequests
            });
          } catch (err) {
            console.error('Error saving booking on PayPal approval:', err);
          }
          
          const successUrl = `/checkout?status=success&tx=${txId}&tripId=${tripId}&amount=${totalAmount}&originalAmount=${originalTotal}&discountAmount=${discountAmount}&promoCode=${promoDetails ? promoDetails.code : ''}&agentId=${promoDetails ? promoDetails.agentId || '' : ''}&agentName=${encodeURIComponent(promoDetails ? promoDetails.agentName : 'مباشر (بدون وكيل)')}&customerName=${encodeURIComponent(customerName)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&whatsapp=${encodeURIComponent(whatsapp || phone)}&date=${encodeURIComponent(bookingDate)}&travelers=${travelers}&title=${encodeURIComponent(titleEn || titleAr)}&paymentType=paypal&pickupLocation=${encodeURIComponent(pickupLocation)}&extras=${encodeURIComponent(getSelectedExtrasString())}`;
          router.push(successUrl);
        });
      },
      onError: (err) => {
        console.error('PayPal Error: ', err);
        router.push(`/checkout?status=failed&tripId=${tripId}&price=${basePrice}&titleAr=${encodeURIComponent(titleAr)}&type=${type}`);
      }
    }).render('#paypal-button-container');
  }, [paypalLoaded, checkoutStep, selectedPayMethod, totalAmount]);

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

  // Status check parameters (from URL redirect)
  const statusParam = searchParams.get('status') || '';
  const txParam = searchParams.get('tx') || '';
  const nameParam = searchParams.get('customerName') || '';
  const emailParam = searchParams.get('email') || '';
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
  const paymentTypeParam = searchParams.get('paymentType') || '';
  const pickupParam = searchParams.get('pickupLocation') || '';
  const extrasParam = searchParams.get('extras') || '';

  // 1. PAYMENT SUCCESS SCREEN
  if (statusParam === 'success' || checkoutStep === 'success') {
    const isBank = paymentTypeParam === 'bank_transfer';
    const isOnsite = paymentTypeParam === 'onsite';
    
    return (
      <main style={{ minHeight: '100vh', paddingBottom: '5rem', background: 'transparent' }}>
        <Navbar />
        
        <div className="container" style={{ paddingTop: 'calc(var(--nav-height) + 3rem)', maxWidth: '800px' }}>
          {/* Confirmed Card */}
          <div className="glass-card animate-fade-in-up" style={{
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
              {isBank 
                ? (locale === 'ar' ? 'تم تسجيل الحجز بنجاح!' : 'Booking Registered Successfully!') 
                : (isOnsite ? (locale === 'ar' ? 'تم تسجيل الحجز بنجاح!' : 'Booking Registered Successfully!') : (locale === 'ar' ? 'تم تأكيد الدفع بنجاح!' : 'Payment Confirmed Successfully!'))
              }
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              {isBank 
                ? (locale === 'ar' ? 'تم تسجيل حجزك في النظام. يرجى إتمام التحويل البنكي لتأكيده.' : 'Your booking is recorded. Please complete the bank transfer to activate it.')
                : (isOnsite 
                  ? (locale === 'ar' ? 'تم استلام طلبك. الدفع نقداً عند انطلاق الرحلة!' : 'We received your order. You will pay cash when the tour starts!') 
                  : (locale === 'ar' ? 'تم تسجيل حجزك وتأكيد الدفع وإصدار الفاتورة.' : 'We are delighted to register your booking. Payment is confirmed and invoice has been issued.'))
              }
            </p>
          </div>

          {/* BANK TRANSFER DETAILS BLOCK */}
          {isBank && (
            <div className="glass-card animate-fade-in-up" style={{
              background: 'rgba(251, 191, 36, 0.05)',
              border: '1px solid var(--gold-400)',
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem',
              marginBottom: '2rem',
              textAlign: locale === 'ar' ? 'right' : 'left'
            }}>
              <h3 style={{ color: 'var(--gold-600)', margin: '0 0 0.8rem 0', fontWeight: 'bold', fontSize: '1.3rem' }}>
                {locale === 'ar' ? '⚠️ خطوة هامة: إكمال التحويل البنكي' : '⚠️ Critical Step: Complete Bank Transfer'}
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {locale === 'ar' 
                  ? 'يرجى تحويل المبلغ الإجمالي إلى الحساب البنكي الرسمي الموضح أدناه، ثم قم بالتقاط لقطة شاشة للتحويل (Screenshot) وإرسالها إلينا عبر واتساب لتأكيد الحجز رسمياً في غضون 24 ساعة.' 
                  : 'Please transfer the total amount to the official bank account below, then send a screenshot of the transfer receipt via WhatsApp to finalize your reservation within 24 hours.'}
              </p>
              
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                padding: '1.5rem',
                fontSize: '0.95rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
                fontFamily: 'var(--font-en)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>{locale === 'ar' ? 'البنك:' : 'Bank:'}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>QNB EGYPT</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>{locale === 'ar' ? 'صاحب الحساب:' : 'Account Name:'}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>ORLUXUS GROUP Ltd.</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>{locale === 'ar' ? 'رقم الحساب:' : 'Account Number:'}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>20330745261-75</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>IBAN:</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.85rem' }}>EG540002020300203307452617589</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Swift Code:</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>MSYREGCX</span>
                </div>
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <a 
                  href={`https://wa.me/20100000000?text=${encodeURIComponent(locale === 'ar' ? `مرحباً، أود تأكيد التحويل البنكي لحجزي بقيمة €${amountParam.toFixed(2)} رقم المعاملة #${txParam}` : `Hello, I'd like to confirm the bank transfer of €${amountParam.toFixed(2)} for transaction #${txParam}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '0.8rem 2rem',
                    borderRadius: '9999px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  💬 {locale === 'ar' ? 'إرسال إيصال التحويل عبر واتساب' : 'Send Transfer Receipt via WhatsApp'}
                </a>
              </div>
            </div>
          )}

          {/* Luxurious Invoice Sheet */}
          <div id="invoice-sheet" className="glass-card animate-fade-in-up" style={{
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
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontFamily: 'var(--font-en)' }}>Invoice #{txParam.replace('pp-tx-', '').replace('cash-tx-', '').replace('dafah-tx-', '').replace('bank-tx-', '').replace('apple_pay-tx-', '').replace('google_pay-tx-', '').slice(0, 8)}</span>
              </div>
            </div>

            {/* Customer & Date Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2.5rem', textAlign: locale === 'ar' ? 'right' : 'left' }}>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Traveler Details</h4>
                <p style={{ margin: '0 0 0.3rem 0', fontWeight: 'bold', fontSize: '1.05rem' }}>{nameParam}</p>
                {emailParam && <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: '#475569' }}>✉ {emailParam}</p>}
                <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: '#475569' }}>📞 {phoneParam}</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>💬 {whatsappParam}</p>
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Booking Info</h4>
                <p style={{ margin: '0 0 0.3rem 0', fontWeight: 'bold' }}>Scheduled Date: {dateParam}</p>
                <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: '#475569' }}>Travelers: {travelersParam} Persons</p>
                {pickupParam && <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: '#475569' }}>📍 Pickup: {pickupParam}</p>}
                <p style={{ margin: 0, fontSize: '0.9rem', color: (isBank || isOnsite) ? '#f59e0b' : '#10b981', fontWeight: 'bold' }}>
                  Gateway: {isBank ? 'Bank Transfer' : (isOnsite ? 'Cash on Site' : (paymentTypeParam === 'card' ? 'Dafah Credit Card' : paymentTypeParam.toUpperCase()))}
                </p>
              </div>
            </div>

            {/* Invoice Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2.5rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem', textAlign: locale === 'ar' ? 'right' : 'left', fontWeight: 'bold', fontSize: '0.9rem', color: '#475569' }}>Service Description</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', color: '#475569' }}>Qty</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', fontSize: '0.9rem', color: '#475569' }}>Rate</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', fontSize: '0.9rem', color: '#475569' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1.2rem 1rem', fontSize: '1rem', fontWeight: '600', textAlign: locale === 'ar' ? 'right' : 'left' }}>{titleParam || 'Egypt Travel Package'}</td>
                  <td style={{ padding: '1.2rem 1rem', textAlign: 'center', fontFamily: 'var(--font-en)' }}>{travelersParam}</td>
                  <td style={{ padding: '1.2rem 1rem', textAlign: 'right', fontFamily: 'var(--font-en)' }}>€{(originalParam / travelersParam).toFixed(2)}</td>
                  <td style={{ padding: '1.2rem 1rem', textAlign: 'right', fontFamily: 'var(--font-en)', fontWeight: 'bold' }}>€{originalParam.toFixed(2)}</td>
                </tr>
                {extrasParam && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafb' }}>
                    <td style={{ padding: '0.8rem 1rem', fontSize: '0.9rem', color: '#475569', textAlign: locale === 'ar' ? 'right' : 'left' }}>
                      🎁 Extras: {extrasParam}
                    </td>
                    <td style={{ padding: '0.8rem 1rem', textAlign: 'center' }}>-</td>
                    <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>-</td>
                    <td style={{ padding: '0.8rem 1rem', textAlign: 'right', fontFamily: 'var(--font-en)', color: '#475569', fontWeight: 'bold' }}>
                      Included
                    </td>
                  </tr>
                )}
                {discountParam > 0 && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fef2f2' }}>
                    <td style={{ padding: '0.8rem 1rem', fontSize: '0.9rem', color: '#dc2626', textAlign: locale === 'ar' ? 'right' : 'left', fontWeight: 'bold' }}>
                      Promo Code Discount (Code: {promoParam})
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
                    <td colSpan="4" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#475569', textAlign: locale === 'ar' ? 'left' : 'right', fontStyle: 'italic' }}>
                      Referred by Agent: <strong>{agentNameParam}</strong>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Total Block */}
            <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ textAlign: locale === 'ar' ? 'right' : 'left' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>Payment Status</span>
                <span style={{ 
                  color: (isBank || isOnsite) ? '#b45309' : '#10b981', 
                  fontWeight: 'bold', 
                  fontSize: '1rem', 
                  background: (isBank || isOnsite) ? '#fef3c7' : '#ecfdf5', 
                  padding: '4px 12px', 
                  borderRadius: '9999px', 
                  display: 'inline-block', 
                  marginTop: '0.3rem' 
                }}>
                  {isBank ? 'PENDING TRANSFER' : (isOnsite ? 'PAY ON ARRIVAL' : 'PAID IN FULL')}
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
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', cursor: 'pointer' }}
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
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
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

  // 3. SECURE GATEWAY / PAYMENT METHOD CHOICE (Step 2)
  if (checkoutStep === 'payment') {
    const isAr = locale === 'ar';
    return (
      <main style={{ minHeight: '100vh', paddingBottom: '5rem', background: 'transparent' }}>
        <Navbar />
        
        {/* Processing overlay for simulated wallets */}
        {isSimulatingPayment && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'var(--bg-glass-strong)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            zIndex: 9999,
            textAlign: 'center',
            padding: '2rem'
          }}>
            <div className="spinner" style={{
              width: '50px',
              height: '50px',
              border: '4px solid var(--border-medium)',
              borderTop: '4px solid var(--gold-500)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              {translate('simulatingMsg')}
            </p>
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        <div className="container" style={{ paddingTop: 'calc(var(--nav-height) + 3rem)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-2xl)', alignItems: 'start' }}>
            
            {/* Left side: Tab control & payment options */}
            <div className="glass-card animate-fade-in-up" style={{ padding: '2.5rem', textAlign: isAr ? 'right' : 'left' }}>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{translate('secureGateways')}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>{translate('paymentDesc')}</p>

              {/* Tab Selector */}
              <div style={{ 
                display: 'flex', 
                background: 'var(--bg-tertiary)', 
                padding: '6px', 
                borderRadius: '12px', 
                marginBottom: '2rem',
                border: '1px solid var(--border-subtle)'
              }}>
                <button
                  type="button"
                  onClick={() => setPaymentTab('now')}
                  style={{
                    flex: 1,
                    padding: '0.8rem',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    transition: 'var(--transition-base)',
                    background: paymentTab === 'now' ? 'var(--bg-secondary)' : 'transparent',
                    color: paymentTab === 'now' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    boxShadow: paymentTab === 'now' ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  {translate('payNowTab')}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentTab('later')}
                  style={{
                    flex: 1,
                    padding: '0.8rem',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    transition: 'var(--transition-base)',
                    background: paymentTab === 'later' ? 'var(--bg-secondary)' : 'transparent',
                    color: paymentTab === 'later' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    boxShadow: paymentTab === 'later' ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  {translate('payLaterTab')}
                </button>
              </div>

              {/* TAB 1: PAY NOW */}
              {paymentTab === 'now' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{translate('payNowDesc')}</p>
                  
                  {/* Grid of payment method selectors */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem' }}>
                    
                    {/* Card Option */}
                    <button
                      type="button"
                      onClick={() => setSelectedPayMethod('card')}
                      style={{
                        padding: '1rem',
                        borderRadius: '10px',
                        background: 'var(--bg-secondary)',
                        border: selectedPayMethod === 'card' ? '2px solid var(--gold-500)' : '1px solid var(--border-medium)',
                        boxShadow: selectedPayMethod === 'card' ? 'var(--shadow-glow-gold)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'var(--transition-base)'
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>💳</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {isAr ? 'بطاقة بنكية' : 'Credit Card'}
                      </span>
                    </button>

                    {/* PayPal Option */}
                    <button
                      type="button"
                      onClick={() => setSelectedPayMethod('paypal')}
                      style={{
                        padding: '1rem',
                        borderRadius: '10px',
                        background: 'var(--bg-secondary)',
                        border: selectedPayMethod === 'paypal' ? '2px solid var(--gold-500)' : '1px solid var(--border-medium)',
                        boxShadow: selectedPayMethod === 'paypal' ? 'var(--shadow-glow-gold)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'var(--transition-base)'
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>🅿️</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        PayPal
                      </span>
                    </button>

                    {/* Apple Pay Option */}
                    <button
                      type="button"
                      onClick={() => setSelectedPayMethod('apple_pay')}
                      style={{
                        padding: '1rem',
                        borderRadius: '10px',
                        background: 'var(--bg-secondary)',
                        border: selectedPayMethod === 'apple_pay' ? '2px solid var(--gold-500)' : '1px solid var(--border-medium)',
                        boxShadow: selectedPayMethod === 'apple_pay' ? 'var(--shadow-glow-gold)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'var(--transition-base)'
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>🍏</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        Apple Pay
                      </span>
                    </button>

                    {/* Google Pay Option */}
                    <button
                      type="button"
                      onClick={() => setSelectedPayMethod('google_pay')}
                      style={{
                        padding: '1rem',
                        borderRadius: '10px',
                        background: 'var(--bg-secondary)',
                        border: selectedPayMethod === 'google_pay' ? '2px solid var(--gold-500)' : '1px solid var(--border-medium)',
                        boxShadow: selectedPayMethod === 'google_pay' ? 'var(--shadow-glow-gold)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'var(--transition-base)'
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>🤖</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        Google Pay
                      </span>
                    </button>

                    {/* Bank Transfer Option */}
                    <button
                      type="button"
                      onClick={() => setSelectedPayMethod('bank_transfer')}
                      style={{
                        padding: '1rem',
                        borderRadius: '10px',
                        background: 'var(--bg-secondary)',
                        border: selectedPayMethod === 'bank_transfer' ? '2px solid var(--gold-500)' : '1px solid var(--border-medium)',
                        boxShadow: selectedPayMethod === 'bank_transfer' ? 'var(--shadow-glow-gold)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'var(--transition-base)'
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>🏦</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {isAr ? 'تحويل بنكي' : 'Bank'}
                      </span>
                    </button>
                  </div>

                  <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '1rem 0' }} />

                  {/* ACTIVE METHOD SUB-VIEWS */}
                  
                  {/* CARD SUB-VIEW */}
                  {selectedPayMethod === 'card' && (
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>{translate('dafahTitle')}</h4>
                      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                        {isAr ? 'ادفع بأمان وسهولة ببطاقة مدى أو فيزا أو ماستركارد عبر بوابة دفة المشفرة.' : 'Pay securely using Mada, Visa, or Mastercard via Dafah secure gateway.'}
                      </p>
                      
                      <button 
                        onClick={handleDafahPayment} 
                        className="btn btn-primary" 
                        style={{ 
                          width: '100%', 
                          padding: '1.1rem', 
                          fontWeight: 'bold', 
                          fontSize: '1rem',
                          background: 'var(--gradient-gold)',
                          color: 'white',
                          border: 'none',
                          boxShadow: '0 4px 15px rgba(251, 191, 36, 0.2)',
                          cursor: 'pointer'
                        }}
                      >
                        {translate('dafahBtn')}
                      </button>
                    </div>
                  )}

                  {/* PAYPAL SUB-VIEW */}
                  {selectedPayMethod === 'paypal' && (
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '1.2rem', fontWeight: 'bold' }}>PayPal Smart Checkout:</h4>
                      {!paypalLoaded ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                          {translate('payingMessage')}
                        </div>
                      ) : null}
                      <div id="paypal-button-container" style={{ minHeight: '150px' }}></div>
                    </div>
                  )}

                  {/* APPLE PAY SUB-VIEW */}
                  {selectedPayMethod === 'apple_pay' && (
                    <div style={{ textAlign: 'center' }}>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 'bold', textAlign: isAr ? 'right' : 'left' }}> Pay (Apple Pay):</h4>
                      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: isAr ? 'right' : 'left' }}>
                        {isAr ? 'ادفع بسرعة وأمان باستخدام بطاقتك المخزنة في جهاز Apple الخاص بك.' : 'Check out instantly and securely using your saved cards on Apple Pay.'}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleSimulatedWalletPayment('apple_pay')}
                        style={{
                          width: '100%',
                          height: '52px',
                          background: '#000000',
                          border: 'none',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          transition: 'transform 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        {/* Mock Apple Pay logo */}
                        <svg width="60" height="24" viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.923 11.233c.012-2.186 1.777-3.236 1.86-3.292-1.012-1.48-2.585-1.68-3.149-1.705-1.344-.136-2.628.796-3.308.796-.681 0-1.748-.775-2.875-.753-1.482.022-2.853.864-3.616 2.193-1.543 2.68-.396 6.643 1.103 8.815.733 1.06 1.6 2.247 2.748 2.205 1.106-.043 1.523-.714 2.785-.714 1.261 0 1.642.714 2.793.693 1.173-.022 1.936-1.077 2.663-2.138.84-1.229 1.187-2.42 1.207-2.482-.025-.011-2.316-.889-2.311-3.618M11.206 5.378c.606-.736 1.012-1.758.902-2.775-.875.035-1.938.583-2.565 1.319-.562.65-.96 1.687-.828 2.684.975.076 1.885-.492 2.491-1.228" fill="#FFFFFF"/>
                          <text x="28" y="17" fill="#FFFFFF" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: '700', fontSize: '15px' }}>Pay</text>
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* GOOGLE PAY SUB-VIEW */}
                  {selectedPayMethod === 'google_pay' && (
                    <div style={{ textAlign: 'center' }}>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 'bold', textAlign: isAr ? 'right' : 'left' }}>Google Pay:</h4>
                      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: isAr ? 'right' : 'left' }}>
                        {isAr ? 'ادفع بسرعة وأمان باستخدام بطاقتك المحفوظة في حسابك على Google.' : 'Check out instantly and securely using your saved cards on Google Pay.'}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleSimulatedWalletPayment('google_pay')}
                        style={{
                          width: '100%',
                          height: '52px',
                          background: '#000000',
                          border: '1px solid #3c4043',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                          transition: 'transform 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        {/* Google Pay Mock text logo */}
                        <span style={{ color: '#ffffff', fontFamily: '"Google Sans", Roboto, sans-serif', fontWeight: '500', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '700' }}>Google</span> Pay
                        </span>
                      </button>
                    </div>
                  )}

                  {/* BANK TRANSFER SUB-VIEW */}
                  {selectedPayMethod === 'bank_transfer' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                      <h4 style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{translate('bankDetailsTitle')}</h4>
                      
                      <div style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '8px',
                        padding: '1.2rem',
                        fontSize: '0.9rem',
                        lineHeight: '1.6',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.6rem',
                        fontFamily: 'var(--font-en)'
                      }}>
                        <div><strong>Bank Name:</strong> QNB EGYPT</div>
                        <div><strong>Account Name:</strong> ORLUXUS GROUP Ltd.</div>
                        <div><strong>Account No:</strong> 20330745261-75</div>
                        <div><strong>IBAN:</strong> EG540002020300203307452617589</div>
                        <div><strong>Swift Code:</strong> MSYREGCX</div>
                      </div>

                      <button 
                        onClick={handleBankTransferPayment} 
                        className="btn btn-primary" 
                        style={{ 
                          width: '100%', 
                          padding: '1.1rem', 
                          fontWeight: 'bold', 
                          fontSize: '1rem',
                          background: 'var(--gradient-gold)',
                          border: 'none',
                          color: 'white',
                          boxShadow: 'var(--shadow-glow-gold)',
                          cursor: 'pointer'
                        }}
                      >
                        {translate('confirmBankBtn')}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PAY LATER */}
              {paymentTab === 'later' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h4 style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{translate('payLaterTitle')}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>{translate('payLaterDesc')}</p>
                  
                  <button 
                    onClick={handleCashPayment} 
                    className="btn btn-secondary" 
                    style={{ 
                      width: '100%', 
                      padding: '1.1rem', 
                      fontWeight: 'bold', 
                      fontSize: '1rem',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    {translate('cashBtn')}
                  </button>
                </div>
              )}

              {/* Edit Back button */}
              <button 
                onClick={() => setCheckoutStep('details')} 
                style={{ 
                  marginTop: '2rem', 
                  color: 'var(--text-tertiary)', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  gap: '0.5rem', 
                  alignItems: 'center', 
                  fontSize: '0.9rem',
                  flexDirection: isAr ? 'row' : 'row-reverse' 
                }}
              >
                {translate('editBtn')}
              </button>
            </div>

            {/* Right side: Order Summary */}
            <div className="glass-card animate-fade-in-up" style={{ padding: '2.5rem', border: '1px solid var(--border-accent)', boxShadow: 'var(--shadow-glow-gold)', textAlign: 'left' }}>
              <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem', color: 'var(--text-primary)' }}>{translate('summary')}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>{translate('serviceRequested')}</span>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '0.2rem' }}>{titleEn || titleAr || 'Travel Excursion'}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'var(--font-en)' }}>{titleAr}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{translate('basePrice')}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>€{basePrice}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{translate('travelers')}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>{travelers}</span>
                </div>

                {/* Extras Cost rows */}
                {selectedExtras.guide && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>• Private Tour Guide</span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>+€25</span>
                  </div>
                )}
                {selectedExtras.lunch && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>• Lunch & Soft Drinks</span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>+€{15 * travelers}</span>
                  </div>
                )}
                {selectedExtras.transfer && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>• Round-trip Transfer</span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>+€30</span>
                  </div>
                )}
                {selectedExtras.photos && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>• Professional Photography</span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>+€20</span>
                  </div>
                )}

                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--coral-500)' }}>
                    <span>{translate('discount')}</span>
                    <span style={{ fontWeight: 'bold', fontFamily: 'var(--font-en)' }}>-€{discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '2px solid var(--border-medium)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{translate('totalDue')}</span>
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

  // 4. DEFAULT INFO FORM STEP (Step 1: details)
  const isAr = locale === 'ar';
  return (
    <main style={{ minHeight: '100vh', paddingBottom: '5rem', background: 'transparent' }}>
      <Navbar />

      <div className="container" style={{ paddingTop: 'calc(var(--nav-height) + 3rem)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap-reverse', gap: 'var(--space-2xl)', alignItems: 'flex-start' }}>
          
          {/* Form */}
          <div className="glass-card animate-fade-in-up" style={{ flex: '1 1 500px', textAlign: isAr ? 'right' : 'left' }}>
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
                    textAlign: isAr ? 'right' : 'left'
                  }}
                  required
                />
              </div>

              {/* Email Address */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{translate('emailLabel')}</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={translate('emailPlaceholder')} 
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

              {/* Phone & WhatsApp Grid */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {/* Phone */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1 1 200px' }}>
                  <label style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{translate('phoneLabel')}</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+20 1000..."
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-medium)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-en)',
                      outline: 'none',
                      direction: 'ltr',
                      textAlign: isAr ? 'right' : 'left'
                    }}
                  />
                </div>

                {/* WhatsApp */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1 1 200px' }}>
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
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-en)',
                      outline: 'none',
                      direction: 'ltr',
                      textAlign: isAr ? 'right' : 'left'
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'flex-start', flexDirection: isAr ? 'row-reverse' : 'row' }}>
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
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer'
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
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children count */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{translate('childrenLabel')}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'flex-start', flexDirection: isAr ? 'row-reverse' : 'row' }}>
                  <button type="button" onClick={() => setChildren(prev => Math.max(0, prev - 1))} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>-</button>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', width: '30px', textAlign: 'center', fontFamily: 'var(--font-en)' }}>{children}</span>
                  <button type="button" onClick={() => setChildren(prev => prev + 1)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
                </div>
              </div>

              {/* Infants count */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{translate('infantsLabel')}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'flex-start', flexDirection: isAr ? 'row-reverse' : 'row' }}>
                  <button type="button" onClick={() => setInfants(prev => Math.max(0, prev - 1))} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>-</button>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', width: '30px', textAlign: 'center', fontFamily: 'var(--font-en)' }}>{infants}</span>
                  <button type="button" onClick={() => setInfants(prev => prev + 1)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
                </div>
              </div>

              {/* Hotel Pickup Location */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{translate('pickupLabel')}</label>
                <input 
                  type="text" 
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder={translate('pickupPlaceholder')} 
                  style={{
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-secondary)',
                    outline: 'none',
                    fontSize: '1rem',
                    color: 'var(--text-primary)',
                    textAlign: isAr ? 'right' : 'left'
                  }}
                />
              </div>

              {/* PREMIUM EXTRAS & ADD-ONS */}
              {settings?.checkoutAddons && settings.checkoutAddons.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.8rem', 
                  borderTop: '1px solid var(--border-subtle)', 
                  paddingTop: '1.2rem' 
                }}>
                  <h4 style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1rem' }}>{translate('extrasTitle')}</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {settings.checkoutAddons.map(addon => {
                      const desc = locale === 'ar' ? addon.descAr : addon.descEn;
                      return (
                        <div key={addon.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.4rem', textAlign: locale === 'ar' ? 'right' : 'left' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)', flexDirection: locale === 'ar' ? 'row-reverse' : 'row' }}>
                            <input 
                              type="checkbox" 
                              checked={!!selectedExtras[addon.id]}
                              onChange={(e) => setSelectedExtras(prev => ({ ...prev, [addon.id]: e.target.checked }))}
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span style={{ flex: 1 }}>
                              {locale === 'ar' ? addon.nameAr : addon.nameEn} 
                              {' '}
                              (+€{addon.price}
                              {addon.unit === 'person' || addon.nameEn?.toLowerCase().includes('/ person') || addon.nameAr?.includes('للفرد') || addon.id === 'lunch'
                                ? (locale === 'ar' ? ' / للفرد' : ' / person') 
                                : ''}
                              )
                            </span>
                          </label>
                          {desc && (
                            <span style={{ 
                              fontSize: '0.8rem', 
                              color: 'var(--text-tertiary)', 
                              paddingLeft: locale === 'ar' ? '0' : '1.8rem', 
                              paddingRight: locale === 'ar' ? '1.8rem' : '0',
                              marginTop: '-2px',
                              lineHeight: '1.4'
                            }}>
                              ℹ️ {desc}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Special Requests */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.2rem' }}>
                <label style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{translate('specialRequestsLabel')}</label>
                <textarea 
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder={translate('specialRequestsPlaceholder')} 
                  rows="3"
                  style={{
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-secondary)',
                    outline: 'none',
                    fontSize: '1rem',
                    color: 'var(--text-primary)',
                    textAlign: isAr ? 'right' : 'left',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Promo Code Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.2rem' }}>
                <label style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{translate('promoQuestion')}</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: isAr ? 'row' : 'row-reverse' }}>
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
                    style={{ padding: '0 1.5rem', fontWeight: 'bold', cursor: 'pointer' }}
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

              {/* Terms Checkbox */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {translate('termsCheckbox')}
                    <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setModalTitle(translate('readTerms'));
                        setModalContent(settings?.dataProtection || 'No terms provided.');
                        setShowTermsModal(true);
                      }} 
                      style={{ color: 'var(--gold-500)', textDecoration: 'underline' }}
                    >
                      {translate('readTerms')}
                    </a>
                    {' و '}
                    <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setModalTitle(translate('readPolicy'));
                        setModalContent(settings?.legalCancellation || 'No policy provided.');
                        setShowTermsModal(true);
                      }} 
                      style={{ color: 'var(--gold-500)', textDecoration: 'underline' }}
                    >
                      {translate('readPolicy')}
                    </a>
                  </span>
                </label>
              </div>

              {/* Pay Button */}
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ width: '100%', padding: '1.1rem', marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', fontSize: '1.05rem', cursor: 'pointer', border: 'none' }}
              >
                {translate('submitBtn')}
              </button>

            </form>
          </div>

          {/* Order Summary */}
          <div className="glass-card animate-fade-in-up" style={{ flex: '1 1 320px', padding: '2.5rem', border: '1px solid var(--border-accent)', boxShadow: 'var(--shadow-glow-gold)', textAlign: 'left' }}>
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem', color: 'var(--text-primary)' }}>{translate('summary')}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>{translate('serviceRequested')}</span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '0.2rem' }}>{titleEn || titleAr || 'Travel Excursion'}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'var(--font-en)' }}>{titleAr}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{translate('basePrice')}</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>€{basePrice}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{translate('travelers')}</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>{travelers}</span>
              </div>

              {/* Extras Cost rows */}
              {selectedExtras.guide && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>• Private Tour Guide</span>
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>+€25</span>
                </div>
              )}
              {selectedExtras.lunch && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>• Lunch & Soft Drinks</span>
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>+€{15 * travelers}</span>
                </div>
              )}
              {selectedExtras.transfer && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>• Round-trip Transfer</span>
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>+€30</span>
                </div>
              )}
              {selectedExtras.photos && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>• Professional Photography</span>
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>+€20</span>
                </div>
              )}

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--coral-500)' }}>
                  <span>{translate('discount')}</span>
                  <span style={{ fontWeight: 'bold', fontFamily: 'var(--font-en)' }}>-€{discountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div style={{ borderTop: '2px solid var(--border-medium)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{translate('totalDue')}</span>
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

      {/* Terms Modal Overlay */}
      {showTermsModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          backdropFilter: 'blur(5px)'
        }}>
          <div className="glass-card animate-scale-up" style={{
            background: 'var(--bg-primary)', width: '100%', maxWidth: '600px',
            borderRadius: '12px', padding: '2rem', border: '1px solid var(--border-accent)',
            boxShadow: 'var(--shadow-glow-gold)', textAlign: isAr ? 'right' : 'left'
          }}>
            <h3 style={{ color: 'var(--gold-400)', marginBottom: '1.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}>{modalTitle}</h3>
            <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-wrap', maxHeight: '60vh', overflowY: 'auto', marginBottom: '2rem' }}>
              {modalContent}
            </div>
            <div style={{ textAlign: 'center' }}>
              <button className="btn btn-primary" onClick={() => setShowTermsModal(false)} style={{ padding: '0.8rem 2.5rem' }}>
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
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
