import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { root, bench, fileHash, read, hash } from './config.mjs';
import { verify } from './guard.mjs';

const out = path.resolve(process.argv[2] || '/tmp/lithent-peers-20261023');
verify(out);
const analysis = read(path.join(out, 'analysis.json'));
const result = {
  at: new Date().toISOString(),
  usable: false,
  note: 'Separate hidden sourcemap build after official measurements; use only if JS is byte-identical to measured Lithent bundle',
};
if (analysis.targets.length) {
  const stage = path.join(out, 'sources/lithent'),
    app = path.join(bench, 'frameworks/keyed/lithent');
  const { build, loadConfigFromFile } = await import(
    path.join(app, 'node_modules/vite/dist/node/index.js')
  );
  const { config } = await loadConfigFromFile(
    { command: 'build', mode: 'production' },
    path.join(app, 'vite.config.js')
  );
  const target = path.join(out, 'diagnosis-source-map');
  await build({
    ...config,
    configFile: false,
    root: fs.realpathSync(stage),
    resolve: {
      alias: [
        {
          find: 'lithent/helper',
          replacement: path.join(stage, 'cacheUpdate.ts'),
        },
        { find: /^lithent$/, replacement: path.join(stage, 'lithent.mjs') },
      ],
    },
    build: { ...config.build, sourcemap: 'hidden', outDir: target },
  });
  result.bundleSHA256 = fileHash(path.join(target, 'main.js'));
  result.expectedSHA256 = analysis.build.lithent.bundle;
  result.usable = result.bundleSHA256 === result.expectedSHA256;
  if (result.usable) {
    assert.ok(fs.existsSync(path.join(target, 'main.js.map')));
    result.mapSHA256 = fileHash(path.join(target, 'main.js.map'));
    const coreMapFile = path.join(root, 'dist/lithent.mjs.map'),
      coreMap = read(coreMapFile);
    assert.equal(coreMap.file, 'lithent.mjs');
    assert.equal(
      fileHash(path.join(root, 'dist/lithent.mjs')),
      analysis.provenance.lithent.core
    );
    assert.match(
      fs.readFileSync(path.join(root, 'dist/lithent.mjs'), 'utf8'),
      /sourceMappingURL=lithent\.mjs\.map/
    );
    const sources = coreMap.sources.map((source, i) => {
      const file = path.resolve(path.dirname(coreMapFile), source),
        relative = path.relative(root, file),
        sha256 = hash(coreMap.sourcesContent[i]);
      assert.equal(sha256, analysis.provenance.baseline[relative]);
      assert.equal(sha256, fileHash(file));
      return { source, repository: relative, sha256 };
    });
    fs.copyFileSync(coreMapFile, path.join(out, 'diagnosis-core.map.json'));
    result.coreMap = {
      file: 'diagnosis-core.map.json',
      sha256: fileHash(coreMapFile),
      sources,
      note: 'Existing source map linked by the unchanged default ESM; all embedded source contents match frozen runtime source hashes. Auxiliary second-level locations, not a fresh core rebuild.',
    };
  }
} else
  result.note =
    'No failing CPU items; no targeted profile or sourcemap required';
fs.writeFileSync(
  path.join(out, 'source-map.json'),
  JSON.stringify(result, null, 2) + '\n'
);
verify(out);
console.log(JSON.stringify(result));
