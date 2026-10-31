# Phases — BeeHarness

One line per phase. This is the loop's only tracking file: update the
status, link the plan, never grow tasks here (tasks live in plans).

Statuses: planned · in-progress · blocked · escalated · done

| id | description | status | plan | owner | escalations |
|---|---|---|---|---|---|
| P0 | bootstrap the build track (roles into ADRs, skills review, registration) | done | — | — | none |
| P1 | pilot bee-loop #1: README roles refresh | done | .hivemind/plans/2026-10-20-readme-roles-refresh.md | — | — |
| P2 | `bee` CLI stub: `bee report` + `bee init` | done | .hivemind/plans/2026-10-25-po-bee-cli-stub.md | project-orchestrator 2026-10-25 14:05 | — |
| P3 | orchestration build-out: git strategy (worktrees, phase branches, merge tiers), reviewer + implementer codification calibrated on the P2 run, orchestrator role formalization | done | .hivemind/plans/2026-10-31-po-p3-orchestration-buildout.md | project-orchestrator 2026-10-31 23:15 | — |
| P4 | agent-first CLI build-out: decisions inbox born-TOON (absorbs status.md queues + suggestions), `bee task` state moves, `bee verify`, AXI baked in (ADR-014, `docs/AXI.md`); CLI-writing + AXI skills/rules drafted; task-orc codification per retired-PO feedback — role file stays MINIMAL, surgical additions only, plan-quality standards get the investment (input: P4 note's codification section + calibration index); design note `designs/2026-10-25-pp-p4-inbox-design.md` (+ addenda) | planned | — | — | — |
| P5 | memory system implementation (PL-002: TOON store + `bee memory`, three tiers — born-lean per ADR-014) — gated by PL-002 unpark | planned | — | — | — |
| P6 | productization: full `bee init` contract, packaging, docs, harness name, release polish incl. full AXI compliance pass (ADR-014) | planned | — | — | — |
| P7 | superpowers + global skills replacement migration: bee-native replacements (plan reviewer, skill-write/review pair, plus homes for ADR-writing and the handoff pair per the session's sort); each build updates every old reference as part of finishing (inventory in `designs/2026-11-01-pp-skill-authoring-kit.md`); closes the bee-native boundary (ADR-015); gated by the keeper's-list session; completes before P6 | planned | — | — | — |
| P8 | ship-tier cleanup: review every skill (and GLOSSARY) that ships to users; strip references to OUR ADRs, designs, plans, and `.hivemind/` paths — shipped skills carry their own rule text and never point into our working documents (users' repos have their own ADRs, memories, and designs; our planning ephemera must not pollute theirs — the user-side face of the bee-native boundary, ADR-015); produces the TEMPLATE GLOSSARY shipped to new repos — core bee terms, self-contained rule text, no ADR anchors, user-extendable (our working GLOSSARY stays ours; scaffolding lands with the P6 init contract); gated by P7's tier sort; completes before P6 | planned | — | — | — |
