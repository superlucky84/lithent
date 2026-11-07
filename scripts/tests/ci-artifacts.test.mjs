import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { assertSuccessfulJobs } from '../ci-gate.mjs';
import {
  assertSource,
  fileIdentity,
  inventory,
  validatePackedPackage,
  verifyReleaseManifest,
} from '../artifact-utils.mjs';

const runCli = (args, options = {}) => {
  const result = spawnSync(process.execPath, args, {
    encoding: 'utf8',
    ...options,
  });
  // An execution/permission error is never proof that the CLI rejected input.
  assert.ifError(result.error);
  assert.equal(result.signal, null);
  return result;
};

test('size enforcement rejects missing builds while report-only stays informational', async t => {
  const root = await mkdtemp(join(tmpdir(), 'lithent-size-fixture-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const cli = fileURLToPath(new URL('../size-report.js', import.meta.url));
  const enforced = runCli([cli], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(enforced.status, 1);
  assert.match(enforced.stderr, /required build missing/);
  assert.equal(runCli([cli, '--report'], { cwd: root }).status, 0);
});

test('CI requires success from every job; missing/zero/skipped/cancelled are failures', () => {
  assert.doesNotThrow(() =>
    assertSuccessfulJobs({ quality: 'success', browser: 'success' })
  );
  for (const result of ['failure', 'skipped', 'cancelled', undefined, ''])
    assert.throws(() =>
      assertSuccessfulJobs({ quality: 'success', browser: result })
    );
  assert.throws(() => assertSuccessfulJobs({}));
  const cli = fileURLToPath(new URL('../ci-gate.mjs', import.meta.url));
  for (const needs of [
    {},
    { quality: { result: 'success' } },
    { quality: { result: 'success' }, browser: { result: 'skipped' } },
  ])
    assert.equal(runCli([cli, JSON.stringify(needs)]).status, 1);
  assert.equal(
    runCli([
      cli,
      JSON.stringify({
        quality: { result: 'success' },
        browser: { result: 'success' },
      }),
    ]).status,
    0
  );
});

test('packed package rejects missing exports, bin, wrong metadata, private and workspace references', async t => {
  const work = await mkdtemp(join(tmpdir(), 'lithent-pack-fixture-'));
  const root = join(work, 'package');
  t.after(() => rm(work, { recursive: true, force: true }));
  await mkdir(root);
  await mkdir(join(root, 'dist'));
  await writeFile(join(root, 'dist/index.mjs'), 'export const value = 1;');
  // This file must exist: ENOENT must not hide removal of the path boundary.
  await writeFile(join(work, 'outside.js'), 'export const outside = true;');
  await symlink(join(work, 'outside.js'), join(root, 'dist/outside-link.mjs'));
  const good = {
    name: 'fixture',
    version: '1.0.1',
    exports: { '.': './dist/index.mjs' },
  };
  const check = async value => {
    await writeFile(join(root, 'package.json'), JSON.stringify(value));
    return validatePackedPackage(root, good);
  };
  await check(good);
  for (const broken of [
    { ...good, exports: { '.': './dist/missing.mjs' } },
    { ...good, bin: { tool: 'dist/missing.js' } },
    { ...good, exports: { '.': '../outside.js' } },
    { ...good, exports: { '.': join(work, 'outside.js') } },
    { ...good, exports: { '.': './dist/outside-link.mjs' } },
    { ...good, version: '1.0.0' },
    { ...good, private: true },
    ...['dependencies', 'optionalDependencies', 'peerDependencies'].map(
      field => ({ ...good, [field]: { inner: 'workspace:*' } })
    ),
  ])
    await assert.rejects(() => check(broken));
});

test('release manifest rejects missing/duplicate packages, archive changes, wrong revision and dirty CI evidence', async t => {
  const root = await mkdtemp(join(tmpdir(), 'lithent-manifest-fixture-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const archive = join(root, 'fixture-1.0.1.tgz');
  await writeFile(archive, 'known verified bytes');
  const good = {
    schemaVersion: 1,
    source: { revision: 'same-sha', dirty: false },
    packages: [
      {
        name: 'fixture',
        version: '1.0.1',
        archive: 'fixture-1.0.1.tgz',
        ...(await fileIdentity(archive)),
      },
    ],
  };
  const check = async value => {
    await writeFile(join(root, 'manifest.json'), JSON.stringify(value));
    return verifyReleaseManifest(root, {
      revision: 'same-sha',
      requireClean: true,
      packages: [{ name: 'fixture' }],
    });
  };
  await check(good);
  for (const broken of [
    { ...good, packages: [] },
    { ...good, packages: [good.packages[0], good.packages[0]] },
    { ...good, source: { revision: 'other-sha', dirty: false } },
    { ...good, source: { revision: 'same-sha', dirty: true } },
    { ...good, packages: [{ ...good.packages[0], archive: 'missing.tgz' }] },
    { ...good, packages: [{ ...good.packages[0], sha256: 'wrong' }] },
  ])
    await assert.rejects(() => check(broken));
  // Keep the size identical: a size-only check must not pass as integrity.
  await writeFile(
    archive,
    'x'.repeat(Buffer.byteLength('known verified bytes'))
  );
  await assert.rejects(() => check(good), /Corrupt/);
  assert.throws(() => assertSource({ revision: 'same-sha' }, 'same-sha'));
});

test('build inventory fails for missing/empty output and detects changed, extra and removed files', async t => {
  const root = await mkdtemp(join(tmpdir(), 'lithent-build-fixture-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await assert.rejects(() => inventory(root, ['dist']));
  await mkdir(join(root, 'dist'));
  await assert.rejects(() => inventory(root, ['dist']), /Empty/);
  await writeFile(join(root, 'dist/app.mjs'), 'known build');
  const good = await inventory(root, ['dist']);
  await writeFile(join(root, 'dist/app.mjs'), 'other build');
  assert.notDeepEqual(await inventory(root, ['dist']), good);
  await writeFile(join(root, 'dist/app.mjs'), 'known build');
  await writeFile(join(root, 'dist/extra.mjs'), 'unexpected');
  assert.notDeepEqual(await inventory(root, ['dist']), good);
  await rm(join(root, 'dist/app.mjs'));
  assert.notDeepEqual(await inventory(root, ['dist']), good);
});
