# State

## Choose the smallest tool that works

| Situation | Tool |
|---|---|
| State used by one component | `signal` / `computed` in the component |
| Derived value that the user can also override | `linkedSignal` |
| Data fetched from an API for one view | `httpResource` / `resource` |
| State shared by several components of a feature, with async actions | NgRx Signal Store (`signalStore`, `withState`, `withComputed`, `withMethods`) |
| Event streams (websocket prices, debounced search) | RxJS, converted with `toSignal` at the edge |

## Model async state as a union

```ts
export type Async<T, E = AppError> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: E }
  | { status: 'ready'; data: T };
```

Templates switch on `status`. An empty array is `ready` with `data: []`; a failed call is `error`. The two are never confused.

## Signal Store conventions

- One store per feature, provided at the feature's route, not in root.
- Methods are verbs (`placeOrder`, `selectAccount`); computed values are nouns (`buyingPower`, `canSubmit`).
- Side effects use `rxMethod` or async methods; they set loading and error states explicitly.
- Business rules are called from the store, never written inside it — they live in `libs/<domain>/domain`.

## Do not

- Put server data in a global store "just in case".
- Mirror inputs into signals by hand; use `input()` and `computed`.
- Subscribe manually in components without `takeUntilDestroyed`.
