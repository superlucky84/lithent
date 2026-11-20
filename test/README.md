# lithent/test

Render, wait for and clean up lithent components in tests. It ships inside the
`lithent` package and has no dependencies.

Lithent renders real DOM, so finding elements and firing events is left to
[`@testing-library/dom`](https://testing-library.com/docs/dom-testing-library/intro)
(optional). `lithent/test` adds what is specific to lithent:

- `render(ui, options?)` renders into a container attached to the document and
  returns `{ container, baseElement, unmount }`.
- `await act(fn?)` runs `fn`, then waits until lithent has drawn everything it
  caused, and resolves with `fn`'s result. Without `fn` it only waits.
- `cleanup()` takes down every tree `render` created. It runs after each test
  automatically when the test runner provides `afterEach` as a global.

## Setup

```sh
npm install --save-dev vitest jsdom @testing-library/dom
```

Vitest 5 needs `@types/node` 22 or later. If npm reports a conflict over
`@types/node` (projects created with earlier `create-lithent` templates have
version 20), update it with `npm install --save-dev @types/node@22`.

```js
// vite.config.js (or vitest.config.js)
export default {
  test: { environment: 'jsdom' },
};
```

Vitest does not expose `afterEach` as a global unless `globals: true` is set.
Without it, clean up yourself:

```ts
import { afterEach } from 'vitest';
import { cleanup } from 'lithent/test';

afterEach(() => cleanup());
```

## Example

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

`renew()` draws in a microtask, so right after the click the DOM has not
changed yet. Wrap the action in `act`, or call `await act()` after it.
`@testing-library/user-event` works the same way:
`await act(() => user.type(input, 'Ada'))`.

## What `act` waits for

- Renders started by `renew()`, by `lithent/helper` stores and by
  `mountCallback`s, however many microtasks deep.
- With the concurrent core (`lithent` aliased to `lithent-concurrent`), also
  `deferRender` work, which the scheduler splits across tasks.

It does not wait for your own timers or requests. Use `findBy*` / `waitFor`
from `@testing-library/dom`, or fake timers; `act` keeps working under
`vi.useFakeTimers()`.

## Changing props

Calling `render` again appends a second tree; it does not update the first.
To test a prop change, render a parent that owns the value:

```tsx
let setLabel = (_: string) => {};
const Host = mount(renew => {
  let label = 'first';
  setLabel = next => {
    label = next;
    renew();
  };
  return () => <Badge label={label} />;
});

render(<Host />);
await act(() => setLabel('second'));
```

## Options

| Option        | Default                                    | Notes                             |
| ------------- | ------------------------------------------ | --------------------------------- |
| `container`   | a new `<div>` appended to `baseElement`    | Emptied, not removed, on unmount  |
| `baseElement` | `container` if given, else `document.body` | Where a new container is appended |

Set `LITHENT_TEST_SKIP_AUTO_CLEANUP=1` to stop the automatic `afterEach`
registration.
