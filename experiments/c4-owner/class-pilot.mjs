// Separate single-axis app diagnostic, after the primary 870/90 collection.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { build } from 'vite';
import { chromium } from '@playwright/test';
const parent = fs.realpathSync(process.argv[2]);
const root = process.cwd();
const read = f => JSON.parse(fs.readFileSync(f));
const hash = b => createHash('sha256').update(b).digest('hex');
const initial = read(path.join(parent, 'initial.json'));
const runner = read(path.join(parent, 'runner-inputs.json'));
const out = path.join(parent, 'class-pilot');
assert(!fs.existsSync(out), 'Preserve completed pilot');
fs.mkdirSync(out);
const source = path.join(out, 'source');
fs.cpSync(path.join(parent, 'source'), source, { recursive: true });
const original = fs.readFileSync(path.join(source, 'candidate.tsx'), 'utf8');
const needle = 'class={store.state.selected === id ? "danger" : undefined}';
assert.equal(original.split(needle).length, 2);
const candidate = original.replace(
  needle,
  'class={store.state.selected === id ? "danger" : ""}'
);
fs.writeFileSync(path.join(source, 'empty.tsx'), candidate);
const current = path.join(out, 'apps/current'),
  empty = path.join(out, 'apps/empty');
fs.cpSync(path.join(parent, 'apps/candidate'), current, { recursive: true });
await build({
  configFile: false,
  root: source,
  logLevel: 'warn',
  resolve: {
    alias: [
      {
        find: /^lithent\/helper$/,
        replacement: path.join(source, 'cacheUpdate.ts'),
      },
      { find: /^lithent$/, replacement: path.join(source, 'src/index.ts') },
      { find: '@c4', replacement: path.join(source, 'boundary.ts') },
      { find: '@fixture', replacement: path.join(source, 'fixture.ts') },
      { find: '@', replacement: path.join(source, 'src') },
    ],
  },
  define: { __C4_DIAGNOSTIC__: 'false' },
  esbuild: { jsxFactory: 'h', jsxFragment: 'Fragment' },
  build: {
    outDir: empty,
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      input: path.join(source, 'empty.tsx'),
      output: { entryFileNames: 'main.js' },
    },
  },
});
fs.copyFileSync(
  path.join(current, 'index.html'),
  path.join(empty, 'index.html')
);
const manifest = Object.fromEntries(
  ['current', 'empty'].map(name => [
    name,
    {
      bundle: hash(fs.readFileSync(path.join(out, 'apps', name, 'main.js'))),
      html: hash(fs.readFileSync(path.join(out, 'apps', name, 'index.html'))),
      entryJS: 'main.js',
    },
  ])
);
const versions = {
  ...read(path.join(parent, 'versions.json')),
  scope: 'single-axis class undefined to empty string, selection only',
};
fs.writeFileSync(
  path.join(out, 'inputs.json'),
  JSON.stringify(
    {
      at: new Date().toISOString(),
      sourceOriginal: hash(original),
      sourceCandidate: hash(candidate),
      manifest,
      plan: '2 apps x 2 orders x 25 official selection = 100 samples; no full CPU/memory adoption claim',
    },
    null,
    2
  )
);
const server = createServer((req, res) => {
  try {
    const parts = new URL(req.url, 'http://localhost').pathname
      .split('/')
      .filter(Boolean);
    const file =
      parts[0] === 'css'
        ? path.join(runner.bench, ...parts)
        : path.join(
            out,
            'apps',
            parts[0],
            parts.slice(1).join('/') || 'index.html'
          );
    res.setHeader(
      'content-type',
      file.endsWith('.js')
        ? 'application/javascript'
        : file.endsWith('.css')
          ? 'text/css'
          : 'text/html'
    );
    res.end(fs.readFileSync(file));
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({
  headless: true,
  executablePath: initial.browser.binary,
});
const dom = [];
try {
  for (const name of ['current', 'empty']) {
    const page = await browser.newPage();
    await page.goto(
      `http://127.0.0.1:${server.address().port}/${name}/index.html`
    );
    const values = await page.evaluate(async () => {
      const click = async s => {
        document.querySelector(s).click();
        for (let i = 0; i < 6; i++) await Promise.resolve();
      };
      await click('#run');
      const initialClass = document
        .querySelector('tbody>tr')
        .getAttribute('class');
      await click('tbody>tr:nth-child(5)>td:nth-child(2)>a');
      await click('tbody>tr:nth-child(2)>td:nth-child(2)>a');
      return {
        initialClass,
        deselectedClass: document
          .querySelector('tbody>tr:nth-child(5)')
          .getAttribute('class'),
        selectedClass: document
          .querySelector('tbody>tr:nth-child(2)')
          .getAttribute('class'),
      };
    });
    assert.equal(values.deselectedClass, name === 'current' ? 'undefined' : '');
    assert.equal(values.selectedClass, 'danger');
    dom.push({ name, ...values });
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise(r => server.close(r));
}
fs.writeFileSync(path.join(out, 'dom.json'), JSON.stringify(dom, null, 2));
console.log('DOM', dom);
for (const [label, mode, names] of [
  ['gate', 'verify', ['current', 'empty']],
  ['main', 'cpu', ['current', 'empty']],
  ['reverse', 'cpu', ['empty', 'current']],
]) {
  const dest = path.join(out, label);
  fs.mkdirSync(dest);
  fs.writeFileSync(
    path.join(dest, 'build-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  fs.writeFileSync(
    path.join(dest, 'versions.json'),
    JSON.stringify(versions, null, 2)
  );
  const args = ['docs/benchmark/production-run.mjs', mode, names.join(',')];
  if (mode === 'cpu') args.push('04_');
  const env = {
    ...process.env,
    LITHENT_BENCHMARK_ROOT: runner.bench,
    LITHENT_PRODUCTION_OUT: dest,
    LITHENT_CHROME_BINARY: initial.browser.binary,
    LITHENT_PRODUCTION_ALTERNATE_ORDER: '1',
    LITHENT_PRODUCTION_FOLDERS: JSON.stringify({ current, empty }),
  };
  fs.writeFileSync(
    path.join(out, label + '-command.json'),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        args,
        env: Object.fromEntries(
          Object.entries(env).filter(([k]) => k.startsWith('LITHENT_'))
        ),
      },
      null,
      2
    )
  );
  const log = fs.createWriteStream(path.join(out, label + '.log'));
  const child = spawn(process.execPath, args, {
    cwd: root,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  for (const stream of [child.stdout, child.stderr])
    stream.on('data', b => {
      log.write(b);
      process.stdout.write(b);
    });
  const status = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', resolve);
  });
  await new Promise(r => log.end(r));
  assert.equal(status, 0);
}
for (const [file, digest] of Object.entries(initial.browser.files))
  assert.equal(hash(fs.readFileSync(file)), digest);
