# ADR 002: Git identity model — keeper and agent accounts

**Date:** 2026-10-18
**Status:** Accepted

## Context

Work on this machine is committed by agents but owned by the human.
GitHub has two accounts: `denerose` (the human/keeper; token lacks
`workflow` scope; reserved for owner actions) and `denerose-pi` (agent
account; has `repo`, `workflow`, `gist`, `read:org`). The machine's
global git identity was `denerose-bee <109723086+denerose@users.noreply.github.com>`
— an agent-facing name whose noreply email belongs to the **denerose**
account, so every agent commit was attributed to the human.

## Decision

1. **Repos live under `denerose`** — the keeper owns them.
2. **Agent work is committed as `denerose-pi`**
   (`285322498+denerose-pi@users.noreply.github.com`), pushed with
   `denerose-pi` credentials (collaborator). This becomes the
   machine-global git identity.
3. **Human-authored commits carry the keeper's authorship** via explicit
   `git commit --author "denerose <109723086+denerose@users.noreply.github.com>"`
   while the commit/push is still performed by `denerose-pi`. Authorship
   ≠ credentials: agents never hold or use denerose credentials.
4. **Owner-side actions stay with the human**: creating origin repos,
   inviting `denerose-pi` as collaborator, passing the URL in chat;
   agents accept invites, add remotes, push, and work.
5. Future CLI support: a flag (e.g. `bee commit --as keeper`) wraps the
   author-override so the convention survives without memorizing emails.

## Alternatives Considered

### Give the power-planner denerose credentials
**Pros:** agents could create repos/settings directly.
**Cons:** violates keeper sovereignty over owner actions; denerose token
lacks scopes anyway; credential sprawl for marginal convenience.

### Keep denerose-bee attribution as-is
**Pros:** zero change.
**Cons:** attributes agent work to the human — precisely the confusion
the model exists to prevent.

### Separate machine account per project
**Pros:** strong isolation.
**Cons:** collaborator management overhead; YAGNI at this scale.

## Consequences

### Positive
- Commit attribution matches reality; the human's contribution history
  stays honest.
- Credentials stay clean: one agent account, one capability set.
- Bootstrap pattern is human-scalable (create → invite → paste URL).

### Negative
- Repo creation requires a human round-trip.
- Author-override is a convention until the CLI encodes it.

### Neutral
- Pushes go over HTTPS via the gh credential helper (ssh host key for
  github.com is not in known_hosts on this machine).

## Affected Areas

- Machine-global `git config` (user.name/email) → denerose-pi
- This repo's local config — already set (ADR applied ahead of recording)
- Future `bee` CLI — `--as keeper` flag reserved

## Amendment (2026-10-25): per-role attribution

With roles running in parallel, one identity can't say which role did
what. Attribution rides in `Role: <role>` commit trailers and
record/report headers (ADR-007); the identity itself stays single.

## References

- Resolves parking-lot PL-001 (`.hivemind/.hivemind/memory/parking-lot.md`)
- ADR 001 — same phase
