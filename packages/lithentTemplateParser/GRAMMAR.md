# Lithent Template Grammar Specification (English Edition)

Lithent templates provide a JSX-inspired but independent syntax that maps
directly to `h()` calls. This document captures the canonical grammar and
describes how the parser expects templates to be written.

> **Status:** Experimental. The surface may evolve as the Lithent ecosystem
> grows.

---

## 1. Elements

### 1.1 HTML Elements
```html
<div>content</div>
<input />
<img src="..." />
```

### 1.2 Components (PascalCase)
```html
<MyComponent />
<UserCard name="John" />
```

### 1.3 Self-closing Tags
```html
<img src="..." />
<MyComponent />
```

---

## 2. Attributes

### 2.1 Static Attributes
```html
<div class="container" id="app">
```

### 2.2 Dynamic Attributes
Wrap the value in `{}` to bind a JavaScript expression.
```html
<div class={className} id={elementId}>
<button onClick={handleClick}>
<input value={currentValue} />
```

### 2.3 Special Attributes
`ref` captures DOM or component references.
```html
<div ref={hostRef}>
<InputField ref={inputRef} />
```

---

## 3. Text Interpolation

Use `{}` anywhere inside element content to inject expressions.
```html
<div>{message}</div>
<span>Count: {count + 1}</span>
<p>{user.name} — {user.email}</p>
```

Plain text and interpolations can mix freely:
```html
<p>Hello {name}, you have {count} notifications.</p>
```

---

## 4. Directives

All Lithent directives use the `l-` prefix.

### 4.1 `l-if` / `l-else-if` / `l-else`
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

Rules:
- `l-else-if` and `l-else` must immediately follow a sibling `l-if` / `l-else-if`.
- Whitespace or comments between siblings are allowed.
- Expressions always appear inside `{}`.

### 4.2 `l-for`
```html
<!-- item in list -->
<div l-for={item in items}>
  {item}
</div>

<!-- iterate with index -->
<div l-for={(item, index) in items}>
  {index}: {item}
</div>

<!-- iterate object-like values -->
<div l-for={user in users}>
  {user.name}
</div>
```

Rules:
- Syntax: `l-for={item in list}` or `l-for={(item, index) in list}`.
- `item` receives each element, `index` is optional.
- `list` can be any JavaScript expression that yields an iterable.

---

## 5. Comments
Standard HTML comments pass through:
```html
<!-- This is a comment -->
```

---

## 6. Expressions
Inside `{}` you may use any JavaScript *expression* (no statements).

```html
{message}
{user.name}
{formatDate(date)}
{items.map(i => i.label)}
{count + 1}
{isActive ? 'active' : 'inactive'}
{!isHidden && 'visible'}
{[1, 2, 3]}
{{ id: todo.id, text: todo.text }}
```

Disallowed: statements such as `if`, `for`, `while`, `return`, etc.

---

## 7. Fragments
Use empty tags to group siblings without extra DOM nodes.
```html
<>
  <Header />
  <Content />
</>
```

---

## 8. EBNF Grammar

```
Template        ::= (Element | Fragment | Text | Interpolation | Comment)*

Element         ::= '<' TagName Attributes? '>' Children '</' TagName '>'
                  | '<' TagName Attributes? '/>'

Fragment        ::= '<>' Children '</>'

TagName         ::= Identifier

Attributes      ::= (Attribute | Directive)*

Attribute       ::= AttrName ('=' AttrValue)?
AttrName        ::= Identifier ('-' Identifier)*
AttrValue       ::= StringLiteral | '{' Expression '}'

Directive       ::= 'l-if' '=' '{' Expression '}'
                  | 'l-else-if' '=' '{' Expression '}'
                  | 'l-else'
                  | 'l-for' '=' '{' ForExpression '}'

ForExpression   ::= Identifier 'in' Expression
                  | '(' Identifier ',' Identifier ')' 'in' Expression

Children        ::= (Element | Fragment | Text | Interpolation | Comment)*

Text            ::= [^<{]+
Interpolation   ::= '{' Expression '}'
Comment         ::= '<!--' .* '-->'

Expression      ::= JavaScript expression (statements disallowed)

Identifier      ::= [A-Za-z_$][A-Za-z0-9_$]*
StringLiteral   ::= '"' [^"]* '"' | '\'' [^']* '\''
```

Fragments appear in `Children`. Component names follow the same identifier rule;
using PascalCase is conventional but not enforced at the grammar level.

---

## 9. Error Reporting

The parser emits descriptive errors with line and column numbers for:
- mismatched or unclosed tags,
- invalid directive ordering,
- unterminated interpolations,
- malformed `l-for` expressions,
- unexpected end-of-input.

---

This specification mirrors the behaviour implemented in the parser source
(`packages/lithentTemplateParser/src`). Use it as a reference when extending the
grammar or writing new tooling.
