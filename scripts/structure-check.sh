#!/usr/bin/env bash
# structure-check.sh — allowed-structure check (manifest map).
# Usage:
#   structure-check.sh <root>
# Walks tracked files (git ls-files) under <root>, matches each
# against <root>/scripts/structure.map; every miss is a finding
# with a fix line; map lines that do not parse are findings too.
# Output: TOON "path · allowed-homes · fix" lines under a
# "<n> findings" header; definitive "0 findings" when clean.
# Exit 0 clean, 1 findings, 2 usage (bad root / no git repo /
# no map).
#
# Map shape: one '<class>: <pattern> <pattern>…' per line
# (patterns space-separated); '<x>' is a one-segment wildcard
# that never crosses '/'; '#' after whitespace starts a comment.
# Structure is living: a miss is never ignored or suppressed —
# place the file in an allowed home, or extend the map
# deliberately (the map edit IS the recorded decision).
set -u
export LC_ALL=C

PROG=$(basename "$0")

usage() { echo "usage: $PROG <root>" >&2; exit 2; }

[[ $# -eq 1 ]] || usage
ROOT=$1
[[ -d $ROOT ]] || { echo "$PROG: no such directory: $ROOT" >&2; exit 2; }
ROOT=$(cd "$ROOT" && pwd)
git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1 || {
  echo "$PROG: not a git repository: $ROOT" >&2
  echo "fix: run against a git repo root (tracked files come from git ls-files)" >&2
  exit 2
}
MAP=$ROOT/scripts/structure.map
[[ -f $MAP ]] || {
  echo "$PROG: no structure map at $ROOT/scripts/structure.map" >&2
  echo "fix: add one to adopt the structure check (shape: '<class>: <pattern>…' per line)" >&2
  exit 2
}

FINDINGS=()
declare -A CLASS_PATS=() # label -> space-joined patterns
LABELS=()                # labels in first-seen order, unique
CLASSES=()               # per-pattern label (parallel to RES)
RES=()                   # per-pattern ERE body

# pat_to_re <pattern> — ERE body in $RE. ERE specials are escaped
# as one-member bracket expressions (portable everywhere); every
# '<word>' placeholder becomes [^/]+ — one segment, never '/'.
pat_to_re() {
  local pat="$1" out='' i=0 c rest
  local ph_re='^[<][a-z][a-z0-9-]*[>]'
  while (( i < ${#pat} )); do
    c=${pat:i:1}
    case $c in
      '<')
        rest=${pat:i}
        if [[ $rest =~ $ph_re ]]; then
          out+='[^/]+'
          (( i += ${#BASH_REMATCH[0]} ))
        else
          out+='[<]'
          (( i += 1 ))
        fi
        continue
        ;;
      '[') out+='[[]' ;;
      ']') out+='[]]' ;;
      '^') out+='[\^]' ;;
      '\') out+='[\\]' ;;
      '.' | '*' | '+' | '?' | '(' | ')' | '{' | '}' | '|' | '$')
        out+="[${c}]" ;;
      *) out+="$c" ;;
    esac
    (( i += 1 ))
  done
  RE=$out
}

# ---- parse the map; unparseable lines are findings ----

lineno=0
while IFS= read -r line || [[ -n $line ]]; do
  (( lineno += 1 ))
  [[ $line == \#* ]] && continue                 # full-line comment
  case $line in
    *' #'*) line=${line%%' #'*} ;;              # trailing comment
  esac
  [[ -z ${line//[[:space:]]/} ]] && continue     # blank
  mlabel=${line%%:*}
  mrest=${line#*:}
  if [[ $line != *:* || ! $mlabel =~ ^[a-z][a-z0-9-]*$ ]]; then
    FINDINGS+=("scripts/structure.map:$lineno · - · fix: line does not parse — shape: '<class>: <pattern> <pattern>…'")
    continue
  fi
  # trim surrounding whitespace off the pattern list
  mrest=${mrest#"${mrest%%[![:space:]]*}"}
  mrest=${mrest%"${mrest##*[![:space:]]}"}
  if [[ -z $mrest ]]; then
    FINDINGS+=("scripts/structure.map:$lineno · - · fix: class '$mlabel' lists no patterns — add patterns or drop the line")
    continue
  fi
  if [[ -z ${CLASS_PATS[$mlabel]+set} ]]; then
    LABELS+=("$mlabel")
    CLASS_PATS[$mlabel]=''
  fi
  read -ra pats <<< "$mrest"
  for pat in "${pats[@]}"; do
    pat_to_re "$pat"
    CLASSES+=("$mlabel")
    RES+=("$RE")
    CLASS_PATS[$mlabel]+=" $pat"
  done
done < "$MAP"

# ---- match tracked files; misses are findings with fixes ----

# join_comma <items…> — comma+space join into $JOINED (portable;
# "${arr[*]}" inside quotes joins with IFS's first char only).
join_comma() {
  JOINED=''
  local e first=1
  for e in "$@"; do
    if (( first )); then JOINED="$e"; first=0; else JOINED+=", $e"; fi
  done
}

# miss_line <path> — the finding line for an unmatched path.
# allowed-homes: classes with tree patterns (patterns containing
# '/') rooted at the path's first segment; no-slash patterns name
# whole root entries, not homes. With no home class the fix lists
# every class the map defines.
miss_line() {
  local p="$1" seg homes=() pats='' L cpat joined
  seg=${p%%/*}
  for L in "${LABELS[@]}"; do
    for cpat in ${CLASS_PATS[$L]}; do
      if [[ $cpat == */* && ${cpat%%/*} == "$seg" ]]; then
        homes+=("$L")
        break
      fi
    done
  done
    joined=''
    if (( ${#homes[@]} > 0 )); then
      for L in "${homes[@]}"; do
        for cpat in ${CLASS_PATS[$L]}; do
          pats+="${pats:+, }$cpat"
        done
      done
      join_comma "${homes[@]}"
      joined=$JOINED
      printf '%s · %s · fix: place it in %s under an allowed pattern (%s), or extend scripts/structure.map deliberately\n' \
        "$p" "$joined" "$joined" "$pats"
    else
      join_comma "${LABELS[@]}"
      printf '%s · - · fix: place it in an allowed class (%s), or extend scripts/structure.map deliberately\n' \
        "$p" "$JOINED"
    fi
}

while IFS= read -r p; do
  [[ -z $p ]] && continue
  matched=0
  anchored=''
  for idx in "${!RES[@]}"; do
    anchored="^${RES[idx]}$"
    if [[ $p =~ $anchored ]]; then
      matched=1
      break
    fi
  done
  (( matched )) || FINDINGS+=("$(miss_line "$p")")
done < <(git -C "$ROOT" ls-files)

n=${#FINDINGS[@]}
if (( n == 0 )); then
  echo "0 findings"
  exit 0
fi
echo "${n} findings"
printf '%s\n' "${FINDINGS[@]}"
exit 1
