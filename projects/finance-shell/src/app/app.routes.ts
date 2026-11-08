import { Routes } from '@angular/router';

/** Standalone mode: the finance shell runs on its own at /finance with the same routes it exposes. */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'finance' },
  { path: 'finance', loadChildren: () => import('./remote.routes').then((m) => m.routes) },
];
