import { describe, expect, it } from 'vitest';
import { FinanceBackend } from './finance-backend';
import { type MockScenario, parseScenario } from './scenarios';

const backend = (scenario: MockScenario) => new FinanceBackend(() => scenario);
const draft = { symbol: 'ACME', side: 'buy', type: 'market', quantity: 10, cashAccountId: 'cash-eur-1' } as const;

describe('mock finance API — scenarios', () => {
  it('serves instruments, cash account and rates in the accepted scenario', () => {
    const b = backend('accepted');
    expect(b.handle({ method: 'GET', path: '/instruments' })).toMatchObject({ kind: 'ok', body: expect.arrayContaining([expect.objectContaining({ symbol: 'VWCE' })]) });
    expect(b.handle({ method: 'GET', path: '/cash-account' })).toMatchObject({ kind: 'ok', body: { available: { currency: 'EUR' } } });
    expect(b.handle({ method: 'GET', path: '/rates' })).toMatchObject({ kind: 'ok', body: { 'USD->EUR': 0.92 } });
  });

  it('returns an empty instrument list in the empty scenario', () => {
    expect(backend('empty').handle({ method: 'GET', path: '/instruments' })).toMatchObject({ kind: 'ok', body: [] });
  });

  it('answers HTTP 500 to every call in the server-error scenario', () => {
    for (const path of ['/instruments', '/cash-account', '/rates']) {
      expect(backend('server-error').handle({ method: 'GET', path })).toMatchObject({ kind: 'http-error', status: 500 });
    }
  });

  it('fails without a response in the network-error scenario', () => {
    expect(backend('network-error').handle({ method: 'POST', path: '/orders/preview', body: draft })).toMatchObject({ kind: 'network-error' });
  });

  it('answers slowly in the slow scenario', () => {
    expect(backend('slow').handle({ method: 'GET', path: '/rates' })).toMatchObject({ kind: 'ok', delayMs: 1500 });
  });

  it.each(['insufficient-funds', 'market-closed', 'invalid-price', 'position-exceeded'] as const)(
    'rejects the preview with %s in the matching scenario',
    (reason) => {
      expect(backend(`rejected:${reason}`).handle({ method: 'POST', path: '/orders/preview', body: draft })).toMatchObject({
        kind: 'ok',
        body: { outcome: 'rejected', reason },
      });
    },
  );

  it('asks for consent only in the requires-consent scenario', () => {
    expect(backend('requires-consent').handle({ method: 'POST', path: '/orders/preview', body: draft })).toMatchObject({ body: { consentRequired: true } });
    expect(backend('accepted').handle({ method: 'POST', path: '/orders/preview', body: draft })).toMatchObject({ body: { consentRequired: false } });
  });

  it('answers 404 for routes outside the contract', () => {
    expect(backend('accepted').handle({ method: 'DELETE', path: '/orders' })).toEqual({ kind: 'not-found' });
  });

  it('falls back to the accepted scenario for unknown names', () => {
    expect(parseScenario('typo')).toBe('accepted');
    expect(parseScenario(null)).toBe('accepted');
    expect(parseScenario('rejected:market-closed')).toBe('rejected:market-closed');
  });
});

describe('mock finance API — preview and confirmation', () => {
  it('prices a USD order in the EUR cash account with fees and the FX rate used (BR-4)', () => {
    const res = backend('accepted').handle({ method: 'POST', path: '/orders/preview', body: draft });
    // 10 × 212.35 USD × 0.92 = 1,953.62 EUR; fee 0.1 % = 1.95 EUR
    expect(res).toMatchObject({
      body: { outcome: 'ok', estimatedTotal: { amount: 1955.57, currency: 'EUR' }, fees: { amount: 1.95, currency: 'EUR' }, fxRate: 0.92 },
    });
  });

  it('charges the minimum fee and shows no FX rate for a small EUR order', () => {
    const res = backend('accepted').handle({ method: 'POST', path: '/orders/preview', body: { ...draft, symbol: 'VWCE', quantity: 1 } });
    expect(res).toMatchObject({ body: { estimatedTotal: { amount: 129.9, currency: 'EUR' }, fees: { amount: 1.5 } } });
    expect((res as { body: object }).body).not.toHaveProperty('fxRate');
  });

  it('treats pence as pence: 10 × 1,245 GBp is 124.50 GBP before conversion', () => {
    const res = backend('accepted').handle({ method: 'POST', path: '/orders/preview', body: { ...draft, symbol: 'BRIT' } });
    // 124.50 GBP × 1.17 = 145.67 EUR (+ 1.50 minimum fee)
    expect(res).toMatchObject({ body: { estimatedTotal: { amount: 147.17, currency: 'EUR' } } });
  });

  it('places the order once per preview, even if the confirmation is retried (BR-7)', () => {
    const b = backend('accepted');
    const preview = b.handle({ method: 'POST', path: '/orders/preview', body: draft }) as { body: { previewId: string } };
    const first = b.handle({ method: 'POST', path: '/orders', body: { previewId: preview.body.previewId } });
    const retry = b.handle({ method: 'POST', path: '/orders', body: { previewId: preview.body.previewId } });
    expect(first).toMatchObject({ body: { outcome: 'accepted', status: 'open' } });
    expect(retry).toEqual(first);
  });
});
