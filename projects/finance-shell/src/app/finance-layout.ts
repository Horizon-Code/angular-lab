import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'finance-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="finance">
      <nav aria-label="Finance products">
        <p class="label">Finance</p>
        <a routerLink="./" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Overview</a>
        <a routerLink="banking" routerLinkActive="active">Banking</a>
        <span class="soon" aria-disabled="true">Crypto · soon</span>
      </nav>
      <section class="content"><router-outlet /></section>
    </div>
  `,
  styles: `
    .finance { display: grid; grid-template-columns: 12rem 1fr; gap: 1.5rem; }
    nav { display: flex; flex-direction: column; gap: .25rem; }
    .label { font-size: .75rem; text-transform: uppercase; letter-spacing: .08em; color: var(--lab-muted); margin: 0 0 .5rem; }
    nav a { text-decoration: none; color: var(--lab-ink); padding: .4rem .6rem; border-radius: 8px; }
    nav a.active { background: var(--lab-accent-soft); color: var(--lab-accent); font-weight: 600; }
    .soon { color: var(--lab-muted); opacity: .6; padding: .4rem .6rem; font-size: .9rem; }
    @media (max-width: 40rem) { .finance { grid-template-columns: 1fr; } nav { flex-direction: row; flex-wrap: wrap; } }
  `,
})
export class FinanceLayout {}
