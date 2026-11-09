import { Component, computed, input, linkedSignal, signal } from '@angular/core';
import type { CashAccount, Instrument, RateTable } from '@lab/finance-data-access';
import { BuyingPowerCheck, checkBuyingPower, money, OrderIssue, OrderSide, OrderType, validateOrder } from '@lab/finance-domain';

const ISSUE_TEXT: Readonly<Record<OrderIssue, string>> = {
  'quantity-not-positive': 'Enter a quantity greater than zero.',
  'quantity-not-whole': 'Quantity must be a whole number of shares.',
  'price-required': 'Enter a price for this order type.',
  'price-not-positive': 'The price must be greater than zero.',
  'price-off-tick': 'The price must be a multiple of the instrument tick size.',
  'position-exceeded': 'You cannot sell more than your available position.',
};

/** The order form. Receives its data from the page; owns only the client's entries. */
@Component({
  selector: 'banking-order-ticket',
  template: `
    <p class="lead">{{ cashAccount().name }}: {{ cash().amount }} {{ cash().currency }}. Checks here guide you; the bank validates the order at review.</p>

    <form class="ticket" (submit)="$event.preventDefault(); review()">
      <label>Instrument
        <select [value]="symbol()" (change)="symbol.set($any($event.target).value)">
          @for (i of instruments(); track i.symbol) {
            <option [value]="i.symbol">{{ i.symbol }} — {{ i.name }}</option>
          }
        </select>
      </label>

      <fieldset>
        <legend>Side</legend>
        <label><input type="radio" name="side" value="buy" [checked]="side() === 'buy'" (change)="side.set('buy')" /> Buy</label>
        <label><input type="radio" name="side" value="sell" [checked]="side() === 'sell'" (change)="side.set('sell')" /> Sell</label>
      </fieldset>

      <label>Order type
        <select [value]="type()" (change)="type.set($any($event.target).value)">
          <option value="market">Market</option>
          <option value="limit">Limit</option>
          <option value="stop">Stop</option>
        </select>
      </label>

      <label>Quantity
        <input type="number" inputmode="numeric" min="1" step="1" [value]="quantity()" (input)="quantity.set(+$any($event.target).value)" />
      </label>

      @if (type() !== 'market') {
        <label>{{ type() === 'limit' ? 'Limit' : 'Stop' }} price ({{ instrument().currency }})
          <input type="number" step="any" [value]="price() ?? ''" (input)="setPrice($any($event.target).value)" />
        </label>
      }

      <p class="estimate">
        Estimated {{ side() === 'buy' ? 'cost' : 'proceeds' }}:
        <strong>{{ estimate() }} {{ instrument().currency }}</strong>
        @if (instrument().currency === 'GBp') { <span class="hint">(pence — 100 GBp = 1 GBP)</span> }
      </p>

      <div aria-live="polite">
        @if (issues().length) {
          <ul class="issues">
            @for (issue of issues(); track issue) { <li>{{ issueText[issue] }}</li> }
          </ul>
        }
        @if (side() === 'buy' && buyingPower(); as bp) {
          @if (bp.kind === 'warning-insufficient') {
            <p class="warning">
              Your cash looks about {{ bp.shortfall.amount }} {{ bp.shortfall.currency }} short. You can still continue:
              the bank will confirm at review (for example if you have pending sales or a credit facility).
            </p>
          } @else {
            <p class="ok">Cash after this order: about {{ bp.remaining.amount }} {{ bp.remaining.currency }}.</p>
          }
        }
      </div>

      <button type="submit" [disabled]="issues().length > 0">Review order</button>
      @if (reviewed()) {
        <p class="next" role="status">Review step with server validation is the next spec (banking-review).</p>
      }
    </form>
  `,
  styles: `
    .lead { color: var(--lab-muted); margin: 0 0 1.25rem; max-width: 40rem; }
    .ticket { display: grid; gap: .9rem; max-width: 28rem; background: var(--lab-surface); border: 1px solid var(--lab-border); border-radius: 12px; padding: 1.25rem; }
    label { display: grid; gap: .3rem; font-weight: 600; font-size: .9rem; }
    fieldset { border: 0; padding: 0; margin: 0; display: flex; gap: 1rem; }
    legend { font-weight: 600; font-size: .9rem; margin-bottom: .3rem; }
    fieldset label { display: flex; gap: .4rem; align-items: center; font-weight: 400; }
    input, select { font: inherit; padding: .45rem .6rem; border-radius: 8px; border: 1px solid var(--lab-border); background: var(--lab-bg); color: var(--lab-ink); }
    .estimate { margin: 0; }
    .hint { color: var(--lab-muted); font-size: .85rem; }
    .issues { margin: 0; padding-left: 1.1rem; color: var(--lab-danger); }
    .warning { margin: 0; padding: .6rem .8rem; border-radius: 8px; background: var(--lab-warn-soft); color: var(--lab-warn); }
    .ok { margin: 0; color: var(--lab-muted); }
    button { font: inherit; font-weight: 600; padding: .6rem 1rem; border-radius: 8px; border: 0; background: var(--lab-accent); color: var(--lab-bg); cursor: pointer; }
    button:disabled { opacity: .5; cursor: not-allowed; }
    .next { margin: 0; color: var(--lab-muted); font-size: .9rem; }
  `,
})
export class OrderTicket {
  readonly instruments = input.required<readonly Instrument[]>();
  readonly cashAccount = input.required<CashAccount>();
  readonly rates = input.required<RateTable>();

  protected readonly issueText = ISSUE_TEXT;
  protected readonly cash = computed(() => this.cashAccount().available);

  protected readonly symbol = linkedSignal(() => this.instruments()[0]?.symbol ?? '');
  protected readonly side = signal<OrderSide>('buy');
  protected readonly type = signal<OrderType>('market');
  protected readonly quantity = signal(1);
  protected readonly price = signal<number | undefined>(undefined);
  protected readonly reviewed = signal(false);

  protected readonly instrument = computed(() => this.instruments().find((i) => i.symbol === this.symbol()) ?? this.instruments()[0]);

  private readonly unitPrice = computed(() => (this.type() === 'market' ? this.instrument().price : (this.price() ?? 0)));

  protected readonly estimate = computed(() => Math.round(this.unitPrice() * this.quantity() * 100) / 100);

  protected readonly issues = computed(() =>
    validateOrder({
      side: this.side(),
      type: this.type(),
      quantity: this.quantity(),
      price: this.type() === 'market' ? undefined : this.price(),
      tickSize: this.instrument().tickSize,
      availablePosition: this.instrument().held,
    }),
  );

  protected readonly buyingPower = computed<BuyingPowerCheck | null>(() => {
    if (this.estimate() <= 0) return null;
    return checkBuyingPower({ estimatedCost: money(this.estimate(), this.instrument().currency), available: this.cash(), rates: this.rates() });
  });

  protected setPrice(raw: string): void {
    this.price.set(raw === '' ? undefined : Number(raw));
  }

  protected review(): void {
    this.reviewed.set(true);
  }
}
