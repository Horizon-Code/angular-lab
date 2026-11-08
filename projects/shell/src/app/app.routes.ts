import { Routes } from '@angular/router';
import { loadRemoteRoutes } from '@lab/shared-ui';
import { Home } from './home';

/**
 * Level 1 — root shell. Loads one micro-frontend per industry. Remote URLs come
 * from public/federation.manifest.json, so environments change without a rebuild.
 */
export const routes: Routes = [
  { path: '', component: Home, title: 'Angular Lab' },
  {
    path: 'finance',
    title: 'Finance · Angular Lab',
    loadChildren: () => loadRemoteRoutes({ remoteName: 'finance-shell', area: 'Finance' }),
  },
  { path: '**', redirectTo: '' },
];
