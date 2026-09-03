import { NextResponse } from 'next/server';
import { DEFAULT_EXCHANGE_RATES } from '@/lib/currency';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // Cache for 24 hours

// In-memory cache for fast response
let cachedRates = {
  rates: { ...DEFAULT_EXCHANGE_RATES },
  lastFetched: 0
};

const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export async function GET() {
  const now = Date.now();

  // Return cached rates if fresh
  if (now - cachedRates.lastFetched < CACHE_TTL_MS && cachedRates.rates.EGP > 0) {
    return NextResponse.json({
      success: true,
      base: 'EUR',
      rates: cachedRates.rates,
      source: 'cache',
      lastUpdated: new Date(cachedRates.lastFetched).toISOString()
    });
  }

  // Attempt to fetch fresh rates from Open Exchange Rates Free API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://open.er-api.com/v6/latest/EUR', {
      signal: controller.signal,
      next: { revalidate: 86400 }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.rates && data.rates.EGP && data.rates.USD) {
        const freshRates = {
          EUR: 1.0,
          USD: Number((data.rates.USD || 1.08).toFixed(3)),
          GBP: Number((data.rates.GBP || 0.85).toFixed(3)),
          SAR: Number((data.rates.SAR || 4.05).toFixed(3)),
          EGP: Number((data.rates.EGP || 53.5).toFixed(2))
        };

        cachedRates = {
          rates: freshRates,
          lastFetched: now
        };

        return NextResponse.json({
          success: true,
          base: 'EUR',
          rates: freshRates,
          source: 'live',
          lastUpdated: new Date(now).toISOString()
        });
      }
    }
  } catch (err) {
    console.warn('[exchange-rates] Failed to fetch live rates, falling back to defaults:', err.message);
  }

  // Fallback to defaults if live fetch failed
  return NextResponse.json({
    success: true,
    base: 'EUR',
    rates: cachedRates.rates || DEFAULT_EXCHANGE_RATES,
    source: 'fallback',
    lastUpdated: new Date().toISOString()
  });
}
