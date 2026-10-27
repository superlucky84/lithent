import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { build } from 'vite';
import { chromium } from '@playwright/test';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const out =
  process.env.LITHENT_C3_OUT ||
  process.argv[2] ||
  '/tmp/lithent-c3-parent-memo-20261022';
const baseline = path.join(out, 'baseline/dist/lithent.mjs');
const candidatePackage = path.resolve(process.argv[3] || root);
const candidate = path.join(candidatePackage, 'dist/lithent.mjs');
const concurrent = path.join(
  root,
  'lithentConcurrent/dist/lithentConcurrent.mjs'
);
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const browserPath =
  process.env.LITHENT_CHROME_BINARY ||
  '/tmp/lithent-benchmark-chrome-155.0.8059.85.app/Contents/MacOS/Google Chrome';
const manifest = {
  at: new Date().toISOString(),
  browser: hash(fs.readFileSync(browserPath)),
  builds: {},
  types: {},
};

// Real consumer declarations and runtime artifacts, including deliberate
// failure of the unsupported named import under the concurrent alias.
for (const [name, declaration] of Object.entries({
  base: path.join(candidatePackage, 'dist/index.d.ts'),
  concurrent: path.join(
    root,
    'lithentConcurrent/dist/types/lithentConcurrent/src/index.d.ts'
  ),
})) {
  const dir = path.join(out, 'types', name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'consumer.ts'),
    `import { useParentMemo } from 'lithent';\nuseParentMemo<{ label: string }>(next => [next.label]);\n`
  );
  fs.writeFileSync(
    path.join(dir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ESNext',
          module: 'ESNext',
          moduleResolution: 'node',
          strict: true,
          skipLibCheck: true,
          noEmit: true,
          lib: ['DOM', 'ESNext'],
          types: [],
          baseUrl: dir,
          paths: { lithent: [declaration] },
        },
        files: ['consumer.ts'],
      },
      null,
      2
    )
  );
  const result = spawnSync(
    process.execPath,
    [
      path.join(root, 'node_modules/typescript/bin/tsc'),
      '-p',
      path.join(dir, 'tsconfig.json'),
    ],
    { encoding: 'utf8' }
  );
  assert.equal(
    result.status,
    name === 'base' ? 0 : 2,
    result.stdout + result.stderr
  );
  if (name === 'concurrent')
    assert.match(result.stdout, /TS2305.*useParentMemo/);
  manifest.types[name] = {
    exitCode: result.status,
    output: result.stdout + result.stderr,
    declaration: hash(fs.readFileSync(declaration)),
  };
}
const require = createRequire(path.join(root, 'package.json'));
const esm = await import(candidate);
const cjs = require(path.join(candidatePackage, 'dist/lithent.cjs'));
assert.equal(typeof esm.useParentMemo, 'function');
assert.equal(typeof cjs.useParentMemo, 'function');
assert.equal('useParentMemo' in (await import(concurrent)), false);
const unsupportedEntry = path.join(out, 'unsupported-import.mjs');
fs.writeFileSync(
  unsupportedEntry,
  `import { useParentMemo } from ${JSON.stringify(concurrent)};\nuseParentMemo(() => []);\n`
);
const unsupported = spawnSync(process.execPath, [unsupportedEntry], {
  encoding: 'utf8',
});
assert.equal(unsupported.status, 1);
assert.match(
  unsupported.stderr,
  /does not provide an export named 'useParentMemo'/
);
manifest.unsupportedRuntimeImport = {
  exitCode: unsupported.status,
  error: unsupported.stderr,
};

for (const [name, core] of Object.entries({ baseline, candidate })) {
  const dir = path.join(out, 'editor', name);
  fs.mkdirSync(dir, { recursive: true });
  await build({
    configFile: false,
    root,
    logLevel: 'warn',
    resolve: { alias: [{ find: /^lithent$/, replacement: core }] },
    esbuild: { jsxFactory: 'h', jsxFragment: 'Fragment' },
    build: {
      outDir: dir,
      emptyOutDir: false,
      sourcemap: true,
      lib: {
        entry: path.join(root, 'experiments/parent-memo/browser/editor.tsx'),
        formats: ['es'],
        fileName: () => 'editor.mjs',
      },
    },
  });
  manifest.builds[name] = {
    core: hash(fs.readFileSync(core)),
    appSource: hash(
      fs.readFileSync(
        path.join(root, 'experiments/parent-memo/browser/editor.tsx')
      )
    ),
    bundle: hash(fs.readFileSync(path.join(dir, 'editor.mjs'))),
  };
}
fs.writeFileSync(
  path.join(out, 'editor-build-manifest.json'),
  JSON.stringify(manifest, null, 2) + '\n'
);

const server = createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  const variant = url.pathname.split('/')[1];
  if (!['baseline', 'candidate'].includes(variant)) {
    response.writeHead(404).end();
    return;
  }
  if (url.pathname.endsWith('/editor.mjs')) {
    response.setHeader('Content-Type', 'text/javascript');
    response.end(
      fs.readFileSync(path.join(out, 'editor', variant, 'editor.mjs'))
    );
  } else {
    response.setHeader('Content-Type', 'text/html');
    response.end(
      `<!doctype html><title>Parent memo input editor</title><script type="module" src="/${variant}/editor.mjs"></script>`
    );
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({
  executablePath: browserPath,
  headless: true,
  args: ['--js-flags=--expose-gc'],
});
const result = {
  kind: 'C3 production DOM/work-count/retention contract; not official CPU performance',
  at: new Date().toISOString(),
  browserVersion: browser.version(),
  manifest,
  runs: [],
};
try {
  for (const [variant, optIn] of [
    ['baseline', false],
    ['candidate', false],
    ['candidate', true],
  ]) {
    for (let contextIndex = 0; contextIndex < 3; contextIndex++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(String(error)));
      await page.goto(`http://127.0.0.1:${server.address().port}/${variant}/`);
      await page.waitForFunction(() => !!window.bootEditor);
      const checks = await page.evaluate(async optIn => {
        const count = 1000;
        const editor = (window.editor = window.bootEditor(count, optIn));
        const input = editor.input(count - 1);
        input.focus();
        const states = [{ stage: 'mount', ...editor.metrics }];
        await editor.refresh();
        states.push({ stage: 'refresh', ...editor.metrics });
        await editor.edit(count - 1, 'local draft');
        await editor.refresh();
        if (editor.input(count - 1) !== input || input.value !== 'local draft')
          throw Error('Lost self state or identity');
        const focusAfterRefresh = document.activeElement === input;
        await editor.reverse();
        if (editor.input(count - 1) !== input || input.value !== 'local draft')
          throw Error('Lost moved state');
        states.push({
          stage: 'self-then-refresh-and-reverse',
          ...editor.metrics,
        });
        await editor.rename(count - 1, 'Renamed field');
        if (
          input.value !== 'local draft' ||
          input.parentElement.querySelector('span').textContent !==
            'Renamed field'
        )
          throw Error('Stale mutable input');
        states.push({ stage: 'one-prop-change', ...editor.metrics });
        await editor.remove(0);
        states.push({ stage: 'remove-one', ...editor.metrics });
        const registeredBeforeDestroy =
          document.querySelectorAll('input').length;
        editor.destroy();
        return {
          states,
          registeredBeforeDestroy,
          focusAfterRefresh,
          remainingInputs: document.querySelectorAll('input').length,
        };
      }, optIn);
      assert.equal(checks.registeredBeforeDestroy, 999);
      assert.equal(checks.remainingInputs, 0);
      assert.equal(checks.focusAfterRefresh, true);
      assert.equal(
        checks.states[1].renders - checks.states[0].renders,
        optIn ? 0 : 1000
      );
      assert.equal(
        checks.states[3].renders - checks.states[2].renders,
        optIn ? 1 : 1000
      );
      assert.equal(checks.states[4].unmounts, 1);
      const cdp = await context.newCDPSession(page);
      for (let i = 0; i < 3; i++) {
        await page.waitForTimeout(25);
        await cdp.send('HeapProfiler.collectGarbage');
      }
      const retention = await page.evaluate(() => window.editor.retention());
      assert.equal(retention.retainedKeys, 1000);
      assert.equal(retention.registered, 0);
      assert.equal(retention.retainedOutputsAndHost, 0);
      assert.equal(retention.unmounts, 1000);
      assert.deepEqual(errors, []);
      result.runs.push({
        variant,
        optIn,
        contextIndex,
        checks,
        retention,
        errors,
      });
      fs.writeFileSync(
        path.join(out, 'editor-results.json'),
        JSON.stringify(result, null, 2) + '\n'
      );
      console.log(
        JSON.stringify({
          variant,
          optIn,
          contextIndex,
          refreshRenders: checks.states[1].renders - checks.states[0].renders,
          retention,
        })
      );
      await context.close();
    }
  }
  assert.equal(hash(fs.readFileSync(browserPath)), manifest.browser);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
