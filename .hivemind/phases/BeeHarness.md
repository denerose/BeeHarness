# Phases — BeeHarness

One line per phase. This is the loop's only tracking file: update the
status, link the plan, never grow tasks here (tasks live in plans).

Statuses: planned · in-progress · blocked · escalated · done

| id | description | status | plan | owner | escalations |
|---|---|---|---|---|---|
| P0 | bootstrap the build track (roles into ADRs, skills review, registration) | done | — | — | none |
| P1 | pilot bee-loop #1: README roles refresh | done | .hivemind/plans/2026-10-20-readme-roles-refresh.md | — | — |
| P2 | `bee` CLI stub: `bee report` + `bee init` | done | .hivemind/plans/2026-10-25-po-bee-cli-stub.md | project-orchestrator 2026-10-25 14:05 | — |
| P3 | orchestration build-out: git strategy (worktrees, phase branches, merge tiers), reviewer + implementer codification calibrated on the P2 run, orchestrator role formalization | planned | — | — | — |
| P4 | decisions inbox, built form: `bee` CLI queue of explicit-yes items and escalations; absorbs status.md + report generation | planned | — | — | — |
| P5 | memory system implementation (PL-002: headers-as-index storage, `bee memory`, three tiers) — gated by PL-002 unpark | planned | — | — | — |
| P6 | productization: full `bee init` contract, packaging, docs, harness name, release polish | planned | — | — | — |
