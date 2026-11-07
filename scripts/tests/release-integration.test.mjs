import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, readFile, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import semver from 'semver';
import { fileIdentity, readJson, sourceIdentity } from '../artifact-utils.mjs';
import { calculateReleasePlan } from '../release-plan.mjs';
import { releasePolicy } from '../release-packages.mjs';
import { readReleaseInputs } from '../release-inputs.mjs';
import { verifyPlanConsumers } from '../verify-plan-consumers.mjs';
import { publishValidatedRelease } from '../publish-release.mjs';
import { recordReleaseResults } from '../record-release.mjs';

// Synthetic packages exercise the complete release protocol. Actual Lithent
// exports, types and transforms are checked separately by verify:release.
async function fixture(t, bumped) {
  const root = await mkdtemp(join(tmpdir(), 'lithent-release-integration-'));
  const project = fileURLToPath(new URL('../../', import.meta.url));
  const directory = join(root, 'artifacts/release');
  await mkdir(directory, { recursive: true });
  await mkdir(join(root, '.github'));
  await writeFile(
    join(root, '.github/release-policy.json'),
    await readFile(join(project, '.github/release-policy.json'))
  );
  await writeFile(
    join(root, '.gitignore'),
    'artifacts/\nunpack/\nnode_modules\n'
  );
  await symlink(
    join(project, 'node_modules'),
    join(root, 'node_modules'),
    'dir'
  );
  const packages = [];
  const items = [];
  const versions = new Map();
  for (const entry of releasePolicy.packages) {
    const version = bumped.includes(entry.name)
      ? semver.inc(entry.baseline, 'patch')
      : entry.baseline;
    const dependencies =
      entry.name === 'lithent-concurrent' && bumped.includes(entry.name)
        ? { lithent: semver.inc(releasePolicy.packages[0].baseline, 'patch') }
        : {};
    const metadata = {
      name: entry.name,
      version,
      type: 'module',
      dependencies,
      repository: {
        type: 'git',
        url: 'https://github.com/' + releasePolicy.repository + '.git',
      },
      exports: {
        '.': {
          import: { types: './index.d.ts', default: './index.mjs' },
          require: { types: './index.d.cts', default: './index.cjs' },
        },
      },
    };
    await mkdir(join(root, entry.directory), { recursive: true });
    await writeFile(
      join(root, entry.directory, 'package.json'),
      JSON.stringify(metadata)
    );
    const unpack = join(root, 'unpack', entry.name.replaceAll('/', '-'));
    await mkdir(join(unpack, 'package'), { recursive: true });
    await writeFile(
      join(unpack, 'package/package.json'),
      JSON.stringify(metadata)
    );
    await writeFile(
      join(unpack, 'package/index.mjs'),
      dependencies.lithent
        ? "export {value} from 'lithent';"
        : `export const value = ${JSON.stringify(entry.name)};`
    );
    await writeFile(
      join(unpack, 'package/index.cjs'),
      dependencies.lithent
        ? "module.exports = require('lithent');"
        : `exports.value = ${JSON.stringify(entry.name)};`
    );
    for (const extension of ['ts', 'cts'])
      await writeFile(
        join(unpack, 'package/index.d.' + extension),
        'export declare const value: string;'
      );
    const archive =
      entry.name.replace(/^@/, '').replaceAll('/', '-') +
      '-' +
      version +
      '.tgz';
    execFileSync('tar', ['-czf', join(directory, archive), 'package'], {
      cwd: unpack,
    });
    const item = {
      name: entry.name,
      version,
      archive,
      ...(await fileIdentity(join(directory, archive))),
    };
    items.push(item);
    packages.push({
      ...metadata,
      directory: entry.directory,
      packed: metadata,
      artifact: item,
    });
    versions.set(
      entry.name,
      new Map([[entry.baseline, { name: entry.name, version: entry.baseline }]])
    );
  }
  const git = args => execFileSync('git', args, { cwd: root, stdio: 'pipe' });
  git(['init', '-q']);
  git(['add', '.']);
  git([
    '-c',
    'user.name=Release Integration',
    '-c',
    'user.email=fixture@example.invalid',
    'commit',
    '-qm',
    'synthetic release source',
  ]);
  const source = sourceIdentity(root);
  assert.equal(source.dirty, false);
  await writeFile(
    join(directory, 'manifest.json'),
    JSON.stringify({ schemaVersion: 1, source, packages: items })
  );
  let outage = false;
  const confirmationFaults = new Set();
  const registry = {
    async getPackage(name) {
      return { name, versions: Object.fromEntries(versions.get(name)) };
    },
    async getVersion(name, version) {
      if (outage && name === 'lithent-concurrent')
        throw Error('simulated registry outage after rejected upload');
      if (confirmationFaults.has(name) && versions.get(name).has(version))
        throw Error(
          'simulated registry confirmation outage after accepted upload'
        );
      return versions.get(name).get(version) ?? null;
    },
  };
  const server = createServer(async (request, response) => {
    try {
      if (request.method !== 'GET') {
        response.statusCode = 405;
        response.end();
        return;
      }
      const path = new URL(request.url, 'http://localhost').pathname;
      if (path.startsWith('/tar/')) {
        const [encoded, filename] = path.slice(5).split('/');
        const name = decodeURIComponent(encoded);
        const item = items.find(
          item => item.name === name && item.version + '.tgz' === filename
        );
        if (!item) {
          response.statusCode = 404;
          response.end();
          return;
        }
        response.end(await readFile(join(directory, item.archive)));
        return;
      }
      const name = decodeURIComponent(path.slice(1));
      if (!versions.has(name)) {
        response.statusCode = 404;
        response.end('{}');
        return;
      }
      const entries = Object.fromEntries(
        [...versions.get(name)].map(([version, metadata]) => [
          version,
          {
            ...metadata,
            dist: {
              integrity: items.find(
                item => item.name === name && item.version === version
              )?.integrity,
              tarball: `http://127.0.0.1:${server.address().port}/tar/${encodeURIComponent(name)}/${version}.tgz`,
            },
          },
        ])
      );
      response.setHeader('content-type', 'application/json');
      response.end(
        JSON.stringify({
          name,
          versions: entries,
          'dist-tags': { latest: semver.rsort(Object.keys(entries))[0] },
        })
      );
    } catch (error) {
      response.statusCode = 500;
      response.end(error.message);
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const prepare = async () => {
    const plan = await calculateReleasePlan({
      policy: releasePolicy,
      packages,
      registry,
      source,
      manifestSha256: (await fileIdentity(join(directory, 'manifest.json')))
        .sha256,
    });
    plan.policySha256 = (
      await fileIdentity(join(root, '.github/release-policy.json'))
    ).sha256;
    await writeFile(
      join(root, 'artifacts/release-plan.json'),
      JSON.stringify(plan)
    );
    const inputs = await readReleaseInputs(root, directory, {
      revision: source.revision,
    });
    const consumers = await verifyPlanConsumers({
      repo: root,
      ...inputs,
      registry: `http://127.0.0.1:${server.address().port}`,
    });
    await writeFile(
      join(root, 'artifacts/release-consumers.json'),
      JSON.stringify({
        schemaVersion: 1,
        status: 'passed',
        source,
        planSha256: inputs.planSha256,
        manifestSha256: plan.manifestSha256,
        packages: consumers.map(({ name, version }) => ({ name, version })),
      })
    );
    return inputs;
  };
  const calls = [];
  let rejectConcurrent = false;
  const publish = attempt =>
    publishValidatedRelease({
      repo: root,
      registry,
      env: {
        GITHUB_ACTIONS: 'true',
        GITHUB_SERVER_URL: 'https://github.com',
        GITHUB_API_URL: 'https://api.github.com',
        GITHUB_REPOSITORY: releasePolicy.repository,
        GITHUB_EVENT_NAME: 'push',
        GITHUB_REF: 'refs/heads/main',
        GITHUB_REF_PROTECTED: 'true',
        GITHUB_SHA: source.revision,
        GITHUB_WORKFLOW_SHA: source.revision,
        GITHUB_WORKFLOW_REF:
          releasePolicy.repository +
          '/.github/workflows/ci.yml@refs/heads/main',
        GITHUB_RUN_ID: '9001',
        GITHUB_RUN_ATTEMPT: String(attempt),
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
      },
      run: async (command, args) => {
        assert.equal(command, 'npm');
        if (args[0] === '--version') return '11.9.0';
        assert.equal(args[0], 'publish');
        const item = items.find(
          item => join(directory, item.archive) === args[1]
        );
        assert(item);
        assert.deepEqual(await fileIdentity(args[1]), {
          size: item.size,
          sha256: item.sha256,
          integrity: item.integrity,
        });
        calls.push(item.name);
        if (rejectConcurrent && item.name === 'lithent-concurrent') {
          outage = true;
          throw Error('simulated rejected upload');
        }
        versions.get(item.name).set(item.version, {
          name: item.name,
          version: item.version,
          dist: { integrity: item.integrity },
        });
        return '';
      },
    });
  const tags = new Map();
  const docs = [];
  const record = (inputs, receipts) =>
    recordReleaseResults({
      inputs,
      receipts,
      runId: '9001',
      registry,
      github: {
        ensureTag: async (tag, sha) => {
          if (tags.has(tag)) {
            assert.equal(tags.get(tag), sha);
            return 'existing';
          }
          tags.set(tag, sha);
          return 'created';
        },
        dispatchDocs: async (tag, sha) => {
          docs.push({ tag, sha });
        },
      },
      persist: async () => {},
    });
  return {
    root,
    source,
    prepare,
    publish,
    calls,
    tags,
    docs,
    record,
    receipt: () => readJson(join(root, 'artifacts/release-results.json')),
    rejectNextConcurrent: () => {
      rejectConcurrent = true;
    },
    loseNextConfirmation: name => {
      confirmationFaults.add(name);
    },
    recover: () => {
      rejectConcurrent = false;
      outage = false;
      confirmationFaults.clear();
    },
  };
}

test('one independently bumped package completes actual fixture installation, validated publication and source-bound recording', async t => {
  const name = '@lithent/lithent-template-parser';
  const f = await fixture(t, [name]);
  const inputs = await f.prepare();
  assert.deepEqual(inputs.plan.order, [name]);
  await f.publish(1);
  const receipt = await f.receipt();
  assert.equal(receipt.status, 'passed');
  assert.equal(receipt.packages.length, 1);
  await f.record(inputs, [receipt]);
  assert.deepEqual(f.calls, [name]);
  assert.equal(f.tags.size, 1);
  assert.deepEqual(f.docs, []);
  assert.equal(sourceIdentity(f.root).dirty, false);
});

test('multiple bumps recover a partial publication without a new commit or duplicate upload and retain the original successful tag/docs receipt', async t => {
  const f = await fixture(t, ['lithent', 'lithent-concurrent']);
  const original = await f.prepare();
  assert.deepEqual(original.plan.order, ['lithent', 'lithent-concurrent']);
  f.rejectNextConcurrent();
  await assert.rejects(() => f.publish(1), /simulated registry outage/);
  const first = await f.receipt();
  assert.deepEqual(
    first.packages.map(row => row.status),
    ['published', 'unconfirmed']
  );
  f.recover();
  await assert.rejects(() => f.record(original, [first]), /recording failed/);
  assert.equal(f.tags.size, 1);
  assert.equal(f.docs[0].sha, f.source.revision);
  const retry = await f.prepare();
  assert.deepEqual(retry.plan.order, ['lithent-concurrent']);
  await f.publish(2);
  await f.record(retry, [first, await f.receipt()]);
  assert.deepEqual(f.calls, [
    'lithent',
    'lithent-concurrent',
    'lithent-concurrent',
  ]);
  assert.equal(f.tags.size, 2);
  assert([...f.tags.values()].every(sha => sha === f.source.revision));
  assert.deepEqual((await f.prepare()).plan.order, []);
  assert.equal(sourceIdentity(f.root).dirty, false);
});

test('an accepted upload with a confirmation outage recovers original tags/docs through publish retry, record retry and zero-candidate recalculation', async t => {
  for (const mode of ['publish retry', 'record retry', 'recalculate']) {
    const f = await fixture(t, ['lithent']);
    const original = await f.prepare();
    f.loseNextConfirmation('lithent');
    await assert.rejects(() => f.publish(1), /registry confirmation outage/);
    const first = await f.receipt();
    assert.equal(first.status, 'failed');
    assert.equal(first.packages[0].status, 'unconfirmed');
    await assert.rejects(() => f.record(original, [first]), /recording failed/);
    assert.equal(f.tags.size, 0);
    assert.equal(f.docs.length, 0);
    f.recover();
    let inputs = original;
    const receipts = [first];
    if (mode === 'recalculate') {
      inputs = await f.prepare();
      assert.deepEqual(inputs.plan.order, []);
    }
    if (mode !== 'record retry') {
      await f.publish(2);
      const retry = await f.receipt();
      if (mode === 'publish retry')
        assert.equal(retry.packages[0].status, 'skipped');
      else assert.deepEqual(retry.packages, []);
      receipts.push(retry);
    }
    const result = await f.record(inputs, receipts);
    assert.equal(result.packages[0].recoveredUnconfirmed, true);
    assert.equal(result.packages[0].docsDispatch, 'accepted');
    assert.deepEqual(f.calls, ['lithent']);
    assert.equal(
      f.tags.get(
        'lithent@' + semver.inc(releasePolicy.packages[0].baseline, 'patch')
      ),
      f.source.revision
    );
    assert.deepEqual(f.docs, [
      { tag: result.packages[0].tag, sha: f.source.revision },
    ]);
    assert.equal(sourceIdentity(f.root).dirty, false);
  }
});
