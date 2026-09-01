import { describe, it, expect } from 'vitest';
import {
  h,
  render,
  mount,
  nextTick,
  updateCallback,
  notifyStoreWrite,
  storeVersion,
} from '@/index';

/**
 * Phase 6 — store tearing (D6, DC-5).
 *
 * A build reads store data as it walks the tree. If the data moves while that
 * walk is in progress, the finished tree describes two different versions of it
 * — the parent showing the old value next to a child showing the new one. The
 * core records the store version when a build starts, compares it before
 * committing, and throws the build away if it moved.
 *
 * `notifyStoreWrite` stands in for `lithent/helper`'s store here on purpose:
 * these tests are about what the CORE does with the signal, and importing the
 * helper into the fork's own suite would drag the base core in with it. The
 * helper end of the wire is covered by `helper/src/tests/storeVersion.tsx`
 * under `pnpm test:dual`.
 *
 * Discarding is only sound because Phase 4 made the build pure (nothing outside
 * the new tree is touched) and because the hook state a build writes is
 * snapshotted and restored — see REQUIREMENTS §7.4.
 */

/** A store-shaped value that reports its writes the way the helper's does. */
const makeData = <T extends object>(initial: T) => {
  const data = { ...initial };
  return {
    read: () => data,
    write: (patch: Partial<T>) => {
      Object.assign(data, patch);
      notifyStoreWrite();
    },
  };
};

describe('store tearing (D6)', () => {
  it('discards a build whose data moved under it', async () => {
    const data = makeData({ n: 1 });
    let bump = () => {};
    let builds = 0;
    let armed = false;

    // Renders AFTER its parent has already read `n`, so a write here is exactly
    // the mid-build move the version check exists to catch. Armed only for the
    // update pass — the initial `render()` does not go through `replaceWDom`.
    const Child = mount(() => () => {
      if (armed) {
        armed = false;
        data.write({ n: 2 });
      }
      return <i>{data.read().n}</i>;
    });

    const Parent = mount((renew: () => void) => {
      bump = renew;
      return () => {
        builds++;
        return (
          <div>
            <b>{data.read().n}</b>
            <Child />
          </div>
        );
      };
    });

    const host = document.createElement('div');
    render(<Parent />, host);

    expect(host.innerHTML, 'the initial render is untouched').toBe(
      '<div><b>1</b><i>1</i></div>'
    );

    builds = 0;
    armed = true;
    bump();
    await nextTick();

    // Torn would be `<b>1</b><i>2</i>`: the second build is what makes them agree.
    expect(host.innerHTML).toBe('<div><b>2</b><i>2</i></div>');
    expect(builds, 'the first build was discarded and redone').toBe(2);
  });

  it('leaves a consistent build alone', async () => {
    const data = makeData({ n: 1 });
    let bump = () => {};
    let builds = 0;

    const Parent = mount((renew: () => void) => {
      bump = renew;
      return () => {
        builds++;
        return <b>{data.read().n}</b>;
      };
    });

    const host = document.createElement('div');
    render(<Parent />, host);

    builds = 0;
    bump();
    await nextTick();

    expect(builds, 'no write, so no retry').toBe(1);
    expect(host.innerHTML).toBe('<b>1</b>');
  });

  it('commits anyway once the retry budget is spent', async () => {
    const data = makeData({ n: 0 });
    let bump = () => {};
    let builds = 0;
    let armed = false;

    // Writes on EVERY build, so no build can ever come out clean. Without a cap
    // this is an infinite loop.
    const Child = mount(() => () => {
      if (armed) {
        data.write({ n: data.read().n + 1 });
      }
      return <i>{data.read().n}</i>;
    });

    const Parent = mount((renew: () => void) => {
      bump = renew;
      return () => {
        builds++;
        return (
          <div>
            <b>{data.read().n}</b>
            <Child />
          </div>
        );
      };
    });

    const host = document.createElement('div');
    render(<Parent />, host);

    builds = 0;
    armed = true;
    bump();
    await nextTick();

    // MAX_STORE_RETRY = 2 discards, then the third build is committed as it is.
    expect(builds, 'terminates instead of retrying forever').toBe(3);
    expect(host.innerHTML).not.toBe('');
  });

  it('commits a build that already fired an update callback', async () => {
    const data = makeData({ n: 1 });
    let bump = () => {};
    let builds = 0;
    let updates = 0;
    let armed = false;

    const Child = mount(() => () => {
      if (armed) {
        armed = false;
        data.write({ n: 2 });
      }
      return <i>{data.read().n}</i>;
    });

    // `dep` moves on every render, so the effect fires on the very first build.
    // `useUpdated` runs it during the build, so discarding cannot take it back.
    const Parent = mount((renew: () => void) => {
      bump = renew;
      let dep = 0;

      updateCallback(
        () => {
          updates++;
        },
        () => [dep]
      );

      return () => {
        builds++;
        dep += 1;
        return (
          <div>
            <b>{data.read().n}</b>
            <Child />
          </div>
        );
      };
    });

    const host = document.createElement('div');
    render(<Parent />, host);

    builds = 0;
    updates = 0;
    armed = true;
    bump();
    await nextTick();

    expect(builds, 'no discard once an effect has run').toBe(1);
    expect(updates, 'and therefore no double run').toBe(1);
    // The cost of that rule, stated plainly: this build stays torn.
    expect(host.innerHTML).toBe('<div><b>1</b><i>2</i></div>');
  });

  it('restores hook slots so a discarded build keeps its update callback', async () => {
    const data = makeData({ n: 1 });
    let bump = () => {};
    let builds = 0;
    let updates = 0;
    let armed = false;

    const Child = mount(() => () => {
      if (armed) {
        armed = false;
        data.write({ n: 2 });
      }
      return <i>{data.read().n}</i>;
    });

    // Deps track the store, so the FIRST build sees them unchanged and fires
    // nothing — the build is discardable. The rebuild then sees [2] against the
    // restored [1] and fires exactly once. Without the restore the comparison
    // would read a shifted slot and this count comes out wrong.
    const Parent = mount((renew: () => void) => {
      bump = renew;

      updateCallback(
        () => {
          updates++;
        },
        () => [data.read().n]
      );

      return () => {
        builds++;
        return (
          <div>
            <b>{data.read().n}</b>
            <Child />
          </div>
        );
      };
    });

    const host = document.createElement('div');
    render(<Parent />, host);

    builds = 0;
    updates = 0;
    armed = true;
    bump();
    await nextTick();

    expect(builds, 'discarded and rebuilt').toBe(2);
    expect(updates, 'exactly one effect for one commit').toBe(1);
    expect(host.innerHTML).toBe('<div><b>2</b><i>2</i></div>');
  });

  it('counts every accepted write', () => {
    const data = makeData({ n: 1 });
    const before = storeVersion();

    data.write({ n: 2 });
    data.write({ n: 3 });

    expect(storeVersion() - before).toBe(2);
  });
});
