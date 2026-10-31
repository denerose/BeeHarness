#!/usr/bin/env bash
# task.sh — task-tier worktree helper (ADR-012: task branch mechanics).
#
#   task.sh create <phase>-<slug>   task branch + worktree off current phase branch
#   task.sh merge <slug>            merge task branch into current phase branch, clean up
#   task.sh abandon <slug>          remove task worktree + branch (merged only)
#
# Repo context resolves from the CURRENT DIRECTORY, never from this
# script's location. Git ops run in cwd. Bash + git only.

set -u

PROG=task.sh
RESOLVED=
REPO_ROOT=
PHASE_BRANCH=

usage() { # usage [exit-code]
  cat >&2 <<EOF
usage: $PROG create <phase>-<slug>
       $PROG merge <slug>
       $PROG abandon <slug>

  create <phase>-<slug>  branch task/<phase>-<slug> + worktree
                         <root-parent>/\$(basename <root>)-task-<slug> at HEAD
  merge <slug>           resolve unique task/*-<slug>, merge into current
                         phase/<n>; remove worktree first, delete branch second
  abandon <slug>         resolve unique task/*-<slug>; remove worktree, then
                         delete branch (git branch -d — merged only)
EOF
  exit "${1:-1}"
}

die() { # die <message> [exit-code]
  echo "$PROG: $1" >&2
  exit "${2:-1}"
}

# Repo root from cwd: dirname of the absolute git-common-dir — stable
# across main checkout, phase worktree, and test sandboxes. Result in
# REPO_ROOT (this function may die; never call it inside $( )).
repo_root() {
  local cdir
  if ! cdir=$(git rev-parse --path-format=absolute --git-common-dir 2>/dev/null); then
    die "not a git repository (or any parent): $(pwd)" 1
  fi
  REPO_ROOT=$(dirname "$cdir")
}

# A slug may not contain '/' or ref-invalid characters (usage, exit 1).
# Validation is delegated to git itself via check-ref-format.
check_slug() { # check_slug <arg>
  local arg="$1"
  if [[ "$arg" == */* ]]; then
    echo "$PROG: '$arg': '/' not allowed in a slug" >&2
    usage 1
  fi
  if ! git check-ref-format --branch "task/x-$arg" >/dev/null 2>&1; then
    echo "$PROG: '$arg': ref-invalid characters" >&2
    usage 1
  fi
}

# Exit 2 unless the current checkout is on a phase/<n> branch; on
# success the branch name lands in PHASE_BRANCH (this function may
# die; never call it inside $( )).
require_phase_branch() {
  local cur pat='^phase/[0-9]+$'
  cur=$(git branch --show-current)
  if [[ ! "$cur" =~ $pat ]]; then
    die "not on a phase branch (current: ${cur:-detached HEAD})" 2
  fi
  PHASE_BRANCH=$cur
}

# Resolve <slug> to the unique branch matching task/*-<slug>; sets
# RESOLVED. 0 or 2+ matches: exit 4 (candidates listed when 2+).
resolve() { # resolve <slug>
  local slug="$1" b matches=()
  while IFS= read -r b; do
    [[ "$b" == task/*-"$slug" ]] && matches+=("$b")
  done < <(git for-each-ref --format='%(refname:short)' refs/heads/task/)
  case ${#matches[@]} in
    1) RESOLVED=${matches[0]} ;;
    0) die "no branch matches task/*-$slug" 4 ;;
    *)
      echo "$PROG: ambiguous slug '$slug' — matches:" >&2
      printf '  %s\n' "${matches[@]}" >&2
      exit 4
      ;;
  esac
}

# Echo the path of the worktree that has <branch> checked out (empty
# if none) — robust to worktrees created by any means.
worktree_of() { # worktree_of <branch>
  local branch="$1" line wt=''
  while IFS= read -r line; do
    case "$line" in
      "worktree "*) wt=${line#worktree } ;;
      "branch refs/heads/$branch") printf '%s\n' "$wt" ;;
    esac
  done < <(git worktree list --porcelain)
}

cmd_create() { # cmd_create <phase>-<slug>
  local arg="$1"
  check_slug "$arg"
  if [[ "$arg" != *-* ]]; then
    echo "$PROG: create takes <phase>-<slug> (phase separator '-'" \
      "missing)" >&2
    usage 1
  fi
  local cur
  require_phase_branch
  cur=$PHASE_BRANCH
  local root parent base branch wt
  repo_root
  root=$REPO_ROOT
  parent=$(dirname "$root")
  base=$(basename "$root")
  branch="task/$arg"
  wt="$parent/${base}-task-${arg#*-}"
  if git show-ref --verify --quiet "refs/heads/$branch"; then
    die "branch $branch already exists" 3
  fi
  if [[ -e "$wt" ]]; then
    die "worktree path already exists: $wt" 3
  fi
  # One step: branch + worktree. Git's chatter goes to stderr so
  # stdout carries only the worktree path.
  git worktree add -b "$branch" "$wt" 1>&2 || exit $?
  printf '%s\n' "$wt"
}

cmd_merge() { # cmd_merge <slug>
  local slug="$1"
  check_slug "$slug"
  resolve "$slug"
  local branch="$RESOLVED"
  local cur
  require_phase_branch
  cur=$PHASE_BRANCH
  git merge "$branch" 1>&2 || exit $?
  local wt
  wt=$(worktree_of "$branch")
  if [[ -n "$wt" ]]; then
    # Worktree first (a branch checked out in a worktree cannot be
    # deleted first); dirty worktrees fail here with git's message.
    git worktree remove "$wt" 1>&2 || exit $?
  else
    echo "$PROG: no worktree registered for $branch (nothing to remove)" >&2
  fi
  if ! git branch -d "$branch" 1>&2; then
    [[ -n "$wt" ]] \
      && echo "$PROG: worktree $wt removed but branch $branch remains" >&2
    exit $?
  fi
  echo "merged $branch into $cur"
  [[ -n "$wt" ]] && echo "removed worktree $wt"
  echo "deleted branch $branch"
}

cmd_abandon() { # cmd_abandon <slug>
  local slug="$1"
  check_slug "$slug"
  resolve "$slug"
  local branch="$RESOLVED"
  # No phase-branch requirement: abandon operates on named refs from
  # any checkout (task reset is PO's call anywhere, ADR-012).
  local wt
  wt=$(worktree_of "$branch")
  if [[ -n "$wt" ]]; then
    git worktree remove "$wt" 1>&2 || exit $?
  else
    echo "$PROG: no worktree registered for $branch (nothing to remove)" >&2
  fi
  if ! git branch -d "$branch" 1>&2; then
    [[ -n "$wt" ]] \
      && echo "$PROG: worktree $wt removed but branch $branch still present" >&2
    echo "$PROG: branch $branch is not fully merged; run" \
      "'git branch -D $branch' if that is really intended" >&2
    exit 5
  fi
  [[ -n "$wt" ]] && echo "removed worktree $wt"
  echo "deleted branch $branch"
}

main() {
  local cmd="${1:-}"
  if [[ $# -lt 1 ]]; then
    usage 1
  fi
  case "$cmd" in
    create | merge | abandon)
      if [[ $# -ne 2 ]]; then
        echo "$PROG: $cmd takes exactly one argument" >&2
        usage 1
      fi
      ;;
    *)
      echo "$PROG: unknown subcommand: $cmd" >&2
      usage 1
      ;;
  esac
  "cmd_$cmd" "$2"
}

main "$@"
