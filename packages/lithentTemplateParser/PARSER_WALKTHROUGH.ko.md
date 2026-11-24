# lithentTemplateParser 소스 따라 읽기

이 패키지는 `<p>Hi {user.name}!</p>` 같은 템플릿을 `h('p', null, 'Hi ', (user.name), '!')` 같은 자바스크립트 표현식으로 바꾼다. 컴파일 시점에는 코드 문자열을 만들고, 실행 시점에는 그 코드가 현재 스코프의 `user`와 Lithent의 `h`로 WDom 노드를 만든다. 화면을 갱신하는 로직을 찾고 있다면 생성된 코드 이후가 출발점이다. [템플릿 진입점](src/compiler.ts#L9) · [Lithent의 `h`](../../src/wDom.ts#L45) · [렌더러 진입점](../../src/render.ts#L48)

1. [컴파일러 진입점](#컴파일러-진입점)
2. [한 줄 템플릿 따라가기](#한-줄-템플릿-따라가기)
3. [조건과 반복이 만나는 지점](#조건과-반복이-만나는-지점)
4. [중괄호 안의 자바스크립트](#중괄호-안의-자바스크립트)
5. [파일 전체를 변환하는 경로](#파일-전체를-변환하는-경로)
6. [어디에서 에러가 나는가](#어디에서-에러가-나는가)
7. [직접 확인하는 순서](#직접-확인하는-순서)

## 컴파일러 진입점

[src/index.ts](src/index.ts)에서 공개 API를 내보낸다. 템플릿 문자열 하나를 가지고 있다면 `compile(template, options)`를 호출한다. import, 함수, 변수 선언과 템플릿이 섞인 파일 전체를 넘길 때는 `transformDocument(source, options)`를 호출한다. 파일 변환도 찾은 템플릿마다 아래의 `compile()`을 호출한다. [공개 API](src/index.ts#L6) · [파일 변환에서의 호출](src/docPipe/index.ts#L61)

```text
template: string
  │ tokenize(template)         문자 → 토큰 목록
  ▼
Token[]
  │ parse(tokens, true)        토큰 → 태그와 자식의 트리
  ▼
RootNode
  │ transform(ast)             조건 분기 묶기 → 공백과 텍스트 정리
  ▼
RootNode
  │ generate(transformedAst)   트리 → 실행할 자바스크립트 표현식
  ▼
code: string
```

`compile()`은 성공하면 `{ code, ast, errors: [] }`를 반환한다. 여기서 `ast`는 **변환까지 마친 트리**다. 파싱 직후의 트리가 필요하면 `parse(tokenize(template), true)`를 직접 호출한다. 두 번째 인수 `true`는 공백 토큰을 텍스트 노드로 남기는 옵션이다. 단계별로 볼 때 이 인수를 주면 `compile()`과 같은 파서 설정에서 시작할 수 있다. [compile 본문](src/compiler.ts#L13) · [Parser 생성자](src/parser/parser.ts#L28)

## 한 줄 템플릿 따라가기

```html
<p class="greeting">Hi {user.name}!</p>
```

### Lexer가 만드는 것은 토큰 목록

`Lexer`는 문자열에서 현재 문자 위치인 `position`을 갖고 있다. `peek()`는 위치를 유지한 채 문자를 보고, `advance()`는 문자를 소비하면서 `position`, `line`, `column`을 갱신한다. `tokenize()`는 문자 끝까지 `readToken()`을 반복한 뒤 끝을 알리는 `EOF`를 붙인다. `readToken()`은 현재 문자를 기준으로 프래그먼트, 주석, 태그, 중괄호 표현식, 공백, 일반 텍스트를 판별한다. [Lexer의 커서와 반복문](src/parser/lexer.ts#L14) · [readToken](src/parser/lexer.ts#L81)

같은 공백도 어디에 있느냐에 따라 다르게 처리한다. `<p class=...`의 태그 내부 공백은 `readTagContent()`에서 건너뛴다. 본문에서 공백으로 토큰이 시작되면 `WHITESPACE`가 되고, `Hi `처럼 일반 텍스트 도중 나온 공백은 `TEXT`에 포함된다. `readText()`가 `<` 또는 `{` 앞까지 읽기 때문이다. [태그 내부 읽기](src/parser/lexer.ts#L203) · [본문 텍스트와 공백 읽기](src/parser/lexer.ts#L438)

이 예제의 토큰은 다음과 같다. `[start, end)`는 시작을 포함하고 끝을 제외하는 문자열 오프셋 범위다. 예를 들어 `template.slice(24, 33)`은 `user.name`이다. 실제 위치 객체에는 `offset`과 함께 1부터 시작하는 `line`, `column`이 들어 있다. [토큰과 위치 타입](src/parser/tokens.ts#L47)

| 토큰 타입            | 값           | 오프셋     |
| -------------------- | ------------ | ---------- |
| `TAG_OPEN_START`     | `<`          | `[0, 1)`   |
| `IDENTIFIER`         | `p`          | `[1, 2)`   |
| `IDENTIFIER`         | `class`      | `[3, 8)`   |
| `ATTRIBUTE_EQUALS`   | `=`          | `[8, 9)`   |
| `STRING_LITERAL`     | `"greeting"` | `[9, 19)`  |
| `TAG_OPEN_END`       | `>`          | `[19, 20)` |
| `TEXT`               | `"Hi "`      | `[20, 23)` |
| `EXPRESSION_START`   | `{`          | `[23, 24)` |
| `EXPRESSION_CONTENT` | `user.name`  | `[24, 33)` |
| `EXPRESSION_END`     | `}`          | `[33, 34)` |
| `TEXT`               | `!`          | `[34, 35)` |
| `TAG_CLOSE_START`    | `</`         | `[35, 37)` |
| `IDENTIFIER`         | `p`          | `[37, 38)` |
| `TAG_OPEN_END`       | `>`          | `[38, 39)` |
| `EOF`                | 빈 문자열    | `[39, 39)` |

### Parser가 토큰을 AST로 묶는 방식

`Parser`의 `position`은 **토큰 배열의 인덱스**를 가리킨다. `peek()`로 현재 토큰을 보고, `advance()`로 소비한다. `check(type)`은 현재 토큰이 해당 타입인지 확인한다. `expect(type)`은 타입이 맞으면 소비하고, 다르면 현재 위치로 에러를 던진다. [Parser의 토큰 커서](src/parser/parser.ts#L464)

1. `parse()`는 `EOF`까지 `parseTemplateNode()`를 호출해서 최상위 노드들을 `Root.children`에 담는다. 이 예제의 첫 토큰은 `TAG_OPEN_START`라서 `parseElement()`로 들어간다.
2. `parseElement()`는 `<`와 태그 이름을 읽고 `parseAttributesAndDirectives()`를 호출한다. 예제의 `class="greeting"`은 `attributes`에 들어간다. `/>`를 만나면 자식이 빈 요소를 곧바로 만든다.
3. `>` 다음부터는 닫는 태그가 나올 때까지 다시 `parseTemplateNode()`를 호출한다. 그 결과 `Text("Hi ")`, `Interpolation("user.name")`, `Text("!")`가 순서대로 자식이 된다. 이 위치에 새 여는 태그가 있었다면 다시 `parseElement()`에 들어갔을 것이다. 이 방식이 **재귀 하강 파싱**이다.
4. `</`를 만나면 현재 호출이 기억하고 있던 태그 이름 `p`와 닫는 태그의 이름을 비교한다. 일치하면 `>`를 소비하고 요소 노드를 만들어 호출자에게 반환한다. `parseFragment()`도 같은 방식으로 자식을 모으고, 전용 토큰 `FRAGMENT_CLOSE`를 만났을 때 끝낸다.

[루트와 토큰 분기](src/parser/parser.ts#L38) · [프래그먼트](src/parser/parser.ts#L93) · [요소의 재귀 처리](src/parser/parser.ts#L120) · [속성과 디렉티브 분류](src/parser/parser.ts#L214)

예를 들어 `<div><p>Hi</p></div>`의 경우 `parseElement(div) → parseElement(p) → parseText()` 순으로 들어간다. `p` 호출이 `</p>`까지 읽고 반환하면, `div` 호출이 그 결과를 자기 자식 배열에 추가하고 `</div>`를 읽는다. 중첩된 태그 이름은 각 함수 호출의 지역 변수 `tag`에 담겨 있다. [태그 이름을 읽고 자식을 재귀 파싱하는 부분](src/parser/parser.ts#L120)

AST는 **추상 구문 트리**라는 뜻이다. 예를 들어 여는 태그와 닫는 태그의 구분 기호는 요소의 범위를 확인하는 데 쓰이고, 결과에는 태그 이름과 속성과 자식이 하나의 `Element`로 들어간다. 아래는 `parse(tokenize(template), true)`의 트리에서 위치 필드와 `ref: undefined`를 생략한 모습이다.

```text
Root
└─ children[0] Element("p", isComponent=false, isSelfClosing=false)
   ├─ attributes[0] Attribute(name="class", value="greeting", isDynamic=false)
   ├─ directives []
   └─ children
      ├─ Text(content="Hi ")
      ├─ Interpolation(expression="user.name")
      └─ Text(content="!")
```

파싱 단계의 자료형에서 특히 볼 만한 부분은 다음과 같다.

| 입력                    | AST에서 보는 곳                                                            |
| ----------------------- | -------------------------------------------------------------------------- |
| `class="greeting"`      | `attributes`에 문자열 `value`, `isDynamic: false`                          |
| `onClick={handleClick}` | `attributes`에 `value: { expression: 'handleClick' }`, `isDynamic: true`   |
| `disabled`              | `attributes`에 `value: null`, `isDynamic: false`                           |
| `ref={inputRef}`        | `attributes`에 동적 속성으로 기록하고 `Element.ref`에도 표현식 문자열 기록 |
| `l-if={ready}`          | `directives`에 `DirectiveIf`와 `condition: 'ready'`                        |
| `<!-- 메모 -->`         | `children`에 `Comment`                                                     |

`createElementNode()`는 태그 첫 글자가 대문자이거나 태그 이름에 점이 있으면 `isComponent: true`로 저장한다. 그래서 `Card`와 `ui.Card`는 자바스크립트 참조로 출력되고 `p`나 `my-card`는 문자열 태그로 출력된다. `walk()`와 `countNodes()`는 `children`을 따라가는 유틸리티다. 조건 분기의 전체 트리를 살펴보려면 뒤에서 나오는 `getConditionalGroup()`도 함께 사용한다. [AST 타입](src/parser/ast.ts#L15) · [요소 생성](src/parser/ast.ts#L231) · [walk](src/parser/ast.ts#L417) · [countNodes](src/transform/optimize.ts#L198)

### Transform이 공백과 텍스트를 정리하는 방식

`transform()`은 먼저 `transformDirectives()`를 호출하고, 이어서 옵션에 따라 `optimize()`를 호출한다. 이 예제에는 디렉티브가 없어서 조건 묶음은 생기지 않는다. 최적화는 각 자식 목록에서 먼저 자식 내부를 재귀적으로 정리한 뒤, 같은 목록에 있는 인접 텍스트를 합치고, 개행이 섞인 공백 전용 텍스트를 제거하고, 양 끝의 텍스트를 다듬는다. [변환 순서](src/transform/index.ts#L8) · [자식 목록 최적화](src/transform/optimize.ts#L41)

- `Text("Hi ")`는 첫 자식이라 앞쪽만 다듬는다. 뒤쪽 공백은 살아 있으므로 `Hi Ada!`로 이어진다.
- `<p><b>Hello</b> <i>world</i></p>`의 한 칸은 자식 목록 중간에 있고 개행이 없어서 유지된다.
- `<pre>`와 `<textarea>` 안에서는 공백 제거와 양끝 다듬기를 끈다. 인접한 텍스트를 합치는 옵션은 그대로 적용된다.

`parse(tokens)`만 호출하면 기본값으로 `WHITESPACE` 토큰이 파싱 전에 빠진다. 공백을 끝까지 추적할 때는 `parse(tokens, true)`를 사용한다. `compile(template, { transform: { optimize: false } })`는 텍스트 최적화를 끄고 조건 분기 처리는 수행한다. 세부 설정은 `optimizeOptions.mergeTextNodes`, `removeWhitespace`, `trimText`다. [파서의 공백 옵션](src/parser/parser.ts#L28) · [최적화 기본값](src/transform/optimize.ts#L18) · [pre와 textarea 처리](src/transform/optimize.ts#L102) · [개행 공백 제거 조건](src/transform/optimize.ts#L179)

### Codegen이 자바스크립트로 바꾸는 방식

`generate()`는 `Root.children`을 순회한다. `generateNode()`는 노드 타입에 맞는 함수를 부르고, 요소를 처리하는 `generateNormalElement()`는 자기 자식에 대해 다시 `generateNode()`를 호출한다. 이 예제는 코드가 남는 최상위 노드가 하나이므로 그 요소의 표현식이 결과다. 최상위에 여러 개가 남으면 배열 표현식이 되고, 빈 입력이나 주석만 있으면 `null`이라는 코드 문자열이 나온다. [루트와 노드 출력](src/codegen/createElement.ts#L19) · [일반 요소 출력](src/codegen/createElement.ts#L110)

<!-- prettier-ignore -->
```js
h('p', { class: 'greeting' }, 'Hi ', (user.name), '!')
```

첫 번째 인수는 태그, 두 번째는 props, 그 뒤는 자식이다. `generateProps()`는 값 없는 속성을 `true`로 바꾸고, 정적 값은 문자열 리터럴로, 동적 값은 표현식으로 출력한다. `data-id`나 `xml:lang`처럼 일반 식별자로 출력할 수 없는 키는 `['data-id']` 같은 계산된 프로퍼티가 된다. `ref`도 이때 다른 속성과 함께 props로 출력된다. `stringLiteral()`은 작은따옴표와 역슬래시, 개행 등을 이스케이프한다. `expressionCode()`는 `name` 같은 단순 식별자를 그대로 쓰고, `user.name`이나 `a, b`처럼 그 외의 표현식은 괄호로 감싼다. 예를 들어 `h('p', null, (a, b))`는 콤마 식 전체를 자식 인수 하나로 받는다. [props 생성](src/codegen/createElement.ts#L159) · [리터럴과 표현식 출력](src/codegen/createElement.ts#L313)

| 템플릿                                                  | 생성 코드                                                               |
| ------------------------------------------------------- | ----------------------------------------------------------------------- |
| `<UI.Input disabled data-id="search" ref={inputRef} />` | `h(UI.Input, { disabled: true, ['data-id']: 'search', ref: inputRef })` |
| `<><Header /><main /></>`                               | `h(Fragment, null, h(Header, null), h('main', null))`                   |
| `<Header /><main />`                                    | `[h(Header, null), h('main', null)]`                                    |

주석은 파싱 단계에서 `Comment` 노드로 남고 코드 생성 단계에서 빈 출력으로 걸러진다. `compile()`은 `h`나 `Fragment`를 가져오는 import를 생성하지 않으므로, 생성 코드를 실행하는 쪽에서 이름을 제공해야 한다. 출력 이름은 `generate.templateFactory`와 `generate.templateFragmentFactory`로 바꿀 수 있다. [주석과 프래그먼트 출력](src/codegen/createElement.ts#L62) · [기본 팩토리 이름과 옵션](src/codegen/createElement.ts#L19)

## 조건과 반복이 만나는 지점

<!-- prettier-ignore -->
```html
<ul>
  <li l-for={(item, i) in items} l-if={item.done} key={item.id}>{i}: {item.label}</li>
  <!-- 같은 반복의 분기 -->
  <li l-else-if={item.pending}>대기 중</li>
  <li l-else>미완료</li>
</ul>
```

**파싱 직후**에는 `li` 세 개가 `ul.children`에 형제로 들어간다. 그 사이에는 공백과 주석 노드도 있다. 첫 `li`의 `directives`에는 `DirectiveFor { item: 'item', index: 'i', list: 'items' }`와 `DirectiveIf { condition: 'item.done' }`가 있다. `parseForExpression()`은 두 정규식으로 `item in list`와 `(item, index) in list`의 형태를 검사하고, 오른쪽 `list`는 표현식 문자열로 보관한다. `key={item.id}`는 일반 속성이다. [parseDirective](src/parser/parser.ts#L308) · [parseForExpression](src/parser/parser.ts#L373)

**변환 중**에 `transformNodeList()`가 첫 `li`의 `l-if`를 발견하면 같은 자식 목록의 뒤를 살핀다. 주석과 공백만 있는 텍스트는 건너뛰고, 이어지는 `l-else-if`들과 `l-else`를 묶는다. 다른 요소, 내용이 있는 텍스트, 보간, 프래그먼트를 만나면 탐색이 끝난다. 실제로 분기를 찾아 소비한 범위에 포함된 주석과 공백도 함께 넘어간다. 각 분기의 자식 목록에도 같은 처리를 재귀적으로 적용한다. [형제 탐색과 소비 범위](src/transform/directives.ts#L36)

**변환 직후**에는 첫 `li`에 `__conditionalGroup`이라는 속성이 붙는다. 그룹 안에는 첫 분기의 사본 `if`, 배열 `elseIfs`, 선택적인 `else`가 있다. 두 번째와 세 번째 `li`는 각각 이 그룹에서 찾을 수 있다. `getConditionalGroup(firstLi)`로 읽으면 된다. 최적화 과정에서는 이 그룹 안의 분기도 별도로 방문한다. 그래서 변환된 AST의 `children`만 펼쳤을 때 첫 `li` 하나만 보이는 것이 정상이다. [메타데이터 부착과 조회](src/transform/directives.ts#L121) · [그룹 안의 분기 최적화](src/transform/optimize.ts#L102)

**코드 생성**은 `generateElement()`의 분기 순서가 중요하다.

1. `l-for`가 있으면 `generateForLoop()`가 먼저 맡는다. 반복 디렉티브를 뺀 요소 사본을 만들고, 조건 그룹이 있다면 그 안의 첫 분기 사본에서도 같은 반복 디렉티브를 뺀다. 그 요소를 다시 `generateElement()`로 넘긴다.
2. 두 번째 호출에는 조건 그룹이 남아 있으므로 `generateConditionalGroup()`이 `조건 ? 참일 때의 코드 : 거짓일 때의 코드`를 조립한다. 처리 중인 조건은 각 분기의 사본에서 빼고 해당 요소를 다시 생성한다. 마지막 `l-else`가 없으면 `: null`을 붙인다. 개별 `l-else-if`나 `l-else`에 붙인 자체 `l-for`도 그 분기의 코드를 생성할 때 적용된다.
3. 바깥의 `generateForLoop()`는 위에서 받은 조건식 전체를 `.map()` 콜백 본문에 넣는다. 이 예제에서 `item.done`과 `item.pending`을 평가할 때는 이미 콜백의 `item`과 `i`가 스코프에 들어와 있다.

[요소 처리 우선순위](src/codegen/createElement.ts#L86) · [반복 코드 생성](src/codegen/createElement.ts#L213) · [조건 코드 생성](src/codegen/createElement.ts#L252)

생성된 코드를 읽기 좋게 줄바꿈하면 다음과 같다.

<!-- prettier-ignore -->
```js
h(
  'ul',
  null,
  (items).map((item, i) =>
    (item.done)
      ? h('li', { key: (item.id) }, i, ': ', (item.label))
      : (item.pending)
        ? h('li', null, '대기 중')
        : h('li', null, '미완료')
  )
)
```

`items`는 실행 시점에 `.map()`을 호출할 수 있는 값이어야 한다. 조건만 붙인 요소를 직접 실험할 때는 `generate(transform(parse(...)))` 순서를 지킨다. 조건 코드는 `generateElement()`가 읽는 `__conditionalGroup`에서 출발하므로, `generate(parse(...))`만 호출하면 `l-if`가 붙은 요소도 일반 요소 호출로 출력된다. [반복과 조건의 실행 테스트](src/tests/regressions.test.ts#L47)

## 중괄호 안의 자바스크립트

**표현식의 끝 찾기.** Lexer의 `readExpression()`은 여는 `{`를 소비한 다음 `skipJsExpression(source, offset)`에 내부 스캔을 맡긴다. 스캐너는 깊이 1부터 시작하고 내부 `{`를 만나면 올리고 `}`를 만나면 내린다. 깊이가 0이 된 닫는 중괄호의 바로 다음 위치를 돌려준다. Lexer는 내부 문자열을 잘라 `EXPRESSION_CONTENT`에 넣고, 자기 커서도 `advance()`로 같은 위치까지 이동시켜 행과 열을 맞춘다. [readExpression](src/parser/lexer.ts#L396) · [skipJsExpression](src/docPipe/scan.ts#L175)

**중괄호 깊이 계산에서 리터럴 건너뛰기.** `<p>{format({ mark: '}' })}</p>`에서 깊이는 객체 리터럴의 여는 중괄호에서 2, 닫는 중괄호에서 1이 된다. 그 사이의 `'}'`는 `nextJsToken()`이 통째로 건너뛴다. 주석과 정규식 리터럴, 백틱 문자열도 같은 경로에서 처리된다. 백틱 문자열의 `${...}`를 만나면 내부 표현식에 다시 `skipJsExpression()`을 호출한다. `expressionAllowed`와 괄호·블록 문맥은 `/`가 정규식의 시작인지 나눗셈인지, `<`가 템플릿의 시작 후보인지 판단하는 데 쓰인다. [문자열·주석·정규식 건너뛰기](src/docPipe/scan.ts#L25) · [nextJsToken](src/docPipe/scan.ts#L96)

**표현식 안의 템플릿 다시 컴파일하기.** 파싱된 `Interpolation.expression`이나 동적 속성의 `value.expression`은 문자열이다. 코드 생성 중 `transformExpression()`은 그 문자열에 `<`가 있을 때 `scanTemplates()`를 호출한다. 후보가 있으면 `compileEmbeddedTemplate()`가 같은 `tokenize → parse → transform → generate`를 재귀적으로 실행하고, 찾은 구간만 치환한다. 바깥의 팩토리 이름은 안쪽에도 전달되며, 안쪽 `transform()`은 기본 옵션으로 호출된다. 후보의 컴파일이 예외를 던지면 그 구간은 원문으로 남는다. [transformExpression](src/codegen/createElement.ts#L328) · [compileEmbeddedTemplate](src/codegen/createElement.ts#L369)

<!-- prettier-ignore -->
```html
<div>{items.map(item => <Badge name={item} />)}</div>
```

<!-- prettier-ignore -->
```js
h('div', null, (items.map(item => h(Badge, { name: item }))))
```

`<p>{a < b}</p>`는 `h('p', null, (a < b))`로 변환된다. `a`를 읽은 직후에는 `expressionAllowed`가 거짓이므로 스캐너가 `<`에서 템플릿 추출을 시도하지 않는다. `item => <Badge />`에서는 화살표 뒤가 표현식이 시작할 수 있는 위치여서 추출을 시도한다. [표현식 위치에서의 후보 탐색](src/docPipe/scan.ts#L259) · [비교식이 포함된 회귀 테스트](src/tests/regressions.test.ts#L182)

## 파일 전체를 변환하는 경로

`compile()`에 파일 전체를 넘기면 Lexer는 시작부터 템플릿 본문으로 읽는다. 파일에는 문자열 리터럴 안의 `<b>`처럼 태그로 처리할 필요가 없는 구간이 있으므로, 문서 변환 쪽은 먼저 자바스크립트 문맥에서 템플릿을 찾는다. [템플릿 본문에서의 분기](src/parser/lexer.ts#L81) · [파일 변환 진입점](src/docPipe/index.ts#L42)

```js
const label = '<b>그대로</b>';
const View = name => <p>Hi {name}!</p>;
```

1. **`scanTemplates(code)`**는 파일을 앞에서부터 훑다가 `expressionAllowed`가 참인 위치에서 `<`를 보면 `extractTemplate()`을 시도한다. 예제의 첫 줄은 따옴표 안이라 한 토큰처럼 건너뛰고, 둘째 줄의 화살표 뒤에서 후보를 찾는다.
2. **`extractTemplate()`**은 여는 태그로 깊이를 늘리고, 닫는 태그와 자체 닫는 태그를 만나면 줄인다. 시작 위치에서 깊이가 다시 0이 되면 `{ start, end, snippet }`으로 범위를 돌려준다. 태그 이름의 일치 여부는 이후 Parser가 확인한다. `skipTag()`는 속성 문자열과 표현식을 건너뛴 뒤 실제 태그를 끝내는 `>`를 찾는다. 태그 바깥의 템플릿 본문에서는 따옴표와 `//`를 일반 텍스트로 읽는다.
3. **`transformDocument()`**는 각 `snippet`을 `compile()`하고, 성공한 범위에만 `MagicString.overwrite(start, end, code)`를 적용한다. 실패한 범위의 원문을 두고 `{ match, error }`를 결과에 모은다. 하나라도 치환에 성공하면 `transformed: true`다. `generateSourceMap: true`를 줬을 때 치환이 있었다면 `map`도 생성한다.

[문서 스캔](src/docPipe/scan.ts#L259) · [후보 구간 추출](src/docPipe/scan.ts#L204) · [컴파일·치환·소스맵](src/docPipe/index.ts#L57)

```js
const label = '<b>그대로</b>';
const View = name => h('p', null, 'Hi ', name, '!');
```

Vite에서는 별도 패키지인 `lithentTemplateVite`가 이 경로를 호출한다. 기본 확장자는 `.ltsx`와 `.ljsx`다. 플러그인의 `load()`가 원본을 읽어 `transformDocument()`를 호출하고, 반환 코드 또는 원본을 다음 트랜스파일 단계에 넘긴다. 기본 스크립트 로더는 Oxc를 사용한다. 따라서 `.ltsx`가 어떤 구간을 바꿨는지 궁금하면 `transformDocument()`, 바뀐 구간에서 어떤 `h()`가 나왔는지 궁금하면 `compile()`을 보면 된다. [확장자와 로더](../lithentTemplateVite/src/plugin.ts#L16) · [Vite load 훅](../lithentTemplateVite/src/plugin.ts#L196)

## 어디에서 에러가 나는가

| 입력                   | 처음 확인할 단계                                                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `<p>{name</p>`         | Lexer가 맞는 `}`를 못 찾아 `Unclosed expression`                                                                                 |
| `<div><p></div>`       | Parser의 안쪽 `parseElement()`가 `</p>`를 기다리다 `</div>`를 만나 `Mismatched closing tag`                                      |
| `<li l-for={items} />` | Parser의 `parseForExpression()`이 `item in list` 형태를 찾지 못해 `Invalid l-for`                                                |
| `<p l-else />`         | Parser는 `DirectiveElse`를 만들고, Transform이 짝을 못 찾아 `l-else-if/l-else must follow l-if or l-else-if`                     |
| `<p>{value +}</p>`     | 템플릿 구조는 파싱된다. `compile()`은 `h('p', null, (value +))`를 만들고, 이 코드를 읽는 자바스크립트 파서에서 문법 에러가 난다. |

직접 호출한 저수준 단계에서는 예외를 받는다. `compile()`은 이 예외를 잡아 `code: ''`, `ast: null`, 첫 오류 하나가 든 `errors`로 돌려준다. 오류에 행·열 속성이 없으면 구조화된 필드는 `0`이다. `transformDocument()`의 오류 행·열은 잘라낸 `snippet` 기준이고, `match.start`는 전체 파일 기준이다. 또한 스캐너가 후보 자체를 추출하지 못한 구간은 컴파일 진단까지 도달하지 않는다. [컴파일 오류 변환](src/compiler.ts#L31) · [Parser 오류 위치](src/parser/parser.ts#L455) · [문서 오류와 후보 범위](src/docPipe/index.ts#L20) · [후보 추출 실패 조건](src/docPipe/scan.ts#L219)

현재 구현을 읽을 때는 `GRAMMAR.md`에서 문법의 모양을 먼저 보고 위의 코드와 테스트로 세부 동작을 확인하면 된다. 특히 표현식 검사는 닫는 중괄호와 빈 문자열 같은 템플릿 경계에 집중하며, 자바스크립트 표현식의 문법 검사는 후속 도구의 몫이다. HTML 주석도 AST에서는 관찰할 수 있고 생성 코드에서는 사라진다. [문법 문서](GRAMMAR.md) · [보간 검사](src/parser/parser.ts#L424) · [주석 출력 분기](src/codegen/createElement.ts#L75)

## 직접 확인하는 순서

저장소 루트에서 아래 명령으로 플레이그라운드를 띄운다.

```bash
pnpm --filter @lithent/lithent-template-parser dev
```

입력창에 한 줄 예제를 붙이거나 브라우저 콘솔에서 다음을 실행한다. 처음 보이는 기본 예제에는 프래그먼트 안에 홀로 있는 `l-else`가 있어서 초기 화면에 조건 분기 오류가 뜬다. 플레이그라운드의 AST 패널은 성공 시 변환된 AST를 표시하고 `__conditionalGroup`을 화면에서 숨긴다. 조건 그룹을 볼 때는 콘솔에서 반환 객체를 직접 펼친다. [기본 예제](src/playground/main.ts#L13) · [플레이그라운드의 AST 표시](src/playground/main.ts#L114) · [콘솔 API 노출](src/playground/main.ts#L206)

```js
const template = '<p class="greeting">Hi {user.name}!</p>';
const tokens = tokenize(template);
console.table(tokens.map(({ type, value }) => ({ type, value })));
console.log(parse(tokens, true));
console.log(compile(template));

const list = `<ul>
  <li l-for={(item, i) in items} l-if={item.done}>{i}: {item.label}</li>
  <li l-else>미완료</li>
</ul>`;
const result = compile(list);
console.log(result.ast.children[0].children[0].__conditionalGroup);
console.log(result.code);
```

소스와 테스트를 나란히 볼 때는 아래 순서로 보면 입력에서 실행까지 이어진다.

| 보고 싶은 것                             | 열어 볼 테스트                                                                                                                                        |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 어떤 문자가 어떤 토큰이 되는지           | [lexer.test.ts](src/tests/lexer.test.ts). 속성, 백틱 문자열, 중첩 중괄호 사례를 볼 수 있다.                                                           |
| 토큰이 어떤 노드로 묶이는지              | [parser.test.ts](src/tests/parser.test.ts). 속성의 `value`, 디렉티브의 `condition`·`item`·`list`, 중첩된 `children`을 직접 검사한다.                  |
| AST가 어떤 코드 문자열을 만드는지        | [compiler.test.ts](src/tests/compiler.test.ts). 요소, 프래그먼트, 디렉티브, 표현식 안의 템플릿 출력을 확인한다.                                       |
| 파일 안에서 어떤 범위가 치환되는지       | [docPipe.test.ts](src/tests/docPipe.test.ts)와 [문서 스캔 회귀 테스트](src/tests/regressions.test.ts#L162).                                           |
| 생성 코드가 실행되면 무엇이 렌더링되는지 | [regressions.test.ts](src/tests/regressions.test.ts#L1). 테스트가 생성 코드에 `h`와 `Fragment`를 넘겨 실행하고, `renderToString()`의 HTML을 비교한다. |

```bash
pnpm --filter @lithent/lithent-template-parser test
```

한 번 직접 따라간 뒤에는 토큰이 이상하면 `readToken()`, 자식 구조가 이상하면 `parseElement()`, 분기나 공백이 사라지면 `transformNodeList()`와 `optimizeNodeList()`, AST가 맞는데 출력이 이상하면 `generateElement()`부터 보면 된다. 파일에서 템플릿을 아예 못 찾았다면 `scanTemplates()`가 시작점이다.
