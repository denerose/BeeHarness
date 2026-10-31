---
name: bee-argue
description: For genuine forks — one dispatched worker per option argues that option's best case in parallel; the caller summarizes the cases and puts the choice to the keeper with a recommendation. Use when options are few, genuinely distinct, and worth the dispatch cost. Not for cheap forks or exploration.
---

# bee-argue

Read `../GLOSSARY.md` (the shared bee glossary, sibling of this skill
folder) first if any term below is unclear.

When a real decision has two to four defensible options and the
choice deserves better than one agent's single view, farm the arguing
out: **one dispatched worker per option, each building the strongest
honest case for exactly that option.** The caller summarizes the
cases and puts the choice to the decision-maker with a
recommendation.

## When to use

- A genuine fork: 2–4 options, each defensible, each with real
  trade-offs you can name.
- The stakes justify the cost — the decision shapes a design, an
  ADR, a role, or a phase (examples, not a checklist: the test is a
  decision that outlives the conversation). Dispatching workers
  costs time and tokens.
- You understand each option well enough to brief its case honestly
  — if you can't yet, the fork isn't ready for this skill; keep
  researching.

## When NOT to use

- Cheap forks: if one option is clearly better, just recommend it.
- Exploration: while the conversation is still shaping options,
  arguing them hardens them too early. Keep talking instead.
- Options that aren't really distinct, or more than about four — the
  summary stops being readable.

## How to run it

1. State the question in one plain sentence a reader could understand
   days later, with no other context.
2. Tell the decision-maker the cases are being prepared — dispatches
   run in parallel, so the delay is minutes, but never leave a
   waiting human wondering. Write one brief per option. Every brief
   carries the full shared context — the brief is the worker's whole
   world — plus: argue THIS option's strongest case; name honestly
   what it gives up; each case argues its own option, it never
   attacks the others; return text only, write no files.
3. Dispatch the briefs in parallel, one worker each.
4. Summarize: each case as a compact plain-language digest; flag what
   the cases agree on — agreement across rival cases is usually the
   real finding; then recommend. If a case comes back weak or
   strawmanning, fix its brief and redispatch that one — or write
   that case yourself.
5. The decision-maker decides. Arguing in parallel informs the
   choice; it never makes it.

## Notes

- Worked example, generic: given a fork over where a shared queue
  lives — one file all roles append to, per-role files merged by a
  tool, or only a generated view with no stored file — the caller
  states the question in one sentence, briefs three workers (one per
  option), dispatches in parallel, and summarizes the three cases
  with a recommendation.
- A tool available to any agentic user of the harness, not a rule.
  The common right move is still a plain recommendation from the
  agent closest to the work — but when the decision-maker asks for
  something better than one opinion, that ask settles it: use this.
