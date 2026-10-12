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
const previous = args.includes('--previous-probe');
const sources = new Map([['/probe.mjs', source]]);
if (previous)
  sources.set(
    '/previous.mjs',
    readFileSync(args[args.indexOf('--previous-probe') + 1], 'utf8')
  );
const server = createServer((request, response) => {
  const isModule = sources.has(request.url);
  response.setHeader(
    'Content-Type',
    isModule ? 'text/javascript' : 'text/html'
  );
  response.end(
    isModule ? sources.get(request.url) : '<!doctype html><body></body>'
  );
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
  const measurements = await page.evaluate(async previous => {
    const modules = { current: await import('/probe.mjs') };
    if (previous) modules.previous = await import('/previous.mjs');
    const results = [];
    for (const scenario of [
      'related-effects',
      'related-pure',
      'unrelated-effects',
    ])
      for (const rows of [1024, 8192]) {
        const samples = Object.fromEntries(
          Object.keys(modules).map(name => [name, []])
        );
        for (let round = 0; round < 6; round++)
          for (const name of round % 2
            ? Object.keys(modules).reverse()
            : Object.keys(modules)) {
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
            } = modules[name];
            const host = document.createElement('div');
            document.body.appendChild(host);
            let gate;
            let renew;
            let value = 0;
            let effects = 0;
            let commits = 0;
            const observable = scenario !== 'related-pure';
            const unrelated = scenario === 'unrelated-effects';
            const App = mount(update => {
              renew = update;
              if (!unrelated) gate = useRenderBoundary();
              if (observable)
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
            let destroyOther;
            if (unrelated) {
              const Other = mount(() => {
                gate = useRenderBoundary();
                return () => h('aside', {}, 'other boundary');
              });
              destroyOther = render(
                h(Other, {}),
                document.createElement('aside')
              );
            }
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
              if (effects !== Number(observable) || commits !== 0)
                throw new Error(
                  'Expected an uncommitted build with an updater effect'
                );
              const started = performance.now();
              gate.pause();
              const elapsed = performance.now() - started;
              const drained =
                name === 'previous' || scenario === 'related-effects';
              if (
                hasPendingWork() !== (name === 'current' && unrelated) ||
                effects !== Number(observable) ||
                commits !== Number(observable && drained)
              )
                throw new Error('Pause used the wrong settling policy');
              if (
                host.lastElementChild.lastElementChild.textContent !==
                (drained ? '1' : '0')
              )
                throw new Error('Pause committed unexpected DOM');
              setLowLaneBudget();
              await whenIdle();
              if (unrelated && (effects !== 1 || commits !== 1))
                throw new Error(
                  'Unrelated parked work did not finish in the low lane'
                );
              value = 2;
              deferRender(() => renew());
              await whenIdle();
              if (
                effects !== Number(observable) * (unrelated ? 2 : 1) ||
                commits !== Number(observable) * (unrelated ? 2 : 1)
              )
                throw new Error('Work escaped the paused boundary');
              gate.resume();
              await nextTick();
              if (
                effects !== Number(observable) * 2 ||
                commits !== Number(observable) * 2 ||
                host.lastElementChild.lastElementChild.textContent !== '2'
              )
                throw new Error('Resume did not commit the latest model once');
              if (round > 0) samples[name].push(elapsed);
            } finally {
              destroy();
              destroyOther?.();
              host.remove();
              setLowLaneBudget();
            }
          }
        for (const [core, samplesMs] of Object.entries(samples))
          results.push({
            core,
            scenario,
            rows,
            samplesMs,
            medianMs: [...samplesMs].sort((a, b) => a - b)[2],
            maxMs: Math.max(...samplesMs),
          });
      }
    return results;
  }, previous);
  const result = {
    probeSha256: createHash('sha256').update(source).digest('hex'),
    previousProbeSha256: previous
      ? createHash('sha256').update(sources.get('/previous.mjs')).digest('hex')
      : undefined,
    browser: browser.version(),
    node: process.version,
    methodology:
      'Instrumented concurrent bundle and actual adapter, optional paired previous probe. Zero low budget forces a parked build. Related effects drain exactly once; current related pure work is discarded and dirtied through a blocked renewal; current unrelated effects stay parked and finish in the low lane. Hidden related updates remain blocked and resume commits the latest model once. Alternating versions, 1 warmup + 5 samples per scenario/size/version. Local synthetic timings depend on remaining work.',
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
