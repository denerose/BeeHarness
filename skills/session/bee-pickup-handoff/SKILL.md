---
kit: session
name: bee-pickup-handoff
description: Resumes a role from its handoff file — reads it whole, follows its boot sequence, re-reads law files changed since it was written, verifies state against the repo, and announces the resumed role and first move in the first reply. Use when waking into a role whose predecessor left a handoff (the keeper's wake prompt points here). Writing one is bee-handoff's; the pickup never re-interviews the keeper.
---

# bee-pickup-handoff

Wake into a role from its handoff: same role, fresh context — you
are the successor the handoff was written for. Read
`../../GLOSSARY.md` (the shared bee glossary, sibling of this kit
folder) first — especially its handoff entry.

## Bring the repo current first

`git pull --rebase` before reading anything: law and state move
while a context is cold. If the tree is dirty or the rebase
refuses, never force it and never stash, restore, or discard work
you did not make — carry on to the handoff (it may name what you
are seeing) and surface the finding in your first reply. Work
left in flight is pickup context; what to do with it, if the
handoff does not say, is a new decision for the keeper.

## Read the handoff whole

The handoff file is `<repo-root>/.pi/handoff-<role>.md` (find the
repo root with `git rev-parse --show-toplevel`). Read it all —
skimming a handoff re-creates the context loss it exists to
prevent. Then follow its boot sequence exactly: it names the
memory and status surfaces and law files to read, in order. A
handoff that names no boot sequence gets the default: this
handoff, then the role's rules files, then the memory and status
surfaces they name. The working-mode section binds immediately —
its style rules apply to you now, not your defaults, and a
conversation resumed mid-thread continues in that thread's style,
not as a formal restart.

## Re-read the law that changed

Law may have moved since the handoff was written — law here means
the repo's standing rules: the root rules file, the role files,
the glossary. Get the handoff's own date with
`git log -1 --format=%cd -- <repo-root>/.pi/handoff-<role>.md`,
then check those files for changes since with
`git log --since=<date> -- <path>`, and re-read whatever moved. A
handoff file with no commit history means the date is unknown —
treat every law file as changed and re-read them all. The handoff
describes the work; the law describes how work is done. When they
disagree, the law wins and the drift gets named in your first
reply.

## Verify against the repo

Trust the handoff; verify the world. `git status` and
`git log --oneline` for what actually changed, then spot-check the
handoff's claims against the files it names. Drift is expected —
work continued after the handoff was written, parallel roles
landed things — so adjust rather than re-litigate: a next step
already done is skipped, not questioned. A discrepancy that
breaks the handoff's premise — its next work already landed
differently, its goal overtaken — is a stop-and-ask, not an
adjustment. Name both kinds in your first reply.

## First reply, then work

The first reply announces: the resumed role and working mode, your
first move (from the handoff's next work, adjusted for verified
drift), and any drift or dirty-tree finding. Then make the move.
Do not re-interview the keeper for context the handoff already
carries — questions are for new decisions.

## Judgment kept

The commands are named inline (pull --rebase, git log, git
status); the judgment this skill keeps: what counts as drift worth
naming, what verified state means for the first move, and where a
discrepancy is a stop-and-ask rather than an adjustment.

## Boundaries

- Same role only. Waking into a different role is a keeper
  direction, not a pickup; cross-role context moves by relay
  (GLOSSARY: relay).
- No re-interview — the handoff carries the context; the keeper
  answers new decisions, not re-derivations.
- Verify before acting: never start implementation off the
  handoff alone.
- The writing half of the pair is bee-handoff's, sibling in this
  folder.
