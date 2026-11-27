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

export type AgentActionOptions<S extends ParamSpec | undefined, R> = {
  name: string;
  description: string;
  params?: S;
  /** Register on this bridge instead of the nearest scope (§2.4). */
  bridge?: AgentBridge;
  /** Registers the action as `${scopeId}.${name}` (DC-3). */
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
  notifyStateChange: (name?: string) => void;
  dispose: () => void;
};
