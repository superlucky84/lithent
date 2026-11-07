import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
export const hash = bytes =>
  crypto.createHash('sha256').update(bytes).digest('hex');
export const read = file => JSON.parse(fs.readFileSync(file));
export function guard(out) {
  const initial = read(path.join(out, 'initial.json'));
  for (const [file, sha] of Object.entries(initial.defaultFiles))
    assert.equal(hash(fs.readFileSync(path.join(root, file))), sha, file);
  for (const [file, sha] of Object.entries(initial.siblingFiles))
    assert.equal(hash(fs.readFileSync(file)), sha, file);
  return initial;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const requested = path.resolve(process.argv[2] || '/tmp/lithent-c2-20261023');
  assert.equal(
    fs.existsSync(requested),
    false,
    'Choose a fresh experiment directory'
  );
  fs.mkdirSync(requested, { recursive: true });
  const out = fs.realpathSync(requested);
  const historical = read(
    path.join(root, 'docs/benchmark/parent-memo-isolation-results.json')
  );
  const initial = {
    at: new Date().toISOString(),
    head: execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: root,
      encoding: 'utf8',
    }).trim(),
    status: execFileSync('git', ['status', '--short'], {
      cwd: root,
      encoding: 'utf8',
    }),
    node: process.version,
    zlib: process.versions.zlib,
    defaultFiles: { ...historical.provenance.baseline },
    historicalBuildDifferences: {},
    siblingFiles: {},
    missingInputs: [],
    sources: {},
  };
  initial.defaultFiles['package.json'] = historical.defaultPackageSHA256;
  const sibling = path.resolve(root, '../js-framework-benchmark-upstream');
  for (const name of [
    'package.json',
    'frameworks/keyed/lithent/src/main.tsx',
  ]) {
    const file = path.join(sibling, name);
    if (fs.existsSync(file))
      initial.siblingFiles[file] = hash(fs.readFileSync(file));
    else initial.missingInputs.push(file);
  }
  const chrome =
    '/tmp/lithent-benchmark-chrome-155.0.8059.85.app/Contents/MacOS/Google Chrome';
  if (!fs.existsSync(chrome)) initial.missingInputs.push(chrome);
  for (const [file, sha] of Object.entries(initial.defaultFiles)) {
    const bytes = fs.readFileSync(path.join(root, file));
    const actual = hash(bytes);
    if (file.includes('dist/') && actual !== sha)
      initial.historicalBuildDifferences[file] = { expected: sha, actual };
    else assert.equal(actual, sha, file);
    initial.defaultFiles[file] = actual;
    const target = path.join(out, 'default', file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes);
  }
  for (const entry of fs.readdirSync(path.join(root, 'src'), {
    recursive: true,
  })) {
    if (!entry.endsWith('.ts') || entry.startsWith('tests/')) continue;
    const bytes = fs.readFileSync(path.join(root, 'src', entry));
    initial.sources['src/' + entry] = hash(bytes);
    for (const variant of ['baseline', 'candidate']) {
      const target = path.join(out, variant, 'src', entry);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, bytes);
    }
  }
  for (const variant of ['baseline', 'candidate']) {
    const runtime = path.join(out, variant);
    fs.symlinkSync(
      path.join(root, 'node_modules'),
      path.join(runtime, 'node_modules')
    );
    fs.writeFileSync(
      path.join(runtime, 'package.json'),
      JSON.stringify(
        { name: 'lithent-c2-' + variant, private: true, type: 'module' },
        null,
        2
      ) + '\n'
    );
    fs.writeFileSync(
      path.join(runtime, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            target: 'ESNext',
            module: 'ESNext',
            moduleResolution: 'node',
            lib: ['DOM', 'DOM.Iterable', 'ESNext'],
            strict: true,
            skipLibCheck: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
            noImplicitReturns: true,
            isolatedModules: true,
            esModuleInterop: true,
            declaration: true,
            types: [],
            baseUrl: runtime,
            paths: { '@/*': ['src/*'] },
          },
          include: ['src'],
          exclude: ['dist'],
        },
        null,
        2
      ) + '\n'
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
      sources: Object.keys(initial.sources).length,
      defaultFiles: Object.keys(initial.defaultFiles).length,
      head: initial.head,
    })
  );
}
