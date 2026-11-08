# Workflow

How a request becomes a merged feature. Each step has one owner, one output and one gate.

## 1. Spec — `spec-writer`

- **Input:** a short request ("Let a client place a limit order to buy an ETF").
- **Output:** `specs/<area>-<feature>.md` from [templates/spec.md](templates/spec.md).
- **Gate:** a human approves the spec (a PR comment or merge of the spec file). Open questions block the next step.

## 2. Implementation — `implementer`

- **Input:** the approved spec.
- **Output:** a branch `feat/<area>-<feature>` with code and unit tests.
- **Gate:** `build`, `lint` and unit tests pass locally; every acceptance criterion maps to code.

## 3. Review — `reviewer`

- **Input:** the diff and the spec.
- **Output:** review notes with a verdict: `approve` or `changes requested`, each note tied to a line and to a rule in [AGENTS.md](AGENTS.md).
- **Gate:** the [checklist](agents/reviewer.md#checklist) passes. Changes go back to the implementer; maximum three rounds before a human steps in.

## 4. Tests — `tester`

- **Input:** the approved diff.
- **Output:** Playwright tests, one per acceptance criterion, including the unhappy paths (server rejects, network fails, empty data).
- **Gate:** all tests green in CI. A failing test that reveals a bug goes back to the implementer with a reproduction.

## 5. Pull request — human

- The PR description uses [templates/pull-request.md](templates/pull-request.md): spec link, acceptance-criteria table, screenshots, risks.
- A person reviews and merges. Agents never merge their own work.

## Hand-off format

Every agent ends its turn with a short block the next agent can read:

```
HANDOFF
from: implementer
to: reviewer
branch: feat/banking-limit-order
spec: specs/banking-limit-order.md
status: ready
notes: AC-4 (market closed) uses the mock-api "closed" scenario.
```
