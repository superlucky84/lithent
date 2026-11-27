import { buildSrcdoc } from '@/srcdoc';
import type {
  ActionConfirmHandler,
  AgentBridge,
  AgentBridgeEvent,
  ToolCallResult,
  ToolDescriptor,
} from 'lithent/agent';
import type {
  LiveError,
  LiveHandle,
  LiveRpcMessage,
  MountLiveOptions,
} from '@/types';

/**
 * The host side of `lithent/live` (docs/agent-ui/DESIGN.md §3.1–§3.4):
 * one sandbox iframe per widget, a postMessage RPC to it, and an
 * `AgentBridge` that mirrors the widget's tools and state.
 */

/** One sandbox: its iframe, channel and unanswered requests. */
type Session = {
  ch: string;
  frame: HTMLIFrameElement;
  /** id → settle(reply | 'gone' | 'timeout' | 'unsent: …'). */
  pending: Map<number, (reply: LiveRpcMessage | string) => void>;
  off: () => void;
};

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

export const mountLive = async (
  options: MountLiveOptions
): Promise<LiveHandle> => {
  const { container, timeoutMs = 5000, onError } = options;
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

  /** Tell onError, and hand the error back for throwing. */
  const report = (error: LiveError) => {
    try {
      if (onError) onError(error);
    } catch (thrown) {
      console.error(thrown);
    }
    return error;
  };

  const close = (session: Session) => {
    session.off();
    session.frame.remove();
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
        // An opaque-origin sandbox has no origin to target: '*' (§3.3).
        session.frame.contentWindow!.postMessage(
          { ...message, ch: session.ch, id },
          '*'
        );
      } catch (error) {
        settle('unsent: ' + messageOf(error));
      }
    });

  /** Start `code` in a fresh sandbox; resolves once it is ready. */
  const open = (code: string) =>
    new Promise<void>((resolve, reject) => {
      const { runtimeCode, runtimeUrl } = options;
      if (options.mode && options.mode != 'sandbox') {
        reject(
          report({
            phase: 'compile',
            message: `mode "${options.mode}" is not available in this version; use "sandbox".`,
          })
        );
        return;
      }
      // DC-13: never fall back to a hidden CDN request.
      if (runtimeCode == null && !runtimeUrl) {
        reject(
          report({
            phase: 'compile',
            message:
              'Sandbox mode needs runtimeCode (sandboxRuntimeCode from lithent/live/runtime) or runtimeUrl.',
          })
        );
        return;
      }

      const ch = channelId();
      const frame = document.createElement('iframe');
      // DC-7: scripts only. Without allow-same-origin the document gets an
      // opaque origin: no host DOM, cookies or storage.
      frame.setAttribute('sandbox', 'allow-scripts');
      frame.setAttribute('title', 'lithent live widget');
      frame.style.cssText = 'border:0;width:100%;display:block';
      frame.srcdoc = buildSrcdoc({
        config: { ch, code, props, origin: location.origin },
        styles: options.styles,
        runtimeCode,
        runtimeUrl,
        allowNetwork: options.allowNetwork,
      });

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
          reject(report(error));
        } else {
          current = session;
          emit({ type: 'tools-changed', tools: tools.slice() });
          emit({ type: 'state-changed', state: bridge.getState() });
          resolve();
        }
      };

      // §3.3: only this iframe, only this session's channel.
      const onMessage = (event: MessageEvent) => {
        const message = event.data as LiveRpcMessage | undefined;
        if (
          event.source !== frame.contentWindow ||
          !message ||
          message.ch !== ch
        ) {
          return;
        }
        if (message.type == 'ready') {
          tools = message.tools;
          state = message.state;
          finish();
        } else if (message.type == 'error') {
          if (started) report(message.error);
          else finish(message.error);
        } else if (message.type == 'event' && started) {
          const forwarded = message.event;
          if (forwarded.type == 'tools-changed') tools = forwarded.tools;
          else state = forwarded.state;
          emit(forwarded);
        } else if (message.type == 'result' || message.type == 'ack') {
          const settle = session.pending.get(message.id);
          if (settle) settle(message);
        }
      };

      const session: Session = {
        ch,
        frame,
        pending: new Map(),
        off: () => removeEventListener('message', onMessage),
      };
      addEventListener('message', onMessage);
      container.appendChild(frame);
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
      // reaches the sandbox. Same rules as lithent/agent (DC-5).
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

      const reply = await request(current as Session, {
        type: 'call',
        name,
        args,
      });
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
        report({
          phase: 'timeout',
          message: `"${name}" did not answer within ${timeoutMs} ms.`,
        });
        return fail(
          'TIMEOUT',
          `"${name}" did not answer within ${timeoutMs} ms.`
        );
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
      if (!current) return;
      const reply = await request(current, { type: 'props', props: next });
      if (reply == 'timeout') {
        throw report({
          phase: 'timeout',
          message: `The widget did not take the new props within ${timeoutMs} ms.`,
        });
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
