---
title: Testing
category: reference
version: {{VERSION}}
---

# Testing (`lithent/test`)

Renders a component into the test document, waits until lithent has drawn the
result of an action, and takes everything down after the test. No
dependencies; queries and events come from `@testing-library/dom` (optional),
which works as is on the DOM lithent renders. Needs a DOM environment (jsdom or
happy-dom).

## Setup

```sh
npm install --save-dev vitest jsdom @testing-library/dom
```

```ts
// vite.config.ts or vitest.config.ts
export default { test: { environment: 'jsdom' } };
```

Without Vitest `globals: true` (the default), add the cleanup yourself:

```ts
import { afterEach } from 'vitest';
import { cleanup } from 'lithent/test';

afterEach(() => cleanup());
```

## A test

```tsx
import { expect, it } from 'vitest';
import { screen, fireEvent } from '@testing-library/dom';
import { render, act } from 'lithent/test';
import { Counter } from './Counter';

it('counts clicks', async () => {
  render(<Counter />);
  await act(() => fireEvent.click(screen.getByRole('button', { name: '+1' })));
  expect(screen.getByText('count: 1')).toBeTruthy();
});
```

`renew()` draws in a microtask: right after an event the DOM has not changed
yet. Run the action inside `act`, or `await act()` after it, then assert.

## API

| API                                        | Contract                                                                                                                                                                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `render(ui, { container?, baseElement? })` | Renders into a new `<div>` appended to `document.body` (or `baseElement`), or into `container`. Returns `{ container, baseElement, unmount }`. The first render and its `mountCallback`s finish before it returns. |
| `await act(fn?)`                           | Runs `fn`, then waits until lithent has drawn everything it caused; resolves with `fn`'s result. Without `fn` it only waits.                                                                                       |
| `cleanup()`                                | Takes down every rendered tree. Registered with `afterEach` automatically when that is a global; `LITHENT_TEST_SKIP_AUTO_CLEANUP=1` turns it off.                                                                  |

`act` waits for renders from `renew()`, `lithent/helper` stores and
`mountCallback`s (any depth), and with `lithent` aliased to `lithent-concurrent`
also for `deferRender` work. It keeps working under fake timers. It does not
wait for the code's own timers or requests: use `findBy*` / `waitFor` or fake
timers for those.

## Rules

- Wrap events and `user-event` calls in `act`: `await act(() => user.type(input, 'Ada'))`.
- `render` again appends a second tree. To change props, render a parent that
  owns the value and change it inside `act`.
- Do not hand-roll `setTimeout` loops or `await nextTick()` chains to wait for
  renders; `nextTick` covers one microtask only.
- Import `lithent/test` in tests only; it is not for application code.
