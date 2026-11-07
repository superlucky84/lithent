import { execFileSync } from 'node:child_process';
import { realpath } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import semver from 'semver';
import {
  assertSource,
  fileIdentity,
  readJson,
  safeFile,
  sourceIdentity,
  verifyReleaseManifest,
} from './artifact-utils.mjs';
import { releasePolicy } from './release-packages.mjs';
import { assertReleaseRepository } from './release-policy.mjs';

export function packedMetadata(archive) {
  return JSON.parse(
    execFileSync('tar', ['-xzOf', archive, 'package/package.json'], {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
    })
  );
}

export async function readReleaseInputs(
  repo,
  artifactDirectory,
  { allowDirty = false, revision = process.env.GITHUB_SHA } = {}
) {
  const source = sourceIdentity(repo);
  assertSource(source, revision ?? source.revision, !allowDirty);
  const manifest = await verifyReleaseManifest(artifactDirectory, {
    revision: source.revision,
    requireClean: !allowDirty,
  });
  const planPath = resolve(repo, 'artifacts/release-plan.json');
  const plan = await readJson(planPath);
  if (plan.schemaVersion !== 1 || plan.status !== 'ready')
    throw new Error('Release plan is not ready');
  assertSource(plan.source, source.revision, !allowDirty);
  if (
    plan.manifestSha256 !==
      (await fileIdentity(resolve(artifactDirectory, 'manifest.json')))
        .sha256 ||
    plan.policySha256 !==
      (await fileIdentity(resolve(repo, '.github/release-policy.json'))).sha256
  )
    throw new Error('Release plan artifact/policy digest changed');
  if (
    plan.repository !== releasePolicy.repository ||
    plan.registry !== releasePolicy.registry ||
    plan.distTag !== releasePolicy.distTag
  )
    throw new Error('Release plan policy does not match');
  if (
    !Array.isArray(plan.packages) ||
    plan.packages.length !== releasePolicy.packages.length
  )
    throw new Error('Release plan package set changed');
  const artifacts = new Map();
  const seen = new Set();
  for (const row of plan.packages) {
    const entry = releasePolicy.packages.find(entry => entry.name === row.name);
    if (
      !entry ||
      seen.has(row.name) ||
      entry.directory !== row.directory ||
      entry.baseline !== row.baseline
    )
      throw new Error(`Unexpected release plan package: ${row.name}`);
    seen.add(row.name);
    const directory = await realpath(resolve(repo, entry.directory));
    const rel = relative(resolve(repo), directory);
    if (rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel))
      throw new Error('Package directory escapes repository');
    const metadata = await readJson(resolve(directory, 'package.json'));
    if (metadata.name !== row.name || metadata.version !== row.version)
      throw new Error(`Release source metadata changed: ${row.name}`);
    const item = manifest.packages.find(item => item.name === row.name);
    for (const field of [
      'name',
      'version',
      'archive',
      'size',
      'sha256',
      'integrity',
    ])
      if (row.artifact?.[field] !== item[field])
        throw new Error(`Release artifact changed: ${row.name}`);
    const archive = await safeFile(artifactDirectory, item.archive);
    const packed = packedMetadata(archive);
    if (
      packed.name !== row.name ||
      packed.version !== row.version ||
      packed.private
    )
      throw new Error(`Wrong packed metadata: ${row.name}`);
    if (!['candidate', 'excluded'].includes(row.state))
      throw new Error('Unknown release plan state');
    if (
      row.state === 'candidate' &&
      (metadata.private ||
        !semver.gt(row.version, row.baseline) ||
        semver.prerelease(row.version))
    )
      throw new Error(`Ineligible release candidate: ${row.name}`);
    if (row.state === 'candidate')
      assertReleaseRepository(packed, plan.repository);
    artifacts.set(row.name, { ...item, archivePath: archive, packed });
  }
  const candidates = plan.packages
    .filter(row => row.state === 'candidate')
    .map(row => row.name);
  if (
    !Array.isArray(plan.order) ||
    plan.order.length !== candidates.length ||
    new Set(plan.order).size !== plan.order.length ||
    plan.order.some(name => !candidates.includes(name))
  )
    throw new Error('Release order does not match selected candidates');
  return {
    plan,
    manifest,
    artifacts,
    planSha256: (await fileIdentity(planPath)).sha256,
  };
}
