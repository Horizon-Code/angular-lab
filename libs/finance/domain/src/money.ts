/**
 * Money is a value plus a currency. Minor-unit quote currencies (e.g. GBp,
 * pence) are distinct currencies: 100 GBp = 1 GBP. Amounts are compared only
 * after converting both sides to the same currency.
 */
export type MajorCurrency = 'EUR' | 'USD' | 'GBP' | 'CHF';
export type MinorCurrency = 'GBp';
export type Currency = MajorCurrency | MinorCurrency;

export interface Money {
  readonly amount: number;
  readonly currency: Currency;
}

/** Exchange rates expressed as: 1 unit of `from` = `rate` units of `to`. */
export type RateTable = Readonly<Partial<Record<`${MajorCurrency}->${MajorCurrency}`, number>>>;

const MINOR_TO_MAJOR: Readonly<Record<MinorCurrency, { major: MajorCurrency; factor: number }>> = {
  GBp: { major: 'GBP', factor: 100 },
};

export class CurrencyConversionError extends Error {
  constructor(from: Currency, to: Currency) {
    super(`No exchange rate from ${from} to ${to}`);
    this.name = 'CurrencyConversionError';
  }
}

export function money(amount: number, currency: Currency): Money {
  if (!Number.isFinite(amount)) {
    throw new RangeError(`Invalid amount: ${amount}`);
  }
  return { amount, currency };
}

function toMajor(value: Money): { amount: number; currency: MajorCurrency } {
  if (value.currency in MINOR_TO_MAJOR) {
    const { major, factor } = MINOR_TO_MAJOR[value.currency as MinorCurrency];
    return { amount: value.amount / factor, currency: major };
  }
  return { amount: value.amount, currency: value.currency as MajorCurrency };
}

/** Converts `value` into `target`, normalising minor units first. */
export function convert(value: Money, target: MajorCurrency, rates: RateTable): Money {
  const major = toMajor(value);
  if (major.currency === target) {
    return money(major.amount, target);
  }
  const direct = rates[`${major.currency}->${target}`];
  if (direct !== undefined) {
    return money(major.amount * direct, target);
  }
  const inverse = rates[`${target}->${major.currency}`];
  if (inverse !== undefined && inverse !== 0) {
    return money(major.amount / inverse, target);
  }
  throw new CurrencyConversionError(value.currency, target);
}

/** Rounds to 2 decimals using half-away-from-zero, as displayed to clients. */
export function round2(value: Money): Money {
  // Shift the decimal point in the string representation to avoid binary
  // floating-point artefacts (1.005 * 100 === 100.49999999999999).
  const sign = Math.sign(value.amount);
  const shifted = Math.round(Number(`${Math.abs(value.amount)}e2`));
  const rounded = sign * Number(`${shifted}e-2`);
  return money(rounded === 0 ? 0 : rounded, value.currency);
}
