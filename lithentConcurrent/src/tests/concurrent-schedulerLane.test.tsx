import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  h,
  render,
  mount,
  nextTick,
  startTransition,
  getComponentKey,
} from '../index';
import type { Props, Renew } from '../index';
import { hasPending } from '@/scheduler';

/**
 * Phase 1 — priority lanes (D1, D2).
 *
 * Timing note: the sync lane is a microtask and the low lane is a task, so
 * `await nextTick()` lands after every sync commit and before any low commit.
 * That gap is what makes "still showing the old value" (RC-2) checkable without
 * sleeping on a wall clock.
 */

/** Holds the thread past the low lane's 5 ms slice. */
const burn = (ms: number) => {
  const end = performance.now() + ms;
  while (performance.now() < end) {
    /* deliberately blocking */
  }
};

const settle = () => new Promise(resolve => setTimeout(resolve, 20));

type Row = {
  Comp: unknown;
  bump: () => void;
  renders: () => number;
  compKey: () => Props;
};

const commitLog: string[] = [];

const makeRow = (
  name: string,
  options: { burnMs?: number; onCommit?: () => void } = {}
): Row => {
  const { burnMs = 0, onCommit } = options;
  let count = 0;
  let renders = 0;
  let renew: Renew = () => false;
  let compKey: Props = {};

  const Comp = mount((r: Renew) => {
    renew = r;
    compKey = getComponentKey() as Props;

    return () => {
      // The mount pass is not a commit under test; only updates are logged.
      if (count > 0) {
        renders += 1;
        commitLog.push(name);
        if (burnMs) {
          burn(burnMs);
        }
        onCommit?.();
      }
      return <li>{`${name}:${count}`}</li>;
    };
  });

  return {
    Comp,
    bump: () => {
      count += 1;
      renew();
    },
    renders: () => renders,
    compKey: () => compKey,
  };
};

const mountRows = (rows: Row[]) => {
  const host = document.createElement('div');
  const App = mount(() => () => (
    <ul>
      {rows.map(({ Comp }) => {
        const Row = Comp as () => never;
        return <Row />;
      })}
    </ul>
  ));
  render(<App />, host);
  return host;
};

beforeEach(() => {
  commitLog.length = 0;
});

describe('scheduler lanes', () => {
  it('RC-1: commits a sync update before a pending low one', async () => {
    const low = makeRow('low');
    const sync = makeRow('sync');
    mountRows([low, sync]);

    startTransition(low.bump);
    sync.bump();

    await nextTick();
    expect(commitLog, 'low must not have committed yet').toEqual(['sync']);

    await vi.waitFor(() => expect(commitLog).toHaveLength(2));
    expect(commitLog).toEqual(['sync', 'low']);
  });

  it('RC-2: leaves the previous output in the DOM until the low render runs', async () => {
    const row = makeRow('deferred');
    const host = mountRows([row]);

    startTransition(row.bump);

    await nextTick();
    expect(host.textContent).toBe('deferred:0');

    await vi.waitFor(() => expect(host.textContent).toBe('deferred:1'));
  });

  it('yields mid-flush, letting a sync update raised during the flush cut in', async () => {
    // The sync update is raised from INSIDE the first low commit, so microtask
    // ordering alone cannot put it first — it can only run early if `flushLow`
    // actually hands the remaining queue to a later task. Each low row overruns
    // the 5 ms slice, so a yielding flush produces a, urgent, b, c; a
    // non-yielding one produces a, b, c, urgent.
    let cutIn: (() => void) | null = null;
    const rows = ['a', 'b', 'c'].map((name, index) =>
      makeRow(name, {
        burnMs: 8,
        onCommit:
          index === 0
            ? () => {
                cutIn?.();
                cutIn = null;
              }
            : undefined,
      })
    );
    const urgent = makeRow('urgent');
    mountRows([...rows, urgent]);
    cutIn = urgent.bump;

    startTransition(() => rows.forEach(row => row.bump()));

    await vi.waitFor(() => expect(commitLog).toHaveLength(4));
    expect(commitLog).toEqual(['a', 'urgent', 'b', 'c']);
    rows.forEach(row => expect(row.renders()).toBe(1));
  });

  it('drains every low entry exactly once across the carried-over tasks', async () => {
    const rows = Array.from({ length: 6 }, (_, i) =>
      makeRow(`row${i}`, {
        burnMs: 3,
      })
    );
    mountRows(rows);

    startTransition(() => rows.forEach(row => row.bump()));

    await vi.waitFor(() => expect(commitLog).toHaveLength(6));
    await settle();

    expect(commitLog).toEqual(['row0', 'row1', 'row2', 'row3', 'row4', 'row5']);
  });
});

describe('sync wins over low for the same component', () => {
  it('removes a queued low entry when a sync update arrives', async () => {
    const row = makeRow('low-then-sync');
    mountRows([row]);
    const compKey = row.compKey();

    startTransition(row.bump);
    expect(hasPending(compKey, 'low')).toBe(true);

    row.bump();
    expect(hasPending(compKey, 'low'), 'low entry must be dropped').toBe(false);
    expect(hasPending(compKey, 'sync')).toBe(true);

    await settle();
    expect(row.renders()).toBe(1);
    expect(hasPending(compKey)).toBe(false);
  });

  it('does not queue a low update for a component already queued sync', async () => {
    const row = makeRow('sync-then-low');
    mountRows([row]);
    const compKey = row.compKey();

    row.bump();
    startTransition(row.bump);

    expect(hasPending(compKey, 'low'), 'low entry must not be added').toBe(
      false
    );
    expect(hasPending(compKey, 'sync')).toBe(true);

    await settle();
    expect(row.renders()).toBe(1);
  });
});

describe('startTransition', () => {
  it('restores the previous lane when the scope throws', async () => {
    const row = makeRow('after-throw');
    const host = mountRows([row]);

    expect(() =>
      startTransition(() => {
        throw new Error('boom');
      })
    ).toThrow('boom');

    // A stuck low lane would leave this update invisible after a microtask.
    row.bump();
    await nextTick();
    expect(host.textContent).toBe('after-throw:1');
  });

  it('keeps the outer transition low when nested', async () => {
    const row = makeRow('nested');
    const host = mountRows([row]);

    startTransition(() => {
      startTransition(() => {});
      row.bump();
    });

    await nextTick();
    expect(host.textContent, 'still low after the inner scope exits').toBe(
      'nested:0'
    );

    await vi.waitFor(() => expect(host.textContent).toBe('nested:1'));
  });
});
