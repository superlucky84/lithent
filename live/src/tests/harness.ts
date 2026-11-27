import { vi } from 'vitest';
import { mountLive } from '@/index';
import type { LiveError, LiveHandle, MountLiveOptions } from '@/index';

/**
 * Test harness for the host controller. jsdom creates the sandbox iframe but
 * does not run its srcdoc, so the tests play the sandbox: they read the
 * channel id from the srcdoc, record what the host posts to the iframe, and
 * answer with MessageEvents whose source is the iframe's window.
 */

/** A runtime that does nothing: the test is the sandbox. */
export const SILENT_RUNTIME = 'window.lithentLiveRuntime={start:function(){}}';

export const TOOLS = [
  {
    name: 'add',
    description: 'Add to the counter',
    inputSchema: {
      type: 'object' as const,
      properties: { by: { type: 'number' } },
      required: ['by'],
      additionalProperties: false as const,
    },
  },
  {
    name: 'reset',
    description: 'Reset the counter',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      additionalProperties: false as const,
    },
    requiresConfirm: true,
  },
];

export const flush = () => new Promise(resolve => setTimeout(resolve));

export type Sandbox = {
  frame: HTMLIFrameElement;
  ch: string;
  /** Messages the host posted to this iframe. */
  sent: Record<string, unknown>[];
  /** Post as this iframe (or as `source`). */
  reply: (message: Record<string, unknown>, source?: unknown) => void;
};

export const sandboxOf = (frame: HTMLIFrameElement): Sandbox => {
  const ch = /"ch":"([a-z0-9]+)"/.exec(frame.srcdoc)![1];
  const sent: Record<string, unknown>[] = [];
  vi.spyOn(frame.contentWindow!, 'postMessage').mockImplementation(
    (message: unknown) => {
      sent.push(message as Record<string, unknown>);
    }
  );
  return {
    frame,
    ch,
    sent,
    reply: (message, source = frame.contentWindow) =>
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { ch, ...message },
          source: source as Window,
        })
      ),
  };
};

/** Start mountLive without settling it. */
export const begin = (options: Partial<MountLiveOptions> = {}) => {
  const container = document.body.appendChild(document.createElement('div'));
  const errors: LiveError[] = [];
  const pending = mountLive({
    code: 'return lmount(() => () => fTags.p({}, "hi"))',
    container,
    runtimeCode: SILENT_RUNTIME,
    onError: error => errors.push(error),
    ...options,
  });
  const frame = container.querySelector('iframe');
  return {
    container,
    errors,
    pending,
    sandbox: frame ? sandboxOf(frame) : undefined,
  };
};

/** Start mountLive and answer `ready` with the given tools and state. */
export const ready = async (
  options: Partial<MountLiveOptions> = {},
  tools: unknown[] = TOOLS,
  state: Record<string, unknown> = { counter: 0 }
) => {
  const started = begin(options);
  started.sandbox!.reply({ type: 'ready', tools, state });
  const handle: LiveHandle = await started.pending;
  return { ...started, sandbox: started.sandbox!, handle };
};

/** Answer the last `call` the host posted with `result`. */
export const answerLastCall = (sandbox: Sandbox, result: unknown) => {
  const call = sandbox.sent.filter(m => m.type == 'call').at(-1)!;
  sandbox.reply({ type: 'result', id: call.id, result });
  return call;
};
