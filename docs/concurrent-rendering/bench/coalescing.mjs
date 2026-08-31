/**
 * T1의 이득이 어느 구간부터 생기는지 측정한다 (RC-7 예비 측정).
 *
 *   node docs/concurrent-rendering/bench/coalescing.mjs <sync|deferred> <renderMs> <gapMs>
 *
 * 사전 조건: `pnpm build:concurrent`
 *
 * 측정 설계에서 두 가지가 중요하다. 둘 다 처음에 틀렸다가 고친 것이다.
 *
 * 1. **모드마다 프로세스를 나눈다.** 한 프로세스에서 sync/deferred를 같이 돌리면
 *    sync 쪽 blocking이 deferred 쪽 타이머를 밀어서 결과가 오염된다.
 * 2. **키 입력을 절대 시각에 미리 예약한다.** `await setTimeout` 체이닝은
 *    "렌더가 메인 스레드를 막는 동안 입력이 쌓이는" 실제 거동을 재현하지 못한다.
 *    앞 렌더가 끝난 뒤에야 다음 타이머가 시작되므로 겹침이 영영 안 생긴다.
 *    미리 예약해야 밀린 타이머가 몰려서 발화한다 — 그게 실제 입력 이벤트다.
 *
 * 실측 (10회 입력, 100ms 간격):
 *
 *   렌더 1회    sync 렌더  deferred 렌더   sync 총    deferred 총
 *      0ms         10          10        1,304ms     1,303ms
 *     60ms         10          10        1,302ms     1,303ms
 *    150ms         10           7        1,604ms     1,303ms
 *    400ms         10           4        4,106ms     1,705ms
 *
 * → 단일 렌더가 입력 간격을 넘어야 이득이 생긴다. 그 아래에서는 정확히 0이다.
 *   렌더가 빠르면 MessageChannel 태스크가 다음 입력 전에 이미 발화해서 병합할 게 없다.
 */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const require = createRequire(root + '/package.json');
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><body></body>');
for (const k of [
  'window',
  'document',
  'DocumentFragment',
  'HTMLElement',
  'Element',
  'Text',
  'Node',
  'MessageChannel',
])
  globalThis[k] =
    k === 'window' ? dom.window : (dom.window[k] ?? globalThis[k]);

const core = await import(
  root + '/lithentConcurrent/dist/lithentConcurrent.mjs'
);
const { h, render, useRenew, lmount, startTransition, whenIdle } = core;

const [, , MODE, R, G] = process.argv;
const RENDER_MS = Number(R),
  GAP_MS = Number(G),
  KEYS = 10;
const deferredMode = MODE === 'deferred';
const burn = ms => {
  const e = performance.now() + ms;
  while (performance.now() < e);
};

let renders = -1,
  value = 0,
  bump;
const C = lmount(() => {
  const renew = useRenew();
  bump = () => {
    value += 1;
    deferredMode ? startTransition(renew) : renew();
  };
  return () => {
    renders += 1;
    burn(RENDER_MS);
    return h('span', {}, String(value));
  };
});
render(h(C, {}), dom.window.document.createElement('div'));

const t0 = performance.now();
for (let i = 0; i < KEYS; i += 1) setTimeout(() => bump(), i * GAP_MS);
await new Promise(r => setTimeout(r, KEYS * GAP_MS + 200));
await whenIdle();
await new Promise(r => setTimeout(r, 100));

const total = Math.round(performance.now() - t0);
console.log(
  `${MODE.padEnd(8)} 렌더 ${String(RENDER_MS).padStart(4)}ms · 입력간격 ${String(GAP_MS).padStart(3)}ms · 입력 ${KEYS}회 → 렌더 ${String(renders).padStart(2)}회 · 총 ${total}ms`
);
process.exit(0);
