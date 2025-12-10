import { describe, it, expect } from 'vitest';
import { h, render, mount } from '@/index';

describe('core: functional component returning VDom', () => {
  it('re-renders when props change even without mount wrapper', async () => {
    const testWrap = document.createElement('div');

    const Follower = ({ pos }: { pos: { x: number; y: number } }) => (
      <div class="follower" style={{ left: `${pos.x}px`, top: `${pos.y}px` }}>
        cat
      </div>
    );

    const Tracker = mount((renew, props: { pos: { x: number; y: number } }) => {
      let pos = props.pos;

      return () => (
        <div>
          <Follower pos={pos} />
          <button
            onClick={() => {
              pos = { x: pos.x + 10, y: pos.y + 5 };
              renew();
            }}
          >
            move
          </button>
        </div>
      );
    });

    const destroy = render(<Tracker pos={{ x: 0, y: 0 }} />, testWrap);

    const follower = testWrap.querySelector('.follower') as HTMLDivElement;
    expect(follower.style.left).toBe('0px');
    expect(follower.textContent).toContain('cat');

    const button = testWrap.querySelector('button') as HTMLButtonElement;
    button.click();
    await Promise.resolve(); // flush microtask queue from redraw

    expect(follower.style.left).toBe('10px');
    expect(follower.style.top).toBe('5px');

    destroy();
  });
});
