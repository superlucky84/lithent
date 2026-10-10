import { createServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';

const source = readFileSync(
  fileURLToPath(new URL('./benchmark/dist/probe.mjs', import.meta.url)),
  'utf8'
);
const args = process.argv.slice(2);
const server = createServer((request, response) => {
  const isModule = request.url === '/probe.mjs';
  response.setHeader(
    'Content-Type',
    isModule ? 'text/javascript' : 'text/html'
  );
  response.end(isModule ? source : '<!doctype html><body></body>');
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({
    executablePath: process.env.LITHENT_CHROMIUM_PATH || undefined,
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  const measurements = await page.evaluate(async () => {
    const {
      h,
      mount,
      render,
      nextTick,
      whenIdle,
      deferRender,
      updateCallback,
      useRenderBoundary,
      setLowLaneBudget,
      hasPendingWork,
    } = await import('/probe.mjs');
    const results = [];
    for (const rows of [1024, 8192]) {
      const samplesMs = [];
      for (let round = 0; round < 6; round++) {
        const host = document.createElement('div');
        document.body.appendChild(host);
        let gate;
        let renew;
        let value = 0;
        let effects = 0;
        let commits = 0;
        const App = mount(update => {
          renew = update;
          gate = useRenderBoundary();
          updateCallback(() => {
            effects++;
            return () => commits++;
          });
          return () =>
            h(
              'ul',
              {},
              Array.from({ length: rows }, (_, key) =>
                h('li', { key }, String(value))
              )
            );
        });
        const destroy = render(h(App, {}), host);
        try {
          setLowLaneBudget(0);
          value = 1;
          deferRender(() => renew());
          const deadline = performance.now() + 5000;
          while (!hasPendingWork()) {
            if (performance.now() > deadline)
              throw new Error('Did not observe a genuinely parked build');
            await new Promise(resolve => setTimeout(resolve, 0));
          }
          if (effects !== 1 || commits !== 0)
            throw new Error(
              'Expected an uncommitted build with an updater effect'
            );
          const started = performance.now();
          gate.pause();
          const elapsed = performance.now() - started;
          if (hasPendingWork() || effects !== 1 || commits !== 1)
            throw new Error('Pause did not drain exactly one commit');
          if (host.lastElementChild.lastElementChild.textContent !== '1')
            throw new Error('Drain did not finish the previous update');
          value = 2;
          deferRender(() => renew());
          await whenIdle();
          if (effects !== 1 || commits !== 1)
            throw new Error('Work escaped the paused boundary');
          gate.resume();
          await nextTick();
          if (
            effects !== 2 ||
            commits !== 2 ||
            host.lastElementChild.lastElementChild.textContent !== '2'
          )
            throw new Error('Resume did not commit the latest model once');
          if (round > 0) samplesMs.push(elapsed);
        } finally {
          destroy();
          host.remove();
          setLowLaneBudget();
        }
      }
      results.push({
        rows,
        samplesMs,
        medianMs: [...samplesMs].sort((a, b) => a - b)[2],
        maxMs: Math.max(...samplesMs),
      });
    }
    return results;
  });
  const result = {
    probeSha256: createHash('sha256').update(source).digest('hex'),
    browser: browser.version(),
    node: process.version,
    methodology:
      'Instrumented current concurrent bundle, actual boundary adapter. Zero low-lane budget forces a genuinely parked build after an updater effect. Time synchronous pause(), verify one commit before inactive, blocked low updates and one latest-model replay. 1 warmup + 5 samples. Local synthetic timings depend on remaining work.',
    measurements,
  };
  if (args.includes('--output'))
    writeFileSync(
      args[args.indexOf('--output') + 1],
      JSON.stringify(result, null, 2) + '\n'
    );
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
