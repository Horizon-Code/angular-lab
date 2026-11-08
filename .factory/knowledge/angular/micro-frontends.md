# Micro-frontends: hierarchical Native Federation

How to compose an Angular application from micro-frontends organised as a tree, and the rules agents follow when they add one. Paths are the factory's default layout; a target repository can remap them in its own `AGENTS.md`.

## Shape: a tree of at most three levels

```
shell                        level 1 — root host: auth, top navigation, loads domain shells
└── <domain>-shell           level 2 — a business domain (finance, health…): its own navigation, loads its products
    └── <domain>-<product>   level 3 — a product journey (banking, crypto…)
```

- A level-2 micro is both a **remote** (exposed to the root shell) and a **host** (loads its level-3 remotes).
- Adding a domain = adding a sibling level-2 micro. It never changes another domain.
- No fourth level. If a product needs sub-areas, they are routes inside the product, not new micros.

## Why a tree

- Ownership follows the domain: one team per domain, one team per product.
- Each level deploys on its own; the root shell does not rebuild when a product ships.
- The hard part — sharing Angular, auth and the design system exactly once across nested hosts — is solved once, at the root.

## Rules

1. **Manifest per host.** Each host resolves its remotes from its own manifest (e.g. `federation.manifest.json`) at runtime, so environments change URLs without a rebuild.
2. **Share once.** `@angular/*`, `rxjs`, `@ngrx/signals` and `libs/shared/*` are shared as singletons with `strictVersion`. A remote must not ship its own copy.
3. **No cross-micro imports.** A micro imports only from `libs/shared/*` and its own domain's `libs/<domain>/*`. Talking to a sibling happens through the URL or through a shared service contract in `libs/shared`.
4. **Expose routes, not components.** A remote exposes `./routes` (an Angular `Routes` array). Hosts lazy-load it inside `loadChildren` through **one shared helper** (e.g. `loadRemoteRoutes('<remote>')` in `libs/shared`), never by calling the federation runtime directly in each host.
5. **One federation runtime.** Only the bootstrapped application calls `initFederation()`. Nested hosts receive that runtime through Angular DI (an `InjectionToken`, e.g. `FEDERATION`) and register their own remotes with it (e.g. `initRemoteEntry`) instead of initialising federation again. When a level-2 micro runs alone, it is the bootstrapped app and initialises the runtime itself.
6. **Fail soft.** If a remote does not load, its host shows an error card with retry for that area; the rest of the app keeps working.
7. **Each micro also runs alone.** `ng serve <micro>` starts it standalone, so teams can work without the full tree.

## Typical wiring

```ts
// shell — level 1
export const routes: Routes = [
  { path: 'finance', loadChildren: loadRemoteRoutes('finance-shell') },
];
```

```ts
// finance-shell — level 2, exposed to the shell as ./routes
export const routes: Routes = [
  { path: '', component: FinanceHome },
  { path: 'banking', loadChildren: loadRemoteRoutes('finance-banking') },
];
```

`loadRemoteRoutes` takes the runtime from the DI token, loads the remote's `./routes` and turns a load failure into the fail-soft error route. A worked implementation lives in [angular-lab](https://github.com/Horizon-Code/angular-lab).

## Pitfalls

- Two copies of Angular at runtime because one remote pinned a different minor version: check the shared versions in CI.
- A nested host calling `initFederation()` a second time: it creates a second runtime and shared singletons break. Use the injected one.
- Global styles leaking between micros: use the design system's tokens and component styles; avoid global selectors in remotes.
