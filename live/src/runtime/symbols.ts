import {
  mount,
  lmount,
  h,
  Fragment,
  ref,
  mountCallback,
  updateCallback,
  nextTick,
} from 'lithent';
import { state, lstate, computed, effect, store, lstore } from 'lithent/helper';
import { fTags, fFragment, fMount, flMount } from 'lithent/ftags';
import { lTag } from 'lithent/tag';
import { agentAction, agentState } from 'lithent/agent';
import { symbolNames } from '@/names';

/**
 * DC-6 — the values behind `symbolNames`: what generated code can use without
 * `import` (docs/agent-ui/DESIGN.md §3.2).
 */
const table = {
  mount,
  lmount,
  h,
  Fragment,
  ref,
  mountCallback,
  updateCallback,
  nextTick,
  state,
  lstate,
  computed,
  effect,
  store,
  lstore,
  fTags,
  fFragment,
  fMount,
  flMount,
  lTag,
  agentAction,
  agentState,
};

export { symbolNames };
export const symbolValues = symbolNames.map(name => table[name]);
