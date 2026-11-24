# lithent/ssr

Server-side rendering for Lithent. Render a component to an HTML string on the
server, then attach it to the existing markup in the browser instead of
rebuilding the DOM. Import it from the existing `lithent/ssr` entry; it needs
the `lithent` core as a peer dependency.

```ts
import { renderToString, hydration, renderWithHydration } from 'lithent/ssr';
```

## Render on the server, hydrate in the browser

Both sides render the same root component. The root renders the whole
document, so the browser hydrates `document.documentElement`.

```tsx
// App.tsx — shared by the server and the browser
import { mount } from 'lithent';

export const App = mount<{ title: string }>((renew, props) => {
  let count = 0;

  return () => (
    <html>
      <head>
        <title>{props.title}</title>
      </head>
      <body>
        <button
          onClick={() => {
            count += 1;
            renew();
          }}
        >
          Clicked {count}
        </button>
      </body>
    </html>
  );
});
```

```tsx
// server.tsx — returns a string; event handlers are not written to the markup
import { h } from 'lithent';
import { renderToString } from 'lithent/ssr';
import { App } from './App';

export const page = () =>
  `<!doctype html>${renderToString(h(App, { title: 'Hello' }))}`;
```

```tsx
// client.tsx — reuses the server markup and attaches the event handlers
import { h } from 'lithent';
import { hydration } from 'lithent/ssr';
import { App } from './App';

hydration(h(App, { title: 'Hello' }), document.documentElement);
```

Hydrate with the same component and props the server used, so the DOM
`hydration` walks matches the markup the server sent. If they differ,
`hydration` creates the elements the server HTML lacks in the browser and logs
a `console.warn` for each one. Server nodes the component does not render, such
as a loader script, are left in place.

## API

| API                                | Contract                                                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `renderToString(wDom)`             | Returns the HTML string for a `WDom` built with `h`. Event props, `ref` and `key` are left out of the output.    |
| `hydration(wDom, wrapElement)`     | Attaches events and component state to the existing DOM inside `wrapElement` and returns the result of `render`. |
| `renderWithHydration(tagFunction)` | One entry for both sides: hydrates `document.documentElement` in a browser, returns a string on the server.      |

`renderWithHydration` takes a component and renders it with empty props, so use
`renderToString` and `hydration` when the page needs props.

```tsx
import { renderWithHydration } from 'lithent/ssr';
import { Page } from './Page';

// Browser: hydrates the current document.
// Server: returns the HTML string.
const html = renderWithHydration(Page);
```

Text and attribute values are escaped. `innerHTML` is written as is, so pass
only trusted HTML. The `ssr` package also exports a `run` helper, but it exists
only in development builds of `ssr` (it hydrates an internal test component) and
is `undefined` in the published package; do not rely on it.

## Full example

`createLithent/express` is a complete setup: `serverHelper/makePage.js` calls
`renderToString` on the server and `src/base/load.ts` calls `hydration` in the
browser. Scaffold it with `npx create-lithent@latest`. Behavior is also covered by the
tests in [`src/tests`](./src/tests).
