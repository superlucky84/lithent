import { describe, it, expect, afterEach } from 'vitest';
import {
  h,
  Fragment,
  portal,
  render,
  mount,
  mountCallback,
  deferRender,
  whenIdle,
  nextTick,
  hasPending,
  getComponentKey,
} from '@/index';
import { setLowLaneBudget, workResumeCount } from '@/scheduler';

/**
 * Phase 10 — the paths the happy-path suite never walks.
 *
 * Everything here is a low-lane render, because that is the only lane that can
 * be interrupted (DC-20) and therefore the only one where the new machinery is
 * live. `setLowLaneBudget(0)` forces a pause after every unit so these are not
 * "passed because the machine was fast enough".
 */

const host = () => document.createElement('div');

/** A component whose renders and lane can be driven from the outside. */
const driven = (body: () => unknown) => {
  let renew = () => {};
  const Comp = mount((r: () => void) => {
    renew = r;
    return () => body() as never;
  });

  return { Comp, bump: () => renew() };
};

afterEach(() => setLowLaneBudget());

describe('lane contention', () => {
  it('10-1. a sync renew drops the pending low entry for the same component', async () => {
    // What this pins is "one render, not one per lane".
    //
    // It does NOT pin the drop itself, and that is worth knowing: with
    // `lanes.low.delete` removed the count stays 1 anyway, because the stale low
    // entry's closure targets the node the sync commit just retired and
    // `replaceWDom`'s `il` guard turns it away. Two independent defences.
    // The drop is pinned by `concurrent-schedulerLane`'s queue-state assertion.
    let value = 'a';
    let renders = 0;
    let key: object = {};
    let bump = () => {};

    const App = mount((renew: () => void) => {
      bump = renew;
      key = getComponentKey() as object;
      return () => {
        renders++;
        return <b>{value}</b>;
      };
    });

    const el = host();
    render(<App />, el);

    renders = 0;
    value = 'low';
    deferRender(() => bump());
    value = 'sync';
    bump();

    await nextTick();
    expect(el.textContent, 'the urgent value is what lands').toBe('sync');
    expect(renders, 'exactly one render, not one per lane').toBe(1);

    await whenIdle();
    expect(renders, 'the dropped low entry never runs').toBe(1);
    expect(hasPending(key as never)).toBe(false);
  });

  it('10-2. parent and child may sit in different lanes', async () => {
    // Observed from the CHILD's side on purpose. A parent render re-renders its
    // subtree, so a child value read during the parent's pass tells you nothing
    // about lanes. Putting the urgent update on the child and the deferred one
    // on the parent makes the separation visible: the child moves alone first.
    let childValue = 'c0';
    let parentValue = 'p0';
    const child = driven(() => <i>{childValue}</i>);
    const parent = driven(() => (
      <div>
        <span>{parentValue}</span>
        <child.Comp />
      </div>
    ));

    const el = host();
    render(<parent.Comp />, el);

    setLowLaneBudget(0);

    parentValue = 'p1';
    deferRender(() => parent.bump());
    childValue = 'c1';
    child.bump();

    await nextTick();
    expect(el.textContent, 'the urgent child moved without the parent').toBe(
      'p0c1'
    );

    await whenIdle();
    expect(el.textContent).toBe('p1c1');
  });
});

describe('low-lane render shapes', () => {
  const shapes: [string, () => { markup: unknown; expected: string }][] = [
    [
      'Fragment',
      () => ({
        markup: (
          <Fragment>
            <b>x</b>
            <i>y</i>
          </Fragment>
        ),
        expected: '<b>x</b><i>y</i>',
      }),
    ],
    [
      'keyed list',
      () => ({
        markup: (
          <ul>
            {[3, 1, 2].map(id => (
              <li key={id}>{String(id)}</li>
            ))}
          </ul>
        ),
        expected: '<ul><li>3</li><li>1</li><li>2</li></ul>',
      }),
    ],
  ];

  for (const [name, make] of shapes) {
    it(`10-3. ${name} survives a paused low-lane render`, async () => {
      let show = false;
      const app = driven(() => (show ? make().markup : <em>empty</em>));
      const el = host();
      render(<app.Comp />, el);

      setLowLaneBudget(0);
      const before = workResumeCount();

      show = true;
      deferRender(() => app.bump());
      await whenIdle();

      expect(workResumeCount() - before, 'it really paused').toBeGreaterThan(0);
      expect(el.innerHTML).toBe(make().expected);
    });
  }

  it('10-3. portal content lands in its own host after a paused render', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);

    let show = false;
    const app = driven(() => (
      <div>
        <span>inline</span>
        {show ? portal(<b>ported</b>, target) : null}
      </div>
    ));

    const el = host();
    render(<app.Comp />, el);

    setLowLaneBudget(0);
    show = true;
    deferRender(() => app.bump());
    await whenIdle();

    expect(target.innerHTML, 'portal content went to its own host').toBe(
      '<b>ported</b>'
    );
    expect(el.textContent).toBe('inline');

    target.remove();
  });
});

describe('stale and re-entrant work', () => {
  it('10-4. a queued render for an unmounted component is dropped', async () => {
    let show = true;
    let bumpChild = () => {};

    const Child = mount((renew: () => void) => {
      bumpChild = renew;
      return () => <i>child</i>;
    });

    const parent = driven(() => (show ? <Child /> : <em>gone</em>));
    const el = host();
    render(<parent.Comp />, el);

    // Queue the child low, then unmount it before the low flush.
    deferRender(() => bumpChild());
    show = false;
    parent.bump();
    await nextTick();

    expect(el.textContent).toBe('gone');

    // The stale low entry must not throw and must not resurrect anything.
    await expect(whenIdle()).resolves.toBeUndefined();
    expect(el.textContent).toBe('gone');
  });

  it('10-11. a deferRender raised while the first build is in flight is not lost', async () => {
    // Found by the real-browser input measurement (B-1): at 10,000 rows, two
    // deferred writes 90ms apart left the list showing the FIRST value for good,
    // with nothing pending and `whenIdle()` resolved.
    //
    // The second entry is queued with the redraw closure of the node that is on
    // screen at that moment. The in-flight build then commits, which retires that
    // node, and `replaceWDom`'s `il` guard turned the entry away. The committed
    // tree came from an updater that ran before the second write, so nothing
    // re-rendered it.
    //
    // The write is raised from inside a row's updater so it lands while the
    // build is between slices without depending on timing.
    let value = 'one';
    let armed = true;
    let list = { bump: () => {} };

    const Row = mount(
      (_renew: () => void, props: { i: number; key?: number }) => () => {
        if (props.i === 5 && armed) {
          armed = false;
          value = 'two';
          deferRender(() => list.bump());
        }

        return <li>{value}</li>;
      }
    );
    const rows = Array.from({ length: 12 }, (_, i) => i);
    const driver = driven(() => (
      <ul>
        {rows.map(i => (
          <Row key={i} i={i} />
        ))}
      </ul>
    ));
    list = driver;

    armed = false;
    const el = host();
    render(<driver.Comp />, el);

    setLowLaneBudget(0);
    armed = true;
    value = 'one';

    deferRender(() => driver.bump());
    await whenIdle();

    expect(armed, 'the second write was raised mid-build').toBe(false);
    const shown = Array.from(el.querySelectorAll('li')).map(
      li => li.textContent
    );
    expect(new Set(shown), 'every row shows the latest value').toEqual(
      new Set(['two'])
    );
  });

  it('10-7. deferRender nested inside a render routes to the low lane', async () => {
    // The target lives in its own tree, so the render that calls `deferRender`
    // does not re-render it. Otherwise the value would land with that render's
    // own commit and say nothing about which lane it went to.
    let targetValue = 't0';
    const target = driven(() => <i>{targetValue}</i>);
    const targetEl = host();
    let targetKey: object = {};

    const TargetRoot = mount(() => {
      targetKey = getComponentKey() as object;
      return () => <target.Comp />;
    });
    render(<TargetRoot />, targetEl);

    let armed = false;
    const outer = driven(() => {
      if (armed) {
        armed = false;
        targetValue = 't1';
        deferRender(() => target.bump());
      }
      return <b>outer</b>;
    });

    render(<outer.Comp />, host());

    armed = true;
    outer.bump();
    await nextTick();

    expect(targetEl.textContent, 'it did not ride the sync commit').toBe('t0');

    await whenIdle();
    expect(targetEl.textContent).toBe('t1');
    void targetKey;
  });

  it('10-8. a renew raised during commit is honoured', async () => {
    let value = 'v0';
    let armed = false;
    let bump = () => {};

    const App = mount((renew: () => void) => {
      bump = renew;

      // `updateCallback` fires while the build runs; `mountCallback` at commit.
      mountCallback(() => {
        if (armed) {
          armed = false;
          value = 'from-commit';
          renew();
        }
      });

      return () => <b>{value}</b>;
    });

    const el = host();
    armed = true;
    render(<App />, el);

    await nextTick();
    await whenIdle();

    expect(el.textContent).toBe('from-commit');
    void bump;
  });

  it('10-9. unmounting while a build is parked does not throw', async () => {
    let show = true;
    let value = 'a';
    const child = driven(() => <i>{value}</i>);
    const parent = driven(() => (show ? <child.Comp /> : <em>gone</em>));

    const el = host();
    render(<parent.Comp />, el);

    setLowLaneBudget(0);

    // Park a heavy-ish low build on the child, then remove the child.
    value = 'b';
    deferRender(() => child.bump());

    show = false;
    parent.bump();
    await nextTick();

    await expect(whenIdle()).resolves.toBeUndefined();
    expect(el.textContent).toBe('gone');
  });
});

describe('N1 boundary (10-10)', () => {
  it('a throw during render stays a plain exception', async () => {
    const boom = new Error('render blew up');
    const app = driven(() => {
      throw boom;
    });

    const el = host();

    expect(() => render(<app.Comp />, el)).toThrow(boom);
  });

  it('a thrown Promise is not treated as suspension', () => {
    const thrown = Promise.resolve('never awaited');
    const app = driven(() => {
      throw thrown;
    });

    const el = host();

    // If Suspense-via-throw had crept in, this would be swallowed and retried
    // instead of propagating. N1 says it must propagate.
    let caught: unknown;
    try {
      render(<app.Comp />, el);
    } catch (error) {
      caught = error;
    }

    expect(caught, 'the Promise came straight back out').toBe(thrown);
    expect(el.innerHTML, 'nothing was rendered in its place').toBe('');
  });

  it('the public surface has no Suspense-shaped API', async () => {
    const core = (await import('@/index')) as Record<string, unknown>;
    const names = Object.keys(core);

    expect(names).not.toContain('use');
    expect(names).not.toContain('Suspense');
    expect(names.filter(name => /suspen|lazy/i.test(name))).toEqual([]);
  });
});

describe('urgent render beside a parked build (B-1)', () => {
  type Shape = { a: boolean; b: boolean; items: number[] };

  // Three siblings under one parent: A and B change their root element type on
  // an urgent render, the list in the middle is rebuilt in the low lane. Rows can
  // raise those urgent renders from inside the build (`onRow`), which is the only
  // dependable way to land one between two slices.
  const makeApp = (
    init: Shape,
    onRow: (
      n: number,
      bump: { a: () => void; b: () => void }
    ) => void = () => {}
  ) => {
    const state: Shape = { ...init, items: [...init.items] };
    const bump = { a: () => {}, b: () => {}, list: () => {} };

    const A = mount((renew: () => void) => {
      bump.a = renew;
      return () => (state.a ? <section>A</section> : <p>A</p>);
    });
    const B = mount((renew: () => void) => {
      bump.b = renew;
      return () => (state.b ? <section>B</section> : <p>B</p>);
    });
    const Row = mount(
      (_renew: () => void, props: { n: number; key?: number }) => {
        return () => {
          onRow(props.n, bump);
          return <i>{props.n}</i>;
        };
      }
    );
    const List = mount((renew: () => void) => {
      bump.list = renew;
      return () => (
        <>
          {state.items.map(n => (
            <Row key={n} n={n} />
          ))}
        </>
      );
    });
    const App = mount(() => () => (
      <div>
        <A />
        <List />
        <B />
      </div>
    ));

    return { state, bump, App };
  };

  const settled = (shape: Shape) => {
    const ref = makeApp(shape);
    const el = host();
    render(<ref.App />, el);
    return el.innerHTML;
  };

  it('10-12. an unrelated urgent render does not finish a parked build', async () => {
    // The urgent render is raised from inside a row of the list, so it lands
    // exactly between two slices without depending on timer or channel order,
    // and A's own updater records what is on screen when it runs. If the parked
    // build had been finished first, the whole new list would already be there.
    const state: Shape = {
      a: true,
      b: true,
      items: Array.from({ length: 40 }, (_, i) => 40 - i),
    };
    let bumpA = () => {};
    let bumpList = () => {};
    let armed = false;
    let listCountSeenByA = -1;
    const el = host();

    const A = mount((renew: () => void) => {
      bumpA = renew;
      return () => {
        if (armed) {
          listCountSeenByA = el.querySelectorAll('i').length;
          armed = false;
        }

        return state.a ? <section>A</section> : <p>A</p>;
      };
    });
    const Row = mount(
      (_renew: () => void, props: { n: number; key?: number }) => {
        return () => {
          if (props.n === 20 && fireAt) {
            fireAt = false;
            armed = true;
            state.a = false;
            bumpA();
          }

          return <i>{props.n}</i>;
        };
      }
    );
    let fireAt = false;
    const List = mount((renew: () => void) => {
      bumpList = renew;
      return () => (
        <>
          {state.items.map(n => (
            <Row key={n} n={n} />
          ))}
        </>
      );
    });
    const App = mount(() => () => (
      <div>
        <A />
        <List />
      </div>
    ));

    state.items = [1, 2, 3];
    render(<App />, el);

    setLowLaneBudget(0);
    state.items = Array.from({ length: 40 }, (_, i) => 40 - i);
    fireAt = true;
    deferRender(() => bumpList());
    await whenIdle();

    expect(armed, 'the urgent render ran').toBe(false);
    expect(
      listCountSeenByA,
      'the list was still the old one when the urgent render built'
    ).toBe(3);
    expect(el.querySelector('p')?.textContent).toBe('A');
    expect(
      el.querySelectorAll('i').length,
      'and the list landed afterwards'
    ).toBe(40);
  });

  it('10-13. random urgent renders between slices converge on the same DOM', async () => {
    // Insertion anchors are computed at build time. An urgent render of a
    // neighbour that swaps its root element while the list is parked is the way
    // to make one of them go stale, so this walks many such interleavings and
    // compares each final DOM with one rendered from the final state alone.
    let seed = 12345;
    const rand = (n: number) => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed % n;
    };
    let urgentRan = 0;

    for (let round = 0; round < 60; round++) {
      const fires = new Map<number, 'a' | 'b'>();
      const app = makeApp(
        { a: true, b: true, items: [1, 2, 3, 4] },
        (n, bump) => {
          const which = fires.get(n);

          if (which) {
            fires.delete(n);
            urgentRan++;
            app.state[which] = !app.state[which];
            bump[which]();
          }
        }
      );
      const el = host();
      render(<app.App />, el);

      setLowLaneBudget(0);

      for (let step = 0; step < 3; step++) {
        const items = Array.from({ length: 4 + rand(24) }, (_, i) => i).sort(
          () => rand(3) - 1
        );
        for (let k = 0; k < 2 + rand(3); k++) {
          fires.set(items[rand(items.length)], rand(2) ? 'a' : 'b');
        }

        app.state.items = items;
        deferRender(() => app.bump.list());
        await whenIdle();
      }

      expect(el.innerHTML, `round ${round}`).toBe(
        settled({
          a: app.state.a,
          b: app.state.b,
          items: app.state.items,
        })
      );
    }

    expect(
      urgentRan,
      'urgent renders really landed between slices'
    ).toBeGreaterThan(60);
  });
});
