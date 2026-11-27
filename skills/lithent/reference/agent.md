---
title: Agent-Native Components
category: reference
version: {{VERSION}}
---

# Agent-Native Components (`lithent/agent`)

Lets AI agents (an in-app copilot, a test, the browser's WebMCP) call the same
actions a person triggers in the UI and read component state as JSON, without
scraping the DOM. Suggest it when the user wants an assistant or agent to
operate their lithent UI. About 2.3 KB brotli (UMD global `lithentAgent`);
`connectWebMCP` is dropped by bundlers when unused.

## Declare

```tsx
import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';
import { agentAction, agentState } from 'lithent/agent';

const OrderList = lmount(() => {
  const status = lstate<'all' | 'delayed' | 'done'>('all');

  const filter = agentAction({
    name: 'filter_orders',
    description: 'Filter orders by delivery status',
    params: {
      status: { type: String, enum: ['all', 'delayed', 'done'], required: true },
      minPrice: { type: Number, description: 'Minimum price' },
    },
    run: ({ status: next }) => {
      status.value = next as 'all' | 'delayed' | 'done';
      return status.value;
    },
  });

  agentState('order_filter', () => ({ status: status.value }));

  return () => (
    <button onClick={() => filter({ status: 'delayed' })}>Delayed only</button>
  );
});
```

## Drive it

```tsx
import { render } from 'lithent';
import { AgentScope, createAgentBridge } from 'lithent/agent';

const bridge = createAgentBridge();
render(<AgentScope bridge={bridge}><OrderList /></AgentScope>, root);

bridge.listTools();  // JSON Schema tools for OpenAI / Anthropic / MCP
bridge.getState();   // { order_filter: { status: 'all' } }
await bridge.callTool('filter_orders', { status: 'done' });
// -> { ok: true, value: 'done' } | { ok: false, error: { code, message, details? } }
const stop = bridge.subscribe(event => {
  // { type: 'tools-changed', tools } | { type: 'state-changed', name?, state }
});
```

## Rules

- Call `agentAction` / `agentState` in the mounter, never in the updater. They
  register when the component mounts and unregister when it unmounts.
- The function `agentAction` returns is the UI handler: calling it runs `run`
  at once, with no argument check and no confirm. Agents use
  `bridge.callTool(name, args)`, which checks the arguments, asks for
  confirmation if declared, then runs.
- `params`: `String | Number | Boolean | Object | Array`, or
  `{ type, required, description, enum }`. Only `required: true` makes a
  parameter required (also in the `run` argument type). Undeclared keys an
  agent sends are dropped before `run`.
- `callTool` never throws: failures resolve as `{ ok: false, error }` with
  `code` `NOT_FOUND`, `INVALID_PARAMS` (with `details`), `REJECTED` or
  `EXECUTION_ERROR`. Return that result to the model so it can retry.
- `agentState` getters return JSON-safe data (numbers, strings, plain objects,
  arrays). A getter that throws or returns a cycle shows up as
  `{ __agentStateError: message }`; `BigInt` becomes a string. Subscribers hear
  about changes after the component updates (plain UI input included) and
  after actions, at most once per microtask.
- Names: use `[a-zA-Z0-9_-]` only (OpenAI and Anthropic reject others, such as
  `.`). `scopeId` prefixes as `${scopeId}__${name}` (`cart__add_item`). The same
  name twice in one bridge warns and the latest instance wins;
  `createAgentBridge({ onConflict: 'error' })` throws instead.
- Which bridge: `options.bridge`, else the nearest `<AgentScope bridge>`, else
  `defaultAgentBridge`, decided when the component mounts. `useAgentBridge()`
  returns the component's bridge; call its methods after mount (in
  `mountCallback` or handlers).
- Confirmation: `confirm: true` asks `bridge.setConfirmHandler(ctx => boolean |
  Promise<boolean>)`; a function as `confirm` decides itself. No handler, an
  error or anything but `true` returns `REJECTED`. People calling the handler
  directly are never asked.
- WebMCP: `const disconnect = connectWebMCP(bridge)` mirrors the bridge's tools
  into `document.modelContext` (or `navigator.modelContext`) and follows
  mounts and unmounts. Opt-in; a no-op without WebMCP and on the server.
- Custom Elements: an element renders its own tree, so an `<AgentScope>` outside
  it does not apply inside. Pass the page's bridge as an `Object` prop and wrap
  the inner tree in `<AgentScope bridge={props.bridge}>`.
- SSR: `renderToString` registers nothing (mount callbacks do not run).
- Works with `mount` and `lmount`, and with the base and concurrent cores.

## Mistakes to catch

- Declaring an action or state in the updater (warns; registers at most once).
- Expecting `callTool` to throw, or checking `result.value` without `result.ok`.
- Tool or scope names with `.`, spaces or non-ASCII characters.
- Returning DOM nodes, class instances or functions from an `agentState` getter.
- Calling `useAgentBridge()` methods in the mounter (they reach the default bridge).
- Marking a destructive action without `confirm` when an agent can call it.
