import { describe, expect, it } from 'vitest';
import { h, mount, mountCallback, nextTick, render } from '@/index';

describe('keyed row consumption', () => {
  it('reuses each previous row once and disposes unmatched duplicates', async () => {
    const objectKey = {};
    const symbolKey = Symbol('row');
    type Item = { key: unknown; label: string };
    let items: (Item | null)[] = [
      { key: 'shared', label: 'first' },
      { key: 'shared', label: 'second' },
      { key: 0, label: 'zero' },
      { key: false, label: 'false' },
      { key: '', label: 'empty' },
      { key: symbolKey, label: 'symbol' },
      { key: objectKey, label: 'object' },
      { key: NaN, label: 'nan' },
    ];
    let refresh = () => {};
    let instances = 0;
    const unmounted: number[] = [];
    const Row = mount<Item>((renew, props) => {
      const instance = ++instances;
      let count = 0;
      mountCallback(() => () => {
        unmounted.push(instance);
      });
      return () => (
        <button
          data-instance={instance}
          onClick={() => {
            count++;
            renew();
          }}
        >
          {`${props.label}:${count}`}
        </button>
      );
    });
    const App = mount(renew => {
      refresh = renew;
      return () => (
        <div>
          {items.map(item =>
            item ? <Row key={item.key} label={item.label} /> : null
          )}
        </div>
      );
    });
    const host = document.createElement('div');
    const dispose = render(<App />, host);
    const original = [...host.querySelectorAll('button')];
    original[0].click();
    await nextTick();

    items = [
      { key: 0, label: 'zero-next' },
      { key: 'shared', label: 'first-next' },
      { key: '', label: 'empty-next' },
      null,
      { key: 'shared', label: 'second-next' },
      { key: NaN, label: 'nan-next' },
      { key: false, label: 'false-next' },
      { key: objectKey, label: 'object-next' },
      { key: symbolKey, label: 'symbol-next' },
    ];
    refresh();
    await nextTick();
    const current = [...host.querySelectorAll('button')];
    expect(current.map(node => node.textContent)).toEqual([
      'zero-next:0',
      'first-next:1',
      'empty-next:0',
      'second-next:0',
      'nan-next:0',
      'false-next:0',
      'object-next:0',
      'symbol-next:0',
    ]);
    for (const [next, previous] of [
      [0, 2],
      [1, 0],
      [2, 4],
      [4, 7],
      [5, 3],
      [6, 6],
      [7, 5],
    ])
      expect(current[next]).toBe(original[previous]);
    expect(original).not.toContain(current[3]);
    expect(unmounted).toEqual([2]);
    expect(instances).toBe(9);

    current[1].click();
    await nextTick();
    expect(current[1].textContent).toBe('first-next:2');
    expect(current[3].textContent).toBe('second-next:0');
    dispose();
    expect(unmounted.sort((a, b) => a - b)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
  });
});
