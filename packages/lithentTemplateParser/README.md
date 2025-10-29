# Lithent Template Parser

Vue-like template parser for Lithent. Compiles template syntax into Lithent's `h()` function calls.

## Features

- **Clean Template Syntax**: Write declarative templates instead of imperative `h()` calls
- **Minimal Directives**: Only essential directives (l-if, l-else-if, l-else, l-for)
- **Ref Support**: Direct DOM/component references
- **Full TypeScript**: Complete type definitions for all APIs
- **Well-Tested**: 68 tests covering all features

## Installation

```bash
pnpm add @lithent/lithent-template-parser
```

## Usage

```typescript
import { compile } from '@lithent/lithent-template-parser';

const template = `
  <div class="container">
    <h1>{title}</h1>
    <ul>
      <li l-for={item in items}>{item.name}</li>
    </ul>
  </div>
`;

const result = compile(template);
console.log(result.code);
// Output:
// import { h } from 'lithent';
//
// return h('div', { class: 'container' },
//   h('h1', null, title),
//   h('ul', null, (items).map(item => h('li', null, item.name)))
// );
```

## Template Syntax

### Elements

```html
<!-- HTML elements -->
<div>content</div>
<input />

<!-- Components (PascalCase) -->
<MyComponent />
<UserCard name="John" />
```

### Attributes

```html
<!-- Static attributes -->
<div class="container" id="app">

<!-- Dynamic attributes -->
<div class={className} id={elementId}>

<!-- Boolean attributes -->
<input disabled checked />

<!-- Event handlers -->
<button onClick={handleClick}>Click me</button>
```

### Text Interpolation

```html
<div>{message}</div>
<span>Count: {count + 1}</span>
<p>Hello {name}, you have {count} messages</p>
```

### Directives

#### l-if / l-else-if / l-else

Conditional rendering:

```html
<div l-if={count > 0}>
  Has items
</div>
<div l-else-if={count === 0}>
  No items
</div>
<div l-else>
  Loading...
</div>
```

#### l-for

List rendering:

```html
<!-- Simple iteration -->
<div l-for={item in items}>
  {item}
</div>

<!-- With index -->
<div l-for={(item, index) in items}>
  {index}: {item}
</div>

<!-- Object iteration -->
<div l-for={user in users}>
  {user.name}
</div>
```

### Ref

DOM/component references:

```html
<div ref={myRef}>
<input ref={inputRef} />
```

## API

### `compile(template, options?)`

Compiles a template string into JavaScript code.

```typescript
interface CompileOptions {
  transform?: {
    optimize?: boolean;
    optimizeOptions?: {
      mergeTextNodes?: boolean;
      removeWhitespace?: boolean;
      trimText?: boolean;
    };
  };
  generate?: {
    templateFactory?: string;
    templateFragmentFactory?: string;
  };
}

interface CompileResult {
  code: string;           // Generated JavaScript code
  ast: RootNode | null;   // Abstract Syntax Tree
  errors: CompileError[]; // Compilation errors
}
```

### Advanced APIs

For advanced use cases, you can use the individual compiler stages:

```typescript
import {
  tokenize,  // Lexical analysis
  parse,     // Syntax analysis
  transform, // AST transformation
  generate   // Code generation
} from '@lithent/lithent-template-parser';

// Manual compilation pipeline
const tokens = tokenize(template);
const ast = parse(tokens);
const transformedAst = transform(ast);
const code = generate(transformedAst);
```

## Examples

### Todo List

```typescript
const template = `
  <div class="todo-list">
    <h2>Todos ({todos.length})</h2>
    <div l-for={(todo, index) in todos} class="todo-item">
      <input type="checkbox" checked={todo.done} />
      <span>{index + 1}. {todo.text}</span>
    </div>
    <p l-if={todos.length === 0}>No todos yet!</p>
  </div>
`;

const result = compile(template);
```

### User Profile Card

```typescript
const template = `
  <div class="profile-card">
    <img src={user.avatar} />
    <h3>{user.name}</h3>
    <p>{user.email}</p>
    <button l-if={canEdit} onClick={handleEdit}>Edit</button>
  </div>
`;

const result = compile(template);
```

### Dashboard with Loading States

```typescript
const template = `
  <div class="dashboard">
    <div l-if={isLoading}>
      <Spinner />
    </div>
    <div l-else-if={hasError}>
      <ErrorMessage message={error} />
    </div>
    <div l-else>
      <DataGrid data={data} />
    </div>
  </div>
`;

const result = compile(template);
```

## Architecture

The compiler follows a multi-stage pipeline:

1. **Lexer**: Tokenizes the template string
2. **Parser**: Builds an Abstract Syntax Tree (AST)
3. **Transform**: Optimizes and transforms the AST
4. **Codegen**: Generates JavaScript code

```
Template String
      ↓
    Lexer (tokenize)
      ↓
   Token Stream
      ↓
    Parser (parse)
      ↓
      AST
      ↓
  Transform (optimize)
      ↓
  Transformed AST
      ↓
  Codegen (generate)
      ↓
  JavaScript Code
```

## Philosophy

This parser follows Lithent's philosophy of **minimalism**:

- **Limited Directives**: Only essential directives (l-if, l-for) - no bloat
- **No Magic**: Explicit and predictable transformations
- **TypeScript First**: Full type safety throughout

## Testing

```bash
# Run all tests
pnpm test

# Run in watch mode
pnpm test:dev
```

## Playground

브라우저에서 바로 템플릿을 입력하고 결과를 확인하려면 패키지 루트에서 Vite 개발 서버를 실행하세요.

```bash
cd packages/lithentTemplateParser
pnpm dev
```

기본적으로 `http://localhost:5173`에서 다음과 같은 정보를 실시간으로 확인할 수 있습니다.

- 템플릿 입력에 대한 토큰 스트림
- Transform까지 적용된 AST
- 생성된 Lithent `h()` 코드

개발자 도구 콘솔에는 `compile`, `parse`, `tokenize` 함수가 노출돼 있어 직접 호출하며 디버깅할 수 있습니다.

## License

MIT

## Contributing

Contributions are welcome! Please read the [contributing guidelines](../../CONTRIBUTING.md) first.
