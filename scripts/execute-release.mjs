import { setTimeout as delay } from 'node:timers/promises';
import semver from 'semver';
import { fileIdentity } from './artifact-utils.mjs';
import { visibilityWindow, waitForVersion } from './npm-registry.mjs';

export function verifyConsumerProof(
  { plan, planSha256, proof },
  { requireClean = true } = {}
) {
  if (
    plan.schemaVersion !== 1 ||
    plan.status !== 'ready' ||
    typeof plan.source?.dirty !== 'boolean' ||
    (requireClean && plan.source.dirty) ||
    proof?.schemaVersion !== 1 ||
    proof.status !== 'passed' ||
    proof.source?.revision !== plan.source.revision ||
    proof.source?.dirty !== plan.source.dirty ||
    proof.planSha256 !== planSha256 ||
    proof.manifestSha256 !== plan.manifestSha256 ||
    JSON.stringify(proof.packages) !==
      JSON.stringify(
        plan.order.map(name => ({
          name,
          version: plan.packages.find(row => row.name === name)?.version,
        }))
      )
  )
    throw new Error('Missing, dirty or mismatched release consumer proof');
}

// No production executor is supplied here. Callers must explicitly provide it
// after validating event/ref/OIDC and the same-run, same-SHA build artifact.
export async function executeRelease({
  plan,
  planSha256,
  proof,
  artifacts,
  registry,
  publish,
  persist,
  wait = delay,
  confirmationAttempts = visibilityWindow.attempts,
  confirmationDelayMs = visibilityWindow.delayMs,
}) {
  verifyConsumerProof({ plan, planSha256, proof });
  if (typeof publish !== 'function' || typeof persist !== 'function')
    throw new Error(
      'An explicit publish executor and durable result writer are required'
    );
  if (!Number.isInteger(confirmationAttempts) || confirmationAttempts < 1)
    throw new Error('Invalid registry confirmation bound');
  const selected = plan.packages.filter(row => row.state === 'candidate');
  if (
    new Set(plan.order).size !== plan.order.length ||
    selected.length !== plan.order.length ||
    plan.order.some(name => !selected.some(row => row.name === name))
  )
    throw new Error('Release order differs from candidates');
  const results = {
    schemaVersion: 1,
    status: 'running',
    source: plan.source,
    planSha256,
    manifestSha256: plan.manifestSha256,
    packages: plan.order.map(name => ({
      name,
      version: selected.find(row => row.name === name).version,
      status: 'pending',
      artifact: Object.fromEntries(
        ['archive', 'size', 'sha256', 'integrity'].map(key => [
          key,
          artifacts.get(name)?.[key],
        ])
      ),
    })),
  };
  const save = () => persist(structuredClone(results));
  await save();
  for (const row of results.packages) {
    let awaitingConfirmation = false;
    try {
      const artifact = artifacts.get(row.name);
      const identity = await fileIdentity(artifact.archivePath);
      for (const key of ['size', 'sha256', 'integrity'])
        if (identity[key] !== artifact[key])
          throw new Error(`Release tarball changed: ${row.name}`);
      if (
        artifact.version !== row.version ||
        !semver.valid(row.version) ||
        semver.prerelease(row.version)
      )
        throw new Error(`Invalid stable release: ${row.name}`);
      const existing = await registry.getVersion(row.name, row.version);
      if (existing) {
        if (existing.dist?.integrity !== artifact.integrity)
          throw new Error(
            `Published version has conflicting integrity: ${row.name}`
          );
        row.status = 'skipped';
        row.reason = 'already-published-identical';
        await save();
        continue;
      }
      const current = await registry.getPackage(row.name, { fresh: true });
      const versions = Object.keys(current.versions).filter(
        version => semver.valid(version) && !semver.prerelease(version)
      );
      if (versions.some(version => semver.gt(version, row.version)))
        throw new Error(`Newer stable version exists: ${row.name}`);
      for (const edge of plan.dependencies.filter(
        edge => edge.consumer === row.name
      )) {
        if (
          edge.source === 'candidate' &&
          !['published', 'skipped'].includes(
            results.packages.find(item => item.name === edge.name)?.status
          )
        )
          throw new Error(
            `Dependency order is invalid: ${row.name} -> ${edge.name}`
          );
        if (
          !semver.satisfies(edge.version, edge.range) ||
          !(await registry.getVersion(edge.name, edge.version))
        )
          throw new Error(
            `Dependency is unavailable: ${row.name} -> ${edge.name}`
          );
      }
      row.status = 'publishing';
      await save();
      awaitingConfirmation = true;
      let commandError;
      try {
        await publish(artifact);
      } catch (error) {
        commandError = error;
      }
      const confirmed = await waitForVersion(registry, row.name, row.version, {
        attempts: confirmationAttempts,
        delayMs: confirmationDelayMs,
        wait,
      });
      if (!confirmed)
        throw new Error(
          `Publication not confirmed: ${row.name}${commandError ? ': ' + commandError.message : ''}`
        );
      // A response with different bytes is a definite conflict, not an
      // upload whose outcome can be recovered by a later receipt check.
      awaitingConfirmation = false;
      if (confirmed.dist?.integrity !== artifact.integrity)
        throw new Error(
          `Published integrity differs from validated tarball: ${row.name}`
        );
      row.status = 'published';
      row.registryIntegrity = confirmed.dist.integrity;
      if (commandError) row.recoveredCommandError = commandError.message;
      await save();
    } catch (error) {
      row.status = awaitingConfirmation ? 'unconfirmed' : 'failed';
      row.error = error.message;
      results.status = 'failed';
      await save();
      throw new Error(`Release failed: ${row.name}: ${error.message}`, {
        cause: error,
      });
    }
  }
  results.status = 'passed';
  await save();
  return results;
}
