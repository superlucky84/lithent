import { describe, expect, it, vi } from 'vitest';
import {
  getComponentKey,
  getComponentSubInfo,
  h,
  mount,
  nextTick,
  render,
  replaceWDom,
  updateCallback,
} from '@/index';
import { cloneWDom } from '@/wDom';
import { childOrderRef } from '@/utils/childOrder';
import type { ChildOrderFrame } from '@/utils/childOrder';
import type { WDom, CompKey } from '@/types';

describe('DC-25 sparse list proof lifetime', () => {
  it('consumes once before callbacks and invalidates the node-free frame on exit', async () => {
    let refresh = () => {};
    let key: CompKey | null = null;
    let observed: ChildOrderFrame | undefined;
    const phases: boolean[] = [];
    const App = mount(renew => {
      refresh = renew;
      key = getComponentKey();
      updateCallback(() => {
        observed = childOrderRef.value;
        phases.push(observed!.ready);
        return () => {
          const loop = getComponentSubInfo(key!, 'vd')!.value!.children![0]
            .children![0];
          expect(loop.type).toBe('l');
          expect(loop.so).toBeUndefined();
          expect(loop.sc).toBeUndefined();
          phases.push(childOrderRef.value!.ready);
        };
      });
      return () => (
        <section>
          {[0, 1].map(key => (
            <b key={key}>{key}</b>
          ))}
        </section>
      );
    });
    const host = document.createElement('div');
    const dispose = render(<App />, host);
    try {
      refresh();
      await nextTick();
      expect(phases).toEqual([false, true]);
      expect(childOrderRef.value).toBeUndefined();
      expect(observed!.invalid).toBe(true);
      expect(Object.keys(observed!).sort()).toEqual(['invalid', 'ready']);
    } finally {
      dispose();
    }
  });

  it('invalidates an unvisited descendant proof after a later diff throws and never clones it', () => {
    let fail = false;
    let key: CompKey | null = null;
    let staged: WDom | undefined;
    let captured: ChildOrderFrame | undefined;
    const Complete = mount(() => {
      key = getComponentKey();
      return () => (
        <div>
          {[0, 1].map(key => (
            <b key={key}>{key}</b>
          ))}
        </div>
      );
    });
    const Fail = mount(() => () => {
      if (fail) {
        staged = getComponentSubInfo(key!, 'vd')!.value!.children![0]
          .children![0];
        captured = childOrderRef.value;
        expect(staged.so).toBe(captured);
        expect(staged.sc).toBe(staged.children);
        expect(captured!.ready).toBe(false);
        throw Error('after staged list');
      }
      return <i>safe</i>;
    });
    const App = mount(() => () => (
      <section>
        <Complete />
        <Fail />
      </section>
    ));
    const host = document.createElement('div');
    const tree = <App />;
    const dispose = render(tree, host);
    try {
      fail = true;
      expect(() =>
        replaceWDom(App, tree.compProps!, tree.compChild!, tree)
      ).toThrow('after staged list');
      expect(childOrderRef.value).toBeUndefined();
      expect(captured!.invalid).toBe(true);
      const copy = cloneWDom(staged!) as WDom;
      expect(copy.so).toBeUndefined();
      expect(copy.sc).toBeUndefined();
    } finally {
      dispose();
    }
  });

  it('invalidates unvisited proofs when a parent DOM setter throws', () => {
    let version = 0;
    let captured: ChildOrderFrame | undefined;
    const App = mount(() => () => (
      <section class={String(version)}>
        {[0, 1].map(key => (
          <b key={key}>{key}</b>
        ))}
      </section>
    ));
    const host = document.createElement('div');
    const tree = <App />;
    const dispose = render(tree, host);
    const setter = vi
      .spyOn(host.querySelector('section')!, 'setAttribute')
      .mockImplementationOnce(() => {
        captured = childOrderRef.value;
        throw Error('DOM setter');
      });
    try {
      version++;
      expect(() =>
        replaceWDom(App, tree.compProps!, tree.compChild!, tree)
      ).toThrow('DOM setter');
      expect(childOrderRef.value).toBeUndefined();
      expect(captured!.invalid).toBe(true);
    } finally {
      setter.mockRestore();
      dispose();
    }
  });

  it('invalidates the outer frame before resuming after synchronous reentry', async () => {
    let refresh = () => {};
    let nested = false;
    let version = 0;
    let captured: ChildOrderFrame | undefined;
    const Nested = mount(() => () => <i>{version}</i>);
    const other = document.createElement('div');
    let nestedTree = <Nested />;
    const disposeOther = render(nestedTree, other);
    const Trigger = mount(() => {
      updateCallback(() => () => {
        if (!nested) return;
        nested = false;
        captured = childOrderRef.value;
        version++;
        replaceWDom(
          Nested,
          nestedTree.compProps!,
          nestedTree.compChild!,
          nestedTree
        );
        nestedTree = getComponentSubInfo(nestedTree.compKey!, 'vd')!.value!;
        expect(childOrderRef.value).toBe(captured);
        expect(captured!.invalid).toBe(true);
      });
      return () => <b>trigger</b>;
    });
    const App = mount(renew => {
      refresh = renew;
      return () => (
        <section>
          <Trigger />
          {[0, 1].map(key => (
            <b key={key}>{key}</b>
          ))}
        </section>
      );
    });
    const host = document.createElement('div');
    const dispose = render(<App />, host);
    try {
      nested = true;
      refresh();
      await nextTick();
      expect(host.textContent).toBe('trigger01');
      expect(other.textContent).toBe('1');
      expect(captured!.invalid).toBe(true);
      expect(childOrderRef.value).toBeUndefined();
    } finally {
      dispose();
      disposeOther();
    }
  });
});
