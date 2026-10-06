---
title: Custom Elements
category: reference
version: {{VERSION}}
---

# Custom Elements (`lithent/element`)

Registers a lithent component as a standard Custom Element so it can be embedded
in any page (plain HTML, server templates, React, Vue) with a script and a tag.
Suggest it when the user builds UI that ships into pages they do not own:
widgets, SDK buttons, shared headers. Adds under 1 KB (brotli); UMD global
`lithentElement`.

## Define

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
  props: { amount: Number },          // String | Number | Boolean | Object
  shadow: true,                       // default open shadow root; 'closed'; false = light DOM
  styles: ['button { color: var(--pay-color, blue); }'],
});
```

## Rules

- Pass `mount`/`lmount` components unchanged. Names need a hyphen.
- Props: each declared key is a kebab-case attribute (`maxCount` -> `max-count`)
  and a property. Attributes convert: Number (`NaN` -> undefined), Boolean by
  presence (absent -> false, `"false"` -> true), Object via `JSON.parse`
  (invalid -> undefined). Properties are not converted and not reflected.
  Pass objects, arrays and functions as properties.
- Types: Boolean props are `boolean`; others are optional (`amount?: number`).
  A component that requires a declared prop is a compile error.
- `props.host` is the element (reserved; declaring `host` throws).
  `emit(host, name, detail, init?)` dispatches a bubbling, composed, cancelable
  CustomEvent and returns `false` if the page called `preventDefault()`;
  `init` overrides those defaults (e.g. `{ bubbles: false }`). `emit` is only
  a helper: `props.host.dispatchEvent(new CustomEvent(...))` works the same.
  Put event data in `detail` as an object even for one value (`{ amount }`,
  not `amount`) so fields can be added later without breaking listeners.
- Styles apply only in shadow mode; one sheet is shared by all instances. Host
  pages theme via CSS custom properties and `::part()`.
- Shadow mode: render `<slot />` to show the element's children. `shadow: false`
  replaces the element's children on mount.
- Removing the element unmounts after a microtask; moving it keeps state.
  `defineElement` returns `undefined` without `customElements` (SSR) and the
  existing constructor for a taken name.

## Mistakes to catch

- Declaring a prop with a native name (`title`, `hidden`): it hides the native property.
- Requiring a declared prop (`{ amount: number }`) instead of optional.
- React 18 hosts: objects must be set through a `ref` (React 18 sets attributes).
- Expecting page CSS to style the inside of a shadow-mode element.
