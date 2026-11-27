import { boot, toLiveError } from '@/runtime/boot';
import type { LiveBootConfig, LiveRpcMessage } from '@/types';

/**
 * The sandbox runtime's entry (`sandboxRuntime.umd.js`, global
 * `lithentLiveRuntime`). The host's srcdoc calls `start(config)` once the
 * script has loaded (docs/agent-ui/DESIGN.md §3.2–§3.4).
 */
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
};
