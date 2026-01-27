---
title: Props Types
category: reference
version: {{VERSION}}
---

# Props Types

- Props are the **second** argument to the mounter and the **first** argument to the updater.
- The same props reference is preserved for the component’s lifetime.
- For TypeScript, define the props type via a `mount`/`lmount` generic.
- If you destructure props in the mounter, primitive values are copied and won’t update.
  Prefer `props.property` or the updater’s props argument for fresh values.

```tsx
import { mount } from 'lithent';

type Props = { count: number };

const Counter = mount<Props>((renew, props) => {
  return (updaterProps) => (
    <div>
      <p>props: {props.count}</p>
      <p>updater: {updaterProps.count}</p>
    </div>
  );
});
```
