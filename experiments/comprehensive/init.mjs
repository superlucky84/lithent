import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../../', import.meta.url));
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
export const git = args =>
  execFileSync('git', args, { cwd: root, maxBuffer: 64 * 1024 ** 2 });
export const runtimeFiles = () =>
  fs
    .readdirSync(path.join(root, 'src'), { recursive: true })
    .filter(name => name.endsWith('.ts') && !name.startsWith('tests/'))
    .sort()
    .map(name => 'src/' + name);

export function guard(out) {
  const initial = read(path.join(out, 'initial.json'));
  for (const [file, digest] of Object.entries(initial.defaultFiles))
    assert.equal(hash(fs.readFileSync(path.join(root, file))), digest, file);
  for (const [file, digest] of Object.entries(initial.sibling.files))
    assert.equal(hash(fs.readFileSync(file)), digest, file);
  assert.equal(
    hash(fs.readFileSync(initial.browser.binary)),
    initial.browser.sha256
  );
  assert.equal(
    hash(fs.readFileSync(initial.browser.engine)),
    initial.browser.engineSHA256
  );
  return initial;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  assert(process.argv[2], 'Provide a fresh output directory');
  const baseline = 'fb481f3aa6d315c3d55fb1b2cb97d86f4e53c2e4';
  const baselineFiles = git(['ls-tree', '-r', '--name-only', baseline, 'src'])
    .toString()
    .trim()
    .split('\n')
    .filter(file => file.endsWith('.ts') && !file.startsWith('src/tests/'))
    .sort();
  assert.deepEqual(
    runtimeFiles(),
    baselineFiles,
    'Initialize from the recorded compact13 source checkout, not the adopted E runtime'
  );
  for (const file of baselineFiles)
    assert.equal(
      hash(fs.readFileSync(path.join(root, file))),
      hash(git(['show', `${baseline}:${file}`])),
      file
    );
  const requested = path.resolve(process.argv[2]);
  fs.mkdirSync(requested, { recursive: false });
  const out = fs.realpathSync(requested);
  const browser =
    '/tmp/lithent-shape-chrome-156.0.8078.47.app/Contents/MacOS/Google Chrome';
  const engine = path.resolve(
    browser,
    '../../Frameworks/Google Chrome Framework.framework/Versions/Current/Google Chrome Framework'
  );
  const files = runtimeFiles();
  const defaultNames = [
    ...files,
    'package.json',
    'pnpm-lock.yaml',
    'vite.config.js',
    'scripts/size-report.js',
    'dist/lithent.mjs',
    'dist/lithent.umd.js',
    'dist/lithent.cjs',
    ...fs
      .readdirSync(path.join(root, 'lithentConcurrent/src'), {
        recursive: true,
      })
      .filter(name => name.endsWith('.ts') && !name.startsWith('tests/'))
      .map(name => 'lithentConcurrent/src/' + name),
  ];
  const sibling = path.resolve(root, '../js-framework-benchmark-upstream');
  const siblingNames = [
    'package.json',
    'frameworks/keyed/lithent/src/main.tsx',
    'webdriver-ts/package.json',
    'webdriver-ts/package-lock.json',
    ...[
      'react-hooks',
      'react-classes',
      'preact-hooks',
      'preact-classes',
    ].flatMap(name =>
      ['package.json', 'package-lock.json'].map(
        file => `frameworks/keyed/${name}/${file}`
      )
    ),
  ];
  const initial = {
    at: new Date().toISOString(),
    head: git(['rev-parse', 'HEAD']).toString().trim(),
    status: git(['status', '--short']).toString(),
    node: process.version,
    nodeBinary: process.execPath,
    browser: {
      binary: browser,
      sha256: hash(fs.readFileSync(browser)),
      engine,
      engineSHA256: hash(fs.readFileSync(engine)),
      expectedVersion: '156.0.8078.47',
    },
    defaultFiles: Object.fromEntries(
      defaultNames.map(file => [
        file,
        hash(fs.readFileSync(path.join(root, file))),
      ])
    ),
    sibling: {
      head: execFileSync('git', ['rev-parse', 'HEAD'], {
        cwd: sibling,
        encoding: 'utf8',
      }).trim(),
      status: execFileSync('git', ['status', '--short'], {
        cwd: sibling,
        encoding: 'utf8',
      }),
      files: Object.fromEntries(
        siblingNames.map(name => {
          const file = path.join(sibling, name);
          return [file, hash(fs.readFileSync(file))];
        })
      ),
    },
    preserved: {
      snapshot: '6993a93cecf67e445b30ee4ea014ca419235d946',
      flat: '7e838bcd723261cb3840388f4f0ce1dd8c13e7ec',
      slot: '189ddef82e20959ea1267ab2eb8b2f5007c4ba9a',
    },
    variants: {},
  };
  for (const variant of [
    'baseline',
    'slot',
    'flat-original',
    'event',
    'c2',
    'combined',
  ]) {
    const dest = path.join(out, variant);
    const commit =
      variant === 'slot'
        ? initial.preserved.slot
        : ['flat-original', 'event'].includes(variant)
          ? initial.preserved.flat
          : null;
    const names = commit ? [...files, 'src/utils/event.ts'] : files;
    const manifest = {};
    for (const file of names) {
      const bytes = commit
        ? git(['show', `${commit}:${file}`])
        : fs.readFileSync(path.join(root, file));
      const target = path.join(dest, file);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, bytes);
      manifest[file] = hash(bytes);
      if (
        commit &&
        ![
          'src/render.ts',
          'src/hook/internal/unmount.ts',
          'src/utils/event.ts',
        ].includes(file)
      )
        assert.equal(manifest[file], initial.defaultFiles[file], file);
    }
    initial.variants[variant] = manifest;
    fs.symlinkSync(
      path.join(root, 'node_modules'),
      path.join(dest, 'node_modules')
    );
    fs.writeFileSync(
      path.join(dest, 'package.json'),
      JSON.stringify({ private: true, type: 'module' }) + '\n'
    );
    const config = read(path.join(root, 'tsconfig.json'));
    config.compilerOptions.baseUrl = dest;
    config.compilerOptions.types = [];
    config.include = ['src'];
    fs.writeFileSync(
      path.join(dest, 'tsconfig.json'),
      JSON.stringify(config, null, 2) + '\n'
    );
  }
  fs.writeFileSync(
    path.join(out, 'initial.json'),
    JSON.stringify(initial, null, 2) + '\n'
  );
  guard(out);
  console.log(
    JSON.stringify({
      out,
      head: initial.head,
      runtimeFiles: files.length,
      guardedFiles: defaultNames.length,
      browser: initial.browser.expectedVersion,
    })
  );
}
