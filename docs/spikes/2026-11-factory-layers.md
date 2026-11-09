# Spike: which factory layers to adopt (9 Nov 2026)

Time-boxed (~2 h) test of the pieces the factory plans to adopt, run against this lab (Angular 22.2, Native Federation 22.2.4). Goal: decide what to adopt, what to cut and what the factory still has to build.

## 1. Official Angular skills + Angular CLI MCP (layer 2)

**What I did.** Installed `angular-developer` from [angular/skills](https://github.com/angular/skills) with `npx skills add https://github.com/angular/skills -p -a claude-code` (pinned in `skills-lock.json`; `angular-new-app` removed, the lab already exists). Added `.mcp.json` so Claude Code starts `ng mcp`. Called the server over stdio: it reports `angular-cli-server 22.2.6` and 9 tools (`get_best_practices`, `search_documentation`, `list_projects`, `run_target`, `devserver_*`, `onpush_zoneless_migration`, `ai_tutor`). `list_projects` reads the three federated apps correctly.

**Finding.** The official guide for v22 says *do not set `ChangeDetectionStrategy.OnPush` explicitly — it is the default in v22+*, and *prefer Signal Forms for new forms*. The factory's `AGENTS.md` still says "OnPush on every component" and says nothing about forms. The house rules were already stale for the version the lab runs, which is exactly why version-aware knowledge should come from the source.

**Verdict: adopt.** The factory keeps only its deltas (state pattern, error/empty states, money, accessibility, architecture) and points to the official skill and `ng mcp` for generic Angular. Note: Thalhammer reports he no longer uses `angular-developer` daily because frontier models already know it; its value here is version-correctness, not teaching.

## 2. Sheriff + stop hook (layers 3 and 4)

**What I did.** Added [Sheriff](https://github.com/softarc-consulting/sheriff) 0.20 with `sheriff.config.ts`: one entry point per app and per exposed `./routes`, tags `level:1|2|3`, `industry:<name>`, `type:domain|shared-ui`, and rules:

- the root shell sees shared UI only;
- levels 2 and 3 see shared UI and the domain of their **own** industry;
- domain and shared UI depend on nothing else;
- no app ever imports another app.

Then I **provoked violations** to prove the sensor works:

| Provoked change | Caught? |
|---|---|
| `finance-shell` imports a component from `finance-banking` | yes — `level:2 → level:3` |
| Finance domain imports shared UI | yes — `type:domain → type:shared-ui` |
| Root shell imports the finance domain | yes — `level:1 → type:domain` |
| A temporary `health-shell` imports the finance domain | **no** on the first rule set → fixed → yes |

The fourth row is the interesting one: my first industry rule let anything tagged `type:*` through, so a health app could read finance rules. Only the provoked test exposed it. A sensor needs its own test.

Sheriff runs as `npm run lint:arch`, in CI, and in a Claude Code **Stop hook** (`scripts/agent-stop-check.mjs`): when an agent says it is done, the hook runs Sheriff and the domain tests; on failure it exits 2 and the agent gets the error back and must fix it. A `stop_hook_active` guard prevents an endless loop. Tested: clean → 0, failing test → 2 with the output, guard → 0.

**Limit.** Sheriff checks static imports. Federation happens at runtime, so the runtime side (one federation instance, manifests per level, fail-soft) still needs the planned smoke test that boots the three levels.

**Verdict: adopt** Sheriff and the stop-hook pattern (Steyer's "architecture as executable contract"). The tag scheme and the "provoke to prove" tests become part of the factory's layer-4 skill.

## 3. Luca Mezzalira's `reviewing-mfe-boundaries`

**What I did.** Applied the skill's eight rules (from *Building Micro-Frontends*) to the lab, in its recommended order.

| Rule | Result |
|---|---|
| 3 · Hide implementation details | ✓ no cross-app imports (now enforced by Sheriff) |
| 4 · Events, not shared state | ✓ no shared store; the only shared object is the federation runtime (platform, not domain) |
| 6 · Isolate failure | ✓ every remote mount has a fallback (`loadRemoteRoutes` → error card) |
| 2 · Minimal API surface | ✓ remotes receive nothing but the URL |
| 5 · Independent deployment | ✓ remote URLs come from runtime manifests, unversioned |
| Routing ownership | ⚠ the root shell and the finance shell **hard-code** their first-level routes and nav (`finance`, `banking`). The skill wants them from a runtime manifest, so adding an industry or product is configuration, not a code change and redeploy of the host. Our README claims "adding an industry never touches another industry"; today it touches the root shell's routes. |
| 7 · Coarse-grained, nesting depth 1 | ✗ **by design.** Mezzalira's rule is "depth must stay at 1". The lab nests on purpose: shell → finance-shell → finance-banking, via routing only (never a remote rendered inside another remote's component), with at most 3 deployed units in one view (the rule's review threshold). |

**Verdict: adopt the skill as the base of layer 4** (MIT, credited), and **add our own rule for hierarchical nesting**: depth 2 is allowed only as a vertical, route-level split where each level is a full domain host; never component-level nesting; max 3 levels; every level fails soft. The routing-ownership finding becomes a backlog item (routes and nav from the manifest).

## 4. Spec Kit vs the lightweight process (layer 1)

**What I did.** Read Spec Kit's templates and commands (`specify`, `clarify`, `plan`, `tasks`, `implement`, `converge`, `analyze`, `checklist`: ~2,900 lines of prompts) and compared them with Thalhammer's process skills (`brainstorming`, `implement-plan`, `code-review`) and the factory's `WORKFLOW.md`. Not run end to end: the comparison is on the artefacts.

| | Spec Kit | Factory (lightweight) |
|---|---|---|
| Documents per feature | spec, plan, tasks, research, data model, contracts | one spec (rules, states, acceptance criteria, open questions) |
| Tests | optional by default | part of the feature; one E2E per acceptance criterion |
| Review | `analyze` checks consistency between artefacts | independent reviewer in a fresh context + sensors |
| Fit for ~3 h/week, one person | heavy | fits |

**Verdict: keep the lightweight process**, and borrow two ideas: (1) a short **tasks** list in the spec, each task with the files it may touch (Spec Kit / cc-sdd "tasks with a boundary"), and (2) Spec Kit's `clarify` step is our "open questions" gate. Revisit if the lab ever has several people working in parallel.

## What changes

- **Lab (this PR):** `angular-developer` skill + `.mcp.json`; Sheriff config, `lint:arch` in CI; Stop hook.
- **Factory (next PR):** `AGENTS.md` trimmed to house deltas, OnPush rule fixed for v22, Signal Forms; spec template gains a tasks section; `install.sh` installs the official skill and `ng mcp` config.
- **Factory layer 4 (week of 16 Nov):** skill built on `reviewing-mfe-boundaries` + our hierarchical-nesting rule + Sheriff tag scheme + smoke test of the three levels.
- **Backlog:** first-level routes and nav from the manifests (routing ownership).
