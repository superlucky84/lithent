import { describe, it, expect } from 'vitest';
import {
  h,
  render,
  mount,
  getComponentKey,
  componentMap,
  replaceWDom,
} from '@/index';
import type { CompKey } from '@/index';

describe('core: functional component returning VDom', () => {
  it('restores the active component context after a failed replacement', () => {
    const Healthy = () => <span>healthy</span>;
    const Broken = () => {
      throw new Error('broken component');
    };
    const container = document.createElement('div');
    const original = <Healthy />;
    const dispose = render(original, container);
    const previousKey = getComponentKey();
    expect(() => replaceWDom(Broken, {}, [], original)).toThrow(
      'broken component'
    );
    expect(getComponentKey()).toBe(previousKey);
    const second = document.createElement('div');
    const disposeSecond = render(<Healthy />, second);
    expect(second.textContent).toBe('healthy');
    disposeSecond();
    dispose();
  });
  it('evaluates each nested stateless component once with its own key', () => {
    const calls: string[] = [];
    const keys: CompKey[] = [];
    const Badge = () => {
      calls.push('Badge');
      keys.push(getComponentKey()!);
      return <span>badge</span>;
    };
    const Card = () => {
      calls.push('Card');
      keys.push(getComponentKey()!);
      const output = (
        <div>
          <Badge />
        </div>
      );
      expect(getComponentKey()).toBe(keys[0]);
      return output;
    };
    const root = document.createElement('div');
    const destroy = render(<Card />, root);
    expect(root.textContent).toBe('badge');
    expect(calls).toEqual(['Card', 'Badge']);
    expect(keys[0]).not.toBe(keys[1]);
    expect(componentMap.get(keys[0])?.ctor).toBe(Card);
    expect(componentMap.get(keys[1])?.ctor).toBe(Badge);
    destroy();
  });
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
