---
title: Common Mistakes
category: constraints
version: {{VERSION}}
---

# Common Mistakes

- Destructuring props in the mounter and expecting primitive values to update.
- Using `props.children` instead of the `children` argument.
- Swapping argument order for `mount` or `lmount`.
- Calling `state`/`lstate` outside the mounter (e.g., in updaters/handlers).
- Using `state` with `lmount` or `lstate` with `mount`.
- Creating `store`/`lstore` inside components (new store per render).
- Mutating arrays or nested objects directly instead of replacing references.
