import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileIdentity } from '../artifact-utils.mjs';
import { executeRelease } from '../execute-release.mjs';

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'release-executor-'));
  const artifacts = new Map();
  for (const name of ['alpha', 'beta']) {
    const archivePath = join(root, name + '.tgz');
    await writeFile(archivePath, name + ': validated bytes');
    artifacts.set(name, {
      name,
      version: '1.0.1',
      archivePath,
      ...(await fileIdentity(archivePath)),
    });
  }
  const plan = {
    schemaVersion: 1,
    status: 'ready',
    source: { revision: 'fixture-sha', dirty: false },
    manifestSha256: 'fixture-manifest',
    packages: [...artifacts.values()].map(item => ({
      name: item.name,
      version: item.version,
      state: 'candidate',
    })),
    order: ['alpha', 'beta'],
    dependencies: [
      {
        consumer: 'beta',
        name: 'alpha',
        source: 'candidate',
        version: '1.0.1',
        range: '^1.0.0',
      },
    ],
  };
  const proof = {
    schemaVersion: 1,
    status: 'passed',
    source: plan.source,
    manifestSha256: plan.manifestSha256,
    planSha256: 'fixture-plan',
    packages: plan.packages.map(({ name, version }) => ({ name, version })),
  };
  const published = new Map();
  const calls = [];
  const snapshots = [];
  const registry = {
    async getVersion(name, version) {
      return published.get(name + '@' + version) ?? null;
    },
    async getPackage(name, options) {
      assert.equal(options?.fresh, true);
      return { name, versions: { '1.0.0': {} } };
    },
  };
  const confirm = artifact =>
    published.set(artifact.name + '@' + artifact.version, {
      name: artifact.name,
      version: artifact.version,
      dist: { integrity: artifact.integrity },
    });
  const options = {
    plan,
    proof,
    planSha256: 'fixture-plan',
    artifacts,
    registry,
    publish: async artifact => {
      calls.push(artifact.name);
      confirm(artifact);
    },
    persist: async value => {
      snapshots.push(value);
    },
    wait: async () => {},
    confirmationAttempts: 2,
  };
  return { options, published, calls, snapshots, confirm };
}

test('publication uses validated bytes in dependency order, records each success, and skips identical versions on retry', async () => {
  const f = await fixture();
  const results = await executeRelease(f.options);
  assert.equal(results.status, 'passed');
  assert.deepEqual(f.calls, ['alpha', 'beta']);
  assert.deepEqual(
    results.packages.map(row => row.status),
    ['published', 'published']
  );
  assert(
    f.snapshots.some(
      snapshot =>
        snapshot.packages[0].status === 'published' &&
        snapshot.packages[1].status === 'pending'
    )
  );
  f.calls.length = 0;
  assert.deepEqual(
    (await executeRelease(f.options)).packages.map(row => row.status),
    ['skipped', 'skipped']
  );
  assert.deepEqual(f.calls, []);
});

test('partial failure is persisted, stops later publication and retries only unfinished packages', async () => {
  const f = await fixture();
  const success = f.options.publish;
  f.options.publish = async artifact => {
    if (artifact.name === 'beta') {
      f.calls.push('beta');
      throw Error('permission denied');
    }
    await success(artifact);
  };
  await assert.rejects(
    () => executeRelease(f.options),
    /Publication not confirmed.*permission denied/
  );
  assert.deepEqual(
    f.snapshots.at(-1).packages.map(row => row.status),
    ['published', 'unconfirmed']
  );
  assert.equal(f.snapshots.at(-1).status, 'failed');
  f.calls.length = 0;
  f.options.publish = success;
  await executeRelease(f.options);
  assert.deepEqual(f.calls, ['beta']);
});

test('a timeout after server acceptance is recovered only after registry integrity confirmation', async () => {
  const f = await fixture();
  const original = f.options.registry.getVersion;
  const counts = new Map();
  f.options.registry.getVersion = async (name, version) => {
    const item = await original(name, version);
    if (item && !counts.has(name)) {
      counts.set(name, 1);
      return null;
    }
    return item;
  };
  f.options.publish = async artifact => {
    f.confirm(artifact);
    throw Error('connection lost after upload');
  };
  const result = await executeRelease(f.options);
  assert(
    result.packages.every(row =>
      row.recoveredCommandError.includes('connection lost')
    )
  );
});

test('an accepted upload with a confirmation failure remains unconfirmed for source-bound recording after retry', async () => {
  for (const fault of ['HTTP 503', 'timeout', 'not yet visible']) {
    const f = await fixture();
    const read = f.options.registry.getVersion;
    f.options.registry.getVersion = async (name, version) => {
      const value = await read(name, version);
      if (value && name === 'alpha') {
        if (fault === 'not yet visible') return null;
        throw Error('Confirmation ' + fault);
      }
      return value;
    };
    await assert.rejects(() => executeRelease(f.options));
    const first = f.snapshots.at(-1);
    assert.equal(first.status, 'failed');
    assert.equal(first.packages[0].status, 'unconfirmed', fault);
    assert.equal(first.packages[0].registryIntegrity, undefined);
    assert.equal(first.packages[1].status, 'pending');
    f.options.registry.getVersion = read;
    const retry = await executeRelease(f.options);
    assert.deepEqual(
      retry.packages.map(row => row.status),
      ['skipped', 'published']
    );
    assert.deepEqual(
      f.calls,
      ['alpha', 'beta'],
      'The accepted archive must not be uploaded again'
    );
  }
});

test('a confirmed conflicting upload is failed rather than an unconfirmed recovery candidate', async () => {
  const f = await fixture();
  f.options.publish = async artifact => {
    f.published.set(artifact.name + '@' + artifact.version, {
      dist: { integrity: 'wrong bytes' },
    });
  };
  await assert.rejects(() => executeRelease(f.options), /integrity differs/);
  assert.equal(f.snapshots.at(-1).packages[0].status, 'failed');
});

test('missing/dirty/mismatched consumer evidence and changed archives prevent any publication', async () => {
  for (const mutate of [
    f => {
      f.options.proof = undefined;
    },
    f => {
      f.options.proof.planSha256 = 'other';
    },
    f => {
      f.options.proof.packages.pop();
    },
    f => {
      f.options.plan.source.dirty = true;
    },
    async f => {
      await writeFile(
        f.options.artifacts.get('alpha').archivePath,
        'different bytes'
      );
    },
  ]) {
    const f = await fixture();
    await mutate(f);
    await assert.rejects(() => executeRelease(f.options));
    assert.deepEqual(f.calls, []);
  }
});

test('registry failure, newer stable, conflicting existing bytes and unmet dependencies fail closed', async () => {
  for (const mutate of [
    f => {
      f.options.registry.getVersion = async () => {
        throw Error('Registry HTTP 503');
      };
    },
    f => {
      f.options.registry.getPackage = async () => ({
        versions: { '2.0.0': {} },
      });
    },
    f => {
      f.published.set('alpha@1.0.1', { dist: { integrity: 'different' } });
    },
    f => {
      f.options.plan.order.reverse();
      f.options.proof.packages.reverse();
    },
    f => {
      f.options.plan.dependencies[0].range = '^2.0.0';
    },
  ]) {
    const f = await fixture();
    mutate(f);
    await assert.rejects(() => executeRelease(f.options));
    assert.equal(f.snapshots.at(-1).status, 'failed');
    assert(!f.calls.includes('beta'));
  }
});

test('a successful CLI exit with missing or wrong registry bytes never reports publication success', async () => {
  for (const conflict of [false, true]) {
    const f = await fixture();
    f.options.publish = async artifact => {
      if (conflict)
        f.published.set(artifact.name + '@' + artifact.version, {
          dist: { integrity: 'wrong' },
        });
    };
    await assert.rejects(
      () => executeRelease(f.options),
      /not confirmed|integrity differs/
    );
    assert.equal(
      f.snapshots.at(-1).packages[0].status,
      conflict ? 'failed' : 'unconfirmed'
    );
    assert.equal(f.snapshots.at(-1).packages[1].status, 'pending');
  }
});
