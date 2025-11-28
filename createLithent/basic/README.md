# Lithent + Vite (SPA)

Lithent SPA built on Vite. It uses Tailwind CSS v4, History API routing, and ships a Pokémon type/detail demo. A lightweight custom router is included for now; a dedicated router is planned.

## Scripts
- Install: `pnpm install`
- Dev server: `pnpm dev`
- Build: `pnpm build` (use `pnpm preview` if needed)

## Routes
- `/main`: Pokémon type list (calls PokeAPI)
-/main/:type`: Pokémon list by type
- `/main/:type/:name`: Pokémon detail
Navigates via History API; refresh keeps the same path.

## Key Files
- `src/index.tsx`: entry, loads global styles (`src/input.css`)
- `src/components/Main.tsx`: layout/background wrapper
- `src/components/mainbody.tsx`: path parsing and component switch
- `src/pages/pokemon.tsx`: type list
- `src/pages/pokemonType.tsx`: Pokémon list per type
- `src/pages/pokemonDetail.tsx`: Pokémon detail
- `src/helper/*`: API requests, constants, utilities
- `public/assets`: type icon images

## Stack
- Tailwind v4: `@tailwindcss/vite`, `@tailwindcss/postcss`, `@config` in `src/input.css`
- Lithent HMR: `@lithent/lithent-vite` plugin enabled
- TypeScript JSX: keep `jsx: "react-jsx"` and `jsxImportSource: "lithent"`

## Notes
- Requires network access for PokeAPI calls.
