---
name: bee-plan-review
description: Reviews a written plan before the loop executes it — the gate between planning and implementation. Runs the mechanical core first (plan-checks.sh — target existence, block tagging, ephemeral prose, optional sandbox suite run), then judges six dimensions — accuracy, external reality, sandbox-run, ephemeral prose, determinism/AXI, no-globals boundary. Cold-dispatched; reports tiered findings and never fixes. Use before any plan is executed; finished work is bee-review's job, skill documents are bee-skill-review's.
---

# bee-plan-review

Judge a plan before anyone executes it. The mechanical core checks
what a script can check; this skill adds what only a reader can —
the plan's claims against the world. Read `../GLOSSARY.md` (the
shared bee glossary, sibling of this skill folder) first.

## Input

The dispatch names two things: the plan under review and where the
report goes. If either is missing, return the dispatch: findings
need a home before the review starts.

The gate reads two plan conventions — a plan without them fails
mechanically before judgment starts:

- **Machine header** — the plan's first `<!-- machine … -->` block
  carries phase, validation level, state-source (which surface
  holds the live task state — usually the plan's own checkboxes),
  the file targets (each marked create or modify), and the suite
  command.
- **Path-tagged verbatim blocks** — every fenced code block whose
  content is meant to land in a file carries a `path=` infostring
  naming that file; the core extracts tagged blocks into a sandbox,
  so verbatim content can be run, not just read. Untagged blocks
  are findings.

## The deterministic core: run it first

Run this repo's `scripts/plan-checks.sh` before reading the plan
for judgment — mechanical findings feed the judgment, they never
wait behind it. If the script is missing or errors (any exit other
than 0, 1, or 2), return the dispatch — a broken core is not a
finding, it is a stopped review. Two modes:

- `plan-checks.sh <plan.md>` — checks the targets against the repo
  (create targets reachable, modify targets existing), counts the
  task boxes, scans the plan's modify-targets for ephemeral prose
  markers (the marker list lives in the script — the script, not
  this text, is its source of truth), and verifies every verbatim
  block carries a path tag.
- `plan-checks.sh --run <plan.md>` — also runs the plan's declared
  suite command in a throwaway sandbox built from the extracted
  blocks. The script writes only to a temporary directory; nothing
  live is touched. For verbatim blocks the suite does not reach:
  `plan-checks.sh --extract <plan.md>` builds the sandbox, keeps
  it, and prints its path — run the block there the way its
  `path=` says it runs; clean the directory up when done.

Counts print always; findings print with a `finding` prefix; exit 0
is clean, 1 findings, 2 usage. Every script finding appears in the
report — judgment may triage its tier but never drops it. Never
re-implement a script check by hand.

## Cold dispatch

The reviewer is dispatched cold — someone who did not write the
plan and holds no stake in it. Read the plan whole, then the
surfaces its claims point at. Findings are the whole product: never
edit the plan under review, never fix what you find — fixes belong
to the planner's next round. A re-review after fixes is a fresh
dispatch.

## The dimensions

Review the plan against all six. Every finding names its dimension,
the file and line, and a concrete suggested fix.

- **Accuracy** — every claim the plan makes about the repo is true:
  paths exist as claimed, call sites say what the plan says they
  say, the contracts, names, and signatures later tasks rely on are
  what the plan says they are. A wrong fact becomes the
  implementer's binding spec — accuracy findings mislead by
  construction, which is why they block.
- **External reality** — the plan's claims about the world outside
  the repo hold: commands exist and behave as assumed, versions and
  flags match, the environment provides what the plan presumes.
  Verify against reality — run the command, read the docs — never
  against recall. A wrong assumption misleads exactly like a wrong
  fact; same tier.
- **Sandbox-run** — the plan's verbatim code runs before anyone
  implements it. `--run` covers the declared suite; verbatim blocks
  the suite does not reach get run in the sandbox too. A block that
  fails cold in review fails cold in implementation — that failure
  is cheapest here.
- **Ephemeral prose** — durable documents the plan touches carry no
  sentences that go stale. The core scans modify-targets for
  markers; the reviewer judges each hit and the plan's own prose: a
  quoted example inside a rule is the rule's definition text, not
  status residue — but the mechanical finding stands until waived
  with a recorded reason.
- **Determinism/AXI** — a plan that builds tooling assigns every
  deterministic step to a script (GLOSSARY: determinism test) and
  names the judgment each agent step keeps; agent-facing output it
  designs follows `docs/AXI.md` — structured output, counts first,
  definitive empty states, structured errors. An unassigned
  deterministic step is should-fix; one that misleads (the prose
  claims script-ownership the plan does not deliver) blocks.
- **No-globals boundary** — the work the plan directs depends only
  on bee-native instruments plus the foundations (GLOSSARY:
  bee-native); no step leans on a global skill or a global rules
  file. A plan whose gate or verification step names a global skill
  fails here.

## The report

Report to whoever dispatched you, in the record the dispatch named.
Findings come in two tiers:

- **Blocking** — the plan would stop or mislead anyone executing
  it: an inaccurate claim, a failed sandbox-run, a broken
  convention the core depends on, a global-skill dependency. Fix or
  escalate before the plan is executed; a blocking finding is never
  waived.
- **Should fix** — a real problem, not fatal; fixing before
  execution is the right call, but blocking is not the reviewer's.
  A should-fix may be waived instead of fixed — the waiver is
  written by whoever received the findings, one line beside the
  finding in this same report; silence is not a waiver. A re-review
  is a fresh dispatch over the fixed text; waived findings do not
  re-litigate — the record carries them.

The report opens with the core's counts and its findings (each
triaged to a tier), then the judgment findings. It ends with the
verdict: pass, or fail with the blocking findings named.

## Boundaries

- Plans only, before execution. Finished work is bee-review's;
  skill documents are bee-skill-review's; comprehension testing is
  bee-skill-tester's (siblings in this folder).
- Findings, never fixes; no edits to the plan under review.
- The core is the mechanical half: the reviewer reads its output,
  triages it, and never edits it either.
