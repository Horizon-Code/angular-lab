# Testing

## Pyramid

- **Domain (Vitest):** every business rule, every edge (zero, negative, rounding, currency mismatch). Fast and exhaustive.
- **Components (Vitest + Angular Testing Library style):** behaviour visible to the user — what renders in each state, what is enabled, what is emitted.
- **E2E (Playwright):** one test per acceptance criterion, against the mock API, including unhappy paths.

## Rules

- Test names describe behaviour, not methods.
- Query by role and accessible name (`getByRole('button', { name: 'Review order' })`), not by CSS class.
- Every async view gets tests for loading, error (with retry), empty and data.
- No arbitrary sleeps. Wait for what the user would wait for.
- No snapshot tests for logic; snapshots only for stable, intentional markup if ever.

## Mock API scenarios

The lab's `libs/shared/mock-api` exposes named scenarios a test can switch on, e.g. `success`, `rejected:insufficient-funds`, `server-error`, `network-error`, `slow`, `empty`. Tests select a scenario; they never stub fetch by hand.
