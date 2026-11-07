import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  assertBaseline,
  mutationOutcome,
  normalizeReport,
  replaceOnce,
} from '../hardening-utils.mjs';

const baseline = [
  { name: 'required public behavior', status: 'passed' },
  { name: 'other behavior', status: 'passed' },
];
const goodRun = { code: 0, signal: null };
const failedRun = { code: 1, signal: null };
const broken = () => [
  { ...baseline[0], status: 'failed', assertion: true },
  baseline[1],
];

test('mutation harness accepts an observed assertion failure and reports an undetected defect as survived', () => {
  assert.doesNotThrow(() =>
    assertBaseline(goodRun, baseline, [/required public/])
  );
  assert.deepEqual(
    mutationOutcome(failedRun, broken(), baseline, /required public/),
    {
      status: 'detected',
      failures: ['required public behavior'],
    }
  );
  assert.equal(
    mutationOutcome(goodRun, baseline, baseline, /required/).status,
    'survived'
  );
});

test('mutation harness refuses process/import/collection/skip failures as evidence of detection', () => {
  for (const run of [
    { code: 2, signal: null },
    { code: 1, signal: 'SIGKILL' },
    { ...failedRun, error: Error('spawn EPERM') },
  ])
    assert.throws(() => mutationOutcome(run, broken(), baseline, /required/));
  for (const result of [
    [],
    [{ name: 'failed to load module', status: 'failed', assertion: false }],
    [{ ...baseline[0], status: 'failed', assertion: false }, baseline[1]],
    [
      { ...baseline[0], status: 'skipped' },
      { ...baseline[1], status: 'failed', assertion: true },
    ],
    [baseline[0], { ...baseline[1], status: 'failed', assertion: true }],
  ])
    assert.throws(() =>
      mutationOutcome(failedRun, result, baseline, /required/)
    );
});

test('mutation baseline requires success, nonzero tests, no skips and every expected public behavior', () => {
  for (const result of [[], broken(), [{ ...baseline[0], status: 'skipped' }]])
    assert.throws(() => assertBaseline(goodRun, result, [/required/]));
  assert.throws(() => assertBaseline(failedRun, baseline, [/required/]));
  assert.throws(() => assertBaseline(goodRun, baseline, [/missing behavior/]));
});

test('mutation edits must hit a unique source anchor and report parsing must retain assertion evidence', () => {
  assert.equal(
    replaceOnce('before target after', 'target', 'fault'),
    'before fault after'
  );
  for (const source of ['missing', 'target target'])
    assert.throws(() => replaceOnce(source, 'target', 'fault'));
  const report = {
    testResults: [
      {
        assertionResults: [
          {
            title: 'required behavior',
            ancestorTitles: ['public'],
            status: 'failed',
            failureMessages: ['AssertionError: expected later cleanup to run'],
          },
        ],
      },
    ],
    numRuntimeErrorTestSuites: 0,
  };
  assert.equal(normalizeReport(report, 'vitest')[0].assertion, true);
  assert.throws(() =>
    normalizeReport({ ...report, numRuntimeErrorTestSuites: 1 }, 'vitest')
  );
  assert.throws(() => normalizeReport({}, 'node'));
});
