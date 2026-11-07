import { spawn } from 'node:child_process';
import {
  appendFile,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { executeRelease } from './execute-release.mjs';
import { readJson } from './artifact-utils.mjs';
import { readReleaseInputs } from './release-inputs.mjs';
import {
  assertPublishToolchain,
  assertReleaseContext,
} from './release-context.mjs';
import { NpmRegistry } from './npm-registry.mjs';

export function runCommand(command, args, { cwd, env }) {
  return new Promise((accept, reject) => {
    const child = spawn(command, args, {
      cwd,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    const collect = data => {
      output = (output + data).slice(-32_000);
    };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);
    child.on('error', reject);
    child.on('close', (code, signal) =>
      code === 0 && !signal
        ? accept(output)
        : reject(new Error(`${command} failed (${code ?? signal}): ${output}`))
    );
  });
}

export async function writeReleaseResult(file, result) {
  await mkdir(resolve(file, '..'), { recursive: true });
  await writeFile(file + '.tmp', JSON.stringify(result, null, 2) + '\n', {
    mode: 0o600,
  });
  await rename(file + '.tmp', file);
}

export async function publishValidatedRelease({
  repo,
  env = process.env,
  run = runCommand,
  registry = new NpmRegistry(),
  readInputs = readReleaseInputs,
  readProof = readJson,
  persist,
  nodeVersion = process.versions.node,
}) {
  const context = assertReleaseContext({
    env,
    needs: JSON.parse(env.NEEDS_JSON ?? '{}'),
  });
  const inputs = await readInputs(repo, resolve(repo, 'artifacts/release'), {
    revision: env.GITHUB_SHA,
  });
  const proof = await readProof(
    resolve(repo, 'artifacts/release-consumers.json')
  );
  const work = await mkdtemp(join(tmpdir(), 'lithent-npm-publish-'));
  const userconfig = join(work, 'user.npmrc');
  const globalconfig = join(work, 'global.npmrc');
  await writeFile(userconfig, '');
  await writeFile(globalconfig, '');
  const inherited = Object.fromEntries(
    Object.entries(env).filter(([name]) => !/^npm_config_/i.test(name))
  );
  const commandEnv = {
    ...inherited,
    NPM_CONFIG_USERCONFIG: userconfig,
    NPM_CONFIG_GLOBALCONFIG: globalconfig,
    NPM_CONFIG_IGNORE_SCRIPTS: 'true',
    NPM_CONFIG_REGISTRY: inputs.plan.registry,
  };
  const options = { cwd: work, env: commandEnv };
  const version = (await run('npm', ['--version'], options)).trim();
  assertPublishToolchain(nodeVersion, version);
  const save =
    persist ??
    (result =>
      writeReleaseResult(
        resolve(repo, 'artifacts/release-results.json'),
        result
      ));
  return executeRelease({
    ...inputs,
    proof,
    registry,
    publish: artifact =>
      run(
        'npm',
        [
          'publish',
          resolve(artifact.archivePath),
          '--access',
          'public',
          '--tag',
          inputs.plan.distTag,
          '--provenance',
          '--ignore-scripts',
          '--registry',
          inputs.plan.registry,
        ],
        options
      ),
    persist: result =>
      save({ ...result, repository: inputs.plan.repository, run: context }),
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    if (process.argv.length !== 2)
      throw new Error('Usage: node scripts/publish-release.mjs');
    const repo = fileURLToPath(new URL('../', import.meta.url));
    const result = await publishValidatedRelease({ repo });
    console.log(
      `PASS npm release: ${result.packages.filter(row => row.status === 'published').length} published`
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (process.env.GITHUB_STEP_SUMMARY) {
      try {
        const file = fileURLToPath(
          new URL('../artifacts/release-results.json', import.meta.url)
        );
        const result = JSON.parse(await readFile(file, 'utf8'));
        await appendFile(
          process.env.GITHUB_STEP_SUMMARY,
          '\n## npm publication\n\n' +
            result.packages
              .map(row => `- ${row.name}@${row.version}: ${row.status}`)
              .join('\n') +
            '\n'
        );
      } catch {
        /* The workflow log retains failures that preceded a receipt. */
      }
    }
  }
}
