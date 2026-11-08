import { Routes } from '@angular/router';
import { OrderTicket } from './order-ticket';

/** Level 3 — Banking product, exposed to the Finance shell as `./routes`. */
export const routes: Routes = [{ path: '', component: OrderTicket, title: 'Banking · Angular Lab' }];
