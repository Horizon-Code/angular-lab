import { TestBed } from '@angular/core/testing';
import { OrderTicket } from './order-ticket';

async function render() {
  await TestBed.configureTestingModule({ imports: [OrderTicket] }).compileComponents();
  const fixture = TestBed.createComponent(OrderTicket);
  await fixture.whenStable();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('OrderTicket', () => {
  it('enables review for a valid market buy', async () => {
    const { el } = await render();
    const button = el.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });

  it('warns but does not block when cash looks insufficient (the backend decides)', async () => {
    const { fixture, el } = await render();
    const qty = el.querySelector('input[type="number"]') as HTMLInputElement;
    qty.value = '100';
    qty.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(el.querySelector('.warning')?.textContent).toContain('short');
    expect((el.querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBe(false);
  });

  it('blocks review when the quantity is not a whole number', async () => {
    const { fixture, el } = await render();
    const qty = el.querySelector('input[type="number"]') as HTMLInputElement;
    qty.value = '1.5';
    qty.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(el.querySelector('.issues')?.textContent).toContain('whole number');
    expect((el.querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBe(true);
  });
});
