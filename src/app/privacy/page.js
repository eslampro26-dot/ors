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

const PRIVACY_DATA = {
  ar: {
    title: 'سياسة الخصوصية وأمان البيانات',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — الغردقة، البحر الأحمر، مصر',
    lastUpdated: 'آخر تحديث: سبتمبر 2025',
    intro: 'نحن في منصة ORLUXUS نُولي حماية بياناتك الشخصية أولوية قصوى. تشرح هذه السياسة كيفية جمع بياناتك واستخدامها وحمايتها وفقاً لقانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020 ومعايير GDPR الأوروبية.',
    sections: [
      {
        title: '1. البيانات التي نجمعها',
        items: [
          'الاسم الكامل ورقم جواز السفر أو الهوية الوطنية',
          'عنوان البريد الإلكتروني ورقم الهاتف / واتساب',
          'تفاصيل الحجز (نوع الرحلة، التاريخ، عدد المسافرين)',
          'موقع الاستلام ومتطلبات خاصة بالرحلة',
          'بيانات الاتصال بغرض إرسال قسيمة الحجز وتأكيد الموعد',
        ],
      },
      {
        title: '2. أمان بيانات الدفع (مهم جداً)',
        highlight: true,
        items: [
          '🔒 لا يتم تخزين أي بيانات بطاقتك البنكية (رقم البطاقة، CVV، تاريخ الانتهاء) على سيرفرات ORLUXUS.',
          '✅ جميع المدفوعات تتم حصراً عبر بيئة PayTabs المشفرة والمعتمدة بمعيار PCI DSS Level 1 — أعلى معايير أمان الدفع عالمياً.',
          '🛡️ بيانات بطاقتك محمية بتشفير SSL 256-bit طوال عملية الدفع.',
          '🔄 في حال الاسترداد: يُعاد المبلغ بنفس وسيلة الدفع الأصلية (نفس البطاقة البنكية) خلال 7 إلى 14 يوم عمل.',
          'PayTabs معتمد من Visa وMastercard وBankcard وهيئة الرقابة المالية المصرية.',
        ],
      },
      {
        title: '3. كيف نستخدم بياناتك',
        items: [
          'تأكيد الحجز وإرسال Voucher الرحلة عبر البريد الإلكتروني وواتساب',
          'التواصل معك قبل الرحلة لتأكيد موعد الاستلام والتفاصيل',
          'إرسال الفاتورة والإيصال الإلكتروني بعد إتمام الدفع',
          'الرد على استفساراتك وطلبات التعديل أو الإلغاء',
          'تحسين جودة خدماتنا من خلال استبيانات الرأي (اختيارية)',
        ],
      },
      {
        title: '4. مشاركة البيانات مع الغير',
        items: [
          'لا نبيع ولا نؤجر ولا نشارك بياناتك الشخصية مع أي طرف ثالث لأغراض تسويقية.',
          'نشارك فقط الحد الأدنى الضروري من بياناتك مع مزودي الخدمة (مشغلو الرحلات، خدمات النقل) لإتمام حجزك.',
          'نشارك بياناتك مع PayTabs لمعالجة المدفوعات الآمنة فقط.',
          'قد نُفصح عن بياناتك للجهات الحكومية أو القضائية عند وجود التزام قانوني بذلك.',
        ],
      },
      {
        title: '5. ملفات الارتباط (Cookies)',
        items: [
          'نستخدم ملفات الارتباط الضرورية لتشغيل الموقع وحفظ تفضيلات اللغة والعملة.',
          'لا نستخدم ملفات الارتباط لتتبعك لأغراض إعلانية.',
          'يمكنك تعطيل ملفات الارتباط من إعدادات متصفحك في أي وقت.',
        ],
      },
      {
        title: '6. حقوقك كمستخدم',
        items: [
          '📋 حق الاطلاع: يحق لك طلب نسخة من بياناتك الشخصية المخزنة لدينا.',
          '✏️ حق التصحيح: يحق لك طلب تصحيح أي بيانات غير دقيقة.',
          '🗑️ حق الحذف: يحق لك طلب حذف بياناتك بعد انتهاء الخدمة (ما لم يوجد التزام قانوني بالاحتفاظ بها).',
          '🚫 حق الاعتراض: يحق لك الاعتراض على معالجة بياناتك في أي وقت.',
          'لممارسة هذه الحقوق: تواصل معنا عبر info@orluxus.com',
        ],
      },
      {
        title: '7. مدة الاحتفاظ بالبيانات',
        items: [
          'نحتفظ ببيانات الحجز لمدة 5 سنوات لأغراض المحاسبة والمطالبات القانونية.',
          'تُحذف البيانات غير الضرورية فور انتهاء الغرض منها.',
        ],
      },
      {
        title: '8. القانون الواجب التطبيق',
        items: [
          'تخضع هذه السياسة لقانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020.',
          'نلتزم أيضاً بمعايير اللائحة الأوروبية لحماية البيانات (GDPR) للمستخدمين الأوروبيين.',
        ],
      },
    ],
    contact: 'للاستفسار عن سياسة الخصوصية أو ممارسة حقوقك: info@orluxus.com | WhatsApp: +201038820019',
  },
  en: {
    title: 'Privacy & Data Security Policy',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — Hurghada, Red Sea, Egypt',
    lastUpdated: 'Last Updated: September 2025',
    intro: 'At ORLUXUS, the protection of your personal data is our top priority. This policy explains how we collect, use, and protect your data in compliance with Egyptian Data Protection Law No. 151 of 2020 and European GDPR standards.',
    sections: [
      {
        title: '1. Data We Collect',
        items: [
          'Full name and passport / national ID number',
          'Email address and phone / WhatsApp number',
          'Booking details (trip type, date, number of travelers)',
          'Hotel pickup location and any special trip requirements',
          'Contact information for sending your booking voucher and confirmation',
        ],
      },
      {
        title: '2. Payment Data Security (Very Important)',
        highlight: true,
        items: [
          '🔒 We do NOT store any of your card data (card number, CVV, expiry date) on ORLUXUS servers.',
          '✅ All payments are processed exclusively through PayTabs\' encrypted environment, certified to PCI DSS Level 1 — the highest global payment security standard.',
          '🛡️ Your card data is protected by SSL 256-bit encryption throughout the entire payment process.',
          '🔄 Refunds: Amounts are returned to the original payment method (same bank card) within 7 to 14 business days.',
          'PayTabs is certified by Visa, Mastercard, and the Egyptian Financial Regulatory Authority.',
        ],
      },
      {
        title: '3. How We Use Your Data',
        items: [
          'Confirm booking and send trip Voucher via email and WhatsApp',
          'Contact you before the trip to confirm pickup time and details',
          'Send electronic invoice and receipt after payment',
          'Respond to your inquiries, modification, or cancellation requests',
          'Improve service quality through optional feedback surveys',
        ],
      },
      {
        title: '4. Sharing Your Data with Third Parties',
        items: [
          'We do not sell, rent, or share your personal data with any third party for marketing purposes.',
          'We only share the minimum necessary data with service providers (trip operators, transport services) to complete your booking.',
          'We share your data with PayTabs solely for secure payment processing.',
          'We may disclose your data to governmental or judicial authorities when legally required.',
        ],
      },
      {
        title: '5. Cookies',
        items: [
          'We use necessary cookies to operate the website and remember your language and currency preferences.',
          'We do not use tracking or advertising cookies.',
          'You may disable cookies in your browser settings at any time.',
        ],
      },
      {
        title: '6. Your Rights as a User',
        items: [
          '📋 Right of Access: You may request a copy of your personal data stored with us.',
          '✏️ Right of Rectification: You may request correction of any inaccurate data.',
          '🗑️ Right of Erasure: You may request deletion of your data after service completion (unless legally required to retain).',
          '🚫 Right to Object: You may object to the processing of your data at any time.',
          'To exercise these rights: contact us at info@orluxus.com',
        ],
      },
      {
        title: '7. Data Retention Period',
        items: [
          'We retain booking data for 5 years for accounting and legal claim purposes.',
          'Unnecessary data is deleted as soon as its purpose is fulfilled.',
        ],
      },
      {
        title: '8. Applicable Law',
        items: [
          'This policy is governed by Egyptian Data Protection Law No. 151 of 2020.',
          'We also comply with the European General Data Protection Regulation (GDPR) for European users.',
        ],
      },
    ],
    contact: 'For privacy inquiries or to exercise your rights: info@orluxus.com | WhatsApp: +201038820019',
  },
  de: {
    title: 'Datenschutz- und Datensicherheitsrichtlinie',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — Hurghada, Rotes Meer, Ägypten',
    lastUpdated: 'Zuletzt aktualisiert: September 2025',
    intro: 'Bei ORLUXUS hat der Schutz Ihrer persönlichen Daten höchste Priorität. Diese Richtlinie erklärt, wie wir Ihre Daten erfassen, verwenden und schützen, in Übereinstimmung mit dem ägyptischen Datenschutzgesetz Nr. 151 von 2020 und der europäischen DSGVO.',
    sections: [
      {
        title: '1. Von uns erfasste Daten',
        items: [
          'Vollständiger Name und Reisepass-/Personalausweisnummer',
          'E-Mail-Adresse und Telefon-/WhatsApp-Nummer',
          'Buchungsdetails (Reiseart, Datum, Reisende)',
          'Abholort und besondere Anforderungen',
          'Kontaktdaten zur Übermittlung des Buchungsvouchers und der Bestätigung',
        ],
      },
      {
        title: '2. Sicherheit der Zahlungsdaten (Sehr wichtig)',
        highlight: true,
        items: [
          '🔒 Wir speichern KEINE Kartendaten (Kartennummer, CVV, Ablaufdatum) auf ORLUXUS-Servern.',
          '✅ Alle Zahlungen erfolgen ausschließlich über die verschlüsselte Umgebung von PayTabs, zertifiziert nach PCI DSS Level 1.',
          '🛡️ Ihre Kartendaten sind durch 256-Bit-SSL-Verschlüsselung geschützt.',
          '🔄 Rückerstattungen: Beträge werden innerhalb von 7 bis 14 Werktagen auf die ursprüngliche Zahlungsmethode zurückgebucht.',
          'PayTabs ist von Visa, Mastercard und der ägyptischen Finanzaufsichtsbehörde zertifiziert.',
        ],
      },
      {
        title: '3. Wie wir Ihre Daten verwenden',
        items: [
          'Buchungsbestätigung und Zusendung des Reisevouchers per E-Mail und WhatsApp',
          'Kontaktaufnahme vor der Reise zur Bestätigung von Abholzeit und Details',
          'Übermittlung der elektronischen Rechnung und Quittung nach Zahlung',
          'Beantwortung von Anfragen sowie Änderungs- und Stornierungsanfragen',
        ],
      },
      {
        title: '4. Datenweitergabe an Dritte',
        items: [
          'Wir verkaufen, vermieten oder teilen Ihre personenbezogenen Daten nicht mit Dritten zu Marketingzwecken.',
          'Wir teilen nur das notwendige Minimum an Daten mit Dienstleistern (Reiseveranstalter, Transportdienste).',
          'Wir teilen Ihre Daten mit PayTabs ausschließlich zur sicheren Zahlungsverarbeitung.',
        ],
      },
      {
        title: '5. Ihre Rechte',
        items: [
          'Recht auf Auskunft, Berichtigung, Löschung und Widerspruch gemäß DSGVO.',
          'Für Datenschutzanfragen: info@orluxus.com',
        ],
      },
    ],
    contact: 'Datenschutzanfragen: info@orluxus.com | WhatsApp: +201038820019',
  },
  fr: {
    title: 'Politique de Confidentialité et de Sécurité des Données',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — Hurghada, Mer Rouge, Égypte',
    lastUpdated: 'Dernière mise à jour : Septembre 2025',
    intro: 'Chez ORLUXUS, la protection de vos données personnelles est notre priorité absolue. Cette politique explique comment nous collectons, utilisons et protégeons vos données conformément à la loi égyptienne sur la protection des données n° 151 de 2020 et au RGPD européen.',
    sections: [
      {
        title: '1. Données collectées',
        items: [
          'Nom complet et numéro de passeport / pièce d\'identité',
          'Adresse e-mail et numéro de téléphone / WhatsApp',
          'Détails de la réservation (type de voyage, date, nombre de voyageurs)',
          'Lieu de prise en charge et exigences particulières',
        ],
      },
      {
        title: '2. Sécurité des données de paiement (Très important)',
        highlight: true,
        items: [
          '🔒 Nous ne stockons AUCUNE donnée de carte bancaire sur les serveurs d\'ORLUXUS.',
          '✅ Tous les paiements sont traités via l\'environnement chiffré de PayTabs, certifié PCI DSS Level 1.',
          '🛡️ Vos données sont protégées par un chiffrement SSL 256 bits.',
          '🔄 Remboursements : Les montants sont restitués sur la méthode de paiement initiale dans un délai de 7 à 14 jours ouvrables.',
        ],
      },
      {
        title: '3. Vos droits',
        items: [
          'Droit d\'accès, de rectification, d\'effacement et d\'opposition conformément au RGPD.',
          'Pour exercer vos droits : info@orluxus.com',
        ],
      },
    ],
    contact: 'Pour toute demande relative à la confidentialité : info@orluxus.com | WhatsApp : +201038820019',
  },
  ru: {
    title: 'Политика конфиденциальности и защиты данных',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — Хургада, Красное море, Египет',
    lastUpdated: 'Последнее обновление: сентябрь 2025',
    intro: 'В ORLUXUS защита ваших персональных данных является нашим главным приоритетом. В данной политике объясняется, как мы собираем, используем и защищаем ваши данные в соответствии с египетским Законом о защите персональных данных № 151 от 2020 года и европейским GDPR.',
    sections: [
      {
        title: '1. Данные, которые мы собираем',
        items: [
          'Полное имя и номер паспорта / удостоверения личности',
          'Адрес электронной почты и номер телефона / WhatsApp',
          'Детали бронирования (тип тура, дата, количество путешественников)',
          'Место сбора и особые требования',
        ],
      },
      {
        title: '2. Безопасность платёжных данных (Очень важно)',
        highlight: true,
        items: [
          '🔒 Мы НЕ храним данные вашей банковской карты (номер, CVV, срок действия) на серверах ORLUXUS.',
          '✅ Все платежи обрабатываются исключительно через защищённую среду PayTabs, сертифицированную по стандарту PCI DSS Level 1.',
          '🛡️ Ваши данные защищены 256-битным SSL-шифрованием.',
          '🔄 Возвраты: суммы возвращаются на оригинальный способ оплаты в течение 7–14 рабочих дней.',
        ],
      },
      {
        title: '3. Ваши права',
        items: [
          'Право на доступ, исправление, удаление и возражение согласно GDPR.',
          'Для запросов: info@orluxus.com',
        ],
      },
    ],
    contact: 'По вопросам конфиденциальности: info@orluxus.com | WhatsApp: +201038820019',
  },
};

export default function PrivacyPage() {
  const [lang, setLang] = useState('ar');
  const data = PRIVACY_DATA[lang] || PRIVACY_DATA.en;
  const isRtl = lang === 'ar';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, rgba(253,251,247,0.95) 0%, rgba(248,246,240,0.97) 100%)',
        color: '#1f2937',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Cairo", "Tajawal", sans-serif',
        lineHeight: 1.75,
      }}
    >
      {/* Top Navigation */}
      <nav
        style={{
          padding: '14px 24px',
          background: 'rgba(255,255,255,0.96)',
          borderBottom: '1px solid rgba(201,162,39,0.3)',
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
            {isRtl ? '🔒 سياسة الخصوصية' : '🔒 Privacy Policy'}
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
                border: lang === l.code ? '1.5px solid #c9a227' : '1px solid #e5e7eb',
                background: lang === l.code ? '#fef9ec' : '#fff',
                color: lang === l.code ? '#8c6a12' : '#6b7280',
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

      {/* Main Content */}
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0a0e1a 0%, #1a2744 100%)',
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            marginBottom: '2rem',
            textAlign: 'center',
            color: '#fff',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔒</div>
          <h1 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: '800', color: '#d4aa30', marginBottom: '0.5rem' }}>
            {data.title}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{data.subtitle}</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{data.lastUpdated}</p>
        </div>

        {/* Intro */}
        <p
          style={{
            background: '#fefce8',
            border: '1px solid #fde68a',
            borderRadius: '10px',
            padding: '1.2rem 1.5rem',
            fontSize: '0.95rem',
            color: '#92400e',
            marginBottom: '2rem',
          }}
        >
          {data.intro}
        </p>

        {/* PayTabs Trust Badge */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '2px solid #86efac',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          {[
            { icon: '🛡️', label: 'PCI DSS Level 1' },
            { icon: '🔒', label: 'SSL 256-bit' },
            { icon: '💳', label: 'Visa · Mastercard' },
            { icon: '✅', label: 'PayTabs Certified' },
          ].map((badge) => (
            <div key={badge.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '80px' }}>
              <span style={{ fontSize: '1.5rem' }}>{badge.icon}</span>
              <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#166534' }}>{badge.label}</span>
            </div>
          ))}
        </div>

        {/* Sections */}
        {data.sections.map((section, idx) => (
          <div
            key={idx}
            style={{
              background: section.highlight
                ? 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)'
                : '#ffffff',
              border: section.highlight
                ? '2px solid #fbbf24'
                : '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.2rem',
              boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
            }}
          >
            <h2
              style={{
                fontSize: '1.05rem',
                fontWeight: '800',
                color: section.highlight ? '#92400e' : '#1e40af',
                marginBottom: '1rem',
                borderBottom: `2px solid ${section.highlight ? '#fbbf24' : '#dbeafe'}`,
                paddingBottom: '0.5rem',
              }}
            >
              {section.highlight && '⚠️ '}{section.title}
            </h2>
            <ul style={{ margin: 0, padding: isRtl ? '0 1.2rem 0 0' : '0 0 0 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {section.items.map((item, i) => (
                <li key={i} style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.7 }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#475569',
          }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📧</div>
          <p style={{ margin: 0 }}>{data.contact}</p>
        </div>

        {/* Back & Other Policy Links */}
        <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
          <Link href="/" style={{ padding: '8px 20px', background: '#1e40af', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>
            {isRtl ? '← العودة للرئيسية' : '← Back to Home'}
          </Link>
          <Link href="/terms" style={{ padding: '8px 20px', background: '#d4aa30', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>
            {isRtl ? '⚖️ الشروط والأحكام' : '⚖️ Terms & Conditions'}
          </Link>
          <Link href="/service-delivery" style={{ padding: '8px 20px', background: '#059669', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>
            {isRtl ? '📧 سياسة التسليم' : '📧 Service Delivery'}
          </Link>
        </div>
      </main>
    </div>
  );
}
