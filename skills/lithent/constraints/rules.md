---
title: Rules
category: constraints
version: {{VERSION}}
---

# Rules

- Use `state` with `mount` and pass `renew` as the second argument.
- Use `lstate` with `lmount` (no `renew` argument is needed).
- Call `state`/`lstate` only inside the mounter (not in updaters or handlers).
- Use `store` with `mount`, `lstore` with `lmount`, and create stores outside components.
- `store` is shallow‑reactive: replace first‑level properties or arrays to update.
- Don’t rely on `props.children`; use the separate `children` argument.
- Argument order is `mount(renew, props, children)` and `lmount(props, children)`.
- Avoid destructuring props in the mounter if you need live updates.
