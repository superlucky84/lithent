# lithent/live

Run widget code an LLM wrote, with no build step, and keep driving it after
people use it. The code runs in a sandboxed iframe; its `agentAction` and
`agentState` reach the host through the same `AgentBridge` as
[`lithent/agent`](../agent/README.md), so a model can read the live state a
person left and change it, instead of generating the widget again. Ships inside
the `lithent` package: the host controller is about 5 KB brotli, the sandbox
runtime (`lithent/live/runtime`) about 8.5 KB.

**Design and test records:** [docs/agent-ui](../docs/agent-ui/)

```ts
import { mountLive } from 'lithent/live';
import { sandboxRuntimeCode } from 'lithent/live/runtime';

const code = `
return lmount(props => {
  const count = lstate(props.start || 0);
  agentAction({
    name: 'add',
    description: 'Add to the counter',
    params: { by: { type: Number, required: true } },
    run: ({ by }) => { count.value += by; return count.value; },
  });
  agentState('counter', () => ({ count: count.value }));
  return () => fTags.button({ onClick: () => count.value++ }, 'Count ' + count.value);
});`;

const handle = await mountLive({
  code,
  container: document.getElementById('widget')!,
  runtimeCode: sandboxRuntimeCode,
  props: { start: 1 },
});

// A person clicks; then the model reads and acts on the same state.
handle.bridge.getState(); // { counter: { count: 3 } }
await handle.bridge.callTool('add', { by: 10 }); // { ok: true, value: 13 }
```

## At a glance

|             |                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Code        | A function body that returns a component; `fTags` / `lTag`, no JSX, no imports (`lmount`, `lstate`, `agentAction`, ... are in scope) |
| Sandbox     | `iframe sandbox="allow-scripts"` (opaque origin), CSP without network unless `allowNetwork: true`                                    |
| Runtime     | `runtimeCode: sandboxRuntimeCode` (no request) or `runtimeUrl`; neither: a clear error, nothing loaded                               |
| Bridge      | `handle.bridge` is an `AgentBridge`: `listTools`, `getState`, `callTool`, `subscribe`, `setConfirmHandler`                           |
| Approval    | `confirm: true` actions ask the host's `setConfirmHandler` before the call reaches the sandbox                                       |
| Errors      | `mountLive` / `reload` reject with `{ phase, message, hint? }`; `hint` names the fix (JSX, imports, missing `return`, ...)           |
| Handle      | `updateProps` (keeps closure state), `reload(code)`, `destroy()`                                                                     |
| Layout      | `autoResize` (default on) fits the iframe height; `theme` passes CSS custom properties; `styles`                                     |
| Direct mode | `mode: 'direct'` runs trusted code in this page, in a shadow root, with the page's lithent                                           |
| Tag         | `defineLiveElement()` registers `<lithent-live>`                                                                                     |

## `<lithent-live>`

```html
<lithent-live
  id="w"
  code="return lmount(() => () => fTags.p({}, 'hi'))"
></lithent-live>
<script type="module">
  import { defineLiveElement } from 'lithent/live';
  import { sandboxRuntimeCode } from 'lithent/live/runtime';

  defineLiveElement();
  const el = document.getElementById('w');
  el.runtimeCode = sandboxRuntimeCode; // or the runtime-url attribute
  el.props = { start: 1 };
  el.addEventListener('live-ready', e =>
    console.log(e.detail.bridge.listTools())
  );
  el.addEventListener('live-error', e => console.log(e.detail.hint));
</script>
```

Attributes: `code`, `mode`, `runtime-url`, `allow-network`. Properties: the
same plus `props`, `styles`, `theme`, `runtimeCode`, `autoResize`, `timeoutMs`
and the read-only `bridge`. Changes in one task apply together: new `props`
update the widget, new `code` reloads it, anything else restarts it. The tag
needs no lithent core when it only shows sandboxed widgets.

In React 18, which sets attributes on custom elements, set object properties
such as `props` in `useLayoutEffect` (or a ref callback): it runs in the same
task as the render, so the widget starts with them. A `useEffect` runs later
and only updates a widget that has already set up its state.

## Without a bundler

```html
<script src="https://cdn.jsdelivr.net/npm/lithent/live/dist/lithentLive.umd.js"></script>
<script>
  lithentLive.mountLive({
    code,
    container,
    runtimeUrl:
      'https://cdn.jsdelivr.net/npm/lithent/live/dist/sandboxRuntime.umd.js',
  });
</script>
```

`mode: 'direct'` from the UMD build also needs `lithent`, `lithentHelper`,
`lithentFTags`, `lithentTag` and `lithentAgent` loaded first.

## Limits

- The sandbox document inherits the host page's CSP: a host policy that blocks
  `'unsafe-eval'` or inline scripts stops the widget.
- Values cross with `postMessage`: tool results and state must be cloneable
  (JSON-safe is best).
- `mode: 'direct'` shares the page's JavaScript context: never use it for
  untrusted model output.
