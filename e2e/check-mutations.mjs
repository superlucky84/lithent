import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { stripVTControlCharacters } from 'node:util';

const repo = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(repo, 'test-results', 'mutations');
await mkdir(output, { recursive: true });
const cases = [
  [
    'wrong-core',
    'consumer: exact checks',
    1,
    /Wrong core: expected concurrent/,
  ],
  ['scheduler-sync', 'B-[24]/B-', 2, /Expected: ("initial:0"|true)/],
  ['hydration-rebuild', 'D-1/2/3:', 1, /data-reused/],
  ['hmr-reload', 'D-4:', 1, /Received: undefined/],
  ['jsx-flatten', 'jsx/jsxs:', 1, /Expected: "1"\nReceived: "0"/],
];

for (const [fault, grep, count, expectedError] of cases) {
  const result = spawnSync(
    process.execPath,
    [
      resolve(repo, 'node_modules/@playwright/test/cli.js'),
      'test',
      '--project=concurrent',
      '--grep',
      grep,
      '--reporter=json',
      '--output',
      resolve(output, fault),
    ],
    {
      cwd: repo,
      env: { ...process.env, LITHENT_E2E_MUTATION: fault, FORCE_COLOR: '0' },
      encoding: 'utf8',
      timeout: 120_000,
      maxBuffer: 10 * 1024 * 1024,
    }
  );
  await writeFile(resolve(output, `${fault}.json`), result.stdout || '');
  await writeFile(resolve(output, `${fault}.stderr.log`), result.stderr || '');
  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch {
    throw new Error(
      `${fault}: no valid Playwright report (${result.error || result.stderr})`
    );
  }
  const tests = [];
  function collect(suites) {
    for (const suite of suites) {
      for (const spec of suite.specs || []) tests.push(...spec.tests);
      collect(suite.suites || []);
    }
  }
  collect(report.suites || []);
  const errors = tests.map(test =>
    test.results
      .flatMap(run => run.errors || [])
      .map(error => stripVTControlCharacters(error.message || ''))
      .join('\n')
  );
  if (
    result.status !== 1 ||
    result.error ||
    report.errors?.length ||
    tests.length !== count ||
    report.stats?.unexpected !== count ||
    report.stats?.expected !== 0 ||
    report.stats?.skipped !== 0 ||
    errors.some(error => !expectedError.test(error))
  ) {
    throw new Error(
      `${fault}: expected ${count} targeted assertion failures; got ${JSON.stringify(report.stats)}\n${errors.join('\n')}`
    );
  }
  console.log(
    `PASS ${fault}: ${count} expected assertion failure(s), no skips`
  );
}
console.log('All 5 negative controls detected their injected fault.');
