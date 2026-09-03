// Multi-Currency and Exchange Rate Configuration for ORLUXUS
// Base catalog prices are defined in EUR (€)

export const SUPPORTED_CURRENCIES = {
  EUR: {
    code: 'EUR',
    symbol: '€',
    nameEn: 'Euro',
    nameAr: 'يورو',
    flag: '🇪🇺',
    decimals: 0
  },
  USD: {
    code: 'USD',
    symbol: '$',
    nameEn: 'US Dollar',
    nameAr: 'دولار أمريكي',
    flag: '🇺🇸',
    decimals: 0
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    nameEn: 'British Pound',
    nameAr: 'جنيه إسترليني',
    flag: '🇬🇧',
    decimals: 0
  },
  SAR: {
    code: 'SAR',
    symbol: 'SAR',
    nameEn: 'Saudi Riyal',
    nameAr: 'ريال سعودي',
    flag: '🇸🇦',
    decimals: 0
  },
  EGP: {
    code: 'EGP',
    symbol: 'EGP',
    nameEn: 'Egyptian Pound',
    nameAr: 'جنيه مصري',
    flag: '🇪🇬',
    decimals: 0
  }
};

// Fallback daily central bank exchange rates (relative to 1 EUR)
export const DEFAULT_EXCHANGE_RATES = {
  EUR: 1.0,
  USD: 1.08,
  GBP: 0.85,
  SAR: 4.05,
  EGP: 53.5
};

export const DEFAULT_CURRENCY = 'EUR';

/**
 * Converts an amount from base EUR to the specified target currency
 */
export function convertFromEur(amountEur, targetCurrency = 'EUR', rates = DEFAULT_EXCHANGE_RATES) {
  const num = Number(amountEur) || 0;
  if (num <= 0) return 0;
  const rate = rates[targetCurrency] || DEFAULT_EXCHANGE_RATES[targetCurrency] || 1.0;
  return Math.round(num * rate);
}

/**
 * Calculates the exact EGP settlement amount for any currency and amount
 */
export function calculateEgpSettlement(amount, fromCurrency = 'EUR', rates = DEFAULT_EXCHANGE_RATES) {
  const num = Number(amount) || 0;
  if (num <= 0) return { egpAmount: 0, appliedRate: rates.EGP || 53.5 };

  const currentRates = { ...DEFAULT_EXCHANGE_RATES, ...rates };
  const fromRate = currentRates[fromCurrency] || 1.0;
  const egpRate = currentRates.EGP || 53.5;

  // Convert to EUR base first, then to EGP
  const amountInEur = fromCurrency === 'EUR' ? num : num / fromRate;
  const egpAmount = Math.round(amountInEur * egpRate);
  const directEgpRate = fromCurrency === 'EGP' ? 1.0 : (egpAmount / num);

  return {
    egpAmount,
    appliedRate: Number(directEgpRate.toFixed(3)),
    amountInEur: Number(amountInEur.toFixed(2))
  };
}

/**
 * Formats a dual price display (e.g. €500 (approx. 26,750 EGP))
 */
export function formatDualPrice(amountEur, targetCurrency = 'EUR', rates = DEFAULT_EXCHANGE_RATES, isAr = false) {
  const numEur = Number(amountEur) || 0;
  const targetCurr = SUPPORTED_CURRENCIES[targetCurrency] || SUPPORTED_CURRENCIES.EUR;
  const converted = convertFromEur(numEur, targetCurrency, rates);
  const { egpAmount } = calculateEgpSettlement(numEur, 'EUR', rates);

  const primaryFormatted = `${targetCurr.symbol}${converted.toLocaleString()}`;
  const egpFormatted = `${egpAmount.toLocaleString()} ${isAr ? 'ج.م' : 'EGP'}`;

  return {
    primaryFormatted,
    convertedAmount: converted,
    targetCurrency: targetCurr.code,
    symbol: targetCurr.symbol,
    egpAmount,
    egpFormatted,
    dualText: targetCurr.code === 'EGP' ? egpFormatted : `${primaryFormatted} (${isAr ? 'تقريباً' : 'approx.'} ${egpFormatted})`
  };
}
