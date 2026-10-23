import fs from 'node:fs';
import path from 'node:path';
import { root, bench, names, fileHash, read, guard } from './config.mjs';

const out = path.resolve(process.argv[2] || '/tmp/lithent-peers-20261023');
guard(out);
const p = read(path.join(out, 'provenance.json')),
  files = {};
const add = (file, kind) => {
  files[file] = { sha256: fileHash(file), kind };
};
for (const file of Object.keys(p.baseline))
  add(path.join(root, file), 'default-runtime');
for (const file of [
  'package.json',
  'helper/src/hook/cacheUpdate.ts',
  'docs/benchmark/production-run.mjs',
  'docs/benchmark/official-memory.mjs',
])
  add(path.join(root, file), 'repository');
for (const [name, peer] of Object.entries(p.peers)) {
  for (const relative of Object.keys(peer.source))
    for (const dir of [
      path.join(bench, 'frameworks/keyed', name),
      path.join(out, 'sources', name),
    ])
      add(path.join(dir, relative), 'peer-source');
  for (const item of peer.packages)
    if (!item.optionalAbsent)
      add(
        path.join(
          peer.installedNodeModules,
          '..',
          item.package,
          'package.json'
        ),
        'dependency-package'
      );
  for (const [runtime, entries] of Object.entries(peer.runtime))
    for (const file of Object.keys(entries))
      add(
        path.join(peer.installedNodeModules, runtime, file),
        'runtime-dependency'
      );
}
const walk = dir =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap(entry =>
      entry.isDirectory()
        ? walk(path.join(dir, entry.name))
        : entry.isFile()
          ? [path.join(dir, entry.name)]
          : []
    );
for (const dir of ['webdriver-ts/src', 'webdriver-ts/dist', 'css'])
  for (const file of walk(path.join(bench, dir)))
    if (!file.endsWith('.map')) add(file, 'upstream-runner-css');
for (const file of [
  'webdriver-ts-results/src/Common.ts',
  'package.json',
  'package-lock.json',
  'webdriver-ts/package.json',
])
  add(path.join(bench, file), 'upstream-config');
for (const round of ['round-main', 'round-reverse']) {
  const manifest = read(path.join(out, round, 'build-manifest.json'));
  for (const name of names)
    for (const file of [manifest[name].entryJS, 'index.html'])
      add(path.join(out, round, name, file), 'production');
  add(path.join(out, round, 'build-manifest.json'), 'manifest');
  add(path.join(out, round, 'versions.json'), 'manifest');
}
fs.writeFileSync(
  path.join(out, 'frozen-inputs.json'),
  JSON.stringify({ at: new Date().toISOString(), files }, null, 2) + '\n'
);
console.log('Frozen inputs:', Object.keys(files).length);
