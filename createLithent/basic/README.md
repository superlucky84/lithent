# Lithent + Vite (SPA)

A client-side [Lithent](https://superlucky84.github.io/lithent/) app built with
Vite, TypeScript and Tailwind CSS v4. It ships with a small recipe catalog that
shows the main Lithent patterns; delete the demo when you are ready to build
your own app.

## Getting started

Requires Node.js 20.19 or 22.12+ (`.nvmrc` selects 24.22.1).

```bash
npm install
npm run dev
```

pnpm and yarn work too (`pnpm install`, `pnpm dev`).

## What the demo shows

| Route                | Page                                                   | Lithent pattern                                     |
| -------------------- | ------------------------------------------------------ | --------------------------------------------------- |
| `/`                  | Two counters and the recipe categories                 | `mount` + `renew()` next to `lmount` + `lstate`     |
| `/:category`         | Recipes in a category, with search and sorting         | Closure variables as state, `computed`, keyed lists |
| `/:category/:recipe` | A recipe with a servings control and a favorite button | Shared `store` (the header badge follows it)        |
| anything else        | Not found                                              |                                                     |

Favorites are saved in `localStorage` and read in `mountCallback`, after the
first render.

## Project structure

```
src/
├── index.tsx          # Renders <App /> into #app
├── App.tsx            # Header + the page for the current address
├── router.ts          # Tiny History API router (routeStore, navigate, matchRoute)
├── favorites.ts       # Shared favorites store
├── data/recipes.ts    # Demo data
├── components/        # Header, Link, Counters, NotFound
├── pages/             # Home, Category, RecipeDetail
└── input.css          # Tailwind entry
```

## Start your own app

1. Replace `src/pages/` and `src/data/` with your own pages and data.
2. Update `matchRoute` in `src/router.ts` and the `switch` in `src/App.tsx`.
3. Remove `src/favorites.ts` and `src/components/Counters.tsx` if you do not
   need them.

Use `<Link to="/path">` for internal links: it renders a real `<a href>` and
navigates without a page reload.

## Scripts

- `npm run dev` — dev server with HMR
- `npm run build` — production build into `dist/`
- `npm run preview` — serve the production build
- `npm run lint` / `npm run lint:fix` — ESLint
- `npm run format` / `npm run format:check` — Prettier
- `npm run type-check` — TypeScript

## Deploying

The build is static files in `dist/`. Because routing uses the History API,
configure your host to serve `index.html` for unknown paths (often called an
SPA fallback or rewrite rule).

## Tech stack

Lithent, Vite 8, TypeScript, Tailwind CSS v4, ESLint 9, Prettier and
`@lithent/lithent-vite` for component HMR. JSX is configured with
`"jsx": "react-jsx"` and `"jsxImportSource": "lithent"` in `tsconfig.json`.
