import { describe, expect, it } from 'vitest';
import { checkBuyingPower, convert, CurrencyConversionError, money, round2, validateOrder } from './index';

describe('money', () => {
  it('treats pence as a different currency from pounds (100 GBp = 1 GBP)', () => {
    expect(convert(money(250, 'GBp'), 'GBP', {})).toEqual(money(2.5, 'GBP'));
  });

  it('converts with a direct rate', () => {
    expect(convert(money(10, 'USD'), 'EUR', { 'USD->EUR': 0.9 })).toEqual(money(9, 'EUR'));
  });

  it('converts with the inverse rate when only the opposite pair exists', () => {
    expect(round2(convert(money(9, 'EUR'), 'USD', { 'USD->EUR': 0.9 }))).toEqual(money(10, 'USD'));
  });

  it('fails loudly when no rate exists instead of comparing raw numbers', () => {
    expect(() => convert(money(1, 'CHF'), 'EUR', {})).toThrow(CurrencyConversionError);
  });

  it('rounds half away from zero to 2 decimals', () => {
    expect(round2(money(1.005, 'EUR'))).toEqual(money(1.01, 'EUR'));
    expect(round2(money(-1.005, 'EUR'))).toEqual(money(-1.01, 'EUR'));
  });
});

describe('checkBuyingPower — the frontend informs, the backend decides', () => {
  it('reports the remaining cash when the order fits', () => {
    const result = checkBuyingPower({ estimatedCost: money(400, 'EUR'), available: money(1000, 'EUR'), rates: {} });
    expect(result).toEqual({ kind: 'enough', remaining: money(600, 'EUR') });
  });

  it('compares in the cash account currency: 5,000 GBp costs 50 GBP, not 5,000', () => {
    const result = checkBuyingPower({ estimatedCost: money(5000, 'GBp'), available: money(100, 'GBP'), rates: {} });
    expect(result).toEqual({ kind: 'enough', remaining: money(50, 'GBP') });
  });

  it('returns a warning (never a block) with the shortfall when cash looks insufficient', () => {
    const result = checkBuyingPower({
      estimatedCost: money(1200, 'USD'),
      available: money(1000, 'EUR'),
      rates: { 'USD->EUR': 0.9 },
    });
    expect(result).toEqual({ kind: 'warning-insufficient', shortfall: money(80, 'EUR') });
  });
});

describe('validateOrder', () => {
  const base = { side: 'buy', type: 'limit', quantity: 10, price: 12.5, tickSize: 0.05 } as const;

  it('accepts a valid limit order', () => {
    expect(validateOrder(base)).toEqual([]);
  });

  it('requires a positive whole quantity', () => {
    expect(validateOrder({ ...base, quantity: 0 })).toContain('quantity-not-positive');
    expect(validateOrder({ ...base, quantity: 1.5 })).toContain('quantity-not-whole');
  });

  it('requires a positive price on the tick grid for limit and stop orders', () => {
    expect(validateOrder({ ...base, price: undefined })).toContain('price-required');
    expect(validateOrder({ ...base, price: 0 })).toContain('price-not-positive');
    expect(validateOrder({ ...base, price: 12.52 })).toContain('price-off-tick');
  });

  it('does not require a price for market orders', () => {
    expect(validateOrder({ ...base, type: 'market', price: undefined })).toEqual([]);
  });

  it('does not let a sell order exceed the available position', () => {
    expect(validateOrder({ ...base, side: 'sell', availablePosition: 5 })).toContain('position-exceeded');
  });
});
