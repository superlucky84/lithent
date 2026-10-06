import { describe, it, expect } from 'vitest';
import * as core from 'lithent';
import { defineElement } from '@/index';

/**
 * RC-2: under `LITHENT_CORE=concurrent` the bare `lithent` specifier must
 * resolve to the concurrent bundle, or the dual-core run silently tests the
 * base core twice. `deferRender` exists only in the concurrent core.
 */
const concurrent = process.env.LITHENT_CORE === 'concurrent';

describe('lithent/element scaffold', () => {
  it('exports defineElement', () => {
    expect(typeof defineElement).toBe('function');
  });

  it(`resolves the ${concurrent ? 'concurrent' : 'base'} core`, () => {
    expect(typeof core.mount).toBe('function');
    expect('deferRender' in core).toBe(concurrent);
  });
});
