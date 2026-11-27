/**
 * Public types of `lithent/agent` (docs/agent-ui/DESIGN.md §2.1).
 */

/** Constructors a parameter can declare (DC-2). */
export type ParamConstructor =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | ObjectConstructor
  | ArrayConstructor;

/** A parameter: a bare constructor, or one with JSON Schema details. */
export type ParamFieldSpec =
  | ParamConstructor
  | {
      type: ParamConstructor;
      required?: boolean;
      description?: string;
      enum?: readonly (string | number | boolean)[];
    };

export type ParamSpec = Record<string, ParamFieldSpec>;

type ConstructorToType<C> = C extends StringConstructor
  ? string
  : C extends NumberConstructor
    ? number
    : C extends BooleanConstructor
      ? boolean
      : C extends ArrayConstructor
        ? unknown[]
        : Record<string, unknown>;

type FieldToType<F> = F extends ParamConstructor
  ? ConstructorToType<F>
  : F extends { type: infer C }
    ? ConstructorToType<C>
    : unknown;

type IsRequiredField<F> = F extends { required: true } ? true : false;

/** The argument object an action's `run` receives for a declaration. */
export type ParamsOf<S extends ParamSpec> = {
  [K in keyof S as IsRequiredField<S[K]> extends true ? K : never]: FieldToType<
    S[K]
  >;
} & {
  [K in keyof S as IsRequiredField<S[K]> extends true
    ? never
    : K]?: FieldToType<S[K]>;
};

/** What an approval sees before an agent's call runs (DC-5). */
export type ActionConfirmContext<P = Record<string, unknown>> = {
  /** The registered name, `scopeId` prefix included. */
  name: string;
  description: string;
  /** The checked arguments `run` would receive. */
  args: P;
};

/** Approve (`true`) or reject an agent's call; may be async (DC-5). */
export type ActionConfirmHandler = (
  ctx: ActionConfirmContext
) => boolean | Promise<boolean>;

export type AgentActionOptions<S extends ParamSpec | undefined, R> = {
  name: string;
  description: string;
  params?: S;
  /**
   * Ask before an agent's `callTool` runs this action (DC-5): `true` uses the
   * bridge's `setConfirmHandler`, a function decides itself. Calls of the
   * returned function (people, UI handlers) never ask.
   */
  confirm?: boolean | ActionConfirmHandler;
  /** Register on this bridge instead of the nearest scope (§2.4). */
  bridge?: AgentBridge;
  /** Registers the action as `${scopeId}__${name}` (DC-3, DC-15). */
  scopeId?: string;
  run: S extends ParamSpec
    ? (args: ParamsOf<S>) => R | Promise<R>
    : () => R | Promise<R>;
};

export type AgentStateOptions = {
  bridge?: AgentBridge;
  scopeId?: string;
};

export type CreateAgentBridgeOptions = {
  /** What a second registration under a taken name does (DC-3). */
  onConflict?: 'warn' | 'error';
};

export type ToolDescriptor = {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, Record<string, unknown>>;
    required?: string[];
    /** Undeclared keys are stripped before `run` (DC-11). */
    additionalProperties?: false;
  };
  requiresConfirm?: boolean;
};

/** One reason `callTool` rejected its arguments (`INVALID_PARAMS` details). */
export type ParamIssue = {
  /** The parameter, or `''` when the arguments are not an object. */
  param: string;
  issue: 'required' | 'type' | 'enum';
  /** The declared JSON type, or the allowed values for `enum`. */
  expected?: unknown;
};

export type ToolCallResult<T = unknown> =
  | { ok: true; value: T }
  | {
      ok: false;
      error: {
        code:
          | 'NOT_FOUND'
          | 'INVALID_PARAMS'
          | 'REJECTED'
          | 'EXECUTION_ERROR'
          | 'TIMEOUT';
        message: string;
        details?: unknown;
      };
    };

export type AgentBridgeEvent =
  | { type: 'tools-changed'; tools: ToolDescriptor[] }
  | { type: 'state-changed'; name?: string; state: Record<string, unknown> };

export type AgentBridge = {
  listTools: () => ToolDescriptor[];
  getState: () => Record<string, unknown>;
  callTool: (
    name: string,
    args?: Record<string, unknown>
  ) => Promise<ToolCallResult>;
  subscribe: (listener: (event: AgentBridgeEvent) => void) => () => void;
  /** The approval for actions declared with `confirm: true` (DC-5). */
  setConfirmHandler: (handler: ActionConfirmHandler | null) => void;
  notifyStateChange: (name?: string) => void;
  dispose: () => void;
};

/** A tool as `connectWebMCP` registers it (§2.6). */
export type WebMCPTool = {
  name: string;
  description: string;
  inputSchema: ToolDescriptor['inputSchema'];
  /** Resolves with the `ToolCallResult`; failures are returned, not thrown. */
  execute: (args: Record<string, unknown>) => Promise<ToolCallResult>;
};

/**
 * The part of a WebMCP model context the adapter uses (§2.6). Browsers that
 * follow the current draft remove a tool when the `signal` passed at
 * registration aborts; `unregisterTool` covers earlier drafts and polyfills.
 */
export type WebMCPModelContext = {
  registerTool: (
    tool: WebMCPTool,
    options?: { signal?: AbortSignal }
  ) => unknown;
  unregisterTool?: (name: string) => void;
};

export type ConnectWebMCPOptions = {
  /** Use this context instead of `document.modelContext` / `navigator.modelContext`. */
  target?: WebMCPModelContext;
};
