import { Routes } from '@angular/router';
import { loadRemoteRoutes } from '@lab/shared-ui';
import { FinanceHome } from './finance-home';
import { FinanceLayout } from './finance-layout';
import { resolveProductEntry } from './product-manifest';

/**
 * Level 2 — Finance industry. Exposed to the root shell as `./routes`, and at
 * the same time a host for the finance products (level 3). Product URLs come
 * from this micro's own manifest, not from the root shell's.
 */
export const routes: Routes = [
  {
    path: '',
    component: FinanceLayout,
    children: [
      { path: '', component: FinanceHome, title: 'Finance · Angular Lab' },
      {
        path: 'banking',
        title: 'Banking · Angular Lab',
        loadChildren: () =>
          loadRemoteRoutes({
            remoteName: 'finance-banking',
            area: 'Banking',
            remoteEntry: () => resolveProductEntry('finance-banking'),
          }),
      },
    ],
  },
];
