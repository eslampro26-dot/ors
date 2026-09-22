'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

// ============================================================
// البيانات — 10 لغات مطابقة لـ SUPPORTED_LOCALES
// ============================================================
const PRIVACY_DATA = {
  ar: {
    title: 'سياسة الخصوصية وأمان البيانات',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — الغردقة، البحر الأحمر، مصر',
    lastUpdated: 'آخر تحديث: سبتمبر 2025',
    badge: '🔒 سياسة الخصوصية',
    intro: 'نحن في منصة ORLUXUS نُولي حماية بياناتك الشخصية أولوية قصوى. تشرح هذه السياسة كيفية جمع بياناتك واستخدامها وحمايتها وفقاً لقانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020 ومعايير GDPR الأوروبية.',
    sections: [
      {
        title: '1. البيانات التي نجمعها',
        items: [
          'الاسم الكامل ورقم جواز السفر أو الهوية الوطنية',
          'عنوان البريد الإلكتروني ورقم الهاتف / واتساب',
          'تفاصيل الحجز (نوع الرحلة، التاريخ، عدد المسافرين)',
          'موقع الاستلام ومتطلبات خاصة بالرحلة',
          'بيانات الاتصال لإرسال قسيمة الحجز وتأكيد الموعد',
        ],
      },
      {
        title: '2. أمان بيانات الدفع',
        highlight: true,
        items: [
          '🔒 لا يتم تخزين أي بيانات بطاقتك البنكية (رقم البطاقة، CVV، تاريخ الانتهاء) على سيرفرات ORLUXUS.',
          '✅ جميع المدفوعات تتم عبر بيئة PayTabs المشفرة والمعتمدة بمعيار PCI DSS Level 1 — أعلى معايير أمان الدفع عالمياً.',
          '🛡️ بيانات بطاقتك محمية بتشفير SSL 256-bit طوال عملية الدفع.',
          '🔄 في حال الاسترداد: يُعاد المبلغ بنفس وسيلة الدفع الأصلية (نفس البطاقة البنكية) خلال 7 إلى 14 يوم عمل.',
          'PayTabs معتمد من Visa وMastercard وهيئة الرقابة المالية المصرية.',
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
          'قد نُفصح عن بياناتك للجهات الحكومية أو القضائية عند وجود التزام قانوني.',
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
          '🗑️ حق الحذف: يحق لك طلب حذف بياناتك بعد انتهاء الخدمة.',
          '🚫 حق الاعتراض: يحق لك الاعتراض على معالجة بياناتك في أي وقت.',
          'لممارسة هذه الحقوق: info@orluxus.com',
        ],
      },
      {
        title: '7. مدة الاحتفاظ بالبيانات',
        items: [
          'نحتفظ ببيانات الحجز لمدة 5 سنوات لأغراض المحاسبة والمطالبات القانونية.',
          'تُحذف البيانات غير الضرورية فور انتهاء الغرض منها.',
        ],
      },
    ],
    contact: 'للاستفسار عن سياسة الخصوصية: info@orluxus.com | WhatsApp: +201038820019',
    backHome: '← العودة للرئيسية',
    termsLink: '⚖️ الشروط والأحكام',
    deliveryLink: '📧 سياسة التسليم',
    refundLabel: 'استرداد خلال 7-14 يوم',
  },
  en: {
    title: 'Privacy & Data Security Policy',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — Hurghada, Red Sea, Egypt',
    lastUpdated: 'Last Updated: September 2025',
    badge: '🔒 Privacy Policy',
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
        title: '2. Payment Data Security',
        highlight: true,
        items: [
          '🔒 We do NOT store any of your card data (card number, CVV, expiry date) on ORLUXUS servers.',
          '✅ All payments are processed through PayTabs\' encrypted environment, certified to PCI DSS Level 1 — the highest global payment security standard.',
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
          'We only share the minimum necessary data with service providers (trip operators, transport) to complete your booking.',
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
          '🗑️ Right of Erasure: You may request deletion of your data after service completion.',
          '🚫 Right to Object: You may object to the processing of your data at any time.',
          'To exercise these rights: info@orluxus.com',
        ],
      },
      {
        title: '7. Data Retention Period',
        items: [
          'We retain booking data for 5 years for accounting and legal claim purposes.',
          'Unnecessary data is deleted as soon as its purpose is fulfilled.',
        ],
      },
    ],
    contact: 'For privacy inquiries: info@orluxus.com | WhatsApp: +201038820019',
    backHome: '← Back to Home',
    termsLink: '⚖️ Terms & Conditions',
    deliveryLink: '📧 Service Delivery',
    refundLabel: 'Refund in 7–14 business days',
  },
  de: {
    title: 'Datenschutz- und Datensicherheitsrichtlinie',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — Hurghada, Rotes Meer, Ägypten',
    lastUpdated: 'Zuletzt aktualisiert: September 2025',
    badge: '🔒 Datenschutzrichtlinie',
    intro: 'Bei ORLUXUS hat der Schutz Ihrer persönlichen Daten höchste Priorität. Diese Richtlinie erklärt, wie wir Ihre Daten erfassen, verwenden und schützen, gemäß dem ägyptischen Datenschutzgesetz Nr. 151/2020 und der DSGVO.',
    sections: [
      {
        title: '1. Von uns erfasste Daten',
        items: [
          'Vollständiger Name und Reisepass-/Personalausweisnummer',
          'E-Mail-Adresse und Telefon-/WhatsApp-Nummer',
          'Buchungsdetails (Reiseart, Datum, Reisende)',
          'Abholort und besondere Anforderungen',
          'Kontaktdaten zur Übermittlung des Buchungsvouchers',
        ],
      },
      {
        title: '2. Sicherheit der Zahlungsdaten',
        highlight: true,
        items: [
          '🔒 Wir speichern KEINE Kartendaten (Kartennummer, CVV, Ablaufdatum) auf ORLUXUS-Servern.',
          '✅ Alle Zahlungen erfolgen über die verschlüsselte Umgebung von PayTabs, zertifiziert nach PCI DSS Level 1.',
          '🛡️ Ihre Kartendaten sind durch 256-Bit-SSL-Verschlüsselung geschützt.',
          '🔄 Rückerstattungen werden innerhalb von 7–14 Werktagen auf die ursprüngliche Zahlungsmethode zurückgebucht.',
          'PayTabs ist von Visa und Mastercard zertifiziert.',
        ],
      },
      {
        title: '3. Verwendung Ihrer Daten',
        items: [
          'Buchungsbestätigung und Zusendung des Reisevouchers per E-Mail und WhatsApp',
          'Kontaktaufnahme vor der Reise zur Bestätigung der Details',
          'Übermittlung der elektronischen Rechnung nach Zahlung',
          'Beantwortung von Anfragen sowie Änderungs- und Stornierungsanfragen',
        ],
      },
      {
        title: '4. Ihre Rechte',
        items: [
          'Recht auf Auskunft, Berichtigung, Löschung und Widerspruch gemäß DSGVO.',
          'Für Datenschutzanfragen: info@orluxus.com',
        ],
      },
    ],
    contact: 'Datenschutzanfragen: info@orluxus.com | WhatsApp: +201038820019',
    backHome: '← Zurück zur Startseite',
    termsLink: '⚖️ Allgemeine Geschäftsbedingungen',
    deliveryLink: '📧 Servicelieferung',
    refundLabel: 'Erstattung in 7–14 Werktagen',
  },
  fr: {
    title: 'Politique de Confidentialité et de Sécurité des Données',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — Hurghada, Mer Rouge, Égypte',
    lastUpdated: 'Dernière mise à jour : Septembre 2025',
    badge: '🔒 Politique de confidentialité',
    intro: 'Chez ORLUXUS, la protection de vos données personnelles est notre priorité absolue. Cette politique explique comment nous collectons, utilisons et protégeons vos données conformément à la loi égyptienne n° 151/2020 et au RGPD européen.',
    sections: [
      {
        title: '1. Données collectées',
        items: [
          'Nom complet et numéro de passeport / pièce d\'identité',
          'Adresse e-mail et numéro de téléphone / WhatsApp',
          'Détails de la réservation (type de voyage, date, voyageurs)',
          'Lieu de prise en charge et exigences particulières',
          'Coordonnées pour l\'envoi du bon de réservation',
        ],
      },
      {
        title: '2. Sécurité des données de paiement',
        highlight: true,
        items: [
          '🔒 Nous ne stockons AUCUNE donnée bancaire sur les serveurs d\'ORLUXUS.',
          '✅ Tous les paiements sont traités via PayTabs, certifié PCI DSS Level 1.',
          '🛡️ Vos données sont protégées par un chiffrement SSL 256 bits.',
          '🔄 Remboursements : Les montants sont restitués sur la méthode initiale dans un délai de 7 à 14 jours ouvrables.',
          'PayTabs est certifié Visa et Mastercard.',
        ],
      },
      {
        title: '3. Utilisation de vos données',
        items: [
          'Confirmation de réservation et envoi du bon de voyage par e-mail et WhatsApp',
          'Contact avant le voyage pour confirmer les détails',
          'Envoi de la facture électronique après paiement',
          'Réponse à vos demandes de modification ou d\'annulation',
        ],
      },
      {
        title: '4. Vos droits',
        items: [
          'Droit d\'accès, de rectification, d\'effacement et d\'opposition conformément au RGPD.',
          'Pour exercer vos droits : info@orluxus.com',
        ],
      },
    ],
    contact: 'Pour toute demande : info@orluxus.com | WhatsApp : +201038820019',
    backHome: '← Retour à l\'accueil',
    termsLink: '⚖️ Conditions générales',
    deliveryLink: '📧 Politique de livraison',
    refundLabel: 'Remboursement en 7–14 jours ouvrables',
  },
  es: {
    title: 'Política de Privacidad y Seguridad de Datos',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — Hurghada, Mar Rojo, Egipto',
    lastUpdated: 'Última actualización: Septiembre 2025',
    badge: '🔒 Política de privacidad',
    intro: 'En ORLUXUS, la protección de sus datos personales es nuestra máxima prioridad. Esta política explica cómo recopilamos, usamos y protegemos sus datos de acuerdo con la ley egipcia n.º 151/2020 y el RGPD europeo.',
    sections: [
      {
        title: '1. Datos que recopilamos',
        items: [
          'Nombre completo y número de pasaporte / DNI',
          'Correo electrónico y número de teléfono / WhatsApp',
          'Detalles de la reserva (tipo de viaje, fecha, viajeros)',
          'Lugar de recogida y requisitos especiales',
        ],
      },
      {
        title: '2. Seguridad de los datos de pago',
        highlight: true,
        items: [
          '🔒 No almacenamos datos de su tarjeta bancaria en los servidores de ORLUXUS.',
          '✅ Todos los pagos se procesan a través de PayTabs, certificado PCI DSS Level 1.',
          '🛡️ Sus datos están protegidos con cifrado SSL de 256 bits.',
          '🔄 Reembolsos: Los importes se devuelven al método de pago original en 7–14 días hábiles.',
        ],
      },
      {
        title: '3. Sus derechos',
        items: [
          'Derecho de acceso, rectificación, supresión y oposición según el RGPD.',
          'Para consultas: info@orluxus.com',
        ],
      },
    ],
    contact: 'Consultas de privacidad: info@orluxus.com | WhatsApp: +201038820019',
    backHome: '← Volver al inicio',
    termsLink: '⚖️ Términos y condiciones',
    deliveryLink: '📧 Política de entrega',
    refundLabel: 'Reembolso en 7–14 días hábiles',
  },
  it: {
    title: 'Politica sulla Privacy e Sicurezza dei Dati',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — Hurghada, Mar Rosso, Egitto',
    lastUpdated: 'Ultimo aggiornamento: Settembre 2025',
    badge: '🔒 Informativa sulla privacy',
    intro: 'In ORLUXUS, la protezione dei tuoi dati personali è la nostra massima priorità. Questa politica spiega come raccogliamo, utilizziamo e proteggiamo i tuoi dati in conformità alla legge egiziana n. 151/2020 e al GDPR europeo.',
    sections: [
      {
        title: '1. Dati che raccogliamo',
        items: [
          'Nome completo e numero di passaporto / carta d\'identità',
          'Indirizzo e-mail e numero di telefono / WhatsApp',
          'Dettagli della prenotazione (tipo di viaggio, data, viaggiatori)',
          'Luogo di ritiro e requisiti speciali',
        ],
      },
      {
        title: '2. Sicurezza dei dati di pagamento',
        highlight: true,
        items: [
          '🔒 Non memorizziamo dati della tua carta bancaria sui server di ORLUXUS.',
          '✅ Tutti i pagamenti vengono elaborati tramite PayTabs, certificato PCI DSS Level 1.',
          '🛡️ I tuoi dati sono protetti con crittografia SSL a 256 bit.',
          '🔄 Rimborsi: Gli importi vengono restituiti al metodo di pagamento originale entro 7–14 giorni lavorativi.',
        ],
      },
      {
        title: '3. I tuoi diritti',
        items: [
          'Diritto di accesso, rettifica, cancellazione e opposizione ai sensi del GDPR.',
          'Per richieste: info@orluxus.com',
        ],
      },
    ],
    contact: 'Richieste privacy: info@orluxus.com | WhatsApp: +201038820019',
    backHome: '← Torna alla home',
    termsLink: '⚖️ Termini e condizioni',
    deliveryLink: '📧 Consegna del servizio',
    refundLabel: 'Rimborso in 7–14 giorni lavorativi',
  },
  ru: {
    title: 'Политика конфиденциальности и защиты данных',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — Хургада, Красное море, Египет',
    lastUpdated: 'Последнее обновление: сентябрь 2025',
    badge: '🔒 Политика конфиденциальности',
    intro: 'В ORLUXUS защита ваших персональных данных является нашим главным приоритетом. В данной политике объясняется, как мы собираем, используем и защищаем ваши данные в соответствии с египетским Законом № 151/2020 и европейским GDPR.',
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
        title: '2. Безопасность платёжных данных',
        highlight: true,
        items: [
          '🔒 Мы НЕ храним данные вашей банковской карты на серверах ORLUXUS.',
          '✅ Все платежи обрабатываются через защищённую среду PayTabs, сертифицированную по стандарту PCI DSS Level 1.',
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
    backHome: '← На главную',
    termsLink: '⚖️ Условия и положения',
    deliveryLink: '📧 Политика доставки',
    refundLabel: 'Возврат за 7–14 рабочих дней',
  },
  tr: {
    title: 'Gizlilik ve Veri Güvenliği Politikası',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — Hurgada, Kızıldeniz, Mısır',
    lastUpdated: 'Son güncelleme: Eylül 2025',
    badge: '🔒 Gizlilik Politikası',
    intro: 'ORLUXUS olarak kişisel verilerinizin korunması en öncelikli hedefimizdir. Bu politika, Mısır Kişisel Veri Koruma Kanunu 151/2020 ve Avrupa GDPR standartlarına uygun olarak verilerinizi nasıl topladığımızı açıklamaktadır.',
    sections: [
      {
        title: '1. Topladığımız Veriler',
        items: [
          'Tam ad ve pasaport / kimlik numarası',
          'E-posta adresi ve telefon / WhatsApp numarası',
          'Rezervasyon detayları (tur türü, tarih, yolcu sayısı)',
          'Otelden alış noktası ve özel gereksinimler',
        ],
      },
      {
        title: '2. Ödeme Veri Güvenliği',
        highlight: true,
        items: [
          '🔒 Kart verilerinizi (kart numarası, CVV, son kullanma tarihi) ORLUXUS sunucularında SAKLAMIYORUZ.',
          '✅ Tüm ödemeler PCI DSS Level 1 sertifikalı PayTabs güvenli ortamı üzerinden işlenir.',
          '🛡️ Kart verileriniz 256 bit SSL şifreleme ile korunmaktadır.',
          '🔄 İadeler: Tutarlar orijinal ödeme yöntemine 7–14 iş günü içinde iade edilir.',
        ],
      },
      {
        title: '3. Haklarınız',
        items: [
          'GDPR kapsamında erişim, düzeltme, silme ve itiraz hakları.',
          'Talepler için: info@orluxus.com',
        ],
      },
    ],
    contact: 'Gizlilik soruları: info@orluxus.com | WhatsApp: +201038820019',
    backHome: '← Ana sayfaya dön',
    termsLink: '⚖️ Şartlar ve Koşullar',
    deliveryLink: '📧 Hizmet Teslimatı',
    refundLabel: '7–14 iş günü içinde iade',
  },
  zh: {
    title: '隐私与数据安全政策',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — 赫尔格达，红海，埃及',
    lastUpdated: '最后更新：2025年9月',
    badge: '🔒 隐私政策',
    intro: '在ORLUXUS，保护您的个人数据是我们的首要任务。本政策依据埃及第151/2020号数据保护法及欧洲GDPR标准，说明我们如何收集、使用和保护您的数据。',
    sections: [
      {
        title: '1. 我们收集的数据',
        items: [
          '全名及护照/身份证号码',
          '电子邮件地址及电话/WhatsApp号码',
          '预订详情（旅行类型、日期、旅行人数）',
          '接送地点及特殊要求',
        ],
      },
      {
        title: '2. 支付数据安全',
        highlight: true,
        items: [
          '🔒 我们不在ORLUXUS服务器上存储您的银行卡数据（卡号、CVV、有效期）。',
          '✅ 所有付款均通过PayTabs的加密环境处理，获得PCI DSS Level 1认证。',
          '🛡️ 您的数据受256位SSL加密保护。',
          '🔄 退款：金额在7至14个工作日内退回原始付款方式（同一银行卡）。',
        ],
      },
      {
        title: '3. 您的权利',
        items: [
          '根据GDPR享有访问、更正、删除和反对权。',
          '查询请联系：info@orluxus.com',
        ],
      },
    ],
    contact: '隐私查询：info@orluxus.com | WhatsApp：+201038820019',
    backHome: '← 返回首页',
    termsLink: '⚖️ 条款与条件',
    deliveryLink: '📧 服务交付政策',
    refundLabel: '7–14个工作日内退款',
  },
  ja: {
    title: 'プライバシーおよびデータセキュリティポリシー',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — フルガダ、紅海、エジプト',
    lastUpdated: '最終更新日：2025年9月',
    badge: '🔒 プライバシーポリシー',
    intro: 'ORLUXUSでは、お客様の個人データの保護を最優先事項としています。本ポリシーは、エジプト個人データ保護法第151/2020号および欧州GDPRに準拠して、データの収集・使用・保護の方法を説明します。',
    sections: [
      {
        title: '1. 収集するデータ',
        items: [
          '氏名およびパスポート/身分証明書番号',
          'メールアドレスおよび電話番号/WhatsApp',
          '予約詳細（旅行の種類、日付、旅行者数）',
          'ホテルの送迎場所および特別な要望',
        ],
      },
      {
        title: '2. 決済データのセキュリティ',
        highlight: true,
        items: [
          '🔒 カードデータ（カード番号、CVV、有効期限）をORLUXUSのサーバーに保存することはありません。',
          '✅ すべての支払いはPCI DSS Level 1認定のPayTabs暗号化環境で処理されます。',
          '🛡️ お客様のデータは256ビットSSL暗号化で保護されています。',
          '🔄 返金：7〜14営業日以内に元の支払い方法（同一カード）に返金されます。',
        ],
      },
      {
        title: '3. お客様の権利',
        items: [
          'GDPRに基づくアクセス、訂正、削除、異議申し立ての権利。',
          'お問い合わせ：info@orluxus.com',
        ],
      },
    ],
    contact: 'プライバシーに関するお問い合わせ：info@orluxus.com | WhatsApp：+201038820019',
    backHome: '← ホームに戻る',
    termsLink: '⚖️ 利用規約',
    deliveryLink: '📧 サービス配信ポリシー',
    refundLabel: '7〜14営業日以内に返金',
  },
};

// Fallback: use English if locale not in PRIVACY_DATA
function getData(locale) {
  return PRIVACY_DATA[locale] || PRIVACY_DATA.en;
}

export default function PrivacyPage() {
  // ✅ يقرأ اللغة الحالية مباشرة من LanguageContext
  const { locale, setLocale } = useLanguage();
  const data = getData(locale);
  const isRtl = locale === 'ar';

  const LANG_OPTIONS = [
    { code: 'ar', flag: '🇪🇬', name: 'عربي' },
    { code: 'en', flag: '🇬🇧', name: 'EN' },
    { code: 'de', flag: '🇩🇪', name: 'DE' },
    { code: 'fr', flag: '🇫🇷', name: 'FR' },
    { code: 'es', flag: '🇪🇸', name: 'ES' },
    { code: 'it', flag: '🇮🇹', name: 'IT' },
    { code: 'ru', flag: '🇷🇺', name: 'RU' },
    { code: 'tr', flag: '🇹🇷', name: 'TR' },
    { code: 'zh', flag: '🇨🇳', name: 'ZH' },
    { code: 'ja', flag: '🇯🇵', name: 'JA' },
  ];

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, rgba(253,251,247,0.95) 0%, rgba(248,246,240,0.97) 100%)',
        color: '#1f2937',
        fontFamily: isRtl
          ? '"Cairo", "Tajawal", sans-serif'
          : '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        lineHeight: 1.75,
      }}
    >
      {/* Navigation */}
      <nav style={{ padding: '14px 24px', background: 'rgba(255,255,255,0.96)', borderBottom: '1px solid rgba(201,162,39,0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link href="/" style={{ color: '#8c6a12', textDecoration: 'none', fontWeight: '900', fontSize: '1.3rem', letterSpacing: '1px' }}>ORLUXUS</Link>
          <span style={{ color: '#6b7280', fontSize: '0.85rem', borderLeft: isRtl ? 'none' : '1px solid #d1d5db', borderRight: isRtl ? '1px solid #d1d5db' : 'none', paddingLeft: isRtl ? 0 : '12px', paddingRight: isRtl ? '12px' : 0 }}>
            {data.badge}
          </span>
        </div>
        {/* Language Switcher — يغير لغة الموقع كله */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {LANG_OPTIONS.map((l) => (
            <button
              key={l.code}
              onClick={() => setLocale(l.code)}
              title={l.name}
              style={{ padding: '4px 9px', borderRadius: '6px', border: locale === l.code ? '1.5px solid #c9a227' : '1px solid #e5e7eb', background: locale === l.code ? '#fef9ec' : '#fff', color: locale === l.code ? '#8c6a12' : '#6b7280', fontWeight: locale === l.code ? '700' : '400', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              {l.flag} {l.name}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #1a2744 100%)', borderRadius: '16px', padding: '2.5rem 2rem', marginBottom: '2rem', textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔒</div>
          <h1 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: '800', color: '#d4aa30', marginBottom: '0.5rem' }}>{data.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{data.subtitle}</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{data.lastUpdated}</p>
        </div>

        {/* Intro */}
        <p style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: '10px', padding: '1.2rem 1.5rem', fontSize: '0.95rem', color: '#92400e', marginBottom: '2rem' }}>{data.intro}</p>

        {/* Trust Badges */}
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '2px solid #86efac', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', textAlign: 'center' }}>
          {[{ icon: '🛡️', label: 'PCI DSS Level 1' }, { icon: '🔒', label: 'SSL 256-bit' }, { icon: '💳', label: 'Visa · Mastercard' }, { icon: '✅', label: 'PayTabs Certified' }].map((b) => (
            <div key={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '80px' }}>
              <span style={{ fontSize: '1.5rem' }}>{b.icon}</span>
              <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#166534' }}>{b.label}</span>
            </div>
          ))}
        </div>

        {/* Sections */}
        {data.sections.map((section, idx) => (
          <div key={idx} style={{ background: section.highlight ? 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)' : '#ffffff', border: section.highlight ? '2px solid #fbbf24' : '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.2rem', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '800', color: section.highlight ? '#92400e' : '#1e40af', marginBottom: '1rem', borderBottom: `2px solid ${section.highlight ? '#fbbf24' : '#dbeafe'}`, paddingBottom: '0.5rem' }}>
              {section.highlight && '⚠️ '}{section.title}
            </h2>
            <ul style={{ margin: 0, padding: isRtl ? '0 1.2rem 0 0' : '0 0 0 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {section.items.map((item, i) => (
                <li key={i} style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.7 }}>{item}</li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact */}
        <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#475569', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📧</div>
          <p style={{ margin: 0 }}>{data.contact}</p>
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
          <Link href="/" style={{ padding: '8px 20px', background: '#1e40af', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>{data.backHome}</Link>
          <Link href="/terms" style={{ padding: '8px 20px', background: '#d4aa30', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>{data.termsLink}</Link>
          <Link href="/service-delivery" style={{ padding: '8px 20px', background: '#059669', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>{data.deliveryLink}</Link>
        </div>
      </main>
    </div>
  );
}
