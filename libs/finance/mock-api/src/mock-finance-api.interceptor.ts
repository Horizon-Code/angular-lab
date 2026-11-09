import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject, InjectionToken } from '@angular/core';
import { FINANCE_API } from '@lab/finance-data-access';
import { delay, mergeMap, Observable, of, throwError, timer } from 'rxjs';
import { FinanceBackend } from './finance-backend';
import { MockScenario, parseScenario } from './scenarios';

/** Active scenario. Defaults to `?scenario=` in the URL; tests provide their own. */
export const MOCK_SCENARIO = new InjectionToken<() => MockScenario>('MOCK_SCENARIO', {
  providedIn: 'root',
  factory: () => () => parseScenario(new URLSearchParams(globalThis.location?.search ?? '').get('scenario')),
});

const BACKEND = new InjectionToken<FinanceBackend>('MOCK_FINANCE_BACKEND', {
  providedIn: 'root',
  factory: () => new FinanceBackend(inject(MOCK_SCENARIO)),
});

/**
 * Serves `/api/finance/*` from the in-memory backend, before any request
 * leaves the browser. Everything else passes through untouched.
 */
export const mockFinanceApi: HttpInterceptorFn = (req, next) => {
  const url = new URL(req.url, 'http://lab.local');
  if (!url.pathname.startsWith(FINANCE_API)) return next(req);

  const response = inject(BACKEND).handle({ method: req.method, path: url.pathname.slice(FINANCE_API.length), body: req.body });
  switch (response.kind) {
    case 'ok':
      return of<HttpEvent<unknown>>(new HttpResponse({ status: 200, body: response.body, url: req.url })).pipe(delay(response.delayMs));
    case 'http-error':
      return fail(new HttpErrorResponse({ status: response.status, statusText: 'Server Error', url: req.url }), response.delayMs);
    case 'network-error':
      return fail(new HttpErrorResponse({ status: 0, statusText: 'Unknown Error', url: req.url, error: new ProgressEvent('error') }), response.delayMs);
    case 'not-found':
      return fail(new HttpErrorResponse({ status: 404, statusText: 'Not Found', url: req.url }), 0);
  }
};

function fail(error: HttpErrorResponse, delayMs: number): Observable<never> {
  return timer(delayMs).pipe(mergeMap(() => throwError(() => error)));
}
