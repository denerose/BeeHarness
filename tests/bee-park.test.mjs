// AXI compliance battery for `bee park` (P4 Task 3), including the
// migration test against a fixture copy of the repo's markdown lot.
// All runs go through temp-dir --store / temp fixture copies —
// never the live .hivemind/memory/parking-lot.{md,toon}.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { run } from '../bin/bee.js';

const STORE_HEADER =
  '# parking lot — deferred decisions (agent store; views render from here)';

// Frozen snapshot of the markdown lot at the store conversion
// (review r1 blocking fix): the live migration replaces the repo's
// parking-lot.md with a pointer stub, so reading the repo file at
// test time would break the suite the moment the migration lands.
// The fixture is the migration's frozen input; the canary below
// pins the repo file's shape (lot or stub) instead.
const LOT_MD = fs.readFileSync(
  new URL('../tests/fixtures/parking-lot-v1.md', import.meta.url), 'utf8');

test('repo parking-lot.md is a lot or the pointer stub (canary)', () => {
  const repo = fs.readFileSync(
    new URL('../.hivemind/memory/parking-lot.md', import.meta.url), 'utf8');
  assert.ok(repo.includes('## Parked') ||
    repo.includes('moved to the script-owned store'),
  'repo lot is neither markdown lot nor stub — hand-check');
});

function tmpStore() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bee-park-'));
  return path.join(dir, 'parking-lot.toon');
}

function add(p, item, ...extra) {
  const r = run(['park', 'add', item, '--store', p, ...extra]);
  assert.equal(r.code, 0, 'fixture add failed: ' + r.err);
  return r;
}

// Fixture copy of the markdown lot, ready for a migrate run.
function tmpLot() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bee-park-md-'));
  const md = path.join(dir, 'parking-lot.md');
  fs.writeFileSync(md, LOT_MD);
  return { md, store: path.join(dir, 'parking-lot.toon') };
}

// Test-side section/id map over the markdown lot (independent of
// the implementation's parser): id → 'parked' | 'resolved'.
function lotIdsBySection() {
  const out = new Map();
  let section = null;
  for (const line of LOT_MD.split('\n')) {
    if (/^## /.test(line)) {
      const h = line.slice(3).trim().toLowerCase();
      section = h === 'parked' ? 'parked'
        : h === 'resolved' ? 'resolved' : null;
    }
    const m = /^- \*\*(PL-(?:[A-Z]+-)?\d+) —/.exec(line);
    if (m && section) out.set(m[1], section);
  }
  return out;
}

function storeItems(storePath) {
  return run(['park', 'list', '--full', '--store', storePath]).out;
}

// AXI 8 — content first: bare `bee park` lists live data, not help.
test('bare park = list (content first)', () => {
  const p = tmpStore();
  add(p, 'memory tooling specifics');
  const r = run(['park', '--store', p]);
  assert.equal(r.code, 0);
  assert.ok(r.out.includes('PL-001'));
  assert.ok(r.out.includes('memory tooling specifics'));
  assert.ok(!r.out.includes('usage:'));
});

// AXI 5 — definitive empty state (absent store).
test('empty store → 0 parked', () => {
  const p = tmpStore(); // never created — absent store
  const r = run(['park', 'list', '--store', p]);
  assert.equal(r.code, 0);
  assert.ok(r.out.startsWith('0 parked'));
  assert.ok(r.out.includes('bee park add')); // next-step suggestion
});

// AXI 6 — fail loud on unknown flags / subcommands.
test('unknown flag → exit 1 + usage', () => {
  const p = tmpStore();
  const r = run(['park', 'list', '--bogus', '--store', p]);
  assert.equal(r.code, 1);
  assert.match(r.err, /--bogus/);
  assert.match(r.err, /usage:/);
});

test('unknown subcommand → exit 1 + usage', () => {
  const r = run(['park', 'bogus']);
  assert.equal(r.code, 1);
  assert.match(r.err, /unknown subcommand 'bogus'/);
  assert.match(r.err, /usage:/);
});

// AXI 6 — --check never writes.
test('--check add writes nothing (store absent after)', () => {
  const p = tmpStore();
  const r = run(['park', 'add', 'hi', '--check', '--store', p]);
  assert.equal(r.code, 0);
  assert.match(r.out, /would append/);
  assert.equal(fs.existsSync(p), false);
});

test('--check resolve writes nothing', () => {
  const p = tmpStore();
  add(p, 'one');
  const before = fs.readFileSync(p, 'utf8');
  const r = run(['park', 'resolve', 'PL-001', '--how', 'x', '--check',
    '--store', p]);
  assert.equal(r.code, 0);
  assert.match(r.out, /would resolve PL-001/);
  assert.equal(fs.readFileSync(p, 'utf8'), before);
});

// Store contract (mirrors inbox.toon conventions): header line,
// field order, blank line between items, zero-padded ids, ISO
// timestamps with offset. `how` is conditional (absent until set).
test('store format matches the contract', () => {
  const p = tmpStore();
  add(p, 'memory tooling specifics', '--context', 'target recorded',
    '--unpark-when', 'harness build phase', '--origin', 'po');
  add(p, 'second');
  const text = fs.readFileSync(p, 'utf8');
  const first = [
    STORE_HEADER,
    'id: PL-PO-001',
    'item: memory tooling specifics',
    'context: target recorded',
    'unpark-when: harness build phase',
    'origin: po',
    /^opened: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/,
    'resolved: -',
    '',
    'id: PL-001',
    'item: second',
    'context: -',
    'unpark-when: -',
    'origin: bee',
    /^opened: /,
    'resolved: -',
    '',
  ];
  const lines = text.split('\n');
  assert.equal(lines.length, first.length);
  first.forEach((want, i) => {
    if (want instanceof RegExp) assert.match(lines[i], want);
    else assert.equal(lines[i], want);
  });
});

test('origin defaults to bee (bare series); --origin picks the series', () => {
  const p = tmpStore();
  add(p, 'first');                       // PL-001 (bare)
  add(p, 'po one', '--origin', 'po');    // PL-PO-001
  add(p, 'po two', '--origin', 'po');    // PL-PO-002
  add(p, 'pp one', '--origin', 'pp');    // PL-PP-001
  const text = fs.readFileSync(p, 'utf8');
  assert.match(text, /id: PL-001\n/);
  assert.match(text, /id: PL-PO-001\n/);
  assert.match(text, /id: PL-PO-002\n/);
  assert.match(text, /id: PL-PP-001\n/);
});

test('add continues each id series from the store', () => {
  const p = tmpStore();
  fs.writeFileSync(p, `${STORE_HEADER}
id: PL-002
item: old two
context: -
unpark-when: -
origin: bee
opened: -
resolved: -

id: PL-004
item: old four
context: -
unpark-when: -
origin: bee
opened: -
resolved: -

id: PL-PP-013
item: old pp
context: -
unpark-when: -
origin: pp
opened: -
resolved: -
`);
  const rb = run(['park', 'add', 'next bare', '--store', p]);
  assert.match(rb.out, /^PL-005 parked/);
  const rp = run(['park', 'add', 'next pp', '--origin', 'pp', '--store', p]);
  assert.match(rp.out, /^PL-PP-014 parked/);
});

test('add rejects non-alphanumeric origins (they become id prefixes)', () => {
  const p = tmpStore();
  const r = run(['park', 'add', 'x', '--origin', 'po!', '--store', p]);
  assert.equal(r.code, 1);
  assert.match(r.err, /--origin 'po!'/);
  assert.match(r.err, /usage:/);
  assert.equal(fs.existsSync(p), false);
});

test('add requires "<item>"', () => {
  const p = tmpStore();
  const r = run(['park', 'add', '--store', p]);
  assert.equal(r.code, 1);
  assert.match(r.err, /expected "<item>"/);
  assert.match(r.err, /usage:/);
});

// AXI 4 — pre-computed aggregate header.
test('list header aggregate: <n> parked · oldest <age>', () => {
  const p = tmpStore();
  const opened = new Date(Date.now() - 3 * 24 * 3600 * 1000)
    .toISOString();
  fs.writeFileSync(p, `${STORE_HEADER}
id: PL-001
item: aged
context: -
unpark-when: -
origin: bee
opened: ${opened}
resolved: -

id: PL-002
item: fresh
context: -
unpark-when: -
origin: bee
opened: ${new Date().toISOString()}
resolved: -
`);
  const r = run(['park', 'list', '--store', p]);
  assert.match(r.out, /^2 parked · oldest 3d\n/);
});

test('header age is ? when no opened timestamp parses (migrated)', () => {
  const p = tmpStore();
  fs.writeFileSync(p, `${STORE_HEADER}
id: PL-001
item: one
context: -
unpark-when: -
origin: bee
opened: -
resolved: -

id: PL-002
item: two
context: -
unpark-when: -
origin: bee
opened: -
resolved: -
`);
  const r = run(['park', 'list', '--store', p]);
  assert.match(r.out, /^2 parked · oldest \?\n/);
  assert.ok(r.out.includes('PL-001 · one · ? · unpark: -'));
});

// AXI 3 — truncation with size hint; --full is the escape hatch.
test('default list truncates item and unpark; --full does not', () => {
  const p = tmpStore();
  const item = 'i'.repeat(80);
  const unpark = 'u'.repeat(80);
  add(p, item, '--unpark-when', unpark);
  const def = run(['park', 'list', '--store', p]);
  assert.ok(def.out.includes('… (+20 chars)'));
  assert.ok(!def.out.includes('i'.repeat(61)));
  assert.ok(!def.out.includes('u'.repeat(41)));
  const full = run(['park', 'list', '--full', '--store', p]);
  assert.ok(full.out.includes(item));
  assert.ok(full.out.includes(unpark));
  assert.match(full.out,
    /unpark-when: u+ · origin: bee\n  opened: \d{4}-/);
});

// Resolve: stamps date + how; item leaves the list.
test('resolve stamps date + how; leaves list; count drops', () => {
  const p = tmpStore();
  add(p, 'one');
  add(p, 'two');
  const r = run(['park', 'resolve', 'PL-001', '--how', 'keeper ruled',
    '--store', p]);
  assert.equal(r.code, 0);
  assert.match(r.out, /PL-001 resolved/);
  const text = fs.readFileSync(p, 'utf8');
  assert.match(text,
    /resolved: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}\n/);
  assert.match(text, /how: keeper ruled\n/);
  const list = run(['park', 'list', '--store', p]);
  assert.ok(!list.out.includes('PL-001'));
  assert.match(list.out, /^1 parked · oldest \d+[smhd]\n/);
  const show = run(['park', 'show', 'PL-001', '--full', '--store', p]);
  assert.ok(show.out.includes('resolved ·')); // show still reaches it
  assert.ok(show.out.includes('how: keeper ruled'));
});

// Idempotent resolve: second call is a true no-op (proved by a
// read-only store dir — any write attempt would fail the run).
test('resolve is idempotent (no-op + note, exit 0)', () => {
  const p = tmpStore();
  add(p, 'first');
  add(p, 'second');
  run(['park', 'resolve', 'PL-001', '--how', 'shipped', '--store', p]);
  const text = fs.readFileSync(p, 'utf8');
  const dir = path.dirname(p);
  fs.chmodSync(dir, 0o555); // any write attempt now throws
  try {
    const r2 = run(['park', 'resolve', 'PL-001', '--store', p]);
    assert.equal(r2.code, 0);
    assert.match(r2.out, /PL-001 already resolved/);
  } finally {
    fs.chmodSync(dir, 0o755);
  }
  assert.equal(fs.readFileSync(p, 'utf8'), text);
});

// Regression (Task 1 review r1, mirrored): a newline in --how
// corrupts the store.
test('resolve --how rejects embedded newlines (store stays parseable)', () => {
  const p = tmpStore();
  add(p, 'one');
  const before = fs.readFileSync(p, 'utf8');
  const r = run(['park', 'resolve', 'PL-001', '--how', 'a\nb', '--store', p]);
  assert.equal(r.code, 1);
  assert.match(r.err, /single-line/);
  assert.equal(fs.readFileSync(p, 'utf8'), before); // unchanged
  const r2 = run(['park', 'list', '--store', p]); // still parseable
  assert.equal(r2.code, 0);
});

// Structured errors with self-correction (agent-facing output).
test('show unknown id → exit 1 + self-correction', () => {
  const p = tmpStore();
  const r = run(['park', 'show', 'PL-999', '--store', p]);
  assert.equal(r.code, 1);
  assert.match(r.err, /no item PL-999 — bee park list/);
});

test('resolve unknown id → exit 1 + self-correction', () => {
  const p = tmpStore();
  const r = run(['park', 'resolve', 'PL-999', '--store', p]);
  assert.equal(r.code, 1);
  assert.match(r.err, /no item PL-999 — bee park list/);
});

test('show default carries item/context/unpark-when; --full adds the rest', () => {
  const p = tmpStore();
  add(p, 'the ask', '--context', 'open questions here',
    '--unpark-when', 'keeper says so', '--origin', 'po');
  const def = run(['park', 'show', 'PL-PO-001', '--store', p]);
  assert.ok(def.out.includes('item: the ask'));
  assert.ok(def.out.includes('context: open questions here'));
  assert.ok(def.out.includes('unpark-when: keeper says so'));
  assert.ok(!def.out.includes('origin:'));
  const full = run(['park', 'show', 'PL-PO-001', '--full', '--store', p]);
  assert.ok(full.out.includes('origin: po'));
  assert.match(full.out, /opened: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  assert.ok(full.out.includes('resolved: -'));
  assert.ok(!full.out.includes('how:')); // absent until set
});

// Task 1 deviation carried over: unknown fields survive round-trips.
test('round-trip: future/unknown fields survive a rewrite', () => {
  const p = tmpStore();
  fs.writeFileSync(p, `${STORE_HEADER}
id: PL-001
item: seeded
context: -
unpark-when: -
origin: bee
opened: 2026-11-01T10:00:00+11:00
escalation: later-phase-field
resolved: -
`);
  const r = run(['park', 'resolve', 'PL-001', '--store', p]);
  assert.equal(r.code, 0);
  const text = fs.readFileSync(p, 'utf8');
  assert.match(text, /escalation: later-phase-field\n/); // not deleted
  assert.match(text, /resolved: \d{4}-\d{2}-\d{2}T/);
});

test('usage carries the keeper-gate law line', () => {
  const r = run(['park', 'help']);
  assert.equal(r.code, 0);
  assert.match(r.out, /resolve is keeper-gated/);
});

// ---- migrate: the named one-shot executor ----

test('migrate: every md id lands in the store exactly once, state preserved', () => {
  const { md, store } = tmpLot();
  const r = run(['park', 'migrate', md, '--store', store]);
  assert.equal(r.code, 0, r.err);
  const text = fs.readFileSync(store, 'utf8');
  const idsBySection = lotIdsBySection();
  assert.ok(idsBySection.size >= 19, 'fixture lot unexpectedly small');
  for (const [id, section] of idsBySection) {
    const occurrences = text.split(`id: ${id}\n`).length - 1;
    assert.equal(occurrences, 1, `${id} appears ${occurrences}x`);
    const block = text.split(`id: ${id}\n`)[1].split('\n\n')[0];
    if (section === 'parked') {
      assert.match(block, /resolved: -/, `${id} should stay parked`);
    } else {
      assert.match(block, /resolved: \d{4}-\d{2}-\d{2}/,
        `${id} should carry its resolved date`);
    }
  }
});

test('migrate: the three stale parked duplicates → resolved wins + how note', () => {
  const { md, store } = tmpLot();
  const r = run(['park', 'migrate', md, '--store', store]);
  assert.equal(r.code, 0, r.err);
  // Collisions are computed from the fixture itself (shape, not
  // count) — the plan's three must be among them.
  const idsBySection = lotIdsBySection();
  const mdCount = new Map();
  for (const line of LOT_MD.split('\n')) {
    const m = /^- \*\*(PL-(?:[A-Z]+-)?\d+) —/.exec(line);
    if (m) mdCount.set(m[1], (mdCount.get(m[1]) ?? 0) + 1);
  }
  const collisions = [...mdCount.entries()]
    .filter(([, n]) => n > 1).map(([id]) => id);
  for (const id of ['PL-004', 'PL-PO-001', 'PL-PP-002']) {
    assert.ok(collisions.includes(id),
      `${id} expected as a fixture collision`);
  }
  const text = fs.readFileSync(store, 'utf8');
  for (const id of collisions) {
    const occurrences = text.split(`id: ${id}\n`).length - 1;
    assert.equal(occurrences, 1, `${id} must appear once`);
    const block = text.split(`id: ${id}\n`)[1].split('\n\n')[0];
    assert.match(block, /resolved: \d{4}-\d{2}-\d{2}/,
      `${id}: resolved entry must win`);
    assert.match(block, /how: .*\bsuperseded stale parked duplicate\b/,
      `${id}: how must note the superseded parked copy`);
  }
  assert.match(r.out, /3 id collisions \(resolved wins\): PL-PO-001, PL-PP-002, PL-004/);
});

test('migrate: parked bodies split into context + unpark-when', () => {
  const { md, store } = tmpLot();
  run(['park', 'migrate', md, '--store', store]);
  const text = fs.readFileSync(store, 'utf8');
  const block = text.split('id: PL-PP-013\n')[1].split('\n\n')[0];
  assert.match(block, /^item: power-planner session-memory sweep/);
  assert.match(block, /unpark-when: with the post-P8 session start or the keeper's word\./);
  assert.match(block, /context: keeper direction \(2026-11-01\): after P8/);
  assert.match(block, /origin: pp/);
  assert.match(block, /opened: -/);
});

test('migrate: hard-wrapped hyphen joins keep tokens whole', () => {
  const { md, store } = tmpLot();
  run(['park', 'migrate', md, '--store', store]);
  const text = fs.readFileSync(store, 'utf8');
  // PL-PP-003's '2026-11-\n01' and PL-PP-011's 'worktree-\nscoped'
  // wrap mid-token in the markdown source.
  assert.match(text, /\(2026-11-01, same session\)/);
  assert.match(text, /worktree-scoped and resets cheaply/);
});

test('migrate: replaces the md with the pointer stub (durable text)', () => {
  const { md, store } = tmpLot();
  const r = run(['park', 'migrate', md, '--store', store]);
  assert.equal(r.code, 0, r.err);
  const stub = fs.readFileSync(md, 'utf8');
  assert.ok(stub.includes('parking-lot.toon'), 'store path in stub');
  assert.ok(stub.includes('bee park list'), 'command in stub');
  assert.ok(stub.includes('keeper-only'), 'keeper-gate line in stub');
  assert.ok(!stub.includes('## Parked'), 'no parked section remains');
  assert.ok(!/PL-/.test(stub), 'no entries remain');
});

test('migrate --check writes nothing (store absent, md unchanged)', () => {
  const { md, store } = tmpLot();
  const r = run(['park', 'migrate', md, '--check', '--store', store]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /would write/);
  assert.match(r.out, /would replace/);
  assert.equal(fs.existsSync(store), false);
  assert.equal(fs.readFileSync(md, 'utf8'), LOT_MD);
});

test('migrate refuses an md with no PL-* entries (re-run guard)', () => {
  const { md, store } = tmpLot();
  run(['park', 'migrate', md, '--store', store]); // md → stub
  const r = run(['park', 'migrate', md, '--store', store]);
  assert.equal(r.code, 1);
  assert.match(r.err, /no PL-\* entries found/);
  assert.match(r.err, /already migrated/);
  // and the store from the first run survives untouched
  const text = fs.readFileSync(store, 'utf8');
  assert.match(text, /id: PL-002\n/);
});

test('migrate refuses a malformed entry with a hand-fix line', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bee-park-bad-'));
  const md = path.join(dir, 'lot.md');
  fs.writeFileSync(md, '## Parked\n\n- **PL-900 — broken shape** (no body dash)\n');
  const r = run(['park', 'migrate', md]);
  assert.equal(r.code, 1);
  assert.match(r.err, /cannot parse/);
  assert.match(r.err, /hand-fix/);
  assert.equal(fs.existsSync(path.join(dir, 'parking-lot.toon')), false);
});

test('migrated store lists: header counts open items, ages are ?', () => {
  const { md, store } = tmpLot();
  run(['park', 'migrate', md, '--store', store]);
  const r = run(['park', 'list', '--store', store]);
  assert.equal(r.code, 0);
  // idsBySection maps collisions → 'resolved' (last write wins),
  // so parked values = distinct still-open ids.
  const parkedCount = [...lotIdsBySection().values()]
    .filter((s) => s === 'parked').length;
  assert.match(r.out, new RegExp(`^${parkedCount} parked · oldest \\?\\n`));
  assert.ok(r.out.includes('PL-PP-013'));
  assert.ok(!r.out.includes('PL-PP-012')); // resolved → not listed
});
