import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { lstat, readFile, readdir, realpath } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { releasePackages } from './release-packages.mjs';

export const readJson = async file => JSON.parse(await readFile(file, 'utf8'));
export const sourceIdentity = repo => ({
  revision: execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: repo,
    encoding: 'utf8',
  }).trim(),
  dirty:
    execFileSync('git', ['status', '--porcelain', '-uall'], {
      cwd: repo,
      encoding: 'utf8',
    }).trim().length > 0,
});
export function assertSource(source, revision, requireClean = false) {
  if (
    !source ||
    source.revision !== revision ||
    typeof source.dirty !== 'boolean'
  )
    throw new Error('Artifact source revision does not match checkout');
  if (requireClean && source.dirty)
    throw new Error('Dirty artifacts cannot be used in CI/release');
}
export async function fileIdentity(file) {
  const bytes = await readFile(file);
  return {
    size: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    integrity: 'sha512-' + createHash('sha512').update(bytes).digest('base64'),
  };
}
export async function safeFile(root, target) {
  if (typeof target !== 'string' || !target || isAbsolute(target))
    throw new Error(`Invalid artifact target: ${target}`);
  const file = resolve(root, target);
  const inside = path => {
    const part = relative(resolve(root), path);
    return (
      part && part !== '..' && !part.startsWith('..' + sep) && !isAbsolute(part)
    );
  };
  if (
    !inside(file) ||
    !inside(await realpath(file)) ||
    !(await lstat(file)).isFile()
  )
    throw new Error(
      `Artifact target escapes package or is not a file: ${target}`
    );
  return file;
}
const targets = value => {
  if (typeof value === 'string') return [value];
  if (value === null || value === undefined) return [];
  if (typeof value !== 'object') throw new Error('Invalid export target');
  return Object.values(value).flatMap(targets);
};
export async function validatePackedPackage(root, expected) {
  const packed = await readJson(resolve(root, 'package.json'));
  if (
    packed.private ||
    packed.name !== expected.name ||
    packed.version !== expected.version
  )
    throw new Error(`Wrong/private packed metadata: ${expected.name}`);
  if (
    JSON.stringify([
      packed.dependencies,
      packed.optionalDependencies,
      packed.peerDependencies,
    ]).includes('workspace:')
  )
    throw new Error(`Unresolved public workspace dependency: ${expected.name}`);
  const entries = [
    packed.main,
    packed.module,
    packed.types,
    packed.typings,
    ...targets(packed.exports),
    ...targets(packed.bin),
  ].filter(Boolean);
  if (!entries.length)
    throw new Error(`No public entry points: ${expected.name}`);
  for (const target of entries) await safeFile(root, target);
  return packed;
}
export async function inventory(root, directories) {
  const result = {};
  const walk = async path => {
    const stat = await lstat(resolve(root, path));
    if (stat.isDirectory()) {
      const names = await readdir(resolve(root, path));
      if (!names.length) throw new Error(`Empty build directory: ${path}`);
      for (const name of names.sort()) await walk(`${path}/${name}`);
    } else {
      await safeFile(root, path);
      result[path] = await fileIdentity(resolve(root, path));
    }
  };
  for (const directory of directories) await walk(directory);
  return result;
}
export async function verifyReleaseManifest(
  directory,
  { revision, requireClean = false, packages = releasePackages } = {}
) {
  const manifest = await readJson(resolve(directory, 'manifest.json'));
  if (
    manifest.schemaVersion !== 1 ||
    !Array.isArray(manifest.packages) ||
    manifest.packages.length !== packages.length
  )
    throw new Error('Missing release packages/schema');
  assertSource(manifest.source, revision, requireClean);
  const seen = new Set();
  for (const item of manifest.packages) {
    if (
      seen.has(item.name) ||
      !packages.some(pkg => pkg.name === item.name) ||
      typeof item.version !== 'string'
    )
      throw new Error(`Unexpected/duplicate release package: ${item.name}`);
    seen.add(item.name);
    const identity = await fileIdentity(
      await safeFile(directory, item.archive)
    );
    if (
      JSON.stringify(identity) !==
      JSON.stringify({
        size: item.size,
        sha256: item.sha256,
        integrity: item.integrity,
      })
    )
      throw new Error(`Corrupt release artifact: ${item.name}`);
  }
  return manifest;
}
