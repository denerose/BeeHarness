// Task 2 (code half): `bee inbox render` — the open-items view into
// a marked region of a status file — and `bee report` sourcing
// *Needs the keeper* from the inbox store (status-bullet parsing as
// the fallback). All paths point at temp dirs; the live .hivemind
// surfaces are never touched. The live migration (real adds against
// the real store, live render + regen) is the dispatcher's half.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from '../bin/bee.js';

const TESTS_DIR = path.dirname(fileURLToPath(import.meta.url));
const FIX = path.join(TESTS_DIR, 'fixtures');

const STORE_HEADER =
  '# inbox — items waiting on someone (agent store; views render from here)';

const RENDER_OPEN = '<!-- inbox:render -->';
const RENDER_CLOSE = '<!-- /inbox:render -->';

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'bee-render-'));
}

const daysAgoIso = (n) =>
  new Date(Date.now() - n * 24 * 3600 * 1000).toISOString();

function seedStore(p, items) {
  const blocks = items.map((it, i) => [
    `id: IN-${String(i + 1).padStart(3, '0')}`,
    `addressee: ${it.addressee ?? 'keeper'}`,
    `origin: ${it.origin ?? 'bee'}`,
    `ref: ${it.ref ?? '-'}`,
    `text: ${it.text}`,
    `state: ${it.state ?? 'open'}`,
    `opened: ${it.opened}`,
    'taken: -',
    'done: -',
  ].join('\n'));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${STORE_HEADER}\n${blocks.join('\n\n')}\n`);
}

const HAND_STATUS = `# Status — fixture

Intro prose that must survive every render unchanged.

## Awaiting keeper (explicit-yes queue, per ADR-008)

- [PP] first hand ask: ratify the widget design at
  \`.hivemind/suggestions/widget.md\`.
- [PO] second hand ask, no citation.
- [PP] stale ask: RESOLVED by keeper earlier.

## Open escalations

- [PP] escalation bullet — outside the queue; must survive.

## Cross-role notes

- [PO] note line; also outside.
`;

function writeHandStatus(dir, name = 'status.md') {
  const p = path.join(dir, name);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, HAND_STATUS);
  return p;
}

function regionOf(fileText) {
  const a = fileText.indexOf(RENDER_OPEN);
  const b = fileText.indexOf(RENDER_CLOSE);
  return a === -1 || b === -1
    ? null
    : fileText.slice(a, b + RENDER_CLOSE.length);
}

// everything outside the render region (region collapsed to §)
const outsideRegion = (s) => {
  const a = s.indexOf(RENDER_OPEN);
  const b = s.indexOf(RENDER_CLOSE);
  return s.slice(0, a) + '§' + s.slice(b + RENDER_CLOSE.length);
};

// ---------- render ----------

test('render: absent region → created under new heading, hand section replaced', () => {
  const dir = tmpDir();
  const st = writeHandStatus(dir);
  const store = path.join(dir, 'inbox.toon');
  seedStore(store, [
    { text: 'rule the inbox aging design', opened: daysAgoIso(5),
      origin: 'po' },
    { text: 'second ask', opened: daysAgoIso(3),
      ref: 'suggestions/widget.md' },
  ]);
  const r = run(['inbox', 'render', '--store', store, '--status', st]);
  assert.equal(r.code, 0, r.err);
  const after = fs.readFileSync(st, 'utf8');
  assert.ok(after.includes('## Awaiting keeper (rendered from inbox.toon)'));
  assert.ok(!after.includes('explicit-yes queue')); // hand section gone
  assert.ok(!after.includes('second hand ask')); // its bullets gone
  // surrounding sections survive
  assert.ok(after.startsWith('# Status — fixture\n\nIntro prose'));
  assert.ok(after.includes(
    '## Open escalations\n\n- [PP] escalation bullet — outside the queue; must survive.\n'));
  assert.ok(after.includes('## Cross-role notes'));
  // the view itself
  const reg = regionOf(after);
  assert.ok(reg !== null);
  assert.match(reg, /2 open · oldest 5d/);
  assert.match(reg, /keeper \(2 open · oldest 5d\):/);
  assert.match(reg, /- IN-001 · 5d — rule the inbox aging design/);
  assert.match(reg, /- IN-002 · 3d — second ask · ref: suggestions\/widget\.md/);
});

test('render: idempotent — render twice = identical file', () => {
  const dir = tmpDir();
  const st = writeHandStatus(dir);
  const store = path.join(dir, 'inbox.toon');
  seedStore(store, [
    { text: 'ask one', opened: daysAgoIso(5) },
    { addressee: 'po', text: 'ask two', opened: daysAgoIso(2) },
  ]);
  run(['inbox', 'render', '--store', store, '--status', st]);
  const first = fs.readFileSync(st, 'utf8');
  run(['inbox', 'render', '--store', store, '--status', st]);
  const second = fs.readFileSync(st, 'utf8');
  assert.equal(second, first); // diff shown: none
});

test('render: only the region moves (isolation under concurrent edits)', () => {
  const dir = tmpDir();
  const st = writeHandStatus(dir);
  const store = path.join(dir, 'inbox.toon');
  seedStore(store, [{ text: 'ask one', opened: daysAgoIso(5) }]);
  run(['inbox', 'render', '--store', store, '--status', st]);
  const first = fs.readFileSync(st, 'utf8');
  // a concurrent edit lands outside the region; the store grows
  const edited = first.replace('- [PO] note line; also outside.',
    '- [PO] note line; also outside.\n- [PP] a concurrent edit.');
  fs.writeFileSync(st, edited);
  run(['inbox', 'add', 'keeper', 'a new ask', '--store', store]);
  run(['inbox', 'render', '--store', store, '--status', st]);
  const third = fs.readFileSync(st, 'utf8');
  assert.ok(third.includes('- [PP] a concurrent edit.')); // edit survived
  assert.ok(third.includes('a new ask')); // region picked up the item
  assert.equal(outsideRegion(third), outsideRegion(edited)); // byte-exact
});

test('render: --check writes nothing, previews the region', () => {
  const dir = tmpDir();
  const st = writeHandStatus(dir);
  const store = path.join(dir, 'inbox.toon');
  seedStore(store, [{ text: 'ask one', opened: daysAgoIso(5) }]);
  const before = fs.readFileSync(st, 'utf8');
  const r = run(['inbox', 'render', '--check', '--store', store,
    '--status', st]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /--check: would render into/);
  assert.ok(r.out.includes('ask one'));
  assert.ok(r.out.includes(RENDER_OPEN));
  assert.equal(fs.readFileSync(st, 'utf8'), before); // untouched
});

test('render: empty store → definitive 0 open region', () => {
  const dir = tmpDir();
  const st = writeHandStatus(dir);
  const store = path.join(dir, 'inbox.toon'); // never seeded
  const r = run(['inbox', 'render', '--store', store, '--status', st]);
  assert.equal(r.code, 0, r.err);
  const reg = regionOf(fs.readFileSync(st, 'utf8'));
  assert.ok(reg !== null);
  assert.match(reg, /0 open/);
});

test('render: done items leave the view; taken stay', () => {
  const dir = tmpDir();
  const st = writeHandStatus(dir);
  const store = path.join(dir, 'inbox.toon');
  seedStore(store, [
    { text: 'open ask', opened: daysAgoIso(5) },
    { text: 'taken ask', opened: daysAgoIso(4), state: 'taken' },
    { text: 'done ask', opened: daysAgoIso(3), state: 'done' },
  ]);
  run(['inbox', 'render', '--store', store, '--status', st]);
  const reg = regionOf(fs.readFileSync(st, 'utf8'));
  assert.match(reg, /2 open · oldest 5d/);
  assert.ok(reg.includes('taken ask'));
  assert.ok(!reg.includes('done ask'));
});

test('render: addressee groups alphabetical, items oldest first', () => {
  const dir = tmpDir();
  const st = writeHandStatus(dir);
  const store = path.join(dir, 'inbox.toon');
  seedStore(store, [
    { text: 'newer keeper ask', opened: daysAgoIso(2) },
    { addressee: 'po', text: 'po ask', opened: daysAgoIso(4) },
    { text: 'older keeper ask', opened: daysAgoIso(5) },
  ]);
  run(['inbox', 'render', '--store', store, '--status', st]);
  const reg = regionOf(fs.readFileSync(st, 'utf8'));
  const keeperIdx = reg.indexOf('keeper (');
  const poIdx = reg.indexOf('po (');
  const olderIdx = reg.indexOf('- IN-003 · 5d — older keeper ask');
  const newerIdx = reg.indexOf('- IN-001 · 2d — newer keeper ask');
  for (const i of [keeperIdx, poIdx, olderIdx, newerIdx]) {
    assert.ok(i !== -1, 'missing expected line in: ' + reg);
  }
  assert.ok(keeperIdx < poIdx); // alphabetical groups
  assert.ok(olderIdx < newerIdx); // oldest first within a group
});

test('render: unbalanced markers → refuse + fix instruction', () => {
  const dir = tmpDir();
  const st = path.join(dir, 'status.md');
  fs.writeFileSync(st,
    `# S\n\n## Awaiting keeper\n\n${RENDER_OPEN}\n- orphan\n`);
  const r = run(['inbox', 'render', '--store', path.join(dir, 's.toon'),
    '--status', st]);
  assert.equal(r.code, 1);
  assert.match(r.err, /unbalanced/);
  assert.match(r.err, /hand-fix/);
  assert.equal(fs.readFileSync(st, 'utf8'), // untouched
    `# S\n\n## Awaiting keeper\n\n${RENDER_OPEN}\n- orphan\n`);
});

test('render: unknown flag → exit 1 + usage', () => {
  const r = run(['inbox', 'render', '--bogus']);
  assert.equal(r.code, 1);
  assert.match(r.err, /--bogus/);
  assert.match(r.err, /usage:/);
});

test('render: unknown argument → exit 1 + usage', () => {
  const r = run(['inbox', 'render', 'stray']);
  assert.equal(r.code, 1);
  assert.match(r.err, /unexpected argument 'stray'/);
  assert.match(r.err, /usage:/);
});

// ---------- report derivation ----------

test('report: derives from the store — oldest first, ids, absolute ref', () => {
  const dir = tmpDir();
  fs.mkdirSync(path.join(dir, '.hivemind', 'suggestions'),
    { recursive: true });
  fs.writeFileSync(path.join(dir, '.hivemind', 'suggestions', 'widget.md'),
    '# w\n');
  const st = writeHandStatus(dir, '.hivemind/status.md');
  const store = path.join(dir, '.hivemind', 'inbox.toon');
  seedStore(store, [
    { text: 'younger ask about the widget', opened: daysAgoIso(3),
      origin: 'po', ref: '.hivemind/suggestions/widget.md' },
    { text: 'older ask, review the frobnicator', opened: daysAgoIso(5),
      origin: 'status' },
  ]);
  const rp = path.join(dir, '.hivemind', 'keeper-report.md');
  fs.copyFileSync(path.join(FIX, 'report.md'), rp);
  const r = run(['report', '--status', st, '--report', rp,
    '--store', store]);
  assert.equal(r.code, 0, r.err);
  const after = fs.readFileSync(rp, 'utf8');
  const zone = after.split('## Needs the keeper')[1].split('##')[0];
  const older = zone.indexOf('older ask, review the frobnicator');
  const younger = zone.indexOf('younger ask about the widget');
  assert.ok(older !== -1 && younger !== -1 && older < younger);
  assert.ok(zone.includes('[status]'));
  assert.ok(zone.includes('[po]'));
  assert.ok(zone.includes('IN-002')); // id traceability
  assert.ok(zone.includes(
    path.join(dir, '.hivemind', 'suggestions', 'widget.md'))); // absolute
  assert.match(after, /\*\*Source:\*\* `\.hivemind\/inbox\.toon`/);
  // while the store carries keeper asks, status bullets are NOT derived
  assert.ok(!zone.includes('first hand ask'));
  // merge-regen semantics intact
  assert.ok(zone.includes('Untraceable ask kept'));
  const kl = after.split("## Keeper's list")[1].split('##')[0];
  assert.ok(kl.includes('Pick a name for the second hive.'));
});

test('report: store absent → falls back to status bullets', () => {
  const dir = tmpDir();
  fs.mkdirSync(path.join(dir, '.hivemind', 'designs'), { recursive: true });
  fs.copyFileSync(path.join(FIX, 'status.md'),
    path.join(dir, '.hivemind', 'status.md'));
  fs.writeFileSync(path.join(dir, '.hivemind', 'designs', 'widget.md'),
    '# widget\n');
  const rp = path.join(dir, '.hivemind', 'keeper-report.md');
  fs.copyFileSync(path.join(FIX, 'report.md'), rp);
  const r = run(['report', '--status',
    path.join(dir, '.hivemind', 'status.md'), '--report', rp]);
  assert.equal(r.code, 0, r.err);
  const after = fs.readFileSync(rp, 'utf8');
  assert.ok(after.includes('sample ask two'));
  assert.ok(!after.includes('stale ask')); // RESOLVED skip holds
  assert.match(after, /\*\*Source:\*\* `\.hivemind\/status\.md`/);
});

test('report: store with no open keeper items → fallback (transition safety)', () => {
  const dir = tmpDir();
  fs.mkdirSync(path.join(dir, '.hivemind', 'designs'), { recursive: true });
  fs.copyFileSync(path.join(FIX, 'status.md'),
    path.join(dir, '.hivemind', 'status.md'));
  fs.writeFileSync(path.join(dir, '.hivemind', 'designs', 'widget.md'),
    '# widget\n');
  const store = path.join(dir, '.hivemind', 'inbox.toon');
  seedStore(store, [{ addressee: 'po', text: 'not for the keeper',
    opened: daysAgoIso(2) }]);
  const rp = path.join(dir, '.hivemind', 'keeper-report.md');
  fs.copyFileSync(path.join(FIX, 'report.md'), rp);
  const r = run(['report', '--status',
    path.join(dir, '.hivemind', 'status.md'), '--report', rp,
    '--store', store]);
  assert.equal(r.code, 0, r.err);
  const after = fs.readFileSync(rp, 'utf8');
  assert.ok(after.includes('sample ask two')); // bullets, not store
  assert.ok(!after.includes('not for the keeper'));
  assert.match(after, /\*\*Source:\*\* `\.hivemind\/status\.md`/);
});

test('report: malformed store → structured error, nothing written', () => {
  const dir = tmpDir();
  const st = writeHandStatus(dir, '.hivemind/status.md');
  const store = path.join(dir, '.hivemind', 'inbox.toon');
  fs.mkdirSync(path.dirname(store), { recursive: true });
  fs.writeFileSync(store, 'not a field line\n');
  const rp = path.join(dir, '.hivemind', 'keeper-report.md');
  fs.copyFileSync(path.join(FIX, 'report.md'), rp);
  const before = fs.readFileSync(rp, 'utf8');
  const r = run(['report', '--status', st, '--report', rp,
    '--store', store]);
  assert.equal(r.code, 1);
  assert.match(r.err, /bee report: cannot parse/);
  assert.match(r.err, /hand-fix/);
  assert.equal(fs.readFileSync(rp, 'utf8'), before);
});

test('report: store ask matching an old zone ask merges, not duplicates', () => {
  const dir = tmpDir();
  const st = writeHandStatus(dir, '.hivemind/status.md');
  const store = path.join(dir, '.hivemind', 'inbox.toon');
  seedStore(store, [{ text: 'review the frobnicator design',
    opened: daysAgoIso(4), origin: 'status' }]);
  const rp = path.join(dir, '.hivemind', 'keeper-report.md');
  fs.writeFileSync(rp, `# Keeper report (fixture)

**Generated:** 2026-10-24 by hand · **Source:** \`.hivemind/status.md\`

Protocol line.

## Keeper's list

- keep me.

## Needs the keeper

1. [PO] 2026-10-20 — review the frobnicator design.

## Changed since last report

- change.

## Worth a sample

- sample.
`);
  const r = run(['report', '--status', st, '--report', rp,
    '--store', store]);
  assert.equal(r.code, 0, r.err);
  const zone = fs.readFileSync(rp, 'utf8')
    .split('## Needs the keeper')[1].split('##')[0];
  const hits = (zone.match(/frobnicator/g) || []).length;
  assert.equal(hits, 1); // old zone line matched the store ask, dropped
});

// ---------- migration driver (fixture) ----------
// Drives the dispatcher's live half end-to-end against fixtures:
// queue bullets → store adds (RESOLVED skipped, re-run deduped) →
// render → report derivation. Proves the shipped commands support
// the migration before it runs against the live surfaces.

test('migration driver (fixture): bullets → adds → render → report', () => {
  const dir = tmpDir();
  fs.mkdirSync(path.join(dir, '.hivemind', 'suggestions'),
    { recursive: true });
  fs.writeFileSync(path.join(dir, '.hivemind', 'suggestions', 'widget.md'),
    '# w\n');
  const st = writeHandStatus(dir, '.hivemind/status.md');
  const store = path.join(dir, '.hivemind', 'inbox.toon');

  // mechanical extraction, mirroring the plan's migration rule
  const extractQueue = (text) => {
    const bullets = [];
    let inQueue = false;
    let cur = null;
    for (const line of text.split('\n')) {
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
        cur += ' ' + line.trim(); // wrapped continuation
      }
    }
    if (cur !== null) bullets.push(cur);
    return bullets.filter((b) => !/\bRESOLVED\b/.test(b));
  };
  const norm = (s) => s.replace(/[*_`]/g, '').replace(/\s+/g, ' ')
    .trim().replace(/[.:;]+$/, '').toLowerCase();

  const migrate = () => {
    let added = 0;
    const existing = new Set();
    if (fs.existsSync(store)) {
      for (const m of fs.readFileSync(store, 'utf8')
        .matchAll(/^text: (.*)$/gm)) {
        existing.add(norm(m[1]));
      }
    }
    for (const b of extractQueue(fs.readFileSync(st, 'utf8'))) {
      if (existing.has(norm(b))) continue; // dedupe: re-run adds nothing
      const cited = /`([^`]*suggestions\/[^`]*)`/.exec(b);
      const r = run(['inbox', 'add', 'keeper', b, '--origin', 'status',
        ...(cited ? ['--ref', cited[1]] : []), '--store', store]);
      assert.equal(r.code, 0, 'driver add failed: ' + r.err);
      added++;
    }
    return added;
  };

  assert.equal(migrate(), 2); // both non-RESOLVED bullets landed
  const storeAfterFirst = fs.readFileSync(store, 'utf8');
  assert.match(storeAfterFirst, /origin: status\n/);
  assert.match(storeAfterFirst, /ref: \.hivemind\/suggestions\/widget\.md\n/);
  assert.ok(!storeAfterFirst.includes('stale ask')); // RESOLVED skipped
  assert.equal(migrate(), 0); // idempotent re-run
  assert.equal(fs.readFileSync(store, 'utf8'), storeAfterFirst);

  // render replaces the hand-written section with the region
  const rr = run(['inbox', 'render', '--store', store, '--status', st]);
  assert.equal(rr.code, 0, rr.err);
  const statusAfter = fs.readFileSync(st, 'utf8');
  assert.ok(statusAfter.includes(
    '## Awaiting keeper (rendered from inbox.toon)'));
  const reg = regionOf(statusAfter);
  assert.ok(reg.includes('first hand ask: ratify the widget design'));
  assert.ok(reg.includes('second hand ask, no citation'));
  assert.ok(!statusAfter.includes('explicit-yes queue'));
  assert.ok(statusAfter.includes(
    '## Open escalations\n\n- [PP] escalation bullet — outside the queue; must survive.'));

  // report derives every migrated ask from the store
  const rp = path.join(dir, '.hivemind', 'keeper-report.md');
  fs.copyFileSync(path.join(FIX, 'report.md'), rp);
  const rep = run(['report', '--status', st, '--report', rp,
    '--store', store]);
  assert.equal(rep.code, 0, rep.err);
  const zone = fs.readFileSync(rp, 'utf8')
    .split('## Needs the keeper')[1].split('##')[0];
  assert.ok(zone.includes('first hand ask: ratify the widget design'));
  assert.ok(zone.includes('second hand ask, no citation'));
  assert.ok(!zone.includes('stale ask'));
  assert.ok(zone.includes('IN-001'));
});
