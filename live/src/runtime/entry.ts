import { boot, toLiveError } from '@/runtime/boot';
import type { LiveBootConfig, LiveRpcMessage } from '@/types';

/**
 * The sandbox runtime's entry (`sandboxRuntime.umd.js`, global
 * `lithentLiveRuntime`). The host's srcdoc calls `start(config)` once the
 * script has loaded (docs/agent-ui/DESIGN.md §3.2–§3.4).
 */

/**
 * DC-8 — report the content height whenever it changes, so the host can
 * size the iframe without a second scrollbar. Returns the stop function.
 */
export const watchHeight = (
  target: Element,
  report: (height: number) => void
) => {
  if (typeof ResizeObserver == 'undefined') return () => {};
  let last = -1;
  const observer = new ResizeObserver(() => {
    const height = Math.ceil(target.getBoundingClientRect().height);
    if (height != last) report((last = height));
  });
  observer.observe(target);
  return () => observer.disconnect();
};

export const start = (config: LiveBootConfig) => {
  // The host page's origin; '*' only when it has none (file: pages).
  const target = config.origin && config.origin != 'null' ? config.origin : '*';
  const post = (message: LiveRpcMessage) => parent.postMessage(message, target);

  // Errors after start (event handlers, later renders) reach the host too.
  const report = (error: unknown) =>
    post({ ch: config.ch, type: 'error', error: toLiveError('render', error) });
  addEventListener('error', event => report(event.error || event.message));
  addEventListener('unhandledrejection', event => report(event.reason));

  boot(config, document.getElementById('root') || document.body, {
    post,
    listen: handler => {
      // Only the host, on this session's channel (§3.3).
      const onMessage = (event: MessageEvent) => {
        const data = event.data as LiveRpcMessage | undefined;
        if (event.source === parent && data && data.ch === config.ch) {
          handler(data);
        }
      };
      addEventListener('message', onMessage);
      return () => removeEventListener('message', onMessage);
    },
  });

  if (config.resize) {
    watchHeight(document.documentElement, height =>
      post({ ch: config.ch, type: 'resize', height })
    );
  }
};
