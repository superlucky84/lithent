import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import ts from 'typescript';
import { build } from 'vite';
import { root, hash, guard } from '../keyed-placement/init.mjs';

const out = fs.realpathSync(process.argv[2]);
const variant = process.argv[3] || 'baseline';
assert.ok(['baseline', 'candidate'].includes(variant));
guard(out);
const archive = fs.readFileSync(
  path.join(root, 'docs/benchmark/peer-baseline-evidence.json.gz')
);
assert.equal(
  hash(archive),
  '5ec4db084140ac0e1379d82c2c691d7fc437c24e1e4484d8cc823a0d7071412e'
);
const evidence = JSON.parse(zlib.gunzipSync(archive));
const inputs = {};
for (const [name, key] of Object.entries({
  'production/main.js': 'run/round-main/lithent/main.js',
  'production/main.js.map': 'run/diagnosis-source-map/main.js.map',
  'source/src/main.tsx': 'run/sources/lithent/src/main.tsx',
  'source/cacheUpdate.ts': 'run/sources/lithent/cacheUpdate.ts',
})) {
  const item = evidence.files[key];
  const bytes = Buffer.from(item.content, item.encoding || 'utf8');
  assert.equal(hash(bytes), item.sha256, key);
  const file = path.join(out, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, bytes);
  inputs[name] = { archiveKey: key, sha256: hash(bytes) };
}
assert.equal(
  inputs['production/main.js'].sha256,
  '12d25a3bf28c163d67c6734119ad7407473b362b136b91bc8f3ef7523db9be12'
);
const html = script =>
  `<!doctype html><meta charset="utf-8"><div id="main"></div><script type="module" src="./${script}"></script>\n`;
fs.writeFileSync(path.join(out, 'production/index.html'), html('main.js'));
fs.writeFileSync(
  path.join(out, 'source/entry.ts'),
  "import './src/main';\nexport { componentMap, nextTick } from 'lithent';\n"
);

function once(code, before, after) {
  assert.equal(code.split(before).length, 2, before);
  return code.replace(before, after);
}
const factorySites = [];
function instrument(code, file) {
  if (file === 'wDom.ts' || file === 'utils/createWDom.ts') {
    const source = ts.createSourceFile(
      file,
      code,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS
    );
    const result = ts.transform(source, [
      context => {
        const visit = node => {
          if (
            ts.isObjectLiteralExpression(node) &&
            node.properties.some(
              property =>
                ts.isPropertyAssignment(property) &&
                ts.isComputedPropertyName(property.name) &&
                property.name.expression.getText(source) === 'wdomSymbol'
            )
          ) {
            const type = node.properties.find(
              property =>
                ts.isPropertyAssignment(property) &&
                property.name.getText(source) === 'type'
            );
            const site =
              file +
              ':' +
              (source.getLineAndCharacterOfPosition(node.getStart(source))
                .line +
                1) +
              ':' +
              (type ? type.initializer.getText(source) : 'clone');
            factorySites.push(site);
            return ts.factory.createCallExpression(
              ts.factory.createIdentifier('__shapeObserve'),
              undefined,
              [
                node,
                ts.factory.createStringLiteral('create'),
                ts.factory.createStringLiteral(site),
              ]
            );
          }
          return ts.visitEachChild(node, visit, context);
        };
        return node => ts.visitNode(node, visit);
      },
    ]);
    code = ts.createPrinter().printFile(result.transformed[0]);
    result.dispose();
    if (file === 'wDom.ts') {
      code = once(
        code,
        'wDom.reRender = reRender;',
        "wDom.reRender = reRender; __shapeObserve(wDom, 'component-bound');"
      );
    }
  } else if (file === 'diff.ts') {
    code = once(
      code,
      'return remakeWDom;',
      "__shapeObserve(remakeWDom, 'diff-complete'); return remakeWDom;"
    );
  } else if (file === 'render.ts') {
    code = once(
      code,
      'wDom.we = wrapElement;',
      'wDom.we = wrapElement; (globalThis as any).__shape.roots.push(wDom);'
    );
    code = once(
      code,
      "item.nr = 'N';",
      "item.nr = 'N'; __shapeObserve(item, 'clear-meta');"
    );
    code = once(
      code,
      'return element as HTMLElement;',
      "__shapeObserve(wDom, 'dom-created'); return element as HTMLElement;"
    );
  } else return code;
  return (
    'function __shapeObserve(node: any, stage: string, site?: string) { (globalThis as any).__shape.observe(node, stage, site); return node; }\n' +
    code
  );
}

const fixture = path.join(root, 'experiments/node-shape/fixture.tsx');
const source = path.join(out, variant, 'src');
const outputs = {};
for (const kind of ['original', 'components']) {
  const dest = path.join(
    out,
    (variant === 'candidate' ? 'probe-unified-' : 'probe-') + kind
  );
  await build({
    configFile: false,
    root,
    logLevel: 'warn',
    plugins: [
      {
        name: 'shape-observation-only',
        enforce: 'pre',
        transform(code, id) {
          if (id.startsWith(source + '/'))
            return instrument(code, path.relative(source, id));
        },
      },
    ],
    esbuild: { jsxFactory: 'h', jsxFragment: 'Fragment' },
    resolve: {
      alias: [
        {
          find: /^lithent\/helper$/,
          replacement: path.join(out, 'source/cacheUpdate.ts'),
        },
        { find: /^lithent$/, replacement: path.join(source, 'index.ts') },
        { find: '@', replacement: source },
      ],
    },
    build: {
      outDir: dest,
      emptyOutDir: false,
      sourcemap: false,
      minify: false,
      lib: {
        entry:
          kind === 'original' ? path.join(out, 'source/entry.ts') : fixture,
        formats: ['es'],
        fileName: () => 'main.js',
      },
    },
  });
  fs.writeFileSync(path.join(dest, 'index.html'), html('main.js'));
  outputs[kind] = hash(fs.readFileSync(path.join(dest, 'main.js')));
}
assert.equal(new Set(factorySites).size, variant === 'baseline' ? 6 : 1);
guard(out);
fs.writeFileSync(
  path.join(
    out,
    variant === 'baseline' ? 'prepared.json' : 'prepared-candidate.json'
  ),
  JSON.stringify(
    {
      at: new Date().toISOString(),
      evidenceSHA256: hash(archive),
      inputs,
      factorySites: [...new Set(factorySites)],
      probeBundles: outputs,
      note: 'Production JS is byte-identical to DC-16; separate probes modify source and are not attribution/timing builds.',
    },
    null,
    2
  ) + '\n'
);
console.log(
  JSON.stringify({
    production: inputs['production/main.js'].sha256,
    factorySites: [...new Set(factorySites)],
    probeBundles: outputs,
  })
);
