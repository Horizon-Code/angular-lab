import { convert, MajorCurrency, Money, RateTable, round2 } from './money';

/**
 * The frontend informs, the backend decides.
 *
 * This check only produces a *warning*: the client may have an overdraft,
 * pending sales or a credit facility the frontend cannot see. It must never
 * block submission; the backend's validation at the review step is final.
 */
export type BuyingPowerCheck =
  | { readonly kind: 'enough'; readonly remaining: Money }
  | { readonly kind: 'warning-insufficient'; readonly shortfall: Money };

export interface BuyingPowerInput {
  /** Estimated total cost of the order in the instrument's trading currency. */
  readonly estimatedCost: Money;
  /** Cash available in the selected cash account, in that account's currency. */
  readonly available: Money;
  readonly rates: RateTable;
}

export function checkBuyingPower({ estimatedCost, available, rates }: BuyingPowerInput): BuyingPowerCheck {
  const accountCurrency = available.currency as MajorCurrency;
  const costInAccountCurrency = convert(estimatedCost, accountCurrency, rates);
  const difference = available.amount - costInAccountCurrency.amount;

  if (difference >= 0) {
    return { kind: 'enough', remaining: round2({ amount: difference, currency: accountCurrency }) };
  }
  return { kind: 'warning-insufficient', shortfall: round2({ amount: -difference, currency: accountCurrency }) };
}
