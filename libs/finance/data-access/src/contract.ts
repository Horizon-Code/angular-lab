import type { Currency, MajorCurrency, Money, OrderSide, OrderType, RateTable } from '@lab/finance-domain';

/**
 * Contract of the finance API (`/api/finance`), see specs/banking-review.md.
 * The mock API implements it in the browser; a real BFF can replace it
 * without touching the components.
 */
export const FINANCE_API = '/api/finance';

export interface Instrument {
  readonly symbol: string;
  readonly name: string;
  /** Last price in the trading currency. */
  readonly price: number;
  readonly currency: Currency;
  readonly tickSize: number;
  /** Quantity the client holds and can sell (held minus open sell orders). */
  readonly held: number;
}

export interface CashAccount {
  readonly id: string;
  readonly name: string;
  readonly available: Money & { readonly currency: MajorCurrency };
}

export type { RateTable };

export interface OrderDraftRequest {
  readonly symbol: string;
  readonly side: OrderSide;
  readonly type: OrderType;
  readonly quantity: number;
  readonly price?: number;
  readonly cashAccountId: string;
}

export type RejectionReason = 'insufficient-funds' | 'market-closed' | 'invalid-price' | 'position-exceeded';

export interface Rejection {
  readonly outcome: 'rejected';
  readonly reason: RejectionReason;
}

export type PreviewResponse =
  | {
      readonly outcome: 'ok';
      readonly previewId: string;
      /** Estimated total in the cash account's currency, fees included. */
      readonly estimatedTotal: Money;
      readonly fees: Money;
      /** 1 unit of the trading currency in the cash account's currency, when they differ. */
      readonly fxRate?: number;
      readonly consentRequired: boolean;
    }
  | Rejection;

export interface PlaceOrderRequest {
  readonly previewId: string;
}

export type PlaceOrderResponse =
  | { readonly outcome: 'accepted'; readonly orderId: string; readonly status: 'open' | 'executed' }
  | Rejection;
