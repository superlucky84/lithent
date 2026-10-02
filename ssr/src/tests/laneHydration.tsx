import * as lithentCore from 'lithent';
import { mount, nextTick } from 'lithent';
import { renderToString } from '@/renderToString';
import { hydration } from '@/hydration';

/**
 * Phase 11-3 — the scheduler on the SSR → hydration path.
 *
 * This is the shape REQUIREMENTS §1.1 names as the product's home ground:
 * server-rendered markup with interactive pieces attached to it. Hydration
 * reuses the existing DOM instead of building it, so it reaches the core
 * through a different door than `render()` — worth checking that a deferred
 * update still behaves once a component is live that way.
 *
 * `pnpm test:dual` runs this against both cores unchanged (RC-9). Which core is
 * loaded comes from the env, not from feature detection — detection let an
 * earlier test run the base branch during the concurrent pass and pass for the
 * wrong reason.
 */

type LaneCore = {
  deferRender?: (scope: () => void) => void;
  whenIdle?: () => Promise<void>;
};

const lanes = process.env.LITHENT_CORE === 'concurrent';
const core = lithentCore as LaneCore;

const push = (scope: () => void) => {
  if (lanes && core.deferRender) {
    core.deferRender(scope);
  } else {
    scope();
  }
};

const settle = async () => {
  await nextTick();

  if (lanes && core.whenIdle) {
    await core.whenIdle();
  }
};

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe('11-3. scheduler on the hydration path', () => {
    it('a deferred update lands on a hydrated component', async () => {
      let bump = () => {};
      let label = 'server';

      const Widget = mount((renew: () => void) => {
        bump = renew;
        return () => <button>{label}</button>;
      });

      // What the server would have sent.
      const markup = renderToString(<Widget />);
      expect(markup).toContain('server');

      const host = document.createElement('div');
      host.innerHTML = markup;
      const existing = host.firstElementChild as HTMLElement;

      hydration(<Widget />, host);

      // Hydration must not rebuild the node — that is its whole point.
      expect(host.firstElementChild, 'the server node was reused').toBe(
        existing
      );

      label = 'client';
      push(() => bump());

      if (lanes) {
        await nextTick();
        expect(host.textContent, 'queued at low priority, so not yet').toBe(
          'server'
        );
      }

      await settle();

      expect(host.textContent).toBe('client');
      expect(host.firstElementChild, 'still the same node after updating').toBe(
        existing
      );
    });
  });
}
