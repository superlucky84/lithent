import { h, mount, render, nextTick } from 'lithent';
import type { TagFunction } from 'lithent';
import { AgentScope, createAgentBridge } from 'lithent/agent';
import { symbolNames, symbolValues } from '@/runtime/symbols';
import type { LiveBootConfig, LiveError, LiveRpcMessage } from '@/types';

/**
 * The sandbox side of `lithent/live` (docs/agent-ui/DESIGN.md §3.2, §3.4):
 * compile the generated code, draw it, put its actions and state behind a
 * bridge, and answer the host. `entry.ts` wires it to the iframe's window;
 * tests drive it with a fake transport.
 */

/** How the sandbox talks to its host. */
export type LiveIo = {
  post: (message: LiveRpcMessage) => void;
  /** Receive host messages already checked for source and channel. */
  listen: (handler: (message: LiveRpcMessage) => void) => () => void;
};

/** Message without the channel id, which `send` adds. */
type Outgoing = LiveRpcMessage extends infer M
  ? M extends LiveRpcMessage
    ? Omit<M, 'ch'>
    : never
  : never;

export const toLiveError = (
  phase: LiveError['phase'],
  error: unknown
): LiveError =>
  error instanceof Error
    ? { phase, message: error.message, stack: error.stack }
    : { phase, message: String(error) };

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/**
 * Start a widget in `root`. Returns its teardown, or nothing when it failed
 * to start (the failure has been reported to the host).
 */
export const boot = (
  config: LiveBootConfig,
  root: HTMLElement,
  io: LiveIo
): (() => void) | undefined => {
  const send = (message: Outgoing) =>
    io.post({ ...message, ch: config.ch } as LiveRpcMessage);
  const fail = (phase: LiveError['phase'], error: unknown) => {
    send({ type: 'error', error: toLiveError(phase, error) });
    return undefined;
  };

  // DC-14: the host asks for approval before a call reaches the sandbox, so
  // a `confirm: true` action is already approved when it arrives here.
  const bridge = createAgentBridge();
  bridge.setConfirmHandler(() => true);

  let component: unknown;
  try {
    // DC-6: a function body that sees the runtime's symbols by name.
    component = new Function(...symbolNames, config.code)(...symbolValues);
  } catch (error) {
    return fail('compile', error);
  }
  if (typeof component != 'function') {
    return fail(
      'compile',
      'The code must return a component, e.g. `return lmount(props => () => fTags.div({}, "hi"))`.'
    );
  }

  let props = config.props;
  let renew = () => false as boolean;
  const Widget = component as Parameters<typeof h>[0];
  // Like lithent/element: new props redraw the same instance, so the
  // widget's closure state survives (§3.2).
  const Host = mount(r => {
    renew = r;
    // h() types plain tags; AgentScope's required bridge prop is given here.
    return () =>
      h(AgentScope as unknown as TagFunction, { bridge }, h(Widget, props));
  });

  let destroy: () => void;
  try {
    destroy = render(h(Host, {}), root) as unknown as () => void;
  } catch (error) {
    return fail('mount', error);
  }

  const stop = bridge.subscribe(event => send({ type: 'event', event }));

  // State changes are reported from a microtask after the redraw. Answer
  // after all of them, so the host's state is current when its promise
  // settles (`await callTool()` / `await updateProps()` then `getState()`).
  const settled = () => new Promise(resolve => setTimeout(resolve));

  const unlisten = io.listen(async message => {
    if (message.type == 'call') {
      const result = await bridge.callTool(message.name, message.args);
      await settled();
      try {
        send({ type: 'result', id: message.id, result });
      } catch (error) {
        // A value postMessage cannot clone (a function, a DOM node, ...).
        send({
          type: 'result',
          id: message.id,
          result: {
            ok: false,
            error: {
              code: 'EXECUTION_ERROR',
              message: `"${message.name}" returned a value that cannot be sent: ${messageOf(error)}`,
            },
          },
        });
      }
    } else if (message.type == 'props') {
      props = message.props;
      renew();
      await nextTick();
      await settled();
      send({ type: 'ack', id: message.id });
    }
  });

  send({ type: 'ready', tools: bridge.listTools(), state: bridge.getState() });

  return () => {
    unlisten();
    stop();
    destroy();
  };
};
