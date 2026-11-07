import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { root, hash, guard, read } from '../keyed-placement/init.mjs';

const out = fs.realpathSync(process.argv[2]);
guard(out);
const archive = fs.readFileSync(
  path.join(root, 'docs/benchmark/peer-baseline-evidence.json.gz')
);
assert.equal(
  hash(archive),
  '5ec4db084140ac0e1379d82c2c691d7fc437c24e1e4484d8cc823a0d7071412e'
);
const evidence = JSON.parse(zlib.gunzipSync(archive));
const bench = path.join(out, 'official-benchmark');
assert.equal(fs.existsSync(bench), false, bench);
const frozen = {};
for (const [name, item] of Object.entries(evidence.files)) {
  if (!name.startsWith('benchmark/')) continue;
  const relative = name.slice('benchmark/'.length);
  assert.ok(!relative.split('/').includes('..'));
  const file = path.join(bench, relative);
  const bytes = Buffer.from(item.content, item.encoding || 'utf8');
  assert.equal(hash(bytes), item.sha256, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, bytes);
  frozen[relative] = hash(bytes);
}
const upstream = path.resolve(root, '../js-framework-benchmark-upstream');
const runnerPackage = path.join(upstream, 'webdriver-ts/package.json');
assert.equal(
  hash(fs.readFileSync(runnerPackage)),
  frozen['webdriver-ts/package.json']
);
// The original evidence preserves the runner package but not this separate lock.
// Freeze the matching current checkout lock explicitly for this fresh run.
const lock = fs.readFileSync(
  path.join(upstream, 'webdriver-ts/package-lock.json')
);
assert.equal(
  JSON.parse(lock).packages[''].dependencies['puppeteer-core'],
  '25.3.0'
);
fs.writeFileSync(path.join(bench, 'webdriver-ts/package-lock.json'), lock);
frozen['webdriver-ts/package-lock.json'] = hash(lock);
const originalHTML = evidence.files['run/round-main/lithent/index.html'];
const html = Buffer.from(originalHTML.content, originalHTML.encoding || 'utf8');
assert.equal(hash(html), originalHTML.sha256);
const builds = read(path.join(out, 'layout-builds.json'));
const manifest = {};
for (const variant of ['baseline', 'candidate']) {
  const js = fs.readFileSync(path.join(out, 'layout-' + variant, 'main.js'));
  assert.equal(hash(js), builds.variants[variant].js);
  manifest[variant] = {
    bundle: hash(js),
    html: hash(html),
    core: builds.variants[variant].core,
    note: 'Same archived original app/helper; only isolated core layout differs',
  };
  for (const round of ['measure-main', 'measure-reverse']) {
    const dest = path.join(out, round, variant);
    fs.mkdirSync(dest, { recursive: true });
    fs.writeFileSync(path.join(dest, 'main.js'), js);
    fs.copyFileSync(
      path.join(out, 'layout-' + variant, 'main.js.map'),
      path.join(dest, 'main.js.map')
    );
    fs.writeFileSync(path.join(dest, 'index.html'), html);
  }
}
for (const round of ['measure-main', 'measure-reverse']) {
  fs.writeFileSync(
    path.join(out, round, 'build-manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n'
  );
  fs.writeFileSync(
    path.join(out, round, 'versions.json'),
    JSON.stringify(
      {
        baseline: { core: 'lithent1.25.2', jsSHA256: manifest.baseline.bundle },
        candidate: {
          core: 'DC18 unified factory experimental',
          jsSHA256: manifest.candidate.bundle,
        },
        runnerNode: '/opt/homebrew/bin/node',
        runnerLockSHA256: hash(lock),
        chrome: '156.0.8078.47',
        notComparableWith: 'DC16 Chrome155 samples',
      },
      null,
      2
    ) + '\n'
  );
}
fs.writeFileSync(
  path.join(out, 'measure-inputs.json'),
  JSON.stringify(
    {
      at: new Date().toISOString(),
      bench,
      files: frozen,
      builds: manifest,
      rootWrappers: Object.fromEntries(
        [
          'production-run.mjs',
          'official-memory.mjs',
          'targeted-update.mjs',
        ].map(file => [
          file,
          hash(fs.readFileSync(path.join(root, 'docs/benchmark', file))),
        ])
      ),
      sizePolicy:
        'User permits evaluating modest size excess before setting any permanent budget; size is recorded alongside CPU/memory',
    },
    null,
    2
  ) + '\n'
);
guard(out);
console.log(
  JSON.stringify({ bench, files: Object.keys(frozen).length, builds: manifest })
);
