# Phases — <project>

One line per phase. This is the loop's only tracking file: update the
status, link the plan AND the design docs each phase consumes, never
grow tasks here (tasks live in plans). The phase list is the source
of truth for what feeds each phase — status notes are transient.

Statuses: planned · in-progress · blocked · escalated · done

| id | description | status | designs | plan | owner | escalations |
|---|---|---|---|---|---|---|
| P1 | <one line: what this phase delivers> | planned | <design docs this phase consumes> | <plan path, once written> | <role + timestamp, on claim> | — |

<!-- Column notes: designs = the design docs (and consolidated input
     notes) the phase builds from — linked at kickoff, not in status
     notes. owner = the claim (role + timestamp), written before
     dispatching, re-read before writing. escalations = rulings and
     open decisions bound to the phase. -->
