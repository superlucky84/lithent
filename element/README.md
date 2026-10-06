# lithent/element

Register a lithent component as a standard Custom Element and embed it in any
page — plain HTML, server-rendered templates, React, Vue — with a script and a
tag. Ships inside the `lithent` package (since 1.23.0); 935 B brotli on top of
the core.

**📖 Guide with a live demo:** [English](https://superlucky84.github.io/lithent/#/guide/element) · [한국어](https://superlucky84.github.io/lithent/#/ko/guide/element)

```tsx
import { mount } from 'lithent';
import { defineElement, emit } from 'lithent/element';

const PayButton = mount<{ amount?: number; host: HTMLElement }>(
  (_renew, props) => () => (
    <button onClick={() => emit(props.host, 'pay', { amount: props.amount })}>
      Pay {props.amount}
    </button>
  )
);

defineElement('pay-button', PayButton, {
  props: { amount: Number },
  styles: ['button { background: var(--pay-color, #0064ff); color: white; }'],
});
```

```html
<script src="https://cdn.jsdelivr.net/npm/lithent/dist/lithent.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lithent/element/dist/lithentElement.umd.js"></script>
<!-- your widget script, using window.lithent and window.lithentElement -->

<pay-button amount="1000"></pay-button>
```

## At a glance

|           |                                                                                                                 |
| --------- | --------------------------------------------------------------------------------------------------------------- |
| Props     | `String`, `Number`, `Boolean`, `Object` — kebab-case attributes (converted) and properties (as is)              |
| Events    | `props.host` + `emit(host, name, detail)` — bubbling, composed, cancelable                                      |
| Styles    | Open shadow root by default; `styles` shared through one adopted sheet; theme with CSS variables and `::part()` |
| Children  | `<slot>` in shadow mode; `shadow: false` renders into the element itself                                        |
| Lifecycle | Moves keep state; removal unmounts after a microtask; `undefined` without `customElements` (SSR)                |
| Cores     | Base and `lithent-concurrent`                                                                                   |

## Hand-test playground

A cat café page that hosts the widget, with ten numbered steps (upgrade,
attributes, batched renders, object properties, events, CSS isolation, slots,
moves, remove/re-add, duplicate definition) and automatic ✅/❌ checks:

```bash
pnpm playground:element   # builds the cores, the element and the playground
open element/playground/dist/playground.html            # base core, no server needed
open element/playground/dist/playground-concurrent.html # concurrent core
```

Sources: `element/playground/`. The playground is also built by
`pnpm build:element` and walked through by `e2e/element.spec.ts`.

Design notes and test records: [docs/element](../docs/element/).
