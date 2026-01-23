---
title: Children Type
category: reference
version: {{VERSION}}
---

# Children Type

- Lithent does **not** use `props.children`. Use the separate `children` argument.
- Argument order: `mount(renew, props, children)` and `lmount(props, children)`.
- Children are always `WDom[]`, even with a single child.
- Children are only provided to the mounter; use closure inside the updater.

```tsx
import { mount, WDom } from 'lithent';

const Panel = mount<{ title: string }>((renew, props, children: WDom[]) => {
  return () => (
    <section>
      <h2>{props.title}</h2>
      {children}
    </section>
  );
});
```
