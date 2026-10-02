/**
 * Phase 0-4 — the alias table itself.
 *
 * `concurrentAlias()` is what makes 15% of the core branch while the other 85%
 * stays shared. Two properties have to hold and neither is visible from a
 * passing render:
 *   1. every branched specifier resolves to `lithentConcurrent/src/`
 *   2. the catch-all `@/` rule comes LAST — ahead of the branched entries it
 *      swallows them and the "concurrent" build is silently the base core
 *
 * The module-identity assertions below prove (1) end-to-end through the real
 * resolver rather than by inspecting the table, so they keep holding after the
 * fork diverges from the base core in later phases.
 */
import { describe, it, expect } from 'vitest';
import { concurrentAlias, forkModules } from '../../alias.js';
import { loadFromBaseCore } from './baseCore';

import { makeNewWDomTree as diffViaAlias } from '@/diff';
import { makeNewWDomTree as diffViaRelative } from '../diff';

import { wDomUpdate as renderViaAlias } from '@/render';
import { wDomUpdate as renderViaRelative } from '../render';

import { Fragment as wDomViaAlias } from '@/wDom';
import { Fragment as wDomViaRelative } from '../wDom';

import { componentUpdate as schedulerViaAlias } from '@/scheduler';
import { componentUpdate as schedulerViaRelative } from '../scheduler';

describe('concurrent alias table', () => {
  const table = concurrentAlias('/repo/lithentConcurrent');

  it('puts the catch-all rule last', () => {
    const catchAll = table.findIndex(
      entry => String(entry.find) === String(/^@\//)
    );
    expect(catchAll).toBe(table.length - 1);
  });

  it('branches every module listed in forkModules', () => {
    const branched = table.slice(0, -1);
    expect(branched).toHaveLength(Object.keys(forkModules).length);
    for (const entry of branched) {
      expect(entry.replacement).toContain('/lithentConcurrent/src/');
    }
  });

  it('sends the shared modules to the frozen base core', () => {
    expect(table.at(-1)?.replacement).toBe('/repo/src/');
  });

  it.each([
    ['@/diff', 'diff', 'makeNewWDomTree', diffViaAlias, diffViaRelative],
    ['@/render', 'render', 'wDomUpdate', renderViaAlias, renderViaRelative],
  ])(
    '%s resolves to the fork, not the base core',
    async (_name, modulePath, exportName, viaAlias, viaRelative) => {
      const inBase = (await loadFromBaseCore(modulePath as string))[
        exportName as string
      ];

      expect(viaAlias).toBe(viaRelative);
      expect(viaAlias).not.toBe(inBase);
    }
  );

  it('@/wDom and @/scheduler resolve to the fork', () => {
    // Base-core counterparts are covered by the dedicated trap guards in
    // concurrent-aliasFragment / concurrent-aliasScheduler, which assert the
    // `!==` direction without importing the base core twice here.
    expect(wDomViaAlias).toBe(wDomViaRelative);
    expect(schedulerViaAlias).toBe(schedulerViaRelative);
  });
});
