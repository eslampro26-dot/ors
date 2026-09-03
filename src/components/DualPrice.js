'use client';

import { useCurrency } from '@/context/CurrencyContext';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Renders an amount in the active currency with its approximate EGP equivalent.
 * e.g., €50 (approx. 2,675 EGP)
 */
export default function DualPrice({
  amount,
  baseCurrency = '€',
  style = {},
  className = '',
  layout = 'inline', // 'inline' | 'stacked'
  color = 'var(--gold-500)',
  fontSize = 'inherit'
}) {
  const { currency, formatDual, rates } = useCurrency();
  const { locale } = useLanguage();
  const isAr = locale === 'ar';

  const num = Number(amount) || 0;
  // If base price was already marked as EGP, calculate accordingly, otherwise treat base as EUR
  const isBaseEgp = baseCurrency === 'EGP' || baseCurrency === 'ج.م';
  const effectiveEur = isBaseEgp ? (num / (rates?.EGP || 53.5)) : num;

  const dual = formatDual(effectiveEur, isAr);

  if (currency === 'EGP') {
    return (
      <span className={className} style={{ fontFamily: 'var(--font-en)', color, fontSize, fontWeight: '800', ...style }}>
        {dual.egpFormatted}
      </span>
    );
  }

  if (layout === 'stacked') {
    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', ...style }}>
        <span style={{ fontFamily: 'var(--font-en)', color, fontSize, fontWeight: '800' }}>
          {dual.primaryFormatted}
        </span>
        <span style={{ fontSize: '0.75em', color: 'var(--text-tertiary)', fontWeight: '500' }}>
          {isAr ? 'تقريباً' : 'approx.'} {dual.egpFormatted}
        </span>
      </div>
    );
  }

  return (
    <span className={className} style={{ ...style }}>
      <strong style={{ fontFamily: 'var(--font-en)', color, fontSize, fontWeight: '800' }}>
        {dual.primaryFormatted}
      </strong>{' '}
      <small style={{ fontSize: '0.78em', color: 'var(--text-tertiary)', fontWeight: '500' }}>
        ({isAr ? 'تقريباً' : 'approx.'} {dual.egpFormatted})
      </small>
    </span>
  );
}
