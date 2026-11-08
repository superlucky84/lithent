import { spawn } from 'node:child_process';
import {
  cp,
  lstat,
  mkdir,
  mkdtemp,
  open,
  readFile,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertBaseline,
  mutationOutcome,
  normalizeReport,
  replaceOnce,
} from './hardening-utils.mjs';

const repo = fileURLToPath(new URL('../', import.meta.url));
if (process.argv.length !== 2)
  throw new Error('Usage: node scripts/check-reliability-mutations.mjs');
const parent = resolve(repo, 'artifacts/hardening');
await mkdir(parent, { recursive: true });
const output = await mkdtemp(join(parent, 'run-'));
const sandbox = await mkdtemp(join(tmpdir(), 'lithent-hardening-'));
await mkdir(join(output, 'reports'));
await mkdir(join(output, 'logs'));
for (const path of [
  'src',
  'lithentConcurrent/src',
  'lithentConcurrent/alias.js',
  'scripts',
  '.github',
  'package.json',
  'tsconfig.json',
]) {
  await mkdir(resolve(sandbox, path, '..'), { recursive: true });
  await cp(resolve(repo, path), resolve(sandbox, path), { recursive: true });
}
await symlink(
  resolve(repo, 'node_modules'),
  resolve(sandbox, 'node_modules'),
  'dir'
);
for (const core of ['base', 'concurrent']) {
  await writeFile(
    resolve(sandbox, `hardening-${core}.config.mjs`),
    `
import {defineConfig} from 'vitest/config';
import {concurrentAlias} from './lithentConcurrent/alias.js';
export default defineConfig({
 root: ${JSON.stringify(sandbox)},
 resolve: {alias: ${core === 'base' ? `[{find: '@', replacement: ${JSON.stringify(join(sandbox, 'src'))}}]` : `concurrentAlias(${JSON.stringify(join(sandbox, 'lithentConcurrent'))})`}},
 test: {environment: 'jsdom', include: ['src/tests/core-cleanupErrors.test.ts'], pool: 'forks',
   poolOptions: {forks: {singleFork: true}}}
});\n`
  );
}

const replace = (before, after) => source => replaceOnce(source, before, after);
const node = (id, file, test, expected, mutate) => ({
  id,
  file: 'scripts/' + file,
  target: { kind: 'node', test: 'scripts/tests/' + test },
  expected,
  mutate,
});
const cleanup = 'src/utils/universalRef.ts';
const cases = [];
const effectLoop = `    effects.forEach(effect => {
      try {
        effect();
      } catch (error) {
        // Finish teardown before the host error handler can reenter it.
        queueMicrotask(() => {
          try {
            reportError(error);
          } catch {
            throw error;
          }
        });
      }
    });`;
const sharedCatch = `    try {
      effects.forEach(effect => effect());
    } catch (error) {
      queueMicrotask(() => {
        try { reportError(error); } catch { throw error; }
      });
    }`;
for (const core of ['base', 'concurrent']) {
  for (const [id, expected, mutate] of [
    [
      'cleanup-shared-catch',
      /finishes remaining, nested/,
      replace(effectLoop, sharedCatch),
    ],
    [
      'cleanup-late-clear',
      /destroy reenters teardown/,
      source =>
        replaceOnce(
          replaceOnce(source, '    subInfo.umts = [];\n', ''),
          effectLoop,
          effectLoop + '\n    subInfo.umts = [];'
        ),
    ],
    [
      'cleanup-sync-report',
      /finishes remaining, nested/,
      source =>
        replaceOnce(
          replaceOnce(source, 'queueMicrotask(() => {', '(() => {'),
          '        });',
          '        })();'
        ),
    ],
    [
      'cleanup-drop-fallback',
      /throws the original error after teardown/,
      replace('            throw error;', '            return;'),
    ],
  ])
    cases.push({
      id: core + '-' + id,
      file: cleanup,
      target: { kind: 'vitest', core },
      expected,
      mutate,
    });
}
cases.push(
  node(
    'private-candidate',
    'release-plan.mjs',
    'release-plan.test.mjs',
    /only the independently bumped/,
    replace('if (input.private) {', 'if (false) {')
  ),
  node(
    'bootstrap-candidate',
    'release-plan.mjs',
    'release-plan.test.mjs',
    /zero bumps and missing bootstrap/,
    replace(
      "state: 'excluded', reason: 'bootstrap-baseline'",
      "state: 'candidate', reason: 'bootstrap-baseline'"
    )
  ),
  node(
    'stable-downgrade',
    'release-plan.mjs',
    'release-plan.test.mjs',
    /prerelease is held/,
    replace('if (newest && semver.lt(input.version, newest))', 'if (false)')
  ),
  node(
    'registry-http-as-404',
    'npm-registry.mjs',
    'release-plan.test.mjs',
    /registry treats only 404/,
    replace(
      'if (response.status === 404) return null;',
      'if (!response.ok) return null;'
    )
  ),
  node(
    'registry-no-deadline',
    'npm-registry.mjs',
    'release-plan.test.mjs',
    /unresponsive registry transport/,
    replace(
      'signal: AbortSignal.timeout(this.timeoutMs)',
      'signal: new AbortController().signal'
    )
  ),
  node(
    'artifact-size-only',
    'artifact-utils.mjs',
    'ci-artifacts.test.mjs',
    /release manifest rejects/,
    replace(
      `JSON.stringify(identity) !==
      JSON.stringify({
        size: item.size,
        sha256: item.sha256,
        integrity: item.integrity,
      })`,
      'identity.size !== item.size'
    )
  ),
  node(
    'artifact-ignore-revision',
    'artifact-utils.mjs',
    'ci-artifacts.test.mjs',
    /release manifest rejects/,
    replace('source.revision !== revision', 'false')
  ),
  node(
    'artifact-ignore-dirty',
    'artifact-utils.mjs',
    'ci-artifacts.test.mjs',
    /release manifest rejects/,
    replace('if (requireClean && source.dirty)', 'if (false)')
  ),
  node(
    'artifact-no-path-boundary',
    'artifact-utils.mjs',
    'ci-artifacts.test.mjs',
    /packed package rejects|artifact.*outside/,
    replace(
      '!inside(file) ||\n    !inside(await realpath(file)) ||',
      'false ||'
    )
  ),
  node(
    'publish-ignore-event',
    'release-context.mjs',
    'publish-release.test.mjs',
    /production entry rejects/,
    replace("env.GITHUB_EVENT_NAME !== 'workflow_dispatch'", 'false')
  ),
  node(
    'publish-ignore-ref',
    'release-context.mjs',
    'publish-release.test.mjs',
    /production entry rejects/,
    replace("env.GITHUB_REF !== 'refs/heads/main'", 'false')
  ),
  node(
    'publish-dirty-proof',
    'execute-release.mjs',
    'execute-release.test.mjs',
    /missing\/dirty\/mismatched/,
    replace('(requireClean && plan.source.dirty)', 'false')
  ),
  node(
    'publish-changed-bytes',
    'execute-release.mjs',
    'execute-release.test.mjs',
    /missing\/dirty\/mismatched/,
    replace('if (identity[key] !== artifact[key])', 'if (false)')
  ),
  node(
    'publish-failed-as-passed',
    'execute-release.mjs',
    'execute-release.test.mjs',
    /partial failure is persisted/,
    replace("results.status = 'failed';", "results.status = 'passed';")
  ),
  node(
    'publish-duplicate-version',
    'execute-release.mjs',
    'execute-release.test.mjs',
    /publication uses validated bytes/,
    replace('if (existing) {', 'if (false) {')
  ),
  node(
    'tag-unconfirmed-versions',
    'record-release.mjs',
    'record-release.test.mjs',
    /zero confirmed publications/,
    replace(
      "if (!['published', 'unconfirmed'].includes(row.status)) continue;",
      'if (false) continue;'
    )
  ),
  node(
    'tag-ignore-receipt-sha',
    'record-release.mjs',
    'record-release.test.mjs',
    /receipt run\/SHA\/content/,
    replace('receipt.source?.revision !== plan.source.revision', 'false')
  ),
  node(
    'publish-drop-unconfirmed-outcome',
    'execute-release.mjs',
    'execute-release.test.mjs',
    /accepted upload with a confirmation failure/,
    replace(
      "row.status = awaitingConfirmation ? 'unconfirmed' : 'failed';",
      "row.status = 'failed';"
    )
  ),
  node(
    'publish-short-visibility-window',
    'npm-registry.mjs',
    'execute-release.test.mjs',
    /npm serves over a minute after upload/,
    replace('attempts: 31,', 'attempts: 6,')
  ),
  node(
    'publish-conflict-as-unconfirmed',
    'execute-release.mjs',
    'execute-release.test.mjs',
    /confirmed conflicting upload/,
    replace(
      '      awaitingConfirmation = false;',
      '      awaitingConfirmation = true;'
    )
  ),
  node(
    'tag-drop-unconfirmed-recovery',
    'record-release.mjs',
    'record-release.test.mjs',
    /unconfirmed original attempts recover/,
    replace(
      "['published', 'unconfirmed'].includes(row.status)",
      "['published'].includes(row.status)"
    )
  ),
  node(
    'tag-hide-unconfirmed-failure',
    'record-release.mjs',
    'record-release.test.mjs',
    /unconfirmed registry errors/,
    replace("row.status = 'failed';", "row.status = 'ignored';")
  )
);
for (const [id, expected, before, after] of [
  [
    'ci-drop-browsers',
    /actual workflow permits/,
    'browser: [chromium, firefox, webkit]',
    'browser: [chromium]',
  ],
  [
    'ci-ignore-gate',
    /actual workflow permits/,
    "needs.quality.result == 'success' && needs.browser.result == 'success' && needs.gate.result == 'success'",
    "needs.quality.result == 'success' && needs.browser.result == 'success'",
  ],
  [
    'ci-pr-write-token',
    /workflow wiring keeps/,
    'permissions:\n  contents: read',
    'permissions:\n  contents: read\n  id-token: write',
  ],
  [
    'ci-cancel-main',
    /actual workflow permits/,
    "cancel-in-progress: ${{ github.event_name == 'pull_request' }}",
    'cancel-in-progress: true',
  ],
  [
    'ci-publish-on-push',
    /actual workflow permits/,
    "      github.ref == 'refs/heads/main' &&\n      github.event_name == 'workflow_dispatch' &&",
    "      github.ref == 'refs/heads/main' &&\n      (github.event_name == 'push' || github.event_name == 'workflow_dispatch') &&",
  ],
  [
    'ci-record-on-push',
    /actual workflow permits/,
    "&& github.ref == 'refs/heads/main' &&\n      github.event_name == 'workflow_dispatch' &&",
    "&& github.ref == 'refs/heads/main' &&\n      (github.event_name == 'push' || github.event_name == 'workflow_dispatch') &&",
  ],
])
  cases.push({
    id,
    file: '.github/workflows/ci.yml',
    target: { kind: 'node', test: 'scripts/tests/release-workflow.test.mjs' },
    expected,
    mutate: replace(before, after),
  });

const originals = new Map();
for (const item of cases)
  if (!originals.has(item.file))
    originals.set(item.file, await readFile(resolve(repo, item.file), 'utf8'));
const digest = text => createHash('sha256').update(text).digest('hex');
const summary = {
  schemaVersion: 1,
  status: 'running',
  sandbox,
  baselines: [],
  mutations: [],
  inputSources: Object.fromEntries(
    [...originals].map(([file, source]) => [file, digest(source)])
  ),
};
const save = () =>
  writeFile(
    join(output, 'summary.json'),
    JSON.stringify(summary, null, 2) + '\n'
  );
async function run(target, id) {
  const reportPath = join(output, 'reports', id + '.json');
  const logPath = join(output, 'logs', id + '.log');
  const args =
    target.kind === 'node'
      ? [
          '--test',
          '--test-isolation=none',
          '--test-reporter=./scripts/hardening-node-reporter.mjs',
          '--test-reporter-destination=' + reportPath,
          target.test,
        ]
      : [
          resolve(repo, 'node_modules/vitest/vitest.mjs'),
          'run',
          '--config',
          `hardening-${target.core}.config.mjs`,
          '--reporter=json',
          '--outputFile=' + reportPath,
        ];
  const log = await open(logPath, 'w');
  const result = await new Promise(accept => {
    const child = spawn(process.execPath, args, {
      cwd: sandbox,
      stdio: ['ignore', log.fd, log.fd],
      env: {
        ...process.env,
        FORCE_COLOR: '0',
        VITEST_MAX_FORKS: '1',
        VITEST_MIN_FORKS: '1',
        VITEST_MAX_THREADS: '1',
        VITEST_MIN_THREADS: '1',
      },
      detached: process.platform !== 'win32',
    });
    let error;
    const timer = setTimeout(() => {
      error = new Error(
        'Hardening worker exceeded 90s; timeout is not mutation detection'
      );
      if (process.platform === 'win32') child.kill('SIGKILL');
      else process.kill(-child.pid, 'SIGKILL');
    }, 90_000);
    child.on('error', value => {
      error = value;
    });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      accept({ code, signal, error });
    });
  });
  await log.close();
  if (result.error || result.signal)
    throw result.error ?? new Error(`Worker signal: ${result.signal}`);
  const tests = normalizeReport(
    JSON.parse(await readFile(reportPath, 'utf8')),
    target.kind
  );
  return { result, tests, reportPath, logPath };
}
const key = target => (target.kind === 'node' ? target.test : target.core);
const baselines = new Map();
await save();
try {
  for (const item of cases) {
    if (baselines.has(key(item.target))) continue;
    const id = 'baseline-' + key(item.target).replaceAll('/', '-');
    const result = await run(item.target, id);
    assertBaseline(
      result.result,
      result.tests,
      cases
        .filter(other => key(other.target) === key(item.target))
        .map(other => other.expected)
    );
    baselines.set(key(item.target), result.tests);
    summary.baselines.push({
      target: key(item.target),
      tests: result.tests.length,
      status: 'passed',
    });
    console.log(
      `PASS baseline ${key(item.target)}: ${result.tests.length} tests, skip 0`
    );
    await save();
  }
  for (const item of cases) {
    const file = resolve(sandbox, item.file);
    const row = { id: item.id, file: item.file, status: 'running' };
    summary.mutations.push(row);
    try {
      if (!(await lstat(file)).isFile())
        throw new Error('Mutation target must be a copied regular file');
      await writeFile(file, item.mutate(originals.get(item.file)));
      const result = await run(item.target, item.id);
      Object.assign(
        row,
        mutationOutcome(
          result.result,
          result.tests,
          baselines.get(key(item.target)),
          item.expected
        ),
        { report: result.reportPath, log: result.logPath }
      );
      console.log(
        `${row.status === 'detected' ? 'PASS' : 'FAIL'} ${item.id}: ${row.status}`
      );
    } catch (error) {
      row.status = 'error';
      row.error = error.message;
      throw error;
    } finally {
      await writeFile(file, originals.get(item.file));
      await save();
    }
  }
  summary.status = summary.mutations.every(row => row.status === 'detected')
    ? 'passed'
    : 'failed';
} catch (error) {
  summary.status = 'failed';
  summary.error = error.message;
  console.error(error.message);
} finally {
  summary.workingTreeSourcesUnchanged = true;
  for (const [file, source] of originals)
    if (
      digest(await readFile(resolve(repo, file), 'utf8')) !== digest(source)
    ) {
      summary.status = 'failed';
      summary.workingTreeSourcesUnchanged = false;
      summary.error = `Working tree source changed during hardening: ${file}`;
    }
  await save();
}
console.log(`Hardening report: ${join(output, 'summary.json')}`);
if (summary.status !== 'passed') process.exitCode = 1;
