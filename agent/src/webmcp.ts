import { defaultAgentBridge } from '@/bridge';
import type {
  AgentBridge,
  ConnectWebMCPOptions,
  ToolDescriptor,
  WebMCPModelContext,
} from '@/types';

/**
 * The page's WebMCP context: `document.modelContext` in current browsers,
 * `navigator.modelContext` in earlier drafts. Undefined on the server.
 */
const findContext = (): WebMCPModelContext | undefined =>
  (typeof document != 'undefined' &&
    (document as { modelContext?: WebMCPModelContext }).modelContext) ||
  (typeof navigator != 'undefined' &&
    (navigator as { modelContext?: WebMCPModelContext }).modelContext) ||
  undefined;

/**
 * Mirror a bridge's tools into the browser's WebMCP context (RQ-5, DC-4).
 * Opt-in: importing `lithent/agent` touches nothing. Without a context it
 * returns a no-op. The returned function stops syncing and removes every
 * tool this call registered.
 */
export const connectWebMCP = (
  bridge: AgentBridge = defaultAgentBridge,
  options: ConnectWebMCPOptions = {}
): (() => void) => {
  const target = options.target || findContext();
  if (!target) return () => {};

  /** What this adapter registered: the descriptor and its abort. */
  const live = new Map<string, [ToolDescriptor, AbortController]>();

  const drop = (name: string) => {
    const entry = live.get(name);
    if (!entry) return;
    live.delete(name);
    entry[1].abort();
    if (target.unregisterTool) target.unregisterTool(name);
  };

  const warn = (name: string, error: unknown) =>
    console.warn(`[lithent/agent] WebMCP could not register "${name}":`, error);

  const sync = (tools: ToolDescriptor[]) => {
    const next = new Map(tools.map(d => [d.name, d]));
    // A name now held by another instance (DC-3) has a new descriptor:
    // re-register it so the description and schema match.
    live.forEach(([d], name) => next.get(name) !== d && drop(name));
    next.forEach((d, name) => {
      if (live.has(name)) return;
      const abort = new AbortController();
      live.set(name, [d, abort]);
      try {
        const pending = target.registerTool(
          {
            name,
            description: d.description,
            inputSchema: d.inputSchema,
            // Arguments are checked by callTool; failures come back as a
            // ToolCallResult rather than a throw, so the agent sees them.
            execute: args => bridge.callTool(name, args),
          },
          { signal: abort.signal }
        ) as Promise<unknown> | undefined;
        if (pending && pending.catch) pending.catch(error => warn(name, error));
      } catch (error) {
        warn(name, error);
      }
    });
  };

  sync(bridge.listTools());
  const stop = bridge.subscribe(event => {
    if (event.type == 'tools-changed') sync(event.tools);
  });

  return () => {
    stop();
    live.forEach((_entry, name) => drop(name));
  };
};
