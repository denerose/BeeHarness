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
| P6 | productization: full `bee init` contract, packaging, docs, harness name, release polish incl. full AXI compliance pass (ADR-014) and folding `scripts/worktree.sh` into the CLI as `bee worktree` | planned | — | — | — |
| P7 | superpowers + global skills replacement migration, BOTH SLICES DESIGNED (kit note, replacement session 2026-11-01): (1) meta pair — bee-skill-write/review, buildable now; (2) superpowers/global replacement — in-house plan reviewer (dimensions as self-contained text, shipping test) + bee-native handoff pair + etiquette/debug folds + `bee guidance` direction (feeds PL-PP-003) + tier sort confirmed; each build updates every old reference as part of finishing (inventory in `designs/2026-11-01-pp-skill-authoring-kit.md`); closes the bee-native boundary (ADR-015); completes before P6 | done | .hivemind/plans/2026-11-01-po-p7-superpowers-replacement.md | project-orchestrator 2026-11-01 02:50 | — |
| P8 | RECTIFICATION + ship-tier cleanup (runs after P7 closes; absorbs everything that accumulated after P7's pickup — no in-flight interruptions; VERIFIES what actually landed in P7's output rather than assuming, then applies the rest idempotently): apply the entry-discipline standards to the meta pair, execute the skill reorganization (kit folders loop/thinking/skilldev/roles + `kit:` front matter + GLOSSARY pointer sweeps, per the kit note), then the ship-tier work — strip references to OUR ADRs, designs, plans, and `.hivemind/` paths from every shipped skill (they carry their own rule text; users' records are theirs); produce the TEMPLATE GLOSSARY (core bee terms, self-contained, no ADR anchors, user-extendable; scaffolding lands with the P6 init contract); the user-side face of the bee-native boundary (ADR-015); gated by P7 completing; completes before P6 | planned | — | — | — |
