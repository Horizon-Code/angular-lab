# AGENTS.md

Follow `.factory/AGENTS.md` (house rules) and `.factory/WORKFLOW.md` (spec → implement → review → test → PR). The agents live in `.claude/agents/`.

Lab-specific rules:

- Levels: `shell` (1) → `<industry>-shell` (2) → `<industry>-<product>` (3). Never a fourth level. See `.factory/knowledge/angular/micro-frontends.md`.
- Remotes expose `./routes` only. Hosts load them with `loadRemoteRoutes()` from `@lab/shared-ui`, never with the global `loadRemoteModule`.
- Only the bootstrapped app calls `initFederation()`; its instance reaches nested hosts through the `FEDERATION` token.
- Business rules go in `libs/<industry>/domain` with Vitest tests; components only call them.
- Domain knowledge for agents lives in this repo, not in the factory: finance orders → [`docs/domain/finance-orders.md`](docs/domain/finance-orders.md). The spec-writer and implementer read it for any finance feature.
- Boundaries are enforced by Sheriff (`sheriff.config.ts`): no app imports another app; the root shell sees shared UI only; levels 2–3 see shared UI and their own industry's domain. A Stop hook runs `npm run lint:arch` and the domain tests when you finish.
- For generic Angular questions use the `angular-developer` skill and the `angular-cli` MCP server (`ng mcp`); on Angular 22, OnPush is the default and new forms use Signal Forms.
- Before a PR: `npm run lint:arch`, `npm test` and `npm run build` must pass.
- Nothing from any private codebase. Domain rules are written from general industry practice.
