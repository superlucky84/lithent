# Lithent + Express (SSR)

A server-rendered [Lithent](https://superlucky84.github.io/lithent/) app with
Express, Vite, TypeScript and Tailwind CSS v4. Pages are rendered on the server,
then hydrated in the browser. It ships with a small recipe catalog that shows
the main Lithent patterns; delete the demo when you are ready to build your own
app.

## Getting started

Requires Node.js 20.19 or 22.12+.

```bash
npm install
npm run dev
```

Open http://localhost:3000. pnpm and yarn work too (`pnpm install`, `pnpm dev`).

For production:

```bash
npm run build   # builds into dist/
npm run start   # NODE_ENV=production node server.js
```

## What the demo shows

| Route                | File                                    | Lithent pattern                                     |
| -------------------- | --------------------------------------- | --------------------------------------------------- |
| `/`                  | `src/pages/index.tsx`                   | `mount` + `renew()` next to `lmount` + `lstate`     |
| `/:category`         | `src/pages/index._category.tsx`         | Closure variables as state, `computed`, keyed lists |
| `/:category/:recipe` | `src/pages/index._category._recipe.tsx` | Shared `store` (the header badge follows it)        |

Each page exports a `preload` function. It runs on the server for the first
request and in the browser on client-side navigation; the page reads its result
with `getPreloadData()`. The demo reads local data from `src/data/recipes.ts`;
replace it with your API or database call.

Favorites are saved in `localStorage` and read in `mountCallback`, which runs in
the browser after hydration, so the server and the first client render match.

## Routing

Routes come from the file names in `src/pages/`:

- `index.tsx` → `/`
- `about.tsx` → `/about`
- `index._category.tsx` → `/:category` (an underscore marks a parameter)
- `blog._slug.tsx` → `/blog/:slug`
- `index._category._recipe.tsx` → `/:category/:recipe`

Route parameters arrive as `params` in `preload` and in the page props. Use
`<Link to="/path">` from `src/components/Link.tsx` for internal links: it
renders a real `<a href>` and navigates without a full page load.

`.mdx` files in `src/pages/` become pages too, through `@lithent/lithent-mdx`.

## Project structure

```
server.js              # Express server: one route per page file
serverHelper/          # Server rendering (dev with Vite middleware, prod from dist/)
src/
├── layout.tsx         # <html> shell, header, current page
├── base/              # Client routing, hydration and preload plumbing
├── components/        # Header, Link, Counters, Loading, NotFound, Oops
├── pages/             # One file per route
├── data/recipes.ts    # Demo data
├── favorites.ts       # Shared favorites store
└── main.css           # Tailwind entry
```

## Start your own app

1. Replace the files in `src/pages/` and `src/data/`.
2. Remove `src/favorites.ts` and `src/components/Counters.tsx` if you do not
   need them, and the `<Header />` in `src/layout.tsx`.
3. Keep `src/base/` and `serverHelper/`: they connect the server render to the
   browser.

## Notes

- Component HMR for `.tsx` and `.mdx` files comes from `@lithent/lithent-vite`.
- `state-ref` holds the client router state in `src/base/routeStore.ts`.
- A `preload` that returns `{ notFound: true }` makes the server answer with
  HTTP 404 (the demo pages do this for unknown categories and recipes); the
  page still renders, here as the Not Found component. Addresses that match no
  route get the Not Found page with HTTP 404 too, and a render error gets the
  Oops page with HTTP 500.
