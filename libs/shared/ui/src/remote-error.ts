import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Shown by a host when one of its remotes cannot be loaded. The rest of the
 * application keeps working (micro-frontends fail soft).
 */
@Component({
  selector: 'lab-remote-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card" role="alert">
      <h2>{{ area() }} is not available right now</h2>
      <p>We could not load this section. The rest of the app still works.</p>
      <button type="button" (click)="reload()">Try again</button>
    </section>
  `,
  styles: `
    .card { border: 1px solid var(--lab-border, #d9d7cf); border-radius: 12px; padding: 1.25rem 1.5rem; max-width: 36rem; }
    h2 { margin: 0 0 .25rem; font-size: 1.1rem; }
    p { margin: 0 0 1rem; color: var(--lab-muted, #6b6a65); }
    button { font: inherit; padding: .5rem 1rem; border-radius: 8px; border: 1px solid currentColor; background: none; cursor: pointer; }
    button:focus-visible { outline: 2px solid var(--lab-focus, #0f6e56); outline-offset: 2px; }
  `,
})
export class RemoteError {
  readonly area = input('This section');

  protected reload(): void {
    location.reload();
  }
}
