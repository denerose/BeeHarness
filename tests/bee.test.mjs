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
