import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const inspect = `
  const { default: config } = await import('./playwright.config.ts');
  console.log(JSON.stringify({
    browser: config.use.browserName,
    reported: config.metadata.browser,
    projects: config.projects.map(p => p.name),
    servers: config.webServer.map(s => s.url),
  }));
`;
test('browser selection sets the actual engine and keeps both core/server identities; invalid values fail', () => {
  for (const browser of [
    undefined,
    'chromium',
    'firefox',
    'webkit',
    '',
    'safari',
    'Chromium',
  ]) {
    const env = { ...process.env };
    if (browser === undefined) delete env.LITHENT_E2E_BROWSER;
    else env.LITHENT_E2E_BROWSER = browser;
    const result = spawnSync(
      process.execPath,
      ['--input-type=module', '-e', inspect],
      {
        cwd: repo,
        env,
        encoding: 'utf8',
        timeout: 30_000,
      }
    );
    assert.ifError(result.error);
    assert.equal(result.signal, null);
    if (
      browser === undefined ||
      ['chromium', 'firefox', 'webkit'].includes(browser)
    ) {
      assert.equal(result.status, 0, result.stderr);
      const config = JSON.parse(result.stdout);
      assert.equal(config.browser, browser ?? 'chromium');
      assert.equal(config.reported, config.browser);
      assert.deepEqual(config.projects, ['base', 'concurrent']);
      assert.deepEqual(
        config.servers,
        [43130, 43131].map(
          port => `http://127.0.0.1:${port}/e2e/fixtures/integration.html`
        )
      );
    } else {
      assert.equal(result.status, 1);
      assert.match(result.stderr, /Invalid LITHENT_E2E_BROWSER/);
    }
  }
});
