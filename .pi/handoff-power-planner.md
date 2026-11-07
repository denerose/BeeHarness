# Handoff — power-planner

**Updated:** 2026-11-01 (third session: determinism/AXI, the
replacement session, P7 close support, guides-and-sensors + pillars
reviews; supersedes the 10-31 refresh)

## Working mode — read this first

Resume **POWER-PLANNER** (mandate: `roles/power-planner.md` — read it
whole; the Mandate now opens with **directing-with-care**: your words
become other agents' binding context — complete, unambiguous,
state-aware, through channels that reach). Then:

- Conversation first; no cards while exploring; in rapid dialogue,
  recommendations ride in prose — the keeper's next message stands.
- Corrections apply at the keeper's STATED scope, then stop.
- Session lifecycle is the keeper's call — never recommend a fresh
  session or handoff.
- The keeper's verbs are invocations (argue, park, handoff) —
  recognition, not evaluation.
- Check a design's status stamp before editing it (ADR-016): `live`
  edits freely; `picked-up`/`implemented` take dated addenda marked
  *pending rectification*, never in-place rewrites.
- Kickoff is still design window; PICKUP freezes inputs. Never
  interrupt in-flight work — rectification phases absorb late
  changes; verify consumer state, never assume it.
- PP lands records (ADRs, designs, standards, phase rows, role
  files, GLOSSARY) on keeper direction. PO builds skills/scripts/CLI.
  Never volunteer to draft builds.
- Plain language; exact bytes when editing (anchor on unique
  surviving lines; the read display flattens continuation
  indentation — grep the real bytes first; a failed match is the
  warning working).
- WAKE-TIME CHECKLINES (the session's failure modes, read before
  the first reply): summaries in plain words — no invented packaging
  phrases, no "pending your word" ceremony; no unasked minting —
  direction-to-artifact speed is the drift (plan-vs-action law;
  ME-001); digests point at sources, never paraphrase.

## First task on wake

**PL-PP-012 — the references home** (keeper-directed design session).
A place for guiding research/references. Context: the parking-lot
entry plus two notes currently holding references:
`.hivemind/designs/2026-11-01-pp-guides-and-sensors-review.md`
(sources: Böckeler's harness-engineering + sensors articles) and
`.hivemind/designs/2026-11-01-pp-four-pillars-review.md` (the
four-pillars excerpt is held there until 012 gives it a home).
Status lines matter: the pillars are a LENS, not law; AXI
(`docs/AXI.md`) IS law for the CLI — different classes, never merge
them. Shipping test frames the design: the SLOT ships to consuming
projects (their tax rules, their veganism guides, wired into
guidance); our build-time content never ships. Open questions in the
entry: form (a `.hivemind` class? docs/research/? linked from
guidance topics?), what init scaffolds, relation to PL-PP-006 and
the guidance-bundles model (guides-and-sensors note's work-types
section).

## Where we are

- **ADRs 001–016 current.** Recent: 014 deterministic-first +
  agent-first/AXI + three-way storage; 015 bee-native boundary
  (machine settings followed, not forked); 016 design-doc lifecycle
  (status stamps, hash linkage, append-only after pickup, scripted
  transitions — TEMPLATE.md exists; `bee design` in P4).
- **P7 done and merged**: bee-plan-review (six dimensions +
  plan-checks.sh mechanical core), bee-handoff/bee-pickup-handoff
  pair, meta pair (bee-skill-write/review), kit folders live as
  `skills/{loop,session,skilldev}`. **OPEN RULING: folder name —
  `session/` as built vs `thinking/` (confirmed with PP post-pickup,
  never reached PO); P8 reconciles either way. TIER RULING pending
  keeper confirmation: bee-plan-review stays tiered (PP
  recommendation) — all-block is skill-review-specific.**
- **P4 IN KICKOFF** (propose-next issued; PO assembling its kickoff
  card): seven-item decision list in the P4 note awaits rulings —
  close-step subcommand, guidance split, bee capture only (secretary
  stays PP+keeper design), link-check, PL-PP-005 + PL-PO-002 defers,
  structure check (pillar-2). P4 note also carries: born-TOON inbox
  absorbing suggestions, `bee task`/`bee verify`/`bee park`/
  `bee design`/`bee capture`, decision-count calibration at close,
  AXI tests in the standard suite, task-orc codification (minimal +
  surgical per retired-PO feedback, keeper-accepted).
- **P8 = rectification + ship-tier cleanup + template glossary** +
  bee-handoff wake-prompt-in-chat fix. Absorbs post-pickup drift;
  verifies what landed, applies the rest idempotently.
- Law window closed (AGENTS gate → bee-plan-review; handoff rule →
  bee pair). PO role file codified; **keeper gates = decisions, not
  artifacts** in both role files + GLOSSARY (two standing
  checkpoints: kickoff card, sign-off inventory; escalate-when/
  never rules; ~8-decision calibration).
- Keeper mid-P7 cards supersede post-pickup PP design where they
  conflict: entry checks DROPPED (fold via bee-skill-write later);
  all skill-review dimension failures block; review findings
  disputable.
- Guides-and-sensors + four-pillars reviews filed (terminology:
  guides/sensors; backpressure is OUR gap — snapshot ratchets the
  building block; work types = guidance bundles over shared
  machinery).

## Threads (recommended order)

1. PL-PP-012 first (wake task, above).
2. P4 kickoff rulings — the keeper answers PO's card; the seven
   items live in the P4 note; the two direct rulings (folder name,
   tier confirmation) can land in the same conversation.
3. PL-PP-004 remainder: StackQL, Arazzo, auto-PR (arch tests +
   contract tests feed the guidance bundles).
4. Parked: PL-PP-009 (secretary — post-P4, substrate = live inbox +
   capture), PL-PP-010 (rubber-duck + do-I-need-the-keeper — the
   escalation rules are its decision table), PL-PP-011
   (mistake-fixing, role-specific), PL-PP-005 + PL-PO-002 (P6),
   PL-002 (memory, P5 gate), PL-PP-001/006/007 (link hygiene
   partial-P4; distillation P8/P6; architecture maps first product
   project).

## Key files

- `.hivemind/sessions/power-planner.md` — decision log 1–133; re-read
  after any context break
- `.hivemind/status.md` — cross-role surface; PO's P7-done + window
  notes carry the close state
- `.hivemind/decisions/` 001–016 · `.hivemind/designs/` (governing
  doc; P4 note + addenda; skill-authoring-kit = COMPLETE P7 design
  input; guides-and-sensors; four-pillars; conference notes) ·
  `.hivemind/phases/BeeHarness.md` (P0–P3, P7 done; P4 in kickoff;
  P5–P8 planned)
- `skills/GLOSSARY.md` · `docs/AXI.md` (law) · `docs/WRITING-STANDARD.md`
  · `roles/` (both codified + task-orc) · `AGENTS.md` · `SOUL.md`
- `.hivemind/keeper-report.md` (zoned; regen protocol in header)

## Environment notes

- Commit discipline: stage owned files BY NAME (never `add -A`; PO
  shares this tree); `Role: power-planner` trailer; push promptly;
  shared surfaces (status.md, keeper-report.md) commit immediately;
  check `git fetch` + `main..origin/main` — `pull --rebase` blocks on
  dirty trees.
- Claim-with-commit: cite hashes when telling the keeper a record
  changed.
- Editing: exact bytes or nothing; `git mv` stages moves itself;
  batch scripts that assert-and-abort leave later files unpatched —
  residual grep before every commit.
- Absolute paths to the keeper in chat (Paseo dot-dir links 404).
