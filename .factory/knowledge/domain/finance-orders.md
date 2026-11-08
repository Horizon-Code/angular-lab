# Domain: securities orders (finance / banking)

Rules for buy and sell journeys on equities and ETFs. Written from general industry practice; no proprietary code or data.

## Vocabulary

- **Securities account** — where the client holds positions. It is linked to one or more **cash accounts**, possibly in different currencies.
- **Market order** — executes at the best available price. **Limit order** — executes only at the limit price or better. **Stop order** — becomes a market order when the stop price is reached.
- **Buying power** — cash available to buy, in the cash account's currency, after pending orders.
- **Trading currency** — the currency the instrument is quoted in. Some markets quote in minor units (e.g. pence on the London Stock Exchange).

## Journey shape

1. Choose instrument and side (buy / sell).
2. Order details: quantity or amount, order type, limit/stop price, validity.
3. Choose securities account and cash account.
4. Review: estimated total, fees, exchange rate if any, warnings. The backend validates here.
5. Documentation and consent (e.g. key information documents, suitability/appropriateness notices).
6. Confirmation and result. The order then appears in the order list, where it can be modified or cancelled while still open.

## Rules agents must respect

1. **The frontend informs, the backend decides.** Showing "insufficient buying power" before review is a warning, not a block: the client may have an overdraft, pending sales or a margin facility the frontend cannot know. The review step's server response is final.
2. **Compare in the same currency.** Estimated cost and buying power are compared in the cash account's currency, after conversion. Minor and major units are different currencies (100 GBp = 1 GBP).
3. **Limit and stop prices** must be positive and use the instrument's tick size; the backend may still reject them.
4. **Sell orders** cannot exceed the available position (held minus quantity in open sell orders). This one the frontend can enforce because it has the data — but the backend still has the final word.
5. **Modifying an order** is only possible while it is open and not fully executed. Partially executed orders can only change the remaining quantity.
6. **Errors are errors.** If the account list fails to load, show an error with retry — never "You have no securities accounts", which would push a client to open a second one.
7. **Step counter** counts only the steps this client sees; if consent is not required, it is not counted.

## Typical backend outcomes to cover in tests

`accepted`, `rejected:insufficient-funds`, `rejected:market-closed`, `rejected:invalid-price`, `rejected:position-exceeded`, `requires-consent`, `server-error`, `network-error`.
