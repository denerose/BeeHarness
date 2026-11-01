<!-- machine
role: project-orchestrator
date: 2026-11-02T09:18:23+11:00
verdict: PASS
checks-run: 1
plan: .hivemind/plans/2026-11-01-po-p5-memory-logbook-glossary.md @ 1cc1092
task: task-2
links: -
-->

Fix-round probes (reviewer r1 findings 1-3 replicated): (a) fence fixture test passes (quoted complete machine block -> stamped as legacy, not skipped; test in suite, 11/11); (b) stamp --check snapshot test byte-identical (in suite); (c) `bee logbook help` shows "--check (stamp)  never write"; `bee logbook index --check` still exit 1 Unknown option. Commit 1638cc2.
