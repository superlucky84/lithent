import assert from 'node:assert/strict';
import { test } from 'node:test';
import { recordReleaseResults } from '../record-release.mjs';
import { GitHubReleaseApi } from '../github-release-api.mjs';

function fixture() {
  const source = { revision: 'a'.repeat(40), dirty: false };
  const items = ['lithent', '@lithent/hmr-parser'].map((name, index) => ({
    name,
    version: '1.0.1',
    archive: 'package-' + index + '.tgz',
    size: 10,
    sha256: String(index).repeat(64),
    integrity: 'sha512-fixture-' + index,
  }));
  const inputs = {
    plan: {
      source,
      repository: 'superlucky84/lithent',
      packages: items.map(item => ({
        name: item.name,
        version: item.version,
        baseline: '1.0.0',
      })),
    },
    artifacts: new Map(items.map(item => [item.name, item])),
  };
  const row = item => ({
    name: item.name,
    version: item.version,
    status: 'published',
    registryIntegrity: item.integrity,
    artifact: Object.fromEntries(
      ['archive', 'size', 'sha256', 'integrity'].map(field => [
        field,
        item[field],
      ])
    ),
  });
  const receipt = {
    schemaVersion: 1,
    repository: inputs.plan.repository,
    run: { id: '123', attempt: 1 },
    source,
    status: 'failed',
    planSha256: 'b'.repeat(64),
    manifestSha256: 'c'.repeat(64),
    packages: items.map(row),
  };
  const tags = new Map();
  const calls = [];
  const snapshots = [];
  const github = {
    async ensureTag(tag, sha) {
      calls.push(['tag', tag, sha]);
      if (tags.has(tag) && tags.get(tag) !== sha) throw Error('Tag conflict');
      const state = tags.has(tag) ? 'existing' : 'created';
      tags.set(tag, sha);
      return state;
    },
    async dispatchDocs(tag, sha) {
      calls.push(['docs', tag, sha]);
    },
  };
  const options = {
    inputs,
    receipts: [receipt],
    runId: '123',
    github,
    registry: {
      getVersion: async name => ({
        dist: { integrity: inputs.artifacts.get(name).integrity },
      }),
    },
    persist: async value => {
      snapshots.push(value);
    },
  };
  return { items, receipt, options, calls, tags, snapshots };
}

test('partial publication receipts tag only confirmed packages, and aggregate original successes across rerun attempts', async () => {
  const f = fixture();
  f.receipt.packages[1].status = 'failed';
  const retry = structuredClone(f.receipt);
  retry.run.attempt = 2;
  retry.status = 'passed';
  retry.packages[0].status = 'skipped';
  retry.packages[1].status = 'published';
  f.options.receipts.push(retry);
  const results = await recordReleaseResults(f.options);
  assert.equal(results.status, 'passed');
  assert.equal(results.packages.length, 2);
  assert.deepEqual(f.calls, [
    ['tag', 'lithent@1.0.1', 'a'.repeat(40)],
    ['docs', 'lithent@1.0.1', 'a'.repeat(40)],
    ['tag', '@lithent/hmr-parser@1.0.1', 'a'.repeat(40)],
  ]);
  assert.equal(results.packages[0].docsDispatch, 'accepted');
  assert.equal(
    (await recordReleaseResults(f.options)).packages[0].tagResult,
    'existing'
  );
});

test('unconfirmed original attempts recover tags and docs even when the retry only skips the existing version', async () => {
  const f = fixture();
  f.receipt.packages[0].status = 'unconfirmed';
  delete f.receipt.packages[0].registryIntegrity;
  const retry = structuredClone(f.receipt);
  retry.run.attempt = 2;
  retry.status = 'passed';
  retry.packages.forEach(row => {
    row.status = 'skipped';
  });
  f.options.receipts.push(retry);
  const result = await recordReleaseResults(f.options);
  assert.equal(result.packages.length, 2);
  assert.equal(result.packages[0].recoveredUnconfirmed, true);
  assert.equal(result.packages[0].docsDispatch, 'accepted');
  assert.deepEqual(f.calls[0], ['tag', 'lithent@1.0.1', 'a'.repeat(40)]);
  assert.equal(f.tags.size, 2);
  const confirmed = structuredClone(f.receipt);
  confirmed.run.attempt = 3;
  confirmed.packages[0].status = 'published';
  confirmed.packages[0].registryIntegrity = f.items[0].integrity;
  f.options.receipts.push(confirmed);
  for (const receipts of [
    f.options.receipts,
    [...f.options.receipts].reverse(),
  ]) {
    const preferred = await recordReleaseResults({ ...f.options, receipts });
    assert.equal(preferred.packages[0].recoveredUnconfirmed, undefined);
    assert.equal(preferred.packages[0].tagResult, 'existing');
  }
});

test('unconfirmed registry errors, missing versions and conflicting bytes fail visibly while independent successes are recorded', async () => {
  for (const fault of ['HTTP 503', 'missing', 'conflict']) {
    const f = fixture();
    f.receipt.packages[0].status = 'unconfirmed';
    delete f.receipt.packages[0].registryIntegrity;
    const read = f.options.registry.getVersion;
    f.options.registry.getVersion = async name => {
      if (name !== 'lithent') return read(name);
      if (fault === 'HTTP 503') throw Error('Registry HTTP 503');
      return fault === 'missing'
        ? null
        : { dist: { integrity: 'other bytes' } };
    };
    await assert.rejects(
      () => recordReleaseResults(f.options),
      /recording failed/
    );
    const result = f.snapshots.at(-1);
    assert.equal(result.status, 'failed');
    assert.equal(result.packages[0].status, 'failed');
    assert.equal(result.packages[1].status, 'tagged');
    assert(!f.calls.some(call => call[0] === 'docs'));
    assert(!f.tags.has('lithent@1.0.1'));
    f.options.registry.getVersion = read;
    const retry = await recordReleaseResults(f.options);
    assert.equal(retry.packages[0].recoveredUnconfirmed, true);
    assert.equal(retry.packages[1].tagResult, 'existing');
  }
});

test('unconfirmed recovery rejects other runs, sources and archives before any tag or docs write', async () => {
  for (const mutate of [
    f => {
      f.receipt.run.id = 'another-run';
    },
    f => {
      f.receipt.source = { revision: 'b'.repeat(40), dirty: false };
    },
    f => {
      f.receipt.source = { revision: 'a'.repeat(40), dirty: true };
    },
    f => {
      f.receipt.packages[0].artifact.sha256 = 'other';
    },
    f => {
      f.receipt.packages[0].artifact.integrity = 'other';
    },
    f => {
      f.receipt.packages[0].version = '1.0.2';
    },
  ]) {
    const f = fixture();
    f.receipt.packages[0].status = 'unconfirmed';
    delete f.receipt.packages[0].registryIntegrity;
    mutate(f);
    await assert.rejects(() => recordReleaseResults(f.options));
    assert.deepEqual(f.calls, []);
  }
});

test('receipt run/SHA/content/version mismatches prevent all tag and docs writes', async () => {
  for (const mutate of [
    f => {
      f.receipt.run.id = 'other';
    },
    f => {
      f.receipt.source.revision = 'b'.repeat(40);
      f.options.inputs.plan.source = { revision: 'a'.repeat(40), dirty: false };
    },
    f => {
      f.receipt.source.dirty = true;
    },
    f => {
      f.receipt.packages[0].registryIntegrity = 'other';
    },
    f => {
      f.receipt.packages[0].artifact.sha256 = 'other';
    },
    f => {
      f.receipt.packages[0].version = '1.0.2';
    },
    f => {
      f.receipt.packages[0].name = 'private-workspace';
    },
    f => {
      f.receipt.repository = 'fork/lithent';
    },
  ]) {
    const f = fixture();
    mutate(f);
    await assert.rejects(() => recordReleaseResults(f.options));
    assert.deepEqual(f.calls, []);
  }
});

test('tag conflict or registry mismatch fails visibly while independent confirmed packages still get recorded', async () => {
  for (const conflict of [false, true]) {
    const f = fixture();
    if (conflict) f.tags.set('lithent@1.0.1', 'b'.repeat(40));
    else
      f.options.registry.getVersion = async name => ({
        dist: {
          integrity: name === 'lithent' ? 'wrong' : f.items[1].integrity,
        },
      });
    await assert.rejects(
      () => recordReleaseResults(f.options),
      /recording failed/
    );
    assert.equal(f.snapshots.at(-1).status, 'failed');
    assert.equal(f.snapshots.at(-1).packages[0].status, 'failed');
    assert.equal(f.snapshots.at(-1).packages[1].status, 'tagged');
    assert(!f.calls.some(call => call[0] === 'docs'));
  }
});

test('docs dispatch failure is retained separately from tag creation and can be retried without moving tags', async () => {
  const f = fixture();
  f.options.github.dispatchDocs = async () => {
    throw Error('GitHub HTTP 403');
  };
  await assert.rejects(() => recordReleaseResults(f.options));
  assert.equal(f.snapshots.at(-1).packages[0].tagResult, 'created');
  assert.match(f.snapshots.at(-1).packages[0].error, /403/);
  f.options.github.dispatchDocs = async () => {};
  assert.equal(
    (await recordReleaseResults(f.options)).packages[0].tagResult,
    'existing'
  );
});

test('zero confirmed publications never create tags or dispatch docs', async () => {
  for (const status of ['skipped', 'pending', 'failed', 'publishing']) {
    const f = fixture();
    f.receipt.packages.forEach(row => {
      row.status = status;
    });
    assert.equal((await recordReleaseResults(f.options)).packages.length, 0);
    assert.deepEqual(f.calls, []);
  }
});

test('GitHub adapter confirms scoped/annotated tags, never forces conflicts, and explicitly dispatches docs at the publication SHA', async () => {
  const requests = [];
  let reference = null;
  const revision = 'a'.repeat(40);
  const api = new GitHubReleaseApi({
    repository: 'superlucky84/lithent',
    token: 'fixture-only',
    fetchImpl: async (url, options) => {
      requests.push({
        url,
        method: options.method,
        body: options.body && JSON.parse(options.body),
      });
      const data = options.method === 'GET' ? reference : {};
      if (options.method === 'POST' && url.endsWith('/git/refs'))
        reference = {
          object: { type: 'commit', sha: JSON.parse(options.body).sha },
        };
      const status =
        options.method === 'GET' && !data
          ? 404
          : url.endsWith('/dispatches')
            ? 204
            : 200;
      return { status, ok: status < 400, json: async () => data };
    },
  });
  assert.equal(
    await api.ensureTag('@lithent/hmr-parser@0.2.4', revision),
    'created'
  );
  assert.equal(
    await api.ensureTag('@lithent/hmr-parser@0.2.4', revision),
    'existing'
  );
  await assert.rejects(
    () => api.ensureTag('@lithent/hmr-parser@0.2.4', 'b'.repeat(40)),
    /another SHA/
  );
  await api.dispatchDocs('lithent@1.25.6', revision);
  assert.equal(
    requests.filter(request => request.url.endsWith('/git/refs')).length,
    1
  );
  assert(
    requests.some(request =>
      request.url.includes('/git/ref/tags/%40lithent/hmr-parser%400.2.4')
    )
  );
  assert.deepEqual(requests.at(-1).body, {
    ref: 'lithent@1.25.6',
    inputs: { release_sha: revision },
  });
  assert(requests.every(request => request.method !== 'PATCH'));
  const annotated = new GitHubReleaseApi({
    repository: 'superlucky84/lithent',
    token: 'fixture-only',
    fetchImpl: async url => ({
      status: 200,
      ok: true,
      json: async () => ({
        object: {
          type: url.includes('/git/tags/') ? 'commit' : 'tag',
          sha: revision,
        },
      }),
    }),
  });
  assert.equal(await annotated.tagCommit('lithent@1.25.6'), revision);
});
