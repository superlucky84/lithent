/**
 * Builds each create-lithent template the way a new project gets it: a copy
 * outside the workspace, without a lockfile, installed with npm at the latest
 * versions in each dependency range.
 *
 * The workspace and PR CI use pnpm-lock.yaml, so they miss drift in the
 * generated projects' toolchain (a new TypeScript or Prettier release once
 * broke both templates' `npm run build`). This needs the npm registry, so it
 * runs on a schedule rather than on pull requests.
 *
 *   node scripts/check-templates-fresh.mjs            # basic and express
 *   node scripts/check-templates-fresh.mjs basic
 */
import { cpSync, mkdtempSync, readdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { spawn, spawnSync } from 'child_process';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templates = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['basic', 'express'];
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const run = (cwd, args) => {
  console.log(`\n$ npm ${args.join(' ')}   (${cwd})`);
  const result = spawnSync(npm, args, { cwd, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`npm ${args.join(' ')} failed`);
};

const copyTemplate = name => {
  const source = join(repo, 'createLithent', name);
  const target = mkdtempSync(join(tmpdir(), `lithent-${name}-`));

  for (const entry of readdirSync(source)) {
    if (entry === 'node_modules' || entry === 'dist') continue;
    cpSync(join(source, entry), join(target, entry), { recursive: true });
  }
  return target;
};

const fetchStatus = async url => {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const response = await fetch(url);
      return { status: response.status, html: await response.text() };
    } catch {
      await new Promise(done => setTimeout(done, 250));
    }
  }
  throw new Error(`no response from ${url}`);
};

/** Production server: SSR markup on a page, 404 for a preload `notFound`. */
const checkExpressServer = async cwd => {
  const server = spawn(process.execPath, ['server.js'], {
    cwd,
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: 'inherit',
  });

  try {
    const home = await fetchStatus('http://localhost:3000/');
    if (home.status !== 200 || !home.html.includes('</h1>'))
      throw new Error(`GET / returned ${home.status} without page markup`);

    const missing = await fetchStatus('http://localhost:3000/no-such-category');
    if (missing.status !== 404)
      throw new Error(`GET /no-such-category returned ${missing.status}`);

    console.log('[ok] SSR page 200 with markup, unknown category 404');
  } finally {
    server.kill();
  }
};

for (const name of templates) {
  const cwd = copyTemplate(name);

  try {
    run(cwd, ['install', '--no-audit', '--no-fund']);
    run(cwd, [
      'ls',
      '--depth=0',
      'typescript',
      'prettier',
      'eslint',
      'vite',
      'lithent',
    ]);
    // The build runs vite-plugin-checker: TypeScript and ESLint (Prettier).
    run(cwd, ['run', 'build']);
    if (name === 'express') await checkExpressServer(cwd);
    console.log(`[ok] ${name}`);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}
