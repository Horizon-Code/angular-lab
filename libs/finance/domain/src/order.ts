export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop';

export interface OrderDraft {
  readonly side: OrderSide;
  readonly type: OrderType;
  readonly quantity: number;
  /** Required for limit and stop orders, in the instrument's quote currency. */
  readonly price?: number;
  /** Minimum price increment of the instrument. */
  readonly tickSize: number;
  /** For sell orders: held quantity minus quantity already in open sell orders. */
  readonly availablePosition?: number;
}

export type OrderIssue =
  | 'quantity-not-positive'
  | 'quantity-not-whole'
  | 'price-required'
  | 'price-not-positive'
  | 'price-off-tick'
  | 'position-exceeded';

/**
 * Client-side validation of an order draft. These rules can be enforced on the
 * client because it has all the data; the backend still has the final word.
 */
export function validateOrder(draft: OrderDraft): readonly OrderIssue[] {
  const issues: OrderIssue[] = [];

  if (!(draft.quantity > 0)) {
    issues.push('quantity-not-positive');
  } else if (!Number.isInteger(draft.quantity)) {
    issues.push('quantity-not-whole');
  }

  if (draft.type !== 'market') {
    if (draft.price === undefined) {
      issues.push('price-required');
    } else if (!(draft.price > 0)) {
      issues.push('price-not-positive');
    } else if (!isOnTick(draft.price, draft.tickSize)) {
      issues.push('price-off-tick');
    }
  }

  if (draft.side === 'sell' && draft.availablePosition !== undefined && draft.quantity > draft.availablePosition) {
    issues.push('position-exceeded');
  }

  return issues;
}

function isOnTick(price: number, tickSize: number): boolean {
  const steps = price / tickSize;
  return Math.abs(steps - Math.round(steps)) < 1e-9;
}
