**Date:** 2026-10-25
**Project:** BeeHarness
**Role:** planner (session hindsight)
**Scope:** harness
**What happened:** The parallelism flaw (ADR-007's subject) wasn't caught when the single-writer assumption was baked in — it surfaced only when the keeper noticed friction and ordered a review, by which time a real collision (duplicate PL-003) had already happened. The cold-subagent review itself worked excellently: it found live evidence (unpushed commits racing, session-file corruption, my own bugs) that both roles had normalized.
**Suggestion:** add to the power-planner mandate (and bee-brainstorm's close): any change to the *working model* — new role, parallelism, layout change — triggers an assumptions sweep before the thread closes: "what did the previous model assume, and which documents still assume it?" Cheap version: one cold subagent review over the changed docs. The concurrency review is the template; the keeper shouldn't have to be the collision detector.
