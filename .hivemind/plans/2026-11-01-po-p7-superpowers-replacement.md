# Plan: P7 — superpowers + global skills replacement migration

**Date:** 2026-11-01
**Design doc:** `.hivemind/designs/2026-11-01-pp-skill-authoring-kit.md`
**Validation level:** phase (recommended — multi-skill build with law
coordination and keeper gates; the design names keeper sign-off for
law-touching skills)
**Detail:** mixed — verbatim for code (the mechanical core + tests)
and sweep edit lists; lean for skill prose (drafted at implementation
from the design note; coverage = design note + `docs/WRITING-STANDARD.md`
+ `skills/GLOSSARY.md`; the review gates check the result)
**Reviewed:** PENDING
**Phase:** P7 (spine `phase/7`; status surface: status.md)

<!-- machine (ADR-014 mixed-document rule)
phase: P7
validation: phase
state-source: checkboxes below (script-owned when bee task lands)
targets:
  - skills/bee-skill-write/SKILL.md (create)
  - skills/bee-skill-review/SKILL.md (create)
  - skills/bee-plan-review/SKILL.md (create)
  - skills/bee-handoff/SKILL.md (create)
  - skills/bee-pickup-handoff/SKILL.md (create)
  - scripts/plan-checks.sh (create)
  - tests/plan-checks.test.mjs (create)
  - skills/bee-loop/SKILL.md (modify)
  - skills/bee-review/SKILL.md (modify)
  - skills/bee-verify/SKILL.md (modify)
  - skills/bee-plan/SKILL.md (modify)
  - skills/bee-plan/assets/plan-template.md (modify)
  - skills/GLOSSARY.md (modify)
  - .hivemind/phases/BeeHarness.md (modify)
suite: node --test tests/*.test.mjs
-->

## Standing rules for every task

- **Shipping test (governing):** no shipped component cites our ADRs,
  designs, plans, or `.hivemind/` paths. New skill text is
  self-contained; law lives inline; citations allowed only to shipped
  plugin docs (`docs/AXI.md`, `docs/WRITING-STANDARD.md`) and the
  project's own glossary.
- **Scope guard:** the keeper's global kit is untouched — no edits to
  anything under `~/.pi/agent/` (skills or AGENTS.md). Replacement
  means independence, not cleanup.
- **Generic examples only** (writing standard): placeholders and
  generic actors in all behavior docs; no dated stories.
- **Bootstrap order** (design note): builds 1–2 (the pair) get
  comprehension tests via `bee-skill-tester` and quality review by
  cold dispatch; from build 3 on, `bee-skill-review` reviews.
- **Worktree discipline** (ADR-012): build tasks run in
  `task/p7-<slug>` worktrees cut from `phase/7` via
  `scripts/task.sh`; records ride the task branch; shared surfaces
  (status.md, phases/, plans/) are edited from the main checkout.
- Every task's finished-test includes its reference sweep — the build
  is not finished until no stale reference remains (grep shown).

## Task 1: bee-skill-write (build 1 of the meta pair)

**Files:** create `skills/bee-skill-write/SKILL.md`; modify
`skills/GLOSSARY.md` (entry: bee-skill-write)
**Depends on:** nothing
**Provides:** the authoring-craft skill; front-matter conventions
later tasks follow; the artifact-test (skill vs script vs role-file
line vs glossary entry)

- [ ] Draft `skills/bee-skill-write/SKILL.md` from the design note's
  "Decided" section. Content it must carry (structure, not verbatim —
  lean detail): skill structure and front matter; the artifact test
  ("is a skill even the right artifact" — vs script, role-file line,
  glossary entry); the determinism split for skills (wrap judgment
  around a scripted core; name the judgment kept — cite
  `docs/WRITING-STANDARD.md`); the lifecycle (draft → cold-test →
  review → sign-off, with keeper sign-off named for law-touching
  skills); front-matter registry conventions (name, description;
  machine-indexable — a `bee skills` command is explicitly out of
  scope for P7). Self-contained text; no ADR citations.
- [ ] Add GLOSSARY entry: `bee-skill-write` — one-paragraph
  definition, sibling-skill pointers, no ADR anchors beyond file
  paths.
- [ ] Cold-test: dispatch `bee-skill-tester` on the drafted skill
  (one cheap subagent per its procedure); expected: comprehension
  gaps found get fixed; tester verdict recorded in the logbook entry.
- [ ] Quality review: cold-dispatch a reviewer subagent (P3 pattern)
  against the design note's bee-skill-write bullet list; findings
  fixed; verdict + evidence in the logbook entry.
- [ ] Verify: `grep -rn "ADR-\|\.hivemind" skills/bee-skill-write/`
  returns nothing (shipping test); `ls skills/bee-skill-write/SKILL.md`.
- [ ] Record: logbook `2026-11-01-po-p7-task1-{verify,review}-r1.md`
  (task-branch saves, ADR-013 naming).
- [ ] Commit: `add bee-skill-write authoring skill`

## Task 2: bee-skill-review (build 2 of the meta pair)

**Files:** create `skills/bee-skill-review/SKILL.md`; modify
`skills/GLOSSARY.md` (entry: bee-skill-review)
**Depends on:** nothing structural; sequenced after Task 1 (bootstrap
order reads cleaner once the lifecycle skill exists)
**Provides:** the design-quality gate; the review dimensions the
phase's later builds are reviewed against

- [ ] Draft `skills/bee-skill-review/SKILL.md` from the design note's
  "Decided" section. Must carry: the dimensions (procedure soundness,
  scripts-first compliance, duplication, invariants — role-agnostic,
  ambient pickup, decision-record consistency phrased generically,
  scope); cold-dispatch pattern (reports findings, never fixes);
  tiered findings (blocking / should-fix — self-contained wording,
  no ADR citations); when keeper sign-off applies (law-touching
  skills). Self-contained text.
- [ ] Add GLOSSARY entry: `bee-skill-review` (same shape as Task 1's).
- [ ] Cold-test via `bee-skill-tester`; fix findings.
- [ ] Quality review: cold-dispatch (same pattern as Task 1) against
  the design note's bullet list; fix findings; record.
- [ ] Verify: shipping-test grep (as Task 1); file exists.
- [ ] Record: logbook `…-task2-{verify,review}-r1.md`.
- [ ] Commit: `add bee-skill-review design-quality gate`

## Task 3: bee-plan-review — the in-house plan reviewer (build 3)

**Files:** create `skills/bee-plan-review/SKILL.md`;
create `scripts/plan-checks.sh`; create `tests/plan-checks.test.mjs`;
modify `skills/GLOSSARY.md` (plan entry sweep + bee-plan-review
entry)
**Depends on:** Task 2 (bee-skill-review reviews this build — the
kit dogfoods from build 3 on)
**Provides:** `bee-plan-review` skill; `plan-checks.sh <plan.md>` +
`plan-checks.sh --run <plan.md>`; the reference sweep that retires
the global plan-reviewer references; the path-tagged code-block
convention

- [ ] Create `scripts/plan-checks.sh` (verbatim below; executable bit
  set). Checks, in order — counts first, failures-only detail, exit
  1 on any failure (AXI: structured output, definitive empty states):

```bash path=scripts/plan-checks.sh
#!/usr/bin/env bash
# plan-checks.sh — mechanical plan-gate checks (deterministic core
# of bee-plan-review). Usage:
#   plan-checks.sh <plan.md>          run checks 1-4, emit findings
#   plan-checks.sh --run <plan.md>    also run the plan's suite
#                                     command in the sandbox
# Output: TOON-ish lines "key: value"; findings only on failure;
# exit 0 = clean, 1 = findings, 2 = usage.
set -u
PROG=$(basename "$0")

usage() { echo "usage: $PROG [--run] <plan.md>" >&2; exit 2; }

RUN=0
[[ "${1:-}" == "--run" ]] && { RUN=1; shift; }
[[ $# -eq 1 ]] || usage
PLAN=$1
[[ -f $PLAN ]] || { echo "error: no plan file: $PLAN" >&2; exit 2; }
# Targets are repo-relative to the PLAN's directory, never CWD.
PLAN=$(cd "$(dirname "$PLAN")" && pwd)/$(basename "$PLAN")
PLAN_DIR=$(dirname "$PLAN")
# Targets are repo-relative: resolve against the repo root when the
# plan lives in one, else the plan's directory (bare fixtures).
PLAN_ROOT=$(git -C "$PLAN_DIR" rev-parse --show-toplevel 2>/dev/null || echo "$PLAN_DIR")

fail=0
note() { echo "$1"; fail=1; }

# 1 files: create-targets' parent dirs exist; modify-targets exist.
# Targets come from the plan's FIRST machine block (delimited by
# '<!-- machine' … '-->'), '- ' bullets, trailing
# "(create)"/"(modify)" markers. Only the first block is parsed —
# verbatim code inside the plan may embed fixture machine blocks.
mblock=0
mode=none
while IFS= read -r raw; do
  line=${raw#"${raw%%[! ]*}"}
  if [[ $mblock -eq 0 ]]; then
    case $line in
      *"<!--"*machine*|machine*"<!--"*) mblock=1; mode=none; continue ;;
    esac
    continue
  fi
  case $line in
    "-->") mblock=0; break ;;
    targets:*) mode=targets; continue ;;
    machine*|suite:*|phase:*|validation:*|state-source:*) mode=none; continue ;;
  esac
  [[ $mode == targets ]] || continue
  [[ $line == -* ]] || { mode=none; continue; }
  path=${line#- }
  case $path in
    *"(create)"*)  p="$PLAN_ROOT/${path% *}"
                   a=$p
                   while [[ ! -e $a && $a != "/" ]]; do a=$(dirname "$a"); done
                   [[ -d $a ]] || note "finding files: create-target blocked by a non-directory ancestor: ${path% *}" ;;
    *"(modify)"*)  p="$PLAN_ROOT/${path% *}"
                   [[ -e $p ]] || note "finding files: modify-target missing: ${path% *}" ;;
    *)             [[ -e "$PLAN_ROOT/$path" ]] || note "finding files: target missing and unmarked: $path" ;;
  esac
done < "$PLAN"

# 2 boxes: per-task checkbox counts (informational; the loop owns
# state — this is the claim-vs-record input, not a gate).
boxes_total=$(grep -c '^\s*- \[.\]' "$PLAN" || true)
boxes_done=$(grep -c '^\s*- \[x\]' "$PLAN" || true)
echo "boxes: $boxes_done/$boxes_total"

# 3 prose: ephemeral markers in the plan's own modify-targets
# (durable docs the plan will touch that already exist).
for p in $(grep -oE '^\s*- \S+.*\(modify\)' "$PLAN" | awk '{print $2}'); do
  ap="$PLAN_ROOT/$p"
  [[ -f $ap ]] || continue
  while IFS= read -r hit; do
    note "finding prose: $p: $hit"
  done < <(grep -nwE 'currently|is running|as of today|right now' "$ap" || true)
done

# 4 blocks: extract fenced blocks tagged with a path= infostring
# into a sandbox dir; untagged blocks are findings (the reviewer's
# sandbox-run depends on tagging).
SANDBOX=$(mktemp -d "${TMPDIR:-/tmp}/plan-checks.XXXXXX")
awk '
  /^```/ {
    if (inblock) { inblock=0; close(out) } else {
      inblock=1; n++
      tag=$0; sub(/^```/, "", tag)
      if (match(tag, /path=[^ ]+/)) {
        out=SAND "/" substr(tag, RSTART+5, RLENGTH-5)
        dir=out; sub(/\/[^\/]*$/, "", dir)
        system("mkdir -p \"" dir "\" 2>/dev/null")
      } else { out=SAND "/untagged-" n }
    }
    next
  }
  inblock { print > out }
' SAND="$SANDBOX" "$PLAN" 2>/dev/null
n_untagged=$(find "$SANDBOX" -name 'untagged-*' | wc -l)
n_blocks=$(find "$SANDBOX" -type f | wc -l)
n_tagged=$(( n_blocks - n_untagged ))
n_fences=$(grep -c '^```' "$PLAN" || true)
n_expected=$(( n_fences / 2 ))
echo "blocks: $n_tagged/$n_expected tagged, $n_untagged untagged"
[[ $n_untagged -eq 0 ]] || note "finding blocks: $n_untagged untagged code block(s) — every verbatim block needs a path= tag"
[[ $n_blocks -ge $n_expected ]] || note "finding blocks: extraction mismatch — $n_expected fenced block(s) in plan, $n_blocks extracted"

# --run: execute the plan's declared suite in the sandbox.
if [[ $RUN -eq 1 ]]; then
  suite=$(grep -oE '^suite: .*' "$PLAN" | head -1 | cut -d' ' -f2-)
  if [[ -n $suite ]]; then
    echo "suite: $suite"
    if (cd "$SANDBOX" && eval "$suite" >/dev/null 2>&1); then
      echo "suite: pass"
    else
      note "finding suite: command failed in sandbox: $suite"
    fi
  else
    note "finding suite: no suite: line in machine block (--run given)"
  fi
fi

[[ $fail -eq 0 ]] && echo "checks: clean" || echo "checks: findings"
rm -rf "$SANDBOX"
exit $fail
```

- [ ] Create `tests/plan-checks.test.mjs` (verbatim below; suite:
  `node --test tests/*.test.mjs`):

```javascript path=tests/plan-checks.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, chmodSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';

const SCRIPT = join(dirname(new URL(import.meta.url).pathname), '..', 'scripts', 'plan-checks.sh');

function fixture(plan, files = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'plan-checks-test-'));
  for (const [p, c] of Object.entries(files)) {
    mkdirSync(join(dir, dirname(p)), { recursive: true });
    writeFileSync(join(dir, p), c);
  }
  const planPath = join(dir, 'plan.md');
  writeFileSync(planPath, plan);
  return { dir, planPath };
}

function run(args, cwd) {
  try {
    const out = execFileSync('bash', [SCRIPT, ...args], { cwd, encoding: 'utf8' });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status, out: e.stdout ?? '' };
  }
}

const MACHINE = `<!-- machine
phase: T
validation: task
state-source: checkboxes
targets:
  - exists.md (modify)
suite: echo ok
-->`;

test('clean plan passes with counts and no findings', () => {
  const { planPath, dir } = fixture(`${MACHINE}\n\n# Plan\n\n- [ ] step one\n- [x] step two\n`, { 'exists.md': 'durable text\n' });
  const r = run([planPath], dir);
  assert.equal(r.code, 0);
  assert.match(r.out, /boxes: 1\/2/);
  assert.match(r.out, /checks: clean/);
});

test('missing modify-target is a finding', () => {
  const { planPath, dir } = fixture(`${MACHINE}\n`);
  const r = run([planPath], dir);
  assert.equal(r.code, 1);
  assert.match(r.out, /modify-target missing: exists\.md/);
});

test('ephemeral prose in a durable target is a finding', () => {
  const { planPath, dir } = fixture(`${MACHINE}\n`, { 'exists.md': 'the pilot is currently running\n' });
  const r = run([planPath], dir);
  assert.equal(r.code, 1);
  assert.match(r.out, /prose: exists\.md/);
});

test('untagged code block is a finding; tagged block extracts', () => {
  const { planPath, dir } = fixture(
    `${MACHINE}\n\n\`\`\`bash path=scripts/x.sh\necho hi\n\`\`\`\n\n\`\`\`bash\necho loose\n\`\`\`\n`,
    { 'exists.md': 'ok\n' });
  const r = run([planPath], dir);
  assert.equal(r.code, 1);
  assert.match(r.out, /blocks: 1\/2 tagged, 1 untagged/);
});

test('--run executes the declared suite and passes', () => {
  const { planPath, dir } = fixture(`${MACHINE}\n`, { 'exists.md': 'ok\n' });
  const r = run(['--run', planPath], dir);
  assert.equal(r.code, 0);
  assert.match(r.out, /suite: pass/);
});

test('usage errors exit 2', () => {
  assert.equal(run([]).code, 2);
});
```

- [ ] Verify: `bash -n scripts/plan-checks.sh` (syntax);
  `node --test tests/plan-checks.test.mjs` — 6/6 pass. Run the script
  against THIS plan: `bash scripts/plan-checks.sh
  .hivemind/plans/2026-11-01-po-p7-superpowers-replacement.md` —
  expected: findings limited to the quoted-example class in existing
  rule text plus the genuine one on `skills/bee-review/SKILL.md`'s
  "currently undecided" line (that line is rephrased in Task 5);
  anything else gets named and fixed.
- [ ] Draft `skills/bee-plan-review/SKILL.md` — self-contained text,
  no ADR citations. Must carry: the six dimensions (accuracy,
  external reality, sandbox-run — extract the plan's tagged blocks
  and run them, ephemeral prose, determinism/AXI — scripts-first,
  compliant surfaces, no global-skill dependencies); the
  deterministic core (`plan-checks.sh` — mechanical checks first,
  findings feed the judgment); tiered findings (blocking / should-fix
  with waiver rule: waived should-fix needs a one-line recorded
  reason); cold-dispatch pattern; reports findings, never fixes.
- [ ] Review THIS build with `bee-skill-review` (dogfood, build 3) +
  cold-test via `bee-skill-tester`; fix findings; record.
- [ ] Reference sweep (each edit verbatim; after this sweep no
  live doc names the global plan-reviewer as the gate):
  - `skills/bee-plan/SKILL.md`: three `plan-reviewer` mentions →
    point at `bee-plan-review` (the gate line names the bee-native
    skill; the "not the global plan skill" notes stay — that skill
    is not replaced by P7).
  - `skills/bee-plan/assets/plan-template.md`: `**Reviewed:**
    plan-reviewer passed YYYY-MM-DD / PENDING` → `**Reviewed:**
    bee-plan-review passed YYYY-MM-DD / PENDING`.
  - `skills/bee-review/SKILL.md`: two scope notes → name
    `bee-plan-review`.
  - `skills/bee-hindsight/SKILL.md`: plan-reviewer mention →
    `bee-plan-review`.
  - `skills/bee-skill-tester/SKILL.md`: plan-reviewer mention →
    `bee-plan-review`.
  - `skills/GLOSSARY.md`: `plan` entry's reviewer mention →
    `bee-plan-review`; new `bee-plan-review` entry.
  - `AGENTS.md` plan-review-gate rule → names `bee-plan-review`
    (**law edit — power-planner's**: post the [PO] status note when
    this task starts; PP lands the AGENTS.md edit on main in the
    same window; build not finished until law and tool agree).
- [ ] Verify sweep: `grep -rn "plan-reviewer" skills/ AGENTS.md
    roles/ docs/` returns only historical/plans/logbook paths (live
    behavior docs: zero).
- [ ] Record: logbook `…-task3-{verify,review}-r1.md`.
- [ ] Commit: `add bee-plan-review with scripted mechanical core`

## Task 4: bee-native handoff pair

**Files:** create `skills/bee-handoff/SKILL.md`;
create `skills/bee-pickup-handoff/SKILL.md`; modify
`skills/GLOSSARY.md` (handoff entry sweep + pair entries)
**Depends on:** nothing structural (after Task 3 keeps one sweep
window for the PP law edits)
**Provides:** bee-native handoff scaffolding; the AGENTS.md handoff
rule re-pointed (PP law edit, coordinated)

- [ ] Draft both skills — they mirror the current handoff ritual
  (already bee-native in the role files; the skills scaffold it):
  `bee-handoff` (locate the role's handoff file; absorb session
  state; write the handoff: goal, done, in-flight, next, wake prompt
  — fenced markdown; memory-sync final step; NO parking-lot sweep in
  a refresh handoff); `bee-pickup-handoff` (read the role's handoff
  whole; re-read law files changed since; verify current state
  against the repo — `git status`, `git log`; announce role + first
  move in the first reply). Self-contained text; per-role file
  paths stay placeholders (`<repo-root>/.pi/handoff-<role>.md`).
- [ ] Cold-test both via `bee-skill-tester`; quality review via
  `bee-skill-review` (exists since Task 2); fix; record.
- [ ] Reference sweep: `skills/GLOSSARY.md` handoff entry → names
  the bee pair; `AGENTS.md` handoff rule → names the bee pair
  (**law edit — power-planner's**, same coordination pattern as
  Task 3: [PO] status note, PP lands it in-window).
- [ ] Verify sweep: `grep -rn "pickup-handoff" skills/ AGENTS.md
    | grep -v "bee-pickup-handoff"` → empty, and
    `grep -n "handoff" AGENTS.md | grep -v "bee-"` → empty (the
    handoff rule names only the bee pair; expected residue: none).
    No live doc names the global pair as the instrument.
- [ ] Dogfood: the next handoff this session runs uses the pair.
- [ ] Record: logbook `…-task4-{verify,review}-r1.md`.
- [ ] Commit: `add bee-native handoff pair`

## Task 5: loop-skill folds + determinism-law lines

**Files:** modify `skills/bee-loop/SKILL.md`;
modify `skills/bee-review/SKILL.md`;
modify `skills/bee-verify/SKILL.md`;
modify `skills/bee-plan/SKILL.md`;
modify `skills/bee-plan/assets/plan-template.md`
**Depends on:** Task 3 (sweep already touched bee-plan; this task
adds content, not references)
**Provides:** review-etiquette and debug guidance folded bee-native;
ADR-014 plan-time determinism lines; machine-header template; the
fold-order note P4's plan must carry

- [ ] `bee-loop`: add (a) review-etiquette fold — reviewer briefs
  carry the etiquette lines (findings cite evidence, no re-design
  essays, tiered findings only); (b) debug fold — systematic-debug
  guidance as loop steps (reproduce before fixing; evidence before
  assertions — already law-shaped here, keep the skill's phrasing
  self-contained); (c) Record-step rule: never hand-edit state a
  script owns — script-owned state moves via the script; (d)
  fix-round waiver rule (a post-fix confirmation pass may be waived
  when the fix is the reviewer's own suggested change applied
  verbatim AND the fix-round verify record replicates the reviewer's
  probe — one-line reason recorded; blocking findings always
  re-reviewed).
- [ ] `bee-review`: add (a) etiquette fold (same lines); (b) the
  mechanical claim-vs-record check runs BEFORE quality judgment:
  checked boxes vs logbook entries, states vs evidence — findings
  from this check are blocking.
- [ ] `bee-verify`: add the debug fold's judgment line — anomalies
  get reproduced before any fix is proposed. Mark the P4 boundary
  inline: "mechanics move to the `bee verify` CLI at P4; the
  judgment line (is this output sane; anomalies reproduced) stays
  in the skill."
- [ ] `bee-plan` + template: add the plan-time determinism test
  (deterministic work is assigned to scripts; the plan names the
  judgment each agent step keeps) and the machine-header fields to
  the template (phase, validation, state-source, targets, suite —
  the block this plan already carries; path-tagged code blocks for
  verbatim content, so the reviewer's sandbox-run is mechanical).
- [ ] Dispatch-pattern documentation (design decision: the dispatch
  pattern ships as task-orc/dispatch documentation, not a skill):
  verify the shipped homes carry the pattern complete —
  `roles/task-orc.md` (dispatch-brief section + boundary rules),
  `skills/bee-loop/assets/dispatch-brief-template.md`, and the
  GLOSSARY dispatch entries (`dispatch`, `dispatch brief`, safety
  lines). Fill any gap so a cold dispatcher can run the pattern from
  these homes alone (self-contained text). ADR-citation stripping
  across shipped docs is P8's ship-tier sweep — out of scope here.
- [ ] Rephrase the genuine ephemeral line in `skills/bee-review/SKILL.md`
  ("currently undecided, so if asked, escalate") to durable wording
  (e.g. "the keeper decides this; if asked, escalate") — surfaced by
  plan-checks' prose check during plan review.
- [ ] Cold-test the four modified skills via `bee-skill-tester`
  (modified skills get the same comprehension bar as new ones).
- [ ] Verify: `node --test tests/*.test.mjs` green; targeted greps
    confirm each added rule line landed (bee-loop: waiver rule +
    Record-step rule; bee-review: claim-vs-record check; bee-verify:
    P4-boundary judgment line; bee-plan: determinism test + machine
    header fields in template); `bash scripts/plan-checks.sh` on this
    plan stays clean on files/blocks.
- [ ] Record: logbook `…-task5-{verify,review}-r1.md`.
- [ ] Commit: `fold etiquette and debug guidance, add determinism lines`

## Task 6: keeper sign-off + phase close

**Files:** modify `.hivemind/phases/BeeHarness.md`; logbook entries;
status.md note
**Depends on:** Tasks 1–5 + both PP law edits landed
**Provides:** P7 done; the boundary closed (loop-gated instruments
all bee-native)

- [ ] Keeper gate (one card, self-contained): the pair + reviewer
  texts for sign-off (law-touching skills), with the phase-diff
  summary and the sweep evidence. Fix-rounds before close if wanted.
- [ ] Phase review: dispatched `bee-review` on `main..phase/7`
  (findings → fix rounds; blocking findings re-reviewed per the
  waiver rule's exception).
- [ ] Phase verify: suite green (`node --test tests/*.test.mjs`),
  shipping test green repo-wide over skills/ (no ADR/.hivemind
  references in live skill text), boundary green (`grep -rn
  "plan-reviewer\|handoff skill" AGENTS.md skills/` → live docs name
  only bee-native instruments).
- [ ] Close mechanics (the P3 lesson): merge `phase/7` → main AS A
  MERGE COMMIT (never direct commits); detach the persistent
  worktree at main; `git branch -d phase/7`; push; flip the phase
  row to done.
- [ ] Status note + keeper-report regen (per ADR-008 protocol).
- [ ] Hindsight: file suggestions (dispatch calibration, close
  mechanics — the scripted-close suggestion's first real user was
  this close, note deviations).
- [ ] Commit: `close P7 replacement migration`

## Phase exit

- `node --test tests/*.test.mjs` green (P2 + P3 + plan-checks suites).
- Shipping test (scoped to what P7 ships): skill text added or
  modified by this phase carries no citations of our ADRs, designs,
  or plans, and no references into our working documents —
  self-contained text only (pattern: `grep -nE "ADR-[0-9]|designs/|plans/"`
  over the phase-touched skill files → empty). Runtime working
  paths the loop itself operates on (e.g. `.hivemind/logbook/`,
  `.hivemind/phases/`) and the working GLOSSARY's ADR anchors are
  the decided exceptions (design note: two-glossaries section). The
  repo-wide ship-tier strip is P8's sweep, not this gate.
- Bee-native boundary: AGENTS.md gate + handoff rules name
  bee-native instruments; law and tool agree.
- Keeper has signed off on the pair + reviewer texts; P8 remains
  gated (not started — propose-next at the loop-back gate).
- Phase row: done. Spine merged (merge commit), worktree resting
  detached at main, branch deleted.
