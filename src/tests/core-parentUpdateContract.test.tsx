import { describe, expect, it } from 'vitest';
import * as core from '@/index';
import {
  h,
  mount,
  mountCallback,
  nextTick,
  render,
  updateCallback,
} from '@/index';
import type { Renew } from '@/types';

const isConcurrent = 'deferRender' in core;

// Baseline observations for C3. No parent-memo API is enabled in this suite.
// Candidate hit/miss expectations live in DESIGN's C3 batching table.
const pair = () => {
  const trace: string[] = [];
  const seen: string[] = [];
  let parentRenew: Renew = () => false;
  let childRenew: Renew = () => false;
  let label = 'before';
  let local = 0;
  let show = true;
  let requeue = false;

  const Child = mount<{ label: string }>((renew, props) => {
    childRenew = renew;
    mountCallback(() => () => trace.push('child:unmount'));
    updateCallback(() => {
      trace.push('child:pre');
      return () => {
        trace.push('child:post');
        if (requeue) {
          requeue = false;
          local++;
          renew();
        }
      };
    });
    return () => {
      trace.push('child:render');
      seen.push(`${props.label}:${local}`);
      return <input value={`${props.label}:${local}`} />;
    };
  });
  const Parent = mount(renew => {
    parentRenew = renew;
    updateCallback(() => {
      trace.push('parent:pre');
      return () => trace.push('parent:post');
    });
    return () => {
      trace.push('parent:render');
      return <section>{show ? <Child label={label} /> : null}</section>;
    };
  });
  const host = document.createElement('div');
  const dispose = render(<Parent />, host);
  const input = host.querySelector('input') as HTMLInputElement;
  trace.length = 0;
  seen.length = 0;

  return {
    host,
    input,
    trace,
    seen,
    dispose,
    parent: () => parentRenew(),
    child: () => childRenew(),
    edit: () => local++,
    relabel: () => (label = 'after'),
    remove: () => (show = false),
    requeueFromPost: () => (requeue = true),
  };
};

const parentPass = [
  'parent:pre',
  'parent:render',
  'child:pre',
  'child:render',
  'child:post',
  'parent:post',
];
const childPass = ['child:pre', 'child:render', 'child:post'];

describe('parent update baseline contract for C3', () => {
  it('runs both callback stages and the child updater on an unchanged parent refresh', async () => {
    const p = pair();
    p.parent();
    await nextTick();

    expect(p.trace).toEqual(parentPass);
    expect(p.seen).toEqual(['before:0']);
    expect(p.host.querySelector('input')).toBe(p.input);
    expect(p.input.value).toBe('before:0');
    p.dispose();
  });

  it.each([
    { order: 'parent-child', changedProps: false },
    { order: 'parent-child', changedProps: true },
    { order: 'child-parent', changedProps: false },
    { order: 'child-parent', changedProps: true },
  ])(
    'preserves callback order for $order, changed props: $changedProps',
    async ({ order, changedProps }) => {
      const p = pair();
      p.edit();
      if (changedProps) p.relabel();
      if (order === 'parent-child') {
        p.parent();
        p.child();
      } else {
        p.child();
        p.parent();
      }
      await nextTick();

      const label = changedProps ? 'after' : 'before';
      if (order === 'parent-child') {
        expect(p.trace).toEqual([
          ...parentPass,
          ...(isConcurrent ? childPass : []),
        ]);
        expect(p.seen).toEqual(
          isConcurrent ? [`${label}:1`, `${label}:1`] : [`${label}:1`]
        );
      } else {
        expect(p.trace).toEqual([...childPass, ...parentPass]);
        expect(p.seen).toEqual(['before:1', `${label}:1`]);
      }
      expect(p.host.querySelector('input')).toBe(p.input);
      expect(p.input.value).toBe(`${label}:1`);

      // A later independent self request still reaches the current wrapper.
      p.edit();
      p.child();
      await nextTick();
      expect(p.input.value).toBe(`${label}:2`);
      expect(p.trace.slice(-3)).toEqual(childPass);
      p.dispose();
    }
  );

  it('coalesces repeated self requests and stops accepting them after dispose', async () => {
    const p = pair();
    p.edit();
    expect([p.child(), p.child(), p.child()]).toEqual([true, true, true]);
    await nextTick();

    expect(p.trace).toEqual(childPass);
    expect(p.seen).toEqual(['before:1']);
    p.dispose();
    expect(p.child()).toBe(false);
    await nextTick();
    expect(p.trace).toEqual([...childPass, 'child:unmount']);
    expect(p.host.innerHTML).toBe('');
  });

  it('drains a self request raised by the post callback in the same flush', async () => {
    const p = pair();
    p.edit();
    p.requeueFromPost();
    p.child();
    await nextTick();

    expect(p.trace).toEqual([...childPass, ...childPass]);
    expect(p.seen).toEqual(['before:1', 'before:2']);
    expect(p.input.value).toBe('before:2');
    p.dispose();
  });

  it.each(['parent-child', 'child-parent'])(
    'does not resurrect a child removed in the same task: %s',
    async order => {
      const p = pair();
      p.remove();
      p.edit();
      if (order === 'parent-child') {
        p.parent();
        p.child();
      } else {
        p.child();
        p.parent();
      }
      await nextTick();

      const removal = [
        'parent:pre',
        'parent:render',
        'child:unmount',
        'parent:post',
      ];
      expect(p.trace).toEqual([
        ...(order === 'child-parent' ? childPass : []),
        ...removal,
      ]);
      expect(p.seen).toEqual(order === 'child-parent' ? ['before:1'] : []);
      expect(p.host.querySelector('input')).toBeNull();
      expect(p.child()).toBe(false);
      p.dispose();
      expect(p.trace.filter(event => event === 'child:unmount')).toHaveLength(
        1
      );
    }
  );

  it('keeps self output and DOM identity through a later parent refresh', async () => {
    const p = pair();
    p.edit();
    p.child();
    await nextTick();
    p.parent();
    await nextTick();

    expect(p.trace).toEqual([...childPass, ...parentPass]);
    expect(p.seen).toEqual(['before:1', 'before:1']);
    expect(p.host.querySelector('input')).toBe(p.input);
    expect(p.input.value).toBe('before:1');
    p.dispose();
  });
});
