# Micro-frontends: hierarchical Native Federation

How the lab composes applications, and the rules agents follow when they add one.

## Shape: a tree of at most three levels

```
shell                    level 1 — root host: auth, top navigation, loads industry shells
└── <industry>-shell     level 2 — an industry (finance, health…): its own navigation, loads its products
    └── <industry>-<product>   level 3 — a product journey (banking, crypto…)
```

- A level-2 micro is both a **remote** (exposed to the root shell) and a **host** (loads its level-3 remotes).
- Adding an industry = adding a sibling level-2 micro. It never changes another industry.
- No fourth level. If a product needs sub-areas, they are routes inside the product, not new micros.

## Why a tree

- Ownership follows the domain: one team per industry, one team per product.
- Each level deploys on its own; the root shell does not rebuild when a product ships.
- The hard part — sharing Angular, auth and the design system exactly once across nested hosts — is solved once, at the root.

## Rules

1. **Manifest per host.** Each host loads its remotes from a `federation.manifest.json` resolved at runtime, so environments change URLs without a rebuild.
2. **Share once.** `@angular/*`, `rxjs`, `@ngrx/signals`, `libs/shared/*` are shared as singletons with `strictVersion`. A remote must not ship its own copy.
3. **No cross-micro imports.** A micro imports only from `libs/shared/*` and its own industry's `libs/<industry>/*`. Talking to a sibling happens through the URL or through a shared service contract in `libs/shared`.
4. **Expose routes, not components.** A remote exposes `./routes` (an Angular `Routes` array). The host lazy-loads it with `loadRemoteModule` inside `loadChildren`.
5. **Fail soft.** If a remote does not load, the host shows an error card with retry for that area; the rest of the app keeps working.
6. **Each micro also runs alone.** `ng serve <micro>` starts it standalone with a dev shell, so teams can work without the full tree.

## Typical wiring

```ts
// shell/src/app/app.routes.ts (level 1)
export const routes: Routes = [
  {
    path: 'finance',
    loadChildren: () =>
      loadRemoteModule('finance-shell', './routes').then((m) => m.routes),
  },
];
```

```ts
// finance-shell/src/app/finance.routes.ts (level 2, exposed as ./routes)
export const routes: Routes = [
  { path: '', component: FinanceHome },
  {
    path: 'banking',
    loadChildren: () =>
      loadRemoteModule('finance-banking', './routes').then((m) => m.routes),
  },
];
```

## Pitfalls we have seen

- Two copies of Angular at runtime because one remote pinned a different minor version: check the shared versions in CI.
- A nested host initialising federation twice: only the root calls `initFederation()`; level-2 hosts register their manifest through the shared runtime.
- Global styles leaking between micros: use the design system's tokens and component styles; avoid global selectors in remotes.
