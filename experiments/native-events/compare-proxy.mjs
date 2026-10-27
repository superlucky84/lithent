// Recompress preserved E bytes and current native bytes with one compressor.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const out = fs.realpathSync(process.argv[2]);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const readJSON = file => JSON.parse(fs.readFileSync(path.join(root, file)));
const adoption = readJSON('docs/benchmark/comprehensive-adoption.json');
const manifest = readJSON(
  'docs/benchmark/comprehensive-evidence-manifest.json'
);
const archive = 'comprehensive-evidence.tar.gz';
const archiveFile = path.join(root, 'docs/benchmark', archive);
assert.equal(
  hash(fs.readFileSync(archiveFile)),
  manifest.archives.find(item => item.file === archive).sha256
);
const destination = path.join(out, 'previous-proxy');
fs.mkdirSync(destination, { recursive: true });
const result = {
  node: process.version,
  zlib: process.versions.zlib,
  files: {},
};
for (const [folder, stem, key] of [
  ['dist', 'lithent', 'bundles'],
  ['lithentConcurrent/dist', 'lithentConcurrent', 'concurrentBundles'],
]) {
  for (const suffix of ['mjs', 'umd.js', 'cjs']) {
    const name = `${stem}.${suffix}`;
    const bytes = execFileSync('tar', [
      '-xOf',
      archiveFile,
      `run/final-packages/${folder}/${name}`,
    ]);
    assert.equal(hash(bytes), adoption[key][name].sha256, name);
    fs.writeFileSync(path.join(destination, name), bytes);
    result.files[name] = {
      sha256: hash(bytes),
      raw: bytes.length,
      gzip: gzipSync(bytes, { level: 9 }).length,
      br: brotliCompressSync(bytes).length,
    };
  }
}
const artifacts = JSON.parse(fs.readFileSync(path.join(out, 'artifacts.json')));
assert.equal(artifacts.node, result.node);
assert.equal(artifacts.zlib, result.zlib);
fs.writeFileSync(
  path.join(out, 'same-compressor-proxy.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(
  'Preserved E verified and recompressed with the native build compressor.'
);
