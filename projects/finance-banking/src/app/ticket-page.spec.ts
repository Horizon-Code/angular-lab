import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MOCK_SCENARIO, mockFinanceApi, MockScenario } from '@lab/finance-mock-api';
import { TicketPage } from './ticket-page';

/** Spec banking-review, AC-1 – AC-4, driven through the mock API scenarios. */
async function render(scenario: () => MockScenario) {
  TestBed.configureTestingModule({
    imports: [TicketPage],
    providers: [provideHttpClient(withInterceptors([mockFinanceApi])), { provide: MOCK_SCENARIO, useValue: scenario }],
  });
  const fixture = TestBed.createComponent(TicketPage);
  const el = fixture.nativeElement as HTMLElement;
  const text = () => el.textContent ?? '';
  const button = (name: string) => [...el.querySelectorAll('button')].find((b) => b.textContent?.trim() === name);
  return { fixture, el, text, button };
}

describe('TicketPage — the ticket loads from the API', () => {
  it('AC-1: shows a loading message and no form while the API answers', async () => {
    const { fixture, el, text } = await render(() => 'slow');
    fixture.detectChanges();
    expect(text()).toContain('Loading instruments and your cash account…');
    expect(el.querySelector('form')).toBeNull();
    fixture.destroy(); // cancels the pending slow response
  });

  it('AC-2: shows instruments, cash account and estimate from the API', async () => {
    const { fixture, el, text } = await render(() => 'accepted');
    await fixture.whenStable();
    const options = [...el.querySelectorAll('option')].map((o) => o.value);
    expect(options).toEqual(expect.arrayContaining(['VWCE', 'ACME', 'BRIT']));
    expect(text()).toContain('Everyday account (EUR): 5000 EUR');
    expect(text()).toContain('Estimated cost: 128.4 EUR');
  });

  it.each(['server-error', 'network-error'] as const)(
    'AC-3: shows an error with Try again (not an empty ticket) on %s, and the ticket after a successful retry',
    async (failure) => {
      let scenario: MockScenario = failure;
      const { fixture, el, text, button } = await render(() => scenario);
      document.body.appendChild(el);
      await fixture.whenStable();
      expect(text()).toContain("We couldn't load your instruments and cash account.");
      expect(el.querySelector('[role="alert"]')).not.toBeNull();
      expect(el.querySelector('form')).toBeNull();

      scenario = 'accepted';
      button('Try again')!.click();
      await fixture.whenStable();
      expect(el.querySelector('form')).not.toBeNull();
      expect(text()).not.toContain("We couldn't load");
      expect(document.activeElement?.textContent).toBe('Buy or sell');
    },
  );

  it('AC-4: says there is nothing to trade when the API returns no instruments', async () => {
    const { fixture, el, text } = await render(() => 'empty');
    await fixture.whenStable();
    expect(text()).toContain('There are no instruments available to trade right now.');
    expect(el.querySelector('form')).toBeNull();
  });
});
