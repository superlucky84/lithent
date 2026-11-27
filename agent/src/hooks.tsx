import {
  h,
  Fragment,
  mount,
  mountCallback,
  updateCallback,
  getComponentKey,
  getComponentSubInfo,
} from 'lithent';
import type { CompKey, WDom } from 'lithent';
import { REG, defaultAgentBridge, tool } from '@/bridge';
import type { InternalBridge, Registry } from '@/bridge';
import type {
  AgentActionOptions,
  AgentBridge,
  AgentStateOptions,
  ParamSpec,
  ParamsOf,
} from '@/types';

/** Marks an `AgentScope`'s props; a symbol survives the in-place props sync. */
const SCOPE = Symbol();

const warned = new Set<string>();
const warnOnce = (key: string, msg: string) => {
  if (!warned.has(key)) {
    warned.add(key);
    console.warn(`[lithent/agent] ${msg}`);
  }
};

/** DC-3 — the name a declaration registers under. */
const fullName = (name: string, scopeId?: string) =>
  scopeId ? `${scopeId}.${name}` : name;

const registryOf = (bridge: AgentBridge): Registry | undefined => {
  const registry = (bridge as InternalBridge)[REG];
  if (!registry) {
    warnOnce('bridge', 'bridge was not made by createAgentBridge; skipped.');
  }
  return registry;
};

/**
 * §2.3 — declarations belong in the mounter: the current component exists and
 * has not drawn yet. A later call (in the updater) would register on every
 * render, so it warns once and registers nothing. The current key can also be
 * left over from a component that is gone (outside any component): its entry
 * is missing, which counts as outside too.
 */
const inMounter = (compKey: CompKey | null, name: string) => {
  const vd = compKey && getComponentSubInfo(compKey, 'vd');
  if (vd && !vd.value) return true;
  warnOnce(name, `"${name}" must be declared in a component mounter.`);
  return false;
};

/** The component's node once it has drawn, else null. */
const drawn = (compKey: CompKey) => {
  const vd = getComponentSubInfo(compKey, 'vd');
  return vd && vd.value;
};

/** §2.4 — the nearest `AgentScope` above a mounted component. */
const findScope = (compKey: CompKey): AgentBridge | undefined => {
  let node: WDom | null | undefined = drawn(compKey);
  while (node) {
    const props = node.compProps as
      | { bridge?: AgentBridge; [SCOPE]?: true }
      | undefined;
    if (props && props[SCOPE]) return props.bridge;
    node = node.getParent && node.getParent();
  }
  return undefined;
};

/** §2.4 priority: explicit bridge, nearest scope, then the default. */
const resolveBridge = (compKey: CompKey, explicit?: AgentBridge) =>
  explicit || findScope(compKey) || defaultAgentBridge;

/**
 * Give the components below their own bridge (§2.4). The bridge is resolved
 * when each component mounts; replacing the `bridge` prop later does not move
 * components that are already mounted.
 */
export const AgentScope = mount<{ bridge: AgentBridge }>(
  (_renew, props, children) => {
    (props as { [SCOPE]?: true })[SCOPE] = true;
    return () => <Fragment>{children}</Fragment>;
  }
);

/**
 * The bridge a component's declarations use. It resolves the scope when the
 * component mounts; calls made before that go to `defaultAgentBridge`.
 */
export const useAgentBridge = (): AgentBridge => {
  const compKey = getComponentKey();
  let resolved: AgentBridge | undefined;
  if (compKey) {
    mountCallback(() => {
      resolved = resolveBridge(compKey);
    });
  }
  const current = (): InternalBridge => resolved || defaultAgentBridge;

  const proxy = {
    get [REG]() {
      return current()[REG];
    },
  } as InternalBridge;
  for (const method of METHODS) {
    (proxy as Record<string, unknown>)[method] = (...args: unknown[]) =>
      (current()[method] as (...a: unknown[]) => unknown)(...args);
  }
  return proxy;
};

const METHODS = [
  'listTools',
  'getState',
  'callTool',
  'subscribe',
  'setConfirmHandler',
  'notifyStateChange',
  'dispose',
] as const;

/**
 * Declare an action people and agents share (RQ-1, §2.3). The returned
 * function runs `run` directly, as a UI handler would; agents go through
 * `bridge.callTool`, which checks the arguments first (DC-5).
 */
export function agentAction<R>(
  options: AgentActionOptions<undefined, R>
): () => R | Promise<R>;
export function agentAction<S extends ParamSpec, R>(
  options: AgentActionOptions<S, R> & { params: S }
): (args: ParamsOf<S>) => R | Promise<R>;
export function agentAction(
  options: AgentActionOptions<ParamSpec | undefined, unknown>
) {
  const { name, description, params, bridge, scopeId, confirm } = options;
  const run = options.run as (args?: Record<string, unknown>) => unknown;
  const compKey = getComponentKey();
  let registry: Registry | undefined;

  const report = () => registry && registry.q();

  if (inMounter(compKey, name)) {
    mountCallback(() => {
      const key = fullName(name, scopeId);
      registry = registryOf(resolveBridge(compKey as CompKey, bridge));
      return (
        registry &&
        registry.t(key, tool(key, description, params, run, confirm))
      );
    });
  }

  return (args?: Record<string, unknown>) => {
    const result = run(args);
    report();
    if (result && typeof (result as Promise<unknown>).then == 'function') {
      (result as Promise<unknown>).then(report, report);
    }
    return result;
  };
}

/**
 * Expose a JSON snapshot of component state (RQ-2, §2.3). Subscribers hear
 * about changes after any update of the component, after actions, and on
 * mount and unmount.
 */
export const agentState = <T,>(
  name: string,
  getter: () => T,
  options: AgentStateOptions = {}
): void => {
  const compKey = getComponentKey();
  if (!inMounter(compKey, name)) return;

  let registry: Registry | undefined;

  mountCallback(() => {
    registry = registryOf(resolveBridge(compKey as CompKey, options.bridge));
    return (
      registry && registry.s(fullName(name, options.scopeId), { g: getter })
    );
  });

  // The default (empty) dependency list runs the returned callback after
  // every update of this component, including plain UI input (§2.3).
  updateCallback(() => () => {
    if (registry) registry.q();
  });
};
