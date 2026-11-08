import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Industry {
  readonly name: string;
  readonly path?: string;
  readonly summary: string;
  readonly products: readonly string[];
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>Industries</h1>
    <p class="lead">Each industry is its own micro-frontend, and a host for its products.</p>
    <ul class="grid">
      @for (industry of industries; track industry.name) {
        <li class="card" [class.disabled]="!industry.path">
          <h2>
            @if (industry.path) {
              <a [routerLink]="industry.path">{{ industry.name }}</a>
            } @else {
              {{ industry.name }} <small>coming soon</small>
            }
          </h2>
          <p>{{ industry.summary }}</p>
          <p class="products">{{ industry.products.join(' · ') }}</p>
        </li>
      }
    </ul>
  `,
  styles: `
    h1 { margin: 0 0 .25rem; }
    .lead { color: var(--lab-muted); margin: 0 0 1.5rem; }
    .grid { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); gap: 1rem; }
    .card { background: var(--lab-surface); border: 1px solid var(--lab-border); border-radius: 12px; padding: 1rem 1.25rem; }
    .card.disabled { opacity: .6; }
    h2 { margin: 0 0 .5rem; font-size: 1.15rem; }
    small { font-weight: 400; color: var(--lab-muted); font-size: .8rem; }
    p { margin: 0 0 .5rem; }
    .products { color: var(--lab-muted); font-size: .9rem; }
  `,
})
export class Home {
  protected readonly industries: readonly Industry[] = [
    {
      name: 'Finance',
      path: '/finance',
      summary: 'Banking and crypto journeys: buy and sell, orders, accounts.',
      products: ['Banking', 'Crypto (soon)'],
    },
    {
      name: 'Health',
      summary: 'A sibling industry with its own products, added without touching Finance.',
      products: ['Appointments', 'Prescriptions'],
    },
  ];
}
