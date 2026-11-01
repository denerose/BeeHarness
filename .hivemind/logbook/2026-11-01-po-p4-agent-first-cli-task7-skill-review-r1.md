# Skill-review gate — P4 Task 7 (bee-verify + bee-plan revisions)

**Role:** project-orchestrator (loop) · **Date:** 2026-11-01 ·
**Subject:** the two skill texts revised in Task 7's commit ef37bbf

This entry is the durable home for the bee-skill-review gate that ran
inside Task 7's dispatch — review r1 found 4 blocking findings across
the two revised skills (fixed before commit), and a fresh re-review
confirmed all four fixes. The scouts' verbatim reports died with the
dispatching session; this entry reconstructs the gate's product from
the fix-round evidence (the applied fixes are checkable in the ef37bbf
diff and the final texts). Reconstruction, marked as such — recorded
per the task-7 work review's should-fix finding.

## bee-verify (thinned toward `bee verify`) — r1: 3 blocking + 2 advisories

1. BLOCKING — BLOCKED verdict the CLI cannot mint: the draft told the
   agent to record BLOCKED, but `bee verify` writes only PASS/FAIL
   entries. FIX APPLIED: BLOCKED restated as the report's verdict, not
   an entry the command mints (the command emits FAIL with its fix
   line, or writes nothing when nothing ran — `0 checks`).
2. BLOCKING — anomaly-append instruction contradicted bee-loop's
   "never hand-edit state a script owns" without naming a mechanism.
   FIX APPLIED: mechanism named — the entry's prose body is the
   anomaly slot (append notes there); the machine header stays script
   territory, never hand-edited.
3. BLOCKING — stale `assets/verify-record-template.md` (old hand-shape
   record) contradicted the command-owned entry shape. FIX APPLIED:
   template deleted (reference sweep confirmed zero orphans).
   Advisories applied: `--base` mentioned; levels-vs-command note
   ("the command runs what the header declares").

## bee-plan (rule 4 + checks pointer) — r1: 1 blocking + advisories

1. BLOCKING — the draft claimed the plan reviewer's sandbox-run reads
   the `checks:` entries; verified false against `scripts/plan-checks.sh`
   (`--run` reads only `suite:`). FIX APPLIED: clause dropped; the
   checks pointer now attributes only what reads them (`bee verify`).
   Advisory applied: rule 4's verification command tied to the
   `checks:` entry's `cmd`. Advisory waived (recorded): template
   optionality annotation — the template is Task 5's reviewed verbatim
   contract, outside Task 7's file list.

## Re-review (fresh cold dispatch, both final texts)

All dimensions PASS on both skills; zero blocking; all four fixes
CONFIRMED against the final texts. Two advisories carry no tier
(optional half-line on the header/body carve-out; unscoped-write
note) — recorded in the task-7 verify record.

Role: project-orchestrator
