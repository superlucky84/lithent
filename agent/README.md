# lithent/agent

Let AI agents operate a lithent UI the way people do. A component declares its
actions and state once; a person triggers the actions from the UI, and an
agent (an in-app copilot, a test, the browser's WebMCP) calls the same actions
and reads the same closure state through a bridge, with no DOM scraping.
Ships inside the `lithent` package; about 2.3 KB brotli on top of the core.

**Design and test records:** [docs/agent-ui](../docs/agent-ui/)

```tsx
import { lmount, render } from 'lithent';
import { lstate } from 'lithent/helper';
import {
  agentAction,
  agentState,
  AgentScope,
  createAgentBridge,
} from 'lithent/agent';

const OrderList = lmount(() => {
  const status = lstate<'all' | 'delayed' | 'done'>('all');

  const filter = agentAction({
    name: 'filter_orders',
    description: 'Filter orders by delivery status',
    params: {
      status: { type: String, enum: ['all', 'delayed', 'done'], required: true },
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

const bridge = createAgentBridge();
render(
  <AgentScope bridge={bridge}>
    <OrderList />
  </AgentScope>,
  document.getElementById('root')!
);

bridge.listTools(); // [{ name: 'filter_orders', description, inputSchema }]
await bridge.callTool('filter_orders', { status: 'done' }); // { ok: true, value: 'done' }
bridge.getState(); // { order_filter: { status: 'done' } }
```

## At a glance

|              |                                                                                                                              |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Actions      | `agentAction({ name, description, params?, confirm?, run })` in the mounter; the returned function is the UI handler          |
| State        | `agentState(name, getter)`: JSON snapshots, change events after updates and actions                                           |
| Bridge       | `listTools()` (JSON Schema), `getState()`, `callTool(name, args)`, `subscribe(listener)`, `setConfirmHandler`, `dispose`      |
| Checks       | `callTool` checks required / type / enum, drops undeclared keys, never throws: `{ ok: false, error: { code, message } }`     |
| Scopes       | `<AgentScope bridge>` per subtree, `options.bridge`, `useAgentBridge()`; `scopeId` names as `scope__name`                    |
| Confirmation | `confirm: true` + `bridge.setConfirmHandler(ctx => boolean \| Promise<boolean>)`, only for agent calls                         |
| WebMCP       | `connectWebMCP(bridge)`: opt-in, `document.modelContext` (or `navigator.modelContext`), no-op elsewhere                      |
| Lifecycle    | Registers on mount, unregisters on unmount; `mount` and `lmount`; base and `lithent-concurrent`; nothing registers during SSR |

## Names

Vendor tool APIs accept `[a-zA-Z0-9_-]` only (OpenAI and Anthropic reject `.`).
Use those characters for `name` and `scopeId`; scoped names join with `__`:

```tsx
agentAction({ name: 'add_item', scopeId: 'cart', description: 'Add to cart', run });
// registered as 'cart__add_item'
```

## Confirmation

```tsx
agentAction({
  name: 'delete_order',
  description: 'Delete an order',
  params: { id: { type: String, required: true } },
  confirm: true,
  run: ({ id }) => remove(id),
});

bridge.setConfirmHandler(({ name, args }) =>
  window.confirm(`Let the assistant run ${name}(${JSON.stringify(args)})?`)
);
```

A missing handler, an error or any answer other than `true` returns
`REJECTED`. A person clicking the button that calls the action is not asked.

## WebMCP

```ts
import { connectWebMCP } from 'lithent/agent';

const disconnect = connectWebMCP(bridge); // mirrors tools, follows mounts
```

Each tool's `execute` returns the `callTool` result, so argument errors reach
the agent as data. Without WebMCP (other browsers, the server) it does
nothing.

## Custom Elements

An element made with `lithent/element` renders its own tree, so an outer
`<AgentScope>` does not reach inside it. Hand the page's bridge over as an
`Object` prop:

```tsx
const Panel = mount<{ host: HTMLElement; bridge?: unknown }>((_r, props) =>
  () => (
    <AgentScope bridge={props.bridge as AgentBridge}>
      <Inner />
    </AgentScope>
  )
);
defineElement('order-panel', Panel, { props: { bridge: Object } });

document.querySelector('order-panel').bridge = bridge;
```
