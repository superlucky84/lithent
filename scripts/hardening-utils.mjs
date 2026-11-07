import assert from 'node:assert/strict';

export function replaceOnce(source, before, after) {
  assert.equal(
    source.split(before).length - 1,
    1,
    'Mutation anchor must match exactly once'
  );
  return source.replace(before, after);
}

export function normalizeReport(report, kind) {
  if (kind === 'node') {
    assert.equal(report.schemaVersion, 1);
    assert(Array.isArray(report.tests));
    return report.tests;
  }
  assert(Array.isArray(report.testResults), 'Missing Vitest test results');
  assert.equal(
    report.numRuntimeErrorTestSuites ?? 0,
    0,
    'Vitest worker/setup failed'
  );
  return report.testResults.flatMap(file =>
    file.assertionResults.map(test => ({
      name: test.fullName ?? [...test.ancestorTitles, test.title].join(' '),
      status:
        test.status === 'passed'
          ? 'passed'
          : test.status === 'failed'
            ? 'failed'
            : 'skipped',
      assertion: test.failureMessages.some(message =>
        /AssertionError|Expected:/.test(message)
      ),
      message: test.failureMessages.join('\n'),
    }))
  );
}

export function assertBaseline(run, tests, expected) {
  assert.ifError(run.error);
  assert.equal(run.signal, null);
  assert.equal(run.code, 0, 'Normal baseline must pass');
  assert(
    tests.length > 0 && tests.every(test => test.status === 'passed'),
    'Baseline must run tests without skips'
  );
  for (const name of expected)
    assert(
      tests.some(test => name.test(test.name)),
      `Missing required assertion: ${name}`
    );
}

export function mutationOutcome(run, tests, baseline, expected) {
  assert.ifError(run.error);
  assert.equal(run.signal, null, 'A killed worker is not a detected mutation');
  assert.deepEqual(
    tests.map(test => test.name).sort(),
    baseline.map(test => test.name).sort(),
    'Mutation changed test collection'
  );
  assert(
    tests.every(test => test.status !== 'skipped'),
    'A skipped test is not a detected mutation'
  );
  if (run.code === 0 && tests.every(test => test.status === 'passed'))
    return { status: 'survived', failures: [] };
  assert.equal(run.code, 1, 'Mutation needs a normal test failure exit');
  const failures = tests.filter(
    test =>
      test.status === 'failed' && test.assertion && expected.test(test.name)
  );
  assert(
    failures.length > 0,
    'No expected assertion failed; execution/import errors do not count'
  );
  return { status: 'detected', failures: failures.map(test => test.name) };
}
