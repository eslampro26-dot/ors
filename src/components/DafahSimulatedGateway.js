'use client';

import { useState } from 'react';
import TranslatedText from '@/components/TranslatedText';

export default function DafahSimulatedGateway({ searchParams, router, addBooking, locale }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Extract payment details from URL searchParams
  const txParam = searchParams.get('tx') || 'dafah-tx-default';
  const tripId = searchParams.get('tripId') || '';
  const amount = parseFloat(searchParams.get('amount') || '0');
  const originalAmount = parseFloat(searchParams.get('originalAmount') || amount.toString());
  const discountAmount = parseFloat(searchParams.get('discountAmount') || '0');
  const promoCode = searchParams.get('promoCode') || '';
  const agentId = searchParams.get('agentId') || null;
  const agentName = searchParams.get('agentName') || 'مباشر (بدون وكيل)';
  const customerName = searchParams.get('customerName') || '';
  const phone = searchParams.get('phone') || '';
  const whatsapp = searchParams.get('whatsapp') || '';
  const date = searchParams.get('date') || '';
  const travelers = parseInt(searchParams.get('travelers') || '1', 10);
  const title = searchParams.get('title') || 'رحلة سياحية';
  const city = searchParams.get('city') || 'شرم الشيخ';
  const email = searchParams.get('email') || '';
  const pickupLocation = searchParams.get('pickupLocation') || '';
  const extras = searchParams.get('extras') || '';
  const specialRequests = searchParams.get('specialRequests') || '';

  const translate = (key) => {
    const dict = {
      en: {
        gatewayTitle: 'Dafah Payment Gateway',
        secureCheckout: '🔒 256-bit SSL Secure Checkout Connection',
        cardHolderLabel: 'Cardholder Name',
        cardNumberLabel: 'Card Number',
        expiryLabel: 'Expiration Date',
        cvvLabel: 'CVV / Security Code',
        payButton: `Pay €${amount.toFixed(2)}`,
        processing: 'Processing transaction securely, please do not close this window...',
        successText: 'Payment Authorized Successfully!',
        failedText: 'Payment failed, please try again.',
        orderSummary: 'Order Details',
        service: 'Service Name',
        total: 'Amount Due',
        logoText: 'DAFAH',
      },
      ar: {
        gatewayTitle: 'بوابة دفع دفة الآمنة',
        secureCheckout: '🔒 اتصال تشفير SSL آمن 256 بت',
        cardHolderLabel: 'اسم حامل البطاقة',
        cardNumberLabel: 'رقم البطاقة (Visa / MasterCard / مدى)',
        expiryLabel: 'تاريخ الانتهاء (MM/YY)',
        cvvLabel: 'الرمز السري (CVV)',
        payButton: `دفع €${amount.toFixed(2)}`,
        processing: 'جاري معالجة المعاملة بأمان، يرجى عدم إغلاق هذه الصفحة...',
        successText: 'تم تأكيد الدفع بنجاح!',
        failedText: 'فشلت عملية الدفع، يرجى المحاولة مرة أخرى.',
        orderSummary: 'تفاصيل الطلب',
        service: 'الخدمة المطلوبة',
        total: 'المبلغ الإجمالي',
        logoText: 'DAFAH | دفة',
      },
      de: {
        gatewayTitle: 'Dafah Zahlungs-Gateway',
        secureCheckout: '🔒 256-Bit-SSL-sichere Verbindung',
        cardHolderLabel: 'Name des Karteninhabers',
        cardNumberLabel: 'Kartennummer',
        expiryLabel: 'Ablaufdatum',
        cvvLabel: 'CVV / Sicherheitscode',
        payButton: `€${amount.toFixed(2)} bezahlen`,
        processing: 'Sichere Verarbeitung der Transaktion...',
        successText: 'Zahlung erfolgreich autorisiert!',
        failedText: 'Zahlung fehlgeschlagen.',
        orderSummary: 'Bestelldetails',
        service: 'Gewünschte Leistung',
        total: 'Gesamtbetrag',
        logoText: 'DAFAH',
      },
      fr: {
        gatewayTitle: 'Passerelle de Paiement Dafah',
        secureCheckout: '🔒 Connexion sécurisée SSL 256 bits',
        cardHolderLabel: 'Nom du titulaire de la carte',
        cardNumberLabel: 'Numéro de carte',
        expiryLabel: "Date d'expiration",
        cvvLabel: 'Cryptogramme visuel (CVV)',
        payButton: `Payer €${amount.toFixed(2)}`,
        processing: 'Traitement sécurisé en cours...',
        successText: 'Paiement autorisé avec succès !',
        failedText: 'Échec du paiement.',
        orderSummary: 'Détails de la commande',
        service: 'Nom du service',
        total: 'Montant dû',
        logoText: 'DAFAH',
      },
      es: {
        gatewayTitle: 'Pasarela de Pago Dafah',
        secureCheckout: '🔒 Conexión segura SSL de 256 bits',
        cardHolderLabel: 'Nombre del titular',
        cardNumberLabel: 'Número de tarjeta',
        expiryLabel: 'Fecha de caducidad',
        cvvLabel: 'Código de seguridad (CVV)',
        payButton: `Pagar €${amount.toFixed(2)}`,
        processing: 'Procesando transacción de forma segura...',
        successText: '¡Pago autorizado con éxito!',
        failedText: 'Pago fallido.',
        orderSummary: 'Detalles del pedido',
        service: 'Nombre del servicio',
        total: 'Total a pagar',
        logoText: 'DAFAH',
      },
      it: {
        gatewayTitle: 'Gateway di Pagamento Dafah',
        secureCheckout: '🔒 Connessione sicura SSL a 256 bit',
        cardHolderLabel: 'Titolare della carta',
        cardNumberLabel: 'Numero di carta',
        expiryLabel: 'Data di scadenza',
        cvvLabel: 'Codice di sicurezza (CVV)',
        payButton: `Paga €${amount.toFixed(2)}`,
        processing: 'Elaborazione sicura della transazione in corso...',
        successText: 'Pagamento autorizzato con successo!',
        failedText: 'Pagamento non riuscito.',
        orderSummary: 'Dettagli dell\'ordine',
        service: 'Nome del servizio',
        total: 'Importo dovuto',
        logoText: 'DAFAH',
      },
      ru: {
        gatewayTitle: 'Платежный Шлюз Dafah',
        secureCheckout: '🔒 Защищенное 256-битное SSL-соединение',
        cardHolderLabel: 'Имя владельца карты',
        cardNumberLabel: 'Номер карты',
        expiryLabel: 'Срок действия',
        cvvLabel: 'Код безопасности (CVV)',
        payButton: `Оплатить €${amount.toFixed(2)}`,
        processing: 'Безопасная обработка транзакции...',
        successText: 'Платеж успешно подтвержден!',
        failedText: 'Ошибка оплаты.',
        orderSummary: 'Детали заказа',
        service: 'Наименование услуги',
        total: 'Итого к оплате',
        logoText: 'DAFAH',
      },
      tr: {
        gatewayTitle: 'Dafah Ödeme Ödeme Sayfası',
        secureCheckout: '🔒 256-bit SSL Güvenli Bağlantı',
        cardHolderLabel: 'Kart Sahibinin Adı',
        cardNumberLabel: 'Kart Numarası',
        expiryLabel: 'Son Kullanma Tarihi',
        cvvLabel: 'Güvenlik Kodu (CVV)',
        payButton: `€${amount.toFixed(2)} Öde`,
        processing: 'İşlem güvenli bir şekilde işleniyor...',
        successText: 'Ödeme Başarıyla Onaylandı!',
        failedText: 'Ödeme başarısız.',
        orderSummary: 'Sipariş Detayları',
        service: 'Hizmet Adı',
        total: 'Toplam Tutar',
        logoText: 'DAFAH',
      },
      zh: {
        gatewayTitle: 'Dafah 安全支付网关',
        secureCheckout: '🔒 256位 SSL 安全加密连接',
        cardHolderLabel: '持卡人姓名',
        cardNumberLabel: '卡号',
        expiryLabel: '有效期',
        cvvLabel: 'CVV / 安全码',
        payButton: `支付 €${amount.toFixed(2)}`,
        processing: '正在安全处理交易，请勿关闭窗口...',
        successText: '支付成功！',
        failedText: '支付失败，请重试。',
        orderSummary: '订单详情',
        service: '服务名称',
        total: '应付总额',
        logoText: 'DAFAH',
      },
      ja: {
        gatewayTitle: 'Dafah 決済ゲートウェイ',
        secureCheckout: '🔒 256ビットSSL暗号化接続',
        cardHolderLabel: 'カード名義人',
        cardNumberLabel: 'カード番号',
        expiryLabel: '有効期限',
        cvvLabel: 'セキュリティコード (CVV)',
        payButton: `€${amount.toFixed(2)} を支払う`,
        processing: '決済を安全に処理中です...',
        successText: '決済が正常に完了しました！',
        failedText: '決済に失敗しました。',
        orderSummary: '注文詳細',
        service: 'サービス名',
        total: 'お支払い合計',
        logoText: 'DAFAH',
      }
    };
    const activeDict = dict[locale] || dict.en;
    return activeDict[key] || dict.en[key] || key;
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvv || !cardHolder) {
      alert(locale === 'ar' ? 'الرجاء إدخال تفاصيل البطاقة كاملة!' : 'Please fill all card details!');
      return;
    }

    setIsProcessing(true);

    // Simulate gateway response delay
    setTimeout(async () => {
      try {
        // Save booking to Database
        await addBooking({
          id: `BK-${txParam.replace('dafah-tx-', '').split('-')[0]}`,
          customer: customerName,
          email: email,
          phone: phone,
          whatsapp: whatsapp || phone,
          service: title,
          city: city,
          agentId: agentId,
          agentName: agentName,
          originalAmount: originalAmount,
          discountAmount: discountAmount,
          finalAmount: amount,
          travelers: travelers,
          status: 'مؤكد',
          promoCode: promoCode,
          paymentType: 'card',
          txId: txParam,
          pickupLocation: pickupLocation,
          extras: extras,
          specialRequests: specialRequests,
          children: parseInt(searchParams.get('children') || '0', 10),
          infants: parseInt(searchParams.get('infants') || '0', 10),
          customerLanguage: searchParams.get('customerLanguage') || locale || 'ar',
          electronicSignature: {
            name: customerName,
            email: email,
            phone: phone,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            bookingDetails: {
              tripId,
              title,
              date,
              travelers,
              amount
            }
          },
          signatureTimestamp: new Date().toISOString()
        });

        setPaymentSuccess(true);
        setIsProcessing(false);

        // Redirect to success view
        const successUrl = `/checkout?status=success&tx=${txParam}&tripId=${tripId}&amount=${amount}&originalAmount=${originalAmount}&discountAmount=${discountAmount}&promoCode=${promoCode}&agentId=${agentId || ''}&agentName=${encodeURIComponent(agentName)}&customerName=${encodeURIComponent(customerName)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&whatsapp=${encodeURIComponent(whatsapp || phone)}&date=${encodeURIComponent(date)}&travelers=${travelers}&title=${encodeURIComponent(title)}&paymentType=card&pickupLocation=${encodeURIComponent(pickupLocation)}&extras=${encodeURIComponent(extras)}&specialRequests=${encodeURIComponent(specialRequests)}`;
        
        router.push(successUrl);

      } catch (err) {
        console.error('Error completing simulated Dafah payment:', err);
        setIsProcessing(false);
        alert(locale === 'ar' ? 'حدث خطأ غير متوقع أثناء معالجة الدفع.' : 'An unexpected error occurred during payment processing.');
      }
    }, 2200);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const isAr = locale === 'ar';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      color: 'var(--text-primary)',
      direction: isAr ? 'rtl' : 'ltr'
    }}>
      <div className="glass-card" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '2.5rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-accent)',
        position: 'relative'
      }}>
        {/* Gateway Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--gold-400)', margin: 0 }}>
              {translate('gatewayTitle')}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {translate('secureCheckout')}
            </span>
          </div>
          <div style={{
            fontSize: '1.1rem',
            fontWeight: '900',
            color: 'var(--text-primary)',
            background: 'var(--bg-tertiary)',
            padding: '6px 12px',
            borderRadius: '6px',
            fontFamily: 'var(--font-en)'
          }}>
            {translate('logoText')}
          </div>
        </div>

        {/* Processing State Overlay */}
        {isProcessing && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'var(--bg-glass-strong)',
            backdropFilter: 'blur(8px)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            zIndex: 10,
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
              {translate('processing')}
            </p>

            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Excursion Summary */}
        <div style={{
          background: 'var(--bg-tertiary)',
          padding: '1.2rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          fontSize: '0.9rem',
          border: '1px solid var(--border-subtle)'
        }}>
          <h3 style={{ margin: '0 0 0.8rem 0', fontWeight: 'bold', borderBottom: '1px dashed var(--border-medium)', paddingBottom: '0.4rem' }}>
            {translate('orderSummary')}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{translate('service')}:</span>
            <span style={{ fontWeight: 'bold' }}><TranslatedText text={title} /></span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{translate('total')}:</span>
            <span style={{ fontWeight: 'bold', color: 'var(--gold-500)', fontFamily: 'var(--font-en)' }}>€{amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Credit Card Mock graphic */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '12px',
          padding: '1.5rem',
          color: 'white',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '170px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '45px', height: '35px', background: '#e2e8f0', borderRadius: '4px', opacity: 0.8 }} /> {/* Chip */}
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '1px', fontFamily: 'var(--font-en)' }}>VISA</span>
          </div>
          <div style={{
            fontSize: '1.35rem',
            letterSpacing: '2px',
            fontFamily: 'var(--font-en)',
            margin: '1rem 0',
            textAlign: 'center',
            minHeight: '27px'
          }}>
            {cardNumber || '•••• •••• •••• ••••'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-en)' }}>
            <div>
              <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#94a3b8' }}>Card Holder</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>
                {cardHolder || 'FULL NAME'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#94a3b8' }}>Expires</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                {expiry || 'MM/YY'}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Card Holder name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              {translate('cardHolderLabel')}
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              style={{
                padding: '0.8rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-medium)',
                background: 'rgba(255,255,255,0.02)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontFamily: 'var(--font-en)',
                textTransform: 'uppercase'
              }}
              required
            />
          </div>

          {/* Card Number */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              {translate('cardNumberLabel')}
            </label>
            <input
              type="text"
              placeholder="4000 1234 5678 9010"
              maxLength="19"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              style={{
                padding: '0.8rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-medium)',
                background: 'rgba(255,255,255,0.02)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontFamily: 'var(--font-en)'
              }}
              required
            />
          </div>

          {/* Expiry and CVV */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                {translate('expiryLabel')}
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                maxLength="5"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                style={{
                  padding: '0.8rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  background: 'rgba(255,255,255,0.02)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontFamily: 'var(--font-en)',
                  textAlign: 'center'
                }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                {translate('cvvLabel')}
              </label>
              <input
                type="password"
                placeholder="123"
                maxLength="3"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                style={{
                  padding: '0.8rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  background: 'rgba(255,255,255,0.02)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontFamily: 'var(--font-en)',
                  textAlign: 'center'
                }}
                required
              />
            </div>
          </div>

          {/* Pay Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '1rem',
              fontWeight: 'bold',
              fontSize: '1.05rem',
              marginTop: '1rem',
              background: 'linear-gradient(135deg, var(--gold-400), var(--gold-700))',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            {translate('payButton')}
          </button>
        </form>
      </div>
    </div>
  );
}
