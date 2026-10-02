/**
 * Phase 0-5 — alias trap guard (1): Fragment identity.
 *
 * `src/utils/predicator.ts` is SHARED with the base core, and its
 * `checkFragmentFunction` is a raw `target === Fragment` identity comparison
 * against the `Fragment` it imported from `@/wDom`. In the concurrent build
 * `@/wDom` must resolve to the FORK (`lithentConcurrent/src/wDom.ts`).
 *
 * If that alias is dropped or ordered after the catch-all `@/` rule, the
 * predicator compares against the base core's `Fragment` while the entry hands
 * out the fork's — every fragment is then misclassified as a custom component
 * and the failure surfaces far from its cause.
 *
 * Keep this file permanently as a regression guard.
 */
import { h, Fragment, render } from '../index';
import { checkFragmentFunction } from '@/utils/predicator';
import { loadFromBaseCore } from './baseCore';

const testWrap = document.createElement('div');

const FragmentRoot = () => (
  <>
    <span>a</span>
    <span>b</span>
  </>
);

render(<FragmentRoot />, testWrap);

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe('alias trap: Fragment identity', () => {
    it('the shared predicator recognizes the concurrent entry Fragment', () => {
      expect(checkFragmentFunction(Fragment)).toBe(true);
    });

    it('is not a vacuous check', () => {
      expect(checkFragmentFunction(() => {})).toBe(false);
      expect(checkFragmentFunction('Fragment')).toBe(false);
    });

    it('resolves to the fork, not the frozen base core', async () => {
      const { Fragment: baseFragment } = await loadFromBaseCore('wDom');

      expect(Fragment).not.toBe(baseFragment);
      expect(checkFragmentFunction(baseFragment)).toBe(false);
    });

    it('renders a fragment root without a wrapper element', () => {
      expect(testWrap.innerHTML).toBe('<span>a</span><span>b</span>');
    });
  });
}
