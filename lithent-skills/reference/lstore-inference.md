---
title: lstore Type Inference
category: reference
version: {{VERSION}}
---

# lstore Type Inference

- Defining stores as **objects** is usually better than primitives.
- Grouping related fields improves type inference and clarity.

```tsx
import { lstore } from 'lithent/helper';

const userStore = lstore({
  name: '',
  loggedIn: false,
});
```
