import { posix } from 'node:path';
import semver from 'semver';

export function assertVersion(version) {
  if (typeof version !== 'string' || semver.valid(version) !== version)
    throw new Error(`Invalid/noncanonical package version: ${version}`);
  return version;
}

export function assertReleaseRepository(metadata, repository) {
  const value =
    typeof metadata.repository === 'string'
      ? metadata.repository
      : metadata.repository?.url;
  const normalized = value
    ?.replace(/^git\+/, '')
    .replace(/\.git\/?$/, '')
    .replace(/\/$/, '');
  if (normalized !== 'https://github.com/' + repository)
    throw new Error(
      `Release repository metadata does not match ${repository}: ${metadata.name}`
    );
}

export function validateReleasePolicy(policy) {
  if (
    policy?.schemaVersion !== 1 ||
    policy.registry !== 'https://registry.npmjs.org' ||
    policy.distTag !== 'latest' ||
    policy.prerelease !== 'hold' ||
    !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(policy.repository ?? '') ||
    !Array.isArray(policy.packages) ||
    !policy.packages.length
  )
    throw new Error('Invalid release policy/schema/registry');
  const names = new Set();
  const directories = new Set();
  for (const entry of policy.packages) {
    if (
      !/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(
        entry.name ?? ''
      ) ||
      names.has(entry.name)
    )
      throw new Error(`Invalid/duplicate release package: ${entry.name}`);
    const dir = entry.directory;
    if (
      typeof dir !== 'string' ||
      !dir ||
      dir.includes('\\') ||
      posix.isAbsolute(dir) ||
      posix.normalize(dir) !== dir ||
      dir === '..' ||
      dir.startsWith('../') ||
      directories.has(dir)
    )
      throw new Error(`Invalid/duplicate release directory: ${dir}`);
    assertVersion(entry.baseline);
    if (semver.prerelease(entry.baseline))
      throw new Error(`Baseline must be stable: ${entry.name}`);
    if (
      entry.sourcePaths !== undefined &&
      (!Array.isArray(entry.sourcePaths) ||
        entry.sourcePaths.some(
          path =>
            typeof path !== 'string' ||
            !path ||
            path === '.' ||
            path === '..' ||
            path.startsWith('../') ||
            path.includes('\\') ||
            posix.isAbsolute(path) ||
            posix.normalize(path) !== path
        ))
    )
      throw new Error(`Invalid source ownership path: ${entry.name}`);
    names.add(entry.name);
    directories.add(dir);
  }
  return policy;
}
