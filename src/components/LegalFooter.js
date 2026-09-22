'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const FOOTER_TEXT = {
  ar:  { terms: 'الشروط والأحكام', privacy: 'سياسة الخصوصية', delivery: 'سياسة تقديم الخدمة', cancel: 'الإلغاء والاسترداد', refund: 'استرداد 7-14 يوم', location: 'الغردقة، البحر الأحمر، مصر' },
  en:  { terms: 'Terms & Conditions', privacy: 'Privacy Policy', delivery: 'Service Delivery', cancel: 'Refund & Cancellation', refund: 'Refund in 7–14 days', location: 'Hurghada, Red Sea, Egypt' },
  de:  { terms: 'AGB', privacy: 'Datenschutz', delivery: 'Servicelieferung', cancel: 'Stornierung & Erstattung', refund: 'Erstattung in 7–14 Tagen', location: 'Hurghada, Rotes Meer, Ägypten' },
  fr:  { terms: 'CGV', privacy: 'Confidentialité', delivery: 'Livraison de service', cancel: 'Annulation & Remboursement', refund: 'Remboursement en 7–14 jours', location: 'Hurghada, Mer Rouge, Égypte' },
  es:  { terms: 'Términos', privacy: 'Privacidad', delivery: 'Entrega de servicio', cancel: 'Cancelación y Reembolso', refund: 'Reembolso en 7–14 días', location: 'Hurghada, Mar Rojo, Egipto' },
  it:  { terms: 'Termini', privacy: 'Privacy', delivery: 'Consegna servizio', cancel: 'Annullamento e Rimborso', refund: 'Rimborso in 7–14 giorni', location: 'Hurghada, Mar Rosso, Egitto' },
  ru:  { terms: 'Условия', privacy: 'Конфиденциальность', delivery: 'Доставка услуг', cancel: 'Отмена и возврат', refund: 'Возврат за 7–14 дней', location: 'Хургада, Красное море, Египет' },
  tr:  { terms: 'Şartlar', privacy: 'Gizlilik', delivery: 'Hizmet teslimatı', cancel: 'İptal ve İade', refund: '7–14 günde iade', location: 'Hurgada, Kızıldeniz, Mısır' },
  zh:  { terms: '条款与条件', privacy: '隐私政策', delivery: '服务交付', cancel: '退款与取消', refund: '7–14个工作日退款', location: '赫尔格达，红海，埃及' },
  ja:  { terms: '利用規約', privacy: 'プライバシー', delivery: 'サービス配信', cancel: 'キャンセルと返金', refund: '7〜14日で返金', location: 'フルガダ、紅海、エジプト' },
};

export default function LegalFooter() {
  // ✅ يقرأ اللغة الحالية من LanguageContext — يتغير تلقائياً مع الموقع
  const { locale } = useLanguage();
  const txt = FOOTER_TEXT[locale] || FOOTER_TEXT.en;
  const isRtl = locale === 'ar';

  return (
    <footer
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        background: 'rgba(10, 14, 26, 0.97)',
        borderTop: '1px solid rgba(201, 162, 39, 0.2)',
        padding: '1.4rem 1.5rem 1rem',
        marginTop: 'auto',
      }}
    >
      {/* Legal Policy Links */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.4rem 1.2rem', marginBottom: '0.9rem' }}>
        {[
          { href: '/terms', label: txt.terms },
          { href: '/privacy', label: txt.privacy },
          { href: '/service-delivery', label: txt.delivery },
          { href: '/terms#cancellation', label: txt.cancel },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{ color: 'rgba(201, 162, 39, 0.85)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '500' }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Security Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '0.5rem 1.5rem', marginBottom: '0.9rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
        <span>🔒 SSL 256-bit Encrypted</span>
        <span>🛡️ PCI DSS Compliant</span>
        <span>💳 Visa · Mastercard · PayTabs</span>
        <span>🔄 {txt.refund}</span>
      </div>

      {/* Company info */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
        <span>© {new Date().getFullYear()} ORLUXUS MARKETING AND BRANDING — {txt.location}</span>
      </div>
    </footer>
  );
}
