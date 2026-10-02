---
title: Concurrent Rendering
category: reference
version: {{VERSION}}
---

# Concurrent Rendering (`lithent-concurrent`)

Optional, separate package. It is an interface-compatible build of the core that
can pause low-priority render work. Suggest it only when the user has a screen
with very large component trees (thousands of rows) where heavy rendering blocks
input, or when `lithent-concurrent` is already installed. Measured on 2026-10-02
(typing into a filter): input latency 143 -> 25 ms at 5,000 rows and 515 -> 46 ms at
20,000 rows; no real benefit at 1,000 rows. Commits cannot be split, so tell the user
to measure. For ordinary screens use plain `lithent`.

## Setup

```bash
npm install lithent@^1.22.1 lithent-concurrent@^0.1.0
```

Select the core with a bundler alias that matches **exactly** `lithent`:

```ts
// vite.config.ts
export default {
  resolve: {
    alias: [{ find: /^lithent$/, replacement: 'lithent-concurrent' }],
  },
};
```

- Never use a prefix alias: it also rewrites `lithent/helper` and `lithent/jsx-runtime`.
- Keep `lithent/helper`, `lithent/jsx-runtime`, `lithent/ssr` etc. unchanged.
- For SSR apply the same alias to the server and the client build.
- If the core is externalized, `replacement` stays in the output import: use the
  package name `lithent-concurrent`, never a file path.
- Import the new APIs from `lithent-concurrent` so TypeScript finds the types.

## API

```tsx
import { mount, deferRender, whenIdle, nextTick } from 'lithent-concurrent';
import { deferred, ldeferred, hasPendingRender } from 'lithent-concurrent/helper';
```

- `deferRender(scope)` runs `scope` **synchronously**; only the renders it causes
  are queued as low priority. State writes are still immediate.
- `whenIdle()` resolves when the low-priority lane is empty. `await nextTick()`
  only covers synchronous commits. Neither guarantees browser paint or network.
- `deferred(value, renew)` / `ldeferred(value)`: `state`/`lstate` whose setter
  schedules a low-priority render (`.value` and `.v` are the same value).
- `hasPendingRender()` (mounter only): is this component's render queued?
  It is a query, not reactive; it never schedules a render.
- `hasPending(compKey, lane?)` is the low-level query behind it.

## Rules

1. Put urgent input state and the heavy list in **different components**. A
   synchronous render of the same component shows the new value immediately and
   absorbs the queued low-priority work, so deferring has no effect.
2. The priority scope ends when the callback returns: wrap updates after an
   `await` in a new `deferRender`.
3. Heavy computation inside the callback still blocks; only rendering is sliced.
4. Show pending state from a synchronously rendered parent or sibling.
5. Commits are synchronous and atomic. There is no Suspense, `use()` or
   lane-specific state snapshot; a thrown Promise is an ordinary exception.

## Lifecycle differences from the base core

- `mountCallback` runs once after the complete commit (children before parents);
  unmount cleanup runs parent before child.
- `updateCallback` body runs during the build; its returned function runs after
  that commit and is **not** an unmount cleanup. Use the `mountCallback` return
  value or `effect()` for cleanup.
- Side effects belong in `mountCallback`, not the mounter body.

## Example

```tsx
import { mount, deferRender } from 'lithent-concurrent';

let updateList: (query: string) => void = () => {};

const HeavyList = mount(renew => {
  let query = '';
  updateList = next => deferRender(() => { query = next; renew(); });
  return () => (
    <ul>{Array.from({ length: 10000 }, (_, i) => <li key={i}>{query}:{i}</li>)}</ul>
  );
});

const Input = mount(renew => {
  let text = '';
  return () => (
    <input value={text} onInput={(e: Event) => {
      text = (e.target as HTMLInputElement).value;
      updateList(text); // deferred, separate component
      renew();          // urgent, input only
    }} />
  );
});
```
