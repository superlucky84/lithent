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
import { childOrderRef } from '@/utils/childOrder';
import type { WDom, CompKey } from '@/types';

describe('C2 scoped proof lifetime', () => {
  it('stages before render, consumes before post callbacks, and releases the root frame', async () => {
    let refresh = () => {};
    let key: CompKey | null = null;
    const seen: boolean[] = [];
    const Parent = mount(renew => {
      key = getComponentKey();
      refresh = renew;
      updateCallback(() => {
        seen.push(childOrderRef.value!.ready);
        return () => {
          const frame = childOrderRef.value!;
          const node = getComponentSubInfo(key!, 'vd')!.value!;
          const loop = node.children![0].children![0];
          expect(loop.type).toBe('l');
          seen.push(frame.ready, frame.proofs.has(loop));
        };
      });
      return () => (
        <section>
          {[0, 1].map(id => (
            <b key={id}>{id}</b>
          ))}
        </section>
      );
    });
    const host = document.createElement('div');
    const dispose = render(<Parent />, host);
    refresh();
    await nextTick();
    expect(seen).toEqual([false, true, false]);
    expect(childOrderRef.value).toBeUndefined();
    expect(host.textContent).toBe('01');
    dispose();
    expect(childOrderRef.value).toBeUndefined();
  });

  it('drops already staged descendant proofs when a later updater throws', () => {
    let fail = false;
    let completedKey: CompKey | null = null;
    let staged = false;
    const Complete = mount(() => {
      completedKey = getComponentKey();
      return () => (
        <div>
          {[0, 1].map(id => (
            <b key={id}>{id}</b>
          ))}
        </div>
      );
    });
    const Fail = mount(() => () => {
      if (fail) {
        const frame = childOrderRef.value!;
        const completed = getComponentSubInfo(completedKey!, 'vd')!.value!;
        const loop = completed.children![0].children![0];
        expect(loop.type).toBe('l');
        staged = !frame.ready && frame.proofs.has(loop);
        throw Error('after a completed keyed diff');
      }
      return <i>safe</i>;
    });
    const Parent = mount(() => () => (
      <section>
        <Complete />
        <Fail />
      </section>
    ));
    const host = document.createElement('div');
    const tree = <Parent />;
    const dispose = render(tree, host);
    fail = true;
    expect(() =>
      replaceWDom(Parent, tree.compProps!, tree.compChild!, tree)
    ).toThrow('after a completed keyed diff');
    expect(staged).toBe(true);
    expect(childOrderRef.value).toBeUndefined();
    dispose();
  });

  it('releases unconsumed proofs when a DOM operation throws', () => {
    let version = 0;
    const Parent = mount(() => () => (
      <section class={String(version)}>
        {[0, 1].map(id => (
          <b key={id}>{id}</b>
        ))}
      </section>
    ));
    const host = document.createElement('div');
    const tree = <Parent />;
    const dispose = render(tree, host);
    const setter = vi
      .spyOn(host.querySelector('section')!, 'setAttribute')
      .mockImplementationOnce(() => {
        throw Error('DOM write failed');
      });
    try {
      version++;
      expect(() =>
        replaceWDom(Parent, tree.compProps!, tree.compChild!, tree)
      ).toThrow('DOM write failed');
      expect(childOrderRef.value).toBeUndefined();
    } finally {
      setter.mockRestore();
      dispose();
    }
  });

  it('invalidates the outer frame on synchronous reentry and restores its scope', async () => {
    let refresh = () => {};
    let version = 0;
    let reenter = false;
    let outerInvalid = false;
    const Nested = mount(() => () => <i>{version}</i>);
    const nestedHost = document.createElement('div');
    let nestedTree: WDom = <Nested />;
    const nestedDispose = render(nestedTree, nestedHost);
    const Trigger = mount(() => {
      updateCallback(() => () => {
        if (!reenter) return;
        reenter = false;
        const frame = childOrderRef.value!;
        version++;
        replaceWDom(
          Nested,
          nestedTree.compProps!,
          nestedTree.compChild!,
          nestedTree
        );
        nestedTree = getComponentSubInfo(nestedTree.compKey!, 'vd')!.value!;
        outerInvalid = childOrderRef.value === frame && frame.invalid;
      });
      return () => <b>trigger</b>;
    });
    const Parent = mount(renew => {
      refresh = renew;
      return () => (
        <section>
          <Trigger />
          {[0, 1].map(id => (
            <b key={id}>{id}</b>
          ))}
        </section>
      );
    });
    const host = document.createElement('div');
    const dispose = render(<Parent />, host);
    reenter = true;
    refresh();
    await nextTick();
    expect(outerInvalid).toBe(true);
    expect(nestedHost.textContent).toBe('1');
    expect(host.textContent).toBe('trigger01');
    expect(childOrderRef.value).toBeUndefined();
    dispose();
    nestedDispose();
  });
});
