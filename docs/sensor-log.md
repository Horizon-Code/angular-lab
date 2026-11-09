# Sensor log

Light record of what the sensors (Sheriff, tests, stop hook, reviewer) caught while the factory builds this lab. One line per catch: date · sensor · what it caught · what changed.

| Date | Sensor | Caught | Change |
|---|---|---|---|
| 2026-11-09 | Provoked test of Sheriff | The first industry rule allowed a `health-shell` to import the finance domain (any `type:*` target passed) | Industry rule narrowed to "same industry or shared UI"; provoked tests kept in the spike as the sensor's own test |
| 2026-11-09 | `ng mcp` best practices (Angular 22.2.6) | Factory house rule "OnPush on every component" is outdated: OnPush is the default in v22 | Factory `AGENTS.md` updated |
| 2026-11-09 | Independent reviewer (banking-review slice 1) | Keyboard focus fell to `<body>` after **Try again**; the mock answered an unknown instrument as a business rejection (`invalid-price`) | Focus moves to the page heading (tested); mock answers 400/404 (tested). Approved with no blocking notes |
| 2026-11-09 | Independent reviewer | **Try again** button styled in the page instead of coming from `libs/shared/ui` | Deferred: shared button in slice 2 |
