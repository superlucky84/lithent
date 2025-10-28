# Lithent Template Grammar Specification

## Overview
Lithent 템플릿은 Vue-like 문법을 사용하지만, 최소한의 디렉티브만 제공하여 복잡도를 낮춥니다.

## Template Syntax

### 1. Elements

#### HTML Elements
```html
<div>content</div>
<input />
<img src="..." />
```

#### Component Elements
컴포넌트는 대문자로 시작합니다:
```html
<MyComponent />
<UserCard name="John" />
```

#### Self-closing Tags
```html
<img src="..." />
<MyComponent />
```

### 2. Attributes

#### Static Attributes
```html
<div class="container" id="app">
```

#### Dynamic Attributes (JavaScript Expressions)
중괄호를 사용하여 동적 값 바인딩:
```html
<div class={className} id={elementId}>
<button onClick={handleClick}>
<input value={inputValue} />
```

#### Special Attributes

**ref** - DOM 또는 컴포넌트 참조:
```html
<div ref={myRef}>
<input ref={inputRef} />
```

### 3. Text Interpolation

중괄호 안에 JavaScript 표현식 사용:
```html
<div>{message}</div>
<span>Count: {count + 1}</span>
<p>{user.name} - {user.email}</p>
```

텍스트와 표현식 혼합:
```html
<p>Hello {name}, you have {count} messages</p>
```

### 4. Directives

모든 디렉티브는 `w-` 접두사를 사용합니다.

#### w-if / w-else-if / w-else

조건부 렌더링:
```html
<div w-if={count > 0}>
  Has items
</div>
<div w-else-if={count === 0}>
  No items
</div>
<div w-else>
  Loading...
</div>
```

**규칙:**
- `w-else-if`와 `w-else`는 반드시 `w-if` 또는 `w-else-if` 바로 다음에 와야 함
- 형제 요소 사이에 공백/주석 허용
- 표현식은 중괄호 `{}` 안에 작성

#### w-for

리스트 렌더링:
```html
<!-- 기본 형식: item in list -->
<div w-for={item in items}>
  {item}
</div>

<!-- 인덱스 포함 -->
<div w-for={(item, index) in items}>
  {index}: {item}
</div>

<!-- 객체 순회 -->
<div w-for={user in users}>
  {user.name}
</div>
```

**규칙:**
- 형식: `w-for={item in list}` or `w-for={(item, index) in list}`
- `item`은 순회할 각 요소의 이름
- `index`는 선택적 인덱스 변수
- `list`는 배열 또는 이터러블 표현식

### 5. Slots

부모 컴포넌트에서 전달된 자식 콘텐츠를 렌더링:

#### Default Slot
```html
<!-- 자식 컴포넌트 -->
<div class="wrapper">
  <slot />
</div>

<!-- 부모 컴포넌트 -->
<MyComponent>
  <p>This content goes into the slot</p>
</MyComponent>
```

#### Named Slots
```html
<!-- 자식 컴포넌트 -->
<div class="layout">
  <header>
    <slot name="header" />
  </header>
  <main>
    <slot />
  </main>
  <footer>
    <slot name="footer" />
  </footer>
</div>

<!-- 부모 컴포넌트 -->
<Layout>
  <template slot="header">
    <h1>Page Title</h1>
  </template>

  <p>Main content</p>

  <template slot="footer">
    <p>Footer content</p>
  </template>
</Layout>
```

**규칙:**
- `<slot>` - 기본 슬롯
- `<slot name="slotName">` - 이름있는 슬롯
- 부모에서 `<template slot="slotName">` 또는 직접 `slot="slotName"` 속성 사용

### 6. Comments

HTML 주석:
```html
<!-- This is a comment -->
```

## Expression Syntax

중괄호 `{}` 안에서는 유효한 JavaScript 표현식 사용 가능:

```html
<!-- 변수 -->
{message}

<!-- 속성 접근 -->
{user.name}
{user['email']}

<!-- 메서드 호출 -->
{formatDate(date)}
{items.map(i => i.name)}

<!-- 연산자 -->
{count + 1}
{isActive ? 'active' : 'inactive'}
{!isHidden && 'visible'}

<!-- 배열/객체 리터럴 -->
{[1, 2, 3]}
{{ key: 'value' }}
```

**제한사항:**
- 구문(statement)은 사용 불가 (if, for, while 등)
- 표현식(expression)만 사용 가능

## Grammar Rules (EBNF-like)

```
Template      ::= (Element | Text | Interpolation | Comment)*

Element       ::= '<' TagName Attributes? '>' Children '</' TagName '>'
                | '<' TagName Attributes? '/>'

TagName       ::= Identifier

Attributes    ::= (Attribute | Directive)*

Attribute     ::= AttrName ('=' AttrValue)?

AttrName      ::= Identifier ('-' Identifier)*

AttrValue     ::= StringLiteral | '{' Expression '}'

Directive     ::= 'w-if' '=' '{' Expression '}'
                | 'w-else-if' '=' '{' Expression '}'
                | 'w-else'
                | 'w-for' '=' '{' ForExpression '}'

ForExpression ::= Identifier 'in' Expression
                | '(' Identifier ',' Identifier ')' 'in' Expression

Slot          ::= '<slot' ('name=' StringLiteral)? '/>'
                | '<slot' ('name=' StringLiteral)? '>' Children '</slot>'

Children      ::= (Element | Text | Interpolation | Comment)*

Text          ::= [^<{]+

Interpolation ::= '{' Expression '}'

Comment       ::= '<!--' .* '-->'

Expression    ::= JavaScript Expression (no statements)

Identifier    ::= [a-zA-Z_$][a-zA-Z0-9_$]*
                | [A-Z][a-zA-Z0-9]*  // Component (PascalCase)

StringLiteral ::= '"' [^"]* '"' | "'" [^']* "'"
```

## Example Templates

### 간단한 리스트
```html
<div class="todo-list">
  <h2>Todos ({todos.length})</h2>
  <div w-for={todo in todos} class="todo-item">
    <input type="checkbox" checked={todo.done} />
    <span>{todo.text}</span>
  </div>
  <p w-if={todos.length === 0}>No todos yet</p>
</div>
```

### 컴포넌트와 슬롯
```html
<Card title="User Profile">
  <template slot="header">
    <img src={user.avatar} />
  </template>

  <div class="user-info">
    <h3>{user.name}</h3>
    <p>{user.email}</p>
  </div>

  <template slot="footer">
    <button onClick={handleEdit}>Edit</button>
  </template>
</Card>
```

### 조건부 렌더링
```html
<div class="status">
  <div w-if={status === 'loading'}>
    <Spinner />
  </div>
  <div w-else-if={status === 'error'}>
    <ErrorMessage message={error} />
  </div>
  <div w-else>
    <UserList users={users} />
  </div>
</div>
```

## Token Types (for Lexer)

다음 단계에서 구현할 토큰 타입들:

- `TAG_OPEN_START` - `<`
- `TAG_OPEN_END` - `>`
- `TAG_CLOSE_START` - `</`
- `TAG_SELF_CLOSE` - `/>`
- `IDENTIFIER` - 태그명, 속성명
- `ATTRIBUTE_EQUALS` - `=`
- `STRING_LITERAL` - `"..."` or `'...'`
- `EXPRESSION_START` - `{`
- `EXPRESSION_END` - `}`
- `DIRECTIVE_IF` - `w-if`
- `DIRECTIVE_ELSE_IF` - `w-else-if`
- `DIRECTIVE_ELSE` - `w-else`
- `DIRECTIVE_FOR` - `w-for`
- `TEXT` - 일반 텍스트
- `COMMENT_START` - `<!--`
- `COMMENT_END` - `-->`
- `WHITESPACE` - 공백
- `EOF` - 파일 끝
