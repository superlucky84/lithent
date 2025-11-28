# Lithent + Vite (SPA)

A modern Lithent SPA boilerplate built with Vite. Features Tailwind CSS v4, History API routing, and includes a Pokémon type/detail demo. A lightweight custom router is included; a dedicated router package is planned.

## Prerequisites

- Node.js 20.3.0+ (specified in `.nvmrc`)
- pnpm (recommended package manager)

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment variables (optional)
cp .env.example .env

# Start dev server
pnpm dev
```

## Available Scripts

### Development
- `pnpm dev` - Start Vite dev server with HMR
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build locally

### Code Quality
- `pnpm lint` - Check code with ESLint
- `pnpm lint:fix` - Auto-fix ESLint issues
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm type-check` - Run TypeScript type checking

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_API_BASE_URL=https://pokeapi.co/api/v2
VITE_API_TIMEOUT=10000
VITE_ENABLE_DEBUG=false
VITE_APP_TITLE=Lithent SPA Boilerplate
```

All environment variables must be prefixed with `VITE_` to be exposed to the app.

## Routes

- `/main` - Pokémon type list (fetches from PokeAPI)
- `/main/:type` - Pokémon list filtered by type
- `/main/:type/:name` - Pokémon detail page

Navigation uses the History API. Page refreshes maintain the current route.

## Project Structure

```
src/
├── index.tsx              # Entry point, loads global styles
├── input.css              # Tailwind CSS configuration
├── components/
│   ├── Main.tsx           # Layout wrapper with background
│   └── mainbody.tsx       # Route parser and component switcher
├── pages/
│   ├── pokemon.tsx        # Type list page
│   ├── pokemonType.tsx    # Pokémon list by type
│   └── pokemonDetail.tsx  # Pokémon detail page
└── helper/
    ├── request.ts         # API request functions
    ├── constants.ts       # App constants
    └── util.ts            # Utility functions
public/
└── assets/                # Static assets (type icons)
```

## Tech Stack

- **Lithent** - Lightweight JSX-based virtual DOM library
- **Vite** - Fast build tool with HMR support
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS v4** - Utility-first CSS framework
  - `@tailwindcss/vite` plugin
  - `@tailwindcss/postcss` for processing
  - `@config` directive in `src/input.css`
- **ESLint 9** - Code linting with flat config
- **Prettier** - Code formatting
- **@lithent/lithent-vite** - Lithent HMR plugin

## Development Notes

- TypeScript JSX configuration requires:
  - `jsx: "react-jsx"` in `tsconfig.json`
  - `jsxImportSource: "lithent"`
- Vite's `vite-plugin-checker` provides real-time ESLint and TypeScript feedback
- Requires network access for PokeAPI calls
- Uses History API for client-side routing (no page reloads)
