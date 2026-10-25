# Plan: bee CLI stub — `bee report` + `bee init`

**Date:** 2026-10-25
**Design doc:** `.hivemind/designs/beeharness-design.md` (ratified) +
ADR-008 (Accepted, report spec) + ADR-005 amendment (init registration
contract) + ADR-007 amendment 1 (shared surfaces). Keeper direction:
P2 = the stub; NOT in P2: memory tooling, decisions inbox beyond
report generation, orchestration deepening, full project scaffolding
(ADR-005 amendment point 4), README/AGENTS.md edits (keeper sign-off
required — excluded).
**Validation level:** task — stub scope, deterministic CLI; each task
runs its own checks; `node --test tests/*.test.mjs` is the whole
suite (first code in the repo; it becomes the standard suite).
**Detail:** full — verbatim file contents; implementers work cold.
**Reviewed:** plan-reviewer passed 2026-10-25 — independent review
(built the plan's code in a sandbox, ran the suite) found 2 🔴 + 4 🟡;
all fixed in-plan, revised code re-extracted from the plan and
re-run: 16/16 tests green, live-file simulation clean (no wrapped-line
residue, idempotent zones).

## Implementation structure (PO lane, not design)

- Node.js ≥ 20, **stdlib only, zero dependencies** (no node_modules,
  no lockfile). Rationale: pi itself is Node; the repo becomes a pi
  plugin; zero deps keeps the stub auditable.
- Entry `bin/bee.js`, declared in `package.json` `bin` → `bee`
  (activated via `npm link` when wanted; not part of any task).
- Subcommands: `report`, `init`, `help`, `version`. Flags:
  `--check` (no-write mode for both), `--settings <path>` (init),
  `--status <path>` / `--report <path>` (report) — the path flags
  exist for testability; defaults are the live files.
- Every write is atomic (tmp file + rename). Every command that can
  write has a `--check` mode that writes nothing.
- Internal functions are exported; `run(argv)` returns
  `{code, out, err}` and never calls `process.exit` — tests import it;
  the CLI wrapper prints and sets `exitCode`.

## Task 1: package scaffold + CLI skeleton

**Files:** create `package.json`, `bin/bee.js`, `tests/bee.test.mjs`
(skeleton test only)
**Depends on:** nothing
**Provides:** `bin/bee.js` exporting `run(argv)`; `package.json` with
`scripts.test` = `node --test tests/*.test.mjs`; `VERSION` export

- [ ] Create `package.json` with exactly:

```json
{
  "name": "beeharness",
  "version": "0.1.0",
  "description": "BeeHarness — personal agent harness (pi plugin + bee CLI)",
  "type": "module",
  "private": true,
  "bin": { "bee": "./bin/bee.js" },
  "engines": { "node": ">=20" },
  "scripts": { "test": "node --test tests/*.test.mjs" }
}
```

  Note: node ≥ 23 treats `--test` positional arguments as file/glob
  paths — directories are NOT scanned (`node --test tests/` errors
  "Cannot find module" on node v24; verified on this machine). The
  shell-expanded glob works on node 20–24.

- [ ] Create `bin/bee.js` with exactly:"test": "node --test tests/" }
}
```

- [ ] Create `bin/bee.js` with exactly:

```js
#!/usr/bin/env node
// bee — BeeHarness CLI stub (P2). `bee report` + `bee init`.
// Specs: ADR-008 (keeper report zones/protocol), ADR-005 amendment
// (plugin registration). Node >=20, stdlib only.

import { parseArgs } from 'node:util';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const VERSION = '0.1.0';
const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)), '..');

function atomicWrite(file, data) {
  const tmp = file + '.tmp-' + process.pid;
  fs.writeFileSync(tmp, data);
  fs.renameSync(tmp, file);
}

const USAGE = `bee ${VERSION} — BeeHarness CLI stub

usage:
  bee report [--check] [--status <path>] [--report <path>]
  bee init   [--check] [--settings <path>]
  bee help | version

  --check   never write; report what would happen
`;

export function run(argv) {
  const [cmd, ...rest] = argv;
  if (cmd === undefined || cmd === 'help') {
    return { code: 0, out: USAGE, err: '' };
  }
  if (cmd === 'version' || cmd === '--version') {
    return { code: 0, out: VERSION + '\n', err: '' };
  }
  if (cmd === 'init') {
    return cmdInit(rest);
  }
  if (cmd === 'report') {
    return cmdReport(rest);
  }
  return { code: 1, out: '', err: `bee: unknown command '${cmd}'\n\n` + USAGE };
}

function flags(rest, spec) {
  try {
    return parseArgs({ args: rest, options: spec, strict: true });
  } catch (e) {
    return { error: e };
  }
}

function cmdInit(rest) { // Task 2 implements this
  return { code: 0, out: 'bee init: not implemented yet\n', err: '' };
}

function cmdReport(rest) { // Task 3 implements this
  return { code: 0, out: 'bee report: not implemented yet\n', err: '' };
}

if (process.argv[1] &&
    import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = run(process.argv.slice(2));
  if (r.out) process.stdout.write(r.out);
  if (r.err) process.stderr.write(r.err);
  process.exitCode = r.code;
}
```

- [ ] Create `tests/bee.test.mjs` with exactly:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { run, VERSION } from '../bin/bee.js';

test('help exits 0 with usage', () => {
  const r = run(['help']);
  assert.equal(r.code, 0);
  assert.match(r.out, /usage:/);
});

test('no args = help', () => {
  assert.equal(run([]).code, 0);
});

test('unknown command exits 1', () => {
  const r = run(['bogus']);
  assert.equal(r.code, 1);
  assert.match(r.err, /unknown command/);
});

test('version prints VERSION', () => {
  assert.match(run(['version']).out, new RegExp(VERSION));
});
```

- [ ] Run `npm test` — expected: 4 tests pass, 0 fail.
- [ ] Run `node bin/bee.js help` — expected: usage text, exit 0.
- [ ] Run `chmod +x bin/bee.js`.
- [ ] Commit (stage only `package.json`, `bin/bee.js`,
  `tests/bee.test.mjs`): message `scaffold bee CLI package and
  command skeleton`, trailer `Role: project-orchestrator`.

## Task 2: `bee init` — validate/emit plugin registration

**Files:** modify `bin/bee.js` (replace `cmdInit`); modify
`tests/bee.test.mjs` (append tests)
**Depends on:** Task 1
**Provides:** `cmdInit(rest)` behavior per ADR-005 amendment point 1;
helpers `expandTilde`, `tildeForm` (used by Task 3 for nothing —
report does not need them; keep them init-local)

Contract (ADR-005 amendment): the repo's `skills/` directory is the
single skills source of truth, registered machine-wide in
`~/.pi/agent/settings.json` under `"skills"` (array). Validate: is
this repo's skills dir registered (tilde-form or absolute — compare
resolved paths)? Emit: append the entry if missing. Never remove or
reorder existing entries; never touch any other settings key.

- [ ] Replace the `cmdInit` stub in `bin/bee.js` with exactly:

```js
function expandTilde(p) {
  return p.startsWith('~/') || p === '~'
    ? path.join(os.homedir(), p.slice(1))
    : p;
}

function tildeForm(p) {
  const h = os.homedir();
  return p === h || p.startsWith(h + path.sep)
    ? '~' + p.slice(h.length)
    : p;
}

function cmdInit(rest) {
  const f = flags(rest, {
    check: { type: 'boolean' },
    settings: { type: 'string' },
  });
  if (f.error) {
    return { code: 1, out: '', err: String(f.error) + '\n' };
  }
  const settingsPath = f.values.settings
    ? path.resolve(f.values.settings)
    : path.join(os.homedir(), '.pi', 'agent', 'settings.json');
  const skillsDir = path.join(REPO_ROOT, 'skills');

  let settings;
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') {
      settings = {};
    } else {
      return {
        code: 1, out: '',
        err: `bee init: cannot parse ${settingsPath}: ${e.message}\n`,
      };
    }
  }
  if (typeof settings !== 'object' || settings === null ||
      Array.isArray(settings)) {
    return { code: 1, out: '',
      err: `bee init: ${settingsPath} is not a settings object\n` };
  }
  if (settings.skills !== undefined && !Array.isArray(settings.skills)) {
    return { code: 1, out: '',
      err: `bee init: 'skills' in ${settingsPath} is not an array\n` };
  }

  const entries = settings.skills ?? [];
  const target = path.resolve(skillsDir);
  const hit = entries.find(
    (e) => typeof e === 'string' &&
      path.resolve(expandTilde(e)) === target);

  if (hit !== undefined) {
    return {
      code: 0,
      out: `bee init: already registered: ${hit} (${settingsPath})\n`,
      err: '',
    };
  }
  if (f.values.check) {
    return {
      code: 1,
      out: '',
      err: `bee init: NOT registered (${tildeForm(skillsDir)}) ` +
           `— run without --check to add it (${settingsPath})\n`,
    };
  }

  settings.skills = [...entries, tildeForm(skillsDir)];
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  atomicWrite(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  return {
    code: 0,
    out: `bee init: registered ${tildeForm(skillsDir)} in ` +
         `${settingsPath}\n`,
    err: '',
  };
}
```

- [ ] Append to `tests/bee.test.mjs` exactly:

```js
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'bee-init-'));
}

test('init: adds skills entry, preserves other keys', () => {
  const dir = tmp();
  const sp = path.join(dir, 'settings.json');
  fs.writeFileSync(sp, JSON.stringify({
    theme: 'dark',
    skills: ['~/other/skills'],
  }, null, 2));
  const r = run(['init', '--settings', sp]);
  assert.equal(r.code, 0);
  const after = JSON.parse(fs.readFileSync(sp, 'utf8'));
  assert.equal(after.theme, 'dark');
  assert.deepEqual(after.skills,
    ['~/other/skills', '~/BeeHarness/skills']);
});

test('init: --check on unregistered exits 1, writes nothing', () => {
  const dir = tmp();
  const sp = path.join(dir, 'settings.json');
  fs.writeFileSync(sp, JSON.stringify({ skills: [] }, null, 2));
  const before = fs.readFileSync(sp, 'utf8');
  const r = run(['init', '--check', '--settings', sp]);
  assert.equal(r.code, 1);
  assert.match(r.err, /NOT registered/);
  assert.equal(fs.readFileSync(sp, 'utf8'), before);
});

test('init: already registered exits 0 (tilde entry)', () => {
  const dir = tmp();
  const sp = path.join(dir, 'settings.json');
  fs.writeFileSync(sp, JSON.stringify({
    skills: ['~/BeeHarness/skills'],
  }, null, 2));
  const r = run(['init', '--settings', sp]);
  assert.equal(r.code, 0);
  assert.match(r.out, /already registered/);
});

test('init: malformed settings exits 1, writes nothing', () => {
  const dir = tmp();
  const sp = path.join(dir, 'settings.json');
  fs.writeFileSync(sp, '{broken');
  const r = run(['init', '--settings', sp]);
  assert.equal(r.code, 1);
  assert.match(r.err, /cannot parse/);
});

test('init: missing settings file is created fresh', () => {
  const dir = tmp();
  const sp = path.join(dir, 'nested', 'settings.json');
  const r = run(['init', '--settings', sp]);
  assert.equal(r.code, 0);
  const after = JSON.parse(fs.readFileSync(sp, 'utf8'));
  assert.deepEqual(after.skills, ['~/BeeHarness/skills']);
});
```

  Note: the tilde-form assertion assumes the repo sits at
  `~/BeeHarness` — true on this machine and CI-less by design; if the
  checkout moves, the test compares against `tildeForm` logic and only
  that one literal changes.

- [ ] Run `npm test` — expected: 9 tests pass, 0 fail.
- [ ] Run `node bin/bee.js init --check` against the real settings —
  expected: `already registered: ~/BeeHarness/skills`, exit 0 (this
  repo's live registration).
- [ ] Commit (stage only `bin/bee.js`, `tests/bee.test.mjs`):
  message `implement bee init registration validate/emit`, trailer
  `Role: project-orchestrator`.

## Task 3: `bee report` — zoned regeneration with merge

**Files:** modify `bin/bee.js` (replace `cmdReport`, add helpers);
modify `tests/bee.test.mjs` (append); create
`tests/fixtures/status.md`, `tests/fixtures/report.md`
**Depends on:** Task 1 (atomicWrite, flags, REPO_ROOT)
**Provides:** `cmdReport(rest)` per ADR-008 + the report header
protocol

Contract (ADR-008 Accepted + the report file's own header):
- The report has four zones, exact headings: `## Keeper's list`,
  `## Needs the keeper`, `## Changed since last report`,
  `## Worth a sample`.
- *Keeper's list* is keeper-owned: copied **verbatim** — the tool
  never adds, removes, or rewrites anything in it.
- *Needs the keeper* regenerates from status.md's
  `## Awaiting keeper` queue: each queue bullet becomes a numbered
  ask (prefix `[PP]`/`[PO]` kept; repo-relative paths rewritten
  absolute). MERGE: existing zone items not derivable from status are
  kept (never silently dropped — they are the other role's asks);
  near-duplicates (same text after stripping numbering/emphasis, or
  one containing the other) collapse onto the derived wording.
- *Changed since last report* and *Worth a sample*: copied verbatim
  (agent judgment; the tool does not fabricate change logs).
- The header block (everything before the first zone heading) is
  preserved verbatim **except** the `**Generated:**` line, which is
  restamped. If the existing report is missing any zone heading, the
  file is not parseable by contract: exit 1, write nothing (hand-fix
  first). If the report file does not exist, create it fresh from the
  embedded protocol template.
- `--check` prints the result to stdout and writes nothing.
- Paths in derived items go absolute (Paseo rule): backticked or bare
  repo-relative tokens that resolve to existing paths under the repo
  root. Repo root derives from the status path
  (`<repoRoot>/.hivemind/status.md`).

- [ ] Create `tests/fixtures/status.md` with exactly:

```markdown
# Status — cross-role surface (fixture)

## Awaiting keeper (explicit-yes queue, per ADR-008)

- [PP] 2026-10-25 — sample ask one: ratify the widget design at
  `.hivemind/designs/widget.md`.
- [PO] 2026-10-25 — sample ask two, carried over unchanged.

## Open escalations

- none
```

- [ ] Create `tests/fixtures/report.md` with exactly:

```markdown
# Keeper report (fixture)

**Generated:** 2026-10-24 by hand · **Source:** `.hivemind/status.md`

Protocol block stands in for the live header; the tool must keep it
verbatim except the Generated line.

## Keeper's list

(the keeper's come-back items — they persist)

- Harness name still TBC.
- Pick a name for the second hive.

## Needs the keeper

1. Ratify the widget design.
2. Untraceable ask kept from an older queue: review the frobnicator.
3. An old ask wrapped across two lines
   because live reports wrap.

## Changed since last report

- Fixture change line.

## Worth a sample

- `/already/absolute/sample.md`
```

- [ ] Replace the `cmdReport` stub in `bin/bee.js` and add helpers
  with exactly:

```js
const ZONE_TITLES = [
  "Keeper's list",
  'Needs the keeper',
  'Changed since last report',
  'Worth a sample',
];

const FRESH_HEADER = `# Keeper report

**Generated:** {STAMP} by bee report (fresh) · **Source:** \`.hivemind/status.md\`

**Zones and rules — read before regenerating this file:** *Keeper's
list* is the keeper's own — roles add items on the keeper's word,
mark done only on the keeper's resolution (in conversation counts),
and NEVER drop or overwrite it in a regen. *Needs the keeper*,
*Changed since last report*, and *Worth a sample* are
agent-maintained: regenerate freely from status.md, MERGING items
from both roles (never silently dropping the other role's asks).
Headings carry no pronouns. Paths absolute (Paseo). The keeper may
edit any zone directly. (ADR-008 + ADR-007 amendment 1.)
`;

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' +
    p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
}

function splitZones(text) {
  const lines = text.split('\n');
  const at = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) {
      const t = lines[i].slice(3).trim();
      if (ZONE_TITLES.includes(t)) at.push({ title: t, line: i });
    }
  }
  if (at.length !== ZONE_TITLES.length ||
      !ZONE_TITLES.every((t, i) => at[i].title === t)) {
    return null; // unparseable by contract
  }
  const header = lines.slice(0, at[0].line).join('\n');
  const zones = {};
  for (let i = 0; i < at.length; i++) {
    const end = i + 1 < at.length ? at[i + 1].line : lines.length;
    zones[at[i].title] = lines
      .slice(at[i].line + 1, end)
      .join('\n')
      .replace(/^\n+/, '')
      .replace(/\n+$/, '');
  }
  return { header, zones };
}

function renderZones(zones) {
  let out = '';
  for (const t of ZONE_TITLES) {
    out += `## ${t}\n\n${zones[t] || '(none)'}\n\n`;
  }
  return out.replace(/\n+$/, '') + '\n';
}

function queueBullets(statusText) {
  const lines = statusText.split('\n');
  const bullets = [];
  let inQueue = false;
  let cur = null;
  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (cur !== null) { bullets.push(cur); cur = null; }
      inQueue = line.slice(3).startsWith('Awaiting keeper');
      continue;
    }
    if (!inQueue) continue;
    if (line.startsWith('- ')) {
      if (cur !== null) bullets.push(cur);
      cur = line.slice(2);
    } else if (cur !== null && line.trim() !== '') {
      cur += ' ' + line.trim();
    }
  }
  if (cur !== null) bullets.push(cur);
  return bullets.filter((b) => !/^- *$/.test(b));
}

function absolutize(text, repoRoot) {
  const rewrite = (m, tok) => {
    if (tok.startsWith('/') || tok.startsWith('~')) return m;
    const abs = path.resolve(repoRoot, tok);
    return fs.existsSync(abs) ? abs : m;
  };
  return text
    .replace(/`([^`]+)`/g, (m, tok) => rewrite(m, tok))
    .replace(/(^|[\s(])(\.{0,2}\/?\.hivemind\/[^\s`)\]]*)/g,
      (m, pre, tok) => pre + rewrite(tok, tok));
}

function normItem(s) {
  return s.replace(/^\d+\.\s*/, '')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.:;]+$/, '')
    .toLowerCase();
}

function sameAsk(a, b) {
  const x = normItem(a), y = normItem(b);
  return x === y || x.includes(y) || y.includes(x);
}

function zoneItems(zoneText) {
  const items = [];
  let cur = null;
  for (const raw of zoneText.split('\n')) {
    const line = raw.trim();
    if (line === '' || line === '(none)') {
      if (cur !== null) { items.push(cur); cur = null; }
    } else if (line.startsWith('(') && cur === null) {
      // zone note (e.g. placeholder) — not an ask
    } else if (/^\d+\.\s/.test(line) || /^- /.test(line)) {
      if (cur !== null) items.push(cur);
      cur = line.replace(/^\d+\.\s*/, '').replace(/^- /, '');
    } else if (cur !== null) {
      cur += ' ' + line; // wrapped continuation line
    }
  }
  if (cur !== null) items.push(cur);
  return items;
}

function mergeNeeds(derived, oldZone) {
  const kept = [];
  for (const old of zoneItems(oldZone)) {
    if (!derived.some((d) => sameAsk(d, old))) kept.push(old);
  }
  const all = [...derived, ...kept];
  return all.length === 0
    ? '(none)'
    : all.map((t, i) => `${i + 1}. ${t}`).join('\n');
}

function cmdReport(rest) {
  const f = flags(rest, {
    check: { type: 'boolean' },
    status: { type: 'string' },
    report: { type: 'string' },
  });
  if (f.error) {
    return { code: 1, out: '', err: String(f.error) + '\n' };
  }
  const statusPath = f.values.status
    ? path.resolve(f.values.status)
    : path.join(REPO_ROOT, '.hivemind', 'status.md');
  const reportPath = f.values.report
    ? path.resolve(f.values.report)
    : path.join(REPO_ROOT, '.hivemind', 'keeper-report.md');
  const repoRoot = path.resolve(path.dirname(statusPath), '..');

  let statusText;
  try {
    statusText = fs.readFileSync(statusPath, 'utf8');
  } catch (e) {
    return { code: 1, out: '',
      err: `bee report: cannot read ${statusPath}: ${e.message}\n` };
  }

  const oldText = fs.existsSync(reportPath)
    ? fs.readFileSync(reportPath, 'utf8')
    : null;
  const parsed = oldText !== null ? splitZones(oldText) : null;
  if (oldText !== null && parsed === null) {
    return {
      code: 1, out: '',
      err: `bee report: ${reportPath} is missing or mis-orders a zone ` +
           `heading; refusing to write — hand-fix first\n`,
    };
  }

  const zones = parsed !== null
    ? parsed.zones
    : {
      "Keeper's list":
        "(the keeper's come-back items — add on the keeper's word)",
      'Needs the keeper': '(none)',
      'Changed since last report': '(none)',
      'Worth a sample': '(none)',
    };
  const header = parsed !== null
    ? parsed.header.replace(
        /\*\*Generated:\*\*.*(\n.*)?$/m,
        `**Generated:** ${stamp()} by bee report (merge regen) · ` +
        `**Source:** \`.hivemind/status.md\``)
    : FRESH_HEADER.replace('{STAMP}', stamp());

  const derived = queueBullets(statusText)
    .map((b) => absolutize(b, repoRoot));
  zones['Needs the keeper'] = mergeNeeds(
    derived, zones['Needs the keeper']);

  const out = header.replace(/\n+$/, '') + '\n\n' + renderZones(zones);
  if (f.values.check) {
    return { code: 0, out, err: '' };
  }
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  atomicWrite(reportPath, out);
  return {
    code: 0,
    out: `bee report: wrote ${reportPath}\n`,
    err: '',
  };
}
```

- [ ] Append to `tests/bee.test.mjs` exactly:

```js
import { fileURLToPath } from 'node:url';
const TESTS_DIR = path.dirname(fileURLToPath(import.meta.url));
const FIX = path.join(TESTS_DIR, 'fixtures');

function reportTmp() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bee-report-'));
  // copy fixtures; create the file the derived ask references so
  // absolutization resolves it
  fs.mkdirSync(path.join(dir, '.hivemind', 'designs'), {
    recursive: true,
  });
  fs.copyFileSync(path.join(FIX, 'status.md'),
    path.join(dir, '.hivemind', 'status.md'));
  fs.writeFileSync(path.join(dir, '.hivemind', 'designs', 'widget.md'),
    '# widget\n');
  return dir;
}

test('report: keeper list verbatim, merge keeps untraceable ask', () => {
  const dir = reportTmp();
  const rp = path.join(dir, 'keeper-report.md');
  fs.copyFileSync(path.join(FIX, 'report.md'), rp);
  const r = run(['report', '--status',
    path.join(dir, '.hivemind', 'status.md'), '--report', rp]);
  assert.equal(r.code, 0);
  const after = fs.readFileSync(rp, 'utf8');
  const kl = after.split("## Keeper's list")[1].split('##')[0];
  assert.ok(kl.includes('Pick a name for the second hive.'));
  assert.ok(after.includes('Untraceable ask kept'));
  assert.ok(!after.includes('Ratify the widget design.')); // deduped
  assert.ok(after.includes('An old ask wrapped across two lines ' +
    'because live reports wrap.')); // wrapped old item joined
});

test('report: derived asks land, paths absolute', () => {
  const dir = reportTmp();
  const rp = path.join(dir, 'keeper-report.md');
  fs.copyFileSync(path.join(FIX, 'report.md'), rp);
  run(['report', '--status', path.join(dir, '.hivemind', 'status.md'),
    '--report', rp]);
  const after = fs.readFileSync(rp, 'utf8');
  assert.ok(after.includes('sample ask two'));
  assert.ok(after.includes(
    path.join(dir, '.hivemind', 'designs', 'widget.md')));
});

test('report: --check writes nothing', () => {
  const dir = reportTmp();
  const rp = path.join(dir, 'keeper-report.md');
  fs.copyFileSync(path.join(FIX, 'report.md'), rp);
  const before = fs.readFileSync(rp, 'utf8');
  const r = run(['report', '--check', '--status',
    path.join(dir, '.hivemind', 'status.md'), '--report', rp]);
  assert.equal(r.code, 0);
  assert.ok(r.out.includes("## Needs the keeper"));
  assert.equal(fs.readFileSync(rp, 'utf8'), before);
});

test('report: second run is idempotent (zones byte-stable)', () => {
  const dir = reportTmp();
  const rp = path.join(dir, 'keeper-report.md');
  fs.copyFileSync(path.join(FIX, 'report.md'), rp);
  const st = path.join(dir, '.hivemind', 'status.md');
  run(['report', '--status', st, '--report', rp]);
  const first = fs.readFileSync(rp, 'utf8');
  run(['report', '--status', st, '--report', rp]);
  const second = fs.readFileSync(rp, 'utf8');
  const zones = (s) => s.slice(s.indexOf("## Keeper's list"));
  assert.equal(zones(second), zones(first));
});

test('report: changed/sample zones verbatim, header Generated restamped',
    () => {
  const dir = reportTmp();
  const rp = path.join(dir, 'keeper-report.md');
  fs.copyFileSync(path.join(FIX, 'report.md'), rp);
  run(['report', '--status', path.join(dir, '.hivemind', 'status.md'),
    '--report', rp]);
  const after = fs.readFileSync(rp, 'utf8');
  assert.ok(after.includes('- Fixture change line.'));
  assert.ok(after.includes('/already/absolute/sample.md'));
  assert.ok(after.includes('Protocol block stands in'));
  assert.match(after, /\*\*Generated:\*\*.*by bee report/);
});

test('report: missing zone heading refuses to write', () => {
  const dir = reportTmp();
  const rp = path.join(dir, 'keeper-report.md');
  fs.writeFileSync(rp, '# no zones here\n');
  const before = fs.readFileSync(rp, 'utf8');
  const r = run(['report', '--status',
    path.join(dir, '.hivemind', 'status.md'), '--report', rp]);
  assert.equal(r.code, 1);
  assert.match(r.err, /refusing to write/);
  assert.equal(fs.readFileSync(rp, 'utf8'), before);
});

test('report: fresh file gets protocol header + placeholder list', () => {
  const dir = reportTmp();
  const rp = path.join(dir, 'keeper-report.md');
  const r = run(['report', '--status',
    path.join(dir, '.hivemind', 'status.md'), '--report', rp]);
  assert.equal(r.code, 0);
  const after = fs.readFileSync(rp, 'utf8');
  assert.ok(after.includes('read before regenerating'));
  assert.ok(after.includes('sample ask two'));
});
```

- [ ] Run `npm test` — expected: 16 tests pass, 0 fail.
- [ ] Run `node bin/bee.js report --check` against the live repo —
  expected: exit 0, full zoned output on stdout, live
  `.hivemind/keeper-report.md` unchanged (verify with
  `git status --porcelain .hivemind/keeper-report.md` → empty).
- [ ] Commit (stage only `bin/bee.js`, `tests/bee.test.mjs`,
  `tests/fixtures/status.md`, `tests/fixtures/report.md`): message
  `implement bee report zoned regeneration`, trailer
  `Role: project-orchestrator`.

## Task 4: phase verification + records

**Files:** create verify records in `.hivemind/records/`; update
phase list; commit
**Depends on:** Tasks 1–3
**Provides:** evidence trail; phase exit

- [ ] Run the full suite: `npm test` — expected: 16 pass, 0 fail.
- [ ] Run `node bin/bee.js report --check` (live) — expected: exit 0,
  no write, output contains all four zone headings.
- [ ] Run `node bin/bee.js init --check` (live) — expected: exit 0,
  `already registered`.
- [ ] Hand-generation fallback check: read the live
  `.hivemind/keeper-report.md` after a `--check` run — the file is
  plain markdown, every zone hand-editable, nothing tool-only.
  (No write happens in this task; the live report is hand-maintained
  until the keeper says otherwise.)
- [ ] Write verify records per task:
  `.hivemind/records/2026-10-25-po-bee-cli-stub-task<N>-verify-r1.md`
  (commands + output excerpts) using
  `skills/bee-verify/assets/verify-record-template.md`.
- [ ] Update `.hivemind/phases/BeeHarness.md`: P2 → done.
- [ ] Commit (stage only the records and
  `.hivemind/phases/BeeHarness.md`): message `record P2 phase
  verification`, trailer `Role: project-orchestrator`.

## Phase exit

Done means: `npm test` green (16 tests); live dry-runs of both
commands behave per contract (`--check` writes nothing); records in
`.hivemind/records/`; phase list P2 done. The keeper samples the
result (ADR-008) — e.g. reads `bin/bee.js` or runs
`node bin/bee.js report --check`. First real (non-check) `bee report`
run happens on the keeper's word, not in this phase.
