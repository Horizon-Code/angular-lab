# Spec: banking — order review with server validation

Status: approved (scope and acceptance criteria approved by the repo owner's standing delegation, 2026-11-09)
Owner: Rubén Pasamar
Related: [docs/domain/finance-orders.md](../docs/domain/finance-orders.md) (journey shape, rules 1–7, backend outcomes)

## Goal

As a client placing a buy or sell order, I see what the bank will actually do with my order — total, fees, exchange rate, any document I must accept — and I confirm it knowing the bank has validated it, so I never submit an order blind or get a surprise afterwards.

## Glossary

| Term | Meaning |
|---|---|
| Ticket | The form where the client chooses instrument, side, order type, quantity and price. |
| Preview | The bank's validation of a draft order before it is placed: estimated total, fees, FX rate and outcome. Nothing is placed yet. |
| Review step | The screen that shows the preview and asks for confirmation. |
| KID | Key Information Document: a short product document the client must accept before buying certain products (e.g. some ETFs). |
| Buying power | Cash available to buy in the cash account's currency, after pending orders. |
| Scenario | A named behaviour of the mock API (e.g. `rejected:market-closed`) used in development and tests instead of a real backend. |

## Business rules

| ID | Rule | Frontend informs / backend decides |
|---|---|---|
| BR-1 | Instruments, the cash account and exchange rates come from the API. The ticket never uses hard-coded data. | — |
| BR-2 | The ticket's own checks (whole quantity, tick size, available position) block review; the buying-power check only warns (domain rules 1, 3, 4). | Informs; backend decides at preview |
| BR-3 | "Review order" asks the bank for a preview. The preview's outcome is final: an order the client-side check warned about can be accepted, and an order that passed every client check can be rejected. | Backend decides |
| BR-4 | Totals, fees and buying power are compared and shown in the cash account's currency; when the instrument trades in another currency, the review shows the exchange rate used (domain rule 2). | Backend decides the rate |
| BR-5 | If the preview says a KID must be accepted, the review shows a consent step and "Confirm order" stays disabled until the client accepts it. If no consent is required, the step does not appear and is not counted in the step indicator (domain rule 7). | Backend decides whether consent is required |
| BR-6 | A rejection is shown with the bank's reason in plain language and a way back to the ticket with the client's entries kept. | Backend decides |
| BR-7 | A server or network error is shown as an error with retry, never as an empty list or a silent no-op (domain rule 6). Retrying a confirmation must not place the order twice: the confirmation carries the preview's id. | — |
| BR-8 | After confirmation the client sees the order reference and status. | Backend decides |

## API contract (mock first)

All endpoints live under `/api/finance`. The mock API implements them in the browser so the lab runs and deploys without a backend; a real BFF can replace it without changing the components.

| Method and path | Response |
|---|---|
| `GET /instruments` | `Instrument[]` — symbol, name, last price, trading currency, tick size, held quantity |
| `GET /cash-account` | `CashAccount` — id, name, available `Money` |
| `GET /rates` | `RateTable` |
| `POST /orders/preview` | `{ outcome: 'ok', previewId, estimatedTotal, fees, fxRate?, consentRequired }` or `{ outcome: 'rejected', reason }` |
| `POST /orders` (with `previewId`) | `{ outcome: 'accepted', orderId, status }` or `{ outcome: 'rejected', reason }` |

Rejection reasons: `insufficient-funds`, `market-closed`, `invalid-price`, `position-exceeded`.

Scenarios (selected with `?scenario=<name>` in the URL; default `accepted`):

| Scenario | Effect |
|---|---|
| `accepted` | Every call succeeds; preview needs no consent. |
| `requires-consent` | Preview succeeds with `consentRequired: true`. |
| `rejected:insufficient-funds`, `rejected:market-closed`, `rejected:invalid-price`, `rejected:position-exceeded` | Preview returns that rejection. |
| `server-error` | Every call answers HTTP 500. |
| `network-error` | Every call fails without a response. |
| `slow` | Every call answers after ~1.5 s. |
| `empty` | `GET /instruments` returns an empty list. |

## States

| View | Loading | Error | Empty | Data |
|---|---|---|---|---|
| Ticket | "Loading instruments and your cash account…" | "We couldn't load your instruments and cash account." + **Try again** | "There are no instruments available to trade right now." | The ticket form |
| Review | "Checking your order with the bank…" | "We couldn't check your order with the bank." + **Try again** + **Back to ticket** | — | Total, fees, FX rate if any, consent if required, **Confirm order** |
| Rejection | — | — | — | Reason in plain language + **Back to ticket** (entries kept) |
| Confirmation | "Placing your order…" | "We couldn't confirm whether your order was placed." + **Try again** (same preview id) | — | "Order placed" + reference and status |

## Acceptance criteria

**Ticket loads from the API**
- **AC-1** — Given the API is slow, when the ticket opens, then "Loading instruments and your cash account…" is shown and no form fields are shown yet.
- **AC-2** — Given the API answers, when the ticket opens, then the instruments, the cash account balance and the estimate come from the API.
- **AC-3** — Given the API fails (server or network error), when the ticket opens, then an error with **Try again** is shown, not an empty ticket; and when the client presses **Try again** and the API now answers, the ticket appears.
- **AC-4** — Given the API returns no instruments, when the ticket opens, then "There are no instruments available to trade right now." is shown.

**Review**
- **AC-5** — Given a valid draft, when the client presses **Review order**, then "Checking your order with the bank…" is shown and then the review with total, fees and, for an instrument in another currency, the exchange rate.
- **AC-6** — Given the client-side buying-power check warned, when the client reviews and the bank accepts the preview, then the review is shown normally (the warning did not block).
- **AC-7** — Given the preview requires consent, when the review is shown, then a KID consent checkbox is shown, the step indicator counts the consent step, and **Confirm order** is disabled until it is ticked.
- **AC-8** — Given the preview needs no consent, then no consent step is shown or counted.
- **AC-9** — Given the preview is rejected (each of the four reasons), then the reason is shown in plain language and **Back to ticket** returns to the ticket with the client's entries kept.
- **AC-10** — Given the preview fails with a server or network error, then an error with **Try again** and **Back to ticket** is shown.

**Confirmation**
- **AC-11** — Given an accepted preview, when the client presses **Confirm order**, then "Order placed" is shown with the order reference and status.
- **AC-12** — Given the confirmation call fails, when the client presses **Try again**, then the request is sent again with the same preview id.

## Tasks

Delivered in two slices. Slice 1 is this PR; slice 2 is the week of 16 Nov.

| ID | Task | Boundary | Covers |
|---|---|---|---|
| T-1 | Contract types and API client for the five endpoints | `libs/finance/data-access` | BR-1, contract |
| T-2 | Mock API: interceptor implementing the contract and every scenario | `libs/finance/mock-api` | Scenarios |
| T-3 | Ticket loads instruments, cash account and rates from the API, with loading, error with retry and empty states | `projects/finance-banking` | AC-1 – AC-4 |
| T-4 | Review step: preview, totals, FX rate, consent, rejections, errors | `projects/finance-banking`, `libs/finance/domain` if a rule appears | AC-5 – AC-10 (slice 2) |
| T-5 | Confirmation with preview id and retry | `projects/finance-banking` | AC-11 – AC-12 (slice 2) |

## Out of scope

- The order list (modify / cancel): next spec.
- Real backend, authentication, real prices.
- Playwright E2E: arrives with the CI preview (week of 30 Nov); until then acceptance criteria are covered by component tests against the mock API.

## Open questions

- (none)
