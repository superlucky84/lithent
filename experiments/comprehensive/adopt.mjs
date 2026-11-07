// Apply only the measured event runtime after collection and independent audits.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { root, hash, read, guard, git, runtimeFiles } from './init.mjs';

const out = fs.realpathSync(process.argv[2]);
const mode = process.argv[3];
assert(['apply', 'verify'].includes(mode));
const selected = read(path.join(out, 'selection.json'));
assert.equal(selected.selected, 'event');
const compiled = read(path.join(out, 'event/build.json'));
const concurrent = read(path.join(out, 'concurrent-inputs.json')).files.event;
const changes = [
  'src/render.ts',
  'src/hook/internal/unmount.ts',
  'src/utils/event.ts',
  'lithentConcurrent/src/render.ts',
];
const checkSources = () => {
  for (const [file, digest] of Object.entries(compiled.sources))
    assert.equal(
      hash(fs.readFileSync(path.join(root, 'src', file))),
      digest,
      file
    );
  assert.deepEqual(
    runtimeFiles(),
    Object.keys(compiled.sources)
      .map(file => 'src/' + file)
      .sort()
  );
  for (const [file, digest] of Object.entries(concurrent))
    assert.equal(hash(fs.readFileSync(path.join(root, file))), digest, file);
};
if (mode === 'apply') {
  const initial = guard(out);
  for (const scope of ['core', 'final-event'])
    assert(read(path.join(out, scope + '-audit.json')).pass);
  for (const scope of ['event', 'ui'])
    assert(read(path.join(out, scope + '-audit.json')).pass);
  assert(read(path.join(out, 'dispose-results.json')).complete);
  assert(read(path.join(out, 'retention.json')).complete);
  for (const [file, digest] of Object.entries(compiled.sources))
    assert.equal(
      hash(fs.readFileSync(path.join(out, 'event/src', file))),
      digest,
      file
    );
  for (const [file, digest] of Object.entries(concurrent))
    assert.equal(
      hash(fs.readFileSync(path.join(out, 'event', file))),
      digest,
      file
    );
  fs.writeFileSync(
    path.join(out, 'before-adoption.json'),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        head: git(['rev-parse', 'HEAD']).toString().trim(),
        status: git(['status', '--short']).toString(),
        defaultFiles: initial.defaultFiles,
        changes: Object.fromEntries(
          changes.map(file => [
            file,
            {
              before: fs.existsSync(path.join(root, file))
                ? hash(fs.readFileSync(path.join(root, file)))
                : null,
              after: hash(fs.readFileSync(path.join(out, 'event', file))),
            },
          ])
        ),
        selected: 'event',
        note: 'All measurements and analyses finished with compact13 default guards unchanged. Apply exact isolated sources, then build actual packages; never copy generated dist by hand.',
      },
      null,
      2
    ) + '\n',
    { flag: 'wx' }
  );
  for (const file of changes) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.copyFileSync(path.join(out, 'event', file), path.join(root, file));
  }
  checkSources();
  console.log(
    'Applied exact E source to base/shared teardown/concurrent; run normal package builds and update the measured size allowance.'
  );
} else {
  checkSources();
  const bundles = {};
  for (const [file, expected] of Object.entries(compiled.bundles)) {
    const bytes = fs.readFileSync(path.join(root, 'dist', file));
    assert.equal(hash(bytes), expected.sha256, file);
    bundles[file] = {
      sha256: hash(bytes),
      raw: bytes.length,
      gzip: gzipSync(bytes, { level: 9 }).length,
      br: brotliCompressSync(bytes).length,
    };
    assert.deepEqual(bundles[file], expected);
  }
  const initial = read(path.join(out, 'initial.json'));
  for (const [file, digest] of Object.entries(initial.sibling.files))
    assert.equal(hash(fs.readFileSync(file)), digest, file);
  const sources = Object.fromEntries(
    [...runtimeFiles(), ...Object.keys(concurrent)].map(file => [
      file,
      hash(fs.readFileSync(path.join(root, file))),
    ])
  );
  const concurrentBundles = Object.fromEntries(
    ['mjs', 'umd.js', 'cjs'].map(suffix => {
      const file = `lithentConcurrent.${suffix}`,
        bytes = fs.readFileSync(
          path.join(root, 'lithentConcurrent/dist', file)
        );
      return [
        file,
        {
          sha256: hash(bytes),
          raw: bytes.length,
          gzip: gzipSync(bytes, { level: 9 }).length,
          br: brotliCompressSync(bytes).length,
        },
      ];
    })
  );
  fs.writeFileSync(
    path.join(out, 'adoption.json'),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        head: git(['rev-parse', 'HEAD']).toString().trim(),
        selected: 'event',
        sources,
        bundles,
        concurrentBundles,
        siblingUnchanged: true,
      },
      null,
      2
    ) + '\n',
    { flag: 'wx' }
  );
  console.log(
    JSON.stringify(
      {
        selected: 'event',
        sourceFiles: Object.keys(sources).length,
        bundles,
        concurrentBundles,
        siblingUnchanged: true,
      },
      null,
      2
    )
  );
}
