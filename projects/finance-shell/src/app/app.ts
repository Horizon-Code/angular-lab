import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Dev shell used only when this micro-frontend runs standalone. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<main style="padding: 1.5rem"><router-outlet /></main>`,
})
export class App {}
