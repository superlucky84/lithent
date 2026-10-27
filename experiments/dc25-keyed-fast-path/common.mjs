import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../../', import.meta.url));
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
export const write = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
};
export const inventory = (directory, prefix = '') =>
  Object.fromEntries(
    fs
      .readdirSync(directory, { recursive: true })
      .sort()
      .filter(name => name.endsWith('.ts') && !name.startsWith('tests/'))
      .map(name => [
        prefix + name,
        hash(fs.readFileSync(path.join(directory, name))),
      ])
  );
export function guard(out) {
  const initial = read(path.join(out, 'initial.json'));
  for (const [name, sha] of Object.entries(initial.files))
    assert.equal(hash(fs.readFileSync(path.join(root, name))), sha, name);
  for (const [name, sha] of Object.entries(initial.sibling.files))
    assert.equal(hash(fs.readFileSync(name)), sha, name);
  for (const [name, sha] of Object.entries(initial.browser.files))
    assert.equal(hash(fs.readFileSync(name)), sha, name);
  const selected = path.join(out, 'active-browser.json');
  if (fs.existsSync(selected)) {
    const browser = read(selected);
    for (const [name, sha] of Object.entries(browser.files))
      assert.equal(hash(fs.readFileSync(name)), sha, name);
    return {
      ...initial,
      browser: {
        ...browser,
        sha256: browser.files[browser.binary],
        engineSHA256: browser.files[browser.engine],
      },
    };
  }
  return {
    ...initial,
    browser: {
      ...initial.browser,
      sha256: initial.browser.files[initial.browser.binary],
      engineSHA256: initial.browser.files[initial.browser.engine],
    },
  };
}
export function stage(out, name) {
  const destination = path.join(out, name);
  assert(!fs.existsSync(destination), 'Use a fresh variant name: ' + name);
  const initial = read(path.join(out, 'initial.json'));
  for (const file of Object.keys(initial.files).filter(
    name => name.startsWith('src/') || name.startsWith('lithentConcurrent/src/')
  )) {
    const target = path.join(destination, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(root, file), target);
  }
  const config = read(path.join(root, 'tsconfig.json'));
  // Keep /tmp and its macOS /private/tmp real path from becoming two TS roots.
  config.compilerOptions.baseUrl = '.';
  config.compilerOptions.types = [];
  config.include = ['src'];
  write(path.join(destination, 'tsconfig.json'), config);
  write(path.join(destination, 'package.json'), {
    private: true,
    type: 'module',
  });
  fs.symlinkSync(
    path.join(root, 'node_modules'),
    path.join(destination, 'node_modules')
  );
  return destination;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = path.resolve(process.argv[2]);
  fs.mkdirSync(out);
  const sibling = path.resolve(root, '../js-framework-benchmark-upstream');
  const git = (args, cwd = root) =>
    execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
  const browser =
    process.env.LITHENT_CHROME_BINARY ||
    '/tmp/lithent-benchmark-chrome-155.0.8059.85.app/Contents/MacOS/Google Chrome';
  const engine = fs.realpathSync(
    path.resolve(
      browser,
      '../../Frameworks/Google Chrome Framework.framework/Versions/Current/Google Chrome Framework'
    )
  );
  const names = [
    ...Object.keys(inventory(path.join(root, 'src'), 'src/')),
    ...Object.keys(
      inventory(
        path.join(root, 'lithentConcurrent/src'),
        'lithentConcurrent/src/'
      )
    ),
    'package.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    'vite.config.js',
    'scripts/size-report.js',
  ];
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
  write(path.join(out, 'initial.json'), {
    at: new Date().toISOString(),
    head: git(['rev-parse', 'HEAD']),
    branch: git(['branch', '--show-current']),
    status: git(['status', '--short']),
    node: process.version,
    nodeBinary: process.execPath,
    pnpm: execFileSync('pnpm', ['--version'], { encoding: 'utf8' }).trim(),
    platform: {
      os: os.type(),
      release: os.release(),
      arch: os.arch(),
      cpus: os.cpus(),
      memory: os.totalmem(),
    },
    browser: {
      binary: browser,
      engine,
      files: Object.fromEntries(
        [browser, engine].map(file => [file, hash(fs.readFileSync(file))])
      ),
    },
    files: Object.fromEntries(
      names.map(file => [file, hash(fs.readFileSync(path.join(root, file)))])
    ),
    sibling: {
      root: sibling,
      head: git(['rev-parse', 'HEAD'], sibling),
      status: git(['status', '--short'], sibling),
      files: Object.fromEntries(
        siblingNames.map(name => {
          const file = path.join(sibling, name);
          return [file, hash(fs.readFileSync(file))];
        })
      ),
    },
  });
  stage(out, 'baseline');
  stage(out, 'candidate');
  guard(out);
  console.log(
    JSON.stringify({
      out,
      head: git(['rev-parse', 'HEAD']),
      guardedFiles: names.length,
      browser,
    })
  );
}
