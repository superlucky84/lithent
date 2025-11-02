# Lithent Template Parser

Lithent Template Parser converts Lithent-specific template syntax into plain
JavaScript `h()` calls. The compiler powers both the standalone parser APIs and
any tooling that needs to transform JSX-like markup into Lithent render
functions.

## Highlights

- **End-to-end pipeline** – lexer → parser → transformer → code generator with
  TypeScript definitions for every stage.
- **Document transformer** – `transformDocument()` scans an entire source file,
  replaces inline templates, and returns code plus optional source maps.
- **Directive support** – `l-if`, `l-else-if`, `l-else`, `l-for`, fragments,
  refs, interpolations, event handlers, and boolean/static/dynamic props.
- **Batteries included** – over 90 Vitest specs, playground, and tree-shakable
  exports for advanced tooling.

## Installation

```bash
pnpm add @lithent/lithent-template-parser
```

## Quick Start

```ts
import { compile } from '@lithent/lithent-template-parser';

const template = `
  <div class="todo-list">
    <h2>Todos ({todos.length})</h2>
    <ul>
      <li l-for={(todo, index) in todos}>
        <span class="index">{index + 1}.</span>
        <span>{todo.text}</span>
      </li>
    </ul>
  </div>
`;

const result = compile(template);
console.log(result.code);
```

Output:

```js
h('div', { class: 'todo-list' },
  h('h2', null, 'Todos (', todos.length, ')'),
  h('ul', null,
    (todos).map((todo, index) =>
      h('li', null,
        h('span', { class: 'index' }, index + 1, '.'),
        h('span', null, todo.text)
      )
    )
  )
);
```

## Document Transformation

The `docPipe` helpers expose a higher-level API for tooling such as the Vite
plugin:

```ts
import { transformDocument } from '@lithent/lithent-template-parser';

const source = `
const View = () => (
  <section class="profile">
    <Avatar l-if={user.avatar} src={user.avatar} />
    <strong>{user.name}</strong>
    <p l-else>No avatar</p>
  </section>
);
`;

const { code, map, transformed } = transformDocument(source, {
  source: 'profile.ltsx',
  generateSourceMap: true,
});

console.log(transformed); // true
console.log(code);
```

The result keeps non-template code untouched while replacing all template
regions with generated `h()` calls. When `generateSourceMap` is `true`, the
returned source map is compatible with downstream tooling (e.g. Vite, Rollup).

## Template Syntax Overview

| Feature | Example |
| --- | --- |
| HTML elements | `<div class="box">{title}</div>` |
| Components | `<TodoList items={todos} />` |
| Static attributes | `<button class="primary">` |
| Dynamic attributes | `<div class={className} id={nodeId}>` |
| Boolean attributes | `<input disabled checked />` |
| Event handlers | `<button onClick={handleClick}>` |
| Text interpolation | `Hello {user.name}!` |
| Conditionals | `<span l-if={done}>Done</span><span l-else>Pending</span>` |
| Loops | `<li l-for={(todo, i) in todos}>{i}: {todo.text}</li>` |
| Fragments | `<><Header /><Content /></>` |

All directives can be nested and combined. Invalid syntax produces descriptive
errors with line and column numbers.

## CLI & Playground

```bash
cd packages/lithentTemplateParser
pnpm dev
```

The Vite playground exposes a live editor that shows the generated code, AST,
token stream, and the rendered Lithent component. In the browser console you can
call `compile()`, `transformDocument()`, or `tokenize()` directly for faster
experimentation.

## Architecture

```
Template String
      ↓
    Lexer     (tokenize)
      ↓
   Parser     (AST)
      ↓
 Transform    (optimise + directive handling)
      ↓
  Codegen     (h() calls)
```

Every stage is exported so you can plug custom transforms, inspect the AST, or
hook into the pipeline from other tooling.

## Testing

```bash
pnpm --filter @lithent/lithent-template-parser test
```

Vitest covers lexing, parsing, directive expansion, code generation, and
document transforms.

## License

MIT © Lithent contributors
