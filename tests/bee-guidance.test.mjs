// AXI compliance battery for `bee guidance` (P4 Task 7) — list/show
// over docs/guidance/*.md. Read-only family: no store, no --check.
// Everything runs against --dir temp dirs (never the live topics)
// except the default-dir tests, which assert the shipped skeleton
// exists and lists.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { run } from '../bin/bee.js';

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'bee-guidance-'));
}

function tmpGuidanceDir(topics) {
  const dir = tmpDir();
  for (const [name, text] of Object.entries(topics)) {
    fs.writeFileSync(path.join(dir, name), text);
  }
  return dir;
}

const TOPIC_A = `# Topic A — the first

Purpose line of topic A.

## Core rules

- a rule
`;

const TOPIC_B = `# Topic B

A purpose line of topic B that is long enough to trip the truncation ` +
`threshold when listed without --full, well past sixty columns of text.
`;

// ---- AXI battery ----

test('help exits 0 with per-subcommand usage', () => {
  const r = run(['guidance', 'help']);
  assert.equal(r.code, 0);
  assert.match(r.out, /usage:/);
  assert.match(r.out, /bee guidance show <topic>/);
});

test('bare call lists (content first, not help)', () => {
  const dir = tmpGuidanceDir({ 'alpha.md': TOPIC_A, 'beta.md': TOPIC_B });
  const bare = run(['guidance', '--dir', dir]);
  const list = run(['guidance', 'list', '--dir', dir]);
  assert.equal(bare.code, 0);
  assert.equal(bare.out, list.out);
  assert.match(bare.out, /2 topics/);
  assert.match(bare.out, /alpha · Purpose line of topic A\./);
  // usage text is not the bare-call payload
  assert.doesNotMatch(bare.out, /usage:/);
});

test('default dir lists the shipped skeleton topics', () => {
  const r = run(['guidance']);
  assert.equal(r.code, 0);
  assert.match(r.out, /topics\n/); // aggregate header
  for (const stem of ['how-to-be-a-bee', 'cli-writing', 'tdd',
    'triage-distinction']) {
    assert.match(r.out, new RegExp(`^${stem} · `, 'm'));
  }
});

test('empty dir → definitive 0 topics + fix line', () => {
  const dir = tmpDir(); // exists, no .md files
  const r = run(['guidance', 'list', '--dir', dir]);
  assert.equal(r.code, 0);
  assert.match(r.out, /^0 topics\n/);
  assert.match(r.out, /add one: /);
});

test('missing dir → definitive 0 topics (same empty state)', () => {
  const r = run(['guidance', '--dir', path.join(tmpDir(), 'no-such')]);
  assert.equal(r.code, 0);
  assert.match(r.out, /^0 topics\n/);
});

test('unknown flag → exit 1 + usage (list and show)', () => {
  const a = run(['guidance', 'list', '--bogus']);
  assert.equal(a.code, 1);
  assert.match(a.err, /usage:/);
  const b = run(['guidance', 'show', 'alpha', '--bogus']);
  assert.equal(b.code, 1);
  assert.match(b.err, /usage:/);
});

test('unknown subcommand → exit 1 + usage', () => {
  const r = run(['guidance', 'inject']);
  assert.equal(r.code, 1);
  assert.match(r.err, /unknown subcommand 'inject'/);
  assert.match(r.err, /usage:/);
});

test('unknown topic → exit 1 + bee guidance list fix line', () => {
  const dir = tmpGuidanceDir({ 'alpha.md': TOPIC_A });
  const r = run(['guidance', 'show', 'nope', '--dir', dir]);
  assert.equal(r.code, 1);
  assert.match(r.err, /no topic nope/);
  assert.match(r.err, /bee guidance list/);
});

test('list: one-liner skips the heading; non-md files ignored', () => {
  const dir = tmpGuidanceDir(
    { 'alpha.md': TOPIC_A, 'notes.txt': 'not a topic\n' });
  const r = run(['guidance', 'list', '--dir', dir]);
  assert.equal(r.code, 0);
  assert.equal(r.out, `1 topics\n` +
    `alpha · Purpose line of topic A.\n`);
  // populated list output stays lean (AXI P1/P9 split — review r1)
});

test('truncation with size hint; --full relieves it', () => {
  const dir = tmpGuidanceDir({ 'beta.md': TOPIC_B });
  const short = run(['guidance', 'list', '--dir', dir]);
  assert.equal(short.code, 0);
  assert.match(short.out, /… \(\+\d+ chars\)/);
  const full = run(['guidance', 'list', '--full', '--dir', dir]);
  assert.equal(full.code, 0);
  assert.doesNotMatch(full.out, /… \(\+\d+ chars\)/);
  assert.match(full.out, /well past sixty columns of text\./);
});

test('show prints the topic file content', () => {
  const dir = tmpGuidanceDir({ 'alpha.md': TOPIC_A });
  const r = run(['guidance', 'show', 'alpha', '--dir', dir]);
  assert.equal(r.code, 0);
  assert.equal(r.out, TOPIC_A);
});

test('show: topic with a path separator → usage error, no traversal',
  () => {
    const dir = tmpGuidanceDir({ 'alpha.md': TOPIC_A });
    const r = run(['guidance', 'show', '../alpha', '--dir', dir]);
    assert.equal(r.code, 1);
    assert.match(r.err, /filename stem/);
    assert.match(r.err, /usage:/);
  });

test('topic with no body line shows - as its purpose', () => {
  const dir = tmpGuidanceDir({ 'bare.md': '# Only a heading\n' });
  const r = run(['guidance', 'list', '--dir', dir]);
  assert.equal(r.code, 0);
  assert.match(r.out, /^bare · -$/m);
});
