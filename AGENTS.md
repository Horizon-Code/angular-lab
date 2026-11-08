# AGENTS.md

Follow `.factory/AGENTS.md` (house rules) and `.factory/WORKFLOW.md` (spec → implement → review → test → PR). The agents live in `.claude/agents/`.

Lab-specific rules:

- Levels: `shell` (1) → `<industry>-shell` (2) → `<industry>-<product>` (3). Never a fourth level. See `.factory/knowledge/angular/micro-frontends.md`.
- Remotes expose `./routes` only. Hosts load them with `loadRemoteRoutes()` from `@lab/shared-ui`, never with the global `loadRemoteModule`.
- Only the bootstrapped app calls `initFederation()`; its instance reaches nested hosts through the `FEDERATION` token.
- Business rules go in `libs/<industry>/domain` with Vitest tests; components only call them.
- Before a PR: `npm test` and `npm run build` must pass.
- Nothing from any private codebase. Domain rules are written from general industry practice.
