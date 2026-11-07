import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateReleasePlan } from '../release-plan.mjs';
import {
  validateReleasePolicy,
  assertReleaseRepository,
} from '../release-policy.mjs';
import { NpmRegistry } from '../npm-registry.mjs';
import { sourceChangeAdvice } from '../release-changes.mjs';

function fixture() {
  const policy = {
    schemaVersion: 1,
    repository: 'owner/repo',
    registry: 'https://registry.npmjs.org',
    distTag: 'latest',
    prerelease: 'hold',
    packages: [
      { name: 'alpha', directory: '.', baseline: '1.0.0' },
      { name: '@demo/beta', directory: 'beta', baseline: '2.0.0' },
    ],
  };
  const packages = policy.packages.map(entry => ({
    ...entry,
    version: entry.baseline,
  }));
  const versions = new Map(
    packages.map(input => [input.name, new Set([input.version])])
  );
  const calls = [];
  const registry = {
    async getPackage(name) {
      calls.push(['package', name]);
      return {
        name,
        versions: Object.fromEntries(
          [...versions.get(name)].map(version => [version, { name, version }])
        ),
      };
    },
    async getVersion(name, version) {
      calls.push(['version', name, version]);
      return versions.get(name).has(version)
        ? { name, version, dist: { integrity: 'published-integrity' } }
        : null;
    },
  };
  const plan = () =>
    calculateReleasePlan({
      policy,
      packages,
      registry,
      source: { revision: 'fixture-sha', dirty: false },
      manifestSha256: 'fixture-manifest',
    });
  return { policy, packages, versions, calls, registry, plan };
}

test('zero bumps and missing bootstrap versions never publish; private/new/subpath workspaces do not join automatically', async () => {
  const f = fixture();
  f.versions.get('alpha').clear();
  f.packages.push(
    { name: 'private-app', version: '9.0.0', private: true },
    { name: 'new-public', version: '1.0.0' },
    { name: 'lithent-element', version: '9.0.0', private: true }
  );
  const result = await f.plan();
  assert.deepEqual(result.order, []);
  assert.equal(result.packages[0].reason, 'bootstrap-baseline');
  assert.equal(result.ignored.length, 3);
  assert.deepEqual(f.calls, []);
});

test('only the independently bumped public package becomes a candidate', async () => {
  for (const index of [0, 1]) {
    const f = fixture();
    f.packages[index].version = index ? '2.0.1' : '1.0.1';
    assert.deepEqual((await f.plan()).order, [f.packages[index].name]);
  }
  const f = fixture();
  f.packages[0].version = '1.0.1';
  f.packages[0].private = true;
  assert.deepEqual((await f.plan()).order, []);
});

test('partial success is recovered without another version diff and already-published versions are skipped', async () => {
  const f = fixture();
  f.packages[0].version = '1.0.1';
  f.packages[1].version = '2.0.1';
  f.packages[0].packed = { dependencies: { '@demo/beta': '2.0.1' } };
  assert.deepEqual((await f.plan()).order, ['@demo/beta', 'alpha']);
  f.versions.get('@demo/beta').add('2.0.1'); // The first publication succeeded, the next failed.
  const retry = await f.plan();
  assert.deepEqual(retry.order, ['alpha']);
  assert.equal(retry.packages[1].reason, 'already-published');
  assert.equal(retry.dependencies[0].source, 'registry');
  f.versions.get('alpha').add('1.0.1');
  assert.deepEqual((await f.plan()).order, []);
});

test('prerelease is held; invalid versions and downgrades fail instead of becoming candidates', async () => {
  const f = fixture();
  f.packages[0].version = '1.0.1-beta.1';
  assert.equal((await f.plan()).packages[0].reason, 'prerelease-held');
  for (const version of ['invalid', 'v1.0.1', '0.9.0']) {
    f.packages[0].version = version;
    await assert.rejects(() => f.plan());
  }
  f.packages[0].version = '1.0.1';
  f.versions.get('alpha').add('1.1.0');
  await assert.rejects(() => f.plan(), /behind published/);
});

test('packed workspace references, missing published dependencies, private dependencies, incompatible peers and cycles fail', async () => {
  for (const kind of [
    'dependencies',
    'optionalDependencies',
    'peerDependencies',
  ]) {
    const f = fixture();
    f.packages[0].version = '1.0.1';
    f.packages[0].packed = { [kind]: { '@demo/beta': 'workspace:*' } };
    await assert.rejects(() => f.plan(), /Unresolved/);
    f.packages[0].packed[kind]['@demo/beta'] = '2.0.1';
    await assert.rejects(() => f.plan(), /not published/);
    f.packages[1].version = '2.0.1';
    assert.deepEqual((await f.plan()).order, ['@demo/beta', 'alpha']);
    f.packages[0].packed[kind]['@demo/beta'] = '^3.0.0';
    await assert.rejects(() => f.plan(), /does not satisfy/);
    f.packages[0].packed[kind]['@demo/beta'] = '2.0.1';
    f.packages[1].packed = { dependencies: { alpha: '1.0.1' } };
    await assert.rejects(() => f.plan(), /Cyclic/);
  }
  const f = fixture();
  f.packages[0].version = '1.0.1';
  f.packages.push({ name: 'private-helper', private: true });
  f.packages[0].packed = { dependencies: { 'private-helper': '1.0.0' } };
  await assert.rejects(() => f.plan(), /Private workspace dependency/);
});

test('policy rejects path escape, duplicate names, unsupported registry and ambiguous baselines', () => {
  for (const change of [
    f => {
      f.policy.registry = 'https://example.org';
    },
    f => {
      f.policy.packages[0].directory = '../outside';
    },
    f => {
      f.policy.packages[1].name = 'alpha';
    },
    f => {
      f.policy.packages[0].baseline = 'v1.0.0';
    },
    f => {
      f.policy.packages[0].sourcePaths = ['../outside'];
    },
  ]) {
    const f = fixture();
    change(f);
    assert.throws(() => validateReleasePolicy(f.policy));
  }
});

test('candidate repository metadata must name the public provenance repository exactly', () => {
  for (const repository of [
    'https://github.com/owner/repo.git',
    { url: 'git+https://github.com/owner/repo.git' },
  ])
    assert.doesNotThrow(() =>
      assertReleaseRepository({ name: 'alpha', repository }, 'owner/repo')
    );
  for (const repository of [
    undefined,
    'https://example.org/owner/repo.git',
    'https://github.com/other/repo.git',
    'https://github.com/Owner/repo.git',
    'https@github.com:owner/repo.git',
  ])
    assert.throws(() =>
      assertReleaseRepository({ name: 'alpha', repository }, 'owner/repo')
    );
});

test('source advice reports unversioned owners and shared core changes without selecting or bumping them', async () => {
  const f = fixture();
  f.policy.packages[0].sourcePaths = ['src/', 'element/'];
  f.policy.packages[1].sourcePaths = ['src/', 'beta/'];
  const result = await calculateReleasePlan({
    policy: f.policy,
    packages: f.packages,
    registry: f.registry,
    source: { revision: 'fixture', dirty: false },
    changedPaths: [
      'src/shared.ts',
      'element/src/index.ts',
      'src-other/not-owned.ts',
    ],
  });
  assert.deepEqual(result.order, []);
  assert.deepEqual(
    result.sourceChanges.map(change => change.name),
    ['alpha', '@demo/beta']
  );
  assert(
    result.sourceChanges.every(change =>
      /version will not be published/.test(change.warning)
    )
  );
  assert.equal(result.sourceChanges[0].files.length, 2);
  assert.equal(result.sourceChanges[1].files.length, 1);
  assert.equal(sourceChangeAdvice(f.policy, result.packages, null), null);
});

test('registry treats only 404 as absence and rejects auth, rate limits, server errors, malformed data and timeouts', async () => {
  const response = (status, data) => ({
    status,
    ok: status === 200,
    json: async () => data,
  });
  let status = 404;
  const client = new NpmRegistry({ fetchImpl: async () => response(status) });
  assert.equal(await client.getVersion('alpha', '1.0.1'), null);
  await assert.rejects(
    () => client.getPackage('alpha'),
    /Registered package is unavailable/
  );
  for (status of [401, 403, 429, 500, 503])
    await assert.rejects(
      () => client.getVersion('alpha', '1.0.1'),
      /Registry HTTP/
    );
  for (const data of [
    { name: 'other', version: '1.0.1' },
    { name: 'alpha', version: '1.0.0' },
    null,
  ]) {
    const broken = new NpmRegistry({
      fetchImpl: async () => response(200, data),
    });
    await assert.rejects(
      () => broken.getVersion('alpha', '1.0.1'),
      /Wrong registry metadata/
    );
  }
  const timeout = new NpmRegistry({
    fetchImpl: async () => {
      throw new DOMException('timeout', 'TimeoutError');
    },
  });
  await assert.rejects(
    () => timeout.getVersion('alpha', '1.0.1'),
    /Registry unavailable/
  );
  const invalidJson = new NpmRegistry({
    fetchImpl: async () => ({
      status: 200,
      ok: true,
      json: async () => {
        throw Error('bad json');
      },
    }),
  });
  await assert.rejects(
    () => invalidJson.getVersion('alpha', '1.0.1'),
    /Invalid registry JSON/
  );
});

test('an unresponsive registry transport is aborted by the configured deadline', async () => {
  const client = new NpmRegistry({
    timeoutMs: 10,
    fetchImpl: (_url, { signal }) =>
      new Promise((_resolve, reject) => {
        const guard = setTimeout(
          () => reject(new Error('Transport did not receive an abort')),
          2000
        );
        signal.addEventListener(
          'abort',
          () => {
            clearTimeout(guard);
            reject(signal.reason);
          },
          { once: true }
        );
      }),
  });
  await assert.rejects(
    () => client.getVersion('alpha', '1.0.1'),
    error => error.cause?.name === 'TimeoutError'
  );
});
