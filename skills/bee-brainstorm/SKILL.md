---
name: bee-brainstorm
description: Design mode for BeeHarness. Use when the keeper deliberately opens design work — shaping a new project or feature, deciding how something should work, or shaping a project's SOUL. Not for implementation planning, code, or quick questions.
---

# bee-brainstorm

Turn a rough idea into decisions the keeper has agreed to. You enter
this mode only when the keeper chooses it (or a design session is
scheduled). Never start design mode on your own because a task "feels
creative" — small work stays small.

Read `../GLOSSARY.md` (the shared bee glossary, sibling of this skill folder) first if any term below is unclear.

## How to run it

1. **Size the work before anything else.** Your read of the size is a
   guess you correct, not a commitment — if the conversation reveals
   the work is smaller or bigger, say so and adjust.
   - **Quick answer** — a feasibility question. Probe the codebase or
     the keeper's intent cheaply, report back with a recommendation.
     No documents.
   - **Small change** — touches one area with a clear seam; no new
     concept. Ask the questions that matter, agree on a short design
     in chat, stop. No design doc. Then hand off (below).
   - **New system** — new project, or work that introduces a concept
     the project doesn't have yet, or changes that ripple through
     several areas. Full flow below.
   Unsure between two sizes? Say your read and let the keeper correct
   it — that's one sentence, not a gate.
2. **Conversation first for new-system work.** Talk it through with the
   keeper in plain prose. Do not fire question cards during exploration;
   cards are for when a decision is ready to write down (one question at
   a time, always with your recommendation).
3. **Draft early.** When you have enough context, write the concrete
   draft (design doc section, ADR text) and let the keeper react to it.
   Reacting beats interrogating. Drafting sections to react to is
   always fine; what you may not do is finalize a design doc without
   the keeper approving each section.
4. **Record decisions as ADRs** (global `adr` skill) as they are agreed.
   Every decision worth remembering gets an ADR. Don't batch them to the
   end.
5. **Write a design doc only if one design will guide several plans**
   (template in `assets/design-doc-template.md`). Design docs are
   written together with the keeper, section by section. Never write one
   alone.
6. **Close the session with the parking lot.** Read
   `.hivemind/memory/parking-lot.md` with the keeper. You propose
   additions and resolutions; the keeper decides. This loop-back is a
   required step, even when nothing was parked.
7. **Hand off clearly.** Say which: bee-plan when the loop will
   implement (several tasks, or subagents involved — bee-plan runs in
   the project-orchestrator's session); direct work when it's a change
   you'll just make now; nothing when it was a quick answer.

## SOUL sessions (`--soul`)

A project's first design session can shape its `SOUL.md` — identity and
values, one page. Use `assets/soul-template.md`. Keep it short; AGENTS.md
rules and memory hold the operational detail, SOUL holds what matters.

## Boundaries

- No implementation plans (bee-plan does that), no code.
- No design doc without the keeper in the conversation.
- No self-invocation: this skill runs when design mode is opened, and
  that choice belongs to the keeper.
