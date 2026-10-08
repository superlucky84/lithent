import { describe, expect, it } from 'vitest';
import { h, mount, nextTick, notifyStoreWrite, render } from '@/index';
import { commitEffects, startWork } from '@/diff';
import type { Effects } from '@/diff';
import { wDomUpdate } from '@/render';
import type { WDom } from '@/types';

describe('portal events at concurrent commit', () => {
  it('publishes a host handler once when a store write retries portal creation', async () => {
    const target = document.createElement('div');
    let calls = 0;
    let renders = 0;
    let show = false;
    let armed = false;
    let renew = () => {};
    const Observer = mount(() => () => {
      if (armed) {
        armed = false;
        notifyStoreWrite();
      }
      return h('i', {}, 'observer');
    });
    const App = mount(bump => {
      renew = bump;
      return () => {
        renders++;
        return h(
          'section',
          {},
          show
            ? h(
                'portal',
                {
                  portal: target,
                  onClick: () => calls++,
                },
                h('b', {}, 'ported')
              )
            : null,
          h(Observer, {})
        );
      };
    });
    const host = document.createElement('div');
    const destroy = render(h(App, {}), host);
    renders = 0;
    show = true;
    armed = true;
    renew();
    await nextTick();
    expect(renders).toBe(2);
    expect(target.childNodes.length).toBe(1);
    target.click();
    expect(calls).toBe(1);
    destroy();
    target.click();
    expect(calls).toBe(1);
  });

  it.each(['portal root', 'nested portal'] as const)(
    'does not publish a fresh host handler from an abandoned build: %s',
    shape => {
      const target = document.createElement('div');
      let abandonedCalls = 0;
      let committedCalls = 0;
      const make = (handler: () => void): WDom => {
        const portal = h(
          'portal',
          { portal: target, onClick: handler },
          h('b', {}, 'ported')
        );
        return shape === 'portal root' ? portal : h('section', {}, portal);
      };
      const discardedEffects: Effects = [];
      startWork(
        make(() => abandonedCalls++),
        undefined,
        discardedEffects
      ).advance();
      expect(target.childNodes.length).toBe(0);
      target.click();
      expect(abandonedCalls).toBe(0);

      const effects: Effects = [];
      const tree = startWork(
        make(() => committedCalls++),
        undefined,
        effects
      ).advance()!;
      const host = document.createElement('div');
      tree.isRoot = true;
      tree.we = host;
      commitEffects(effects);
      wDomUpdate(tree);
      expect(target.textContent).toBe('ported');
      expect(target.childNodes.length).toBe(1);
      target.click();
      expect([abandonedCalls, committedCalls]).toEqual([0, 1]);
    }
  );

  it('keeps a mounted host handler until a paused removal commits', () => {
    const target = document.createElement('div');
    let calls = 0;
    const original = h(
      'section',
      {},
      h(
        'portal',
        {
          portal: target,
          onClick: () => calls++,
        },
        h('b', {}, 'ported')
      )
    );
    const host = document.createElement('div');
    const destroy = render(original, host);
    const effects: Effects = [];
    const work = startWork(h('section', {}, null), original, effects);
    expect(work.advance(() => true)).toBeNull();
    target.click();
    expect(calls).toBe(1);
    const tree = work.advance()!;
    target.click();
    expect(calls).toBe(2);
    commitEffects(effects);
    wDomUpdate(tree);
    target.click();
    expect(calls).toBe(2);
    destroy();
  });
});
