import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, isAbsolute } from 'node:path';
import { test } from 'node:test';
import { fileIdentity } from '../artifact-utils.mjs';
import {
  assertPublishToolchain,
  assertReleaseContext,
} from '../release-context.mjs';
import {
  publishValidatedRelease,
  writeReleaseResult,
} from '../publish-release.mjs';

function environment() {
  return {
    GITHUB_ACTIONS: 'true',
    GITHUB_SERVER_URL: 'https://github.com',
    GITHUB_API_URL: 'https://api.github.com',
    GITHUB_REPOSITORY: 'superlucky84/lithent',
    GITHUB_EVENT_NAME: 'push',
    GITHUB_REF: 'refs/heads/main',
    GITHUB_REF_PROTECTED: 'true',
    GITHUB_SHA: 'a'.repeat(40),
    GITHUB_WORKFLOW_SHA: 'a'.repeat(40),
    GITHUB_WORKFLOW_REF:
      'superlucky84/lithent/.github/workflows/ci.yml@refs/heads/main',
    GITHUB_RUN_ID: '123',
    GITHUB_RUN_ATTEMPT: '2',
    RUNNER_ENVIRONMENT: 'github-hosted',
    LITHENT_RELEASE_ENVIRONMENT: 'npm',
    LITHENT_NPM_PUBLISH_ENABLED: 'true',
    ACTIONS_ID_TOKEN_REQUEST_URL:
      'https://fixture.actions.githubusercontent.com/oidc',
    ACTIONS_ID_TOKEN_REQUEST_TOKEN: 'fixture-only',
    NEEDS_JSON: JSON.stringify({
      quality: { result: 'success' },
      browser: { result: 'success' },
      gate: { result: 'success' },
    }),
  };
}

test('production entry rejects PR/fork/ref/failed-or-missing-check/runner/OIDC/token/activation mistakes before any command', async () => {
  for (const override of [
    { GITHUB_EVENT_NAME: 'pull_request' },
    { GITHUB_EVENT_NAME: 'pull_request_target' },
    { GITHUB_REPOSITORY: 'fork/lithent' },
    { GITHUB_REF: 'refs/heads/feature' },
    { GITHUB_REF: 'refs/tags/lithent@1.0.0' },
    { GITHUB_REF_PROTECTED: 'false' },
    { GITHUB_WORKFLOW_SHA: 'b'.repeat(40) },
    {
      GITHUB_WORKFLOW_REF:
        'superlucky84/lithent/.github/workflows/other.yml@refs/heads/main',
    },
    { RUNNER_ENVIRONMENT: 'self-hosted' },
    { ACTIONS_ID_TOKEN_REQUEST_TOKEN: '' },
    { LITHENT_NPM_PUBLISH_ENABLED: '' },
    { LITHENT_RELEASE_ENVIRONMENT: '' },
    { NODE_AUTH_TOKEN: 'fixture-only' },
    { NEEDS_JSON: '{}' },
    ...['quality', 'browser', 'gate'].flatMap(job =>
      ['failure', 'skipped', 'cancelled'].map(result => ({
        NEEDS_JSON: JSON.stringify({
          quality: { result: 'success' },
          browser: { result: 'success' },
          gate: { result: 'success' },
          [job]: { result },
        }),
      }))
    ),
  ]) {
    let commands = 0;
    let reads = 0;
    await assert.rejects(() =>
      publishValidatedRelease({
        repo: '/unused',
        env: { ...environment(), ...override },
        run: async () => {
          commands++;
        },
        readInputs: async () => {
          reads++;
          throw Error('Guard ran too late');
        },
      })
    );
    assert.equal(commands, 0);
    assert.equal(
      reads,
      0,
      'Context must be rejected before a later mock error can hide a missing guard'
    );
  }
  const env = { ...environment(), GITHUB_EVENT_NAME: 'workflow_dispatch' };
  assert.equal(
    assertReleaseContext({ env, needs: JSON.parse(env.NEEDS_JSON) }).attempt,
    2
  );
  for (const [node, npm] of [
    ['22.13.0', '11.9.0'],
    ['24.22.1', '11.5.0'],
    ['invalid', '11.9.0'],
  ])
    assert.throws(() => assertPublishToolchain(node, npm));
});

test('production adapter passes only the validated absolute archive to npm, with OIDC context, no scripts and empty npm config', async () => {
  const repo = await mkdtemp(join(tmpdir(), 'publish-adapter-'));
  const archivePath = join(repo, 'lithent-1.25.6.tgz');
  await writeFile(archivePath, 'validated archive bytes');
  const artifact = {
    name: 'lithent',
    version: '1.25.6',
    archive: 'lithent-1.25.6.tgz',
    archivePath,
    ...(await fileIdentity(archivePath)),
  };
  const env = {
    ...environment(),
    NPM_CONFIG_PROVENANCE: 'false',
    npm_config_ignore_scripts: 'false',
  };
  const plan = {
    schemaVersion: 1,
    status: 'ready',
    source: { revision: env.GITHUB_SHA, dirty: false },
    repository: env.GITHUB_REPOSITORY,
    registry: 'https://registry.npmjs.org',
    distTag: 'latest',
    manifestSha256: 'b'.repeat(64),
    order: ['lithent'],
    dependencies: [],
    packages: [
      { name: artifact.name, version: artifact.version, state: 'candidate' },
    ],
  };
  const planSha256 = 'c'.repeat(64);
  const proof = {
    schemaVersion: 1,
    status: 'passed',
    source: plan.source,
    planSha256,
    manifestSha256: plan.manifestSha256,
    packages: [{ name: artifact.name, version: artifact.version }],
  };
  const commands = [];
  let published = false;
  const saved = [];
  const run = async (command, args, options) => {
    commands.push([command, args]);
    assert.notEqual(options.cwd, repo);
    assert.equal(await readFile(options.env.NPM_CONFIG_USERCONFIG, 'utf8'), '');
    assert.equal(
      await readFile(options.env.NPM_CONFIG_GLOBALCONFIG, 'utf8'),
      ''
    );
    assert.equal(options.env.npm_config_ignore_scripts, undefined);
    assert.equal(options.env.NPM_CONFIG_PROVENANCE, undefined);
    assert.equal(options.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN, 'fixture-only');
    if (args[0] === '--version') return '11.9.0\n';
    assert.equal(command, 'npm');
    assert.deepEqual(args, [
      'publish',
      archivePath,
      '--access',
      'public',
      '--tag',
      'latest',
      '--provenance',
      '--ignore-scripts',
      '--registry',
      'https://registry.npmjs.org',
    ]);
    assert(isAbsolute(args[1]));
    assert.equal(await readFile(args[1], 'utf8'), 'validated archive bytes');
    published = true;
    return '';
  };
  const options = {
    repo,
    env,
    nodeVersion: '24.22.1',
    run,
    readInputs: async (_repo, _dir, settings) => {
      assert.equal(settings.revision, env.GITHUB_SHA);
      return { plan, planSha256, artifacts: new Map([['lithent', artifact]]) };
    },
    readProof: async () => proof,
    registry: {
      getVersion: async () =>
        published ? { dist: { integrity: artifact.integrity } } : null,
      getPackage: async () => ({ versions: { '1.25.5': {} } }),
    },
    persist: async value => {
      saved.push(value);
    },
  };
  await publishValidatedRelease(options);
  assert.equal(commands.length, 2);
  assert.equal(saved.at(-1).packages[0].status, 'published');
  assert.deepEqual(saved.at(-1).run, { id: '123', attempt: 2 });
  assert.equal(saved.at(-1).packages[0].artifact.integrity, artifact.integrity);
  const file = join(repo, 'receipt/result.json');
  await writeReleaseResult(file, saved.at(-1));
  assert.deepEqual(JSON.parse(await readFile(file, 'utf8')), saved.at(-1));
  await assert.rejects(
    () => publishValidatedRelease({ ...options, run: async () => '11.4.0' }),
    /requires Node/
  );
});
