import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileIdentity, sourceIdentity } from '../artifact-utils.mjs';
import { readReleaseInputs } from '../release-inputs.mjs';
import { releasePolicy } from '../release-packages.mjs';
import { verifyConsumerProof } from '../execute-release.mjs';
import { readSourceChanges } from '../release-changes.mjs';

test('persisted release inputs bind actual tarballs, source, policy, metadata, order and consumer evidence', async () => {
  const root = await mkdtemp(join(tmpdir(), 'release-inputs-'));
  const artifacts = join(root, 'artifacts/release');
  await mkdir(artifacts, { recursive: true });
  await mkdir(join(root, '.github'));
  const policyBytes = await readFile(
    new URL('../../.github/release-policy.json', import.meta.url)
  );
  await writeFile(join(root, '.github/release-policy.json'), policyBytes);
  await writeFile(join(root, '.gitignore'), 'artifacts/\nunpack/\n');
  const items = [];
  for (const entry of releasePolicy.packages) {
    const directory = join(root, entry.directory);
    await mkdir(directory, { recursive: true });
    const metadata = { name: entry.name, version: entry.baseline };
    await writeFile(join(directory, 'package.json'), JSON.stringify(metadata));
    const unpack = join(root, 'unpack');
    await mkdir(join(unpack, 'package'), { recursive: true });
    await writeFile(
      join(unpack, 'package/package.json'),
      JSON.stringify(metadata)
    );
    const archive = entry.name.replaceAll('/', '-').replace('@', '') + '.tgz';
    execFileSync('tar', ['-czf', join(artifacts, archive), 'package'], {
      cwd: unpack,
    });
    items.push({
      ...metadata,
      archive,
      ...(await fileIdentity(join(artifacts, archive))),
    });
  }
  const git = args => execFileSync('git', args, { cwd: root, stdio: 'pipe' });
  git(['init', '-q']);
  git(['add', '.']);
  git([
    '-c',
    'user.name=Release Fixture',
    '-c',
    'user.email=fixture@example.invalid',
    'commit',
    '-qm',
    'fixture',
  ]);
  const source = sourceIdentity(root);
  assert.equal(source.dirty, false);
  const manifest = { schemaVersion: 1, source, packages: items };
  await writeFile(join(artifacts, 'manifest.json'), JSON.stringify(manifest));
  const planPath = join(root, 'artifacts/release-plan.json');
  const plan = {
    schemaVersion: 1,
    status: 'ready',
    source,
    manifestSha256: (await fileIdentity(join(artifacts, 'manifest.json')))
      .sha256,
    policySha256: (
      await fileIdentity(join(root, '.github/release-policy.json'))
    ).sha256,
    repository: releasePolicy.repository,
    registry: releasePolicy.registry,
    distTag: releasePolicy.distTag,
    packages: releasePolicy.packages.map(entry => ({
      ...entry,
      version: entry.baseline,
      state: 'excluded',
      artifact: items.find(item => item.name === entry.name),
    })),
    order: [],
    dependencies: [],
  };
  const save = value => writeFile(planPath, JSON.stringify(value));
  await save(plan);
  const read = options =>
    readReleaseInputs(root, artifacts, {
      revision: source.revision,
      ...options,
    });
  const input = await read();
  const proof = {
    schemaVersion: 1,
    status: 'passed',
    source,
    planSha256: input.planSha256,
    manifestSha256: plan.manifestSha256,
    packages: [],
  };
  assert.doesNotThrow(() => verifyConsumerProof({ ...input, proof }));
  for (const change of [
    value => {
      value.manifestSha256 = 'other';
    },
    value => {
      value.policySha256 = 'other';
    },
    value => {
      value.packages[0].artifact.size++;
    },
    value => {
      value.packages[0].name = 'unregistered';
    },
    value => {
      value.order = [value.packages[0].name];
    },
    value => {
      value.source.revision = 'other';
    },
  ]) {
    const value = structuredClone(plan);
    change(value);
    await save(value);
    await assert.rejects(() => read());
  }
  await save(plan);
  for (const change of [
    value => {
      value.planSha256 = 'other';
    },
    value => {
      value.manifestSha256 = 'other';
    },
    value => {
      value.source.dirty = true;
    },
    value => {
      value.source.revision = 'other';
    },
    value => {
      value.packages.push({ name: 'unregistered', version: '1.0.0' });
    },
  ]) {
    const value = structuredClone(proof);
    change(value);
    assert.throws(() => verifyConsumerProof({ ...input, proof: value }));
  }
  await assert.rejects(() => read({ revision: 'other' }), /revision/);
  await writeFile(
    join(root, 'package.json'),
    JSON.stringify({ name: 'lithent', version: '9.0.0' })
  );
  await assert.rejects(() => read(), /Dirty/);
  await assert.rejects(
    () => read({ allowDirty: true }),
    /source metadata changed/
  );
});

test('source comparison reads the PR/push base and distinguishes missing context from invalid history', async () => {
  const root = await mkdtemp(join(tmpdir(), 'release-changes-'));
  const git = args =>
    execFileSync('git', args, { cwd: root, encoding: 'utf8' });
  git(['init', '-q']);
  await writeFile(join(root, 'package.json'), '{}');
  git(['add', '.']);
  git([
    '-c',
    'user.name=Release Fixture',
    '-c',
    'user.email=fixture@example.invalid',
    'commit',
    '-qm',
    'base',
  ]);
  const base = git(['rev-parse', 'HEAD']).trim();
  await mkdir(join(root, 'src'));
  await writeFile(join(root, 'src/shared.ts'), 'export const value = 1;');
  git(['add', '.']);
  git([
    '-c',
    'user.name=Release Fixture',
    '-c',
    'user.email=fixture@example.invalid',
    'commit',
    '-qm',
    'change',
  ]);
  const eventPath = join(root, 'event.json');
  for (const event of [
    { pull_request: { base: { sha: base } } },
    { before: base },
  ]) {
    await writeFile(eventPath, JSON.stringify(event));
    assert.deepEqual(await readSourceChanges(root, { eventPath }), {
      basis: base,
      paths: ['src/shared.ts'],
    });
  }
  for (const event of [{}, { before: '0'.repeat(40) }]) {
    await writeFile(eventPath, JSON.stringify(event));
    assert.equal((await readSourceChanges(root, { eventPath })).paths, null);
  }
  await writeFile(eventPath, JSON.stringify({ before: '--unsafe-option' }));
  await assert.rejects(
    () => readSourceChanges(root, { eventPath }),
    /Invalid source comparison/
  );
  await writeFile(eventPath, JSON.stringify({ before: '1'.repeat(40) }));
  await assert.rejects(() => readSourceChanges(root, { eventPath }));
});
