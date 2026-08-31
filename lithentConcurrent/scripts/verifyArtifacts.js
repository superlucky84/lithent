/**
 * Release-artifact checks for `lithent-concurrent` (MANUAL_TEST_CHECKLIST A-5,
 * A-9, A-10, A-11).
 *
 * Everything else in this repo tests SOURCE: the suites reach the core through
 * the `@/…` alias table, and the satellite dual run reaches it through a
 * vite alias. Neither exercises the files a consumer actually installs — the
 * bundles named by `package.json` `exports`, and the emitted `.d.ts`. A wrong
 * export map, a bundle that fails to load standalone, or declarations that
 * still carry unresolved `@/` specifiers would all pass CI and break on install.
 *
 *   node lithentConcurrent/scripts/verifyArtifacts.js
 *
 * Requires `pnpm build` first. Exits non-zero on the first failed check.
 */
import { createRequire } from 'module';
import { execFileSync } from 'child_process';
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  mkdtempSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const pkgDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(pkgDir, '..');
const require = createRequire(root + '/package.json');

// Checks are collected first and awaited in order below. Running them inline
// would silently pass any async check that rejects — which is exactly the bug
// this file existed to catch elsewhere.
const checks = [];
const check = (id, label, fn) => checks.push({ id, label, fn });

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

/** Every `exports` target a consumer can reach must exist on disk. */
const exportTargets = pkg =>
  Object.entries(pkg.exports ?? {}).flatMap(([subpath, conditions]) =>
    Object.entries(conditions).map(([condition, file]) => ({
      subpath,
      condition,
      file,
    }))
  );

// ---------------------------------------------------------------------------

const concurrentPkg = JSON.parse(
  readFileSync(join(pkgDir, 'package.json'), 'utf8')
);

check('A-10', 'export map targets all exist', () => {
  const targets = exportTargets(concurrentPkg);
  assert(targets.length > 0, 'no exports declared');

  for (const { subpath, condition, file } of targets) {
    const full = resolve(pkgDir, file);
    assert(existsSync(full), `${subpath} [${condition}] -> missing ${file}`);
  }

  return `${targets.length} target(s)`;
});

check(
  'A-10',
  'the concurrent core is a different artifact from the base core',
  () => {
    const base = readFileSync(join(root, 'dist/lithent.umd.js'));
    const concurrent = readFileSync(
      join(pkgDir, 'dist/lithentConcurrent.umd.js')
    );

    assert(
      !base.equals(concurrent),
      'base and concurrent bundles are identical'
    );
    assert(
      concurrent.includes('startTransition'),
      'concurrent bundle has no startTransition'
    );
    assert(
      !base.includes('startTransition'),
      'the frozen base bundle should not contain startTransition'
    );

    return 'distinct';
  }
);

check('A-5', 'the shipped bundle keeps Fragment identity', async () => {
  // Not a call to `checkFragmentFunction` — that is internal. A broken Fragment
  // identity makes fragments fall through to the custom-component path, which
  // shows up as different DOM. Rendering is the observable form of the check,
  // and it runs against the bundle rather than the source.
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM('<!DOCTYPE html><body></body>');
  for (const key of [
    'window',
    'document',
    'DocumentFragment',
    'HTMLElement',
    'Element',
    'Text',
    'Node',
  ]) {
    globalThis[key] = key === 'window' ? dom.window : dom.window[key];
  }

  return import(join(pkgDir, 'dist/lithentConcurrent.mjs')).then(core => {
    const { h, Fragment, render, mount } = core;
    const host = dom.window.document.createElement('div');
    const App = mount(
      () => () => h(Fragment, {}, h('i', {}, 'x'), h('b', {}, 'y'))
    );

    render(h(App, {}), host);
    assert(
      host.innerHTML === '<i>x</i><b>y</b>',
      `fragment rendered as ${host.innerHTML}`
    );

    return host.innerHTML;
  });
});

check('A-11', 'lithent-concurrent/helper loads standalone', async () =>
  import(join(pkgDir, 'helper/dist/lithentConcurrentHelper.mjs')).then(mod => {
    for (const name of ['deferred', 'ldeferred', 'isPending']) {
      assert(typeof mod[name] === 'function', `${name} is not exported`);
    }
    return Object.keys(mod).join(', ');
  })
);

check('A-9', 'emitted declarations carry no unresolved "@/" specifiers', () => {
  const walk = dir =>
    readdirSync(dir).flatMap(name => {
      const full = join(dir, name);
      return statSync(full).isDirectory()
        ? walk(full)
        : full.endsWith('.d.ts')
          ? [full]
          : [];
    });

  const files = [
    ...walk(join(pkgDir, 'dist/types')),
    ...walk(join(pkgDir, 'helper/dist/types')),
  ];
  assert(files.length > 0, 'no declarations emitted');

  const bad = files.filter(file =>
    /from\s+['"]@\//.test(readFileSync(file, 'utf8'))
  );
  assert(bad.length === 0, `unresolved specifiers in ${bad.join(', ')}`);

  return `${files.length} file(s)`;
});

check('A-9', 'a consumer type-checks against the shipped declarations', () => {
  const dir = mkdtempSync(join(tmpdir(), 'lithent-concurrent-types-'));
  const corePath = resolve(pkgDir, concurrentPkg.exports['.'].types);
  const helperPath = resolve(pkgDir, concurrentPkg.exports['./helper'].types);

  writeFileSync(
    join(dir, 'consumer.ts'),
    [
      `import { h, Fragment, mount, render, startTransition, whenIdle } from '${corePath.replace(/\.d\.ts$/, '')}';`,
      `import { ldeferred, isPending } from '${helperPath.replace(/\.d\.ts$/, '')}';`,
      `import type { WDom, Renew } from '${corePath.replace(/\.d\.ts$/, '')}';`,
      `export const App = mount((renew: Renew) => {`,
      `  const label = ldeferred('a');`,
      `  const pending = isPending();`,
      `  const bump = () => startTransition(() => { label.value = 'b'; renew(); });`,
      `  return (): WDom => h('button', { onClick: bump }, pending.value ? '...' : label.v);`,
      `});`,
      `export const boot = (el: HTMLElement) => { render(h(App, {}), el); return whenIdle(); };`,
      `export const _f = Fragment;`,
    ].join('\n')
  );

  writeFileSync(
    join(dir, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ESNext',
        module: 'ESNext',
        moduleResolution: 'node',
        strict: true,
        skipLibCheck: true,
        noEmit: true,
        jsx: 'preserve',
        jsxFactory: 'h',
        jsxFragmentFactory: 'Fragment',
        lib: ['DOM', 'ESNext'],
      },
      files: ['consumer.ts'],
    })
  );

  execFileSync('npx', ['tsc', '-p', join(dir, 'tsconfig.json')], {
    cwd: root,
    stdio: 'pipe',
  });

  return 'tsc --strict clean';
});

check(
  'B-*',
  'the manual-test demo type-checks against the shipped packages',
  () => {
    // The demo page is section B's only harness, and nothing else compiles it —
    // it lives outside `src/`, so neither the library build's checker nor the
    // declaration emit ever sees it. Checking it here, against the BUILT
    // declarations, makes it a consumer integration test as well as a demo: an
    // API used wrongly on the page fails the release check rather than at the
    // moment someone opens the browser to run the manual checklist.
    const dir = mkdtempSync(join(tmpdir(), 'lithent-concurrent-demo-'));
    const withoutExt = file => resolve(pkgDir, file).replace(/\.d\.ts$/, '');

    writeFileSync(
      join(dir, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          target: 'ESNext',
          module: 'ESNext',
          moduleResolution: 'node',
          strict: true,
          skipLibCheck: true,
          noEmit: true,
          jsx: 'preserve',
          jsxFactory: 'h',
          jsxFragmentFactory: 'Fragment',
          lib: ['DOM', 'DOM.Iterable', 'ESNext'],
          baseUrl: dir,
          paths: {
            'lithent-concurrent': [
              withoutExt(concurrentPkg.exports['.'].types),
            ],
            'lithent-concurrent-helper': [
              withoutExt(concurrentPkg.exports['./helper'].types),
            ],
          },
        },
        files: [join(pkgDir, 'demo/transition.tsx')],
      })
    );

    execFileSync('npx', ['tsc', '-p', join(dir, 'tsconfig.json')], {
      cwd: root,
      stdio: 'pipe',
    });

    return 'demo/transition.tsx clean';
  }
);

// ---------------------------------------------------------------------------

let failed = false;

for (const { id, label, fn } of checks) {
  let ok = true;
  let detail;

  try {
    detail = await fn();
  } catch (error) {
    ok = false;
    detail = error.message;
  }

  failed ||= !ok;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${id}  ${label}\n       ${detail}`);
}

console.log(failed ? '\nARTIFACT CHECKS FAILED' : '\nALL PASS');
process.exit(failed ? 1 : 0);
