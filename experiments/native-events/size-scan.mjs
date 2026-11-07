// DC-24: isolated output experiments; never writes workspace dist or runtime.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { minify } from 'terser';

const root = fileURLToPath(new URL('../../', import.meta.url));
const out = path.resolve(process.argv[2]);
fs.mkdirSync(out, { recursive: true });
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const sizes = bytes => ({
  raw: bytes.length,
  gzip: gzipSync(bytes, { level: 9 }).length,
  br: brotliCompressSync(bytes).length,
  sha256: hash(bytes),
});
const original = fs.readFileSync(
  path.join(root, 'dist/lithent.umd.js'),
  'utf8'
);
const comment = '\n//# sourceMappingURL=lithent.umd.js.map\n';
assert(original.endsWith(comment));
const bare = original.slice(0, -comment.length);
const result = {
  node: process.version,
  zlib: process.versions.zlib,
  baseline: sizes(Buffer.from(original)),
  variants: [],
  formats: {},
};
const save = (name, code, options, risk) => {
  fs.writeFileSync(path.join(out, name + '.js'), code);
  result.variants.push({ name, ...sizes(Buffer.from(code)), options, risk });
};
save(
  'hidden-map',
  bare + '\n',
  {},
  'Automatic source-map linking is removed; JS tokens stay identical.'
);
const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_';
const nth = first => ({
  get(index) {
    const rest = first + '0123456789';
    let name = first[index % first.length];
    index = Math.floor(index / first.length);
    while (index > 0) {
      index--;
      name += rest[index % rest.length];
      index = Math.floor(index / rest.length);
    }
    return name;
  },
});
const candidates = [
  ['rename-standard', { compress: false, mangle: true }],
  [
    'rename-lines',
    { compress: false, mangle: true, format: { semicolons: false } },
  ],
  [
    'syntax',
    {
      compress: {
        defaults: false,
        booleans: true,
        comparisons: true,
        conditionals: true,
        evaluate: true,
        properties: true,
        typeofs: true,
      },
      mangle: true,
    },
  ],
  [
    'syntax-return',
    {
      compress: {
        defaults: false,
        booleans: true,
        comparisons: true,
        conditionals: true,
        evaluate: true,
        properties: true,
        typeofs: true,
        if_return: true,
      },
      mangle: true,
    },
  ],
];
for (let i = 0; i < 16; i++) {
  const first = alphabet.slice(i) + alphabet.slice(0, i);
  candidates.push([
    `alphabet-${i}`,
    { compress: false, mangle: { nth_identifier: nth(first) } },
  ]);
}
for (const [name, options] of candidates) {
  const code = (await minify(bare, options)).code;
  const serialized = JSON.parse(
    JSON.stringify(options, (_key, value) =>
      typeof value === 'function' ? '[function]' : value
    )
  );
  save(
    name,
    code + comment,
    serialized,
    name.startsWith('syntax')
      ? 'Expression transforms: additional runtime/scope/performance checks required.'
      : 'Rename/reprint only: requires actual-build reproduction and scope checks.'
  );
  save(
    name + '-hidden',
    code + '\n',
    serialized,
    'Combined with hidden-map debugging tradeoff.'
  );
}
for (const folder of ['dist', 'lithentConcurrent/dist']) {
  const stem = folder === 'dist' ? 'lithent' : 'lithentConcurrent';
  for (const suffix of ['mjs', 'umd.js', 'cjs']) {
    const file = `${folder}/${stem}.${suffix}`;
    const bytes = fs.readFileSync(path.join(root, file));
    const hidden = bytes
      .toString()
      .replace(/\n\/\/# sourceMappingURL=[^\n]*\n?$/, '\n');
    result.formats[file] = {
      baseline: sizes(bytes),
      hiddenMap: sizes(Buffer.from(hidden)),
    };
  }
}
result.variants.sort((a, b) => a.br - b.br || a.gzip - b.gzip);
fs.writeFileSync(
  path.join(out, 'scan.json'),
  JSON.stringify(result, null, 2) + '\n'
);
assert.equal(
  hash(fs.readFileSync(path.join(root, 'dist/lithent.umd.js'))),
  result.baseline.sha256
);
console.log(
  JSON.stringify(
    {
      baseline: result.baseline,
      best: result.variants.slice(0, 9),
      hidden: result.variants.find(row => row.name === 'hidden-map'),
    },
    null,
    2
  )
);
