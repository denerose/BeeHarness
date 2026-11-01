<!-- machine
role: project-orchestrator
date: 2026-11-02T09:38:14+11:00
verdict: PASS
checks-run: 1
plan: .hivemind/plans/2026-11-01-po-p5-memory-logbook-glossary.md @ 4678ca3
task: task-4
links: -
-->

Fix-round probes (reviewer r1 findings 1-2 replicated): (a) `glossary add x "y" --store <tmp>` (no --view) -> exit 1, error names --view, zero files written; live view byte-identical (test in suite, 25/25). (b) chained comparison split into two explicit indexOf assertions. Commit c55eb34.
