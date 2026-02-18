---
title: Troubleshooting
category: constraints
version: {{VERSION}}
---

# Troubleshooting

- **Props look stale:** avoid destructuring props in the mounter; read `props.x` directly or use the updater’s props argument.
- **Children missing:** use the `children` argument (not `props.children`); remember children are only passed to the mounter.
- **Updates not rendering:** don’t mutate arrays/objects in place—assign a new array or replace first‑level properties.
- **State doesn’t react:** `state` requires `mount` + `renew`; `lstate` requires `lmount` and is mounter‑only.
- **Stores reset unexpectedly:** define `store`/`lstore` outside components and reuse them.
