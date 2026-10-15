import { describe, it, expect } from 'vitest';
import { h, render, mount, nextTick } from '@/index';

/**
 * In a file of its own: before the fix, a render that threw stopped every
 * later renew, which would have hidden the other tests' failures.
 */
const flush = async () => {
  for (let i = 0; i < 3; i++) await nextTick();
};

describe('redraw scheduling after an error', () => {
  it('keeps redrawing after a render throws', async () => {
    let fail = false;
    let bumpA = () => {};
    let bumpB = () => {};
    let count = 0;
    const A = mount(renew => {
      bumpA = renew;
      return () => {
        if (fail) {
          fail = false;
          throw new Error('render failed');
        }
        return <i>a</i>;
      };
    });
    const B = mount(renew => {
      bumpB = () => {
        count++;
        renew();
      };
      return () => <b>{count}</b>;
    });

    const el = document.createElement('div');
    render(
      <div>
        <A />
        <B />
      </div>,
      el
    );

    const errors: unknown[] = [];
    const onError = (error: unknown) => errors.push(error);
    process.on('uncaughtException', onError);
    try {
      fail = true;
      bumpA();
      await new Promise(resolve => setTimeout(resolve));
    } finally {
      process.off('uncaughtException', onError);
    }

    bumpB();
    await flush();
    expect(el.innerHTML).toBe('<div><i>a</i><b>1</b></div>');
  });
});
