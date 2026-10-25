# Handoff — project-orchestrator

**Updated:** 2026-10-25 13:06
**Previous:** Initial (per-role handoffs began with ADR-007; this
supersedes the shared `.pi/handoff.md` for the build track)

## Working mode — read this before the task state

You are the **project-orchestrator** (FORMING — you are the model this
role gets codified from; `roles/project-orchestrator.md` is your
mandate). Announce the role in your first reply. You run the build
track: bee-plan, bee-loop, subagents, verify/review gates, phase
tracking. Design decisions are NOT yours — escalate conflicts between
reality and design to the keeper (who may route to the power-planner,
running in parallel in another context). Small scribe edits are fine;
substantive decisions come to the keeper.

## Boot sequence (in order)

1. This file
2. `/home/saphron/BeeHarness/.hivemind/status.md` — cross-role surface;
   read every session start (ADR-007 rule 6)
3. `/home/saphron/BeeHarness/.hivemind/sessions/project-orchestrator.md`
   — your session memory; re-read after any compaction; update at each
   decision point (entries 1–31; 20–31 are the live ones)
4. `AGENTS.md`, then `skills/GLOSSARY.md` (relay/handoff/dispatch
   vocabulary) and `skills/bee-loop/SKILL.md`

## Current State

All assigned work complete and pushed (origin = `69e7c0a`).

### Completed This Session (2026-10-20 → 10-25)
- Pilot bee-loop #1 (README roles refresh): full state trail — plan
  (plan-reviewer-gated) → implement → verify PASS → review CLEAN →
  records in `.hivemind/records/` → phase list `.hivemind/phases/BeeHarness.md`
- Skills updated to ADR-007 (`3af310c`) + bee-skill-tester round
  (5 scouts) with findings fixed (`e117b32`)
- PL-PO-001 parked (stale ephemera in durable docs — keeper directed)
- Machine-wide skills registration verified (settings.json; fresh
  `pi --print` sees all seven bee-* skills)
- Commit discipline live since `bc84e41`: selective staging (never
  `add -A`), `pull --rebase` before push, prompt pushes, `Role:`
  trailers on every commit — keep this up
- Paseo dot-dir link quirk noted on status.md — quote ABSOLUTE paths
  to the keeper in chat

### In Progress
- Nothing mid-flight. Waiting on others:
  - Keeper: pilot suggestion verdict (verify expectations as
    minimums) — listed in status.md "Awaiting keeper"
  - Keeper: design-doc ratification (PP's item, same list)
  - PP: two GLOSSARY naming proposals (records `-rN`, plan slugs)
    — mine, in status.md; tester-confirmed, no answer yet

### Not Yet Started
- bee-skill-tester second round on structural fixes (only if keeper
  wants it; fixes were targeted, diff-reviewable)
- Orchestrator role codification from this session's observed
  behavior (happens at session wrap, via hindsight — see below)
- Full bee-hindsight run at wrap point

## Key Decisions (this session's, already recorded — don't re-decide)

- Scribe exception (ADR-003 amendment item 6): read-only by default;
  keeper-consented edits; raise ADR/design-vs-instruction mismatches
- ADR-007 partition/ownership is law; GLOSSARY terms exist — link,
  don't restate
- PL-003 vocabulary: relay (role↔role) / handoff (same-role context
  refresh — what this file is) / dispatch (role→subagent)

## Known Issues

- Paseo renders chat-quoted relative paths as links; dot-directory
  paths 404 — use absolute paths with the keeper
- Legacy shared `.pi/handoff.md` still exists (tracked); superseded by
  per-role files — removal pending keeper's word (not mine to take)
- Paseo UI zombies/stale entries — keeper-side cleanup, outstanding
  since 2026-10-18

## Important Files

- `.hivemind/status.md` — cross-role surface; update on change, [PO] prefix
- `.hivemind/sessions/project-orchestrator.md` — your memory
- `.hivemind/memory/parking-lot.md` — PL-002, PL-004, PL-PO-001 parked;
  PL-001, PL-003 resolved
- `.hivemind/phases/BeeHarness.md` — phase list (P0, P1 done)
- `skills/` — the product; you own implementation, PP owns design

## Environment Notes

- Commit/push identity: `denerose-pi` (machine-global, already
  configured); `pull --rebase` before every push
- `paseo` CLI at `/home/saphron/.local/bin/paseo` (not on bash PATH)
- gh works over https via credential helper; ssh host key for
  github.com absent from known_hosts

## Close-out (ritual split — GLOSSARY: handoff)

Refresh handoff: memory sync only (session file current through
decision 32). No parking-lot sweep — that is a work-close ritual;
threads are open and the board is current on status.md.

## Wake prompt — paste into the new context

```markdown
You are the project-orchestrator for BeeHarness, fresh context, same
role (mandate: roles/project-orchestrator.md — you are the model it
gets codified from; FORMING). Repo: /home/saphron/BeeHarness — pull
--rebase first.

Pick up in order:
1. .pi/handoff-project-orchestrator.md — state of the build track
2. .hivemind/sessions/project-orchestrator.md — your session memory
3. .hivemind/status.md — cross-role surface

Then announce the role and your first move in your first reply — do
not re-interview the keeper. Build-track work continues from the
handoff's "In Progress"; nothing is mid-flight. The files carry the
content; this prompt is the pointer.
```
