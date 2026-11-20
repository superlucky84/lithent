# Lithent Widget (Custom Element)

A widget that any website can embed with one `<script>` tag and one HTML tag,
whatever the site is built with: a server template, WordPress, React, Vue.
It is a [Lithent](https://superlucky84.github.io/lithent/) component
registered as a standard Custom Element with
[`lithent/element`](https://superlucky84.github.io/lithent/#/guide/element).
Its styles live in Shadow DOM, so the page's CSS does not break it and its CSS
does not leak into the page.

The demo is a feedback card, `<feedback-widget>`. The whole bundle, lithent
included, is about 6 KB brotli.

## Getting started

Requires Node.js 20.19 or 22.12+ (`.nvmrc` selects 24.22.1).

```bash
npm install
npm run dev
```

The dev server opens `index.html`, a page that stands in for a customer's
website. It knows nothing about lithent: it loads the widget, places the tag,
and talks to it through attributes, properties and DOM events. Its buttons
change the page id, switch the labels to Korean, apply a dark theme, and
cancel a submit, and the log shows the events the widget sends.

## Embed it

```html
<script src="https://cdn.example.com/my-widget.js"></script>

<feedback-widget page-id="pricing" question="Was this page helpful?">
  <small slot="footer">We read every message.</small>
</feedback-widget>

<script>
  document
    .querySelector('feedback-widget')
    .addEventListener('feedback-submit', event => {
      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event.detail),
      });
    });
</script>
```

Pages that use ES modules can load `my-widget.mjs` with
`<script type="module">` instead. Both files register the same element.

## The widget's API

| Kind                  | Name                                                                                                                  | Notes                                                                                                                              |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Attribute / property  | `question` / `question`                                                                                               | String                                                                                                                             |
| Attribute / property  | `page-id` / `pageId`                                                                                                  | String. Changing it starts the card over, for single-page sites                                                                    |
| Property or attribute | `labels`                                                                                                              | Object (JSON in the attribute): `question`, `ratings`, `placeholder`, `send`, `thanks`, `again`                                    |
| Event                 | `feedback-rate`                                                                                                       | `detail`: `{ pageId, rating }`                                                                                                     |
| Event                 | `feedback-submit`                                                                                                     | `detail`: `{ pageId, rating, comment }`. Cancelable: `event.preventDefault()` keeps the form open (for example when saving failed) |
| CSS custom properties | `--feedback-accent`, `--feedback-bg`, `--feedback-text`, `--feedback-muted`, `--feedback-border`, `--feedback-radius` | Set them on the element or any ancestor                                                                                            |
| Parts                 | `card`, `send`                                                                                                        | Style with `feedback-widget::part(card)`                                                                                           |
| Slot                  | `footer`                                                                                                              | Page content shown under the form                                                                                                  |

Events bubble and are composed, so a listener on `document` hears them too.

### In React and Vue

The element works like any other HTML tag. Strings and numbers go through
attributes; objects go through properties.

```jsx
// React: listen through a ref (React 19 can also pass `labels={...}` directly)
function Feedback({ pageId }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const onSubmit = event => console.log(event.detail);
    el.addEventListener('feedback-submit', onSubmit);
    return () => el.removeEventListener('feedback-submit', onSubmit);
  }, []);
  return <feedback-widget ref={ref} page-id={pageId} />;
}
```

```html
<!-- Vue 3 (vite.config: vue({ template: { compilerOptions: {
       isCustomElement: tag => tag.includes('-') } } })) -->
<feedback-widget :page-id="pageId" @feedback-submit="onSubmit" />
```

More hosts and details are in the
[Custom Elements guide](https://superlucky84.github.io/lithent/#/guide/element).

## Project structure

```
index.html                 # Dev host page (plays the customer's site)
src/
├── main.ts                # Bundle entry: registers <feedback-widget>
├── FeedbackWidget.tsx     # The component
├── feedbackProps.ts       # Its public contract: props and event details
└── feedback-widget.css    # Shadow DOM styles
scripts/size.mjs           # Size report and budget, run by npm run build
```

## Make it your own

1. **Pick your tag name.** Rename `feedback-widget` in `src/main.ts` and
   `index.html`. Tag names are global on the page and the first definition
   wins, so use a prefix that is yours: `acme-feedback`, not `feedback-card`.
2. **Write the contract first.** `src/feedbackProps.ts` lists what the page
   passes in and what it gets back. Once customers embed the widget, treat a
   change there like a breaking API change.
3. **Build the component** in `src/FeedbackWidget.tsx`. State lives in closure
   variables; call `renew()` to render. Reach the page with
   `emit(props.host, 'event-name', detail)`.
4. **Add more elements** in `src/main.ts` if you need them. They share one copy
   of lithent in the bundle.

The bundle is named after `"name"` in `package.json`: `my-widget` builds
`dist/my-widget.js` and `dist/my-widget.mjs`.

Need the page's own CSS inside the widget, for example a site that styles
everything with a shared design system? Pass `shadow: false` to
`defineElement`. The element then renders into itself, without isolation, and
`styles` is not used.

## Size budget

`npm run build` ends with a size report and fails when `dist/<name>.js` is
larger than the brotli budget at the top of `scripts/size.mjs` (10 KB). Every
byte is downloaded by your customers' visitors, on pages you do not own.
Raise the budget on purpose, not by accident. `npm run size` prints the report
again without building.

## Ship it

`dist/<name>.js` is the only file a page needs (`.map` files are optional).
`dist/index.html` is the demo host page loading that file:
`npm run preview` serves it so you can check the production bundle before
you release it.

- **Your own CDN or static host:** upload `dist/<name>.js` under a versioned
  path, such as `/widget/1.2.0/my-widget.js`, and cache it for a long time.
- **npm + jsDelivr:** remove `"private": true`, set `"version"`, add
  `"files": ["dist"]`, and run `npm publish`. The widget is then at
  `https://cdn.jsdelivr.net/npm/<name>@<version>/dist/<name>.js`.

## Development notes

- **Hot reload.** Editing a component swaps it in place; that component starts
  over with fresh state. Editing `main.ts`, `feedbackProps.ts` or the CSS
  reloads the page instead, because a browser cannot define the same tag
  twice.
- **Browsers.** The build targets ES2020 (Chrome 87, Firefox 78, Safari 14).
  Shadow DOM styles use `adoptedStyleSheets` where the browser has it and a
  `<style>` element otherwise.
- **Content-Security-Policy.** The widget needs neither `'unsafe-eval'` nor
  `'unsafe-inline'` for scripts. Styles need no `'unsafe-inline'` in browsers
  with `adoptedStyleSheets`; older browsers fall back to a `<style>` element,
  which a strict `style-src` blocks.

## Scripts

- `npm run dev` — host page with the widget, hot reload
- `npm run build` — `dist/<name>.js`, `dist/<name>.mjs`, the demo page and the
  size report
- `npm run preview` — serve `dist/` to try the production bundle
- `npm run size` — size report for the last build
- `npm run lint` / `npm run lint:fix` — ESLint
- `npm run format` / `npm run format:check` — Prettier
- `npm run type-check` — TypeScript

## Tech stack

Lithent with `lithent/element`, Vite 8 in library mode, TypeScript, ESLint 9,
Prettier and `@lithent/lithent-vite` for component hot reload. JSX is
configured with `"jsx": "react-jsx"` and `"jsxImportSource": "lithent"` in
`tsconfig.json`.
