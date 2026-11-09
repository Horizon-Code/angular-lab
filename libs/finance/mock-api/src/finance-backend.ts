import type { CashAccount, Instrument, OrderDraftRequest, PlaceOrderResponse, PreviewResponse, RateTable, RejectionReason } from '@lab/finance-data-access';
import { convert, money, round2 } from '@lab/finance-domain';
import type { MockScenario } from './scenarios';

/**
 * A tiny in-memory "bank" that implements the finance API contract. Pure
 * TypeScript: the Angular interceptor only adapts HTTP to these calls.
 * Prices and names are illustrative.
 */
export const INSTRUMENTS: readonly Instrument[] = [
  { symbol: 'VWCE', name: 'Global equity ETF (EUR)', price: 128.4, currency: 'EUR', tickSize: 0.02, held: 12 },
  { symbol: 'ACME', name: 'Acme Corp (USD)', price: 212.35, currency: 'USD', tickSize: 0.01, held: 0 },
  { symbol: 'BRIT', name: 'British Utilities (London, quoted in pence)', price: 1245, currency: 'GBp', tickSize: 0.5, held: 40 },
];
export const RATES: RateTable = { 'USD->EUR': 0.92, 'GBP->EUR': 1.17 };
export const CASH_ACCOUNT: CashAccount = { id: 'cash-eur-1', name: 'Everyday account (EUR)', available: { amount: 5000, currency: 'EUR' } };

/** Fee schedule of the mock bank: 0.1 % of the order value, minimum 1.50 in the account currency. */
const FEE_RATE = 0.001;
const MIN_FEE = 1.5;

export type MockResponse =
  | { readonly kind: 'ok'; readonly body: unknown; readonly delayMs: number }
  | { readonly kind: 'http-error'; readonly status: number; readonly delayMs: number }
  | { readonly kind: 'network-error'; readonly delayMs: number }
  | { readonly kind: 'not-found' };

export interface MockRequest {
  readonly method: string;
  /** Path relative to `/api/finance`, e.g. `/orders/preview`. */
  readonly path: string;
  readonly body?: unknown;
}

export class FinanceBackend {
  private nextId = 1;
  private readonly previews = new Map<string, OrderDraftRequest>();
  private readonly placed = new Map<string, string>();

  constructor(private readonly scenario: () => MockScenario) {}

  handle(request: MockRequest): MockResponse {
    const scenario = this.scenario();
    const delayMs = scenario === 'slow' ? 1500 : 150;
    const route = `${request.method.toUpperCase()} ${request.path}`;
    const known = ['GET /instruments', 'GET /cash-account', 'GET /rates', 'POST /orders/preview', 'POST /orders'];
    if (!known.includes(route)) return { kind: 'not-found' };

    if (scenario === 'server-error') return { kind: 'http-error', status: 500, delayMs };
    if (scenario === 'network-error') return { kind: 'network-error', delayMs };

    const ok = (body: unknown): MockResponse => ({ kind: 'ok', body, delayMs });
    switch (route) {
      case 'GET /instruments':
        return ok(scenario === 'empty' ? [] : INSTRUMENTS);
      case 'GET /cash-account':
        return ok(CASH_ACCOUNT);
      case 'GET /rates':
        return ok(RATES);
      case 'POST /orders/preview': {
        const draft = request.body as OrderDraftRequest;
        if (!INSTRUMENTS.some((i) => i.symbol === draft.symbol)) return { kind: 'http-error', status: 400, delayMs };
        return ok(this.preview(draft, scenario));
      }
      default: {
        const { previewId } = request.body as { previewId: string };
        if (!this.previews.has(previewId)) return { kind: 'http-error', status: 404, delayMs };
        return ok(this.place(previewId));
      }
    }
  }

  private preview(draft: OrderDraftRequest, scenario: MockScenario): PreviewResponse {
    if (scenario.startsWith('rejected:')) {
      return { outcome: 'rejected', reason: scenario.slice('rejected:'.length) as RejectionReason };
    }
    const instrument = INSTRUMENTS.find((i) => i.symbol === draft.symbol)!;

    const accountCurrency = CASH_ACCOUNT.available.currency;
    const unitPrice = draft.type === 'market' || draft.price === undefined ? instrument.price : draft.price;
    const value = convert(money(unitPrice * draft.quantity, instrument.currency), accountCurrency, RATES);
    const fees = round2(money(Math.max(MIN_FEE, value.amount * FEE_RATE), accountCurrency));
    const sign = draft.side === 'buy' ? 1 : -1;
    const estimatedTotal = round2(money(value.amount + sign * fees.amount, accountCurrency));
    const fxRate = instrument.currency === accountCurrency ? undefined : convert(money(1, instrument.currency), accountCurrency, RATES).amount;

    const previewId = `PV-${this.nextId++}`;
    this.previews.set(previewId, draft);
    return { outcome: 'ok', previewId, estimatedTotal, fees, ...(fxRate !== undefined ? { fxRate } : {}), consentRequired: scenario === 'requires-consent' };
  }

  /** Idempotent per preview: confirming the same preview twice returns the same order. */
  private place(previewId: string): PlaceOrderResponse {
    let orderId = this.placed.get(previewId);
    if (!orderId) {
      orderId = `ORD-${String(this.nextId++).padStart(6, '0')}`;
      this.placed.set(previewId, orderId);
    }
    return { outcome: 'accepted', orderId, status: 'open' };
  }
}
