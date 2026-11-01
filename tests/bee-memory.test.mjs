// Tests for `bee memory` (P5 Task 1) — the durable memory store.
// All runs go through temp-dir --store — never the live
// .hivemind/memory/memory.toon.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { run } from '../bin/bee.js';

const STORE_HEADER =
  '# memory — durable lessons and facts (agent store; supersede, never delete)';

function tmpStore() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bee-memory-'));
  return path.join(dir, 'memory.toon');
}

function add(p, gist, ...extra) {
  const r = run(['memory', 'add', gist, '--store', p, ...extra]);
  assert.equal(r.code, 0, 'fixture add failed: ' + r.err);
  return r;
}

// AXI 8 — content first: bare `bee memory` lists live data, not help.
test('bare memory = list (content first)', () => {
  const p = tmpStore();
  add(p, 'keep sessions lean', '--type', 'lesson');
  const r = run(['memory', '--store', p]);
  assert.equal(r.code, 0);
  assert.ok(r.out.includes('ME-001'));
  assert.ok(r.out.includes('keep sessions lean'));
  assert.ok(!r.out.includes('usage:'));
});

// AXI 5 — definitive empty state (absent store).
test('absent store → 0 entries', () => {
  const p = tmpStore(); // never created — absent store
  const r = run(['memory', 'list', '--store', p]);
  assert.equal(r.code, 0);
  assert.ok(r.out.startsWith('0 entries'));
  assert.ok(r.out.includes('bee memory add')); // next-step suggestion
});

// AXI 6 — fail loud on unknown flags / subcommands.
test('unknown flag → exit 1 + usage', () => {
  const p = tmpStore();
  const r = run(['memory', 'list', '--bogus', '--store', p]);
  assert.equal(r.code, 1);
  assert.match(r.err, /--bogus/);
  assert.match(r.err, /usage:/);
});

test('unknown subcommand → exit 1 + usage', () => {
  const r = run(['memory', 'bogus']);
  assert.equal(r.code, 1);
  assert.match(r.err, /unknown subcommand 'bogus'/);
  assert.match(r.err, /usage:/);
});

test('default series is bare ME-NNN (origin defaults to bee)', () => {
  const p = tmpStore();
  const r1 = add(p, 'first', '--type', 'lesson');
  const r2 = add(p, 'second', '--type', 'fact');
  assert.match(r1.out, /^ME-001 added/);
  assert.match(r2.out, /^ME-002 added/);
  const text = fs.readFileSync(p, 'utf8');
  assert.match(text, / :: lesson :: first :: bee · /);
  assert.match(text, / :: fact :: second :: bee · /);
});

test('per-role series via full and short origin', () => {
  const p = tmpStore();
  add(p, 'pp short', '--type', 'lesson', '--origin', 'pp');   // ME-PP-001
  add(p, 'bare stays bare', '--type', 'fact');                // ME-001
  const rFull = run(['memory', 'add', 'pp full name', '--type', 'lesson',
    '--origin', 'power-planner', '--store', p]);              // ME-PP-002
  assert.equal(rFull.code, 0, rFull.err);
  assert.match(rFull.out, /^ME-PP-002 added/);
  const rPo = run(['memory', 'add', 'po full', '--type', 'fact',
    '--origin', 'project-orchestrator', '--store', p]);       // ME-PO-001
  assert.equal(rPo.code, 0, rPo.err);
  assert.match(rPo.out, /^ME-PO-001 added/);
  const text = fs.readFileSync(p, 'utf8');
  assert.match(text, /ME-PP-001 :: /);
  assert.match(text, /ME-PP-002 :: /);
  assert.match(text, /ME-PO-001 :: /);
  assert.match(text, /ME-001 :: /);
});

// D3 — --type is always explicit, on add and supersede alike.
test('--type required (omitting exits 1)', () => {
  const p = tmpStore();
  const r = run(['memory', 'add', 'gist', '--store', p]);
  assert.equal(r.code, 1);
  assert.match(r.err, /--type is required/);
  assert.match(r.err, /usage:/);
  assert.equal(fs.existsSync(p), false);
  add(p, 'seed', '--type', 'lesson');
  const rs = run(['memory', 'supersede', 'ME-001', 'better', '--store', p]);
  assert.equal(rs.code, 1);
  assert.match(rs.err, /--type is required/);
});

test('invalid --type value fails loud', () => {
  const p = tmpStore();
  const r = run(['memory', 'add', 'gist', '--type', 'note', '--store', p]);
  assert.equal(r.code, 1);
  assert.match(r.err, /--type 'note' must be lesson or fact/);
  assert.equal(fs.existsSync(p), false);
});

// Store contract: header line, ' :: ' field order, zero-padded
// ids, provenance origin · date · ref.
test('store format: field order + zero-padded ids', () => {
  const p = tmpStore();
  add(p, 'keep sessions lean', '--type', 'fact', '--ref', 'docs/AXI.md',
    '--origin', 'po');
  add(p, 'second', '--type', 'lesson');
  const lines = fs.readFileSync(p, 'utf8').split('\n');
  assert.equal(lines.length, 4); // header + 2 entries + trailing ''
  assert.equal(lines[0], STORE_HEADER);
  assert.match(lines[1],
    /^ME-PO-001 :: fact :: keep sessions lean :: po · \d{4}-\d{2}-\d{2} · docs\/AXI\.md :: live$/);
  assert.match(lines[2],
    /^ME-001 :: lesson :: second :: bee · \d{4}-\d{2}-\d{2} · - :: live$/);
  assert.equal(lines[3], '');
});

test('add continues each id series from the store', () => {
  const p = tmpStore();
  fs.writeFileSync(p, `${STORE_HEADER}
ME-002 :: fact :: seeded two :: bee · 2026-10-30 · - :: live
ME-004 :: lesson :: seeded four :: bee · 2026-10-30 · - :: live
ME-PP-013 :: lesson :: seeded pp :: pp · 2026-10-30 · - :: live
`);
  const rb = run(['memory', 'add', 'next bare', '--type', 'lesson',
    '--store', p]);
  assert.match(rb.out, /^ME-005 added/);
  const rp = run(['memory', 'add', 'next pp', '--type', 'fact',
    '--origin', 'pp', '--store', p]);
  assert.match(rp.out, /^ME-PP-014 added/);
});

test('supersede rewrites the old state in place and mints the successor', () => {
  const p = tmpStore();
  add(p, 'old lesson', '--type', 'lesson');
  add(p, 'second', '--type', 'fact');
  const r = run(['memory', 'supersede', 'ME-001', 'better lesson',
    '--type', 'lesson', '--ref', 'docs/AXI.md', '--store', p]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /^ME-003 added · supersedes ME-001/);
  const lines = fs.readFileSync(p, 'utf8').split('\n');
  // the old entry rewrites IN PLACE (still first) naming its successor
  assert.match(lines[1],
    /^ME-001 :: lesson :: old lesson :: bee · \d{4}-\d{2}-\d{2} · - :: superseded:ME-003$/);
  // the successor appends, provenance-stamped, live
  assert.match(lines[3],
    /^ME-003 :: lesson :: better lesson :: bee · \d{4}-\d{2}-\d{2} · docs\/AXI\.md :: live$/);
  // list default shows live only; --full shows all
  const def = run(['memory', 'list', '--store', p]);
  assert.match(def.out, /^2 live entries/);
  assert.ok(!def.out.includes('ME-001'));
  assert.ok(def.out.includes('ME-003'));
  const full = run(['memory', 'list', '--full', '--store', p]);
  assert.match(full.out, /^3 entries · 2 live · 1 superseded/);
  assert.ok(full.out.includes('ME-001'));
  // show still reaches the superseded entry
  const show = run(['memory', 'show', 'ME-001', '--store', p]);
  assert.match(show.out, /ME-001 · lesson · superseded:ME-003/);
});

test('supersede mints in the calling role\'s series (--origin)', () => {
  const p = tmpStore();
  add(p, 'bare entry', '--type', 'lesson'); // ME-001 (bee series)
  const r = run(['memory', 'supersede', 'ME-001', 'po replacement',
    '--type', 'lesson', '--origin', 'project-orchestrator', '--store', p]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /^ME-PO-001 added · supersedes ME-001/);
  const text = fs.readFileSync(p, 'utf8');
  assert.match(text, / :: superseded:ME-PO-001$/m); // cross-series link
  // provenance origin rides as passed (plan: "origin as passed")
  assert.match(text, /ME-PO-001 :: lesson :: po replacement :: project-orchestrator · /);
});

test('double-supersede fails loud (store unchanged)', () => {
  const p = tmpStore();
  add(p, 'old', '--type', 'lesson');
  run(['memory', 'supersede', 'ME-001', 'new', '--type', 'lesson',
    '--store', p]);
  const before = fs.readFileSync(p, 'utf8');
  const r = run(['memory', 'supersede', 'ME-001', 'again',
    '--type', 'lesson', '--store', p]);
  assert.equal(r.code, 1);
  assert.match(r.err, /already superseded/);
  assert.match(r.err, /superseded:ME-002/);
  assert.match(r.err, /supersede ME-002 instead/);
  assert.equal(fs.readFileSync(p, 'utf8'), before);
});

// AXI 6 / safety — --check never writes.
test('--check add writes nothing (store absent after)', () => {
  const p = tmpStore();
  const r = run(['memory', 'add', 'hi', '--type', 'lesson', '--check',
    '--store', p]);
  assert.equal(r.code, 0);
  assert.match(r.out, /would append/);
  assert.match(r.out, /ME-001 :: lesson :: hi :: /);
  assert.equal(fs.existsSync(p), false);
});

test('--check supersede writes nothing', () => {
  const p = tmpStore();
  add(p, 'one', '--type', 'lesson');
  const before = fs.readFileSync(p, 'utf8');
  const r = run(['memory', 'supersede', 'ME-001', 'two', '--type', 'lesson',
    '--check', '--store', p]);
  assert.equal(r.code, 0);
  assert.match(r.out, /would append/);
  assert.match(r.out, /would mark ME-001 superseded:ME-002/);
  assert.equal(fs.readFileSync(p, 'utf8'), before);
});

test('show unknown id fails loud with the store path', () => {
  const p = tmpStore();
  const r = run(['memory', 'show', 'ME-999', '--store', p]);
  assert.equal(r.code, 1);
  assert.match(r.err, /no entry ME-999/);
  assert.match(r.err, new RegExp(p)); // the store path, verbatim
  assert.match(r.err, /\(absent\)/);  // absent store named as such
});

test('supersede unknown id fails loud', () => {
  const p = tmpStore();
  add(p, 'one', '--type', 'lesson');
  const r = run(['memory', 'supersede', 'ME-999', 'x', '--type', 'lesson',
    '--store', p]);
  assert.equal(r.code, 1);
  assert.match(r.err, /no entry ME-999/);
  const text = fs.readFileSync(p, 'utf8'); // store untouched
  assert.match(text, /ME-001 :: lesson :: one :: /);
});

// AXI 3 — truncation with size hint; --full is the escape hatch.
test('default list truncates the gist; --full does not', () => {
  const p = tmpStore();
  add(p, 'g'.repeat(80), '--type', 'lesson');
  const def = run(['memory', 'list', '--store', p]);
  assert.ok(def.out.includes('… (+20 chars)'));
  assert.ok(!def.out.includes('g'.repeat(61)));
  const full = run(['memory', 'list', '--full', '--store', p]);
  assert.ok(full.out.includes('g'.repeat(80)));
  assert.match(full.out, /gist: g+\n  provenance: bee · \d{4}-\d{2}-\d{2} · -/);
});

test('list --type filters; invalid value fails loud', () => {
  const p = tmpStore();
  add(p, 'a lesson', '--type', 'lesson');
  add(p, 'a fact', '--type', 'fact');
  const r = run(['memory', 'list', '--type', 'fact', '--store', p]);
  assert.equal(r.code, 0);
  assert.ok(r.out.includes('a fact'));
  assert.ok(!r.out.includes('a lesson'));
  const bad = run(['memory', 'list', '--type', 'note', '--store', p]);
  assert.equal(bad.code, 1);
  assert.match(bad.err, /--type 'note' must be lesson or fact/);
});

// House rule — the newline guard (and the ' :: ' line-format guard).
test('gist/ref reject newlines and \' :: \' (store stays one-line-per-entry)', () => {
  const p = tmpStore();
  add(p, 'one', '--type', 'lesson');
  const before = fs.readFileSync(p, 'utf8');
  const r1 = run(['memory', 'add', 'a\nb', '--type', 'lesson', '--store', p]);
  assert.equal(r1.code, 1);
  assert.match(r1.err, /single-line/);
  const r2 = run(['memory', 'add', 'a :: b', '--type', 'lesson', '--store', p]);
  assert.equal(r2.code, 1);
  assert.match(r2.err, /' :: '/);
  const r3 = run(['memory', 'add', 'ok gist', '--type', 'lesson',
    '--ref', 'x\ny', '--store', p]);
  assert.equal(r3.code, 1);
  assert.match(r3.err, /single-line/);
  assert.equal(fs.readFileSync(p, 'utf8'), before); // unchanged
});

test('add rejects non-alphanumeric origins (they become id prefixes)', () => {
  const p = tmpStore();
  const r = run(['memory', 'add', 'x', '--type', 'lesson',
    '--origin', 'po!', '--store', p]);
  assert.equal(r.code, 1);
  assert.match(r.err, /--origin 'po!'/);
  assert.match(r.err, /usage:/);
  assert.equal(fs.existsSync(p), false);
});

test('help lists the --store seam (park/inbox pattern)', () => {
  const r = run(['memory', 'help']);
  assert.equal(r.code, 0);
  assert.match(r.out, /--store <path>/);
  assert.match(r.out, /memory\.toon/);
});

test('unparseable store line fails loud (hand-fix message)', () => {
  const p = tmpStore();
  fs.writeFileSync(p, `${STORE_HEADER}
ME-001 :: only-three :: fields\n`);
  const r = run(['memory', 'list', '--store', p]);
  assert.equal(r.code, 1);
  assert.match(r.err, /cannot parse/);
  assert.match(r.err, /hand-fix/);
});
