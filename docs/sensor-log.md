# Sensor log

Light record of what the sensors (Sheriff, tests, stop hook, reviewer) caught while the factory builds this lab. One line per catch: date · sensor · what it caught · what changed.

| Date | Sensor | Caught | Change |
|---|---|---|---|
| 2026-11-09 | Provoked test of Sheriff | The first industry rule allowed a `health-shell` to import the finance domain (any `type:*` target passed) | Industry rule narrowed to "same industry or shared UI"; provoked tests kept in the spike as the sensor's own test |
| 2026-11-09 | `ng mcp` best practices (Angular 22.2.6) | Factory house rule "OnPush on every component" is outdated: OnPush is the default in v22 | Factory `AGENTS.md` updated |
