import { Routes } from '@angular/router';

/** Standalone mode: the banking product runs on its own with the same routes it exposes. */
export const routes: Routes = [{ path: '', loadChildren: () => import('./remote.routes').then((m) => m.routes) }];
