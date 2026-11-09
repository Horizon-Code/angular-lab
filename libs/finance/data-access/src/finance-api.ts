import { HttpClient, httpResource } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import {
  CashAccount,
  FINANCE_API,
  Instrument,
  OrderDraftRequest,
  PlaceOrderRequest,
  PlaceOrderResponse,
  PreviewResponse,
  RateTable,
} from './contract';

/** Commands against the finance API. Reads are exposed as resources (see `injectTicketData`). */
@Injectable({ providedIn: 'root' })
export class FinanceApi {
  private readonly http = inject(HttpClient);

  preview(draft: OrderDraftRequest): Observable<PreviewResponse> {
    return this.http.post<PreviewResponse>(`${FINANCE_API}/orders/preview`, draft);
  }

  placeOrder(request: PlaceOrderRequest): Observable<PlaceOrderResponse> {
    return this.http.post<PlaceOrderResponse>(`${FINANCE_API}/orders`, request);
  }
}

export interface TicketData {
  readonly instruments: readonly Instrument[];
  readonly cashAccount: CashAccount;
  readonly rates: RateTable;
}

/** One state for the three reads the ticket needs (loading, error, empty, data). */
export type TicketDataState =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | { readonly status: 'empty' }
  | { readonly status: 'ready'; readonly data: TicketData };

/**
 * Loads instruments, the cash account and rates. Must run in an injection
 * context. Any failed read makes the whole view an error (never an empty
 * ticket); `reload()` retries the reads.
 */
export function injectTicketData() {
  const instruments = httpResource<Instrument[]>(() => `${FINANCE_API}/instruments`);
  const cashAccount = httpResource<CashAccount>(() => `${FINANCE_API}/cash-account`);
  const rates = httpResource<RateTable>(() => `${FINANCE_API}/rates`);
  const all = [instruments, cashAccount, rates];

  const state = computed<TicketDataState>(() => {
    if (all.some((r) => r.status() === 'error')) return { status: 'error' };
    if (!instruments.hasValue() || !cashAccount.hasValue() || !rates.hasValue()) return { status: 'loading' };
    if (instruments.value().length === 0) return { status: 'empty' };
    return { status: 'ready', data: { instruments: instruments.value(), cashAccount: cashAccount.value(), rates: rates.value() } };
  });

  return {
    state,
    reload: () => all.forEach((r) => r.reload()),
  };
}
