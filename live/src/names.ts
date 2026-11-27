/**
 * DC-6 — the names generated code sees (docs/agent-ui/DESIGN.md §3.2). A plain
 * list, so the host can quote it in hints without importing the modules;
 * runtime/symbols.ts supplies the values in this order.
 */
export const symbolNames = [
  'mount',
  'lmount',
  'h',
  'Fragment',
  'ref',
  'mountCallback',
  'updateCallback',
  'nextTick',
  'state',
  'lstate',
  'computed',
  'effect',
  'store',
  'lstore',
  'fTags',
  'fFragment',
  'fMount',
  'flMount',
  'lTag',
  'agentAction',
  'agentState',
] as const;
