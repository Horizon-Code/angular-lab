import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="top">
      <a routerLink="/" class="brand">Angular Lab</a>
      <nav aria-label="Industries">
        <a routerLink="/finance" routerLinkActive="active">Finance</a>
        <span class="soon" aria-disabled="true">Health · soon</span>
      </nav>
    </header>
    <main><router-outlet /></main>
  `,
  styles: `
    .top { display: flex; align-items: center; gap: 2rem; padding: .75rem 1.5rem; border-bottom: 1px solid var(--lab-border); background: var(--lab-surface); }
    .brand { font-weight: 700; text-decoration: none; color: var(--lab-ink); }
    nav { display: flex; gap: 1.25rem; align-items: center; }
    nav a { text-decoration: none; color: var(--lab-muted); padding: .25rem 0; border-bottom: 2px solid transparent; }
    nav a.active { color: var(--lab-ink); border-bottom-color: var(--lab-accent); }
    .soon { color: var(--lab-muted); opacity: .6; font-size: .9rem; }
    main { padding: 1.5rem; }
  `,
})
export class App {}
