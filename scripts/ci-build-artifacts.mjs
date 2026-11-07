import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertSource,
  inventory,
  readJson,
  sourceIdentity,
  verifyReleaseManifest,
} from './artifact-utils.mjs';
import { readReleaseInputs } from './release-inputs.mjs';
import { verifyConsumerProof } from './execute-release.mjs';

const repo = fileURLToPath(new URL('../', import.meta.url));
const directories = [
  'dist',
  'lithentConcurrent/dist',
  'lithentConcurrent/helper/dist',
  'jsx-runtime/dist',
  'helper/dist',
  'devHelper/dist',
  'ssr/dist',
  'tag/dist',
  'ftags/dist',
  'element/dist',
  'element/playground/dist',
  'packages/hmrParser/dist',
  'packages/lithentMdx/dist',
  'packages/lithentVite/dist',
  'packages/lithentTemplateParser/dist',
  'packages/lithentTemplateVite/dist',
  'createLithent/dist',
  'examples/dist',
  'lithentDocs/dist',
  'createLithent/basic/dist',
  'createLithent/express/dist',
  'artifacts/release',
  'artifacts/release-plan.json',
  'artifacts/release-plan.md',
  'artifacts/release-consumers.json',
];
const mode = process.argv[2];
if (
  !['create', 'verify'].includes(mode) ||
  process.argv.slice(3).some(arg => arg !== '--require-clean')
)
  throw new Error(
    'Usage: node scripts/ci-build-artifacts.mjs create|verify [--require-clean]'
  );
const source = sourceIdentity(repo);
const requireClean = process.argv.includes('--require-clean');
assertSource(source, source.revision, requireClean);
const manifestPath = resolve(repo, 'artifacts/build-manifest.json');
await verifyReleaseManifest(resolve(repo, 'artifacts/release'), {
  revision: source.revision,
  requireClean,
});
const inputs = await readReleaseInputs(
  repo,
  resolve(repo, 'artifacts/release'),
  { allowDirty: !requireClean }
);
verifyConsumerProof(
  {
    ...inputs,
    proof: await readJson(resolve(repo, 'artifacts/release-consumers.json')),
  },
  { requireClean }
);
const files = await inventory(repo, directories);
if (mode === 'create') {
  await mkdir(resolve(repo, 'artifacts'), { recursive: true });
  await writeFile(
    manifestPath,
    JSON.stringify({ schemaVersion: 1, source, files }, null, 2) + '\n'
  );
  execFileSync('tar', ['-czf', 'artifacts/ci-build.tgz', ...directories], {
    cwd: repo,
    stdio: 'inherit',
  });
} else {
  const manifest = await readJson(manifestPath);
  assertSource(manifest.source, source.revision, requireClean);
  if (
    manifest.schemaVersion !== 1 ||
    JSON.stringify(manifest.files) !== JSON.stringify(files)
  )
    throw new Error('Build artifact file inventory/integrity mismatch');
}
console.log(
  `PASS ${mode} build artifact (${Object.keys(files).length} files, ${source.revision}, dirty=${source.dirty})`
);
