// AXI compliance battery for `bee inbox` + `bee capture` (P4 Task 1).
// All runs go through a temp-dir --store — never the live
// .hivemind/inbox.toon.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { run } from '../bin/bee.js';

const STORE_HEADER =
  '# inbox — items waiting on someone (agent store; views render from here)';

function tmpStore() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bee-inbox-'));
  return path.join(dir, 'inbox.toon');
}

function add(p, addressee, text, ...extra) {
  const r = run(['inbox', 'add', addressee, text,
    '--store', p, ...extra]);
  assert.equal(r.code, 0, 'fixture add failed: ' + r.err);
  return r;
}

// AXI 8 — content first: bare `bee inbox` lists live data, not help.
test('bare inbox = list (content first)', () => {
  const p = tmpStore();
  add(p, 'keeper', 'rule the inbox aging design');
  const r = run(['inbox', '--store', p]);
  assert.equal(r.code, 0);
  assert.ok(r.out.includes('IN-001'));
  assert.ok(r.out.includes('rule the inbox aging design'));
  assert.ok(!r.out.includes('usage:'));
});

// AXI 5 — definitive empty state (absent store and empty store).
test('empty store → 0 items', () => {
  const p = tmpStore(); // never created — absent store
  const r = run(['inbox', 'list', '--store', p]);
  assert.equal(r.code, 0);
  assert.ok(r.out.startsWith('0 items'));
  assert.ok(r.out.includes('bee inbox add')); // next-step suggestion
});

// AXI 6 — fail loud on unknown flags, exit 1 + usage.
test('unknown flag → exit 1 + usage', () => {
  const p = tmpStore();
  const r = run(['inbox', 'list', '--bogus', '--store', p]);
  assert.equal(r.code, 1);
  assert.match(r.err, /--bogus/);
  assert.match(r.err, /usage:/);
});

test('unknown subcommand → exit 1 + usage', () => {
  const r = run(['inbox', 'bogus']);
  assert.equal(r.code, 1);
  assert.match(r.err, /unknown subcommand 'bogus'/);
  assert.match(r.err, /usage:/);
});

// AXI 6 — --check never writes: store stays absent after a check-add.
test('--check add writes nothing (store absent after)', () => {
  const p = tmpStore();
  const r = run(['inbox', 'add', 'keeper', 'hi', '--check',
    '--store', p]);
  assert.equal(r.code, 0);
  assert.match(r.out, /would append/);
  assert.equal(fs.existsSync(p), false);
});

test('--check done writes nothing', () => {
  const p = tmpStore();
  add(p, 'keeper', 'hi');
  const before = fs.readFileSync(p, 'utf8');
  const r = run(['inbox', 'done', 'IN-001', '--check', '--store', p]);
  assert.equal(r.code, 0);
  assert.match(r.out, /would mark IN-001 done/);
  assert.equal(fs.readFileSync(p, 'utf8'), before);
});

// Store contract (verbatim, reused by later tasks): header line,
// field order, blank line between items, zero-padded monotonic ids,
// ISO timestamps with offset.
test('store format matches the contract', () => {
  const p = tmpStore();
  add(p, 'keeper', 'rule the inbox aging design',
    '--origin', 'po', '--ref', 'docs/AXI.md');
  add(p, 'po', 'second ask');
  const text = fs.readFileSync(p, 'utf8');
  const first = [
    STORE_HEADER,
    'id: IN-001',
    'addressee: keeper',
    'origin: po',
    'ref: docs/AXI.md',
    'text: rule the inbox aging design',
    'state: open',
    /^opened: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/,
    'taken: -',
    'done: -',
    '',
    'id: IN-002',
    'addressee: po',
    'origin: bee',
    'ref: -',
    'text: second ask',
    'state: open',
    /^opened: /,
    'taken: -',
    'done: -',
    '',
  ];
  const lines = text.split('\n');
  assert.equal(lines.length, first.length);
  first.forEach((want, i) => {
    if (want instanceof RegExp) assert.match(lines[i], want);
    else assert.equal(lines[i], want);
  });
});

test('origin defaults to bee; --origin overrides', () => {
  const p = tmpStore();
  add(p, 'keeper', 'a');
  add(p, 'keeper', 'b', '--origin', 'task-orc');
  const text = fs.readFileSync(p, 'utf8');
  assert.match(text, /origin: bee\n/);
  assert.match(text, /origin: task-orc\n/);
});

// AXI 4 — pre-computed aggregate header.
test('list header aggregate: <n> open · oldest <age>', () => {
  const p = tmpStore();
  add(p, 'keeper', 'one');
  add(p, 'po', 'two');
  const r = run(['inbox', 'list', '--store', p]);
  assert.match(r.out, /^2 open · oldest \d+[smhd]\n/);
});

// AXI 3 — truncation with size hint; --full is the escape hatch.
test('default list truncates long text; --full does not', () => {
  const p = tmpStore();
  const long = 'x'.repeat(100);
  add(p, 'keeper', long);
  const def = run(['inbox', 'list', '--store', p]);
  assert.ok(def.out.includes('… (+40 chars)'));
  assert.ok(!def.out.includes('x'.repeat(61)));
  const full = run(['inbox', 'list', '--full', '--store', p]);
  assert.ok(full.out.includes(long));
  // --full carries the extra fields the default omits
  assert.match(full.out, /origin: bee · ref: - · opened: \d{4}-/);
});

// Idempotent done: second call is a true no-op (proved by a
// read-only store dir — any write attempt would fail the run).
test('done is idempotent (no-op + note, exit 0)', () => {
  const p = tmpStore();
  add(p, 'keeper', 'first');
  add(p, 'keeper', 'second');
  const r1 = run(['inbox', 'done', 'IN-001', '--note', 'shipped',
    '--store', p]);
  assert.equal(r1.code, 0);
  assert.match(r1.out, /IN-001 done/);
  const text = fs.readFileSync(p, 'utf8');
  assert.match(text, /state: done\n/);
  assert.match(text, /note: shipped\n/);

  const dir = path.dirname(p);
  fs.chmodSync(dir, 0o555); // any write attempt now throws
  try {
    const r2 = run(['inbox', 'done', 'IN-001', '--store', p]);
    assert.equal(r2.code, 0);
    assert.match(r2.out, /IN-001 already done/);
  } finally {
    fs.chmodSync(dir, 0o755);
  }
  assert.equal(fs.readFileSync(p, 'utf8'), text);
});

test('done item leaves the list; header count drops', () => {
  const p = tmpStore();
  add(p, 'keeper', 'one');
  add(p, 'keeper', 'two');
  run(['inbox', 'done', 'IN-001', '--store', p]);
  const r = run(['inbox', 'list', '--store', p]);
  assert.ok(!r.out.includes('IN-001'));
  assert.match(r.out, /^1 open · oldest \d+[smhd]\n/);
});

// Regression (review r1 SF1): a newline in --note corrupts the store.
test('done --note rejects embedded newlines (store stays parseable)', () => {
  const p = tmpStore();
  add(p, 'keeper', 'one');
  const before = fs.readFileSync(p, 'utf8');
  const r = run(['inbox', 'done', 'IN-001', '--note', 'a\nb', '--store', p]);
  assert.equal(r.code, 1);
  assert.match(r.err, /single-line/);
  assert.equal(fs.readFileSync(p, 'utf8'), before); // unchanged
  const r2 = run(['inbox', 'list', '--store', p]); // still parseable
  assert.equal(r2.code, 0);
});

// Structured errors with self-correction (agent-facing output).
test('show unknown id → exit 1 + self-correction', () => {
  const p = tmpStore();
  const r = run(['inbox', 'show', 'IN-999', '--store', p]);
  assert.equal(r.code, 1);
  assert.match(r.err, /no item IN-999 — bee inbox list/);
});

test('done unknown id → exit 1 + self-correction', () => {
  const p = tmpStore();
  const r = run(['inbox', 'done', 'IN-999', '--store', p]);
  assert.equal(r.code, 1);
  assert.match(r.err, /no item IN-999 — bee inbox list/);
});

test('show --full carries origin/ref/timestamps; default is lean', () => {
  const p = tmpStore();
  add(p, 'keeper', 'the ask', '--origin', 'po', '--ref', 'docs/x.md');
  const def = run(['inbox', 'show', 'IN-001', '--store', p]);
  assert.ok(def.out.includes('text: the ask'));
  assert.ok(!def.out.includes('origin:'));
  const full = run(['inbox', 'show', 'IN-001', '--full', '--store', p]);
  assert.ok(full.out.includes('origin: po'));
  assert.ok(full.out.includes('ref: docs/x.md'));
  assert.match(full.out, /opened: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  assert.ok(full.out.includes('taken: -'));
  assert.ok(full.out.includes('done: -'));
});

test('add requires <addressee> <text>', () => {
  const p = tmpStore();
  const r = run(['inbox', 'add', 'only-one', '--store', p]);
  assert.equal(r.code, 1);
  assert.match(r.err, /expected <addressee> <text>/);
  assert.match(r.err, /usage:/);
});

// capture = sugar for add keeper <thought> --origin capture.
test('capture lands as IN-item with origin capture', () => {
  const p = tmpStore();
  const r = run(['capture', 'quick thought', '--store', p]);
  assert.equal(r.code, 0);
  assert.match(r.out, /IN-001 captured · keeper/);
  const text = fs.readFileSync(p, 'utf8');
  assert.match(text, /addressee: keeper\n/);
  assert.match(text, /origin: capture\n/);
  assert.match(text, /text: quick thought\n/);
});

test('capture --check writes nothing', () => {
  const p = tmpStore();
  const r = run(['capture', 'x', '--check', '--store', p]);
  assert.equal(r.code, 0);
  assert.equal(fs.existsSync(p), false);
});

// taken: is stamped by list --for reads only.
test('list --for stamps matching open items taken', () => {
  const p = tmpStore();
  add(p, 'keeper', 'for keeper');
  add(p, 'po', 'for po');
  const r = run(['inbox', 'list', '--for', 'keeper', '--store', p]);
  assert.equal(r.code, 0);
  assert.match(r.out, /marked taken: IN-001/);
  assert.ok(!r.out.includes('IN-002'));
  const text = fs.readFileSync(p, 'utf8');
  const block1 = text.split('\n\n')[0];
  assert.match(block1, /state: taken\n/);
  assert.match(block1, /taken: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}\n/);
  const block2 = text.split('\n\n')[1];
  assert.match(block2, /state: open\n/);
  assert.match(block2, /taken: -\n/);
});

test('list --for --check withholds the stamp', () => {
  const p = tmpStore();
  add(p, 'keeper', 'one');
  run(['inbox', 'list', '--for', 'keeper', '--store', p]); // IN-001 taken
  const afterFirst = fs.readFileSync(p, 'utf8');
  add(p, 'keeper', 'two'); // IN-002 open
  const r = run(['inbox', 'list', '--for', 'keeper', '--check',
    '--store', p]);
  assert.equal(r.code, 0);
  assert.match(r.out, /would mark taken: IN-002/);
  const text = fs.readFileSync(p, 'utf8');
  const block2 = text.split('\n\n')[1];
  assert.match(block2, /state: open\n/); // unchanged
  // the taken item keeps its first stamp (not re-stamped in the view)
  const b = (s) => s.split('\n\n')[0].replace(/\n$/, '');
  assert.equal(b(text), b(afterFirst));
});

test('list --for with no matches → 0 items + self-correction', () => {
  const p = tmpStore();
  add(p, 'po', 'one');
  const r = run(['inbox', 'list', '--for', 'keeper', '--store', p]);
  assert.equal(r.code, 0);
  assert.match(r.out, /^0 items — bee inbox list/);
});

// Ages render from ISO opened timestamps; offsets parse (both Z and
// numeric-offset forms).
test('age renders from opened (3d)', () => {
  const p = tmpStore();
  const opened = new Date(Date.now() - 3 * 24 * 3600 * 1000)
    .toISOString();
  fs.writeFileSync(p,
    `${STORE_HEADER}
id: IN-001
addressee: keeper
origin: bee
ref: -
text: aged ask
state: open
opened: ${opened}
taken: -
done: -
`);
  const r = run(['inbox', 'list', '--store', p]);
  assert.equal(r.code, 0);
  assert.ok(r.out.includes('· 3d · aged ask'), r.out);
  assert.match(r.out, /oldest 3d/);
});

test('numeric-offset timestamps parse (show renders verbatim)', () => {
  const p = tmpStore();
  fs.writeFileSync(p,
    `${STORE_HEADER}
id: IN-001
addressee: keeper
origin: po
ref: -
text: offset ask
state: open
opened: 2026-11-01T12:00:00+11:00
taken: -
done: -
`);
  const r = run(['inbox', 'show', 'IN-001', '--full', '--store', p]);
  assert.equal(r.code, 0);
  assert.ok(r.out.includes('opened: 2026-11-01T12:00:00+11:00'));
});

test('round-trip: future/unknown fields survive a rewrite', () => {
  const p = tmpStore();
  fs.writeFileSync(p,
    `${STORE_HEADER}
id: IN-001
addressee: keeper
origin: bee
ref: -
text: seeded
state: open
opened: 2026-11-01T10:00:00+11:00
escalation: later-phase-field
taken: -
done: -
`);
  const r = run(['inbox', 'done', 'IN-001', '--store', p]);
  assert.equal(r.code, 0);
  const text = fs.readFileSync(p, 'utf8');
  assert.match(text, /escalation: later-phase-field\n/); // not deleted
  assert.match(text, /state: done\n/);
});

// ---- AXI pass (P6 task 6): mutation hints + capture help ----

test('done output carries the next step (AXI 9)', () => {
  const p = tmpStore();
  add(p, 'keeper', 'ship the aging rule');
  const r = run(['inbox', 'done', 'IN-001', '--store', p]);
  assert.equal(r.code, 0);
  assert.match(r.out, /IN-001 done — bee inbox render refreshes the status view/);
  // idempotent second call is a no-op note, not a mutation
  const again = run(['inbox', 'done', 'IN-001', '--store', p]);
  assert.equal(again.code, 0);
  assert.equal(again.out, 'IN-001 already done\n');
});

test('render output carries the next step (AXI 9)', () => {
  const p = tmpStore();
  add(p, 'keeper', 'ship the aging rule');
  const dir = path.dirname(p);
  const status = path.join(dir, 'status.md');
  fs.writeFileSync(status, '# Status\n\n## Awaiting keeper\n\n(none)\n');
  const r = run(['inbox', 'render', '--store', p, '--status', status]);
  assert.equal(r.code, 0);
  assert.match(r.out,
    /bee inbox render: .+ — .+\nnext: bee report renders the keeper digest\n$/);
});

test('capture help prints usage, records nothing (AXI 10)', () => {
  const p = tmpStore();
  const r = run(['capture', 'help', '--store', p]);
  assert.equal(r.code, 0);
  assert.match(r.out, /usage: bee capture/);
  assert.ok(!fs.existsSync(p));
});
