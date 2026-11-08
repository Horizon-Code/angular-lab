import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('Shell', () => {
  it('shows Finance as an available industry and Health as coming soon', async () => {
    await TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([])] }).compileComponents();
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const nav = (fixture.nativeElement as HTMLElement).querySelector('nav[aria-label="Industries"]');
    expect(nav?.querySelector('a')?.textContent).toContain('Finance');
    expect(nav?.textContent).toContain('Health · soon');
  });
});
