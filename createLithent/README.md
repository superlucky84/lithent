# create-lithent

The official scaffolding tool for [Lithent](https://superlucky84.github.io/lithent/#/) projects.

## Quick Start

### Prerequisites

- **Node.js 20.19 or 22.12+** for the Vite 8 templates
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
2. **Template type**: Select one of three options:
   - **SSR (Express)**: Server-side rendering with Express. Ideal for SEO and optimized first-load performance
   - **SPA (Vite)**: Client-side rendering with Vite. Perfect for fast development and simple deployments
   - **Widget (Custom Element)**: A widget other websites embed with one `<script>` tag and one HTML tag, whatever they are built with

The SSR and SPA templates start with the same small recipe catalog: a counter
written in both component styles, client-side routing, search and sorting with
closure state, and favorites shared through a store. The widget template starts
with a feedback card. Each template's README explains how to replace the demo
with your own code.

To skip the prompts, name the template:

```bash
npx create-lithent@latest my-widget --template widget   # or ssr, spa
```

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

This creates an optimized production build in the `./dist` directory. The
widget template builds `dist/<project-name>.js`, the single file a page loads,
and prints its size.

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
- Static hosting (configure an SPA fallback so History API routes serve `index.html`)

### Widget Template (Custom Element)

- A lithent component registered as a standard Custom Element with `lithent/element`
- Shadow DOM styles: the host page's CSS does not break the widget, and the widget's CSS stays inside
- Builds one self-contained `<script>` file (about 6 KB brotli for the demo, lithent included) and an ES module
- A dev host page that uses the widget only through attributes, properties and DOM events
- A size budget that fails the build when the bundle grows past it
- Hot reload for components

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
