import { toInputSchema, validateArgs } from '@/schema';
import type {
  AgentBridge,
  AgentBridgeEvent,
  CreateAgentBridgeOptions,
  ParamSpec,
  ToolCallResult,
  ToolDescriptor,
} from '@/types';

/**
 * The registry behind a bridge, reached through this module-private symbol so
 * the public `AgentBridge` contract stays the one consumers see (§2.1).
 */
export const REG = Symbol();

export type ToolEntry = {
  d: ToolDescriptor;
  s?: ParamSpec;
  run: (args: Record<string, unknown>) => unknown;
};

export type StateEntry = {
  /** Getter. */
  g: () => unknown;
  /** Last serialized snapshot subscribers were told about. */
  l?: string;
  /** Already warned about a failing getter (DC-12). */
  w?: boolean;
};

export type Registry = {
  /** Register a tool; returns its removal. */
  t: (name: string, entry: ToolEntry) => () => void;
  /** Register a state; returns its removal. */
  s: (name: string, entry: StateEntry) => () => void;
  /** Queue one microtask that reports changed states (§2.3). */
  q: () => void;
};

export type InternalBridge = AgentBridge & { [REG]?: Registry };

export const tool = (
  name: string,
  description: string,
  params: ParamSpec | undefined,
  run: ToolEntry['run']
): ToolEntry => ({
  d: { name, description, inputSchema: toInputSchema(params) },
  s: params,
  run,
});

const message = (error: unknown) =>
  String(error instanceof Error ? error.message : error);

const fail = (
  code: 'NOT_FOUND' | 'INVALID_PARAMS' | 'EXECUTION_ERROR',
  msg: string,
  details?: unknown
): ToolCallResult => ({ ok: false, error: { code, message: msg, details } });

/**
 * JSON text of a state; a getter that throws or returns something JSON cannot
 * hold becomes `{ __agentStateError }` with one warning (DC-12).
 */
const serialize = (name: string, e: StateEntry): string => {
  try {
    return (
      JSON.stringify(e.g(), (_key, v) =>
        typeof v == 'bigint' ? String(v) : v
      ) ?? 'null'
    );
  } catch (error) {
    if (!e.w) {
      e.w = true;
      console.warn(`[lithent/agent] state "${name}" failed:`, error);
    }
    return JSON.stringify({ __agentStateError: message(error) });
  }
};

export const createAgentBridge = ({
  onConflict = 'warn',
}: CreateAgentBridgeOptions = {}): AgentBridge => {
  const tools = new Map<string, ToolEntry>();
  const states = new Map<string, StateEntry>();
  const listeners = new Set<(event: AgentBridgeEvent) => void>();
  let queued = false;

  const emit = (event: AgentBridgeEvent) =>
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(error);
      }
    });

  const listTools = () => Array.from(tools.values(), e => e.d);

  /** Snapshot every state; with `changed`, also record what moved. */
  const read = (changed?: string[]) => {
    const out: Record<string, unknown> = {};
    states.forEach((e, name) => {
      const text = serialize(name, e);
      if (changed) {
        if (text !== e.l) changed.push(name);
        e.l = text;
      }
      out[name] = JSON.parse(text);
    });
    return out;
  };

  const stateChanged = (name?: string, changed?: string[]) =>
    emit({ type: 'state-changed', name, state: read(changed) });

  /**
   * DC-3: a taken name is an error, or the latest registration wins. A
   * removal only removes its own entry, so an instance that lost its name to
   * a newer one cannot unregister the newer one on unmount.
   */
  const add =
    <E>(map: Map<string, E>, after: (name: string) => void) =>
    (name: string, entry: E) => {
      if (map.has(name)) {
        const msg = `[lithent/agent] "${name}" is already registered`;
        if (onConflict == 'error') throw new Error(msg);
        console.warn(`${msg}; the latest instance replaces it.`);
      }
      map.set(name, entry);
      after(name);

      return () => {
        if (map.get(name) === entry) {
          map.delete(name);
          after(name);
        }
      };
    };

  const toolsChanged = () =>
    emit({ type: 'tools-changed', tools: listTools() });

  const registry: Registry = {
    t: add(tools, toolsChanged),
    s: add(states, name => stateChanged(name, [])),
    q: () => {
      if (queued) return;
      queued = true;
      queueMicrotask(() => {
        queued = false;
        const changed: string[] = [];
        const state = read(changed);
        if (changed.length) {
          emit({
            type: 'state-changed',
            name: changed.length == 1 ? changed[0] : undefined,
            state,
          });
        }
      });
    },
  };

  const bridge: InternalBridge = {
    listTools,
    getState: () => read(),
    callTool: async (name, args = {}) => {
      const e = tools.get(name);
      if (!e) return fail('NOT_FOUND', `No tool named "${name}".`);

      const [clean, issues] = validateArgs(e.s, args);
      if (issues) {
        const list = issues
          .map(i => `${i.param || 'arguments'} (${i.issue})`)
          .join(', ');
        return fail(
          'INVALID_PARAMS',
          `Invalid arguments for "${name}": ${list}.`,
          issues
        );
      }

      try {
        return { ok: true, value: await e.run(clean) };
      } catch (error) {
        return fail('EXECUTION_ERROR', message(error));
      } finally {
        registry.q();
      }
    },
    subscribe: listener => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    notifyStateChange: name => stateChanged(name, []),
    dispose: () => {
      const hadTools = tools.size > 0;
      tools.clear();
      states.clear();
      if (hadTools) toolsChanged();
      listeners.clear();
    },
    [REG]: registry,
  };

  return bridge;
};

/** The bridge used when neither `options.bridge` nor a scope applies. */
export const defaultAgentBridge = createAgentBridge();
