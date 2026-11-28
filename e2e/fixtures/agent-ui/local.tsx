import { mount, lmount, render } from 'lithent';
import { lstate } from 'lithent/helper';
import {
  AgentScope,
  agentAction,
  agentState,
  connectWebMCP,
  createAgentBridge,
} from 'lithent/agent';
import type {
  AgentBridge,
  AgentBridgeEvent,
  WebMCPModelContext,
  WebMCPTool,
} from 'lithent/agent';

/**
 * M-1 (orders filtered by a person and by an agent, then unmounted), M-2
 * (WebMCP through a mock model context), M-5 (a confirm action: the agent
 * needs approval, a person's click does not).
 */

type Status = 'all' | 'delayed' | 'done';
type Order = { id: number; status: 'delayed' | 'done'; price: number };

const ORDERS: Order[] = [
  { id: 1, status: 'delayed', price: 50_000 },
  { id: 2, status: 'done', price: 120_000 },
  { id: 3, status: 'delayed', price: 250_000 },
  { id: 4, status: 'done', price: 80_000 },
  { id: 5, status: 'delayed', price: 300_000 },
];

const OrderFilter = lmount(() => {
  const status = lstate<Status>('all');
  const minPrice = lstate(0);
  const orders = lstate<Order[]>(ORDERS);
  const visible = () =>
    orders.value.filter(
      o =>
        (status.value == 'all' || o.status == status.value) &&
        o.price >= minPrice.value
    );

  agentAction({
    name: 'filter_orders',
    description: 'Filter orders by delivery status and minimum price',
    params: {
      status: {
        type: String,
        enum: ['all', 'delayed', 'done'],
        required: true,
      },
      minPrice: { type: Number, description: 'Minimum price' },
    },
    run: ({ status: next, minPrice: min = 0 }) => {
      status.value = next as Status;
      minPrice.value = min;
      return visible().map(o => o.id);
    },
  });
  // M-5: destructive, so an agent needs approval; a person's click runs it.
  const cancelDelayed = agentAction({
    name: 'cancel_delayed',
    description: 'Cancel every delayed order',
    confirm: true,
    run: () => {
      orders.value = orders.value.filter(o => o.status != 'delayed');
      return orders.value.length;
    },
  });
  agentState('orders', () => ({
    status: status.value,
    minPrice: minPrice.value,
    visible: visible().map(o => o.id),
  }));

  const pick = (next: Status) => () => {
    status.value = next;
  };
  return () => (
    <section>
      <button class="all" onClick={pick('all')}>
        all
      </button>
      <button class="delayed" onClick={pick('delayed')}>
        delayed
      </button>
      <button class="done" onClick={pick('done')}>
        done
      </button>
      <button class="cancel" onClick={() => cancelDelayed()}>
        cancel delayed
      </button>
      <ul>
        {visible().map(o => (
          <li class="order">{`#${o.id} ${o.status} ${o.price}`}</li>
        ))}
      </ul>
    </section>
  );
});

// The model context mock (M-2): what a WebMCP browser would hold.
type Registered = { tool: WebMCPTool; signal?: AbortSignal };
const webmcp = {
  tools: new Map<string, Registered>(),
  log: [] as string[],
};
const mode = new URLSearchParams(location.search).get('webmcp') || 'none';
if (mode != 'none') {
  const context: WebMCPModelContext = {
    registerTool: (tool, options) => {
      webmcp.log.push(`register ${tool.name}`);
      webmcp.tools.set(tool.name, { tool, signal: options?.signal });
      options?.signal?.addEventListener('abort', () => {
        webmcp.log.push(`abort ${tool.name}`);
        webmcp.tools.delete(tool.name);
      });
    },
    unregisterTool: name => {
      webmcp.log.push(`unregister ${name}`);
      webmcp.tools.delete(name);
    },
  };
  Object.defineProperty(
    mode == 'document' ? document : navigator,
    'modelContext',
    {
      value: context,
      configurable: true,
    }
  );
}

const bridge = createAgentBridge();
const events: AgentBridgeEvent[] = [];
bridge.subscribe(event => events.push(event));

let show = true;
let renewHost = () => false as boolean;
const Host = mount(renew => {
  renewHost = renew;
  return () => (
    <AgentScope bridge={bridge}>
      <main>{show ? <OrderFilter /> : <p class="gone">unmounted</p>}</main>
    </AgentScope>
  );
});
render(<Host />, document.getElementById('app')!);
const disconnect = connectWebMCP(bridge);

declare global {
  interface Window {
    agentUi: {
      bridge: AgentBridge;
      events: AgentBridgeEvent[];
      webmcp: typeof webmcp;
      disconnect: () => void;
      setShow: (next: boolean) => void;
      runTool: (name: string, args?: Record<string, unknown>) => unknown;
    };
  }
}
window.agentUi = {
  bridge,
  events,
  webmcp,
  disconnect,
  setShow: next => {
    show = next;
    renewHost();
  },
  // Call a tool the way the browser's agent would, through the model context.
  runTool: (name, args = {}) => webmcp.tools.get(name)!.tool.execute(args),
};
document.documentElement.dataset.ready = 'true';
