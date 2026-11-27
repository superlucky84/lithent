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

/**
 * DC-6 — what generated code can use without `import`: the names it sees as
 * parameters of its function body (docs/agent-ui/DESIGN.md §3.2).
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

export const symbolNames = Object.keys(table);
export const symbolValues = Object.values(table);
