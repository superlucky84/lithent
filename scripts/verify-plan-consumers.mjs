import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import semver from 'semver';
import { readJson } from './artifact-utils.mjs';
import { readReleaseInputs } from './release-inputs.mjs';

const run = (command, args, cwd) =>
  new Promise((accept, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', data => {
      output = (output + data).slice(-32_000);
    });
    child.stderr.on('data', data => {
      output = (output + data).slice(-32_000);
    });
    child.on('error', reject);
    child.on('close', (code, signal) =>
      code === 0 && !signal
        ? accept(output)
        : reject(new Error(`${command} failed (${code ?? signal}):\n${output}`))
    );
  });

const hasRequire = value =>
  value &&
  typeof value === 'object' &&
  (Object.hasOwn(value, 'require') || Object.values(value).some(hasRequire));
function entryPoints(name, metadata) {
  if (!metadata.exports)
    return metadata.main || metadata.module
      ? [
          {
            path: name,
            cjs: metadata.type !== 'module' || metadata.main?.endsWith('.cjs'),
          },
        ]
      : [];
  const entries =
    typeof metadata.exports === 'object' &&
    Object.keys(metadata.exports).some(key => key.startsWith('.'))
      ? metadata.exports
      : { '.': metadata.exports };
  return Object.entries(entries)
    .filter(([path, value]) => value !== null && !path.endsWith('.json'))
    .map(([path, value]) => {
      if (path.includes('*'))
        throw new Error(
          `Wildcard export requires an expanded consumer fixture: ${name}${path}`
        );
      return {
        path: path === '.' ? name : name + path.slice(1),
        cjs: hasRequire(value),
      };
    });
}

// This is separate from the all-local workspace consumer: only selected
// dependency edges use local archives; every unselected edge stays on npm.
export async function verifyPlanConsumers({
  repo,
  plan,
  artifacts,
  registry = 'https://registry.npmjs.org',
}) {
  const work = await mkdtemp(join(tmpdir(), 'lithent-plan-consumers-'));
  const results = [];
  for (const name of plan.order) {
    const selected = artifacts.get(name);
    const consumer = join(work, name.replace(/^@/, '').replaceAll('/', '-'));
    await mkdir(consumer);
    const closure = new Set();
    const visit = target => {
      if (closure.has(target)) return;
      closure.add(target);
      for (const edge of plan.dependencies.filter(
        edge => edge.consumer === target && edge.source === 'candidate'
      ))
        visit(edge.name);
    };
    visit(name);
    const dependencies = { [name]: `file:${selected.archivePath}` };
    const overrides = {};
    for (const target of closure) {
      const metadata = artifacts.get(target).packed;
      for (const [peer, range] of Object.entries(
        metadata.peerDependencies ?? {}
      )) {
        if (metadata.peerDependenciesMeta?.[peer]?.optional) continue;
        const edge = plan.dependencies.find(
          edge =>
            edge.consumer === target &&
            edge.name === peer &&
            edge.kind === 'peerDependencies'
        );
        let specifier;
        if (edge)
          specifier =
            edge.source === 'candidate'
              ? `file:${artifacts.get(peer).archivePath}`
              : edge.version;
        else {
          let local;
          try {
            local = await readJson(
              resolve(repo, 'node_modules', peer, 'package.json')
            );
          } catch {}
          specifier =
            local && semver.satisfies(local.version, range)
              ? local.version
              : range;
        }
        if (dependencies[peer] && dependencies[peer] !== specifier)
          throw new Error(`Conflicting required peer: ${name} -> ${peer}`);
        dependencies[peer] = specifier;
      }
      for (const edge of plan.dependencies.filter(
        edge => edge.consumer === target && edge.kind !== 'peerDependencies'
      )) {
        overrides[`${target}>${edge.name}`] =
          edge.source === 'candidate'
            ? `file:${artifacts.get(edge.name).archivePath}`
            : edge.version;
      }
    }
    const needsNodeTypes = Object.hasOwn(dependencies, 'vite');
    if (needsNodeTypes)
      dependencies['@types/node'] = (
        await readJson(resolve(repo, 'node_modules/@types/node/package.json'))
      ).version;
    await writeFile(
      join(consumer, 'package.json'),
      JSON.stringify({ private: true, type: 'module', dependencies }, null, 2)
    );
    // Internal registry dependencies are pinned to the exact version npm
    // serves, which this pipeline may have published minutes ago. pnpm's
    // release age gate is meant for third-party packages and would refuse
    // them, so only these first-party names are exempt.
    const releaseAgeExclude = [
      ...new Set(
        plan.dependencies
          .filter(
            edge => closure.has(edge.consumer) && edge.source === 'registry'
          )
          .map(edge => edge.name)
      ),
    ].sort();
    await writeFile(
      join(consumer, 'pnpm-workspace.yaml'),
      JSON.stringify(
        {
          overrides,
          ...(releaseAgeExclude.length && {
            minimumReleaseAgeExclude: releaseAgeExclude,
          }),
        },
        null,
        2
      )
    );
    await run(
      'pnpm',
      [
        'install',
        '--ignore-scripts',
        '--strict-peer-dependencies',
        '--no-frozen-lockfile',
        '--registry',
        registry,
      ],
      consumer
    );
    const installed = join(consumer, 'node_modules', name);
    const metadata = await readJson(join(installed, 'package.json'));
    if (metadata.name !== name || metadata.version !== selected.version)
      throw new Error(`Wrong installed candidate: ${name}`);
    const paths = entryPoints(name, metadata);
    await writeFile(
      join(consumer, 'probe.mjs'),
      `
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
const require = createRequire(import.meta.url);
for (const entry of ${JSON.stringify(paths)}) {
  const esm = await import(entry.path);
  assert(Object.keys(esm).length, entry.path + ' empty ESM exports');
  const variants = [esm];
  if (entry.cjs) {
    const cjs = require(entry.path);
    assert.deepEqual(Object.keys(cjs).sort(), Object.keys(esm).sort(), entry.path + ' CJS parity');
    variants.push(cjs);
  }
  for (const module of variants) if (typeof module.default === 'function') {
    const plugin = module.default(${JSON.stringify(name === '@lithent/lithent-vite' ? { template: true } : {})});
    assert(plugin, entry.path + ' factory');
    if (${JSON.stringify(['@lithent/lithent-vite', '@lithent/lithent-mdx', '@lithent/lithent-template-vite'])}.includes(entry.path)) {
      const {createServer} = await import('vite');
      const extension = entry.path.endsWith('lithent-mdx') ? '.mdx' : entry.path.endsWith('lithent-template-vite') ? '.ltsx' : '.tsx';
      const content = extension === '.mdx' ? '# release-consumer' : extension === '.ltsx'
        ? "export const App = () => <div>release-consumer</div>;"
        : "import {h,mount} from 'lithent'; /* lithent:hmr-boundary */ export const App = mount(() => () => h('p', {}, 'release-consumer'));";
      await writeFile('release-fixture' + extension, content);
      const server = await createServer({configFile: false, root: process.cwd(), plugins: [plugin],
        server: {middlewareMode: true, hmr: false, watch: null}, optimizeDeps: {noDiscovery: true}});
      try {
        const transformed = await server.transformRequest('/release-fixture' + extension);
        assert(transformed?.code.includes('release-consumer'), entry.path + ' transformed body');
        if (extension === '.tsx') assert(transformed.code.includes('import.meta.hot'), 'installed HMR dependency must actually transform');
        if (extension === '.mdx') assert(transformed.code.includes('mount'), 'MDX must wrap the installed compiler output');
        if (extension === '.ltsx') assert(!transformed.code.includes('<div>'), 'template syntax must be compiled');
      } finally { await server.close(); }
    }
  }
}
`
    );
    await run(process.execPath, ['probe.mjs'], consumer);
    for (const bin of typeof metadata.bin === 'string'
      ? [metadata.bin]
      : Object.values(metadata.bin ?? {})) {
      const help = await run(
        process.execPath,
        [join(installed, bin), '--help'],
        consumer
      );
      if (!/usage/i.test(help))
        throw new Error(`No installed CLI help: ${name}`);
    }
    for (const resolution of ['Node16', 'NodeNext']) {
      if (!paths.length) continue;
      const files = [];
      for (const [extension, entries] of [
        ['mts', paths],
        ['cts', paths.filter(entry => entry.cjs)],
      ]) {
        if (!entries.length) continue;
        const file = `consumer.${extension}`;
        files.push(file);
        await writeFile(
          join(consumer, file),
          entries
            .map(
              (entry, index) =>
                `import * as p${index} from '${entry.path}';\n// @ts-expect-error Missing exports must not become any.\np${index}.__lithent_missing_export__();`
            )
            .join('\n')
        );
      }
      const config = `tsconfig-${resolution}.json`;
      await writeFile(
        join(consumer, config),
        JSON.stringify({
          compilerOptions: {
            target: 'ES2022',
            module: resolution,
            moduleResolution: resolution,
            strict: true,
            skipLibCheck: false,
            noEmit: true,
            types: needsNodeTypes ? ['node'] : [],
          },
          files,
        })
      );
      await run(
        process.execPath,
        [resolve(repo, 'node_modules/typescript/bin/tsc'), '-p', config],
        consumer
      );
    }
    results.push({ name, version: selected.version, consumer });
    console.log(
      `PASS release candidate consumer: ${name}@${selected.version} (selected archives + registry dependencies)`
    );
  }
  return results;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const repo = fileURLToPath(new URL('../', import.meta.url));
  const proofPath = resolve(repo, 'artifacts/release-consumers.json');
  // Invalidate an earlier success before starting another verification.
  await mkdir(resolve(repo, 'artifacts'), { recursive: true });
  await writeFile(
    proofPath,
    JSON.stringify({
      schemaVersion: 1,
      status: 'failed',
      error: 'Consumer verification has not completed',
    }) + '\n'
  );
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--allow-dirty'))
    throw new Error(
      'Usage: node scripts/verify-plan-consumers.mjs [--allow-dirty]'
    );
  const inputs = await readReleaseInputs(
    repo,
    resolve(repo, 'artifacts/release'),
    { allowDirty: args.includes('--allow-dirty') }
  );
  const verified = await verifyPlanConsumers({ repo, ...inputs });
  await writeFile(
    proofPath,
    JSON.stringify(
      {
        schemaVersion: 1,
        status: 'passed',
        source: inputs.plan.source,
        planSha256: inputs.planSha256,
        manifestSha256: inputs.plan.manifestSha256,
        packages: verified.map(({ name, version }) => ({ name, version })),
      },
      null,
      2
    ) + '\n'
  );
}
