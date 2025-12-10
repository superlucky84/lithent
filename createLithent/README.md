# create-lithent

The official scaffolding tool for [Lithent](https://superlucky84.github.io/lithent/#/) projects.

## Quick Start

### Prerequisites

- **Node.js 18.12** or higher
- Basic command line experience

### Creating a New Project

Run the following command in your terminal:

```bash
npx create-lithent@latest
```

This command installs and runs `create-lithent`, which will guide you through the project setup process.

### Setup Process

The CLI will prompt you for:

1. **Project name**: Choose a name for your project directory
2. **Template type**: Select between two options:
   - **SSR (Express)**: Server-side rendering with Express. Ideal for SEO and optimized first-load performance
   - **SPA (Vite)**: Client-side rendering with Vite. Perfect for fast development and simple deployments

### Installation and Development

Once scaffolded, navigate to your project and start developing:

```bash
cd <your-project-name>
npm install
npm run dev
```

Your Lithent project will be running locally. The default template uses JSX for component markup.

### Building for Production

When ready to deploy:

```bash
npm run build
```

This creates an optimized production build in the `./dist` directory.

For **SSR projects**, start the production server with:

```bash
npm run start
```

## Template Features

### SSR Template (Express)

- Server-side rendering with Express
- File-based routing in `/src/pages/`
- MDX support via `@lithent/lithent-mdx`
- Hot Module Replacement (HMR)
- Tailwind CSS pre-configured
- State management with [state-ref](https://github.com/superlucky84/state-ref)

#### Routing Rules

Routing is determined by filenames under `/src/pages/`:

- `src/pages/index.tsx` → `http://localhost:3000/`
- `src/pages/one.tsx` → `http://localhost:3000/one`
- `src/pages/index._type.tsx` → `http://localhost:3000/:type`
- `src/pages/one._type._name.tsx` → `http://localhost:3000/one/:type/:name`

Dynamic segments use underscore (`_`) prefix.

#### MDX Support

Drop `.mdx` files in `src/pages/` and they compile automatically:

```bash
src/pages/docs.mdx → http://localhost:3000/docs
```

Hot reload works seamlessly with MDX files.

### SPA Template (Vite)

- Pure client-side rendering
- Vite-powered development
- Fast HMR and build times
- Tailwind CSS pre-configured
- Ideal for GitHub Pages and static hosting

## Using Lithent from CDN

You can use Lithent without a build step by loading it from a CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/lithent/dist/lithent.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lithent/ftags/dist/lithentFTags.umd.js"></script>
```

Use `ftags` or `htm` for templates when working without JSX.

**[📦 View all available CDN URLs](https://superlucky84.github.io/lithent/#/guide/quick-start)**

## Documentation

- **[Full Documentation](https://superlucky84.github.io/lithent/#/)** - Complete guide and API reference
- **[Quick Start Guide](https://superlucky84.github.io/lithent/#/guide/quick-start)** - Detailed setup instructions
- **[Examples](https://superlucky84.github.io/lithent/#/examples/1)** - Live examples and patterns

## License

MIT © [superlucky84](https://github.com/superlucky84)
