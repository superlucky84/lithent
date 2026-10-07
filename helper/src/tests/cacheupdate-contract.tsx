import { h, mount, nextTick, render } from 'lithent';
import { cacheUpdate } from '@/index';

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe('cacheUpdate dependency contract', () => {
    it.each([
      { before: [1], after: [1, 2] },
      { before: [1, undefined], after: [1] },
      { before: [], after: [undefined] },
    ])(
      'invalidates when dependency count changes: $before -> $after',
      ({ before, after }) => {
        let dependencies: unknown[] = before;
        let runs = 0;
        const updater = cacheUpdate(
          () => dependencies,
          () => <span>{String(++runs)}</span>
        );

        const first = updater({});
        expect(updater({})).toBe(first);

        dependencies = after;
        const second = updater({});
        expect(second).not.toBe(first);
        expect(runs).toBe(2);
        expect(updater({})).toBe(second);
      }
    );

    it('commits changed dependency counts and keeps unchanged output cached', async () => {
      let dependencies: unknown[] = [1];
      let bump = () => {};
      let runs = 0;
      const App = mount(renew => {
        bump = renew;
        return cacheUpdate(
          () => dependencies,
          () => <span>{`${dependencies.length}:${++runs}`}</span>
        );
      });
      const host = document.createElement('div');
      const destroy = render(<App />, host);

      expect(host.textContent).toBe('1:1');
      dependencies = [1, undefined];
      bump();
      await nextTick();
      expect(host.textContent).toBe('2:2');

      bump();
      await nextTick();
      expect(host.textContent).toBe('2:2');

      dependencies = [1];
      bump();
      await nextTick();
      expect(host.textContent).toBe('1:3');
      destroy();
    });
  });
}
