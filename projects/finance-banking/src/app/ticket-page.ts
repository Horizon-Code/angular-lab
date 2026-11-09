import { Component } from '@angular/core';
import { injectTicketData } from '@lab/finance-data-access';
import { OrderTicket } from './order-ticket';

/** Buy/sell page: loads what the ticket needs and renders loading, error, empty or the ticket (spec banking-review, AC-1 – AC-4). */
@Component({
  selector: 'banking-ticket-page',
  imports: [OrderTicket],
  template: `
    <h1>Buy or sell</h1>
    @let state = data.state();
    @switch (state.status) {
      @case ('loading') {
        <p class="state" role="status">Loading instruments and your cash account…</p>
      }
      @case ('error') {
        <section class="state error" role="alert">
          <p>We couldn't load your instruments and cash account.</p>
          <button type="button" (click)="data.reload()">Try again</button>
        </section>
      }
      @case ('empty') {
        <p class="state" role="status">There are no instruments available to trade right now.</p>
      }
      @case ('ready') {
        <banking-order-ticket [instruments]="state.data.instruments" [cashAccount]="state.data.cashAccount" [rates]="state.data.rates" />
      }
    }
  `,
  styles: `
    h1 { margin: 0 0 .25rem; }
    .state { color: var(--lab-muted); max-width: 28rem; }
    .error { border: 1px solid var(--lab-border); border-radius: 12px; padding: 1rem 1.25rem; color: var(--lab-ink); }
    .error p { margin: 0 0 .75rem; }
    button { font: inherit; font-weight: 600; padding: .5rem 1rem; border-radius: 8px; border: 1px solid currentColor; background: none; color: inherit; cursor: pointer; }
    button:focus-visible { outline: 2px solid var(--lab-focus, #0f6e56); outline-offset: 2px; }
  `,
})
export class TicketPage {
  protected readonly data = injectTicketData();
}
