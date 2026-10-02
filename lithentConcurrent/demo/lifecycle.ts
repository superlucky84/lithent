import * as baseCore from 'bench-core-base';
import * as concurrentCore from 'bench-core-concurrent';

/**
 * MANUAL_TEST_CHECKLIST 섹션 C(라이프사이클 순서, BC-1)와 F(tearing).
 *
 * 둘 다 판정 기준이 명확해서 눈으로 볼 이유가 없다 — 페이지가 스스로 검사하고
 * 결과를 표로 띄운다. 실패한 항목은 무엇이 기대였고 무엇이 나왔는지 같이 적는다.
 *
 * C는 두 코어를 나란히 돌린다. BC-1은 **의도된 차이**이므로 "같아야 통과"가 아니라
 * "정확히 이렇게 달라야 통과"다 (C-6).
 *
 * F는 concurrent 쪽만 의미가 있다. store는 `lithent/helper`를 쓰지 않고 여기서 만든다 —
 * helper의 번들은 bare `lithent`를 가리키므로 한 페이지에서 두 코어에 각각 물릴 수
 * 없다. 대신 helper와 같은 계약(DC-17: 쓰기 때 코어에 통지)을 그대로 구현한다.
 */

type Core = {
  h: (...args: unknown[]) => unknown;
  Fragment: unknown;
  mount: (mounter: unknown) => unknown;
  render: (wDom: unknown, host: HTMLElement) => () => void;
  mountCallback: (cb: () => void | (() => void)) => void;
  mountReadyCallback: (cb: () => void) => void;
  updateCallback: (cb: () => void, deps?: () => unknown[]) => void;
  nextTick: () => Promise<unknown>;
  deferRender?: (scope: () => void) => void;
  whenIdle?: () => Promise<void>;
  notifyStoreWrite?: () => void;
};

const base = baseCore as unknown as Core;
const concurrent = concurrentCore as unknown as Core;

// ---------------------------------------------------------------------------
// 결과 표
// ---------------------------------------------------------------------------

type Result = { id: string; ok: boolean; detail: string };

const results: Result[] = [];
const out = document.getElementById('checks') as HTMLElement;

const paint = (fatal?: unknown) => {
  const failed = results.filter(r => !r.ok).length;
  const head = fatal
    ? `<p class="bad">중단됨 — ${String(fatal)}</p>`
    : `<p class="${failed ? 'bad' : 'good'}">${
        failed ? `${failed}개 실패` : `${results.length}개 통과`
      }</p>`;

  out.innerHTML =
    head +
    '<table>' +
    results
      .map(
        r =>
          `<tr><td>${r.ok ? '✅' : '❌'}</td><td>${r.id}</td><td class="detail">${r.detail}</td></tr>`
      )
      .join('') +
    '</table>';
};

const check = (id: string, ok: boolean, detail: string) => {
  results.push({ id, ok, detail });
  paint();
};

window.addEventListener('error', e => paint(e.error || e.message));
window.addEventListener('unhandledrejection', e => paint(e.reason));

const stage = document.getElementById('stage') as HTMLElement;

const host = () => {
  const el = document.createElement('div');
  stage.appendChild(el);
  return el;
};

// ---------------------------------------------------------------------------
// helper와 같은 계약의 최소 store (DC-17)
// ---------------------------------------------------------------------------

const makeStore = <T extends object>(core: Core, initial: T) => {
  const data = { ...initial };
  const subscribers = new Set<() => void>();

  return {
    read: () => data as T,
    subscribe: (run: () => void) => subscribers.add(run),
    write: (patch: Partial<T>) => {
      Object.assign(data, patch);
      // helper가 하는 그대로 — 있으면 코어에 알린다.
      core.notifyStoreWrite?.();
      subscribers.forEach(run => run());
    },
  };
};

// ---------------------------------------------------------------------------
// C. 라이프사이클 순서
// ---------------------------------------------------------------------------

/** 한 갱신에서 형제 둘이 마운트될 때, 각자가 본 부모의 자식 수. */
const siblingsSeenAtMount = async (core: Core) => {
  const el = host();
  const seen: string[] = [];
  let reveal = () => {};

  const reporter = (name: string) =>
    core.mount(() => {
      core.mountCallback(() => {
        const parent = el.firstChild as HTMLElement | null;
        seen.push(`${name}:${parent ? parent.childElementCount : 0}`);
      });
      return () => core.h('i', {}, name);
    });

  const A = reporter('A');
  const B = reporter('B');

  const App = core.mount((renew: () => void) => {
    let shown = false;
    reveal = () => {
      shown = true;
      renew();
    };
    return () =>
      core.h(
        'div',
        {},
        shown ? core.h(A, {}) : null,
        shown ? core.h(B, {}) : null
      );
  });

  const destroy = core.render(core.h(App, {}), el);
  reveal();
  await core.nextTick();

  const html = el.innerHTML;
  destroy();

  return { seen, html };
};

/** mountReadyCallback이 자기 엘리먼트가 문서에 들어가기 전에 도는가. */
const readyBeforeMount = async (core: Core) => {
  const el = host();
  let sawItself = 'not-run';

  const Comp = core.mount(() => {
    core.mountReadyCallback(() => {
      sawItself = document.querySelector('.ready-probe')
        ? 'in-document'
        : 'absent';
    });
    return () => core.h('div', { class: 'ready-probe' }, 'x');
  });

  const destroy = core.render(core.h(Comp, {}), el);
  await core.nextTick();
  destroy();

  return sawItself;
};

/** keyed 리스트를 추가·삭제·정렬로 흔들고 마운트/언마운트를 1:1로 세본다. */
const keyedChurn = async (core: Core) => {
  const el = host();
  let mounts = 0;
  let unmounts = 0;
  let setRows = (_next: number[]) => {};

  const Row = core.mount((_r: unknown, props: { id: number }) => {
    mounts += 1;
    core.mountCallback(() => () => {
      unmounts += 1;
    });
    return (p: { id: number }) => core.h('li', {}, String(p.id));
  });

  const App = core.mount((renew: () => void) => {
    let rows = [1, 2, 3, 4, 5];
    setRows = next => {
      rows = next;
      renew();
    };
    return () =>
      core.h(
        'ul',
        {},
        rows.map(id => core.h(Row, { key: id, id }))
      );
  });

  const destroy = core.render(core.h(App, {}), el);
  await core.nextTick();

  for (const rows of [
    [1, 2, 3, 4, 5, 6, 7],
    [7, 5, 3, 1],
    [3, 1, 7, 5, 9],
    [9],
    [9, 8, 7],
  ]) {
    setRows(rows);
    await core.nextTick();
  }

  const live = el.querySelectorAll('li').length;
  destroy();
  await core.nextTick();

  return { mounts, unmounts, live };
};

/** 중첩 컴포넌트 언마운트 순서. */
const nestedUnmountOrder = async (core: Core) => {
  const el = host();
  const order: string[] = [];
  let hide = () => {};

  const traced = (name: string, body: unknown) =>
    core.mount(() => {
      core.mountCallback(() => () => order.push(name));
      return () => body;
    });

  const Deep = traced('deep', null);
  const Mid = core.mount(() => {
    core.mountCallback(() => () => order.push('mid'));
    return () => core.h('b', {}, core.h(Deep, {}));
  });
  const Top = core.mount(() => {
    core.mountCallback(() => () => order.push('top'));
    return () => core.h('div', {}, core.h(Mid, {}));
  });

  const App = core.mount((renew: () => void) => {
    let shown = true;
    hide = () => {
      shown = false;
      renew();
    };
    return () => core.h('section', {}, shown ? core.h(Top, {}) : null);
  });

  const destroy = core.render(core.h(App, {}), el);
  await core.nextTick();
  hide();
  await core.nextTick();
  destroy();

  return order.join(' > ');
};

/** updateCallback의 deps 비교. */
const depsBehaviour = async (core: Core) => {
  const el = host();
  let runs = 0;
  let bumpTracked = () => {};
  let bumpUntracked = () => {};

  const App = core.mount((renew: () => void) => {
    let tracked = 0;
    let untracked = 0;

    core.updateCallback(
      () => {
        runs += 1;
      },
      () => [tracked]
    );

    bumpTracked = () => {
      tracked += 1;
      renew();
    };
    bumpUntracked = () => {
      untracked += 1;
      renew();
    };

    return () => core.h('b', {}, `${tracked}-${untracked}`);
  });

  const destroy = core.render(core.h(App, {}), el);
  await core.nextTick();

  runs = 0;
  bumpUntracked();
  await core.nextTick();
  const afterSame = runs;

  bumpTracked();
  await core.nextTick();
  const afterChanged = runs;

  destroy();

  return { afterSame, afterChanged };
};

// ---------------------------------------------------------------------------
// F. tearing (concurrent 전용)
// ---------------------------------------------------------------------------

/**
 * 같은 store를 읽는 형제 여럿을 저우선순위로 갱신하는 도중 store가 움직인다.
 *
 * DC-18에 맞춰 마운트도 updateCallback도 없는 구성이다 — 그래야 빌드가 폐기 가능하고
 * 버전 체크가 실제로 일할 수 있다.
 */
const tearingAcrossSiblings = async (core: Core) => {
  const el = host();
  const store = makeStore(core, { n: 1 });
  let bump = () => {};
  let armed = false;

  // 형제 중 하나가 빌드 도중에 store를 움직인다.
  const Mover = core.mount(() => () => {
    if (armed) {
      armed = false;
      store.write({ n: 2 });
    }
    return core.h('i', { class: 'mover' }, String(store.read().n));
  });

  const App = core.mount((renew: () => void) => {
    bump = renew;
    return () =>
      core.h(
        'div',
        {},
        core.h('b', { class: 'first' }, String(store.read().n)),
        core.h(Mover, {}),
        core.h('u', { class: 'last' }, String(store.read().n))
      );
  });

  const destroy = core.render(core.h(App, {}), el);
  await core.nextTick();

  armed = true;

  if (core.deferRender) {
    core.deferRender(() => bump());
    await (core.whenIdle as () => Promise<void>)();
  } else {
    bump();
    await core.nextTick();
  }

  const shown = [
    el.querySelector('.first')?.textContent,
    el.querySelector('.mover')?.textContent,
    el.querySelector('.last')?.textContent,
  ];

  destroy();

  return shown;
};

/** 매 빌드마다 store가 움직이면 — 무한 루프 없이 수렴해야 한다. */
const retryTerminates = async (core: Core) => {
  const el = host();
  const store = makeStore(core, { n: 0 });
  let bump = () => {};
  let armed = false;
  let builds = 0;

  const Mover = core.mount(() => () => {
    if (armed) {
      store.write({ n: store.read().n + 1 });
    }
    return core.h('i', {}, String(store.read().n));
  });

  const App = core.mount((renew: () => void) => {
    bump = renew;
    return () => {
      builds += 1;
      return core.h(
        'div',
        {},
        core.h('b', {}, String(store.read().n)),
        core.h(Mover, {})
      );
    };
  });

  const destroy = core.render(core.h(App, {}), el);
  await core.nextTick();

  builds = 0;
  armed = true;

  const settled = await Promise.race([
    (async () => {
      if (core.deferRender) {
        core.deferRender(() => bump());
        await (core.whenIdle as () => Promise<void>)();
      } else {
        bump();
        await core.nextTick();
      }
      return true;
    })(),
    new Promise<boolean>(resolve => setTimeout(() => resolve(false), 2000)),
  ]);

  const html = el.innerHTML;
  armed = false;
  destroy();

  return { settled, builds, html };
};

// ---------------------------------------------------------------------------
// 실행
// ---------------------------------------------------------------------------

const run = async () => {
  results.length = 0;

  // --- C-1 / C-6 ---
  const baseSiblings = await siblingsSeenAtMount(base);
  const concurrentSiblings = await siblingsSeenAtMount(concurrent);

  check(
    'C-1 mountCallback이 행마다 정확히 1회',
    baseSiblings.seen.length === 2 && concurrentSiblings.seen.length === 2,
    `base ${baseSiblings.seen.length}회 · concurrent ${concurrentSiblings.seen.length}회`
  );

  check(
    'C-6 BC-1의 순서 변화가 체인지로그와 일치',
    baseSiblings.seen.join(',') === 'A:1,B:2' &&
      concurrentSiblings.seen.join(',') === 'A:2,B:2',
    `base [${baseSiblings.seen.join(', ')}] · concurrent [${concurrentSiblings.seen.join(', ')}] ` +
      '— 기대: base는 첫 형제가 절반만 지어진 DOM(A:1), concurrent는 완성된 커밋(A:2)'
  );

  check(
    'C-6 결과 DOM은 동일',
    baseSiblings.html === concurrentSiblings.html,
    baseSiblings.html === concurrentSiblings.html
      ? baseSiblings.html
      : `base ${baseSiblings.html} vs concurrent ${concurrentSiblings.html}`
  );

  // --- C-2 ---
  for (const [name, core] of [
    ['base', base],
    ['concurrent', concurrent],
  ] as const) {
    const seen = await readyBeforeMount(core);
    check(
      `C-2 mountReadyCallback은 DOM 삽입 전 (${name})`,
      seen === 'absent',
      seen === 'absent' ? '자기 엘리먼트가 아직 문서에 없다' : `관측: ${seen}`
    );
  }

  // --- C-3 ---
  for (const [name, core] of [
    ['base', base],
    ['concurrent', concurrent],
  ] as const) {
    const churn = await keyedChurn(core);
    // `live`는 마지막 상태의 행 수(3)다. 0을 기대하면 안 된다 — 처음 이 검사가
    // 그렇게 틀려 있었다. 판정은 "돌아간 마운트가 전부 언마운트됐는가"다.
    check(
      `C-3 keyed 흔들기 후 마운트=언마운트 (${name})`,
      churn.mounts === churn.unmounts && churn.mounts > 5,
      `마운트 ${churn.mounts} · 언마운트 ${churn.unmounts} (해체 후) · 마지막 행 ${churn.live}`
    );
  }

  // --- C-4 ---
  //
  // 판정은 "두 코어가 같은 순서인가"다. BC-1은 언마운트 계열을 건드리지 않는다고
  // 명시하므로 그것이 지켜야 할 것이고, 방향 자체는 base가 정한다.
  //
  // 부모 → 자식이다. 마운트(자식 → 부모)와 반대이며 React도 서브트리 삭제 시
  // 위에서 아래로 훑는다. 전체 순서표는 체크리스트 §"콜백 순서 실측표"에 있다.
  const baseOrder = await nestedUnmountOrder(base);
  const concurrentOrder = await nestedUnmountOrder(concurrent);

  check(
    'C-4 중첩 언마운트 정리가 부모 → 자식 (React와 동일)',
    baseOrder === 'top > mid > deep' && concurrentOrder === baseOrder,
    `base [${baseOrder}] · concurrent [${concurrentOrder}]`
  );

  // --- C-5 ---
  for (const [name, core] of [
    ['base', base],
    ['concurrent', concurrent],
  ] as const) {
    const deps = await depsBehaviour(core);
    check(
      `C-5 updateCallback deps 비교 (${name})`,
      deps.afterSame === 0 && deps.afterChanged === 1,
      `deps 그대로일 때 ${deps.afterSame}회 · 바뀌었을 때 ${deps.afterChanged}회`
    );
  }

  // --- F-1 / F-2 ---
  const shown = await tearingAcrossSiblings(concurrent);
  const consistent = shown[0] === shown[1] && shown[1] === shown[2];

  check(
    'F-1/F-2 빌드 도중 store가 움직여도 표시값이 일치',
    consistent && shown[0] === '2',
    `화면 [${shown.join(', ')}] — 섞였다면 [1, 2, 2] 처럼 나온다`
  );

  // --- F-3 ---
  const retry = await retryTerminates(concurrent);

  check(
    'F-3 재시도 상한을 넘겨도 수렴',
    retry.settled && retry.builds > 1 && retry.builds <= 4,
    retry.settled
      ? `빌드 ${retry.builds}회 후 커밋 (상한 2회 폐기 + 마지막 커밋)`
      : '2초 안에 끝나지 않았다 — 무한 루프'
  );

  paint();
};

(document.getElementById('run') as HTMLButtonElement).addEventListener(
  'click',
  () => {
    out.innerHTML = '검사 중 …';
    run().catch(paint);
  }
);

run().catch(paint);
