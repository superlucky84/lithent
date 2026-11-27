import { hintFor } from '@/hints';
import { buildSrcdoc, styleText, themeCss } from '@/srcdoc';
import type {
  ActionConfirmHandler,
  AgentBridge,
  AgentBridgeEvent,
  ToolCallResult,
  ToolDescriptor,
} from 'lithent/agent';
import type {
  LiveBootConfig,
  LiveError,
  LiveHandle,
  LiveRpcMessage,
  MountLiveOptions,
} from '@/types';

/**
 * The host side of `lithent/live` (docs/agent-ui/DESIGN.md §3.1–§3.4): one
 * session per widget, an RPC to it, and an `AgentBridge` that mirrors the
 * widget's tools and state. A session is a sandbox iframe spoken to with
 * postMessage, or (mode 'direct') the same runtime started in this page,
 * in a shadow root, spoken to in memory: both share everything above.
 */

type Session = {
  ch: string;
  code: string;
  /** The sandbox iframe; absent in direct mode. */
  frame?: HTMLIFrameElement;
  /** Deliver a message to the widget; throws when it cannot be sent. */
  send: (message: object) => void;
  /** Remove the widget, its element and its listener. */
  stop: () => void;
  /** id → settle(reply | 'gone' | 'timeout' | 'unsent: …'). */
  pending: Map<number, (reply: LiveRpcMessage | string) => void>;
};

type Receive = (message: LiveRpcMessage | undefined) => void;

type Code = 'NOT_FOUND' | 'REJECTED' | 'TIMEOUT' | 'INVALID_PARAMS';

const fail = (code: Code, message: string): ToolCallResult => ({
  ok: false,
  error: { code, message },
});

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/** A random channel id; works on insecure origins (no randomUUID). */
const channelId = () =>
  Array.from(crypto.getRandomValues(new Uint32Array(4)), n =>
    n.toString(36)
  ).join('');

let seq = 0;

/** DC-7: a sandbox iframe with scripts only, spoken to with postMessage. */
const openSandbox = (
  session: Session,
  config: LiveBootConfig,
  receive: Receive,
  options: MountLiveOptions
) => {
  const frame = document.createElement('iframe');
  // Without allow-same-origin the document gets an opaque origin: no host
  // DOM, cookies or storage.
  frame.setAttribute('sandbox', 'allow-scripts');
  frame.setAttribute('title', 'lithent live widget');
  frame.style.cssText = 'border:0;width:100%;display:block';
  frame.srcdoc = buildSrcdoc({
    config,
    styles: options.styles,
    theme: options.theme,
    runtimeCode: options.runtimeCode,
    runtimeUrl: options.runtimeUrl,
    allowNetwork: options.allowNetwork,
  });
  // §3.3: only this iframe (the channel is checked by receive).
  const onMessage = (event: MessageEvent) => {
    if (event.source === frame.contentWindow) receive(event.data);
  };
  addEventListener('message', onMessage);
  session.frame = frame;
  // An opaque-origin sandbox has no origin to target: '*' (§3.3).
  session.send = message => frame.contentWindow!.postMessage(message, '*');
  session.stop = () => {
    removeEventListener('message', onMessage);
    frame.remove();
  };
  options.container.appendChild(frame);
};

let warnedDirect = false;

/**
 * Mode 'direct' (§3.2, §3.3): the runtime in this page, in a shadow root,
 * with the page's lithent. Messages are passed in memory and asynchronously,
 * like postMessage. The runtime is loaded on first use, so pages that only
 * use the sandbox do not pull lithent's helpers in.
 */
const openDirect = async (
  session: Session,
  config: LiveBootConfig,
  receive: Receive,
  options: MountLiveOptions
) => {
  if (!warnedDirect) {
    warnedDirect = true;
    console.warn(
      "[lithent/live] mode 'direct' runs the widget code in this page: use it only for code you trust."
    );
  }
  const host = document.createElement('div');
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML =
    [themeCss(':host', options.theme), ...(options.styles || [])]
      .filter(Boolean)
      .map(css => `<style>${styleText(css)}</style>`)
      .join('') + '<div></div>';
  let stopped = false;
  let handler: ((message: LiveRpcMessage) => void) | undefined;
  let teardown: (() => void) | undefined;
  session.send = message =>
    queueMicrotask(() => handler && handler(message as LiveRpcMessage));
  session.stop = () => {
    stopped = true;
    handler = undefined;
    if (teardown) teardown();
    host.remove();
  };
  options.container.appendChild(host);

  const { boot } = await import('@/runtime/boot');
  if (stopped) return;
  teardown = boot(config, shadow.lastChild as HTMLElement, {
    post: message => queueMicrotask(() => stopped || receive(message)),
    listen: fn => {
      handler = fn;
      return () => {
        handler = undefined;
      };
    },
  });
};

export const mountLive = async (
  options: MountLiveOptions
): Promise<LiveHandle> => {
  const { timeoutMs = 5000, onError } = options;
  let props = options.props || {};
  let tools: ToolDescriptor[] = [];
  let state: Record<string, unknown> = {};
  let current: Session | undefined;
  let destroyed = false;
  let confirmHandler: ActionConfirmHandler | null = null;
  const listeners = new Set<(event: AgentBridgeEvent) => void>();

  const emit = (event: AgentBridgeEvent) =>
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(error);
      }
    });

  /**
   * Tell onError and hand the error back for throwing. With the code it
   * came from, a self-repair hint is added (RQ-8).
   */
  const report = (error: LiveError, code?: string) => {
    const hint = code != null && !error.hint && hintFor(error, code);
    const reported = hint ? { ...error, hint } : error;
    try {
      if (onError) onError(reported);
    } catch (thrown) {
      console.error(thrown);
    }
    return reported;
  };

  const close = (session: Session) => {
    session.stop();
    session.pending.forEach(settle => settle('gone'));
  };

  /** Send a request and wait for its reply, the timeout or the end. */
  const request = (session: Session, message: object) =>
    new Promise<LiveRpcMessage | string>(resolve => {
      const id = ++seq;
      const timer = setTimeout(() => settle('timeout'), timeoutMs);
      const settle = (reply: LiveRpcMessage | string) => {
        clearTimeout(timer);
        session.pending.delete(id);
        resolve(reply);
      };
      session.pending.set(id, settle);
      try {
        session.send({ ...message, ch: session.ch, id });
      } catch (error) {
        settle('unsent: ' + messageOf(error));
      }
    });

  /** Start `code` in a fresh session; resolves once it is ready. */
  const open = (code: string) =>
    new Promise<void>((resolve, reject) => {
      const { mode = 'sandbox', runtimeCode, runtimeUrl } = options;
      const refuse = (message: string) =>
        reject(report({ phase: 'compile', message }));
      if (mode != 'sandbox' && mode != 'direct') {
        refuse(`mode "${mode}" is not supported; use "sandbox" or "direct".`);
        return;
      }
      // DC-13: never fall back to a hidden CDN request.
      if (mode == 'sandbox' && runtimeCode == null && !runtimeUrl) {
        refuse(
          'Sandbox mode needs runtimeCode (sandboxRuntimeCode from lithent/live/runtime) or runtimeUrl.'
        );
        return;
      }

      const ch = channelId();
      const config: LiveBootConfig = {
        ch,
        code,
        props,
        origin: location.origin,
        resize: mode == 'sandbox' && options.autoResize !== false,
      };
      let started = false;
      const timer = setTimeout(
        () =>
          finish({
            phase: 'timeout',
            message: `The widget did not start within ${timeoutMs} ms.`,
          }),
        timeoutMs
      );
      const finish = (error?: LiveError) => {
        if (started) return;
        started = true;
        clearTimeout(timer);
        if (error) {
          close(session);
          reject(report(error, code));
        } else {
          current = session;
          emit({ type: 'tools-changed', tools: tools.slice() });
          emit({ type: 'state-changed', state: bridge.getState() });
          resolve();
        }
      };

      const receive: Receive = message => {
        if (!message || message.ch !== ch) return;
        if (message.type == 'ready') {
          tools = message.tools;
          state = message.state;
          finish();
        } else if (message.type == 'error') {
          if (started) report(message.error, code);
          else finish(message.error);
        } else if (message.type == 'event' && started) {
          const forwarded = message.event;
          if (forwarded.type == 'tools-changed') tools = forwarded.tools;
          else state = forwarded.state;
          emit(forwarded);
        } else if (message.type == 'result' || message.type == 'ack') {
          const settle = session.pending.get(message.id);
          if (settle) settle(message);
        } else if (
          message.type == 'resize' &&
          config.resize &&
          session.frame &&
          message.height >= 0
        ) {
          // DC-8: fit the iframe to its content.
          session.frame.style.height = `${+message.height}px`;
        }
      };

      const session: Session = {
        ch,
        code,
        pending: new Map(),
        send: () => {},
        stop: () => {},
      };
      if (mode == 'direct') {
        openDirect(session, config, receive, options).catch(error =>
          finish({ phase: 'mount', message: messageOf(error) })
        );
      } else {
        openSandbox(session, config, receive, options);
      }
    });

  /** Clear the widget's tools and state, telling subscribers. */
  const clear = () => {
    if (current) close(current);
    current = undefined;
    if (tools.length) emit({ type: 'tools-changed', tools: [] });
    tools = [];
    state = {};
  };

  const bridge: AgentBridge = {
    listTools: () => tools.slice(),
    getState: () => JSON.parse(JSON.stringify(state)),
    callTool: async (name, args = {}) => {
      const find = () => current && tools.find(t => t.name === name);
      const tool = find();
      if (!tool) return fail('NOT_FOUND', `No tool named "${name}".`);

      // DC-14: approval happens here, on the host; a refused call never
      // reaches the widget. Same rules as lithent/agent (DC-5).
      if (tool.requiresConfirm) {
        let reason = 'The call was not approved.';
        let approved = false;
        try {
          if (confirmHandler) {
            approved =
              (await confirmHandler({
                name,
                description: tool.description,
                args,
              })) === true;
          } else {
            reason = `"${name}" needs approval and no confirm handler is set.`;
          }
        } catch (error) {
          reason = messageOf(error);
        }
        if (!approved) return fail('REJECTED', reason);
        if (!find()) {
          return fail('NOT_FOUND', `"${name}" was removed before it ran.`);
        }
      }

      const session = current as Session;
      const reply = await request(session, { type: 'call', name, args });
      if (typeof reply != 'string') {
        const result = (reply as { result?: ToolCallResult }).result;
        return result && typeof result.ok == 'boolean'
          ? result
          : {
              ok: false,
              error: {
                code: 'EXECUTION_ERROR',
                message: `The widget answered "${name}" with an invalid result.`,
              },
            };
      }
      if (reply == 'timeout') {
        const message = `"${name}" did not answer within ${timeoutMs} ms.`;
        report({ phase: 'timeout', message }, session.code);
        return fail('TIMEOUT', message);
      }
      if (reply == 'gone') {
        return fail(
          'NOT_FOUND',
          `The widget was removed before "${name}" finished.`
        );
      }
      return fail(
        'INVALID_PARAMS',
        `The arguments for "${name}" could not be sent: ${reply.slice(8)}`
      );
    },
    subscribe: listener => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setConfirmHandler: handler => {
      confirmHandler = handler;
    },
    notifyStateChange: name =>
      emit({ type: 'state-changed', name, state: bridge.getState() }),
    dispose: () => handle.destroy(),
  };

  const handle: LiveHandle = {
    bridge,
    updateProps: async next => {
      props = next;
      const session = current;
      if (!session) return;
      const reply = await request(session, { type: 'props', props: next });
      if (reply == 'timeout') {
        throw report(
          {
            phase: 'timeout',
            message: `The widget did not take the new props within ${timeoutMs} ms.`,
          },
          session.code
        );
      }
      if (typeof reply == 'string' && reply != 'gone') {
        throw report({
          phase: 'render',
          message: `The props could not be sent: ${reply.slice(8)}`,
        });
      }
    },
    reload: async nextCode => {
      if (destroyed) {
        throw report({
          phase: 'mount',
          message: 'The widget was destroyed.',
        });
      }
      clear();
      await open(nextCode);
    },
    destroy: () => {
      destroyed = true;
      clear();
      listeners.clear();
    },
  };

  await open(options.code);
  return handle;
};
