'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import { validatePromoCode, addBooking, getSettings } from '@/lib/db';
import { createDafahCheckoutSession } from '@/lib/dafah';
import { createPaytabsPayment } from '@/lib/paytabs';
import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/hooks/useSettings';
import DafahSimulatedGateway from '@/components/DafahSimulatedGateway';
import TranslatedText from '@/components/TranslatedText';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale, t: tGlobal, isReady } = useLanguage();
  const isAr = locale === 'ar';
  const { settings } = useSettings();

  const emergencyNum = settings?.emergencyPhone || '+201038820014';
  const whatsappNum = settings?.whatsapp || '+201038820019';

  // Translations — uses global messages.js (supports all 10 languages).
  // Falls back to English only if the key is completely missing.
  const translate = (key) => {
    const globalKey = `checkout.${key}`;
    const translatedValue = tGlobal(globalKey);
    // If tGlobal returned something real (not the raw key), use it
    if (translatedValue && translatedValue !== globalKey) {
      return translatedValue;
    }
    // Ultimate safety fallback (English hardcoded)
    const enFallback = {
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
      languageLabel: 'Preferred Language *',
      pickupPlaceholder: 'Hotel name, room number, or address',
      extrasTitle: 'Add-ons & Premium Extras',
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
      bankBtn: '🏦 Bank Transfer',
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
    };
    return enFallback[key] || key;
  };

  // Parse query parameters
  const tripId = searchParams.get('tripId') || '';
  const basePrice = parseFloat(searchParams.get('price') || '0');
  const titleAr = searchParams.get('titleAr') || '';
  const titleEn = searchParams.get('titleEn') || '';
  const type = searchParams.get('type') || 'trip';
  const category = searchParams.get('category') || '';
  const tier = searchParams.get('tier') || 'economy';
  const tierDesc = searchParams.get('tierDesc') || searchParams.get('desc') || '';

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
  const [customerLanguage, setCustomerLanguage] = useState(locale || 'ar');
  const [electronicSignature, setElectronicSignature] = useState(null);
  const [signatureTimestamp, setSignatureTimestamp] = useState(null);

  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [promoDetails, setPromoDetails] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Payment State
  const [checkoutStep, setCheckoutStep] = useState('details'); // details, payment, success, failed
  const [paymentTab, setPaymentTab] = useState('now'); // now, later
  const [selectedPayMethod, setSelectedPayMethod] = useState('bank_transfer'); // bank_transfer, card, paypal, apple_pay, google_pay
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [paymentTxId, setPaymentTxId] = useState('');
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  // Bank Transfer Custom Gateway State
  const [selectedBankId, setSelectedBankId] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [clientTransferRef, setClientTransferRef] = useState('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState('');
  const [copiedField, setCopiedField] = useState('');
  const [bookingRefCode] = useState(() => `ORLX-${Date.now().toString().slice(-6)}`);

  useEffect(() => {
    // Settings loaded via useSettings hook
  }, []);

  // Set default selected bank when settings load
  useEffect(() => {
    if (settings?.bankAccounts && Array.isArray(settings.bankAccounts) && settings.bankAccounts.length > 0) {
      const activeBanks = settings.bankAccounts.filter(b => b.isActive !== false);
      if (activeBanks.length > 0 && !selectedBankId) {
        setSelectedBankId(activeBanks[0].id);
      }
    }
  }, [settings?.bankAccounts, selectedBankId]);

  const paypalEmail = settings?.paypalEmail || 'info@orluxus.com';

  // Helpers to format selected extras
  const getSelectedExtrasList = () => {
    const defaultAddons = [
      { id: 'guide', nameEn: 'Private Tour Guide', nameAr: 'مرشد سياحي خاص', nameDe: 'Privater Reiseleiter', price: 25, unit: 'booking' },
      { id: 'lunch', nameEn: 'Lunch & Soft Drinks', nameAr: 'وجبة غداء ومشروبات', nameDe: 'Mittagessen & Erfrischungsgetränke', price: 15, unit: 'person' },
      { id: 'transfer', nameEn: 'Round-trip Private Transfer', nameAr: 'انتقالات خاصة ذهاب وعودة', nameDe: 'Privater Hin- und Rücktransfer', price: 30, unit: 'booking' },
      { id: 'photos', nameEn: 'Professional Photography Session', nameAr: 'جلسة تصوير احترافية', nameDe: 'Professionelles Fotoshooting', price: 20, unit: 'booking' },
    ];
    const addons = (settings?.checkoutAddons && settings.checkoutAddons.length > 0) ? settings.checkoutAddons : defaultAddons;
    const list = [];
    addons.forEach(addon => {
      if (selectedExtras[addon.id]) {
        const isTransfer = addon.id === 'transfer' || addon.nameEn?.toLowerCase().includes('transfer') || addon.nameAr?.includes('انتقال');
        const isPerPerson = !isTransfer && (addon.unit === 'person' || addon.nameEn?.toLowerCase().includes('/ person') || addon.nameAr?.includes('للفرد') || addon.id === 'lunch');
        const qty = isPerPerson ? travelers : 1;
        const rate = Number(addon.price || 0);
        const total = isPerPerson ? (rate * travelers) : rate;
        let name = locale === 'ar' ? (addon.nameAr || addon.nameEn) : locale === 'de' ? (addon.nameDe || addon.nameEn) : (addon.nameEn || addon.nameAr);
        if (!name) name = addon.nameEn || addon.nameAr || addon.id;
        list.push({
          id: addon.id,
          name: name,
          nameEn: addon.nameEn || addon.nameAr || addon.id,
          nameAr: addon.nameAr || addon.nameEn || addon.id,
          nameDe: addon.nameDe || addon.nameEn || addon.id,
          qty: qty,
          rate: rate,
          total: total
        });
      }
    });
    return list;
  };

  const getSelectedExtrasString = () => {
    const list = getSelectedExtrasList();
    if (list.length === 0) return '';
    return list.map(item => item.name).join(', ');
  };

  const getSelectedExtrasCost = () => {
    const list = getSelectedExtrasList();
    return list.reduce((sum, item) => sum + item.total, 0);
  };

  // Price Calculations
  const extrasTotal = getSelectedExtrasCost();

  // Helper: Send booking confirmation email
  const sendBookingEmail = async (bookingData) => {
    try {
      await fetch('/api/send-booking-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
    } catch (err) {
      console.error('[checkout] Email send error (non-blocking):', err);
    }
  };

  
  // Resolve additional person price, child price, and infant price from query params or settings
  const paramChildPrice = parseFloat(searchParams.get('childPrice'));
  const paramInfantPrice = parseFloat(searchParams.get('infantPrice'));
  const paramAddPersonPrice = parseFloat(searchParams.get('additionalPersonPrice'));

  let additionalPersonPrice = (!isNaN(paramAddPersonPrice) && paramAddPersonPrice > 0) ? paramAddPersonPrice : basePrice;
  if (isNaN(paramAddPersonPrice) && settings?.additionalPrices) {
    const resolvedCategory = category || (type === 'package' ? 'packages' : '');
    if (resolvedCategory && settings.additionalPrices[resolvedCategory]) {
      const tierPrices = settings.additionalPrices[resolvedCategory];
      const configuredPrice = parseFloat(tierPrices[tier]);
      if (!isNaN(configuredPrice) && configuredPrice > 0) {
        additionalPersonPrice = configuredPrice;
      }
    }
  }

  let childPrice = (!isNaN(paramChildPrice) && paramChildPrice >= 0) ? paramChildPrice : 0;
  if (isNaN(paramChildPrice) && settings?.childPrices) {
    const resolvedCategory = category || (type === 'package' ? 'packages' : '');
    if (resolvedCategory && settings.childPrices[resolvedCategory]) {
      const cp = parseFloat(settings.childPrices[resolvedCategory][tier]);
      if (!isNaN(cp)) childPrice = cp;
    }
  }

  let infantPrice = (!isNaN(paramInfantPrice) && paramInfantPrice >= 0) ? paramInfantPrice : 0;
  if (isNaN(paramInfantPrice) && settings?.infantPrices) {
    const resolvedCategory = category || (type === 'package' ? 'packages' : '');
    if (resolvedCategory && settings.infantPrices[resolvedCategory]) {
      const ip = parseFloat(settings.infantPrices[resolvedCategory][tier]);
      if (!isNaN(ip)) infantPrice = ip;
    }
  }

  // Calculate total: first person pays basePrice, others pay additionalPersonPrice, children & infants extra
  const originalTotal = travelers <= 1
    ? basePrice + (childPrice * children) + (infantPrice * infants) + extrasTotal
    : basePrice + (additionalPersonPrice * (travelers - 1)) + (childPrice * children) + (infantPrice * infants) + extrasTotal;

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
      setPromoError(translate('promoErrorRequired') || 'Please enter a code first!');
      return;
    }

    try {
      const validation = await validatePromoCode(promoInput);
      if (!validation.isValid) {
        setPromoError(validation.reason);
        setPromoDetails(null);
      } else {
        setPromoDetails(validation);
        const valStr = validation.discountType === 'percentage'
          ? `${validation.discountValue}%`
          : `€${validation.discountValue}`;
        setPromoSuccess(`${translate('promoSuccess') || 'Discount code applied successfully!'} (${valStr})`);
      }
    } catch (err) {
      console.error('Error applying promo:', err);
      setPromoError(translate('promoError') || 'Error verifying discount code');
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
    // Generate electronic signature when proceeding to payment
    const signature = {
      name: customerName,
      email: email,
      phone: phone,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      bookingDetails: {
        tripId,
        title: titleAr || titleEn,
        date: bookingDate,
        travelers,
        totalAmount
      }
    };
    setElectronicSignature(signature);
    setSignatureTimestamp(new Date().toISOString());
    setCheckoutStep('payment');
  };

  // Handle Card Payment through Dafah
  const handleDafahPayment = () => {
    const baseDafahUrl = createDafahCheckoutSession({
      tripId,
      title: locale === 'ar' ? (titleAr || titleEn || 'Travel Excursion') : (titleEn || titleAr || 'Travel Excursion'),
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
    url.searchParams.set('agentName', promoDetails ? promoDetails.agentName || '' : translate('directAgent'));
    url.searchParams.set('city', searchParams.get('city') || 'شرم الشيخ');
    url.searchParams.set('email', email);
    url.searchParams.set('pickupLocation', pickupLocation);
    url.searchParams.set('extras', getSelectedExtrasString());
    url.searchParams.set('children', children.toString());
    url.searchParams.set('infants', infants.toString());
    url.searchParams.set('specialRequests', specialRequests);
    url.searchParams.set('customerLanguage', customerLanguage);
    
    router.push(url.pathname + url.search);
  };

  // Handle Card Payment through Paytabs
  const handlePaytabsPayment = async () => {
    setIsSimulatingPayment(true);
    const txId = `paytabs-tx-${Date.now()}`;
    
    try {
      // First create the booking
      await addBooking({
        id: `BK-${txId.replace('paytabs-tx-', '')}`,
        customer: customerName,
        email: email,
        phone: phone,
        whatsapp: whatsapp || phone,
        service: titleEn || titleAr || 'Travel Excursion',
        city: searchParams.get('city') || 'شرم الشيخ',
        agentId: promoDetails ? promoDetails.agentId || null : null,
        agentName: promoDetails ? promoDetails.agentName : translate('directAgent'),
        originalAmount: originalTotal,
        discountAmount: discountAmount,
        finalAmount: totalAmount,
        travelers: travelers,
        status: 'قيد الانتظار', // Pending until payment is confirmed
        promoCode: promoDetails ? promoDetails.code : '',
        paymentType: 'paytabs',
        txId: txId,
        pickupLocation: pickupLocation,
        extras: getSelectedExtrasString(),
        children: children,
        infants: infants,
        adultPrice: additionalPersonPrice || basePrice,
        childPrice: childPrice,
        infantPrice: infantPrice,
        specialRequests: specialRequests,
        customerLanguage: customerLanguage,
        electronicSignature: electronicSignature,
        signatureTimestamp: signatureTimestamp
      });

      // Create Paytabs payment
      const paymentResult = await createPaytabsPayment({
        amount: totalAmount,
        currency: 'EGP',
        customerName: customerName,
        customerEmail: email,
        customerPhone: phone,
        orderId: `BK-${txId.replace('paytabs-tx-', '')}`,
        productName: locale === 'ar' ? (titleAr || titleEn || 'Travel Excursion') : (titleEn || titleAr || 'Travel Excursion'),
        successUrl: `${window.location.origin}/booking-confirmation?status=success&paymentType=paytabs&tx=${txId}&tripId=${tripId}&price=${basePrice}&titleAr=${encodeURIComponent(titleAr)}&titleEn=${encodeURIComponent(titleEn)}&type=${type}&category=${category}&city=${searchParams.get('city')}`,
        cancelUrl: `${window.location.origin}/checkout?status=failed&tripId=${tripId}&price=${basePrice}&titleAr=${encodeURIComponent(titleAr)}&type=${type}`,
        callbackUrl: `${window.location.origin}/api/paytabs/callback`
      });

      setIsSimulatingPayment(false);

      if (paymentResult.success) {
        // Redirect to Paytabs payment page
        window.location.href = paymentResult.paymentUrl;
      } else {
        alert('Payment failed: ' + paymentResult.error);
      }
    } catch (err) {
      console.error('Error processing Paytabs payment:', err);
      setIsSimulatingPayment(false);
      alert('An error occurred while processing payment');
    }
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
          agentName: promoDetails ? promoDetails.agentName : translate('directAgent'),
          originalAmount: originalTotal,
          discountAmount: discountAmount,
          finalAmount: totalAmount,
          travelers: travelers,
          date: bookingDate,
          status: 'مؤكد',
          promoCode: promoDetails ? promoDetails.code : '',
          paymentType: walletName,
          txId: txId,
          pickupLocation: pickupLocation,
          extras: getSelectedExtrasString(),
          extrasDetails: getSelectedExtrasList(),
          children: children,
          infants: infants,
          adultPrice: additionalPersonPrice || basePrice,
          childPrice: childPrice,
          infantPrice: infantPrice,
          specialRequests: specialRequests,
          customerLanguage: customerLanguage,
          electronicSignature: electronicSignature,
          signatureTimestamp: signatureTimestamp
        });

        // Send invoice email (non-blocking)
        sendBookingEmail({
          customerName, email, phone, whatsapp: whatsapp || phone,
          date: bookingDate, travelers,
          serviceName: titleEn || titleAr || 'Travel Excursion',
          originalAmount: originalTotal, discountAmount, finalAmount: totalAmount,
          paymentType: walletName, txId,
          extras: getSelectedExtrasString(),
          extrasDetails: getSelectedExtrasList(),
          pickupLocation,
          promoCode: promoDetails?.code || '',
          agentName: promoDetails?.agentName || translate('directAgent'),
          children, infants, specialRequests,
          electronicSignature, signatureTimestamp, city: searchParams.get('city') || 'شرم الشيخ',
          adultPrice: additionalPersonPrice || basePrice,
          childPrice: childPrice,
          infantPrice: infantPrice
        });
        
        setIsSimulatingPayment(false);
        const successUrl = `/checkout?status=success&tx=${txId}&tripId=${tripId}&amount=${totalAmount}&originalAmount=${originalTotal}&discountAmount=${discountAmount}&promoCode=${promoDetails ? promoDetails.code : ''}&agentId=${promoDetails ? promoDetails.agentId || '' : ''}&agentName=${encodeURIComponent(promoDetails ? promoDetails.agentName : 'مباشر (بدون وكيل)')}&customerName=${encodeURIComponent(customerName)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&whatsapp=${encodeURIComponent(whatsapp || phone)}&date=${encodeURIComponent(bookingDate)}&travelers=${travelers}&children=${children}&infants=${infants}&basePrice=${basePrice}&additionalPersonPrice=${additionalPersonPrice}&childPrice=${childPrice}&infantPrice=${infantPrice}&title=${encodeURIComponent(titleEn || titleAr)}&paymentType=${walletName}&pickupLocation=${encodeURIComponent(pickupLocation)}&extras=${encodeURIComponent(getSelectedExtrasString())}&extrasList=${encodeURIComponent(JSON.stringify(getSelectedExtrasList()))}&specialRequests=${encodeURIComponent(specialRequests)}`;
        router.push(successUrl);
      } catch (err) {
        console.error(`Error saving booking on ${walletName} payment:`, err);
        setIsSimulatingPayment(false);
      }
    }, 2000);
  };

  // Handle Receipt File Selection
  const handleReceiptFileChange = (e) => {
    const file = e.target.files?.[0];
    setReceiptError('');
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setReceiptError(locale === 'ar' ? 'يرجى اختيار صورة صالحة (JPG, PNG, WEBP) أو ملف PDF' : 'Please select a valid image (JPG, PNG, WEBP) or PDF');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setReceiptError(locale === 'ar' ? 'حجم الملف كبير جداً، الحد الأقصى 8 ميجابايت' : 'File is too large, maximum allowed size is 8MB');
      return;
    }

    setReceiptFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setReceiptPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview('pdf');
    }
  };

  // Real Direct Bank Transfer with Receipt Upload
  const handleBankTransferPayment = async () => {
    setIsUploadingReceipt(true);
    setReceiptError('');
    const bookingId = `BK-${Date.now().toString().slice(-6)}`;
    const txId = `bank-tx-${Date.now()}`;

    // 1. Get Selected Bank Object
    const activeBanks = (settings?.bankAccounts || []).filter(b => b.isActive !== false);
    const selectedBank = activeBanks.find(b => b.id === selectedBankId) || activeBanks[0] || {
      bankName: 'CIB Bank',
      iban: 'EG38001000450000100045892147',
      currency: 'EUR'
    };

    let receiptUrl = '';

    // 2. Upload Receipt File if provided
    if (receiptFile) {
      try {
        const formData = new FormData();
        formData.append('file', receiptFile);
        formData.append('bookingId', bookingId);

        const uploadRes = await fetch('/api/upload-receipt', {
          method: 'POST',
          body: formData
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          receiptUrl = uploadData.url || '';
        } else {
          console.warn('Receipt upload returned error, proceeding with booking registration');
        }
      } catch (uploadErr) {
        console.warn('Receipt upload failed, booking will still be registered:', uploadErr);
      }
    }

    try {
      // 3. Save Booking in Firestore with Bank Payment Details
      await addBooking({
        id: bookingId,
        customer: customerName,
        email: email,
        phone: phone,
        whatsapp: whatsapp || phone,
        service: titleEn || titleAr || 'Travel Excursion',
        city: searchParams.get('city') || 'شرم الشيخ',
        agentId: promoDetails ? promoDetails.agentId || null : null,
        agentName: promoDetails ? promoDetails.agentName : translate('directAgent'),
        originalAmount: originalTotal,
        discountAmount: discountAmount,
        finalAmount: totalAmount,
        travelers: travelers,
        date: bookingDate,
        status: 'في انتظار تأكيد الدفع', // Custom bank gateway status
        promoCode: promoDetails ? promoDetails.code : '',
        paymentType: 'bank_transfer',
        txId: txId,
        bookingRefCode: bookingRefCode,
        receiptUrl: receiptUrl,
        receiptTxRef: clientTransferRef || '',
        receiptBankName: selectedBank.bankName || '',
        receiptBankAccountId: selectedBank.id || '',
        receiptUploadedAt: receiptUrl ? new Date().toISOString() : null,
        pickupLocation: pickupLocation,
        extras: getSelectedExtrasString(),
        extrasDetails: getSelectedExtrasList(),
        children: children,
        infants: infants,
        adultPrice: additionalPersonPrice || basePrice,
        childPrice: childPrice,
        infantPrice: infantPrice,
        specialRequests: specialRequests,
        customerLanguage: customerLanguage,
        electronicSignature: electronicSignature,
        signatureTimestamp: signatureTimestamp
      });

      // 4. Send Email Notification (non-blocking)
      sendBookingEmail({
        customerName, email, phone, whatsapp: whatsapp || phone,
        date: bookingDate, travelers,
        serviceName: titleEn || titleAr || 'Travel Excursion',
        originalAmount: originalTotal, discountAmount, finalAmount: totalAmount,
        paymentType: 'bank_transfer', txId,
        extras: getSelectedExtrasString(),
        extrasDetails: getSelectedExtrasList(),
        pickupLocation,
        promoCode: promoDetails?.code || '',
        agentName: promoDetails?.agentName || translate('directAgent'),
        children, infants, specialRequests,
        electronicSignature, signatureTimestamp, city: searchParams.get('city') || 'شرم الشيخ',
        adultPrice: additionalPersonPrice || basePrice,
        childPrice: childPrice,
        infantPrice: infantPrice,
        extrasDetails: getSelectedExtrasList()
      });

      setIsUploadingReceipt(false);
      const successUrl = `/checkout?status=success&tx=${txId}&bookingId=${bookingId}&tripId=${tripId}&amount=${totalAmount}&originalAmount=${originalTotal}&discountAmount=${discountAmount}&promoCode=${promoDetails ? promoDetails.code : ''}&agentId=${promoDetails ? promoDetails.agentId || '' : ''}&agentName=${encodeURIComponent(promoDetails ? promoDetails.agentName : translate('directAgent'))}&customerName=${encodeURIComponent(customerName)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&whatsapp=${encodeURIComponent(whatsapp || phone)}&date=${encodeURIComponent(bookingDate)}&travelers=${travelers}&children=${children}&infants=${infants}&basePrice=${basePrice}&additionalPersonPrice=${additionalPersonPrice}&childPrice=${childPrice}&infantPrice=${infantPrice}&title=${encodeURIComponent(titleEn || titleAr)}&paymentType=bank_transfer&pickupLocation=${encodeURIComponent(pickupLocation)}&extras=${encodeURIComponent(getSelectedExtrasString())}&extrasList=${encodeURIComponent(JSON.stringify(getSelectedExtrasList()))}&specialRequests=${encodeURIComponent(specialRequests)}&receiptUrl=${encodeURIComponent(receiptUrl)}&bankName=${encodeURIComponent(selectedBank.bankName || '')}&refCode=${encodeURIComponent(bookingRefCode)}`;
      router.push(successUrl);
    } catch (err) {
      console.error('Error saving bank transfer booking:', err);
      setIsUploadingReceipt(false);
      setReceiptError(locale === 'ar' ? 'حدث خطأ أثناء حفظ الحجز. يرجى المحاولة مرة أخرى.' : 'Error saving booking. Please try again.');
    }
  };

  // Direct PayPal Transfer with Receipt Upload
  const handlePayPalDirectPayment = async () => {
    setIsUploadingReceipt(true);
    setReceiptError('');
    const bookingId = `BK-${Date.now().toString().slice(-6)}`;
    const txId = `paypal-tx-${Date.now()}`;

    let receiptUrl = '';

    if (receiptFile) {
      try {
        const formData = new FormData();
        formData.append('file', receiptFile);
        formData.append('bookingId', bookingId);

        const uploadRes = await fetch('/api/upload-receipt', {
          method: 'POST',
          body: formData
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          receiptUrl = uploadData.url || '';
        }
      } catch (uploadErr) {
        console.warn('PayPal receipt upload error:', uploadErr);
      }
    }

    try {
      await addBooking({
        id: bookingId,
        customer: customerName,
        email: email,
        phone: phone,
        whatsapp: whatsapp || phone,
        service: titleEn || titleAr || 'Travel Excursion',
        city: searchParams.get('city') || 'شرم الشيخ',
        agentId: promoDetails ? promoDetails.agentId || null : null,
        agentName: promoDetails ? promoDetails.agentName : translate('directAgent'),
        originalAmount: originalTotal,
        discountAmount: discountAmount,
        finalAmount: totalAmount,
        travelers: travelers,
        date: bookingDate,
        status: 'في انتظار تأكيد الدفع',
        promoCode: promoDetails ? promoDetails.code : '',
        paymentType: 'paypal',
        txId: txId,
        bookingRefCode: bookingRefCode,
        receiptUrl: receiptUrl,
        receiptTxRef: clientTransferRef || '',
        receiptBankName: 'PayPal (' + (settings?.paypalEmail || 'info@orluxus.com') + ')',
        receiptUploadedAt: receiptUrl ? new Date().toISOString() : null,
        pickupLocation: pickupLocation,
        extras: getSelectedExtrasString(),
        extrasDetails: getSelectedExtrasList(),
        children: children,
        infants: infants,
        adultPrice: additionalPersonPrice || basePrice,
        childPrice: childPrice,
        infantPrice: infantPrice,
        specialRequests: specialRequests,
        customerLanguage: customerLanguage,
        electronicSignature: electronicSignature,
        signatureTimestamp: signatureTimestamp
      });

      sendBookingEmail({
        customerName, email, phone, whatsapp: whatsapp || phone,
        date: bookingDate, travelers,
        serviceName: titleEn || titleAr || 'Travel Excursion',
        originalAmount: originalTotal, discountAmount, finalAmount: totalAmount,
        paymentType: 'paypal', txId,
        extras: getSelectedExtrasString(),
        extrasDetails: getSelectedExtrasList(),
        pickupLocation,
        promoCode: promoDetails?.code || '',
        agentName: promoDetails?.agentName || translate('directAgent'),
        children, infants, specialRequests,
        electronicSignature, signatureTimestamp, city: searchParams.get('city') || 'شرم الشيخ',
        adultPrice: additionalPersonPrice || basePrice,
        childPrice: childPrice,
        infantPrice: infantPrice,
        extrasDetails: getSelectedExtrasList()
      });

      setIsUploadingReceipt(false);
      const successUrl = `/checkout?status=success&tx=${txId}&bookingId=${bookingId}&tripId=${tripId}&amount=${totalAmount}&originalAmount=${originalTotal}&discountAmount=${discountAmount}&promoCode=${promoDetails ? promoDetails.code : ''}&agentId=${promoDetails ? promoDetails.agentId || '' : ''}&agentName=${encodeURIComponent(promoDetails ? promoDetails.agentName : translate('directAgent'))}&customerName=${encodeURIComponent(customerName)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&whatsapp=${encodeURIComponent(whatsapp || phone)}&date=${encodeURIComponent(bookingDate)}&travelers=${travelers}&children=${children}&infants=${infants}&basePrice=${basePrice}&additionalPersonPrice=${additionalPersonPrice}&childPrice=${childPrice}&infantPrice=${infantPrice}&title=${encodeURIComponent(titleEn || titleAr)}&paymentType=paypal&pickupLocation=${encodeURIComponent(pickupLocation)}&extras=${encodeURIComponent(getSelectedExtrasString())}&extrasList=${encodeURIComponent(JSON.stringify(getSelectedExtrasList()))}&specialRequests=${encodeURIComponent(specialRequests)}&receiptUrl=${encodeURIComponent(receiptUrl)}&bankName=${encodeURIComponent('PayPal')}&refCode=${encodeURIComponent(bookingRefCode)}`;
      router.push(successUrl);
    } catch (err) {
      console.error('Error saving paypal booking:', err);
      setIsUploadingReceipt(false);
      setReceiptError(locale === 'ar' ? 'حدث خطأ أثناء حفظ الحجز. يرجى المحاولة مرة أخرى.' : 'Error saving booking. Please try again.');
    }
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
        agentName: promoDetails ? promoDetails.agentName : translate('directAgent'),
        originalAmount: originalTotal,
        discountAmount: discountAmount,
        finalAmount: totalAmount,
        travelers: travelers,
        date: bookingDate,
        status: 'قيد الانتظار', // Cash payment starts as pending until confirmed on arrival
        promoCode: promoDetails ? promoDetails.code : '',
        paymentType: 'cash',
        txId: txId,
        pickupLocation: pickupLocation,
        extras: getSelectedExtrasString(),
        extrasDetails: getSelectedExtrasList(),
        children: children,
        infants: infants,
        adultPrice: additionalPersonPrice || basePrice,
        childPrice: childPrice,
        infantPrice: infantPrice,
        specialRequests: specialRequests,
        customerLanguage: customerLanguage,
        electronicSignature: electronicSignature,
        signatureTimestamp: signatureTimestamp
      });

      // Send invoice email (non-blocking)
      sendBookingEmail({
        customerName, email, phone, whatsapp: whatsapp || phone,
        date: bookingDate, travelers,
        serviceName: titleEn || titleAr || 'Travel Excursion',
        originalAmount: originalTotal, discountAmount, finalAmount: totalAmount,
        paymentType: 'onsite', txId,
        extras: getSelectedExtrasString(),
        extrasDetails: getSelectedExtrasList(),
        pickupLocation,
        promoCode: promoDetails?.code || '',
        agentName: promoDetails?.agentName || translate('directAgent'),
        children, infants, specialRequests,
        electronicSignature, signatureTimestamp, city: searchParams.get('city') || 'شرم الشيخ',
        adultPrice: additionalPersonPrice || basePrice,
        childPrice: childPrice,
        infantPrice: infantPrice
      });
    } catch (err) {
      console.error('Error saving booking on cash payment:', err);
    }

    const successUrl = `/checkout?status=success&tx=${txId}&tripId=${tripId}&amount=${totalAmount}&originalAmount=${originalTotal}&discountAmount=${discountAmount}&promoCode=${promoDetails ? promoDetails.code : ''}&agentId=${promoDetails ? promoDetails.agentId || '' : ''}&agentName=${encodeURIComponent(promoDetails ? promoDetails.agentName : translate('directAgent'))}&customerName=${encodeURIComponent(customerName)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&whatsapp=${encodeURIComponent(whatsapp || phone)}&date=${encodeURIComponent(bookingDate)}&travelers=${travelers}&children=${children}&infants=${infants}&basePrice=${basePrice}&additionalPersonPrice=${additionalPersonPrice}&childPrice=${childPrice}&infantPrice=${infantPrice}&title=${encodeURIComponent(titleEn || titleAr)}&paymentType=onsite&pickupLocation=${encodeURIComponent(pickupLocation)}&extras=${encodeURIComponent(getSelectedExtrasString())}&extrasList=${encodeURIComponent(JSON.stringify(getSelectedExtrasList()))}&specialRequests=${encodeURIComponent(specialRequests)}`;
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
              agentName: promoDetails ? promoDetails.agentName : translate('directAgent'),
              originalAmount: originalTotal,
              discountAmount: discountAmount,
              finalAmount: totalAmount,
              travelers: travelers,
              date: bookingDate,
              status: 'مؤكد',
              promoCode: promoDetails ? promoDetails.code : '',
              paymentType: 'paypal',
              txId: txId,
              pickupLocation: pickupLocation,
              extras: getSelectedExtrasString(),
              extrasDetails: getSelectedExtrasList(),
              children: children,
              infants: infants,
              adultPrice: additionalPersonPrice || basePrice,
              childPrice: childPrice,
              infantPrice: infantPrice,
              specialRequests: specialRequests,
              customerLanguage: customerLanguage,
              electronicSignature: electronicSignature,
              signatureTimestamp: signatureTimestamp
            });

            // Send invoice email (non-blocking)
            sendBookingEmail({
              customerName, email, phone, whatsapp: whatsapp || phone,
              date: bookingDate, travelers,
              serviceName: titleEn || titleAr || 'Travel Excursion',
              originalAmount: originalTotal, discountAmount, finalAmount: totalAmount,
              paymentType: 'paypal', txId,
              extras: getSelectedExtrasString(),
              extrasDetails: getSelectedExtrasList(),
              pickupLocation,
              promoCode: promoDetails?.code || '',
              agentName: promoDetails?.agentName || translate('directAgent'),
              children, infants, specialRequests,
              electronicSignature, signatureTimestamp, city: searchParams.get('city') || 'شرم الشيخ',
              adultPrice: additionalPersonPrice || basePrice,
              childPrice: childPrice,
              infantPrice: infantPrice
            });
          } catch (err) {
            console.error('Error saving booking on PayPal approval:', err);
          }

          const successUrl = `/checkout?status=success&tx=${txId}&tripId=${tripId}&amount=${totalAmount}&originalAmount=${originalTotal}&discountAmount=${discountAmount}&promoCode=${promoDetails ? promoDetails.code : ''}&agentId=${promoDetails ? promoDetails.agentId || '' : ''}&agentName=${encodeURIComponent(promoDetails ? promoDetails.agentName : translate('directAgent'))}&customerName=${encodeURIComponent(customerName)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&whatsapp=${encodeURIComponent(whatsapp || phone)}&date=${encodeURIComponent(bookingDate)}&travelers=${travelers}&children=${children}&infants=${infants}&basePrice=${basePrice}&additionalPersonPrice=${additionalPersonPrice}&childPrice=${childPrice}&infantPrice=${infantPrice}&title=${encodeURIComponent(titleEn || titleAr)}&paymentType=paypal&pickupLocation=${encodeURIComponent(pickupLocation)}&extras=${encodeURIComponent(getSelectedExtrasString())}&extrasList=${encodeURIComponent(JSON.stringify(getSelectedExtrasList()))}&specialRequests=${encodeURIComponent(specialRequests)}`;
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
  const receiptUrlParam = searchParams.get('receiptUrl') || '';
  const refCodeParam = searchParams.get('refCode') || '';
  const bankNameParam = searchParams.get('bankName') || '';
  const bookingIdParam = searchParams.get('bookingId') || txParam || '';
  const extrasListRaw = searchParams.get('extrasList') || '';
  let extrasListParam = null;
  if (extrasListRaw) {
    try { extrasListParam = JSON.parse(extrasListRaw); } catch (_) {}
  }
  const specialRequestsParam = searchParams.get('specialRequests') || '';
  const childrenParam = parseInt(searchParams.get('children') || '0', 10);
  const infantsParam = parseInt(searchParams.get('infants') || '0', 10);
  const basePriceParam = parseFloat(searchParams.get('basePrice') || '0');
  const additionalPersonPriceParam = parseFloat(searchParams.get('additionalPersonPrice') || '0');
  const childPriceParam = parseFloat(searchParams.get('childPrice') || '0');
  const infantPriceParam = parseFloat(searchParams.get('infantPrice') || '0');

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
              background: isBank ? 'rgba(212,175,55,0.1)' : 'rgba(16, 185, 129, 0.1)',
              border: `2px solid ${isBank ? 'var(--gold-500)' : 'var(--emerald-500)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              margin: '0 auto 1.5rem auto',
              color: isBank ? 'var(--gold-400)' : 'var(--emerald-500)'
            }}>
              {isBank ? '⏳' : '✓'}
            </div>

            <h1 className="section-title" style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '2rem' }}>
              {isBank 
                ? (locale === 'ar' ? 'تم تسجيل طلب الحجز بنجاح!' : 'Booking Request Registered Successfully!') 
                : (isOnsite ? (locale === 'ar' ? 'تم تسجيل الحجز بنجاح!' : 'Booking Registered Successfully!') : (locale === 'ar' ? 'تم تأكيد الدفع بنجاح!' : 'Payment Confirmed Successfully!'))
              }
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              {isBank 
                ? (locale === 'ar' ? 'تم استلام بيانات طلبك وإيصال التحويل، والحجز قيد المراجعة والتأكيد الفوري من قِبل فريق العمل.' : 'Your booking request and payment transfer details were received and are currently under fast verification by our team.')
                : (isOnsite 
                  ? (locale === 'ar' ? 'تم استلام طلبك. الدفع نقداً عند انطلاق الرحلة!' : 'We received your order. You will pay cash when the tour starts!') 
                  : (locale === 'ar' ? 'تم تسجيل حجزك وتأكيد الدفع وإصدار الفاتورة.' : 'We are delighted to register your booking. Payment is confirmed and invoice has been issued.'))
              }
            </p>

            {isBank && (
              <div style={{ marginTop: '1.2rem', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,0.15)', border: '1px solid var(--gold-500)', padding: '6px 16px', borderRadius: '20px', color: 'var(--gold-400)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                <span>⏳</span>
                <span>{locale === 'ar' ? 'حالة الحجز: في انتظار تأكيد الدفع' : 'Booking Status: Pending Payment Verification'}</span>
              </div>
            )}
          </div>

          {/* BANK TRANSFER DETAILS BLOCK */}
          {isBank && (
            <div className="glass-card animate-fade-in-up" style={{
              background: 'rgba(251, 191, 36, 0.05)',
              border: '1px solid var(--gold-400)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              marginBottom: '2rem',
              textAlign: locale === 'ar' ? 'right' : 'left'
            }}>
              <h3 style={{ color: 'var(--gold-400)', margin: '0 0 0.8rem 0', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏦</span>
                <span>{locale === 'ar' ? 'تفاصيل التحويل البنكي للحجز' : 'Bank Transfer Booking Details'}</span>
              </h3>
              
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                padding: '1.2rem',
                fontSize: '0.9rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.7rem',
                marginBottom: '1.2rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>{locale === 'ar' ? 'رقم مرجع الحجز:' : 'Booking Reference:'}</span>
                  <span style={{ fontWeight: 'bold', color: '#93c5fd', fontFamily: 'var(--font-en)' }}>{refCodeParam || bookingIdParam}</span>
                </div>
                {bankNameParam && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>{locale === 'ar' ? 'الحساب البنكي المختار:' : 'Selected Bank:'}</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{bankNameParam}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>{locale === 'ar' ? 'إجمالي المبلغ المطلوب:' : 'Total Amount:'}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--gold-400)', fontFamily: 'var(--font-en)' }}>€{amountParam.toFixed(2)}</span>
                </div>
                {receiptUrlParam && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.2rem' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ {locale === 'ar' ? 'تم إرفاق إيصال التحويل' : 'Receipt Uploaded'}</span>
                    <a
                      href={receiptUrlParam}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--gold-400)', textDecoration: 'underline', fontSize: '0.85rem' }}
                    >
                      {locale === 'ar' ? '👁️ عرض الإيصال المرفق' : '👁️ View Attached Receipt'}
                    </a>
                  </div>
                )}
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <a 
                  href={`https://wa.me/${(settings?.whatsapp || '201038820019').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(locale === 'ar' ? `مرحباً، قمت بعمل حجز تحويل بنكي برقم مرجع ${refCodeParam || bookingIdParam} بقيمة €${amountParam.toFixed(2)} لرحلة ${titleParam}. أرجو تأكيد الاستلام.` : `Hello, I placed a direct bank transfer booking #${refCodeParam || bookingIdParam} (€${amountParam.toFixed(2)}) for ${titleParam}. Please confirm receipt.`)}`}
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
                    padding: '10px 22px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    textDecoration: 'none'
                  }}
                >
                  <span>💬</span>
                  <span>{locale === 'ar' ? 'متابعة الحجز مباشرة عبر واتساب' : 'Contact Support on WhatsApp'}</span>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f1f5f9', paddingBottom: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#b45309', margin: 0, letterSpacing: '2px', fontFamily: 'var(--font-en)' }}>ORLUXUS</h2>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', fontWeight: 'bold' }}>ORLUXUS MARKETING TOURISM AGENCY</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Booking Confirmation</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontFamily: 'var(--font-en)' }}>
                  #{txParam.replace('pp-tx-', '').replace('cash-tx-', '').replace('dafah-tx-', '').replace('bank-tx-', '').replace('apple_pay-tx-', '').replace('google_pay-tx-', '').slice(0, 8).toUpperCase()}
                </span>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                  {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>


            {/* Customer & Date Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2.5rem', textAlign: 'left' }}>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Traveler Details</h4>
                <p style={{ margin: '0 0 0.3rem 0', fontWeight: 'bold', fontSize: '1.05rem' }}>{nameParam}</p>
                {emailParam && <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: '#475569' }}>✉ {emailParam}</p>}
                <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: '#475569' }}>📞 {phoneParam}</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>💬 {whatsappParam}</p>
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>
                  {locale === 'ar' ? 'معلومات الحجز' : locale === 'fr' ? 'Infos de réservation' : locale === 'de' ? 'Buchungsinfo' : locale === 'es' ? 'Info de reserva' : locale === 'it' ? 'Info prenotazione' : locale === 'ru' ? 'Информация о бронировании' : locale === 'zh' ? '预订信息' : locale === 'ja' ? '予約情報' : locale === 'tr' ? 'Rezervasyon Bilgisi' : 'Booking Info'}
                </h4>
                {/* Booking Info */}
                <p style={{ margin: '0 0 0.3rem 0', fontWeight: 'bold' }}>
                  {locale === 'ar' ? 'تاريخ الرحلة' : locale === 'fr' ? 'Date prévue' : locale === 'de' ? 'Geplantes Datum' : locale === 'es' ? 'Fecha programada' : 'Scheduled Date'}: {dateParam}
                </p>
                <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: '#475569' }}>
                  👥 {locale === 'ar' ? 'عدد المسافرين' : 'Travelers'}: {(travelersParam + childrenParam + infantsParam)} {locale === 'ar' ? 'أشخاص' : 'Persons'}
                  {(childrenParam > 0 || infantsParam > 0) && (
                    <span> ({travelersParam} {locale === 'ar' ? 'كبار' : 'Adults'}{childrenParam > 0 ? ` | ${childrenParam} ${locale === 'ar' ? 'أطفال' : 'Children'}` : ''}{infantsParam > 0 ? ` | ${infantsParam} ${locale === 'ar' ? 'رضع' : 'Infants'}` : ''})</span>
                  )}
                </p>
                {pickupParam && <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: '#475569' }}>📍 {locale === 'ar' ? 'نقطة الالتقاط' : 'Pickup'}: {pickupParam}</p>}
                <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: (isBank || isOnsite) ? '#f59e0b' : '#10b981', fontWeight: 'bold' }}>
                  {locale === 'ar' ? 'طريقة الدفع' : 'Gateway'}: {isBank ? (locale === 'ar' ? 'تحويل بنكي' : 'Bank Transfer') : (isOnsite ? (locale === 'ar' ? 'دفع عند الوصول' : 'Cash on Site') : (paymentTypeParam === 'card' ? 'Dafah Credit Card' : paymentTypeParam.toUpperCase()))}
                </p>
                {promoParam && <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>🤝 {locale === 'ar' ? 'كود الوكيل' : 'Agent Code'}: <strong style={{ color: '#0f172a' }}>{promoParam.toUpperCase()}</strong></p>}
              </div>
            </div>

            {specialRequestsParam && (
              <div style={{
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: '8px',
                padding: '1rem 1.2rem',
                marginBottom: '2.5rem',
                textAlign: locale === 'ar' ? 'right' : 'left'
              }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: '#c2410c', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                  💬 {locale === 'ar' ? 'الطلبات الخاصة والتعليقات' : locale === 'de' ? 'Besondere Wünsche / Kommentare' : 'Special Requests / Comments'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.92rem', color: '#1e293b', fontWeight: '500', lineHeight: '1.5' }}>{specialRequestsParam}</p>
              </div>
            )}

            {/* Invoice Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2.5rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem', textAlign: locale === 'ar' ? 'right' : 'left', fontWeight: 'bold', fontSize: '0.9rem', color: '#475569' }}>
                    {locale === 'ar' ? 'الخدمة' : locale === 'fr' ? 'Description' : locale === 'de' ? 'Leistung' : locale === 'es' ? 'Servicio' : locale === 'ru' ? 'Услуга' : locale === 'zh' ? '服务' : locale === 'ja' ? 'サービス' : locale === 'tr' ? 'Hizmet' : 'Service Description'}
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', color: '#475569' }}>
                    {locale === 'ar' ? 'الكمية' : locale === 'fr' ? 'Qté' : locale === 'de' ? 'Menge' : locale === 'es' ? 'Cant.' : locale === 'ru' ? 'Кол-во' : locale === 'zh' ? '数量' : locale === 'ja' ? '数量' : locale === 'tr' ? 'Adet' : 'Qty'}
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', fontSize: '0.9rem', color: '#475569' }}>
                    {locale === 'ar' ? 'السعر' : locale === 'fr' ? 'Tarif' : locale === 'de' ? 'Preis' : locale === 'es' ? 'Tarifa' : locale === 'ru' ? 'Цена' : locale === 'zh' ? '单价' : locale === 'ja' ? '単価' : locale === 'tr' ? 'Ücret' : 'Rate'}
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', fontSize: '0.9rem', color: '#475569' }}>
                    {locale === 'ar' ? 'الإجمالي' : locale === 'fr' ? 'Total' : locale === 'de' ? 'Gesamt' : locale === 'es' ? 'Total' : locale === 'ru' ? 'Итого' : locale === 'zh' ? '总计' : locale === 'ja' ? '合計' : locale === 'tr' ? 'Toplam' : 'Total'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Base price for first adult */}
                {(() => {
                  const childrenRowTotal = (childPriceParam > 0 ? childPriceParam : 0) * childrenParam;
                  const infantsRowTotal = (infantPriceParam > 0 ? infantPriceParam : 0) * infantsParam;
                  
                  const calculatedAdultsTotal = basePriceParam > 0 
                    ? (basePriceParam + additionalPersonPriceParam * Math.max(travelersParam - 1, 0))
                    : (travelersParam > 0 ? (originalParam - childrenRowTotal - infantsRowTotal) : originalParam);

                  // If extras exist, extrasCost is whatever remains in originalParam
                  const extrasCost = extrasParam 
                    ? Math.max(0, originalParam - (basePriceParam > 0 ? calculatedAdultsTotal : (calculatedAdultsTotal > 0 ? calculatedAdultsTotal : 0)) - childrenRowTotal - infantsRowTotal)
                    : 0;

                  const finalAdultsTotal = extrasCost > 0 && basePriceParam <= 0 
                    ? Math.max(0, calculatedAdultsTotal - extrasCost)
                    : calculatedAdultsTotal;

                  const perAdultRate = travelersParam > 0 ? (finalAdultsTotal / travelersParam) : finalAdultsTotal;

                  return (
                    <>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.9rem 1rem', fontSize: '0.95rem', fontWeight: '600', textAlign: locale === 'ar' ? 'right' : 'left' }}>
                          {titleParam || 'Egypt Travel Package'} {locale === 'ar' ? '(كبار)' : '(Adults)'} × {travelersParam}
                        </td>
                        <td style={{ padding: '0.9rem 1rem', textAlign: 'center', fontFamily: 'var(--font-en)' }}>{travelersParam}</td>
                        <td style={{ padding: '0.9rem 1rem', textAlign: 'right', fontFamily: 'var(--font-en)' }}>€{basePriceParam > 0 ? (travelersParam === 1 ? basePriceParam.toFixed(2) : `${basePriceParam.toFixed(2)} + ${additionalPersonPriceParam.toFixed(2)}×${travelersParam-1}`) : perAdultRate.toFixed(2)}</td>
                        <td style={{ padding: '0.9rem 1rem', textAlign: 'right', fontFamily: 'var(--font-en)', fontWeight: 'bold' }}>
                          €{finalAdultsTotal.toFixed(2)}
                        </td>
                      </tr>
                      {/* Children row */}
                      {childrenParam > 0 && (
                        <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8f9fa' }}>
                          <td style={{ padding: '0.9rem 1rem', fontSize: '0.95rem', fontWeight: '600', textAlign: locale === 'ar' ? 'right' : 'left' }}>
                            {locale === 'ar' ? 'أطفال (2-12 سنة)' : 'Children (2-12 years)'}
                          </td>
                          <td style={{ padding: '0.9rem 1rem', textAlign: 'center', fontFamily: 'var(--font-en)' }}>{childrenParam}</td>
                          <td style={{ padding: '0.9rem 1rem', textAlign: 'right', fontFamily: 'var(--font-en)' }}>€{childPriceParam.toFixed(2)}</td>
                          <td style={{ padding: '0.9rem 1rem', textAlign: 'right', fontFamily: 'var(--font-en)', fontWeight: 'bold' }}>€{childrenRowTotal.toFixed(2)}</td>
                        </tr>
                      )}
                      {/* Infants row */}
                      {infantsParam > 0 && (
                        <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8f9fa' }}>
                          <td style={{ padding: '0.9rem 1rem', fontSize: '0.95rem', fontWeight: '600', textAlign: locale === 'ar' ? 'right' : 'left' }}>
                            {locale === 'ar' ? 'رضع (أقل من سنتين)' : 'Infants (under 2 years)'}
                          </td>
                          <td style={{ padding: '0.9rem 1rem', textAlign: 'center', fontFamily: 'var(--font-en)' }}>{infantsParam}</td>
                          <td style={{ padding: '0.9rem 1rem', textAlign: 'right', fontFamily: 'var(--font-en)' }}>€{infantPriceParam.toFixed(2)}</td>
                          <td style={{ padding: '0.9rem 1rem', textAlign: 'right', fontFamily: 'var(--font-en)', fontWeight: 'bold' }}>€{infantsRowTotal.toFixed(2)}</td>
                        </tr>
                      )}
                      {/* Extras / Add-ons itemized rows */}
                      {extrasListParam && Array.isArray(extrasListParam) && extrasListParam.length > 0 ? (
                        extrasListParam.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafb' }}>
                            <td style={{ padding: '0.8rem 1rem', fontSize: '0.9rem', color: '#1e293b', fontWeight: '600', textAlign: locale === 'ar' ? 'right' : 'left' }}>
                              🎁 {locale === 'ar' ? (item.nameAr || item.name) : locale === 'de' ? (item.nameDe || item.nameEn || item.name) : (item.nameEn || item.name)}
                            </td>
                            <td style={{ padding: '0.8rem 1rem', textAlign: 'center', fontFamily: 'var(--font-en)' }}>{item.qty || 1}</td>
                            <td style={{ padding: '0.8rem 1rem', textAlign: 'right', fontFamily: 'var(--font-en)' }}>
                              €{Number(item.rate || item.total || 0).toFixed(2)}
                            </td>
                            <td style={{ padding: '0.8rem 1rem', textAlign: 'right', fontFamily: 'var(--font-en)', color: '#1e293b', fontWeight: 'bold' }}>
                              €{Number(item.total || item.rate || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (extrasParam ? (
                        <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafb' }}>
                          <td style={{ padding: '0.8rem 1rem', fontSize: '0.9rem', color: '#1e293b', fontWeight: '600', textAlign: locale === 'ar' ? 'right' : 'left' }}>
                            🎁 {tGlobal('checkout.extrasLabel')}: {extrasParam}
                          </td>
                          <td style={{ padding: '0.8rem 1rem', textAlign: 'center', fontFamily: 'var(--font-en)' }}>1</td>
                          <td style={{ padding: '0.8rem 1rem', textAlign: 'right', fontFamily: 'var(--font-en)' }}>
                            {extrasCost > 0 ? `€${extrasCost.toFixed(2)}` : '-'}
                          </td>
                          <td style={{ padding: '0.8rem 1rem', textAlign: 'right', fontFamily: 'var(--font-en)', color: '#1e293b', fontWeight: 'bold' }}>
                            {extrasCost > 0 ? `€${extrasCost.toFixed(2)}` : tGlobal('checkout.extrasIncluded')}
                          </td>
                        </tr>
                      ) : null)}
                    </>
                  );
                })()}
                {discountParam > 0 && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fef2f2' }}>
                    <td style={{ padding: '0.8rem 1rem', fontSize: '0.9rem', color: '#dc2626', textAlign: locale === 'ar' ? 'right' : 'left', fontWeight: 'bold' }}>
                      {tGlobal('checkout.promoDiscount', { code: promoParam })}
                    </td>
                    <td style={{ padding: '0.8rem 1rem', textAlign: 'center' }}>-</td>
                    <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>-</td>
                    <td style={{ padding: '0.8rem 1rem', textAlign: 'right', fontFamily: 'var(--font-en)', color: '#dc2626', fontWeight: 'bold' }}>
                      -€{discountParam.toFixed(2)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Total Block */}
            <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ textAlign: locale === 'ar' ? 'right' : 'left' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>
                  {tGlobal('checkout.paymentStatus')}
                </span>
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
                  {isBank 
                    ? tGlobal('checkout.statusPending')
                    : (isOnsite 
                      ? tGlobal('checkout.statusOnsite')
                      : tGlobal('checkout.statusPaid'))}
                </span>
              </div>
              <div style={{ textAlign: locale === 'ar' ? 'left' : 'right' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                  {locale === 'ar' ? 'إجمالي قيمة الحجز' : locale === 'fr' ? 'Valeur totale' : locale === 'de' ? 'Gesamtbuchungswert' : locale === 'es' ? 'Valor total de reserva' : locale === 'ru' ? 'Общая стоимость' : locale === 'zh' ? '预订总价' : locale === 'ja' ? '予約合計金額' : locale === 'tr' ? 'Toplam rezervasyon' : 'Total Booking Value'}
                </span>
                <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#b45309', fontFamily: 'var(--font-en)', marginTop: '0.2rem' }}>
                  €{amountParam.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Contact Numbers */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.2rem 1.5rem', marginTop: '2rem' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                📞 {locale === 'ar' ? 'أرقام تواصل ORLUXUS' : 'ORLUXUS Contact Numbers'}
              </h4>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#dc2626', color: '#fff', padding: '2px 10px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: '700' }}>EMERGENCY</span>
                  <a href={`tel:${emergencyNum}`} style={{ color: '#dc2626', fontWeight: '800', textDecoration: 'none', fontFamily: 'var(--font-en)', fontSize: '1rem' }}>{emergencyNum}</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#10b981', color: '#fff', padding: '2px 10px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: '700' }}>CUSTOMER SERVICE</span>
                  <a href={`tel:${whatsappNum}`} style={{ color: '#10b981', fontWeight: '800', textDecoration: 'none', fontFamily: 'var(--font-en)', fontSize: '1rem' }}>{whatsappNum}</a>
                </div>
              </div>
            </div>

            {/* Digital Signature & Terms Agreement */}
            <div style={{ border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '1.2rem 1.5rem', marginTop: '1.5rem' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                📋 {locale === 'ar' ? 'الشروط والأحكام — الاتفاقية الإلكترونية' : locale === 'fr' ? 'Conditions — Accord Électronique' : locale === 'de' ? 'AGB — Elektronische Vereinbarung' : locale === 'es' ? 'Términos — Acuerdo Electrónico' : 'Terms & Conditions — Electronic Agreement'}
              </h4>
              <p style={{ margin: '0 0 10px', fontSize: '0.82rem', color: '#475569', lineHeight: '1.6' }}>
                {locale === 'ar' 
                  ? <>باستكمال هذا الحجز، يؤكد <strong>{nameParam}</strong> إلكترونياً قبوله لشروط وأحكام ORLUXUS وسياسة الإلغاء (يجب الإلغاء قبل 24 ساعة) وسياسة حماية البيانات (GDPR). يُعدّ هذا المستند عقداً رقمياً صالحاً مع ORLUXUS GROUP Ltd. (رقم السجل: 7291-B).</>
                  : <>By completing this booking, <strong>{nameParam}</strong> hereby electronically confirms acceptance of ORLUXUS Terms &amp; Conditions, Cancellation Policy (cancellations must be made 24+ hours in advance), and Data Protection Policy (GDPR compliant). This document constitutes a valid digital contract between the traveler and ORLUXUS GROUP Ltd. (Reg. No. 7291-B).</>}
              </p>
              <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#475569', lineHeight: '1.6', fontStyle: 'italic', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                {locale === 'ar'
                  ? <>في ORLUXUS، نقوم بتنظيم تجارب استثنائية من خلال شبكتنا من الشركاء الموثوقين. يتم تقديم تجربتك المختارة من قبل شريك ORLUXUS المعتمد، بينما نضمن لك رحلة حجز سلسة، وتنسيقاً متميزاً، ودعماً مخصصاً للضيوف من الحجز وحتى إتمام الرحلة.</>
                  : <>At ORLUXUS, we curate exceptional experiences through our network of trusted partners. Your selected experience is delivered by an authorized ORLUXUS partner, while we ensure a seamless booking journey, quality coordination, and dedicated guest support from reservation to completion.</>}
              </p>
              <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.78rem', color: '#64748b' }}>
                <span>✍️ <strong>{locale === 'ar' ? 'وافق إلكترونياً:' : 'Digitally agreed by:'}</strong> {nameParam}</span>
                <span>🕐 <strong>{locale === 'ar' ? 'وقت الحجز:' : 'Booking Time:'}</strong> {new Date().toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                <span>🔑 <strong>{locale === 'ar' ? 'رقم المرجع:' : 'Booking Ref:'}</strong> {txParam.slice(0, 12).toUpperCase()}</span>
              </div>
            </div>

            {/* Verification Footer text */}
            <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: '#94a3b8', borderTop: '1px dashed #e2e8f0', paddingTop: '1.5rem' }}>
              {locale === 'ar' ? 'شكراً لاختيارك ORLUXUS. نتمنى لك رحلة رائعة. 🌟' : locale === 'fr' ? 'Merci de choisir ORLUXUS. Bon voyage ! 🌟' : locale === 'de' ? 'Danke für Ihre Wahl. Gute Reise! 🌟' : locale === 'es' ? 'Gracias por elegir ORLUXUS. ¡Buen viaje! 🌟' : locale === 'it' ? 'Grazie per aver scelto ORLUXUS. Buon viaggio! 🌟' : locale === 'ru' ? 'Спасибо за выбор ORLUXUS. Приятного путешествия! 🌟' : locale === 'zh' ? '感谢选择ORLUXUS。祝旅途愉快！🌟' : locale === 'ja' ? 'ORLUXUSをご利用ありがとうございます。良い旅を！🌟' : locale === 'tr' ? 'ORLUXUS\'u seçtiğiniz için teşekkürler. İyi yolculuklar! 🌟' : 'Thank you for choosing ORLUXUS. We wish you an amazing trip. 🌟'}
            </div>
          </div>

          {/* Invoice Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }} className="hide-print">
            <button 
              onClick={() => window.print()} 
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.8rem', cursor: 'pointer', fontSize: '0.95rem' }}
            >
              🖨️ {locale === 'ar' ? 'طباعة الفاتورة' : locale === 'fr' ? 'Imprimer la facture' : locale === 'de' ? 'Rechnung drucken' : locale === 'es' ? 'Imprimir factura' : locale === 'ru' ? 'Распечатать' : locale === 'zh' ? '打印发票' : locale === 'ja' ? '請求書を印刷' : locale === 'tr' ? 'Faturayı yazdır' : 'Print Invoice'}
            </button>
            <button 
              onClick={() => window.print()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.8rem', cursor: 'pointer', background: 'linear-gradient(135deg, #1e3a5f, #2d5986)', color: 'white', border: 'none', borderRadius: '9999px', fontWeight: '700', fontSize: '0.95rem', boxShadow: '0 4px 15px rgba(30,58,95,0.3)' }}
            >
              💾 {locale === 'ar' ? 'حفظ كـ PDF' : locale === 'fr' ? 'Enregistrer en PDF' : locale === 'de' ? 'Als PDF speichern' : locale === 'es' ? 'Guardar como PDF' : locale === 'it' ? 'Salva come PDF' : locale === 'ru' ? 'Сохранить PDF' : locale === 'zh' ? '保存PDF' : locale === 'ja' ? 'PDFとして保存' : locale === 'tr' ? 'PDF kaydet' : 'Save as PDF'}
            </button>
            <Link href="/" className="btn btn-secondary" style={{ padding: '0.8rem 1.8rem', fontSize: '0.95rem' }}>
              {locale === 'ar' ? '🏠 العودة للرئيسية' : locale === 'fr' ? '🏠 Retour à l\'accueil' : locale === 'de' ? '🏠 Zur Startseite' : locale === 'es' ? '🏠 Volver al inicio' : locale === 'ru' ? '🏠 На главную' : locale === 'zh' ? '🏠 返回首页' : locale === 'ja' ? '🏠 ホームへ' : locale === 'tr' ? '🏠 Ana sayfa' : '🏠 Return to Home'}
            </Link>
          </div>
        </div>

        <style jsx global>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 8mm 10mm;
            }
            html, body {
              background: #ffffff !important;
              color: #000000 !important;
              padding: 0 !important;
              margin: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-size: 11px !important;
            }
            .hide-print, nav, header, footer, .water-bg-pattern {
              display: none !important;
            }
            main {
              padding: 0 !important;
              background: none !important;
            }
            .container {
              max-width: 100% !important;
              padding: 0 !important;
            }
            #invoice-sheet {
              box-shadow: none !important;
              border: 1px solid #e2e8f0 !important;
              padding: 12mm !important;
              margin: 0 !important;
              background: #ffffff !important;
              border-radius: 0 !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            #invoice-sheet h2 { font-size: 1.3rem !important; }
            #invoice-sheet h3 { font-size: 1rem !important; }
            #invoice-sheet h4 { font-size: 0.75rem !important; }
            #invoice-sheet p, #invoice-sheet td, #invoice-sheet th, #invoice-sheet span {
              font-size: 0.8rem !important;
            }
            #invoice-sheet table td, #invoice-sheet table th {
              padding: 5px 8px !important;
            }
            #invoice-sheet div[style*="padding: '3rem'"],
            #invoice-sheet div[style*="padding:'3rem'"] {
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
            
            {/* Top: Order Summary */}
            <div className="glass-card animate-fade-in-up" style={{ padding: '2.5rem', border: '1px solid var(--border-accent)', boxShadow: 'var(--shadow-glow-gold)', textAlign: 'left' }}>
              <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem', color: 'var(--text-primary)' }}>{translate('summary')}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>{translate('serviceRequested')}</span>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    <TranslatedText text={titleEn || titleAr} fallback="Travel Excursion" />
                  </h4>
                  {tier && (
                    <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        background: tier === 'vip' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : (tier === 'business' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'rgba(255,255,255,0.1)'),
                        color: '#ffffff',
                        textTransform: 'uppercase'
                      }}>
                        {tier === 'vip' ? '👑 VIP' : (tier === 'business' ? '💼 Business' : '🎫 Economy')}
                      </span>
                      {tierDesc && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--gold-400)', margin: 0, fontWeight: '500' }}>
                          {tierDesc}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{translate('basePrice')}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>€{basePrice}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{translate('travelers')}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>{travelers}</span>
                </div>

                {/* Children row */}
                {children > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>• {translate('childrenLabel')} ×{children}</span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>
                      {childPrice > 0 ? `+€${(childPrice * children).toFixed(2)}` : (locale === 'ar' ? 'مجاناً' : '✓ Free')}
                    </span>
                  </div>
                )}

                {/* Infants row */}
                {infants > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>• {translate('infantsLabel')} ×{infants}</span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>
                      {infantPrice > 0 ? `+€${(infantPrice * infants).toFixed(2)}` : (locale === 'ar' ? 'مجاناً' : '✓ Free')}
                    </span>
                  </div>
                )}

                {/* Extras Cost rows */}
                {((settings?.checkoutAddons && settings.checkoutAddons.length > 0) ? settings.checkoutAddons : [
                  { id: 'guide', nameEn: 'Private Tour Guide', nameAr: 'مرشد سياحي خاص', price: 25, unit: 'booking' },
                  { id: 'lunch', nameEn: 'Lunch & Soft Drinks', nameAr: 'وجبة غداء ومشروبات', price: 15, unit: 'person' },
                  { id: 'transfer', nameEn: 'Round-trip Private Transfer', nameAr: 'انتقالات خاصة ذهاب وعودة', price: 30, unit: 'booking' },
                  { id: 'photos', nameEn: 'Professional Photography Session', nameAr: 'جلسة تصوير احترافية', price: 20, unit: 'booking' },
                ]).map(addon => (
                  selectedExtras[addon.id] ? (
                    <div key={addon.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>
                        • {locale === 'de' ? ({
                          'guide': 'Privater Reiseleiter',
                          'lunch': 'Mittagessen & Erfrischungsgetränke',
                          'transfer': 'Privater Hin- und Rücktransfer',
                          'photos': 'Professionelles Fotoshooting'
                        }[addon.id] || addon.nameEn) : (locale === 'ar' ? (addon.nameAr || addon.nameEn) : (addon.nameEn || addon.nameAr))}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>
                        +€{(addon.unit === 'person' || addon.nameEn?.toLowerCase().includes('/ person') || addon.id === 'lunch') ? (addon.price * travelers) : addon.price}
                      </span>
                    </div>
                  ) : null
                ))}

                {promoDetails && discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', background: 'rgba(16,185,129,0.06)', borderRadius: '8px', padding: '0.5rem 0.8rem', border: '1px solid rgba(16,185,129,0.15)' }}>
                    <span style={{ fontSize: '0.9rem' }}>🎟️ {translate('discount')} <strong style={{ fontFamily: 'var(--font-en)', letterSpacing: '1px' }}>{promoDetails.code}</strong></span>
                    <span style={{ fontWeight: 'bold', fontFamily: 'var(--font-en)' }}>-€{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {!promoDetails && discountAmount > 0 && (
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

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.8rem', lineHeight: '1.4' }}>
                <span>🔒</span>
                <span>{translate('sslNotice')}</span>
              </div>
            </div>

            {/* Bottom: Payment options & Tab control */}
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
                    border: paymentTab === 'later' ? '2px solid var(--gold-500)' : '1px solid rgba(212, 175, 55, 0.4)',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    transition: 'var(--transition-base)',
                    background: paymentTab === 'later' ? 'var(--gradient-gold)' : 'rgba(212, 175, 55, 0.12)',
                    color: paymentTab === 'later' ? '#000000' : 'var(--gold-400)',
                    boxShadow: paymentTab === 'later' ? 'var(--shadow-glow-gold)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>💵 {translate('payLaterTab')}</span>
                  <span style={{
                    background: paymentTab === 'later' ? '#000000' : 'var(--gold-500)',
                    color: paymentTab === 'later' ? '#ffffff' : '#000000',
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: '800'
                  }}>
                    {isAr ? 'موصى به ⭐' : 'Popular ⭐'}
                  </span>
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
                        Credit Card
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
                      <span style={{ fontSize: '1.5rem' }}>🏛️</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        Bank Transfer
                      </span>
                    </button>

                    {/* Paytabs Option */}
                    <button
                      type="button"
                      onClick={() => setSelectedPayMethod('paytabs')}
                      style={{
                        padding: '1rem',
                        borderRadius: '10px',
                        background: 'var(--bg-secondary)',
                        border: selectedPayMethod === 'paytabs' ? '2px solid var(--gold-500)' : '1px solid var(--border-medium)',
                        boxShadow: selectedPayMethod === 'paytabs' ? 'var(--shadow-glow-gold)' : 'none',
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
                        Paytabs
                      </span>
                    </button>
                  </div>

                  {/* CARD SUB-VIEW */}
                  {selectedPayMethod === 'card' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                      <button
                        type="button"
                        onClick={() => handleSimulatedCardPayment()}
                        className="btn btn-primary"
                        style={{
                          width: '100%',
                          padding: '1.1rem',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          borderRadius: '10px'
                        }}
                      >
                        {translate('payBtn')} €{totalAmount.toFixed(2)}
                      </button>
                    </div>
                  )}

                  {/* PAYPAL DIRECT GATEWAY SUB-VIEW */}
                  {selectedPayMethod === 'paypal' && (() => {
                    const recipientEmail = settings?.paypalEmail || 'info@orluxus.com';
                    const paypalMeUrl = settings?.paypalMe 
                      ? (settings.paypalMe.startsWith('http') ? `${settings.paypalMe}/${totalAmount.toFixed(2)}EUR` : `https://paypal.me/${settings.paypalMe}/${totalAmount.toFixed(2)}EUR`)
                      : `https://paypal.me/orluxus/${totalAmount.toFixed(2)}EUR`;
                    const accountName = settings?.paypalAccountName || 'ORLUXUS Travel & Tourism';
                    const instructions = isAr 
                      ? (settings?.paypalInstructionsAr || 'يرجى تحويل المبلغ عبر PayPal مع كتابة كود الحجز في الملاحظات، ثم رفع صورة الإيصال ليتم تأكيد حجزك فوراً.')
                      : (settings?.paypalInstructionsEn || 'Please send the payment via PayPal, include your Booking Reference in the note, and upload the confirmation receipt.');

                    const handleCopy = (text, fieldName) => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(text);
                        setCopiedField(fieldName);
                        setTimeout(() => setCopiedField(''), 2500);
                      }
                    };

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                        {/* Header */}
                        <div>
                          <h4 style={{ color: 'var(--text-primary)', fontWeight: 'bold', margin: '0 0 0.3rem 0', fontSize: '1.1rem' }}>
                            {isAr ? '🅿️ الدفع والتحويل المباشر عبر PayPal' : '🅿️ Direct PayPal Transfer & Payment'}
                          </h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                            {isAr ? 'ادفع بأمان عبر حساب باي بال المعتمد أو رابط PayPal.me المباشر وارفع الإيصال لتأكيد حجزك.' : 'Pay securely to our official PayPal account or via PayPal.me and upload your confirmation receipt.'}
                          </p>
                        </div>

                        {/* PayPal Details Card */}
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(0, 112, 186, 0.1) 0%, rgba(18, 22, 32, 0.95) 100%)',
                          border: '1px solid #0070ba',
                          borderRadius: '12px',
                          padding: '1.4rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.8rem',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0, 112, 186, 0.3)', paddingBottom: '0.6rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '1.3rem' }}>🅿️</span>
                              <strong style={{ color: '#0070ba', fontSize: '1rem' }}>{accountName}</strong>
                            </div>
                            <span style={{ background: '#0070ba', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                              Verified PayPal
                            </span>
                          </div>

                          {/* PayPal Email */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '6px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{isAr ? 'بريد PayPal الرسمي:' : 'PayPal Email:'}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ color: '#93c5fd', fontFamily: 'var(--font-en)' }}>{recipientEmail}</strong>
                              <button
                                type="button"
                                onClick={() => handleCopy(recipientEmail, 'paypalEmail')}
                                style={{ background: 'rgba(0,112,186,0.2)', border: '1px solid #0070ba', color: copiedField === 'paypalEmail' ? '#10b981' : '#93c5fd', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', padding: '2px 8px' }}
                              >
                                {copiedField === 'paypalEmail' ? (isAr ? 'تم النسخ ✓' : 'Copied ✓') : (isAr ? 'نسخ 📋' : 'Copy 📋')}
                              </button>
                            </div>
                          </div>

                          {/* Total Amount */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>{isAr ? 'المبلغ المطلوب:' : 'Amount to Send:'}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ color: 'var(--gold-400)', fontWeight: '800', fontSize: '1.2rem', fontFamily: 'var(--font-en)' }}>
                                €{totalAmount.toFixed(2)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(totalAmount.toFixed(2), 'paypalAmount')}
                                style={{ background: 'none', border: 'none', color: copiedField === 'paypalAmount' ? '#10b981' : 'var(--gold-400)', cursor: 'pointer', fontSize: '0.8rem' }}
                                title="Copy"
                              >
                                {copiedField === 'paypalAmount' ? '✓' : '📋'}
                              </button>
                            </div>
                          </div>

                          {/* Fast PayPal.Me Action Button */}
                          <div style={{ marginTop: '0.4rem' }}>
                            <a
                              href={paypalMeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                width: '100%',
                                padding: '10px',
                                background: '#0070ba',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                textDecoration: 'none',
                                transition: 'background 0.2s ease',
                                boxShadow: '0 4px 12px rgba(0, 112, 186, 0.3)'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#005ea6'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#0070ba'}
                            >
                              <span>🅿️</span>
                              <span>{isAr ? `فتح صفحة الدفع المباشر عبر PayPal.me (€${totalAmount.toFixed(2)}) ↗` : `Pay via PayPal.me (€${totalAmount.toFixed(2)}) ↗`}</span>
                            </a>
                          </div>

                          {/* Instructions text */}
                          <div style={{ fontSize: '0.8rem', color: '#93c5fd', background: 'rgba(0,112,186,0.1)', padding: '8px 10px', borderRadius: '6px', lineHeight: '1.4' }}>
                            💡 {instructions}
                          </div>
                        </div>

                        {/* Booking Reference Notice Box */}
                        <div style={{
                          background: 'rgba(59,130,246,0.08)',
                          border: '1px solid rgba(59,130,246,0.3)',
                          borderRadius: '10px',
                          padding: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#93c5fd', fontSize: '0.85rem', fontWeight: 'bold' }}>
                              📌 {isAr ? 'كود مرجع الحجز (مهم لإدراجه في PayPal):' : 'Booking Reference (Important for PayPal note):'}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ background: '#1e3a8a', color: '#93c5fd', padding: '2px 10px', borderRadius: '6px', fontWeight: '800', fontFamily: 'var(--font-en)', fontSize: '0.95rem' }}>
                                {bookingRefCode}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(bookingRefCode, 'ppBookingRef')}
                                style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid #3b82f6', color: copiedField === 'ppBookingRef' ? '#10b981' : '#93c5fd', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', fontSize: '0.75rem' }}
                              >
                                {copiedField === 'ppBookingRef' ? (isAr ? 'تم النسخ ✓' : 'Copied ✓') : (isAr ? 'نسخ 📋' : 'Copy 📋')}
                              </button>
                            </div>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-tertiary)', lineHeight: '1.4' }}>
                            {isAr 
                              ? '⚠️ يرجى إضافة هذا الكود في خانة الملاحظات عند إرسال دفعة PayPal لربطها بالحجز فوراً.' 
                              : '⚠️ Please add this code in the PayPal payment note to link it to your booking.'}
                          </p>
                        </div>

                        {/* Upload Receipt / Transaction Reference */}
                        <div style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px dashed #0070ba',
                          borderRadius: '12px',
                          padding: '1.4rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem'
                        }}>
                          <div>
                            <label style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '0.3rem' }}>
                              📎 {isAr ? 'رفع لقطة شاشة لإيصال PayPal (اختياري لتسريع التأكيد):' : 'Upload PayPal Confirmation Screenshot (Optional):'}
                            </label>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', margin: 0 }}>
                              {isAr ? 'يقبل صور JPG, PNG, WEBP أو PDF (الحد الأقصى 8 ميجابايت)' : 'Accepts JPG, PNG, WEBP or PDF (Max 8MB)'}
                            </p>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,application/pdf"
                              onChange={handleReceiptFileChange}
                              id="ppReceiptFileInput"
                              style={{ display: 'none' }}
                            />
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                              <label
                                htmlFor="ppReceiptFileInput"
                                style={{
                                  padding: '10px 18px',
                                  background: 'rgba(0,112,186,0.15)',
                                  border: '1px solid #0070ba',
                                  borderRadius: '8px',
                                  color: '#93c5fd',
                                  cursor: 'pointer',
                                  fontWeight: 'bold',
                                  fontSize: '0.85rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                📷 {receiptFile ? (isAr ? 'تغيير الملف' : 'Change File') : (isAr ? 'اختيار لقطة الشاشة أو الإيصال' : 'Select Screenshot or PDF')}
                              </label>

                              {receiptFile && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', padding: '6px 12px', borderRadius: '6px' }}>
                                  <span style={{ fontSize: '0.85rem', color: '#10b981' }}>
                                    ✓ {receiptFile.name} ({(receiptFile.size / 1024).toFixed(0)} KB)
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => { setReceiptFile(null); setReceiptPreview(''); }}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', padding: 0 }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                            </div>

                            {receiptPreview && receiptPreview !== 'pdf' && (
                              <div style={{ marginTop: '0.5rem', maxWidth: '200px', maxHeight: '140px', overflow: 'hidden', borderRadius: '6px', border: '1px solid var(--border-medium)' }}>
                                <img src={receiptPreview} alt="Receipt Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
                              </div>
                            )}

                            {/* Optional Reference or Sender Email */}
                            <div style={{ marginTop: '0.5rem' }}>
                              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                {isAr ? 'رقم معاملة PayPal أو بريدك في PayPal (اختياري):' : 'PayPal Transaction ID or Your PayPal Email (Optional):'}
                              </label>
                              <input
                                type="text"
                                value={clientTransferRef}
                                onChange={(e) => setClientTransferRef(e.target.value)}
                                placeholder={isAr ? 'مثال: PayPal Ref #987654321 أو yourname@gmail.com' : 'e.g. PayPal Transaction ID or sender email'}
                                style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-medium)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <button
                          type="button"
                          onClick={handlePayPalDirectPayment}
                          disabled={isUploadingReceipt}
                          className="btn btn-primary"
                          style={{
                            width: '100%',
                            padding: '1.2rem',
                            fontWeight: '800',
                            fontSize: '1.05rem',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #0070ba, #003087)',
                            color: '#ffffff',
                            border: 'none',
                            cursor: isUploadingReceipt ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 6px 20px rgba(0, 112, 186, 0.4)'
                          }}
                        >
                          {isUploadingReceipt ? (
                            <>
                              <div className="spinner" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                              <span>{isAr ? 'جاري تسجيل الحجز وتأكيد الدفع...' : 'Processing booking & receipt...'}</span>
                            </>
                          ) : (
                            <>
                              <span>🅿️</span>
                              <span>
                                {receiptFile 
                                  ? (isAr ? `تأكيد الحجز ورفع إيصال PayPal - €${totalAmount.toFixed(2)}` : `Confirm Booking & Submit PayPal Receipt - €${totalAmount.toFixed(2)}`)
                                  : (isAr ? `تأكيد الحجز عبر PayPal - €${totalAmount.toFixed(2)}` : `Confirm Booking via PayPal - €${totalAmount.toFixed(2)}`)
                                }
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })()}

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
                        <span style={{ color: '#ffffff', fontFamily: '"Google Sans", Roboto, sans-serif', fontWeight: '500', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '700' }}>Google</span> Pay
                        </span>
                      </button>
                    </div>
                  )}

                  {/* BANK TRANSFER SUB-VIEW (CUSTOM GATEWAY) */}
                  {selectedPayMethod === 'bank_transfer' && (() => {
                    const activeBanks = (settings?.bankAccounts || []).filter(b => b.isActive !== false);
                    const defaultBank = {
                      id: 'bank_cib_eur',
                      bankName: 'CIB Bank (البنك التجاري الدولي)',
                      accountName: 'ORLUXUS LUXURY TRAVEL',
                      accountNumber: '100045892147',
                      iban: 'EG38001000450000100045892147',
                      swift: 'CIBEEGCX',
                      currency: 'EUR',
                      country: 'Egypt 🇪🇬',
                      instructionsAr: 'يرجى كتابة كود الحجز في خانة الملاحظات عند التحويل.',
                      instructionsEn: 'Please write the Booking Reference in the transfer memo/description.'
                    };
                    const displayBanks = activeBanks.length > 0 ? activeBanks : [defaultBank];
                    const currentBank = displayBanks.find(b => b.id === selectedBankId) || displayBanks[0];

                    const handleCopy = (text, fieldName) => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(text);
                        setCopiedField(fieldName);
                        setTimeout(() => setCopiedField(''), 2500);
                      }
                    };

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Title & Instructions */}
                        <div>
                          <h4 style={{ color: 'var(--text-primary)', fontWeight: 'bold', margin: '0 0 0.3rem 0', fontSize: '1.1rem' }}>
                            {isAr ? '🏦 التحويل البنكي المباشر لحسابات الشركة' : '🏦 Direct Bank Transfer to Company Accounts'}
                          </h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                            {isAr 
                              ? 'قم بالتحويل إلى أحد حساباتنا الرسمية المعتمدة وارفع صورة الإيصال ليتم تأكيد حجزك رسمياً.' 
                              : 'Transfer directly to our verified company accounts and upload the payment receipt to confirm your reservation.'}
                          </p>
                        </div>

                        {/* Bank Accounts Switcher (if more than 1) */}
                        {displayBanks.length > 1 && (
                          <div>
                            <label style={{ display: 'block', color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                              {isAr ? 'اختر الحساب البنكي المناسب:' : 'Select Company Bank Account:'}
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.6rem' }}>
                              {displayBanks.map((b) => (
                                <button
                                  type="button"
                                  key={b.id}
                                  onClick={() => setSelectedBankId(b.id)}
                                  style={{
                                    padding: '0.8rem 1rem',
                                    borderRadius: '8px',
                                    background: (selectedBankId === b.id || (!selectedBankId && b.id === displayBanks[0].id)) ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.03)',
                                    border: (selectedBankId === b.id || (!selectedBankId && b.id === displayBanks[0].id)) ? '2px solid var(--gold-500)' : '1px solid var(--border-medium)',
                                    color: (selectedBankId === b.id || (!selectedBankId && b.id === displayBanks[0].id)) ? 'var(--gold-400)' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    textAlign: isAr ? 'right' : 'left',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px',
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{b.bankName}</strong>
                                    <span style={{ fontSize: '0.7rem', background: 'var(--gold-500)', color: '#000', padding: '1px 5px', borderRadius: '3px', fontWeight: '800' }}>
                                      {b.currency}
                                    </span>
                                  </div>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{b.country || ''}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Selected Bank Details Card */}
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(18,22,32,0.95) 100%)',
                          border: '1px solid var(--gold-500)',
                          borderRadius: '12px',
                          padding: '1.4rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.8rem',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '0.6rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '1.2rem' }}>🏛️</span>
                              <strong style={{ color: 'var(--gold-400)', fontSize: '1rem' }}>{currentBank.bankName}</strong>
                              <span style={{ background: 'var(--gold-500)', color: '#000', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                                {currentBank.currency}
                              </span>
                            </div>
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>{currentBank.country}</span>
                          </div>

                          {/* Account Name */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{isAr ? 'اسم المستفيد:' : 'Beneficiary:'}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ color: 'var(--text-primary)' }}>{currentBank.accountName}</strong>
                              <button
                                type="button"
                                onClick={() => handleCopy(currentBank.accountName, 'accountName')}
                                style={{ background: 'none', border: 'none', color: copiedField === 'accountName' ? '#10b981' : 'var(--gold-400)', cursor: 'pointer', fontSize: '0.8rem', padding: '2px 4px' }}
                                title="Copy"
                              >
                                {copiedField === 'accountName' ? '✓' : '📋'}
                              </button>
                            </div>
                          </div>

                          {/* IBAN */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '6px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>IBAN:</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ color: 'var(--gold-300)', fontFamily: 'var(--font-en)', letterSpacing: '0.5px' }}>
                                {currentBank.iban || currentBank.accountNumber}
                              </strong>
                              <button
                                type="button"
                                onClick={() => handleCopy(currentBank.iban || currentBank.accountNumber, 'iban')}
                                style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid var(--gold-500)', color: copiedField === 'iban' ? '#10b981' : 'var(--gold-400)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', padding: '2px 8px' }}
                              >
                                {copiedField === 'iban' ? (isAr ? 'تم النسخ ✓' : 'Copied ✓') : (isAr ? 'نسخ 📋' : 'Copy 📋')}
                              </button>
                            </div>
                          </div>

                          {/* SWIFT / BIC */}
                          {currentBank.swift && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>SWIFT / BIC:</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>{currentBank.swift}</strong>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(currentBank.swift, 'swift')}
                                  style={{ background: 'none', border: 'none', color: copiedField === 'swift' ? '#10b981' : 'var(--gold-400)', cursor: 'pointer', fontSize: '0.8rem', padding: '2px 4px' }}
                                  title="Copy"
                                >
                                  {copiedField === 'swift' ? '✓' : '📋'}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Amount to transfer */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem', borderTop: '1px solid rgba(212,175,55,0.2)', paddingTop: '0.6rem' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>{isAr ? 'المبلغ المطلوب تحويله:' : 'Amount to Transfer:'}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ color: 'var(--gold-400)', fontWeight: '800', fontSize: '1.2rem', fontFamily: 'var(--font-en)' }}>
                                €{totalAmount.toFixed(2)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(totalAmount.toFixed(2), 'amount')}
                                style={{ background: 'none', border: 'none', color: copiedField === 'amount' ? '#10b981' : 'var(--gold-400)', cursor: 'pointer', fontSize: '0.8rem' }}
                                title="Copy"
                              >
                                {copiedField === 'amount' ? '✓' : '📋'}
                              </button>
                            </div>
                          </div>

                          {/* Bank Custom Instructions */}
                          {(currentBank.instructionsAr || currentBank.instructionsEn) && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--gold-300)', background: 'rgba(212,175,55,0.08)', padding: '6px 10px', borderRadius: '6px', lineHeight: '1.4' }}>
                              💡 {isAr ? (currentBank.instructionsAr || currentBank.instructionsEn) : (currentBank.instructionsEn || currentBank.instructionsAr)}
                            </div>
                          )}
                        </div>

                        {/* Booking Reference Notice Box (Very Important) */}
                        <div style={{
                          background: 'rgba(59,130,246,0.08)',
                          border: '1px solid rgba(59,130,246,0.3)',
                          borderRadius: '10px',
                          padding: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#93c5fd', fontSize: '0.85rem', fontWeight: 'bold' }}>
                              📌 {isAr ? 'رقم مرجع الحجز (مهم جداً عند التحويل):' : 'Booking Reference Code (Important):'}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ background: '#1e3a8a', color: '#93c5fd', padding: '2px 10px', borderRadius: '6px', fontWeight: '800', fontFamily: 'var(--font-en)', fontSize: '0.95rem' }}>
                                {bookingRefCode}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(bookingRefCode, 'bookingRef')}
                                style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid #3b82f6', color: copiedField === 'bookingRef' ? '#10b981' : '#93c5fd', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', fontSize: '0.75rem' }}
                              >
                                {copiedField === 'bookingRef' ? (isAr ? 'تم النسخ ✓' : 'Copied ✓') : (isAr ? 'نسخ 📋' : 'Copy 📋')}
                              </button>
                            </div>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-tertiary)', lineHeight: '1.4' }}>
                            {isAr 
                              ? '⚠️ يرجى كتابة هذا الكود في خانة (الوصف / الغرض من التحويل / Verwendungszweck) عند إتمام عملية التحويل البنكي لربط دفعتك بالحجز تلقائياً.' 
                              : '⚠️ Please write this code in the payment description/memo field when completing the transfer to automatically link your payment.'}
                          </p>
                        </div>

                        {/* Upload Receipt Section */}
                        <div style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px dashed var(--gold-500)',
                          borderRadius: '12px',
                          padding: '1.4rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem'
                        }}>
                          <div>
                            <label style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '0.3rem' }}>
                              📎 {isAr ? 'رفع إيصال التحويل البنكي (اختياري ولكنه يسرع التأكيد):' : 'Upload Bank Transfer Receipt (Optional for fast track):'}
                            </label>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', margin: 0 }}>
                              {isAr ? 'يقبل صور JPG, PNG, WEBP أو مستند PDF (الحد الأقصى 8 ميجابايت)' : 'Accepts JPG, PNG, WEBP images or PDF document (Max 8MB)'}
                            </p>
                          </div>

                          {/* File Input & Preview */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,application/pdf"
                              onChange={handleReceiptFileChange}
                              id="receiptFileInput"
                              style={{ display: 'none' }}
                            />
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                              <label
                                htmlFor="receiptFileInput"
                                style={{
                                  padding: '10px 18px',
                                  background: 'rgba(212,175,55,0.15)',
                                  border: '1px solid var(--gold-500)',
                                  borderRadius: '8px',
                                  color: 'var(--gold-400)',
                                  cursor: 'pointer',
                                  fontWeight: 'bold',
                                  fontSize: '0.85rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                📷 {receiptFile ? (isAr ? 'تغيير الملف' : 'Change File') : (isAr ? 'اختيار صورة الإيصال أو PDF' : 'Select Receipt Image or PDF')}
                              </label>

                              {receiptFile && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', padding: '6px 12px', borderRadius: '6px' }}>
                                  <span style={{ fontSize: '0.85rem', color: '#10b981' }}>
                                    ✓ {receiptFile.name} ({(receiptFile.size / 1024).toFixed(0)} KB)
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => { setReceiptFile(null); setReceiptPreview(''); }}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', padding: 0 }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Image Preview if image */}
                            {receiptPreview && receiptPreview !== 'pdf' && (
                              <div style={{ marginTop: '0.5rem', maxWidth: '200px', maxHeight: '140px', overflow: 'hidden', borderRadius: '6px', border: '1px solid var(--border-medium)' }}>
                                <img src={receiptPreview} alt="Receipt Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
                              </div>
                            )}

                            {receiptError && (
                              <div style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: 'bold' }}>
                                ⚠️ {receiptError}
                              </div>
                            )}

                            {/* Optional Reference or Sender Name */}
                            <div style={{ marginTop: '0.5rem' }}>
                              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                {isAr ? 'رقم العملية البنكية أو اسم صاحب الحساب المحول منه (اختياري):' : 'Bank Transaction Reference or Sender Name (Optional):'}
                              </label>
                              <input
                                type="text"
                                value={clientTransferRef}
                                onChange={(e) => setClientTransferRef(e.target.value)}
                                placeholder={isAr ? 'مثال: تحويل من حساب باسم أحمد محمد / مرجع #987654' : 'e.g. Transfer from John Doe / Ref #987654'}
                                style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-medium)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <button
                          type="button"
                          onClick={handleBankTransferPayment}
                          disabled={isUploadingReceipt}
                          className="btn btn-primary"
                          style={{
                            width: '100%',
                            padding: '1.2rem',
                            fontWeight: '800',
                            fontSize: '1.05rem',
                            borderRadius: '10px',
                            background: 'var(--gradient-gold)',
                            color: '#000',
                            cursor: isUploadingReceipt ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: 'var(--shadow-glow-gold)'
                          }}
                        >
                          {isUploadingReceipt ? (
                            <>
                              <div className="spinner" style={{ width: '18px', height: '18px', border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                              <span>{isAr ? 'جاري تسجيل الحجز ورفع الإيصال...' : 'Processing booking & uploading receipt...'}</span>
                            </>
                          ) : (
                            <>
                              <span>🏦</span>
                              <span>
                                {receiptFile 
                                  ? (isAr ? `تأكيد الحجز ورفع الإيصال - €${totalAmount.toFixed(2)}` : `Confirm Booking & Submit Receipt - €${totalAmount.toFixed(2)}`)
                                  : (isAr ? `تأكيد الحجز عبر التحويل البنكي - €${totalAmount.toFixed(2)}` : `Confirm Booking via Bank Transfer - €${totalAmount.toFixed(2)}`)
                                }
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })()}

                  {/* PAYTABS SUB-VIEW */}
                  {selectedPayMethod === 'paytabs' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '1.2rem', fontWeight: 'bold' }}>Paytabs Secure Payment:</h4>
                      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                        {isAr ? 'ادفع بأمان باستخدام بطاقة الائتمان عبر بوابة Paytabs الموثوقة.' : 'Pay securely using your credit card through the trusted Paytabs payment gateway.'}
                      </p>

                      <button
                        type="button"
                        onClick={handlePaytabsPayment}
                        className="btn btn-primary"
                        style={{
                          width: '100%',
                          padding: '1.1rem',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                          border: 'none'
                        }}
                      >
                        Pay with Paytabs - EGP {totalAmount.toFixed(2)}
                      </button>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: PAY LATER (CASH) - PROMINENTLY HIGHLIGHTED */}
              {paymentTab === 'later' && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                  padding: '2rem',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(0, 0, 0, 0.4) 100%)',
                  border: '2px solid var(--gold-500)',
                  boxShadow: '0 0 30px rgba(212, 175, 55, 0.25)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    right: isAr ? 'auto' : '0',
                    left: isAr ? '0' : 'auto',
                    background: 'var(--gradient-gold)',
                    color: '#000',
                    fontWeight: '800',
                    fontSize: '0.75rem',
                    padding: '4px 16px',
                    borderRadius: isAr ? '0 0 12px 0' : '0 0 0 12px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    {isAr ? '🎉 خيار آمن ومفضل لعملائنا' : '🎉 Recommended & Secure'}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '2rem' }}>💵</span>
                    <div>
                      <h4 style={{ color: 'var(--gold-400)', fontWeight: 'bold', fontSize: '1.2rem', margin: 0 }}>
                        {translate('payLaterTitle')}
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, marginTop: '0.2rem' }}>
                        {isAr ? 'حجزك مؤكد فوراً بدون أي خصم كارت الآن. ستقوم بالدفع نقداً لمندوبنا عند بدء الرحلة.' : translate('payLaterDesc')}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleCashPayment} 
                    className="btn" 
                    style={{ 
                      width: '100%', 
                      padding: '1.2rem', 
                      fontWeight: '800', 
                      fontSize: '1.1rem',
                      background: 'var(--gradient-gold)',
                      color: '#000000',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-glow-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <span>✅</span>
                    <span>{translate('cashBtn')}</span>
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

          </div>
        </div>
      </main>
    );
  }

  // 4. DEFAULT INFO FORM STEP (Step 1: details)
  return (
    <main style={{ minHeight: '100vh', paddingBottom: '5rem', background: 'transparent' }}>
      <Navbar />

      <div className="container" style={{ paddingTop: 'calc(var(--nav-height) + 3rem)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2xl)', alignItems: 'flex-start' }}>
          
          {/* Order Summary - Moved to top */}
          <div className="glass-card animate-fade-in-up" style={{ flex: '1 1 320px', padding: '2.5rem', border: '1px solid var(--border-accent)', boxShadow: 'var(--shadow-glow-gold)', textAlign: 'left' }}>
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem', color: 'var(--text-primary)' }}>{translate('summary')}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>{translate('serviceRequested')}</span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  <TranslatedText text={titleEn || titleAr} fallback="Travel Excursion" />
                </h4>
                {locale === 'ar' && titleEn && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'var(--font-en)', margin: 0 }}>{titleEn}</p>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{translate('basePrice')}</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>€{basePrice}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{translate('travelers')}</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>{travelers}</span>
              </div>

              {/* Children row */}
              {children > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>• {translate('childrenLabel')} ×{children}</span>
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>
                    {childPrice > 0 ? `+€${(childPrice * children).toFixed(2)}` : (locale === 'ar' ? 'مجاناً' : '✓ Free')}
                  </span>
                </div>
              )}

              {/* Infants row */}
              {infants > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>• {translate('infantsLabel')} ×{infants}</span>
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>
                    {infantPrice > 0 ? `+€${(infantPrice * infants).toFixed(2)}` : (locale === 'ar' ? 'مجاناً' : '✓ Free')}
                  </span>
                </div>
              )}

              {/* Extras Cost rows - dynamic from settings or fallback */}
              {((settings?.checkoutAddons && settings.checkoutAddons.length > 0) ? settings.checkoutAddons : [
                { id: 'guide', nameEn: 'Private Tour Guide', nameAr: 'مرشد سياحي خاص', price: 25, unit: 'booking' },
                { id: 'lunch', nameEn: 'Lunch & Soft Drinks', nameAr: 'وجبة غداء ومشروبات', price: 15, unit: 'person' },
                { id: 'transfer', nameEn: 'Round-trip Private Transfer', nameAr: 'انتقالات خاصة ذهاب وعودة', price: 30, unit: 'booking' },
                { id: 'photos', nameEn: 'Professional Photography Session', nameAr: 'جلسة تصوير احترافية', price: 20, unit: 'booking' },
              ]).map(addon => (
                selectedExtras[addon.id] ? (
                  <div key={addon.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>
                      • {locale === 'de' ? ({
                        'guide': 'Privater Reiseleiter',
                        'lunch': 'Mittagessen & Erfrischungsgetränke',
                        'transfer': 'Privater Hin- und Rücktransfer',
                        'photos': 'Professionelles Fotoshooting'
                      }[addon.id] || addon.nameEn) : (locale === 'ar' ? (addon.nameAr || addon.nameEn) : (addon.nameEn || addon.nameAr))}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>
                      +€{(addon.unit === 'person' || addon.nameEn?.toLowerCase().includes('/ person') || addon.id === 'lunch') ? (addon.price * travelers) : addon.price}
                    </span>
                  </div>
                ) : null
              ))}

              {promoDetails && discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', background: 'rgba(16,185,129,0.06)', borderRadius: '8px', padding: '0.5rem 0.8rem', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <span style={{ fontSize: '0.9rem' }}>🎟️ {translate('discount')} <strong style={{ fontFamily: 'var(--font-en)', letterSpacing: '1px' }}>{promoDetails.code}</strong></span>
                  <span style={{ fontWeight: 'bold', fontFamily: 'var(--font-en)' }}>-€{discountAmount.toFixed(2)}</span>
                </div>
              )}
              {!promoDetails && discountAmount > 0 && (
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

            <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.8rem', lineHeight: '1.4' }}>
              <span>🔒</span>
              <span>{translate('sslNotice')}</span>
            </div>
          </div>

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
                      fontSize: '1rem',
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
                      fontSize: '1rem',
                      textAlign: isAr ? 'right' : 'left'
                    }}
                  />
                </div>
              </div>

              {/* Date selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  {category === 'restaurants'
                    ? (isAr ? 'تاريخ ووقت حجز الطاولة *' : 'Table Reservation Date & Time *')
                    : translate('dateLabel')}
                </label>
                <input 
                  type={category === 'restaurants' ? 'datetime-local' : 'date'} 
                  value={bookingDate}
                  min={category === 'restaurants' ? new Date().toISOString().slice(0, 16) : new Date().toISOString().split('T')[0]}
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

              {/* Language Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{translate('languageLabel')}</label>
                <select
                  value={customerLanguage}
                  onChange={(e) => setCustomerLanguage(e.target.value)}
                  style={{
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-secondary)',
                    outline: 'none',
                    fontSize: '1rem',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: isAr ? 'right' : 'left'
                  }}
                  required
                >
                  <option value="ar">🇸🇦 العربية (Arabic)</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="de">🇩🇪 Deutsch (German)</option>
                  <option value="fr">🇫🇷 Français (French)</option>
                  <option value="it">🇮🇹 Italiano (Italian)</option>
                  <option value="ru">🇷🇺 Русский (Russian)</option>
                  <option value="es">🇪🇸 Español (Spanish)</option>
                  <option value="zh">🇨🇳 中文 (Chinese)</option>
                  <option value="ja">🇯🇵 日本語 (Japanese)</option>
                  <option value="tr">🇹🇷 Türkçe (Turkish)</option>
                </select>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '0.2rem 0 0' }}>
                  {isAr ? 'اختيار اللغة يساعدنا في توفير خدمة أفضل وتنسيق الرحلة بلغتك المفضلة' : 'Selecting your preferred language helps us coordinate the tour in your language'}
                </p>
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
              {((settings?.checkoutAddons && settings.checkoutAddons.length > 0) ? settings.checkoutAddons : [
                { id: 'guide', nameEn: 'Private Tour Guide', nameAr: 'مرشد سياحي خاص', price: 25, unit: 'booking', descAr: 'مرشد سياحي مرخص يرافقكم طوال الرحلة لشرح المعالم وتسهيل الدخول.', descEn: 'A licensed tour guide to accompany you throughout the trip.' },
                { id: 'lunch', nameEn: 'Lunch & Soft Drinks', nameAr: 'وجبة غداء ومشروبات', price: 15, unit: 'person', descAr: 'وجبة غداء بوفيه مفتوح أو قائمة طعام محددة مع مشروبات غازية ومياه معدنية.', descEn: 'Buffet or set menu lunch with soft drinks and mineral water.' },
                { id: 'transfer', nameEn: 'Round-trip Private Transfer', nameAr: 'انتقالات خاصة ذهاب وعودة', price: 30, unit: 'booking', descAr: 'سيارة خاصة حديثة ومكيفة تنقلكم من الفندق إلى مكان الرحلة وتعود بكم بعد الانتهاء.', descEn: 'Modern private air-conditioned vehicle to and from your hotel.' },
                { id: 'photos', nameEn: 'Professional Photography Session', nameAr: 'جلسة تصوير احترافية', price: 20, unit: 'booking', descAr: 'مصور محترف يرافقكم لالتقاط أجمل اللحظات وتسليمكم الصور بنظام رقمي عالي الجودة.', descEn: 'A professional photographer to capture your best memories.' },
              ]).length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.8rem', 
                  borderTop: '1px solid var(--border-subtle)', 
                  paddingTop: '1.2rem' 
                }}>
                  <h4 style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1rem' }}>{translate('extrasTitle')}</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {((settings?.checkoutAddons && settings.checkoutAddons.length > 0) ? settings.checkoutAddons : [
                      { id: 'guide', nameEn: 'Private Tour Guide', nameAr: 'مرشد سياحي خاص', price: 25, unit: 'booking', descAr: 'مرشد سياحي مرخص يرافقكم طوال الرحلة لشرح المعالم وتسهيل الدخول.', descEn: 'A licensed tour guide to accompany you throughout the trip.' },
                      { id: 'lunch', nameEn: 'Lunch & Soft Drinks', nameAr: 'وجبة غداء ومشروبات', price: 15, unit: 'person', descAr: 'وجبة غداء بوفيه مفتوح أو قائمة طعام محددة مع مشروبات غازية ومياه معدنية.', descEn: 'Buffet or set menu lunch with soft drinks and mineral water.' },
                      { id: 'transfer', nameEn: 'Round-trip Private Transfer', nameAr: 'انتقالات خاصة ذهاب وعودة', price: 30, unit: 'booking', descAr: 'سيارة خاصة حديثة ومكيفة تنقلكم من الفندق إلى مكان الرحلة وتعود بكم بعد الانتهاء.', descEn: 'Modern private air-conditioned vehicle to and from your hotel.' },
                      { id: 'photos', nameEn: 'Professional Photography Session', nameAr: 'جلسة تصوير احترافية', price: 20, unit: 'booking', descAr: 'مصور محترف يرافقكم لالتقاط أجمل اللحظات وتسليمكم الصور بنظام رقمي عالي الجودة.', descEn: 'A professional photographer to capture your best memories.' },
                    ]).map(addon => {
                      const name = locale === 'ar' ? (addon.nameAr || addon.nameEn) : (addon.nameEn || addon.nameAr);
                      const desc = locale === 'ar' ? (addon.descAr || addon.descEn) : (addon.descEn || addon.descAr);
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
                              <TranslatedText text={name} /> 
                              {' '}
                              {(() => {
                                const isPerPerson = addon.unit === 'person' || addon.nameEn?.toLowerCase().includes('/ person') || addon.nameAr?.includes('للفرد') || addon.id === 'lunch';
                                const totalAddonCost = isPerPerson ? (addon.price * travelers) : addon.price;
                                if (isPerPerson && travelers > 1) {
                                  return `(+€${totalAddonCost} = €${addon.price} × ${travelers})`;
                                }
                                return `(+€${totalAddonCost})`;
                              })()}
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
                              ℹ️ <TranslatedText text={desc} />
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

                {/* Quick-select special request checkboxes from settings (filtered by trip's allowed requests if specified) */}
                {(() => {
                  const allowedRequestsParam = searchParams.get('allowedRequests');
                  let allowedRequests = null;
                  if (allowedRequestsParam) {
                    try { allowedRequests = JSON.parse(allowedRequestsParam); } catch (_) {}
                  }

                  const rawList = settings?.specialRequestsList || [];
                  const filteredList = (allowedRequests && Array.isArray(allowedRequests) && allowedRequests.length > 0)
                    ? rawList.filter(req => allowedRequests.includes(req.id) || allowedRequests.includes(req.labelAr) || allowedRequests.includes(req.labelEn))
                    : rawList;

                  if (filteredList.length === 0) return null;

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      {filteredList.map((req) => {
                        const label = locale === 'ar' ? (req.labelAr || req.labelEn) : (req.labelEn || req.labelAr);
                        const isChecked = specialRequests.includes(label);
                        return (
                        <label
                          key={req.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.88rem',
                            color: 'var(--text-secondary)',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            border: `1px solid ${isChecked ? 'var(--gold-500)' : 'var(--border-subtle)'}`,
                            background: isChecked ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)',
                            transition: 'all 0.15s ease',
                            flexDirection: locale === 'ar' ? 'row-reverse' : 'row',
                            userSelect: 'none',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSpecialRequests(prev => prev ? `${prev}, ${label}` : label);
                              } else {
                                setSpecialRequests(prev =>
                                  prev.split(', ').filter(r => r !== label).join(', ')
                                );
                              }
                            }}
                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--gold-500)' }}
                          />
                          <span>{label}</span>
                        </label>
                      );
                    })}
                    </div>
                  );
                })()}

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

              {/* Terms Checkbox with Electronic Signature */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  {(() => {
                    const openTerms = (e) => {
                      e.preventDefault();
                      setModalTitle(translate('readTerms'));
                      const isAr = locale === 'ar';
                      const text = isAr
                        ? (settings?.dataProtection || settings?.dataProtectionEn || 'لا توجد شروط.')
                        : (settings?.dataProtectionEn || settings?.dataProtection || 'No terms provided.');
                      setModalContent(text);
                      setShowTermsModal(true);
                    };
                    const openPolicy = (e) => {
                      e.preventDefault();
                      setModalTitle(translate('readPolicy'));
                      const isAr = locale === 'ar';
                      const text = isAr
                        ? (settings?.legalCancellation || settings?.legalCancellationEn || 'لا توجد سياسة.')
                        : (settings?.legalCancellationEn || settings?.legalCancellation || 'No policy provided.');
                      setModalContent(text);
                      setShowTermsModal(true);
                    };

                    if (locale === 'de') {
                      return (
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          Ich stimme den{' '}
                          <a href="#" onClick={openTerms} style={{ color: 'var(--gold-500)', textDecoration: 'underline' }}>
                            Allgemeinen Geschäftsbedingungen
                          </a>{' '}
                          und{' '}
                          <a href="#" onClick={openPolicy} style={{ color: 'var(--gold-500)', textDecoration: 'underline' }}>
                            Stornierungsbedingungen
                          </a>{' '}
                          zu.
                        </span>
                      );
                    }

                    if (locale === 'ar') {
                      return (
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          أوافق على{' '}
                          <a href="#" onClick={openTerms} style={{ color: 'var(--gold-500)', textDecoration: 'underline' }}>
                            الشروط والأحكام
                          </a>{' '}
                          و{' '}
                          <a href="#" onClick={openPolicy} style={{ color: 'var(--gold-500)', textDecoration: 'underline' }}>
                            سياسة الإلغاء
                          </a>
                        </span>
                      );
                    }

                    return (
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        I agree to the{' '}
                        <a href="#" onClick={openTerms} style={{ color: 'var(--gold-500)', textDecoration: 'underline' }}>
                          Terms &amp; Conditions
                        </a>{' '}
                        and{' '}
                        <a href="#" onClick={openPolicy} style={{ color: 'var(--gold-500)', textDecoration: 'underline' }}>
                          Cancellation Policy
                        </a>
                      </span>
                    );
                  })()}
                </label>

                {/* Electronic Signature Display */}
                {electronicSignature && (
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginTop: '0.5rem'
                  }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
                      {locale === 'ar' ? '📝 التوقيع الإلكتروني' : '📝 Electronic Signature'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <div><strong>{locale === 'ar' ? 'الاسم:' : 'Name:'}</strong> {electronicSignature.name}</div>
                      <div><strong>{locale === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}</strong> {electronicSignature.email}</div>
                      <div><strong>{locale === 'ar' ? 'التوقيع:' : 'Signature:'}</strong> {electronicSignature.name}</div>
                      <div><strong>{locale === 'ar' ? 'التاريخ والوقت:' : 'Date & Time:'}</strong> {new Date(electronicSignature.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                )}
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
            <h3 style={{ color: 'var(--gold-400)', marginBottom: '1.5rem', fontSize: '1.3rem', fontWeight: 'bold' }}>
              <TranslatedText text={modalTitle} />
            </h3>
            <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-wrap', maxHeight: '60vh', overflowY: 'auto', marginBottom: '2rem' }}>
              <TranslatedText text={modalContent} />
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
