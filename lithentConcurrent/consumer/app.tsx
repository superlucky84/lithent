import { h, Fragment, mount, portal, nextTick } from 'lithent';
import * as lithentCore from 'lithent';
import { state, store, createContext } from 'lithent/helper';

/**
 * Phase 11-6 — a consumer app, written the way a consumer writes one.
 *
 * Every import here is a BARE specifier: `lithent` and `lithent/helper`. That is
 * the whole point. The alias in `vite.config.js` swaps only `lithent` itself, so
 * this file proves two things at once —
 *
 *   1. the core really is drop-in (the source below does not change), and
 *   2. the subpaths survive the swap (`lithent/helper` must NOT be redirected;
 *      Phase 0 broke exactly this way with a prefix-matching alias).
 *
 * Run it both ways and compare:
 *   pnpm check:consumer        # lithent -> lithent-concurrent
 *   pnpm check:consumer:base   # no alias
 *
 * The checks are on the page, not in the console, so "it looked fine" cannot be
 * the verdict.
 */

type OptionalLanes = {
  deferRender?: (scope: () => void) => void;
  whenIdle?: () => Promise<void>;
};

const lanes = lithentCore as OptionalLanes;
const hasLanes = typeof lanes.deferRender === 'function';

// --- shared state, the ordinary way ----------------------------------------

const counter = store<{ hits: number }>({ hits: 0 });

const themeContext = createContext<{ name: string }>();
const {
  Provider: ThemeProvider,
  contextState: themeState,
  useContext: useTheme,
} = themeContext;

const rows = (count: number, tag: string) =>
  Array.from({ length: count }, (_, i) => ({ id: i, label: `${tag} ${i}` }));

// --- components -------------------------------------------------------------

const Row = mount<{ key: number; row: { id: number; label: string } }>(
  (_renew, props) => () => (
    <li>
      <span class="id">#{String(props.row.id)}</span> {props.row.label}
    </li>
  )
);

const Badge = mount(renew => {
  const shared = counter(renew);

  return () => <b class="badge">{String(shared.hits)}</b>;
});

const ThemeLabel = mount(renew => {
  const ctx = useTheme(themeContext, renew, ['name']);

  return () => <em class="theme">{ctx.name?.value ?? 'none'}</em>;
});

const Toast = mount<{ host: HTMLElement }>(
  (_renew, props) => () =>
    portal(<div class="toast">portal ok</div>, props.host)
);

/**
 * The heavy part lives in its own component on purpose.
 *
 * `deferRender` defers the RENDER, not the state. If the urgent update and the
 * deferred one belong to the SAME component, the urgent render reads the value
 * the deferred setter already wrote and paints it immediately — the deferral
 * buys nothing. (This app had exactly that bug, and the check below caught it.)
 *
 * So: the input owns `query` and re-renders itself; the list owns its rows and
 * is re-rendered separately. That separation is what makes a lane useful.
 */
let pushRows: (next: { id: number; label: string }[]) => void = () => {};

const HeavyList = mount(renew => {
  let current = rows(2000, 'a');

  pushRows = next => {
    current = next;
    renew();
  };

  return () => (
    <ul class="rows">
      {current.map(row => (
        <Row key={row.id} row={row} />
      ))}
    </ul>
  );
});

const Filter = mount(renew => {
  const query = state('', renew);
  let heavy = 0;

  const type = (event: Event) => {
    // Urgent: only this component re-renders, so the input stays responsive.
    query.value = (event.target as HTMLInputElement).value;

    const next = rows(2000, `${query.value || 'a'}-${heavy++}`);

    if (hasLanes && lanes.deferRender) {
      lanes.deferRender(() => pushRows(next));
    } else {
      pushRows(next);
    }
  };

  return () => (
    <input value={query.value} onInput={type} placeholder="타이핑" />
  );
});

const App = mount(() => {
  const theme = themeState('light');

  const bumpShared = () => {
    counter().hits += 1;
  };

  const flipTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  };

  const toastHost = document.getElementById('toast-host') as HTMLElement;

  return () => (
    <ThemeProvider name={theme}>
      <Fragment>
        <div class="bar">
          <Filter />
          <button onClick={bumpShared}>store +1</button>
          <button onClick={flipTheme}>theme</button>
          <span>
            store <Badge /> · theme <ThemeLabel />
          </span>
        </div>
        <HeavyList />
        <Toast host={toastHost} />
      </Fragment>
    </ThemeProvider>
  );
});

// --- mount + self checks ----------------------------------------------------

const root = document.getElementById('app') as HTMLElement;
const destroy = (
  lithentCore as { render: (w: unknown, el: HTMLElement) => () => void }
).render(<App />, root);

const results: [string, boolean, string][] = [];
const out = document.getElementById('checks') as HTMLElement;

const check = (name: string, ok: boolean, detail: string) => {
  results.push([name, ok, detail]);
  paint();
};

/**
 * Painted after every check, not once at the end.
 *
 * The first version only wrote the table on the last line of `run()`, so an
 * exception anywhere in between left "검사 중 …" on screen forever and said
 * nothing about where it died. A checker that can fail silently is worse than
 * no checker.
 */
const paint = (fatal?: unknown) => {
  const failed = results.filter(([, ok]) => !ok).length;
  const head = fatal
    ? `<p class="bad">중단됨 — ${String(fatal)}</p>`
    : `<p class="${failed ? 'bad' : 'good'}">` +
      (failed ? `${failed}개 실패` : `${results.length}개 통과`) +
      '</p>';

  out.innerHTML =
    head +
    '<table>' +
    results
      .map(
        ([name, ok, detail]) =>
          `<tr><td>${ok ? '✅' : '❌'}</td><td>${name}</td><td class="detail">${detail}</td></tr>`
      )
      .join('') +
    '</table>';
};

window.addEventListener('error', event => paint(event.error || event.message));
window.addEventListener('unhandledrejection', event => paint(event.reason));

const run = async () => {
  await nextTick();

  check(
    '코어',
    true,
    hasLanes ? 'lithent-concurrent (deferRender 있음)' : 'lithent (기본)'
  );
  check(
    'lithent/helper 서브패스',
    typeof store === 'function' && typeof createContext === 'function',
    'store · createContext 로드됨'
  );
  check(
    'keyed 리스트',
    root.querySelectorAll('.rows li').length === 2000,
    `${root.querySelectorAll('.rows li').length}행`
  );
  check(
    'Fragment',
    !!root.querySelector('.bar') && !!root.querySelector('.rows'),
    '형제 노드가 래퍼 없이 나란히'
  );
  check(
    'portal',
    (document.getElementById('toast-host') as HTMLElement).textContent ===
      'portal ok',
    '다른 호스트로 렌더됨'
  );
  check('store', root.querySelector('.badge')?.textContent === '0', '초기값 0');
  check(
    'context',
    root.querySelector('.theme')?.textContent === 'light',
    '초기값 light'
  );

  // store와 context가 실제로 갱신되는지 — 초기 렌더만으로는 아무것도 증명 못 한다.
  const buttons = root.querySelectorAll('.bar button');

  check('버튼 렌더', buttons.length === 2, `${buttons.length}개`);

  if (buttons.length === 2) {
    (buttons[0] as HTMLButtonElement).click();
    (buttons[1] as HTMLButtonElement).click();
    await nextTick();
  }

  check(
    'store 갱신',
    root.querySelector('.badge')?.textContent === '1',
    `현재 ${root.querySelector('.badge')?.textContent}`
  );
  check(
    'context 갱신',
    root.querySelector('.theme')?.textContent === 'dark',
    `현재 ${root.querySelector('.theme')?.textContent}`
  );

  /** Never await the core forever — a hang has to become a visible failure. */
  const within = async (ms: number, work: Promise<unknown>) => {
    let timer: ReturnType<typeof setTimeout>;
    const timeout = new Promise<'timeout'>(resolve => {
      timer = setTimeout(() => resolve('timeout'), ms);
    });

    const result = await Promise.race([
      work.then(() => 'ok' as const),
      timeout,
    ]);
    clearTimeout(timer!);

    return result === 'ok';
  };

  if (hasLanes && lanes.whenIdle) {
    const input = root.querySelector('input') as HTMLInputElement;
    input.value = 'zz';
    input.dispatchEvent(new Event('input'));
    await nextTick();

    const deferredYet = root.querySelector('.rows li')?.textContent ?? '';
    check(
      'deferRender가 미룬다',
      !deferredYet.includes('zz'),
      '동기 커밋 시점에는 아직 반영 전'
    );

    const settled = await within(2000, lanes.whenIdle());

    check(
      'whenIdle 이 풀린다',
      settled,
      settled
        ? '저우선순위 레인이 비었다'
        : '2초 안에 안 풀림 — 레인이 멈춰 있다'
    );

    if (settled) {
      check(
        'whenIdle 뒤 반영',
        (root.querySelector('.rows li')?.textContent ?? '').includes('zz'),
        '미룬 렌더가 도착함'
      );
    }
  }

  paint();
};

run().catch(paint);

void destroy;
