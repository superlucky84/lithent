---
title: Generative UI Widgets
category: reference
version: { { VERSION } }
---

# Generative UI widgets (`lithent/live`)

Runs widget code an LLM wrote, with no build step, in a sandboxed iframe, and
connects its `agentAction` / `agentState` back to the host through the same
`AgentBridge` as `lithent/agent`. Suggest it when an app lets a model create a
small interactive UI (a chart filter, a calculator, a form) that people then
use and the model keeps driving. Host controller about 4.5 KB brotli; the
sandbox runtime (`lithent/live/runtime`) about 8.5 KB.

## Host side

```ts
import { mountLive } from 'lithent/live';
import { sandboxRuntimeCode } from 'lithent/live/runtime';

const handle = await mountLive({
  code, // the generated function body (below)
  container: document.getElementById('widget'),
  runtimeCode: sandboxRuntimeCode, // or runtimeUrl: '.../sandboxRuntime.umd.js'
  props: { currency: 'KRW' },
  theme: { '--brand': '#0064ff' }, // CSS custom properties
  onError: error => sendBackToModel(error), // { phase, message, hint? }
});

handle.bridge.listTools(); // JSON Schema tools for the model
await handle.bridge.callTool('set_filter', { status: 'done' });
handle.bridge.getState(); // current state, after the call
await handle.updateProps({ currency: 'USD' }); // closure state is kept
await handle.reload(fixedCode); // fresh sandbox, same bridge
handle.destroy();
```

`mountLive` rejects with the `LiveError` when the code does not start; send
`message` and `hint` back to the model and call `mountLive` (or `reload`)
again. `callTool` never throws: `{ ok: false, error: { code, message } }`.

One tag instead, in any framework: `defineLiveElement()` registers
`<lithent-live code="..." runtime-url="...">`; set `runtimeCode`, `props`,
`theme` as properties; listen to `live-ready` (`detail.bridge`) and
`live-error`; call `el.bridge`.

## The code the model writes

The code is the **body of a function**. It must `return` a component. These
names are already in scope; nothing else is:

`mount`, `lmount`, `h`, `Fragment`, `ref`, `mountCallback`, `updateCallback`,
`nextTick`, `state`, `lstate`, `computed`, `effect`, `store`, `lstore`,
`fTags`, `fFragment`, `fMount`, `flMount`, `lTag`, `agentAction`,
`agentState`.

```js
return lmount(props => {
  const status = lstate('all');
  const { div, button, p } = fTags;

  agentAction({
    name: 'set_filter',
    description: 'Show orders with this delivery status',
    params: {
      status: {
        type: String,
        enum: ['all', 'delayed', 'done'],
        required: true,
      },
    },
    run: ({ status: next }) => {
      status.value = next;
      return next;
    },
  });
  agentState('filter', () => ({ status: status.value }));

  const pick = next => () => {
    status.value = next;
  };
  return () =>
    div(
      { class: 'box' },
      p({}, `Showing: ${status.value} (${props.currency})`),
      button({ onClick: pick('delayed') }, 'Delayed'),
      button({ onClick: pick('all') }, 'All')
    );
});
```

Rules for generated code:

- Plain JavaScript. **No JSX, no `import`, no `export`.** Build markup with
  `fTags.tag(props, ...children)` or ``lTag`<div>...</div>` ``.
- Start with `return lmount(props => { ... return () => ... })`. State goes in
  the mounter (`lstate` re-renders by itself); the returned function renders.
- Child components: `const Row = flMount(props => () => p({}, props.text))`,
  used as `Row({ text: 'a' })`.
- Declare `agentAction` / `agentState` in the mounter. Names and scope ids use
  `[a-zA-Z0-9_-]` only. Mark destructive actions `confirm: true` (the host
  approves). Return JSON-safe values from `run` and the state getters.
- Read host data from `props`; style with CSS variables the host sets
  (`var(--brand)`). The sandbox has no network, no host DOM, cookies or
  storage: do not use `fetch`, `parent`, `localStorage`.
- Not React: no `useState`, `useEffect`, `ReactDOM.render`. Do not call
  `render` yourself.

## Modes and safety

- `mode: 'sandbox'` (default): `iframe sandbox="allow-scripts"`, opaque origin,
  CSP without network (`allowNetwork: true` lifts the CSP). Needs
  `runtimeCode` or `runtimeUrl`; without them it fails and loads nothing.
- `mode: 'direct'`: runs the code in this page, in a shadow root, with the
  page's lithent. Only for code you trust (it warns once).
- The iframe height follows the content (`autoResize`, default on).
- A strict host-page CSP that blocks `'unsafe-eval'` or inline scripts also
  applies to the sandbox document and stops it.

## Mistakes to catch

- JSX, `import`/`export` or a missing `return` in generated code: the
  `LiveError.hint` says which; feed it back to the model.
- Forgetting `runtimeCode` / `runtimeUrl` in sandbox mode.
- Using `mode: 'direct'` for untrusted model output.
- Reading `result.value` from `callTool` without checking `result.ok`.
