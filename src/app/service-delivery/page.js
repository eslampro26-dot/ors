'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

// ============================================================
// البيانات — 10 لغات مطابقة لـ SUPPORTED_LOCALES
// ============================================================
const DELIVERY_DATA = {
  ar: {
    title: 'سياسة تقديم الخدمة والتسليم',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — الغردقة، البحر الأحمر، مصر',
    lastUpdated: 'آخر تحديث: سبتمبر 2025',
    badge: '📧 سياسة تقديم الخدمة',
    intro: 'تُوضح هذه الوثيقة بشكل دقيق كيف ومتى يتلقى العميل تأكيد حجزه بعد إتمام عملية الدفع، ومسؤوليات ORLUXUS في إتمام تقديم الخدمة المتفق عليها.',
    stepLabel: 'الخطوة',
    steps: [
      { num: '1', icon: '💳', title: 'إتمام الدفع', desc: 'يقوم العميل بسداد قيمة الحجز عبر بوابة الدفع الآمنة (PayTabs / PayPal / تحويل بنكي). تُعالَج المدفوعات البنكية في بيئة PayTabs المشفرة (PCI DSS Level 1).' },
      { num: '2', icon: '✅', title: 'تأكيد الحجز الفوري (خلال دقائق)', desc: 'فور نجاح الدفع، يُرسل النظام تلقائياً رسالة تأكيد فورية عبر البريد الإلكتروني المُدخل في نموذج الحجز، تحتوي على رقم مرجعي فريد للحجز.', highlight: true },
      { num: '3', icon: '📧', title: 'إرسال Voucher الرحلة (خلال 15-60 دقيقة)', desc: 'يُرسل مستشار الحجز قسيمة الرحلة (Voucher) الرسمية عبر البريد الإلكتروني وواتساب في أقرب وقت ممكن بعد تأكيد الدفع.', highlight: true },
      {
        num: '4', icon: '📋', title: 'محتويات قسيمة الحجز (Voucher)',
        content: [
          'رقم مرجعي فريد للحجز (Booking Reference Number)',
          'اسم الرحلة أو الخدمة المحجوزة بالكامل',
          'تاريخ ووقت الرحلة بدقة',
          'نقطة الالتقاء أو فندق الاستلام والوقت',
          'عدد المسافرين (بالغون / أطفال)',
          'ملاحظات وتفاصيل الخدمة والإضافات المطلوبة',
          'بيانات التواصل الطارئ لمستشار الرحلة',
          'سياسة الإلغاء المطبقة على هذا الحجز تحديداً',
        ],
      },
      { num: '5', icon: '📞', title: 'التواصل قبل الرحلة (24 ساعة مسبقاً)', desc: 'يتواصل فريقنا مع العميل قبل موعد الرحلة بـ 24 ساعة عبر واتساب لتأكيد جميع التفاصيل: وقت الاستلام، مكان الالتقاء، وأي متطلبات خاصة.' },
      { num: '6', icon: '🚗', title: 'يوم الرحلة', desc: 'يلتزم مزود الخدمة بالوصول في الوقت المحدد لاستلام العميل. في حالة أي تأخير أو تعديل، يتم إبلاغ العميل فورياً عبر واتساب.' },
    ],
    notesTitle: '⚠️ ملاحظات مهمة',
    notes: [
      { icon: '🔄', text: 'في حالة رفض الدفع: لا يُعدّ الحجز مؤكداً ولا يُرسل أي Voucher حتى يتم تأكيد الدفع بنجاح.' },
      { icon: '📩', text: 'تأكد من إدخال عنوان بريدك الإلكتروني بشكل صحيح في نموذج الحجز لاستلام التأكيد.' },
      { icon: '📱', text: 'تحقق من مجلد البريد الاحتياطي (Spam) إذا لم تصلك رسالة التأكيد خلال 10 دقائق.' },
      { icon: '💰', text: 'طبيعة الخدمة رقمية — لا يوجد منتج مادي يُشحن. الـ Voucher هو وثيقتك الرسمية الوحيدة.' },
      { icon: '🔁', text: 'سياسة الاسترداد: في حالة الإلغاء، يُعاد المبلغ بنفس وسيلة الدفع الأصلية (نفس البطاقة البنكية) خلال 7-14 يوم عمل.' },
    ],
    contact: 'لأي استفسار بخصوص حجزك: info@orluxus.com | WhatsApp: +201038820019',
    emergency: 'خط الطوارئ: +201038820014 (متاح 24/7)',
    backHome: '← العودة للرئيسية',
    termsLink: '⚖️ الشروط والأحكام',
    privacyLink: '🔒 سياسة الخصوصية',
  },
  en: {
    title: 'Service Delivery Policy',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — Hurghada, Red Sea, Egypt',
    lastUpdated: 'Last Updated: September 2025',
    badge: '📧 Service Delivery Policy',
    intro: 'This document precisely outlines how and when clients receive their booking confirmation after completing payment, and ORLUXUS responsibilities in fulfilling the agreed service.',
    stepLabel: 'Step',
    steps: [
      { num: '1', icon: '💳', title: 'Payment Completion', desc: 'The client pays the booking value through the secure payment gateway (PayTabs / PayPal / Bank Transfer). Card payments are processed in PayTabs\' encrypted environment (PCI DSS Level 1).' },
      { num: '2', icon: '✅', title: 'Instant Booking Confirmation (Within Minutes)', desc: 'Upon successful payment, the system automatically sends an instant confirmation email to the address entered in the booking form, containing a unique booking reference number.', highlight: true },
      { num: '3', icon: '📧', title: 'Trip Voucher Delivery (Within 15–60 Minutes)', desc: 'A booking advisor sends the official Trip Voucher via email and WhatsApp as soon as possible after payment confirmation.', highlight: true },
      {
        num: '4', icon: '📋', title: 'Booking Voucher Contents',
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
      { num: '5', icon: '📞', title: 'Pre-Trip Contact (24 Hours Prior)', desc: 'Our team contacts the client 24 hours before the trip via WhatsApp to confirm all details: pickup time, meeting point, and any special requirements.' },
      { num: '6', icon: '🚗', title: 'Day of the Trip', desc: 'The service provider is committed to arriving at the agreed time. In case of any delay or modification, the client will be notified immediately via WhatsApp.' },
    ],
    notesTitle: '⚠️ Important Notes',
    notes: [
      { icon: '🔄', text: 'If payment is declined: The booking is NOT confirmed and no Voucher is sent until payment is successfully confirmed.' },
      { icon: '📩', text: 'Make sure to enter your email address correctly in the booking form to receive the confirmation.' },
      { icon: '📱', text: 'Check your Spam folder if you do not receive a confirmation email within 10 minutes.' },
      { icon: '💰', text: 'The service is digital in nature — no physical product is shipped. The Voucher is your only official document.' },
      { icon: '🔁', text: 'Refund Policy: In case of cancellation, the amount is returned to the original payment method (same bank card) within 7–14 business days.' },
    ],
    contact: 'For booking inquiries: info@orluxus.com | WhatsApp: +201038820019',
    emergency: 'Emergency Line: +201038820014 (Available 24/7)',
    backHome: '← Back to Home',
    termsLink: '⚖️ Terms & Conditions',
    privacyLink: '🔒 Privacy Policy',
  },
  de: {
    title: 'Serviceleistungs- und Lieferrichtlinie',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — Hurghada, Rotes Meer, Ägypten',
    lastUpdated: 'Zuletzt aktualisiert: September 2025',
    badge: '📧 Servicelieferungsrichtlinie',
    intro: 'Dieses Dokument beschreibt präzise, wie und wann Kunden ihre Buchungsbestätigung nach Abschluss der Zahlung erhalten.',
    stepLabel: 'Schritt',
    steps: [
      { num: '1', icon: '💳', title: 'Zahlungsabschluss', desc: 'Der Kunde zahlt den Buchungsbetrag über das sichere Zahlungsgateway (PayTabs / PayPal / Banküberweisung).' },
      { num: '2', icon: '✅', title: 'Sofortige Buchungsbestätigung', desc: 'Nach erfolgreicher Zahlung sendet das System automatisch eine Bestätigungs-E-Mail an die angegebene Adresse mit einer eindeutigen Buchungsreferenznummer.', highlight: true },
      { num: '3', icon: '📧', title: 'Reisegutschein-Lieferung (15–60 Minuten)', desc: 'Ein Buchungsberater sendet den offiziellen Reisegutschein per E-Mail und WhatsApp nach Zahlungsbestätigung.', highlight: true },
      { num: '4', icon: '📞', title: 'Kontakt vor der Reise (24 Stunden vorher)', desc: 'Unser Team kontaktiert den Kunden 24 Stunden vor der Reise per WhatsApp zur Bestätigung aller Details.' },
    ],
    notesTitle: '⚠️ Wichtige Hinweise',
    notes: [
      { icon: '🔁', text: 'Rückerstattungsrichtlinie: Bei Stornierung wird der Betrag auf die ursprüngliche Zahlungsmethode innerhalb von 7–14 Werktagen zurückgebucht.' },
      { icon: '📩', text: 'Bitte geben Sie Ihre E-Mail-Adresse korrekt ein, um die Bestätigung zu erhalten.' },
    ],
    contact: 'Für Buchungsanfragen: info@orluxus.com | WhatsApp: +201038820019',
    emergency: 'Notfallhotline: +201038820014 (24/7 verfügbar)',
    backHome: '← Zurück zur Startseite',
    termsLink: '⚖️ AGB',
    privacyLink: '🔒 Datenschutzrichtlinie',
  },
  fr: {
    title: 'Politique de Prestation de Services et de Livraison',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — Hurghada, Mer Rouge, Égypte',
    lastUpdated: 'Dernière mise à jour : Septembre 2025',
    badge: '📧 Politique de livraison de service',
    intro: 'Ce document décrit précisément comment et quand les clients reçoivent leur confirmation de réservation après le paiement.',
    stepLabel: 'Étape',
    steps: [
      { num: '1', icon: '💳', title: 'Paiement effectué', desc: 'Le client règle la réservation via la passerelle de paiement sécurisée (PayTabs / PayPal / Virement bancaire).' },
      { num: '2', icon: '✅', title: 'Confirmation immédiate', desc: 'Dès confirmation du paiement, le système envoie automatiquement un e-mail de confirmation avec un numéro de référence unique.', highlight: true },
      { num: '3', icon: '📧', title: 'Livraison du bon de voyage (15–60 minutes)', desc: 'Un conseiller envoie le bon de voyage officiel par e-mail et WhatsApp dans les meilleurs délais.', highlight: true },
      { num: '4', icon: '📞', title: 'Contact avant le voyage (24 heures avant)', desc: 'Notre équipe contacte le client 24 heures avant le voyage pour confirmer tous les détails.' },
    ],
    notesTitle: '⚠️ Notes importantes',
    notes: [
      { icon: '🔁', text: 'Politique de remboursement : En cas d\'annulation, le montant est restitué sur la méthode initiale dans un délai de 7 à 14 jours ouvrables.' },
      { icon: '📩', text: 'Vérifiez vos courriers indésirables si vous ne recevez pas la confirmation dans les 10 minutes.' },
    ],
    contact: 'Pour toute demande : info@orluxus.com | WhatsApp : +201038820019',
    emergency: 'Ligne d\'urgence : +201038820014 (24h/24)',
    backHome: '← Retour à l\'accueil',
    termsLink: '⚖️ CGV',
    privacyLink: '🔒 Confidentialité',
  },
  es: {
    title: 'Política de Prestación de Servicios y Entrega',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — Hurghada, Mar Rojo, Egipto',
    lastUpdated: 'Última actualización: Septiembre 2025',
    badge: '📧 Política de entrega del servicio',
    intro: 'Este documento describe cómo y cuándo los clientes reciben su confirmación de reserva tras el pago.',
    stepLabel: 'Paso',
    steps: [
      { num: '1', icon: '💳', title: 'Pago completado', desc: 'El cliente paga a través de la pasarela segura (PayTabs / PayPal / Transferencia bancaria).' },
      { num: '2', icon: '✅', title: 'Confirmación inmediata', desc: 'Tras el pago exitoso, el sistema envía automáticamente un correo de confirmación con un número de referencia único.', highlight: true },
      { num: '3', icon: '📧', title: 'Entrega del bono de viaje (15–60 minutos)', desc: 'Un asesor envía el bono oficial por correo y WhatsApp lo antes posible.', highlight: true },
    ],
    notesTitle: '⚠️ Notas importantes',
    notes: [
      { icon: '🔁', text: 'Política de reembolso: En caso de cancelación, el importe se devuelve al método de pago original en 7–14 días hábiles.' },
    ],
    contact: 'Consultas de reserva: info@orluxus.com | WhatsApp: +201038820019',
    emergency: 'Línea de emergencia: +201038820014 (24/7)',
    backHome: '← Volver al inicio',
    termsLink: '⚖️ Términos',
    privacyLink: '🔒 Privacidad',
  },
  it: {
    title: 'Politica di Erogazione del Servizio e Consegna',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — Hurghada, Mar Rosso, Egitto',
    lastUpdated: 'Ultimo aggiornamento: Settembre 2025',
    badge: '📧 Politica di consegna del servizio',
    intro: 'Questo documento descrive con precisione come e quando i clienti ricevono la conferma della prenotazione dopo il pagamento.',
    stepLabel: 'Passo',
    steps: [
      { num: '1', icon: '💳', title: 'Pagamento completato', desc: 'Il cliente paga tramite il gateway sicuro (PayTabs / PayPal / Bonifico bancario).' },
      { num: '2', icon: '✅', title: 'Conferma immediata', desc: 'Dopo il pagamento riuscito, il sistema invia automaticamente un\'e-mail di conferma con un numero di riferimento univoco.', highlight: true },
      { num: '3', icon: '📧', title: 'Consegna del voucher (15–60 minuti)', desc: 'Un consulente invia il voucher ufficiale via e-mail e WhatsApp al più presto.', highlight: true },
    ],
    notesTitle: '⚠️ Note importanti',
    notes: [
      { icon: '🔁', text: 'Politica di rimborso: In caso di cancellazione, l\'importo viene restituito al metodo di pagamento originale entro 7–14 giorni lavorativi.' },
    ],
    contact: 'Per richieste di prenotazione: info@orluxus.com | WhatsApp: +201038820019',
    emergency: 'Linea di emergenza: +201038820014 (24/7)',
    backHome: '← Torna alla home',
    termsLink: '⚖️ Termini',
    privacyLink: '🔒 Privacy',
  },
  ru: {
    title: 'Политика оказания услуг и доставки',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — Хургада, Красное море, Египет',
    lastUpdated: 'Последнее обновление: сентябрь 2025',
    badge: '📧 Политика доставки услуги',
    intro: 'Данный документ точно описывает, как и когда клиенты получают подтверждение бронирования после оплаты.',
    stepLabel: 'Шаг',
    steps: [
      { num: '1', icon: '💳', title: 'Завершение оплаты', desc: 'Клиент оплачивает бронирование через защищённый платёжный шлюз (PayTabs / PayPal / Банковский перевод).' },
      { num: '2', icon: '✅', title: 'Мгновенное подтверждение', desc: 'После успешной оплаты система автоматически отправляет подтверждение на указанный адрес электронной почты.', highlight: true },
      { num: '3', icon: '📧', title: 'Доставка ваучера (15–60 минут)', desc: 'Консультант по бронированию отправляет официальный ваучер по электронной почте и в WhatsApp.', highlight: true },
      { num: '4', icon: '📞', title: 'Контакт перед поездкой (за 24 часа)', desc: 'Наша команда связывается с клиентом за 24 часа до поездки через WhatsApp.' },
    ],
    notesTitle: '⚠️ Важные примечания',
    notes: [
      { icon: '🔁', text: 'Политика возврата: при отмене сумма возвращается на оригинальный способ оплаты в течение 7–14 рабочих дней.' },
      { icon: '📩', text: 'Проверьте папку «Спам», если не получили подтверждение в течение 10 минут.' },
    ],
    contact: 'По вопросам бронирования: info@orluxus.com | WhatsApp: +201038820019',
    emergency: 'Экстренная линия: +201038820014 (24/7)',
    backHome: '← На главную',
    termsLink: '⚖️ Условия',
    privacyLink: '🔒 Конфиденциальность',
  },
  tr: {
    title: 'Hizmet Sunumu ve Teslimat Politikası',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — Hurgada, Kızıldeniz, Mısır',
    lastUpdated: 'Son güncelleme: Eylül 2025',
    badge: '📧 Hizmet Teslimat Politikası',
    intro: 'Bu belge, müşterilerin ödeme tamamlandıktan sonra rezervasyon onaylarını nasıl ve ne zaman aldıklarını açıklamaktadır.',
    stepLabel: 'Adım',
    steps: [
      { num: '1', icon: '💳', title: 'Ödeme Tamamlama', desc: 'Müşteri, güvenli ödeme ağ geçidi (PayTabs / PayPal / Banka Havalesi) aracılığıyla ödeme yapar.' },
      { num: '2', icon: '✅', title: 'Anında Rezervasyon Onayı', desc: 'Başarılı ödemeden sonra sistem, benzersiz bir rezervasyon referans numarası içeren onay e-postasını otomatik gönderir.', highlight: true },
      { num: '3', icon: '📧', title: 'Seyahat Kuponu Teslimi (15–60 Dakika)', desc: 'Rezervasyon danışmanı, ödeme onayının ardından resmi Seyahat Kuponunu e-posta ve WhatsApp ile gönderir.', highlight: true },
    ],
    notesTitle: '⚠️ Önemli Notlar',
    notes: [
      { icon: '🔁', text: 'İptal politikası: İptal durumunda tutar, orijinal ödeme yöntemine 7–14 iş günü içinde iade edilir.' },
    ],
    contact: 'Rezervasyon sorguları: info@orluxus.com | WhatsApp: +201038820019',
    emergency: 'Acil hat: +201038820014 (7/24 mevcut)',
    backHome: '← Ana sayfaya dön',
    termsLink: '⚖️ Şartlar',
    privacyLink: '🔒 Gizlilik',
  },
  zh: {
    title: '服务提供与交付政策',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — 赫尔格达，红海，埃及',
    lastUpdated: '最后更新：2025年9月',
    badge: '📧 服务交付政策',
    intro: '本文件详细说明了客户在完成付款后如何以及何时收到预订确认，以及ORLUXUS履行约定服务的责任。',
    stepLabel: '步骤',
    steps: [
      { num: '1', icon: '💳', title: '完成付款', desc: '客户通过安全支付网关（PayTabs / PayPal / 银行转账）支付预订费用。' },
      { num: '2', icon: '✅', title: '即时预订确认', desc: '付款成功后，系统自动向预订表格中填写的电子邮件地址发送包含唯一预订参考号的确认邮件。', highlight: true },
      { num: '3', icon: '📧', title: '行程凭证发送（15–60分钟）', desc: '预订顾问尽快通过电子邮件和WhatsApp发送官方行程凭证。', highlight: true },
    ],
    notesTitle: '⚠️ 重要提示',
    notes: [
      { icon: '🔁', text: '退款政策：如取消，金额将在7至14个工作日内退回原始付款方式（同一银行卡）。' },
    ],
    contact: '预订咨询：info@orluxus.com | WhatsApp：+201038820019',
    emergency: '紧急热线：+201038820014（全天候24小时）',
    backHome: '← 返回首页',
    termsLink: '⚖️ 条款与条件',
    privacyLink: '🔒 隐私政策',
  },
  ja: {
    title: 'サービス提供・配信ポリシー',
    subtitle: 'ORLUXUS MARKETING AND BRANDING — フルガダ、紅海、エジプト',
    lastUpdated: '最終更新日：2025年9月',
    badge: '📧 サービス配信ポリシー',
    intro: '本書は、お客様が支払い完了後に予約確認をいつどのように受け取るかを詳細に説明しています。',
    stepLabel: 'ステップ',
    steps: [
      { num: '1', icon: '💳', title: '支払い完了', desc: 'お客様は安全な決済ゲートウェイ（PayTabs / PayPal / 銀行振込）で予約金額を支払います。' },
      { num: '2', icon: '✅', title: '即時予約確認', desc: '支払い成功後、システムは予約フォームに入力されたメールアドレスに一意の予約参照番号を含む確認メールを自動送信します。', highlight: true },
      { num: '3', icon: '📧', title: '旅行バウチャー送付（15〜60分以内）', desc: '予約担当者が支払い確認後できるだけ早くメールとWhatsAppで公式バウチャーを送付します。', highlight: true },
    ],
    notesTitle: '⚠️ 重要事項',
    notes: [
      { icon: '🔁', text: '返金ポリシー：キャンセルの場合、7〜14営業日以内に元の支払い方法（同一カード）に返金されます。' },
    ],
    contact: 'ご予約に関するお問い合わせ：info@orluxus.com | WhatsApp：+201038820019',
    emergency: '緊急ライン：+201038820014（24時間対応）',
    backHome: '← ホームに戻る',
    termsLink: '⚖️ 利用規約',
    privacyLink: '🔒 プライバシーポリシー',
  },
};

function getData(locale) {
  return DELIVERY_DATA[locale] || DELIVERY_DATA.en;
}

export default function ServiceDeliveryPage() {
  // ✅ يقرأ اللغة من LanguageContext تلقائياً
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
        background: 'linear-gradient(180deg, rgba(240,249,255,0.96) 0%, rgba(224,242,254,0.97) 100%)',
        color: '#1f2937',
        fontFamily: isRtl
          ? '"Cairo", "Tajawal", sans-serif'
          : '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        lineHeight: 1.75,
      }}
    >
      {/* Navigation */}
      <nav style={{ padding: '14px 24px', background: 'rgba(255,255,255,0.96)', borderBottom: '1px solid rgba(14,165,233,0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)', flexWrap: 'wrap', gap: '12px' }}>
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
              style={{ padding: '4px 9px', borderRadius: '6px', border: locale === l.code ? '1.5px solid #0ea5e9' : '1px solid #e5e7eb', background: locale === l.code ? '#f0f9ff' : '#fff', color: locale === l.code ? '#0369a1' : '#6b7280', fontWeight: locale === l.code ? '700' : '400', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              {l.flag} {l.name}
            </button>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)', borderRadius: '16px', padding: '2.5rem 2rem', marginBottom: '2rem', textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📧</div>
          <h1 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: '800', color: '#bae6fd', marginBottom: '0.5rem' }}>{data.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{data.subtitle}</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{data.lastUpdated}</p>
        </div>

        {/* Intro */}
        <p style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '1.2rem 1.5rem', fontSize: '0.95rem', color: '#0c4a6e', marginBottom: '2rem' }}>{data.intro}</p>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2rem' }}>
          {data.steps.map((step, idx) => (
            <div key={idx} style={{ background: step.highlight ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : '#ffffff', border: step.highlight ? '2px solid #86efac' : '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', gap: '1.2rem', alignItems: 'flex-start', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: step.highlight ? '#16a34a' : '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                {step.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <span style={{ background: step.highlight ? '#16a34a' : '#0369a1', color: '#fff', borderRadius: '4px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: '700' }}>
                    {data.stepLabel} {step.num}
                  </span>
                  <h3 style={{ margin: 0, fontSize: '0.97rem', fontWeight: '800', color: step.highlight ? '#166534' : '#1e40af' }}>{step.title}</h3>
                </div>
                {step.desc && <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151', lineHeight: 1.7 }}>{step.desc}</p>}
                {step.content && (
                  <ul style={{ margin: '0.5rem 0 0 0', padding: isRtl ? '0 1.2rem 0 0' : '0 0 0 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {step.content.map((item, i) => <li key={i} style={{ fontSize: '0.88rem', color: '#374151' }}>{item}</li>)}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Important Notes */}
        {data.notes && (
          <div style={{ background: '#fffbeb', border: '2px solid #fbbf24', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '800', color: '#92400e' }}>{data.notesTitle}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {data.notes.map((note, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.9rem', color: '#78350f' }}>
                  <span style={{ flexShrink: 0 }}>{note.icon}</span>
                  <span>{note.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1.2rem', textAlign: 'center', fontSize: '0.88rem', color: '#475569' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>📧</div>
            <p style={{ margin: 0 }}>{data.contact}</p>
          </div>
          <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', padding: '1.2rem', textAlign: 'center', fontSize: '0.88rem', color: '#9f1239' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🚨</div>
            <p style={{ margin: 0 }}>{data.emergency}</p>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
          <Link href="/" style={{ padding: '8px 20px', background: '#1e40af', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>{data.backHome}</Link>
          <Link href="/terms" style={{ padding: '8px 20px', background: '#d4aa30', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>{data.termsLink}</Link>
          <Link href="/privacy" style={{ padding: '8px 20px', background: '#059669', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>{data.privacyLink}</Link>
        </div>
      </main>
    </div>
  );
}
