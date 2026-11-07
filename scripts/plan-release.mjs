import { execFileSync } from 'node:child_process';
import { appendFile, mkdir, realpath, writeFile } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  fileIdentity,
  readJson,
  safeFile,
  sourceIdentity,
  assertSource,
  verifyReleaseManifest,
} from './artifact-utils.mjs';
import { releasePolicy } from './release-packages.mjs';
import { calculateReleasePlan, releasePlanMarkdown } from './release-plan.mjs';
import { NpmRegistry } from './npm-registry.mjs';
import { readSourceChanges } from './release-changes.mjs';
import { assertReleaseRepository } from './release-policy.mjs';

const repo = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(repo, 'artifacts/release-plan.json');
try {
  let artifactDirectory = resolve(repo, 'artifacts/release');
  let allowDirty = false;
  const args = process.argv.slice(2);
  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--allow-dirty') allowDirty = true;
    else if (args[index] === '--artifacts' && args[index + 1])
      artifactDirectory = resolve(repo, args[++index]);
    else
      throw new Error(
        'Usage: node scripts/plan-release.mjs [--allow-dirty] [--artifacts directory]'
      );
  }
  const source = sourceIdentity(repo);
  assertSource(source, process.env.GITHUB_SHA ?? source.revision, !allowDirty);
  const manifest = await verifyReleaseManifest(artifactDirectory, {
    revision: source.revision,
    requireClean: !allowDirty,
  });
  const workspaces = JSON.parse(
    execFileSync('pnpm', ['list', '-r', '--depth', '-1', '--json'], {
      cwd: repo,
      encoding: 'utf8',
    })
  );
  if (!workspaces.some(workspace => resolve(workspace.path) === resolve(repo)))
    workspaces.unshift({ path: repo });
  const packages = [];
  for (const workspace of workspaces) {
    const directory = await realpath(workspace.path);
    const fromRoot = relative(resolve(repo), directory);
    if (
      fromRoot === '..' ||
      fromRoot.startsWith('..' + sep) ||
      isAbsolute(fromRoot)
    )
      throw new Error('Workspace manifest escapes repository');
    const metadata = await readJson(resolve(directory, 'package.json'));
    const input = {
      ...metadata,
      directory: fromRoot.split(sep).join('/') || '.',
    };
    const artifact = manifest.packages.find(
      item => item.name === metadata.name
    );
    if (artifact) {
      if (artifact.version !== metadata.version)
        throw new Error(`Stale packed version: ${metadata.name}`);
      const archive = await safeFile(artifactDirectory, artifact.archive);
      const packed = JSON.parse(
        execFileSync('tar', ['-xzOf', archive, 'package/package.json'], {
          encoding: 'utf8',
          maxBuffer: 1024 * 1024,
        })
      );
      if (
        packed.name !== metadata.name ||
        packed.version !== metadata.version ||
        packed.private
      )
        throw new Error(`Wrong/private packed metadata: ${metadata.name}`);
      input.packed = packed;
      input.artifact = artifact;
    }
    packages.push(input);
  }
  const manifestSha256 = (
    await fileIdentity(resolve(artifactDirectory, 'manifest.json'))
  ).sha256;
  const changes = await readSourceChanges(repo, { allowDirty });
  const plan = await calculateReleasePlan({
    policy: releasePolicy,
    packages,
    registry: new NpmRegistry(),
    source,
    manifestSha256,
    changedPaths: changes.paths,
  });
  plan.sourceComparison = changes.basis;
  for (const name of plan.order)
    assertReleaseRepository(
      packages.find(input => input.name === name).packed,
      plan.repository
    );
  plan.policySha256 = (
    await fileIdentity(resolve(repo, '.github/release-policy.json'))
  ).sha256;
  const markdown = releasePlanMarkdown(plan);
  await mkdir(resolve(repo, 'artifacts'), { recursive: true });
  await writeFile(output, JSON.stringify(plan, null, 2) + '\n');
  await writeFile(resolve(repo, 'artifacts/release-plan.md'), markdown);
  if (process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_STEP_SUMMARY)
    await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown);
  console.log(markdown);
} catch (error) {
  await mkdir(resolve(repo, 'artifacts'), { recursive: true });
  await writeFile(
    output,
    JSON.stringify(
      { schemaVersion: 1, status: 'failed', error: error.message },
      null,
      2
    ) + '\n'
  );
  console.error(`Release planning failed: ${error.message}`);
  process.exitCode = 1;
}
