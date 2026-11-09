import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { Routes } from '@angular/router';
import { mockFinanceApi } from '@lab/finance-mock-api';
import { TicketPage } from './ticket-page';

/**
 * Level 3 — Banking product, exposed to the Finance shell as `./routes`.
 * The product owns its backend wiring: its HTTP client and the mock API are
 * provided here, so the hosts know nothing about banking's API.
 */
export const routes: Routes = [
  {
    path: '',
    providers: [provideHttpClient(withFetch(), withInterceptors([mockFinanceApi]))],
    children: [{ path: '', component: TicketPage, title: 'Banking · Angular Lab' }],
  },
];
