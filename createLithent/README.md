# Welcome to Lithent-Ssr-Boilerplate

`Lithent-Ssr-Boilerplate` is a boilerplate designed for building server-side rendering (SSR) websites using the [Lithent](https://superlucky84.github.io/lithent/) UI library.


## Warning

This project is still experimental and is currently tightly coupled with [Express](https://expressjs.com/ko/)

## Usage

### Create a Project

```bash
npx create-lithent-ssr@latest
cd project-name
```

### Install Dependencies

```bash
npm install
```


### Run the Development Server

```bash
npm run dev
```

### Build and Run

The build files will be generated in the `dist` directory.

```bash
npm run build
npm run start
```

### Routing Rules

Routing is determined by the filenames under the `/src/pages/` directory. The routing behavior is as follows:

* `src/pages/index.tsx` maps to the root URL: `http://localhost:3000`.

* A file with a specific name like `one.tsx` will create a static route. For example:
    * `src/pages/one.tsx` maps to `http://localhost:3000/one`.

* Files with dynamic segments are defined by using an underscore (`_`) in the filename. For example:
    * `src/pages/index._type.tsx` maps to a dynamic route like `http://localhost:3000/:type`.

* You can chain dynamic segments for more complex routes. For example:
    * `src/pages/one._type._name.tsx` maps to `http://localhost:3000/one/:type/:name`.

These routing patterns allow you to create both static and dynamic URLs with flexibility in your project structure.

### Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience.

