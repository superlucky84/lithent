import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { root, hash, read, write, guard } from './common.mjs';

const out = fs.realpathSync(process.argv[2]);
const attempt = process.argv[3] || 'v1';
assert(/^[a-z0-9-]+$/.test(attempt));
guard(out);
const archive = fs.readFileSync(
  path.join(root, 'docs/benchmark/peer-baseline-evidence.json.gz')
);
assert.equal(
  hash(archive),
  '5ec4db084140ac0e1379d82c2c691d7fc437c24e1e4484d8cc823a0d7071412e'
);
const evidence = JSON.parse(gunzipSync(archive)).files;
const versions = {
  'react-hooks': '19.2.0',
  'react-classes': '19.0.0',
  'preact-hooks': '11.0.0',
  'preact-classes': '11.0.0',
};
const results = {};
for (const [name, version] of Object.entries(versions)) {
  const stage = path.join(out, 'peer-source-' + attempt, name);
  assert(!fs.existsSync(stage), 'Use a fresh peer staging directory');
  const inputs = {};
  for (const [key, item] of Object.entries(evidence).filter(([key]) =>
    key.startsWith('run/sources/' + name + '/')
  )) {
    const relative = key.slice(('run/sources/' + name + '/').length);
    assert(
      !relative.split('/').includes('..') &&
        !relative.startsWith('node_modules/')
    );
    const bytes = Buffer.from(item.content, item.encoding || 'utf8');
    assert.equal(hash(bytes), item.sha256, key);
    const dest = path.join(stage, relative);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, bytes, { flag: 'wx' });
    inputs[relative] = item.sha256;
  }
  const freshInstall = process.env.LITHENT_INSTALL_PEERS === '1';
  const modules = freshInstall
    ? path.join(stage, 'node_modules')
    : '/tmp/lithent-targeted-update-20261019/peers/' + name + '/node_modules';
  if (freshInstall) {
    const installation = spawnSync(
      'npm',
      [
        'ci',
        '--ignore-scripts',
        '--no-audit',
        '--no-fund',
        '--cache',
        path.join(out, 'npm-cache'),
      ],
      { cwd: stage, encoding: 'utf8', maxBuffer: 16 * 1024 ** 2 }
    );
    fs.writeFileSync(
      path.join(stage, 'dc25-install.log'),
      String(installation.stdout || '') + String(installation.stderr || ''),
      { flag: 'wx' }
    );
    assert.equal(
      installation.status,
      0,
      name + ': ' + installation.stdout + installation.stderr
    );
  }
  const installed = {};
  for (const [relative, entry] of Object.entries(
    read(path.join(stage, 'package-lock.json')).packages
  )) {
    if (!relative) continue;
    const file = path.join(path.dirname(modules), relative, 'package.json');
    if (!fs.existsSync(file)) {
      assert(entry.optional, name + '/' + relative);
      continue;
    }
    assert.equal(read(file).version, entry.version, name + '/' + relative);
    installed[relative] = {
      version: entry.version,
      sha256: hash(fs.readFileSync(file)),
    };
  }
  const dependency = name.startsWith('react') ? 'react' : 'preact';
  assert.equal(
    read(path.join(modules, dependency, 'package.json')).version,
    version
  );
  if (!freshInstall) fs.symlinkSync(modules, path.join(stage, 'node_modules'));
  const result = spawnSync('npm', ['run', 'build-prod'], {
    cwd: stage,
    env: {
      ...process.env,
      npm_config_cache: path.join(out, 'npm-cache'),
      npm_config_update_notifier: 'false',
    },
    encoding: 'utf8',
    maxBuffer: 16 * 1024 ** 2,
  });
  write(path.join(stage, 'dc25-build.json'), {
    at: new Date().toISOString(),
    node: process.version,
    status: result.status,
    error: result.error?.message,
  });
  fs.writeFileSync(
    path.join(stage, 'dc25-build.log'),
    String(result.stdout || '') + String(result.stderr || ''),
    { flag: 'wx' }
  );
  assert.equal(result.status, 0, name + ': ' + result.stdout + result.stderr);
  const dest = path.join(out, 'apps', name);
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(path.join(stage, 'dist'), path.join(dest, 'dist'), {
    recursive: true,
  });
  const html = evidence['run/round-main/' + name + '/index.html'];
  const bytes = Buffer.from(html.content, html.encoding || 'utf8');
  assert.equal(hash(bytes), html.sha256);
  fs.writeFileSync(path.join(dest, 'index.html'), bytes, { flag: 'wx' });
  const app = {
    bundle: hash(fs.readFileSync(path.join(dest, 'dist/main.js'))),
    html: html.sha256,
    entryJS: 'dist/main.js',
    dependency,
    version,
    node: process.version,
    rebuilt: true,
    inputs,
  };
  results[name] = { app, installed, modules };
  for (const round of ['round-main', 'round-reverse']) {
    fs.cpSync(dest, path.join(out, round, name), { recursive: true });
    const file = path.join(out, round, 'build-manifest.json');
    const manifest = read(file);
    assert(!manifest[name]);
    manifest[name] = app;
    fs.writeFileSync(file, JSON.stringify(manifest, null, 2) + '\n');
    const versionsFile = path.join(out, round, 'versions.json');
    const meta = read(versionsFile);
    meta[name] = {
      version,
      dependency,
      jsSHA256: app.bundle,
      node: process.version,
      rebuilt: true,
    };
    fs.writeFileSync(versionsFile, JSON.stringify(meta, null, 2) + '\n');
  }
  console.log(name, version, app.bundle);
}
write(path.join(out, 'peer-builds.json'), results);
guard(out);
