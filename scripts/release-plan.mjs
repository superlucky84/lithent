import semver from 'semver';
import { assertVersion, validateReleasePolicy } from './release-policy.mjs';
import { sourceChangeAdvice } from './release-changes.mjs';

const stableVersions = metadata =>
  Object.entries(metadata.versions)
    .filter(
      ([version]) =>
        semver.valid(version) === version && !semver.prerelease(version)
    )
    .map(([version, entry]) => {
      if (!entry || entry.name !== metadata.name || entry.version !== version)
        throw new Error(
          `Invalid registry version metadata: ${metadata.name}@${version}`
        );
      return version;
    });

export async function calculateReleasePlan({
  policy,
  packages,
  registry,
  source,
  manifestSha256,
  changedPaths = null,
}) {
  validateReleasePolicy(policy);
  const inputs = new Map();
  for (const input of packages) {
    if (inputs.has(input.name))
      throw new Error(`Duplicate workspace name: ${input.name}`);
    inputs.set(input.name, input);
  }
  const known = new Set(policy.packages.map(entry => entry.name));
  const rows = [];
  for (const entry of policy.packages) {
    const input = inputs.get(entry.name);
    if (!input) throw new Error(`Missing allowed manifest: ${entry.name}`);
    if (input.directory !== entry.directory)
      throw new Error(`Wrong package directory: ${entry.name}`);
    const row = {
      name: entry.name,
      directory: entry.directory,
      baseline: entry.baseline,
      version: input.version,
      artifact: input.artifact,
    };
    if (input.private) {
      rows.push({ ...row, state: 'excluded', reason: 'private' });
      continue;
    }
    assertVersion(input.version);
    if (semver.lt(input.version, entry.baseline))
      throw new Error(`Version downgrade: ${entry.name}`);
    if (semver.prerelease(input.version)) {
      rows.push({ ...row, state: 'excluded', reason: 'prerelease-held' });
      continue;
    }
    if (input.version === entry.baseline) {
      rows.push({ ...row, state: 'excluded', reason: 'bootstrap-baseline' });
      continue;
    }
    const metadata = await registry.getPackage(entry.name);
    if (!metadata.versions[entry.baseline])
      throw new Error(`Published baseline is missing: ${entry.name}`);
    const newest = semver.rsort(stableVersions(metadata))[0];
    if (newest && semver.lt(input.version, newest))
      throw new Error(
        `Version is behind published stable ${newest}: ${entry.name}`
      );
    const published = await registry.getVersion(entry.name, input.version);
    rows.push(
      published
        ? {
            ...row,
            state: 'excluded',
            reason: 'already-published',
            registryIntegrity: published.dist?.integrity,
          }
        : {
            ...row,
            state: 'candidate',
            reason: 'version-increased-and-unpublished',
          }
    );
  }
  const candidates = new Map(
    rows.filter(row => row.state === 'candidate').map(row => [row.name, row])
  );
  const edges = new Map([...candidates.keys()].map(name => [name, new Set()]));
  const dependencies = [];
  for (const row of candidates.values()) {
    const metadata = inputs.get(row.name).packed ?? inputs.get(row.name);
    for (const kind of [
      'dependencies',
      'optionalDependencies',
      'peerDependencies',
    ]) {
      for (const [name, range] of Object.entries(metadata[kind] ?? {})) {
        if (
          kind === 'peerDependencies' &&
          metadata.peerDependenciesMeta?.[name]?.optional
        )
          continue;
        if (typeof range !== 'string' || range.includes('workspace:'))
          throw new Error(
            `Unresolved packed dependency: ${row.name} -> ${name}`
          );
        if (inputs.get(name)?.private)
          throw new Error(
            `Private workspace dependency: ${row.name} -> ${name}`
          );
        if (!known.has(name)) continue; // External dependencies are checked by installed consumers.
        if (!semver.validRange(range))
          throw new Error(
            `Invalid internal dependency range: ${row.name} -> ${name}`
          );
        const selected = candidates.get(name);
        let version;
        if (selected) {
          if (!semver.satisfies(selected.version, range))
            throw new Error(
              `Selected dependency/peer does not satisfy ${range}: ${row.name} -> ${name}`
            );
          version = selected.version;
          edges.get(row.name).add(name);
        } else {
          const published = await registry.getPackage(name);
          version = semver.maxSatisfying(stableVersions(published), range);
          if (!version)
            throw new Error(
              `Internal dependency is not published: ${row.name} -> ${name}@${range}`
            );
        }
        dependencies.push({
          consumer: row.name,
          name,
          kind,
          range,
          version,
          source: selected ? 'candidate' : 'registry',
        });
      }
    }
  }
  const order = [];
  const active = new Set();
  const complete = new Set();
  const visit = name => {
    if (active.has(name))
      throw new Error(
        `Cyclic release dependencies: ${[...active, name].join(' -> ')}`
      );
    if (complete.has(name)) return;
    active.add(name);
    for (const dependency of edges.get(name)) visit(dependency);
    active.delete(name);
    complete.add(name);
    order.push(name);
  };
  for (const name of candidates.keys()) visit(name);
  return {
    schemaVersion: 1,
    status: 'ready',
    source,
    manifestSha256,
    repository: policy.repository,
    registry: policy.registry,
    distTag: policy.distTag,
    packages: rows,
    order,
    dependencies,
    sourceChanges: sourceChangeAdvice(policy, rows, changedPaths),
    ignored: packages
      .filter(input => !known.has(input.name))
      .map(input => ({
        name: input.name,
        reason: input.private ? 'private-workspace' : 'unregistered-package',
      })),
  };
}

export function releasePlanMarkdown(plan) {
  return [
    '# npm release preview',
    '',
    `Source: ${plan.source.revision}; dirty=${plan.source.dirty}. This preview does not publish anything.`,
    '',
    '| Package | Version | Baseline | Result |',
    '| --- | --- | --- | --- |',
    ...plan.packages.map(
      row =>
        `| ${row.name} | ${row.version} | ${row.baseline} | ${row.reason} |`
    ),
    '',
    `Publish order (${plan.order.length}): ${plan.order.join(' → ') || 'none'}`,
    '',
    ...(plan.sourceChanges === null
      ? ['Source ownership advice: not checked (no comparison base).', '']
      : plan.sourceChanges
          .filter(change => change.warning)
          .flatMap(change => [
            `Warning: ${change.name}: ${change.warning} (${change.files.length} changed path(s))`,
            '',
          ])),
  ].join('\n');
}
