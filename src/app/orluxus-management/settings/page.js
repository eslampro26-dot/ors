'use client';

import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '@/lib/db';
import { invalidateSettingsCache } from '@/hooks/useSettings';

export default function AdminSettings() {
  const [siteName, setSiteName] = useState('ORLUXUS');
  const [whatsapp, setWhatsapp] = useState('+20100000000');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [currency, setCurrency] = useState('Euro (€)');
  const [paypalEmail, setPaypalEmail] = useState('info@orluxus.com');
  const [paypalMe, setPaypalMe] = useState('https://paypal.me/orluxus');
  const [paypalAccountName, setPaypalAccountName] = useState('ORLUXUS Travel & Tourism');
  const [paypalInstructionsAr, setPaypalInstructionsAr] = useState('يرجى إرسال المبلغ عبر PayPal مع كتابة كود مرجع الحجز في الملاحظات ورفع صورة الإيصال.');
  const [paypalInstructionsEn, setPaypalInstructionsEn] = useState('Please send the transfer via PayPal with your Booking Reference in the note and upload a screenshot.');
  const [paypalEnabled, setPaypalEnabled] = useState(true);

  // Apple Pay Gateway Settings
  const [applePayEnabled, setApplePayEnabled] = useState(true);
  const [applePayMerchantId, setApplePayMerchantId] = useState('merchant.com.orluxus');
  const [applePayDisplayName, setApplePayDisplayName] = useState('ORLUXUS Travel & Tourism');
  const [applePayInstructionsAr, setApplePayInstructionsAr] = useState('ادفع بأمان وسرعة بلمسة واحدة أو عبر بصمة الوجه Face ID.');
  const [applePayInstructionsEn, setApplePayInstructionsEn] = useState('Pay securely and instantly with Face ID / Touch ID via Apple Pay.');

  // Google Pay Gateway Settings
  const [googlePayEnabled, setGooglePayEnabled] = useState(true);
  const [googlePayMerchantId, setGooglePayMerchantId] = useState('BCR2DN6TXXXXXX');
  const [googlePayMerchantName, setGooglePayMerchantName] = useState('ORLUXUS Travel & Tourism');
  const [googlePayInstructionsAr, setGooglePayInstructionsAr] = useState('ادفع بأمان وسرعة عبر بطاقاتك المحفوظة في Google Pay.');
  const [googlePayInstructionsEn, setGooglePayInstructionsEn] = useState('Pay securely and instantly using your cards saved in Google Pay.');

  // SMTP Email Settings
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [companyEmail, setCompanyEmail] = useState('info@orluxus.com');
  const [smtpTestStatus, setSmtpTestStatus] = useState(''); // '', 'testing', 'ok', 'fail'

  // Paytabs Payment Gateway Settings
  const [paytabsProfileId, setPaytabsProfileId] = useState('152340');
  const [paytabsServerKey, setPaytabsServerKey] = useState('S6J9TZWKZW-J92RJLWRLR-K92HRBZRKN');
  const [paytabsClientKey, setPaytabsClientKey] = useState('CMK2KG-HGPR6P-MR6BVR-KN7KNT');
  const [paytabsApiUrl, setPaytabsApiUrl] = useState('https://secure-egypt.paytabs.com/payment/request');
  const [paytabsEnabled, setPaytabsEnabled] = useState(true);
  const [paytabsTestStatus, setPaytabsTestStatus] = useState(''); // '', 'testing', 'ok', 'fail'
  const [paytabsTestMessage, setPaytabsTestMessage] = useState('');

  // Custom Direct Bank Payment Gateway Settings
  const defaultBankAccounts = [
    {
      id: 'bank_cib_eur',
      bankName: 'CIB Bank (البنك التجاري الدولي)',
      accountName: 'ORLUXUS LUXURY TRAVEL',
      accountNumber: '100045892147',
      iban: 'EG38001000450000100045892147',
      swift: 'CIBEEGCX',
      currency: 'EUR',
      country: 'Egypt 🇪🇬',
      instructionsAr: 'يرجى كتابة رقم الحجز (Booking Reference) في خانة الملاحظات عند التحويل.',
      instructionsEn: 'Please write the Booking ID in the transfer memo/description for instant verification.',
      instructionsDe: 'Bitte geben Sie die Buchungs-ID im Verwendungszweck an.',
      qrCodeUrl: '',
      logoUrl: '',
      isActive: true,
      displayOrder: 1
    }
  ];
  const [bankAccounts, setBankAccounts] = useState(defaultBankAccounts);
  const [customBankGatewayEnabled, setCustomBankGatewayEnabled] = useState(true);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [editingBankIndex, setEditingBankIndex] = useState(null);
  const [bankForm, setBankForm] = useState({
    id: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    iban: '',
    swift: '',
    currency: 'EUR',
    country: 'Egypt 🇪🇬',
    instructionsAr: '',
    instructionsEn: '',
    instructionsDe: '',
    qrCodeUrl: '',
    logoUrl: '',
    isActive: true,
    displayOrder: 1
  });

  // Custom Direct Visa & Card Gateway Settings
  const defaultCardAccounts = [
    {
      id: 'card_visa_eur',
      cardType: 'Visa',
      cardName: 'ORLUXUS Corporate Visa',
      accountName: 'ORLUXUS LUXURY TRAVEL',
      cardNumberMasked: '**** **** **** 4892',
      currency: 'EUR',
      bankName: 'CIB Bank (البنك التجاري الدولي)',
      country: 'Egypt 🇪🇬',
      instructionsAr: 'يرجى إدخال بيانات البطاقة لإتمام الدفع الآمن والمشفر بنسبة 100%.',
      instructionsEn: 'Enter your card details for 100% encrypted & secure payment.',
      isActive: true,
      displayOrder: 1
    }
  ];
  const [cardAccounts, setCardAccounts] = useState(defaultCardAccounts);
  const [customCardGatewayEnabled, setCustomCardGatewayEnabled] = useState(true);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editingCardIndex, setEditingCardIndex] = useState(null);
  const [cardForm, setCardForm] = useState({
    id: '',
    cardType: 'Visa',
    cardName: '',
    accountName: 'ORLUXUS LUXURY TRAVEL',
    cardNumberMasked: '',
    currency: 'EUR',
    bankName: '',
    country: 'Egypt 🇪🇬',
    instructionsAr: 'يرجى إدخال بيانات البطاقة لإتمام الدفع الآمن والمشفر بنسبة 100%.',
    instructionsEn: 'Enter your card details for 100% encrypted & secure payment.',
    isActive: true,
    displayOrder: 1
  });
  
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
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');

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
          if (data.paytabsClientKey) setPaytabsClientKey(data.paytabsClientKey);
          if (data.paytabsApiUrl) setPaytabsApiUrl(data.paytabsApiUrl);
          if (data.paytabsEnabled !== undefined) setPaytabsEnabled(data.paytabsEnabled === true || data.paytabsEnabled === 'true');
          
          // Direct PayPal Gateway Settings
          if (data.paypalEmail) setPaypalEmail(data.paypalEmail);
          if (data.paypalMe) setPaypalMe(data.paypalMe);
          if (data.paypalAccountName) setPaypalAccountName(data.paypalAccountName);
          if (data.paypalInstructionsAr) setPaypalInstructionsAr(data.paypalInstructionsAr);
          if (data.paypalInstructionsEn) setPaypalInstructionsEn(data.paypalInstructionsEn);
          if (data.paypalEnabled !== undefined) setPaypalEnabled(data.paypalEnabled === true || data.paypalEnabled === 'true');

          // Direct Bank Accounts Gateway Settings
          if (data.bankAccounts && Array.isArray(data.bankAccounts) && data.bankAccounts.length > 0) {
            setBankAccounts(data.bankAccounts);
          }
          if (data.customBankGatewayEnabled !== undefined) {
            setCustomBankGatewayEnabled(data.customBankGatewayEnabled === true || data.customBankGatewayEnabled === 'true');
          }

          // Direct Visa & Card Accounts Gateway Settings
          if (data.cardAccounts && Array.isArray(data.cardAccounts) && data.cardAccounts.length > 0) {
            setCardAccounts(data.cardAccounts);
          }
          if (data.customCardGatewayEnabled !== undefined) {
            setCustomCardGatewayEnabled(data.customCardGatewayEnabled === true || data.customCardGatewayEnabled === 'true');
          }

          // Apple Pay Gateway Settings
          if (data.applePayMerchantId) setApplePayMerchantId(data.applePayMerchantId);
          if (data.applePayDisplayName) setApplePayDisplayName(data.applePayDisplayName);
          if (data.applePayInstructionsAr) setApplePayInstructionsAr(data.applePayInstructionsAr);
          if (data.applePayInstructionsEn) setApplePayInstructionsEn(data.applePayInstructionsEn);
          if (data.applePayEnabled !== undefined) setApplePayEnabled(data.applePayEnabled === true || data.applePayEnabled === 'true');

          // Google Pay Gateway Settings
          if (data.googlePayMerchantId) setGooglePayMerchantId(data.googlePayMerchantId);
          if (data.googlePayMerchantName) setGooglePayMerchantName(data.googlePayMerchantName);
          if (data.googlePayInstructionsAr) setGooglePayInstructionsAr(data.googlePayInstructionsAr);
          if (data.googlePayInstructionsEn) setGooglePayInstructionsEn(data.googlePayInstructionsEn);
          if (data.googlePayEnabled !== undefined) setGooglePayEnabled(data.googlePayEnabled === true || data.googlePayEnabled === 'true');

          if (data.allowReg !== undefined) setAllowReg(data.allowReg === true || data.allowReg === 'true');
          if (data.allowPromo !== undefined) setAllowPromo(data.allowPromo === true || data.allowPromo === 'true');
          if (data.notifyEmail !== undefined) setNotifyEmail(data.notifyEmail === true || data.notifyEmail === 'true');
          if (data.commission) setCommission(data.commission);

          if (data.email) setEmail(data.email);
          if (data.facebook) setFacebook(data.facebook);
          if (data.tiktok) setTiktok(data.tiktok);
          if (data.instagram) setInstagram(data.instagram);
          if (data.googleReviewUrl !== undefined) setGoogleReviewUrl(data.googleReviewUrl || '');

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
          paypalMe,
          paypalAccountName,
          paypalInstructionsAr,
          paypalInstructionsEn,
          paypalEnabled,
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
          paytabsClientKey,
          paytabsApiUrl,
          paytabsEnabled,
          bankAccounts,
          customBankGatewayEnabled,
          cardAccounts,
          customCardGatewayEnabled,
          applePayEnabled,
          applePayMerchantId,
          applePayDisplayName,
          applePayInstructionsAr,
          applePayInstructionsEn,
          googlePayEnabled,
          googlePayMerchantId,
          googlePayMerchantName,
          googlePayInstructionsAr,
          googlePayInstructionsEn,
        })
      });
      if (res.ok) {
        invalidateSettingsCache();
        alert('✅ All settings saved successfully in the database!');
      } else {
        alert('❌ Failed to save settings!');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('❌ Failed to save settings!');
    }
  };

  // Test Paytabs Connection Live Handshake
  const handleTestPaytabs = async () => {
    setPaytabsTestStatus('testing');
    setPaytabsTestMessage('');
    try {
      const res = await fetch('/api/paytabs/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: paytabsProfileId,
          serverKey: paytabsServerKey,
          apiUrl: paytabsApiUrl
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPaytabsTestStatus('ok');
        setPaytabsTestMessage(data.message || '✅ PayTabs connection successful! Ready for live payments.');
      } else {
        setPaytabsTestStatus('fail');
        setPaytabsTestMessage(`⚠️ PayTabs Response: ${data.error || 'Connection failed. Please check Server Key.'}`);
      }
    } catch (e) {
      setPaytabsTestStatus('fail');
      setPaytabsTestMessage(`❌ Network error: ${e.message}`);
    }
  };

  // Save Payment Gateways Settings Specifically
  const handleSaveBankSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankAccounts,
          customBankGatewayEnabled,
          cardAccounts,
          customCardGatewayEnabled,
          applePayEnabled,
          applePayMerchantId,
          applePayDisplayName,
          applePayInstructionsAr,
          applePayInstructionsEn,
          googlePayEnabled,
          googlePayMerchantId,
          googlePayMerchantName,
          googlePayInstructionsAr,
          googlePayInstructionsEn,
        })
      });
      if (res.ok) {
        invalidateSettingsCache();
        alert('✅ Payment accounts & gateway settings saved successfully!');
      } else {
        alert('❌ Failed to save payment accounts!');
      }
    } catch (err) {
      console.error('Error saving bank settings:', err);
      alert('❌ Failed to save payment accounts!');
    }
  };

  // Bank Modal Handlers
  const handleOpenAddBank = () => {
    setEditingBankIndex(null);
    setBankForm({
      id: `bank_${Date.now()}`,
      bankName: '',
      accountName: 'ORLUXUS LUXURY TRAVEL',
      accountNumber: '',
      iban: '',
      swift: '',
      currency: 'EUR',
      country: 'Egypt 🇪🇬',
      instructionsAr: 'يرجى كتابة رقم الحجز في خانة الملاحظات عند التحويل.',
      instructionsEn: 'Please write the Booking ID in the transfer memo/description.',
      instructionsDe: 'Bitte geben Sie die Buchungs-ID im Verwendungszweck an.',
      qrCodeUrl: '',
      logoUrl: '',
      isActive: true,
      displayOrder: bankAccounts.length + 1
    });
    setBankModalOpen(true);
  };

  const handleOpenEditBank = (idx) => {
    setEditingBankIndex(idx);
    setBankForm({ ...bankAccounts[idx] });
    setBankModalOpen(true);
  };

  const handleSaveBankModal = () => {
    if (!bankForm.bankName || !bankForm.accountName || (!bankForm.iban && !bankForm.accountNumber)) {
      alert('Please fill in Bank Name, Account Name, and IBAN / Account Number!');
      return;
    }

    let updated = [...bankAccounts];
    if (editingBankIndex !== null) {
      updated[editingBankIndex] = bankForm;
    } else {
      updated.push(bankForm);
    }
    setBankAccounts(updated);
    setBankModalOpen(false);
  };

  const handleDeleteBank = (idx) => {
    if (confirm('Are you sure you want to delete this bank account?')) {
      const updated = bankAccounts.filter((_, i) => i !== idx);
      setBankAccounts(updated);
    }
  };

  const handleToggleBankActive = (idx) => {
    const updated = [...bankAccounts];
    updated[idx] = { ...updated[idx], isActive: !updated[idx].isActive };
    setBankAccounts(updated);
  };

  // Visa & Card Modal Handlers
  const handleOpenAddCard = () => {
    setEditingCardIndex(null);
    setCardForm({
      id: `card_${Date.now()}`,
      cardType: 'Visa',
      cardName: '',
      accountName: 'ORLUXUS LUXURY TRAVEL',
      cardNumberMasked: '',
      currency: 'EUR',
      bankName: '',
      country: 'Egypt 🇪🇬',
      instructionsAr: 'يرجى إدخال بيانات البطاقة لإتمام الدفع الآمن والمشفر بنسبة 100%.',
      instructionsEn: 'Enter your card details for 100% encrypted & secure payment.',
      isActive: true,
      displayOrder: cardAccounts.length + 1
    });
    setCardModalOpen(true);
  };

  const handleOpenEditCard = (idx) => {
    setEditingCardIndex(idx);
    setCardForm({ ...cardAccounts[idx] });
    setCardModalOpen(true);
  };

  const handleSaveCardModal = () => {
    if (!cardForm.cardName || !cardForm.accountName) {
      alert('Please fill in Card/Account Name and Cardholder Name!');
      return;
    }

    let updated = [...cardAccounts];
    if (editingCardIndex !== null) {
      updated[editingCardIndex] = cardForm;
    } else {
      updated.push(cardForm);
    }
    setCardAccounts(updated);
    setCardModalOpen(false);
  };

  const handleDeleteCard = (idx) => {
    if (confirm('Are you sure you want to delete this Card/Visa configuration?')) {
      const updated = cardAccounts.filter((_, i) => i !== idx);
      setCardAccounts(updated);
    }
  };

  const handleToggleCardActive = (idx) => {
    const updated = [...cardAccounts];
    updated[idx] = { ...updated[idx], isActive: !updated[idx].isActive };
    setCardAccounts(updated);
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
            instagram,
            googleReviewUrl
          }
        })
      });
      if (res.ok) {
        invalidateSettingsCache();
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
        invalidateSettingsCache();
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
        <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.16s', border: '1px solid rgba(59,130,246,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5rem' }}>💳</span>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.15rem' }}>Paytabs Payment Gateway</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>بوابة الدفع الإلكتروني الرسمية للفيزا والماستركارد مع تأكيد OTP التلقائي</span>
              </div>
            </div>
            <span style={{ background: paytabsEnabled ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: paytabsEnabled ? '#10b981' : '#ef4444', border: paytabsEnabled ? '1px solid #10b981' : '1px solid #ef4444', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
              {paytabsEnabled ? '✓ Enabled (نشط)' : '✕ Disabled (معطل)'}
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Enable Paytabs Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(59,130,246,0.06)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)' }}>
              <input 
                type="checkbox" 
                checked={paytabsEnabled}
                onChange={(e) => setPaytabsEnabled(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                id="paytabsToggle"
              />
              <label htmlFor="paytabsToggle" style={{ display: 'block', cursor: 'pointer' }}>
                <span style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 'bold' }}>تفعيل بوابة Paytabs للدفع بالفيزا والبطاقات</span>
                <span style={{ display: 'block', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>يسمح للعملاء بالدفع الفوري ببطاقاتهم مع خصم المبلغ وإيداعه في حسابك البنكي تلقائياً</span>
              </label>
            </div>

            {/* Paytabs Profile ID */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.88rem' }}>
                🔑 Paytabs Profile ID (معرف الحساب):
              </label>
              <input 
                type="text" 
                value={paytabsProfileId} 
                onChange={(e) => setPaytabsProfileId(e.target.value)}
                placeholder="152340"
                autoComplete="off"
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  background: 'rgba(255,255,255,0.04)', 
                  color: 'white', 
                  border: '1px solid var(--border-medium)', 
                  borderRadius: '6px', 
                  outline: 'none',
                  fontFamily: 'var(--font-en)',
                  fontSize: '0.95rem'
                }} 
              />
            </div>

            {/* Paytabs Server Key */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.88rem' }}>
                🔒 Paytabs Server Key (مفتاح السيرفر):
              </label>
              <input 
                type="text" 
                value={paytabsServerKey} 
                onChange={(e) => setPaytabsServerKey(e.target.value)}
                placeholder="S6J9TZMKZW-J92RJLWRLL-K92HRBZRKN"
                autoComplete="off"
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  background: 'rgba(255,255,255,0.04)', 
                  color: 'white', 
                  border: '1px solid var(--border-medium)', 
                  borderRadius: '6px', 
                  outline: 'none',
                  fontFamily: 'var(--font-en)',
                  fontSize: '0.92rem'
                }} 
              />
            </div>

            {/* Paytabs Client Key */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.88rem' }}>
                🌐 Paytabs Client Key (المفتاح العام):
              </label>
              <input 
                type="text" 
                value={paytabsClientKey} 
                onChange={(e) => setPaytabsClientKey(e.target.value)}
                placeholder="CMK2KG-HGPR6P-MR6BVR-KN7KNT"
                autoComplete="off"
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  background: 'rgba(255,255,255,0.04)', 
                  color: 'white', 
                  border: '1px solid var(--border-medium)', 
                  borderRadius: '6px', 
                  outline: 'none',
                  fontFamily: 'var(--font-en)',
                  fontSize: '0.92rem'
                }} 
              />
            </div>

            {/* Paytabs API URL / Region Selector */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.88rem' }}>
                🌍 Paytabs API Endpoint (سيرفر المنطقة):
              </label>
              
              {/* Region Presets */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => setPaytabsApiUrl('https://secure-egypt.paytabs.com/payment/request')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    borderRadius: '6px',
                    background: paytabsApiUrl.includes('secure-egypt') ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                    border: paytabsApiUrl.includes('secure-egypt') ? '1px solid #3b82f6' : '1px solid var(--border-medium)',
                    color: paytabsApiUrl.includes('secure-egypt') ? '#93c5fd' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🇪🇬 Egypt (مصر)
                </button>
                <button
                  type="button"
                  onClick={() => setPaytabsApiUrl('https://secure.paytabs.com/payment/request')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    borderRadius: '6px',
                    background: paytabsApiUrl === 'https://secure.paytabs.com/payment/request' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                    border: paytabsApiUrl === 'https://secure.paytabs.com/payment/request' ? '1px solid #3b82f6' : '1px solid var(--border-medium)',
                    color: paytabsApiUrl === 'https://secure.paytabs.com/payment/request' ? '#93c5fd' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🌍 Global / UAE (دولي / الإمارات)
                </button>
                <button
                  type="button"
                  onClick={() => setPaytabsApiUrl('https://secure.paytabs.sa/payment/request')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    borderRadius: '6px',
                    background: paytabsApiUrl.includes('paytabs.sa') ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                    border: paytabsApiUrl.includes('paytabs.sa') ? '1px solid #3b82f6' : '1px solid var(--border-medium)',
                    color: paytabsApiUrl.includes('paytabs.sa') ? '#93c5fd' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🇸🇦 Saudi Arabia (السعودية)
                </button>
              </div>

              <input 
                type="url" 
                value={paytabsApiUrl} 
                onChange={(e) => setPaytabsApiUrl(e.target.value)}
                placeholder="https://secure-egypt.paytabs.com/payment/request"
                autoComplete="off"
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  background: 'rgba(255,255,255,0.04)', 
                  color: 'white', 
                  border: '1px solid var(--border-medium)', 
                  borderRadius: '6px', 
                  outline: 'none',
                  fontFamily: 'var(--font-en)',
                  fontSize: '0.88rem'
                }} 
              />
            </div>

            {/* Test Status Banner */}
            {paytabsTestMessage && (
              <div style={{
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                lineHeight: '1.4',
                background: paytabsTestStatus === 'ok' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                border: paytabsTestStatus === 'ok' ? '1px solid #10b981' : '1px solid #ef4444',
                color: paytabsTestStatus === 'ok' ? '#4ade80' : '#f87171'
              }}>
                {paytabsTestMessage}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <button 
                onClick={handleSaveSettings} 
                className="btn btn-primary" 
                style={{ 
                  flex: 1,
                  padding: '0.8rem 1.2rem', 
                  fontWeight: 'bold'
                }}
              >
                💾 Save Paytabs Settings
              </button>
              <button 
                type="button"
                onClick={handleTestPaytabs} 
                className="btn btn-secondary" 
                style={{ 
                  padding: '0.8rem 1.2rem', 
                  background: paytabsTestStatus === 'ok' ? '#10b981' : paytabsTestStatus === 'fail' ? '#ef4444' : 'rgba(59,130,246,0.15)',
                  color: paytabsTestStatus === 'ok' || paytabsTestStatus === 'fail' ? 'white' : '#93c5fd',
                  borderColor: '#3b82f6',
                  fontWeight: 'bold'
                }}
                disabled={paytabsTestStatus === 'testing'}
              >
                {paytabsTestStatus === 'testing' ? '⏳ Testing...' : '⚡ Test Connection'}
              </button>
            </div>
          </div>
        </div>

        {/* Direct PayPal Transfer Gateway (بوابة الدفع المباشر عبر باي بال) */}
        <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.17s', gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem' }}>
            <div>
              <h3 style={{ color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                🅿️ PayPal Direct Payment Gateway
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                بوابة الدفع والتحويل المباشر عبر حساب باي بال الرسمي
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* Enable PayPal Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <input 
                type="checkbox" 
                checked={paypalEnabled}
                onChange={(e) => setPaypalEnabled(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                id="enablePayPalGatewayToggle"
              />
              <label htmlFor="enablePayPalGatewayToggle" style={{ cursor: 'pointer' }}>
                <span style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                  Enable PayPal Gateway at Checkout
                </span>
                <span style={{ display: 'block', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                  تفعيل خيار الدفع والتحويل المباشر عبر PayPal في صفحة إتمام الحجز
                </span>
              </label>
            </div>

            {/* Recipient PayPal Email */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                Official Company PayPal Email (بريد باي بال الرسمي)
              </label>
              <input 
                type="email" 
                value={paypalEmail} 
                onChange={(e) => setPaypalEmail(e.target.value)}
                placeholder="billing@orluxus.com"
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

            {/* PayPal.Me Link or Handle */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                PayPal.me Direct Link / Username (رابط الدفع السريع)
              </label>
              <input 
                type="text" 
                value={paypalMe} 
                onChange={(e) => setPaypalMe(e.target.value)}
                placeholder="https://paypal.me/orluxus"
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

            {/* Account / Business Name */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                PayPal Business Name (اسم الحساب التجاري)
              </label>
              <input 
                type="text" 
                value={paypalAccountName} 
                onChange={(e) => setPaypalAccountName(e.target.value)}
                placeholder="ORLUXUS Travel Group"
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

            {/* Arabic Instructions */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                Customer Transfer Instructions (Arabic - تعليمات العميل بالعربية)
              </label>
              <textarea 
                rows={2}
                value={paypalInstructionsAr} 
                onChange={(e) => setPaypalInstructionsAr(e.target.value)}
                placeholder="يرجى إرسال المبلغ عبر PayPal مع كتابة كود الحجز في الملاحظات ورفع لقطة شاشة للإيصال."
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  background: 'rgba(255,255,255,0.04)', 
                  color: 'white', 
                  border: '1px solid var(--border-medium)', 
                  borderRadius: '6px',
                  outline: 'none',
                  resize: 'vertical'
                }} 
              />
            </div>

            {/* English Instructions */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                Customer Transfer Instructions (English)
              </label>
              <textarea 
                rows={2}
                value={paypalInstructionsEn} 
                onChange={(e) => setPaypalInstructionsEn(e.target.value)}
                placeholder="Please include your Booking Reference in the payment memo and upload the screenshot."
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  background: 'rgba(255,255,255,0.04)', 
                  color: 'white', 
                  border: '1px solid var(--border-medium)', 
                  borderRadius: '6px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'var(--font-en)'
                }} 
              />
            </div>

            <button 
              onClick={handleSaveSettings} 
              className="btn btn-primary" 
              style={{ 
                padding: '0.8rem 1.2rem', 
                fontWeight: 'bold',
                marginTop: '0.5rem'
              }}
            >
              💾 Save PayPal Settings
            </button>
          </div>
        </div>


        {/* Apple Pay Gateway Card */}
        <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.15s', gridColumn: 'span 1', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>🍏</span>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.15rem' }}>Apple Pay Gateway</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>إعدادات وحساب استقبال مدفوعات Apple Pay</span>
              </div>
            </div>
            <span style={{ background: applePayEnabled ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: applePayEnabled ? '#10b981' : '#ef4444', border: applePayEnabled ? '1px solid #10b981' : '1px solid #ef4444', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
              {applePayEnabled ? '✓ Enabled' : '✕ Disabled'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Enable Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <input
                type="checkbox"
                checked={applePayEnabled}
                onChange={(e) => setApplePayEnabled(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--gold-500)' }}
                id="enableApplePayGatewayToggle"
              />
              <label htmlFor="enableApplePayGatewayToggle" style={{ cursor: 'pointer', color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>
                تفعيل الدفع عبر Apple Pay في صفحة الدفع (Checkout)
              </label>
            </div>

            {/* Merchant Identifier */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                🍏 Apple Pay Merchant Identifier:
              </label>
              <input
                type="text"
                value={applePayMerchantId}
                onChange={(e) => setApplePayMerchantId(e.target.value)}
                placeholder="merchant.com.orluxus"
                style={{ width: '100%', padding: '10px 14px', background: '#172033', color: '#ffffff', border: '1.5px solid #475569', borderRadius: '6px', outline: 'none', fontFamily: 'var(--font-en)' }}
              />
            </div>

            {/* Display Name */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                🏢 Merchant Display Name (اسم التاجر الظاهر للعميل):
              </label>
              <input
                type="text"
                value={applePayDisplayName}
                onChange={(e) => setApplePayDisplayName(e.target.value)}
                placeholder="ORLUXUS Travel & Tourism"
                style={{ width: '100%', padding: '10px 14px', background: '#172033', color: '#ffffff', border: '1.5px solid #475569', borderRadius: '6px', outline: 'none' }}
              />
            </div>

            {/* Instructions Arabic */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                🇸🇦 تعليمات الدفع للعميل (بالعربية):
              </label>
              <textarea
                value={applePayInstructionsAr}
                onChange={(e) => setApplePayInstructionsAr(e.target.value)}
                rows="2"
                style={{ width: '100%', padding: '8px 12px', background: '#172033', color: '#ffffff', border: '1.5px solid #475569', borderRadius: '6px', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <button
              type="button"
              onClick={handleSaveBankSettings}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #111827, #374151)' }}
            >
              💾 Save Apple Pay Settings
            </button>
          </div>
        </div>

        {/* Google Pay Gateway Card */}
        <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.18s', gridColumn: 'span 1', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>🤖</span>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.15rem' }}>Google Pay Gateway</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>إعدادات وحساب استقبال مدفوعات Google Pay</span>
              </div>
            </div>
            <span style={{ background: googlePayEnabled ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: googlePayEnabled ? '#10b981' : '#ef4444', border: googlePayEnabled ? '1px solid #10b981' : '1px solid #ef4444', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
              {googlePayEnabled ? '✓ Enabled' : '✕ Disabled'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Enable Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <input
                type="checkbox"
                checked={googlePayEnabled}
                onChange={(e) => setGooglePayEnabled(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--gold-500)' }}
                id="enableGooglePayGatewayToggle"
              />
              <label htmlFor="enableGooglePayGatewayToggle" style={{ cursor: 'pointer', color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>
                تفعيل الدفع عبر Google Pay في صفحة الدفع (Checkout)
              </label>
            </div>

            {/* Merchant Identifier */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                🤖 Google Pay Merchant ID:
              </label>
              <input
                type="text"
                value={googlePayMerchantId}
                onChange={(e) => setGooglePayMerchantId(e.target.value)}
                placeholder="BCR2DN6TXXXXXX"
                style={{ width: '100%', padding: '10px 14px', background: '#172033', color: '#ffffff', border: '1.5px solid #475569', borderRadius: '6px', outline: 'none', fontFamily: 'var(--font-en)' }}
              />
            </div>

            {/* Merchant Name */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                🏢 Google Pay Merchant Name (اسم التاجر الظاهر للعميل):
              </label>
              <input
                type="text"
                value={googlePayMerchantName}
                onChange={(e) => setGooglePayMerchantName(e.target.value)}
                placeholder="ORLUXUS Travel & Tourism"
                style={{ width: '100%', padding: '10px 14px', background: '#172033', color: '#ffffff', border: '1.5px solid #475569', borderRadius: '6px', outline: 'none' }}
              />
            </div>

            {/* Instructions Arabic */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                🇸🇦 تعليمات الدفع للعميل (بالعربية):
              </label>
              <textarea
                value={googlePayInstructionsAr}
                onChange={(e) => setGooglePayInstructionsAr(e.target.value)}
                rows="2"
                style={{ width: '100%', padding: '8px 12px', background: '#172033', color: '#ffffff', border: '1.5px solid #475569', borderRadius: '6px', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <button
              type="button"
              onClick={handleSaveBankSettings}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}
            >
              💾 Save Google Pay Settings
            </button>
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

            {/* Google Business Review Link */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>⭐ Google Business Review Link</label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                Paste your Google Business review URL here. Clients will be redirected directly to leave a Google review.
                To get your link: <strong style={{ color: 'var(--gold-400)' }}>Google Maps → Your Business Profile → Get more reviews → Copy link</strong>
              </p>
              <input
                type="url"
                value={googleReviewUrl}
                onChange={(e) => setGoogleReviewUrl(e.target.value)}
                placeholder="https://g.page/r/XXXX/review"
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
              {googleReviewUrl && (
                <a
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--gold-400)', textDecoration: 'underline' }}
                >
                  ↗ Test link
                </a>
              )}
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

      {/* Bank Account Modal (High Contrast & Crystal-Clear White Text) */}
      {bankModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          backdropFilter: 'blur(8px)',
          padding: '1rem'
        }}>
          <div style={{
            background: '#0d121d',
            border: '2px solid var(--gold-500)',
            borderRadius: '14px',
            padding: '2rem',
            width: '100%',
            maxWidth: '580px',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
            boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
            color: '#ffffff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212,175,55,0.3)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ color: '#fbbf24', margin: 0, fontSize: '1.3rem', fontWeight: '800' }}>
                  {editingBankIndex !== null ? '✏️ Edit Bank Account (تعديل الحساب البنكي)' : '➕ Add New Bank Account (إضافة حساب بنكي جديد)'}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                  Enter your official corporate bank account information clearly
                </span>
              </div>
              <button 
                onClick={() => setBankModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#ffffff', fontSize: '1.2rem', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Bank Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#ffffff', marginBottom: '6px', fontWeight: '700' }}>
                  🏛️ Bank Name (اسم البنك) *
                </label>
                <input
                  type="text"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  placeholder="e.g. CIB Bank, Banque Misr, QNB, Deutsche Bank"
                  style={{ width: '100%', padding: '10px 14px', background: '#172033', border: '1.5px solid #475569', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>

              {/* Account Holder Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#ffffff', marginBottom: '6px', fontWeight: '700' }}>
                  👤 Account Holder Name (اسم المستفيد / صاحب الحساب) *
                </label>
                <input
                  type="text"
                  value={bankForm.accountName}
                  onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                  placeholder="e.g. ORLUXUS LUXURY TRAVEL"
                  style={{ width: '100%', padding: '10px 14px', background: '#172033', border: '1.5px solid #475569', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>

              {/* Currency & Country */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#ffffff', marginBottom: '6px', fontWeight: '700' }}>
                    💰 Currency (العملة)
                  </label>
                  <select
                    value={bankForm.currency}
                    onChange={(e) => setBankForm({ ...bankForm, currency: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: '#172033', border: '1.5px solid #475569', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EGP">EGP (جنيه)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AED">AED (درهم)</option>
                    <option value="SAR">SAR (ريال)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#ffffff', marginBottom: '6px', fontWeight: '700' }}>
                    🌍 Country (الدولة)
                  </label>
                  <input
                    type="text"
                    value={bankForm.country}
                    onChange={(e) => setBankForm({ ...bankForm, country: e.target.value })}
                    placeholder="e.g. Egypt 🇪🇬, Germany 🇩🇪"
                    style={{ width: '100%', padding: '10px 14px', background: '#172033', border: '1.5px solid #475569', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem', outline: 'none' }}
                  />
                </div>
              </div>

              {/* IBAN / Account Number */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#ffffff', marginBottom: '6px', fontWeight: '700' }}>
                  🔢 IBAN / Account Number (رقم الآيبان أو رقم الحساب) *
                </label>
                <input
                  type="text"
                  value={bankForm.iban}
                  onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value.toUpperCase().replace(/\s+/g, ' ') })}
                  placeholder="e.g. EG38001000450000100045892147"
                  style={{ width: '100%', padding: '10px 14px', background: '#172033', border: '1.5px solid #475569', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem', fontFamily: 'var(--font-en)', outline: 'none' }}
                />
              </div>

              {/* SWIFT / BIC Code */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#ffffff', marginBottom: '6px', fontWeight: '700' }}>
                  🌐 SWIFT / BIC Code (رمز السويفت)
                </label>
                <input
                  type="text"
                  value={bankForm.swift}
                  onChange={(e) => setBankForm({ ...bankForm, swift: e.target.value.toUpperCase().trim() })}
                  placeholder="e.g. CIBEEGCX"
                  style={{ width: '100%', padding: '10px 14px', background: '#172033', border: '1.5px solid #475569', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem', fontFamily: 'var(--font-en)', outline: 'none' }}
                />
              </div>

              {/* Transfer Instructions Arabic */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#ffffff', marginBottom: '6px', fontWeight: '700' }}>
                  📝 Transfer Instructions (تعليمات التحويل للعميل بالعربية)
                </label>
                <textarea
                  rows={2}
                  value={bankForm.instructionsAr}
                  onChange={(e) => setBankForm({ ...bankForm, instructionsAr: e.target.value })}
                  placeholder="يرجى كتابة كود الحجز في الملاحظات عند التحويل ورفع صورة الإيصال..."
                  style={{ width: '100%', padding: '10px 14px', background: '#172033', border: '1.5px solid #475569', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                />
              </div>

              {/* Transfer Instructions English */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#ffffff', marginBottom: '6px', fontWeight: '700' }}>
                  📝 Transfer Instructions (English)
                </label>
                <textarea
                  rows={2}
                  value={bankForm.instructionsEn}
                  onChange={(e) => setBankForm({ ...bankForm, instructionsEn: e.target.value })}
                  placeholder="Please write the booking reference code in the transfer description..."
                  style={{ width: '100%', padding: '10px 14px', background: '#172033', border: '1.5px solid #475569', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem', fontFamily: 'var(--font-en)', outline: 'none', resize: 'vertical' }}
                />
              </div>

              {/* Active Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155' }}>
                <input
                  type="checkbox"
                  checked={bankForm.isActive}
                  onChange={(e) => setBankForm({ ...bankForm, isActive: e.target.checked })}
                  id="modalBankActive"
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="modalBankActive" style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}>
                  Active &amp; visible to clients at checkout (تفعيل الحساب ليظهر للعملاء في الدفع)
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', borderTop: '1px solid #334155', paddingTop: '1.2rem' }}>
              <button
                type="button"
                onClick={() => setBankModalOpen(false)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '10px', color: '#cbd5e1', borderColor: '#475569' }}
              >
                Cancel (إلغاء)
              </button>
              <button
                type="button"
                onClick={handleSaveBankModal}
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px', fontWeight: '800', fontSize: '1rem' }}
              >
                💾 Save Bank Account (حفظ الحساب)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visa & Card Account Modal (High Contrast & Crystal-Clear White Text) */}
      {cardModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          backdropFilter: 'blur(8px)',
          padding: '1rem'
        }}>
          <div style={{
            background: '#0d121d',
            border: '2px solid #3b82f6',
            borderRadius: '14px',
            padding: '2rem',
            width: '100%',
            maxWidth: '580px',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
            boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
            color: '#ffffff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(59,130,246,0.3)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ color: '#60a5fa', margin: 0, fontSize: '1.3rem', fontWeight: '800' }}>
                  {editingCardIndex !== null ? '✏️ Edit Card / Visa Account (تعديل حساب الفيزا/البطاقة)' : '➕ Add Visa / Card Account (إضافة حساب فيزا وبطاقة جديد)'}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                  Configure multiple merchant or direct Visa/Mastercard payment options
                </span>
              </div>
              <button 
                onClick={() => setCardModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#ffffff', fontSize: '1.2rem', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Card / Gateway Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#ffffff', marginBottom: '6px', fontWeight: '700' }}>
                  💳 Card / Account Name (اسم البطاقة أو بوابة الفيزا) *
                </label>
                <input
                  type="text"
                  value={cardForm.cardName}
                  onChange={(e) => setCardForm({ ...cardForm, cardName: e.target.value })}
                  placeholder="e.g. ORLUXUS Corporate Visa, VIP Mastercard, Direct Merchant Card"
                  style={{ width: '100%', padding: '10px 14px', background: '#172033', border: '1.5px solid #475569', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>

              {/* Card Type & Currency */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#ffffff', marginBottom: '6px', fontWeight: '700' }}>
                    🏷️ Card Type (نوع البطاقة)
                  </label>
                  <select
                    value={cardForm.cardType}
                    onChange={(e) => setCardForm({ ...cardForm, cardType: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: '#172033', border: '1.5px solid #475569', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="Visa">Visa (فيزا)</option>
                    <option value="Mastercard">Mastercard (ماستركارد)</option>
                    <option value="Visa / Mastercard">Visa / Mastercard</option>
                    <option value="American Express">American Express (AMEX)</option>
                    <option value="Debit Card">Debit / Mada Card</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#ffffff', marginBottom: '6px', fontWeight: '700' }}>
                    💰 Currency (العملة)
                  </label>
                  <select
                    value={cardForm.currency}
                    onChange={(e) => setCardForm({ ...cardForm, currency: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: '#172033', border: '1.5px solid #475569', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EGP">EGP (جنيه)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AED">AED (درهم)</option>
                    <option value="SAR">SAR (ريال)</option>
                  </select>
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#ffffff', marginBottom: '6px', fontWeight: '700' }}>
                  👤 Cardholder / Merchant Name (اسم المستفيد أو التاجر) *
                </label>
                <input
                  type="text"
                  value={cardForm.accountName}
                  onChange={(e) => setCardForm({ ...cardForm, accountName: e.target.value })}
                  placeholder="e.g. ORLUXUS LUXURY TRAVEL"
                  style={{ width: '100%', padding: '10px 14px', background: '#172033', border: '1.5px solid #475569', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>

              {/* Bank / Issuer & Country */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#ffffff', marginBottom: '6px', fontWeight: '700' }}>
                    🏛️ Bank / Issuer (البنك / جهة الإصدار)
                  </label>
                  <input
                    type="text"
                    value={cardForm.bankName}
                    onChange={(e) => setCardForm({ ...cardForm, bankName: e.target.value })}
                    placeholder="e.g. CIB, NBE, Deutsche Bank"
                    style={{ width: '100%', padding: '10px 14px', background: '#172033', border: '1.5px solid #475569', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#ffffff', marginBottom: '6px', fontWeight: '700' }}>
                    🌍 Country (الدولة)
                  </label>
                  <input
                    type="text"
                    value={cardForm.country}
                    onChange={(e) => setCardForm({ ...cardForm, country: e.target.value })}
                    placeholder="e.g. Egypt 🇪🇬, UAE 🇦🇪"
                    style={{ width: '100%', padding: '10px 14px', background: '#172033', border: '1.5px solid #475569', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Masked Card Reference / Number */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#ffffff', marginBottom: '6px', fontWeight: '700' }}>
                  🔢 Card Masked Display / Ref Number (رقم أو رمز البطاقة التعريفي)
                </label>
                <input
                  type="text"
                  value={cardForm.cardNumberMasked}
                  onChange={(e) => setCardForm({ ...cardForm, cardNumberMasked: e.target.value })}
                  placeholder="e.g. **** **** **** 4892"
                  style={{ width: '100%', padding: '10px 14px', background: '#172033', border: '1.5px solid #475569', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem', fontFamily: 'var(--font-en)', outline: 'none' }}
                />
              </div>

              {/* Instructions Arabic */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#ffffff', marginBottom: '6px', fontWeight: '700' }}>
                  📝 Payment Instructions (تعليمات الدفع بالعربية)
                </label>
                <textarea
                  rows={2}
                  value={cardForm.instructionsAr}
                  onChange={(e) => setCardForm({ ...cardForm, instructionsAr: e.target.value })}
                  placeholder="يرجى إدخال بيانات البطاقة لإتمام الدفع الآمن والمشفر بنسبة 100%..."
                  style={{ width: '100%', padding: '10px 14px', background: '#172033', border: '1.5px solid #475569', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                />
              </div>

              {/* Instructions English */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#ffffff', marginBottom: '6px', fontWeight: '700' }}>
                  📝 Payment Instructions (English)
                </label>
                <textarea
                  rows={2}
                  value={cardForm.instructionsEn}
                  onChange={(e) => setCardForm({ ...cardForm, instructionsEn: e.target.value })}
                  placeholder="Enter your card details for 100% encrypted & secure payment..."
                  style={{ width: '100%', padding: '10px 14px', background: '#172033', border: '1.5px solid #475569', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem', fontFamily: 'var(--font-en)', outline: 'none', resize: 'vertical' }}
                />
              </div>

              {/* Active Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155' }}>
                <input
                  type="checkbox"
                  checked={cardForm.isActive}
                  onChange={(e) => setCardForm({ ...cardForm, isActive: e.target.checked })}
                  id="modalCardActive"
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="modalCardActive" style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}>
                  Active &amp; visible to clients at checkout (تفعيل خيار الفيزا ليظهر للعملاء في الدفع)
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', borderTop: '1px solid #334155', paddingTop: '1.2rem' }}>
              <button
                type="button"
                onClick={() => setCardModalOpen(false)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '10px', color: '#cbd5e1', borderColor: '#475569' }}
              >
                Cancel (إلغاء)
              </button>
              <button
                type="button"
                onClick={handleSaveCardModal}
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px', fontWeight: '800', fontSize: '1rem', background: '#2563eb', borderColor: '#3b82f6' }}
              >
                💾 Save Visa Account (حفظ حساب الفيزا)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

