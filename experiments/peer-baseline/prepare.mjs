import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  root,
  bench,
  peers,
  names,
  hash,
  fileHash,
  read,
  guard,
} from './config.mjs';

const out = path.resolve(process.argv[2] || '/tmp/lithent-peers-20261023');
const cache =
  process.env.LITHENT_PEER_INSTALLS ||
  '/tmp/lithent-targeted-update-20261019/peers';
const previous = guard(out);
const walk = (dir, excluded = ['node_modules', 'dist', '.git']) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(entry => !excluded.includes(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap(entry =>
      entry.isDirectory()
        ? walk(path.join(dir, entry.name), excluded)
        : [path.join(dir, entry.name)]
    );
const inventory = (dir, excluded) =>
  Object.fromEntries(
    walk(dir, excluded).map(file => [path.relative(dir, file), fileHash(file)])
  );
const run = (command, args, cwd, log) => {
  try {
    const result = execFileSync(command, args, {
      cwd,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 ** 2,
    });
    fs.writeFileSync(log, result);
    return result;
  } catch (error) {
    fs.writeFileSync(
      log,
      String(error.stdout || '') + String(error.stderr || '')
    );
    throw error;
  }
};
assert.equal(
  fs.existsSync(path.join(out, 'sources')),
  false,
  'Use a fresh output'
);
fs.mkdirSync(path.join(out, 'sources'), { recursive: true });
const manifest = {},
  provenance = {
    at: new Date().toISOString(),
    command: {
      executable: process.execPath,
      args: process.argv.slice(1),
      node: process.version,
    },
    baseline: previous.provenance.baseline,
    defaultPackageSHA256: previous.defaultPackageSHA256,
    reusedEvidence: previous.evidence,
    peers: {},
    goal: {
      metric: 'CPU click-to-final-paint total median',
      threshold: 1.1,
      reference: peers,
      rule: 'All 9 CPU items; pooled medians plus separate opposite-order consistency',
      memory: 'Separate costs; no CPU 1.10 threshold',
    },
    commonSHA256: fileHash(
      path.join(bench, 'webdriver-ts-results/src/Common.ts')
    ),
  };
for (const name of peers) {
  const source = path.join(bench, 'frameworks/keyed', name),
    installed = path.join(cache, name),
    stage = path.join(out, 'sources', name);
  const expected = inventory(source);
  assert.deepEqual(
    inventory(installed),
    expected,
    name + ' cached source/lock differs'
  );
  fs.cpSync(source, stage, {
    recursive: true,
    filter: file => !['node_modules', 'dist'].includes(path.basename(file)),
  });
  const lock = read(path.join(stage, 'package-lock.json')),
    versions = [];
  for (const [relative, entry] of Object.entries(lock.packages)) {
    if (!relative) continue;
    const file = path.join(installed, relative, 'package.json');
    if (!fs.existsSync(file)) {
      assert.ok(entry.optional, 'Missing required ' + name + '/' + relative);
      versions.push({
        package: relative,
        version: entry.version,
        optionalAbsent: true,
      });
      continue;
    }
    const pkg = read(file);
    assert.equal(pkg.version, entry.version, name + '/' + relative);
    versions.push({
      package: relative,
      version: pkg.version,
      packageSHA256: fileHash(file),
    });
  }
  const ls = run(
    'npm',
    ['ls', '--all', '--json'],
    installed,
    path.join(stage, 'npm-ls.json')
  );
  assert.equal(
    !!JSON.parse(ls).problems,
    false,
    name + ' npm dependency problems'
  );
  fs.symlinkSync(
    path.join(installed, 'node_modules'),
    path.join(stage, 'node_modules'),
    'dir'
  );
  const dependency = name.startsWith('react') ? 'react' : 'preact';
  const pkg = read(
    path.join(installed, 'node_modules', dependency, 'package.json')
  );
  provenance.peers[name] = {
    source: expected,
    lockSHA256: expected['package-lock.json'],
    dependency,
    version: pkg.version,
    installedNodeModules: path.join(installed, 'node_modules'),
    packages: versions,
    buildScript: read(path.join(stage, 'package.json')).scripts['build-prod'],
    node: run(
      'node',
      [
        '-p',
        'JSON.stringify({execPath:process.execPath,version:process.version})',
      ],
      stage,
      path.join(stage, 'node.json')
    ).trim(),
    npm: execFileSync('npm', ['--version'], {
      cwd: stage,
      encoding: 'utf8',
    }).trim(),
  };
  run('npm', ['run', 'build-prod'], stage, path.join(stage, 'build.log'));
  assert.deepEqual(inventory(source), expected, name + ' upstream changed');
  assert.deepEqual(
    inventory(installed),
    expected,
    name + ' install source changed'
  );
  // Record actual consumed runtime files separately from build dependencies.
  const runtime = {};
  for (const runtimeName of name.startsWith('react')
    ? ['react', 'react-dom', 'scheduler']
    : ['preact']) {
    const dir = path.join(installed, 'node_modules', runtimeName);
    if (!fs.existsSync(dir)) continue;
    const files = inventory(dir, ['node_modules', '.git']);
    runtime[runtimeName] = files;
  }
  provenance.peers[name].runtime = runtime;
}
const stage = path.join(out, 'sources/lithent'),
  app = path.join(bench, 'frameworks/keyed/lithent');
fs.mkdirSync(path.join(stage, 'src'), { recursive: true });
const prior = process.env.LITHENT_CACHE_OUT || '/tmp/lithent-c3-cache-20261022';
const original = fs.readFileSync(
  path.join(prior, 'sources/original-default/src/main.tsx')
);
assert.equal(
  hash(original),
  '4fcb17e3dcd841f628d4130a7d47ca3011550972675ba2da18e324a5f541d632'
);
fs.writeFileSync(path.join(stage, 'src/main.tsx'), original);
fs.copyFileSync(
  path.join(root, 'helper/src/hook/cacheUpdate.ts'),
  path.join(stage, 'cacheUpdate.ts')
);
fs.copyFileSync(
  path.join(root, 'dist/lithent.mjs'),
  path.join(stage, 'lithent.mjs')
);
fs.copyFileSync(path.join(app, 'index.html'), path.join(stage, 'index.html'));
const { build, loadConfigFromFile } = await import(
  path.join(app, 'node_modules/vite/dist/node/index.js')
);
const { config } = await loadConfigFromFile(
  { command: 'build', mode: 'production' },
  path.join(app, 'vite.config.js')
);
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
  build: { ...config.build, outDir: path.join(out, 'build-lithent') },
});
provenance.lithent = {
  app: hash(original),
  core: fileHash(path.join(stage, 'lithent.mjs')),
  helper: fileHash(path.join(stage, 'cacheUpdate.ts')),
  bundle: fileHash(path.join(out, 'build-lithent/main.js')),
  reused:
    'Unchanged source/core/helper; DC-15 original-default type/B3 and baseline regression evidence',
};
const previousCache = read(
  path.join(root, 'docs/benchmark/parent-memo-cache-results.json')
);
assert.equal(
  provenance.lithent.bundle,
  previousCache.build['original-default'].bundle
);
provenance.cacheEvidence = previousCache.evidence;
for (const round of ['round-main', 'round-reverse']) {
  for (const name of names) {
    const dir = path.join(out, round, name);
    fs.mkdirSync(dir, { recursive: true });
    if (name === 'lithent')
      fs.cpSync(path.join(out, 'build-lithent'), dir, { recursive: true });
    else {
      fs.copyFileSync(
        path.join(out, 'sources', name, 'index.html'),
        path.join(dir, 'index.html')
      );
      fs.cpSync(
        path.join(out, 'sources', name, 'dist'),
        path.join(dir, 'dist'),
        { recursive: true }
      );
    }
    const js = name === 'lithent' ? 'main.js' : 'dist/main.js';
    manifest[name] = {
      source:
        name === 'lithent'
          ? provenance.lithent.app
          : hash(JSON.stringify(provenance.peers[name].source)),
      version: name === 'lithent' ? '1.25.2' : provenance.peers[name].version,
      bundle: fileHash(path.join(dir, js)),
      entryJS: js,
      html: fileHash(path.join(dir, 'index.html')),
    };
  }
  fs.writeFileSync(
    path.join(out, round, 'build-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  fs.writeFileSync(
    path.join(out, round, 'versions.json'),
    JSON.stringify(
      Object.fromEntries(names.map(name => [name, manifest[name].version])),
      null,
      2
    )
  );
}
for (const file of ['production-run.mjs', 'official-memory.mjs'])
  fs.copyFileSync(
    path.join(root, 'docs/benchmark', file),
    path.join(out, file)
  );
fs.copyFileSync(
  path.join(bench, 'webdriver-ts-results/src/Common.ts'),
  path.join(out, 'Common.ts')
);
fs.writeFileSync(
  path.join(out, 'provenance.json'),
  JSON.stringify(provenance, null, 2) + '\n'
);
guard(out);
console.log(JSON.stringify(manifest, null, 2));
