import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'finance-home',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>Finance</h1>
    <p class="lead">An industry micro-frontend that hosts its own products. Each product deploys on its own.</p>
    <ul>
      <li><a routerLink="banking">Banking</a> — buy and sell equities and ETFs.</li>
      <li>Crypto — buy and sell crypto assets (coming soon).</li>
    </ul>
  `,
  styles: `
    h1 { margin: 0 0 .25rem; }
    .lead { color: var(--lab-muted); margin: 0 0 1rem; }
    li { margin: .25rem 0; }
  `,
})
export class FinanceHome {}
