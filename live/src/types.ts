import type {
  AgentBridge,
  AgentBridgeEvent,
  ToolCallResult,
  ToolDescriptor,
} from 'lithent/agent';

/**
 * Public types of `lithent/live` (docs/agent-ui/DESIGN.md §3.1).
 */

export type LiveMode = 'sandbox' | 'direct';

/** A failure an LLM loop can act on (RQ-8, §3.4). */
export type LiveError = {
  phase: 'compile' | 'mount' | 'render' | 'action' | 'timeout';
  message: string;
  stack?: string;
  hint?: string;
};

export type MountLiveOptions = {
  /** A function body that returns a component: `return lmount(...)` (§3.2). */
  code: string;
  container: HTMLElement;
  /** Default `'sandbox'` (DC-7). `'direct'` arrives in Phase 5. */
  mode?: LiveMode;
  /** CSS for the widget document. */
  styles?: string[];
  props?: Record<string, unknown>;
  /** The sandbox runtime as a string (`sandboxRuntimeCode`, DC-6). */
  runtimeCode?: string;
  /** Or a URL of `sandboxRuntime.umd.js` (DC-6). One of the two is required (DC-13). */
  runtimeUrl?: string;
  /** Drop the network-blocking CSP (DC-7). Default `false`. */
  allowNetwork?: boolean;
  /** Milliseconds for loading, calls and prop updates. Default 5000. */
  timeoutMs?: number;
  onError?: (error: LiveError) => void;
};

export type LiveHandle = {
  /** The widget's tools and state behind the `AgentBridge` contract (RQ-8). */
  bridge: AgentBridge;
  /** New props; the widget's closure state is kept. Resolves once drawn. */
  updateProps: (props: Record<string, unknown>) => Promise<void>;
  /** Replace the widget with new code in a fresh sandbox. */
  reload: (nextCode: string) => Promise<void>;
  /** Remove the widget, its sandbox and its listeners. */
  destroy: () => void;
};

/**
 * Messages between the host and the sandbox (§3.4). Every message carries
 * the session's channel id; only plain, cloneable data crosses.
 */
export type LiveRpcMessage =
  | {
      ch: string;
      type: 'ready';
      tools: ToolDescriptor[];
      state: Record<string, unknown>;
    }
  | { ch: string; type: 'event'; event: AgentBridgeEvent }
  | { ch: string; type: 'error'; error: LiveError }
  | {
      ch: string;
      type: 'call';
      id: number;
      name: string;
      args?: Record<string, unknown>;
    }
  | { ch: string; type: 'result'; id: number; result: ToolCallResult }
  | { ch: string; type: 'props'; id: number; props: Record<string, unknown> }
  | { ch: string; type: 'ack'; id: number }
  | { ch: string; type: 'resize'; height: number };

/** What the host hands the sandbox runtime at start. */
export type LiveBootConfig = {
  ch: string;
  code: string;
  props: Record<string, unknown>;
  /** The host page origin, the target of the sandbox's messages. */
  origin: string;
};
