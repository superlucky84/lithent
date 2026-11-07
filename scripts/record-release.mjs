import { readdir, appendFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import semver from 'semver';
import { readJson } from './artifact-utils.mjs';
import { readReleaseInputs } from './release-inputs.mjs';
import { assertReleaseContext } from './release-context.mjs';
import { writeReleaseResult } from './publish-release.mjs';
import { GitHubReleaseApi } from './github-release-api.mjs';
import { NpmRegistry, waitForVersion } from './npm-registry.mjs';

export async function recordReleaseResults({
  inputs,
  receipts,
  runId,
  registry,
  github,
  persist,
  wait,
  confirmationAttempts,
  confirmationDelayMs,
}) {
  const { plan, artifacts } = inputs;
  const selected = new Map();
  if (plan.source?.dirty !== false)
    throw new Error('Dirty inputs cannot authorize release tags');
  for (const receipt of receipts) {
    if (
      receipt.schemaVersion !== 1 ||
      receipt.repository !== plan.repository ||
      receipt.run?.id !== runId ||
      !Number.isInteger(receipt.run.attempt) ||
      receipt.run.attempt < 1 ||
      receipt.source?.revision !== plan.source.revision ||
      receipt.source?.dirty !== false ||
      !['running', 'passed', 'failed'].includes(receipt.status) ||
      !Array.isArray(receipt.packages) ||
      !/^[a-f0-9]{64}$/.test(receipt.planSha256 ?? '') ||
      !/^[a-f0-9]{64}$/.test(receipt.manifestSha256 ?? '')
    )
      throw new Error(
        'Release receipt belongs to another run/source or is invalid'
      );
    for (const row of receipt.packages) {
      if (!['published', 'unconfirmed'].includes(row.status)) continue;
      const owner = plan.packages.find(item => item.name === row.name);
      const item = artifacts.get(row.name);
      if (
        !owner ||
        !item ||
        item.version !== row.version ||
        !semver.gt(row.version, owner.baseline) ||
        semver.prerelease(row.version) ||
        (row.status === 'published' &&
          row.registryIntegrity !== item.integrity) ||
        (row.registryIntegrity !== undefined &&
          row.registryIntegrity !== item.integrity) ||
        ['archive', 'size', 'sha256', 'integrity'].some(
          field => row.artifact?.[field] !== item[field]
        )
      )
        throw new Error(
          `Release receipt does not match validated bytes: ${row.name}`
        );
      // A later skipped receipt cannot erase an earlier upload attempt.
      // Prefer an already-confirmed receipt regardless of download order.
      if (!selected.has(row.name) || row.status === 'published')
        selected.set(row.name, row);
    }
  }
  const results = {
    schemaVersion: 1,
    status: 'running',
    source: plan.source,
    repository: plan.repository,
    runId,
    packages: [...selected.values()].map(row => ({
      name: row.name,
      version: row.version,
      tag: row.name + '@' + row.version,
      status: 'pending',
    })),
  };
  await persist(structuredClone(results));
  for (const row of results.packages) {
    try {
      // An unconfirmed upload may still be becoming visible on npm.
      const published = await waitForVersion(registry, row.name, row.version, {
        attempts: confirmationAttempts,
        delayMs: confirmationDelayMs,
        wait,
      });
      if (published?.dist?.integrity !== artifacts.get(row.name).integrity)
        throw new Error(
          `Registry no longer confirms release bytes: ${row.name}`
        );
      if (selected.get(row.name).status === 'unconfirmed')
        row.recoveredUnconfirmed = true;
      row.tagResult = await github.ensureTag(row.tag, plan.source.revision);
      row.status = 'tagged';
      await persist(structuredClone(results));
      if (row.name === 'lithent') {
        await github.dispatchDocs(row.tag, plan.source.revision);
        row.docsDispatch = 'accepted'; // The separate docs run still needs to finish.
      }
    } catch (error) {
      row.status = 'failed';
      row.error = error.message;
    }
    await persist(structuredClone(results));
  }
  results.status = results.packages.some(row => row.status === 'failed')
    ? 'failed'
    : 'passed';
  await persist(structuredClone(results));
  if (results.status === 'failed')
    throw new Error(
      'Release tag/docs recording failed; inspect release-records.json'
    );
  return results;
}

async function readReceipts(directory) {
  const results = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isSymbolicLink())
      throw new Error('Receipt symlinks are not allowed');
    if (entry.isDirectory()) results.push(...(await readReceipts(path)));
    else if (entry.name === 'release-results.json')
      results.push(await readJson(path));
  }
  return results;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    if (process.argv.length !== 2)
      throw new Error('Usage: node scripts/record-release.mjs');
    const env = process.env;
    const context = assertReleaseContext({
      env,
      needs: JSON.parse(env.NEEDS_JSON ?? '{}'),
      requireOidc: false,
    });
    const repo = fileURLToPath(new URL('../', import.meta.url));
    const inputs = await readReleaseInputs(
      repo,
      resolve(repo, 'artifacts/release')
    );
    const receipts = await readReceipts(resolve(repo, 'artifacts/receipts'));
    if (!receipts.length)
      throw new Error('No publication receipt was downloaded');
    const result = await recordReleaseResults({
      inputs,
      receipts,
      runId: context.id,
      registry: new NpmRegistry(),
      github: new GitHubReleaseApi({
        repository: inputs.plan.repository,
        token: env.GH_TOKEN,
      }),
      persist: value =>
        writeReleaseResult(
          resolve(repo, 'artifacts/release-records.json'),
          value
        ),
    });
    if (env.GITHUB_STEP_SUMMARY)
      await appendFile(
        env.GITHUB_STEP_SUMMARY,
        '\n## Release records\n\n' +
          result.packages
            .map(
              row =>
                `- ${row.tag}: ${row.tagResult}; docs dispatch: ${row.docsDispatch ?? 'not applicable'}`
            )
            .join('\n') +
          '\n'
      );
    console.log(
      `PASS release recording: ${result.packages.length} confirmed package(s)`
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
