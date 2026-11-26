import { vi } from 'vitest';
import {
  Fragment,
  h,
  mount,
  mountCallback,
  nextTick,
  portal,
  render,
} from '@/index';

export type Row = { key: number; inline: 0 | 1 | 2; remote: 0 | 1 | 2 };
export type Rows = (Row | null)[];
export type Update = { rows: Rows } | { bump: number };
export type Scenario = { initial: Rows; ticks: Update[][] };

export class ReplayFailure extends Error {
  constructor(
    readonly phase: 'mount' | 'update' | 'destroy',
    readonly step: number,
    readonly check: string,
    detail: string
  ) {
    super(`${phase} ${step}, ${check}: ${detail}`);
  }
}

type Instance = { key: number; bump: () => void };

export const replayKeyedPortal = async ({ initial, ticks }: Scenario) => {
  const fixture = document.createElement('div');
  const host = document.createElement('main');
  const head = document.createElement('i');
  const tail = document.createElement('i');
  host.append(head, tail);
  fixture.append(host);

  // Give each key its own target. Shared-target ordering has its own contract.
  const targets = new Map<number, HTMLElement>();
  const specs = [
    initial,
    ...ticks.flatMap(tick =>
      tick.flatMap(update => ('rows' in update ? [update.rows] : []))
    ),
  ];
  for (const row of specs.flat()) {
    if (row && !targets.has(row.key)) {
      const target = document.createElement('section');
      target.append(document.createElement('u'));
      fixture.append(target);
      targets.set(row.key, target);
    }
  }

  let rows = initial;
  const live = new Set<Instance>();
  const Item = mount<Row & { target: HTMLElement }>((renew, { key }) => {
    let count = 0;
    const instance = {
      key,
      bump() {
        count++;
        renew();
      },
    };
    mountCallback(() => {
      live.add(instance);
      return () => live.delete(instance);
    });
    return ({ inline, remote, target }) => {
      const label = `${key}:${count}`;
      return (
        <>
          {inline > 0 && <b>{label}</b>}
          {remote > 0 &&
            portal(
              <>
                <em>{label}</em>
                {remote === 2 && <small>{label}</small>}
              </>,
              target
            )}
          {inline === 2 && (
            <>
              <span>{label}</span>
              <strong>{label}</strong>
            </>
          )}
        </>
      );
    };
  });

  let refresh = () => {};
  const App = mount(renew => {
    refresh = renew;
    return () => (
      <>
        {rows.map(
          row => row && <Item {...row} target={targets.get(row.key)!} />
        )}
      </>
    );
  });

  let counts = new Map<number, number>();
  let previous = new Map<number, Instance>();
  let phase: ReplayFailure['phase'] = 'mount';
  let step = 0;
  const fail = (check: string, detail: string): never => {
    throw new ReplayFailure(phase, step, check, detail);
  };
  const verifyHtml = (check: string, actual: string, expected: string) => {
    if (actual !== expected)
      fail(check, `expected ${expected}, received ${actual}`);
  };

  const verify = () => {
    const active = rows.filter(row => row !== null);
    counts = new Map(active.map(({ key }) => [key, counts.get(key) ?? 0]));
    const current = new Map(
      [...live].map(instance => [instance.key, instance])
    );
    if (
      live.size !== counts.size ||
      [...counts.keys()].some(key => !current.has(key))
    ) {
      fail(
        'mounted keys',
        `expected ${[...counts.keys()]}, received ${[...live].map(i => i.key)}`
      );
    }
    for (const [key, instance] of current) {
      if (previous.has(key) && previous.get(key) !== instance) {
        fail('instance identity', `key ${key} remounted`);
      }
    }
    previous = current;

    const inline = active.map(({ key, inline }) => {
      const label = `${key}:${counts.get(key)}`;
      if (inline === 0) return '';
      const first = `<b>${label}</b>`;
      return inline === 1
        ? first
        : `${first}<span>${label}</span><strong>${label}</strong>`;
    });
    verifyHtml('host DOM', host.innerHTML, `<i></i>${inline.join('')}<i></i>`);
    if (host.firstChild !== head || host.lastChild !== tail) {
      fail('host siblings', 'a node outside the render was moved or replaced');
    }

    const remoteRows = new Map(active.map(row => [row.key, row.remote]));
    let sibling = host.nextElementSibling;
    for (const [key, target] of targets) {
      if (sibling !== target)
        fail('portal target', `target for key ${key} moved`);
      sibling = target.nextElementSibling;
      const label = `${key}:${counts.get(key)}`;
      const remote = remoteRows.get(key) ?? 0;
      const content = remote === 0 ? '' : `<em>${label}</em>`;
      const extra = remote === 2 ? `<small>${label}</small>` : '';
      verifyHtml('portal DOM', target.innerHTML, `<u></u>${content}${extra}`);
    }
  };

  // Preserve native microtask order and capture redraw errors for replay.
  const nativeQueue = globalThis.queueMicrotask;
  const errors: unknown[] = [];
  let pending = 0;
  const queue = vi
    .spyOn(globalThis, 'queueMicrotask')
    .mockImplementation(callback => {
      pending++;
      nativeQueue(() => {
        try {
          callback();
        } catch (error) {
          errors.push(error);
        } finally {
          pending--;
        }
      });
    });
  const flush = async () => {
    do {
      await nextTick();
    } while (pending);
    if (errors.length) throw errors[0];
  };

  let dispose: (() => void) | undefined;
  document.body.append(fixture);
  try {
    dispose = render(<App />, host, tail);
    await flush();
    verify();

    phase = 'update';
    for (const tick of ticks) {
      step++;
      for (const update of tick) {
        if ('rows' in update) {
          rows = update.rows;
          refresh();
        } else {
          const count = counts.get(update.bump);
          if (count !== undefined) {
            counts.set(update.bump, count + 1);
            previous.get(update.bump)!.bump();
          }
        }
      }
      await flush();
      verify();
    }

    phase = 'destroy';
    const destroy = dispose;
    dispose = undefined;
    destroy();
    await flush();
    rows = [];
    verify();
  } catch (error) {
    if (error instanceof ReplayFailure) throw error;
    const name = error instanceof Error ? error.name : typeof error;
    const message = error instanceof Error ? error.message : String(error);
    fail(`${name}: ${message}`, 'renderer threw');
  } finally {
    try {
      dispose?.();
    } catch {
      // Preserve the first failure after a partially completed render.
    } finally {
      fixture.remove();
      queue.mockRestore();
    }
  }
};
