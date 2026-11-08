# AGENTS.md — house rules

Every agent in this factory reads this file first. If a rule here conflicts with a generic best practice, this file wins. If it conflicts with the target repository's own `AGENTS.md` or `CLAUDE.md`, the target repository wins.

## Scope and honesty

- Do the task you were given and nothing more. Do not refactor unrelated code.
- If the spec is ambiguous, stop and list the open questions instead of guessing.
- Never claim a test passes, a build is green or a requirement is covered without having run or checked it.

## Angular baseline (v20+)

- Standalone components only. No new `NgModule`s.
- `ChangeDetectionStrategy.OnPush` on every component; the apps are zoneless.
- Signals for local and shared state: `signal`, `computed`, `linkedSignal`, `resource` / `httpResource`. Use RxJS where streams are the natural model (websockets, debounced input, complex async orchestration), and convert at the edges with `toSignal` / `toObservable`.
- Component inputs and outputs with `input()`, `input.required()`, `model()` and `output()`.
- Built-in control flow (`@if`, `@for` with `track`, `@switch`, `@defer`). No structural directive equivalents.
- `inject()` instead of constructor injection.
- Feature state with NgRx Signal Store when it is shared across components; plain signals otherwise. See [knowledge/angular/state.md](knowledge/angular/state.md).
- Strict TypeScript. No `any`; prefer discriminated unions for states.

## Architecture

- Micro-frontends are loaded with Native Federation. Respect the level rules in [knowledge/angular/micro-frontends.md](knowledge/angular/micro-frontends.md): a micro never imports another micro's code, only shared libraries.
- Business rules live in `libs/<domain>/domain` as pure, framework-free TypeScript with unit tests. Components call them; they do not re-implement them.
- UI components come from the shared design system (`libs/shared/ui`). Do not create one-off styled buttons, inputs or dialogs.
- The `libs/*` paths in this file and in `knowledge/` are the factory's default layout. A target repository that uses other names maps them in its own `AGENTS.md`.

## UX rules that are easy to get wrong

- **The frontend informs, the backend decides.** Client checks warn and guide; they never block an action the server might accept. The server's answer is final.
- **Never show an error as an empty state.** A failed request renders an error with a retry, not "You have no items".
- Money is a value plus a currency. Compare amounts only in the same currency; minor units (e.g. pence vs pounds) are different currencies for comparison purposes.
- A step indicator counts only the steps the user actually sees.
- Every async view has three explicit states: loading, error, data (and empty when data is legitimately empty).

## Accessibility

- Every interactive element is reachable and operable by keyboard, with a visible focus.
- Form fields have labels; errors are announced (`aria-live` or `aria-describedby`).
- Colour is never the only carrier of meaning.

## Tests

- Unit tests (Vitest) for domain functions and component logic; E2E tests (Playwright) for every acceptance criterion in the spec.
- Test names describe behaviour: `shows an error with retry when the quote request fails`.
- No snapshot tests for logic.

## Git

- One feature per branch: `feat/<area>-<short-name>`. Conventional commits.
- Every change ends in a pull request that links its spec and lists how each acceptance criterion is covered.
- Never commit secrets, real customer data or code copied from a private codebase.
