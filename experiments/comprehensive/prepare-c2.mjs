import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { root, hash, guard, read } from './init.mjs';

const out = fs.realpathSync(process.argv[2]);
guard(out);
const candidate = path.join(out, 'c2');
const combined = path.join(out, 'combined');
assert(!fs.existsSync(path.join(out, 'combination-inputs.json')));
assert(!fs.existsSync(path.join(candidate, 'build.json')));
assert(!fs.existsSync(path.join(combined, 'build.json')));
const patch = path.join(root, 'docs/benchmark/keyed-placement-candidate.patch');
const backup = candidate + '-before-' + Date.now();
fs.renameSync(candidate, backup);
fs.mkdirSync(candidate);
fs.cpSync(path.join(out, 'baseline/src'), path.join(candidate, 'src'), {
  recursive: true,
});
fs.copyFileSync(
  path.join(backup, 'package.json'),
  path.join(candidate, 'package.json')
);
const config = read(path.join(backup, 'tsconfig.json'));
config.compilerOptions.baseUrl = candidate;
fs.writeFileSync(
  path.join(candidate, 'tsconfig.json'),
  JSON.stringify(config, null, 2) + '\n'
);
fs.symlinkSync(
  path.join(root, 'node_modules'),
  path.join(candidate, 'node_modules')
);
const rebased = path.join(out, 'c2-rebased.patch');
const patchText = fs.readFileSync(patch, 'utf8');
assert(patchText.includes('@@ -23,6 +23,7 @@'));
fs.writeFileSync(
  rebased,
  patchText
    .replace('@@ -23,6 +23,7 @@', '@@ -23,7 +23,8 @@')
    .replace(
      "+import { childOrderRef } from '@/utils/childOrder';\n import { runUpdateCallback }",
      "+import { childOrderRef } from '@/utils/childOrder';\n import { createWDom } from '@/utils/createWDom';\n import { runUpdateCallback }"
    )
);
const result = spawnSync(
  'patch',
  ['--batch', '--fuzz=0', '-p1', '-d', candidate, '-i', rebased],
  { encoding: 'utf8' }
);
fs.writeFileSync(
  path.join(out, 'c2-patch-' + Date.now() + '.log'),
  String(result.stdout || '') + String(result.stderr || '')
);
assert.equal(result.status, 0, result.stdout + result.stderr);
fs.cpSync(path.join(candidate, 'src'), path.join(combined, 'src'), {
  recursive: true,
});
const renderer = path.join(combined, 'src/render.ts');
const source = fs.readFileSync(renderer, 'utf8');
const start = source.indexOf('const updateEvent =');
const end = source.indexOf('const updateStyle =');
assert(start >= 0 && end > start);
fs.writeFileSync(
  renderer,
  source
    .slice(0, start)
    .replace(
      "import { cloneWDom } from '@/wDom';",
      "import { cloneWDom } from '@/wDom';\nimport { updateEvent } from '@/utils/event';"
    ) + source.slice(end)
);
for (const file of ['src/utils/event.ts', 'src/hook/internal/unmount.ts'])
  fs.copyFileSync(path.join(out, 'event', file), path.join(combined, file));
const files = name =>
  Object.fromEntries(
    fs
      .readdirSync(path.join(out, name, 'src'), { recursive: true })
      .filter(file => file.endsWith('.ts'))
      .sort()
      .map(file => [
        file,
        hash(fs.readFileSync(path.join(out, name, 'src', file))),
      ])
  );
const manifest = {
  at: new Date().toISOString(),
  patch: hash(fs.readFileSync(patch)),
  rebasedPatch: hash(fs.readFileSync(rebased)),
  preservedPreviousCandidate: backup,
  c2: files('c2'),
  combined: files('combined'),
  event: files('event'),
};
fs.writeFileSync(
  path.join(out, 'combination-inputs.json'),
  JSON.stringify(manifest, null, 2) + '\n',
  { flag: 'wx' }
);
guard(out);
console.log(
  JSON.stringify({
    patchApplied: true,
    c2Sources: Object.keys(manifest.c2).length,
    combinedSources: Object.keys(manifest.combined).length,
  })
);
