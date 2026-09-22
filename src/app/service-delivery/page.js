'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const LANGS = [
  { code: 'ar', name: 'العربية', flag: '🇪🇬', dir: 'rtl' },
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', dir: 'ltr' },
];

const DELIVERY_DATA = {
  ar: {
    title: 'سياسة تقديم الخدمة والتسليم',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — الغردقة، البحر الأحمر، مصر',
    lastUpdated: 'آخر تحديث: سبتمبر 2025',
    intro: 'تُوضح هذه الوثيقة بشكل دقيق كيف ومتى يتلقى العميل تأكيد حجزه بعد إتمام عملية الدفع، ومسؤوليات ORLUXUS في إتمام تقديم الخدمة المتفق عليها.',
    steps: [
      {
        num: '1',
        icon: '💳',
        title: 'إتمام الدفع',
        desc: 'يقوم العميل بسداد قيمة الحجز عبر بوابة الدفع الآمنة (PayTabs / PayPal / تحويل بنكي). تُعالَج المدفوعات البنكية في بيئة PayTabs المشفرة (PCI DSS Level 1).',
      },
      {
        num: '2',
        icon: '✅',
        title: 'تأكيد الحجز الفوري (خلال دقائق)',
        desc: 'فور نجاح الدفع، يُرسل النظام تلقائياً رسالة تأكيد فورية عبر البريد الإلكتروني المُدخل في نموذج الحجز. تحتوي رسالة التأكيد على رقم مرجعي فريد للحجز.',
        highlight: true,
      },
      {
        num: '3',
        icon: '📧',
        title: 'إرسال Voucher الرحلة (خلال 15-60 دقيقة)',
        desc: 'يُرسل مستشار الحجز قسيمة الرحلة (Voucher) الرسمية عبر البريد الإلكتروني وواتساب في أقرب وقت ممكن بعد تأكيد الدفع.',
        highlight: true,
      },
      {
        num: '4',
        icon: '📋',
        title: 'محتويات قسيمة الحجز (Voucher)',
        content: [
          'رقم مرجعي فريد للحجز (Booking Reference Number)',
          'اسم الرحلة أو الخدمة المحجوزة بالكامل',
          'تاريخ ووقت الرحلة بدقة',
          'نقطة الالتقاء أو فندق الاستلام والوقت',
          'عدد المسافرين (بالغون / أطفال)',
          'ملاحظات وتفاصيل الخدمة (اللغة، الإضافات المطلوبة)',
          'بيانات التواصل الطارئ لمستشار الرحلة',
          'سياسة الإلغاء المطبقة على هذا الحجز تحديداً',
        ],
      },
      {
        num: '5',
        icon: '📞',
        title: 'التواصل قبل الرحلة (24 ساعة مسبقاً)',
        desc: 'يتواصل فريقنا مع العميل قبل موعد الرحلة بـ 24 ساعة عبر واتساب لتأكيد جميع التفاصيل: وقت الاستلام، مكان الالتقاء، وأي متطلبات خاصة.',
      },
      {
        num: '6',
        icon: '🚗',
        title: 'يوم الرحلة',
        desc: 'يلتزم مزود الخدمة بالوصول في الوقت المحدد لاستلام العميل من النقطة المتفق عليها. في حالة أي تأخير أو تعديل، يتم إبلاغ العميل فورياً عبر واتساب.',
      },
    ],
    importantNotes: [
      { icon: '🔄', text: 'في حالة رفض الدفع: لا يُعدّ الحجز مؤكداً ولا يُرسل أي Voucher حتى يتم تأكيد الدفع بنجاح.' },
      { icon: '📩', text: 'تأكد من إدخال عنوان بريدك الإلكتروني بشكل صحيح في نموذج الحجز لاستلام التأكيد.' },
      { icon: '📱', text: 'تحقق من مجلد البريد الاحتياطي (Spam) إذا لم تصلك رسالة التأكيد خلال 10 دقائق.' },
      { icon: '💰', text: 'طبيعة الخدمة رقمية — لا يوجد منتج مادي يُشحن. الـ Voucher هو وثيقتك الرسمية الوحيدة.' },
      { icon: '🔁', text: 'سياسة الاسترداد: في حالة الإلغاء، يُعاد المبلغ بنفس وسيلة الدفع الأصلية (نفس البطاقة البنكية) خلال 7-14 يوم عمل.' },
    ],
    contact: 'لأي استفسار بخصوص حجزك: info@orluxus.com | WhatsApp: +201038820019',
    emergency: 'خط الطوارئ: +201038820014 (متاح 24/7)',
  },
  en: {
    title: 'Service Delivery Policy',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — Hurghada, Red Sea, Egypt',
    lastUpdated: 'Last Updated: September 2025',
    intro: 'This document precisely outlines how and when clients receive their booking confirmation after completing payment, and ORLUXUS responsibilities in fulfilling the agreed service.',
    steps: [
      {
        num: '1',
        icon: '💳',
        title: 'Payment Completion',
        desc: 'The client pays the booking value through the secure payment gateway (PayTabs / PayPal / Bank Transfer). Card payments are processed in PayTabs\' encrypted environment (PCI DSS Level 1).',
      },
      {
        num: '2',
        icon: '✅',
        title: 'Instant Booking Confirmation (Within Minutes)',
        desc: 'Upon successful payment, the system automatically sends an instant confirmation message to the email address entered in the booking form, containing a unique booking reference number.',
        highlight: true,
      },
      {
        num: '3',
        icon: '📧',
        title: 'Trip Voucher Delivery (Within 15–60 Minutes)',
        desc: 'A booking advisor sends the official Trip Voucher via email and WhatsApp as soon as possible after payment confirmation.',
        highlight: true,
      },
      {
        num: '4',
        icon: '📋',
        title: 'Booking Voucher Contents',
        content: [
          'Unique Booking Reference Number',
          'Full name of the booked trip or service',
          'Exact trip date and time',
          'Meeting point or hotel pickup location and time',
          'Number of travelers (adults / children)',
          'Service notes and details (language, requested add-ons)',
          'Emergency contact details of the trip advisor',
          'Cancellation policy applicable to this specific booking',
        ],
      },
      {
        num: '5',
        icon: '📞',
        title: 'Pre-Trip Contact (24 Hours Prior)',
        desc: 'Our team contacts the client 24 hours before the trip via WhatsApp to confirm all details: pickup time, meeting point, and any special requirements.',
      },
      {
        num: '6',
        icon: '🚗',
        title: 'Day of the Trip',
        desc: 'The service provider is committed to arriving at the agreed time to pick up the client from the agreed location. In case of any delay or modification, the client will be notified immediately via WhatsApp.',
      },
    ],
    importantNotes: [
      { icon: '🔄', text: 'If payment is declined: The booking is NOT confirmed and no Voucher is sent until payment is successfully confirmed.' },
      { icon: '📩', text: 'Make sure to enter your email address correctly in the booking form to receive the confirmation.' },
      { icon: '📱', text: 'Check your Spam folder if you do not receive a confirmation email within 10 minutes.' },
      { icon: '💰', text: 'The service is digital in nature — no physical product is shipped. The Voucher is your only official document.' },
      { icon: '🔁', text: 'Refund Policy: In case of cancellation, the amount is returned to the original payment method (same bank card) within 7–14 business days.' },
    ],
    contact: 'For any booking inquiries: info@orluxus.com | WhatsApp: +201038820019',
    emergency: 'Emergency Line: +201038820014 (Available 24/7)',
  },
  de: {
    title: 'Serviceleistungs- und Lieferrichtlinie',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — Hurghada, Rotes Meer, Ägypten',
    lastUpdated: 'Zuletzt aktualisiert: September 2025',
    intro: 'Dieses Dokument beschreibt präzise, wie und wann Kunden ihre Buchungsbestätigung nach Abschluss der Zahlung erhalten.',
    steps: [
      {
        num: '1',
        icon: '💳',
        title: 'Zahlungsabschluss',
        desc: 'Der Kunde zahlt den Buchungsbetrag über das sichere Zahlungsgateway (PayTabs / PayPal / Banküberweisung).',
      },
      {
        num: '2',
        icon: '✅',
        title: 'Sofortige Buchungsbestätigung (Innerhalb von Minuten)',
        desc: 'Nach erfolgreicher Zahlung sendet das System automatisch eine Bestätigung an die im Buchungsformular angegebene E-Mail-Adresse.',
        highlight: true,
      },
      {
        num: '3',
        icon: '📧',
        title: 'Reisegutschein-Lieferung (Innerhalb von 15–60 Minuten)',
        desc: 'Ein Buchungsberater sendet den offiziellen Reisegutschein per E-Mail und WhatsApp so bald wie möglich nach Zahlungsbestätigung.',
        highlight: true,
      },
    ],
    importantNotes: [
      { icon: '🔁', text: 'Rückerstattungsrichtlinie: Bei Stornierung wird der Betrag auf die ursprüngliche Zahlungsmethode innerhalb von 7–14 Werktagen zurückgebucht.' },
      { icon: '📩', text: 'Bitte geben Sie Ihre E-Mail-Adresse korrekt ein, um die Bestätigung zu erhalten.' },
    ],
    contact: 'Für Buchungsanfragen: info@orluxus.com | WhatsApp: +201038820019',
    emergency: 'Notfallhotline: +201038820014 (24/7 verfügbar)',
  },
  fr: {
    title: 'Politique de Prestation de Services et de Livraison',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — Hurghada, Mer Rouge, Égypte',
    lastUpdated: 'Dernière mise à jour : Septembre 2025',
    intro: 'Ce document décrit précisément comment et quand les clients reçoivent leur confirmation de réservation après le paiement.',
    steps: [
      {
        num: '1',
        icon: '💳',
        title: 'Paiement effectué',
        desc: 'Le client règle la réservation via la passerelle de paiement sécurisée (PayTabs / PayPal / Virement).',
      },
      {
        num: '2',
        icon: '✅',
        title: 'Confirmation immédiate (En quelques minutes)',
        desc: 'Dès confirmation du paiement, le système envoie automatiquement un e-mail de confirmation à l\'adresse fournie.',
        highlight: true,
      },
      {
        num: '3',
        icon: '📧',
        title: 'Livraison du bon de voyage (15–60 minutes)',
        desc: 'Un conseiller envoie le bon de voyage officiel par e-mail et WhatsApp dans les meilleurs délais.',
        highlight: true,
      },
    ],
    importantNotes: [
      { icon: '🔁', text: 'Politique de remboursement : En cas d\'annulation, le montant est restitué sur la méthode de paiement initiale dans un délai de 7 à 14 jours ouvrables.' },
      { icon: '📩', text: 'Vérifiez vos courriers indésirables si vous ne recevez pas la confirmation dans les 10 minutes.' },
    ],
    contact: 'Pour toute demande : info@orluxus.com | WhatsApp : +201038820019',
    emergency: 'Ligne d\'urgence : +201038820014 (disponible 24h/24)',
  },
  ru: {
    title: 'Политика оказания услуг и доставки',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — Хургада, Красное море, Египет',
    lastUpdated: 'Последнее обновление: сентябрь 2025',
    intro: 'Данный документ точно описывает, как и когда клиенты получают подтверждение бронирования после оплаты.',
    steps: [
      {
        num: '1',
        icon: '💳',
        title: 'Завершение оплаты',
        desc: 'Клиент оплачивает бронирование через защищённый платёжный шлюз (PayTabs / PayPal / Банковский перевод).',
      },
      {
        num: '2',
        icon: '✅',
        title: 'Мгновенное подтверждение бронирования (В течение минут)',
        desc: 'После успешной оплаты система автоматически отправляет подтверждение на указанный адрес электронной почты.',
        highlight: true,
      },
      {
        num: '3',
        icon: '📧',
        title: 'Доставка ваучера (В течение 15–60 минут)',
        desc: 'Консультант по бронированию отправляет официальный ваучер по электронной почте и в WhatsApp.',
        highlight: true,
      },
    ],
    importantNotes: [
      { icon: '🔁', text: 'Политика возврата: при отмене сумма возвращается на исходный способ оплаты в течение 7–14 рабочих дней.' },
      { icon: '📩', text: 'Проверьте папку «Спам», если не получили подтверждение в течение 10 минут.' },
    ],
    contact: 'По вопросам бронирования: info@orluxus.com | WhatsApp: +201038820019',
    emergency: 'Экстренная линия: +201038820014 (доступна 24/7)',
  },
};

export default function ServiceDeliveryPage() {
  const [lang, setLang] = useState('ar');
  const data = DELIVERY_DATA[lang] || DELIVERY_DATA.en;
  const isRtl = lang === 'ar';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, rgba(240,249,255,0.96) 0%, rgba(224,242,254,0.97) 100%)',
        color: '#1f2937',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Cairo", "Tajawal", sans-serif',
        lineHeight: 1.75,
      }}
    >
      {/* Navigation */}
      <nav
        style={{
          padding: '14px 24px',
          background: 'rgba(255,255,255,0.96)',
          borderBottom: '1px solid rgba(14,165,233,0.3)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(12px)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link href="/" style={{ color: '#8c6a12', textDecoration: 'none', fontWeight: '900', fontSize: '1.3rem', letterSpacing: '1px' }}>
            ORLUXUS
          </Link>
          <span style={{ color: '#6b7280', fontSize: '0.85rem', borderLeft: isRtl ? 'none' : '1px solid #d1d5db', borderRight: isRtl ? '1px solid #d1d5db' : 'none', paddingLeft: isRtl ? 0 : '12px', paddingRight: isRtl ? '12px' : 0 }}>
            {isRtl ? '📧 سياسة تقديم الخدمة' : '📧 Service Delivery Policy'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: lang === l.code ? '1.5px solid #0ea5e9' : '1px solid #e5e7eb',
                background: lang === l.code ? '#f0f9ff' : '#fff',
                color: lang === l.code ? '#0369a1' : '#6b7280',
                fontWeight: lang === l.code ? '700' : '400',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              {l.flag} {l.name}
            </button>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)',
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            marginBottom: '2rem',
            textAlign: 'center',
            color: '#fff',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📧</div>
          <h1 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: '800', color: '#bae6fd', marginBottom: '0.5rem' }}>
            {data.title}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{data.subtitle}</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{data.lastUpdated}</p>
        </div>

        {/* Intro */}
        <p style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '1.2rem 1.5rem', fontSize: '0.95rem', color: '#0c4a6e', marginBottom: '2rem' }}>
          {data.intro}
        </p>

        {/* Delivery Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2rem' }}>
          {data.steps.map((step, idx) => (
            <div
              key={idx}
              style={{
                background: step.highlight
                  ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                  : '#ffffff',
                border: step.highlight ? '2px solid #86efac' : '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                gap: '1.2rem',
                alignItems: 'flex-start',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: step.highlight ? '#16a34a' : '#0ea5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  flexShrink: 0,
                }}
              >
                {step.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <span style={{ background: step.highlight ? '#16a34a' : '#0369a1', color: '#fff', borderRadius: '4px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: '700' }}>
                    {isRtl ? `الخطوة ${step.num}` : `Step ${step.num}`}
                  </span>
                  <h3 style={{ margin: 0, fontSize: '0.97rem', fontWeight: '800', color: step.highlight ? '#166534' : '#1e40af' }}>
                    {step.title}
                  </h3>
                </div>
                {step.desc && (
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151', lineHeight: 1.7 }}>{step.desc}</p>
                )}
                {step.content && (
                  <ul style={{ margin: '0.5rem 0 0 0', padding: isRtl ? '0 1.2rem 0 0' : '0 0 0 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {step.content.map((item, i) => (
                      <li key={i} style={{ fontSize: '0.88rem', color: '#374151' }}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Important Notes */}
        {data.importantNotes && (
          <div style={{ background: '#fffbeb', border: '2px solid #fbbf24', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '800', color: '#92400e' }}>
              ⚠️ {isRtl ? 'ملاحظات مهمة' : 'Important Notes'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {data.importantNotes.map((note, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.9rem', color: '#78350f' }}>
                  <span style={{ flexShrink: 0 }}>{note.icon}</span>
                  <span>{note.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact & Emergency */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1.2rem', textAlign: 'center', fontSize: '0.88rem', color: '#475569' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>📧</div>
            <p style={{ margin: 0 }}>{data.contact}</p>
          </div>
          <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', padding: '1.2rem', textAlign: 'center', fontSize: '0.88rem', color: '#9f1239' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🚨</div>
            <p style={{ margin: 0 }}>{data.emergency}</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
          <Link href="/" style={{ padding: '8px 20px', background: '#1e40af', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>
            {isRtl ? '← العودة للرئيسية' : '← Back to Home'}
          </Link>
          <Link href="/terms" style={{ padding: '8px 20px', background: '#d4aa30', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>
            {isRtl ? '⚖️ الشروط والأحكام' : '⚖️ Terms & Conditions'}
          </Link>
          <Link href="/privacy" style={{ padding: '8px 20px', background: '#059669', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>
            {isRtl ? '🔒 سياسة الخصوصية' : '🔒 Privacy Policy'}
          </Link>
        </div>
      </main>
    </div>
  );
}
