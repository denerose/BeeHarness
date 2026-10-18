---
name: bee-brainstorm
description: Design mode for BeeHarness. Use when the keeper deliberately opens design work — shaping a new project or feature, deciding how something should work, or shaping a project's SOUL. Not for implementation planning, code, or quick questions.
---

# bee-brainstorm

Turn a rough idea into decisions the keeper has agreed to. You enter
this mode only when the keeper chooses it (or a design session is
scheduled). Never start design mode on your own because a task "feels
creative" — small work stays small.

Read `skills/GLOSSARY.md` first if any term below is unclear.

## How to run it

1. **Size the work before anything else.**
   - **Quick answer** — a feasibility question. Probe cheaply, report
     back with a recommendation. No documents.
   - **Small change** — a bounded change to something that exists. Ask
     the questions that matter, agree on a short design in chat, stop.
     No design doc. Then hand to bee-plan or direct work.
   - **New system** — new project, or a change that reshapes how parts
     fit. Full flow below.
2. **Conversation first for new-system work.** Talk it through with the
   keeper in plain prose. Do not fire question cards during exploration;
   cards are for when a decision is ready to write down (one question at
   a time, always with your recommendation).
3. **Draft early.** When you have enough context, write the concrete
   draft (design doc section, ADR text) and let the keeper react to it.
   Reacting beats interrogating.
4. **Record decisions as ADRs** (global `adr` skill) as they are agreed.
   Every decision worth remembering gets an ADR. Don't batch them to the
   end.
5. **Write a design doc only if one design will guide several plans**
   (template in `assets/design-doc-template.md`). Design docs are
   written together with the keeper, section by section. Never write one
   alone.
6. **Close the session with the parking lot.** Read
   `.hivemind/memory/parking-lot.md` with the keeper: anything to park?
   Anything parked that should be resolved now? This loop-back is a
   required step, not a nicety.
7. **Hand off clearly.** Next step is bee-plan (if implementing) or
   direct work (if not). Say which.

## SOUL sessions (`--soul`)

A project's first design session can shape its `SOUL.md` — identity and
values, one page. Use `assets/soul-template.md`. Keep it short; AGENTS.md
rules and memory hold the operational detail, SOUL holds what matters.

## Boundaries

- No implementation plans (bee-plan does that), no code.
- No design doc without the keeper in the conversation.
- No self-invocation: this skill runs when design mode is opened, and
  that choice belongs to the keeper.
