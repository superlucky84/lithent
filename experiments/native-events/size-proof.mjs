// Record the actual-build checks without attributing runtime guarantees to syntax candidates.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const out = fs.realpathSync(process.argv[2]);
const require = createRequire(import.meta.url);
const { parse } = createRequire(require.resolve('terser/package.json'))(
  'acorn'
);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const scan = JSON.parse(fs.readFileSync(path.join(out, 'scan.json')));
const builds = JSON.parse(fs.readFileSync(path.join(out, 'builds.json')));
const native = JSON.parse(
  fs.readFileSync(
    path.join(root, 'docs/benchmark/native-events-validation.json')
  )
);
assert(builds.complete);
assert.equal(scan.node, builds.node);
assert.equal(scan.zlib, builds.zlib);
for (const [file, expected] of Object.entries(native.artifacts.sources))
  assert.equal(hash(fs.readFileSync(path.join(root, file))), expected, file);
for (const [file, expected] of Object.entries(native.artifacts.bundles))
  assert.equal(
    hash(fs.readFileSync(path.join(root, file))),
    expected.sha256,
    file
  );

const proof = {
  node: scan.node,
  zlib: scan.zlib,
  candidates: scan.variants.length,
  actualBuilds: builds.builds.length,
  workspaceRuntimeAndSixArtifactsUnchanged: true,
  hiddenMapChecks: [],
  syntaxStaticChecks: [],
  newBrowserTests: false,
  newPerformanceOrHeapCollection: false,
  defaultBuildChanged: false,
  toolCorrection:
    'Initial AST check included Program.end (full file length). The corrected check compares complete Program.body nodes, excluding the removed EOF comment length.',
  versions: {
    terser: require('terser/package.json').version,
    vite: require('vite/package.json').version,
  },
  inputs: Object.fromEntries(
    [
      'vite.config.js',
      'lithentConcurrent/vite.config.js',
      'package.json',
      'pnpm-lock.yaml',
      'docs/benchmark/native-events-validation.json',
    ].map(file => [file, hash(fs.readFileSync(path.join(root, file)))])
  ),
};
for (const core of ['base', 'concurrent']) {
  const control = builds.builds.find(
    row => row.core === core && row.name === 'control'
  );
  const hidden = builds.builds.find(
    row => row.core === core && row.name === 'hidden'
  );
  for (const file of Object.keys(control.files)) {
    const a = fs.readFileSync(
      path.join(out, 'builds', core, 'control', file),
      'utf8'
    );
    const b = fs.readFileSync(
      path.join(out, 'builds', core, 'hidden', file),
      'utf8'
    );
    const withoutMap = a.replace(/\n\/\/# sourceMappingURL=[^\n]*\n?$/, '\n');
    assert.equal(withoutMap, b);
    assert.deepEqual(
      parse(a, {
        ecmaVersion: 'latest',
        sourceType: file.endsWith('.mjs') ? 'module' : 'script',
      }).body,
      parse(b, {
        ecmaVersion: 'latest',
        sourceType: file.endsWith('.mjs') ? 'module' : 'script',
      }).body
    );
    assert.equal(control.files[file].mapSHA256, hidden.files[file].mapSHA256);
    proof.hiddenMapChecks.push({
      core,
      file,
      codeEqualIgnoringFinalComment: true,
      astEqual: true,
      mapBytesEqual: true,
      baseline: control.files[file],
      hidden: hidden.files[file],
    });
  }
}

function functionShape(code) {
  const result = { functions: 0, isolatedParentGetters: 0 };
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (
      [
        'ArrowFunctionExpression',
        'FunctionDeclaration',
        'FunctionExpression',
      ].includes(node.type)
    ) {
      result.functions++;
      if (
        node.type === 'ArrowFunctionExpression' &&
        node.params.length === 1 &&
        node.body.type === 'ArrowFunctionExpression' &&
        node.body.params.length === 0 &&
        node.body.body.type === 'Identifier' &&
        node.params[0].type === 'Identifier' &&
        node.body.body.name === node.params[0].name
      )
        result.isolatedParentGetters++;
    }
    for (const value of Object.values(node))
      if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === 'object') walk(value);
  }
  walk(parse(code, { ecmaVersion: 'latest' }));
  return result;
}
const baseDir = path.join(out, 'builds/base');
const baselineShape = functionShape(
  fs.readFileSync(path.join(baseDir, 'control/lithent.umd.js'), 'utf8')
);
assert(baselineShape.isolatedParentGetters > 0);
for (const name of [
  'syntax',
  'syntax-return',
  'syntax-hidden',
  'syntax-return-hidden',
]) {
  const shape = functionShape(
    fs.readFileSync(path.join(baseDir, name, 'lithent.umd.js'), 'utf8')
  );
  assert.deepEqual(shape, baselineShape);
  proof.syntaxStaticChecks.push({
    name,
    ...shape,
    limitation:
      'Function counts and isolated getter pattern only; no runtime/heap/performance claim.',
  });
}
proof.complete = true;
fs.writeFileSync(
  path.join(out, 'proof.json'),
  JSON.stringify(proof, null, 2) + '\n'
);
console.log(
  JSON.stringify({
    complete: true,
    candidates: proof.candidates,
    builds: proof.actualBuilds,
    hiddenMapIdenticalASTAndMap: proof.hiddenMapChecks.length,
    staticFunctionShape: baselineShape,
    defaultBuildChanged: false,
  })
);
