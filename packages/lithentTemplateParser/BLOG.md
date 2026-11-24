# lithentTemplateParser 구현기

그때 내게는 약간 병 같은 게 있었다. 편리한 도구를 만나면 잘 쓰다가도, 어느 순간 그 도구에 너무 의존하고 있는 건 아닌지 불안해졌다. 영원할 것 같던 jQuery의 전성기가 저무는 걸 보면서 React의 유행도 언젠가는 끝날 수 있겠다고 생각했다. 내가 겁났던 건 React나 JSX가 사라지면 거기서 당연하게 써먹던 편리한 방식까지 같이 잃어버릴 수 있다는 거였다.

가상 DOM 라이브러리인 Lithent를 만들면서도 JSX 변환은 기존 자바스크립트 파서의 JSX 옵션에 맡겼다. 누가 내일 갑자기 JSX를 못 쓰게 한다면, 나는 어디서부터 손을 대야 할까? 지금 생각해 보면 좀 과한 걱정이다. 그래도 UI를 태그로 표현하는 멘탈 모델부터 그 태그를 함수 호출로 바꾸는 구현까지 제대로 만들어 보면, 기존 JSX 변환기 없이도 필요할 때 내 손으로 다시 만들어 쓸 수 있겠다고 생각했다.

그래서 예전에 작은 프로토타입을 만들었다. 문자열을 어디서 끊을지 궁리하다가 `start`와 `end`라는 두 위치를 뒀다. `start`는 그대로 두고 `end`만 움직이다가 찾던 `<`나 `>`를 만나면, 그때 `start`를 `end`까지 옮겼다. 그 앞까지 모아 둔 글자는 한 덩어리로 넘겼다. 그때는 내 나름대로 이 방식을 생각해 내고 함수 이름을 그냥 `search()`라고 붙였다. [당시의 search()](https://github.com/superlucky84/lithent/blob/4754708bb930a929c7c4ef1956e0d5927cd36072/packages/compiler/src/step1.js#L15-L53)

그렇게 읽어 낸 태그를 보고 트리를 만들었다. 여는 태그를 만나면 자식으로 내려가고 닫는 태그를 만나면 부모로 돌아왔다. 속성과 텍스트를 다듬은 뒤 트리를 다시 순회하면서 `h()` 호출을 이어 붙였다. 다시 보니 그때 만든 세 단계는 구문 분석, 트리 변환, 코드 생성에 해당했다. 이름을 모르고 손 가는 대로 구현한 것이었다. [당시의 프로토타입](https://github.com/superlucky84/lithent/tree/4754708bb930a929c7c4ef1956e0d5927cd36072/packages/compiler)

그 뒤로도 제대로 다시 만들어 보고 싶다는 생각이 남아 있었다. 한참 뒤, 업무에서도 AI의 도움을 많이 받던 때라 이번에는 AI를 선생님 삼아 파서의 구조를 공부하면서 다시 만들어 보기로 했다.

내 눈에 JSX는 거의 완벽했다. 딱 하나 아쉬운 건 조건과 반복을 넣을 때였다. `ready && <Panel />`이나 `items.map(...)` 같은 자바스크립트 표현식이 태그 사이에서 몇 겹씩 중첩되면, 화면을 이루는 태그 구조가 한눈에 잘 들어오지 않았다.

개발 선배들이 템플릿과 비즈니스 로직을 나눠서 작성하는 걸 보고 배웠다. 그러다 보니 나도 그 구분에 조금 강박이 있었는지도 모르겠다. 다른 개발자들이 JSX와 Vue 템플릿을 비교하면서 같은 지점을 짚는 걸 보며 고개가 끄덕여졌다.

그래서 내 템플릿에 넣을 디렉티브는 조건과 반복에 필요한 만큼으로 정했다. Vue의 `v-if`와 `v-for`처럼 `l-if`와 `l-for`를 붙이면, 요소를 어떤 조건에서 보여 주고 어떤 목록을 반복하는지 여는 태그에서 바로 알 수 있다. 내 딴에는 화면 구조가 먼저 읽히게 하려고 더한 최소한의 문법이었다. 그렇게 만든 것이 Lithent 템플릿을 `h()` 호출로 바꿔주는 `lithentTemplateParser`다.

## 템플릿 한 줄이 함수 호출이 되기까지

템플릿 컴파일러가 하는 일은 UI를 표현한 문자열을 브라우저의 자바스크립트 엔진이 실행할 수 있는 코드로 바꾸는 것이다. Lithent에서는 그 결과가 `h()` 함수 호출이다. 아래 예제라면 바깥 `div`의 호출에 `p`를 만드는 호출을 자식으로 넘기는 코드가 나온다. 브라우저에서 그 코드가 실행될 때 `h()`가 이 구조대로 가상 DOM 노드를 만든다. [Lithent의 h()](https://github.com/superlucky84/lithent/blob/72222f3f7128d648b71b47f46f2865a7c9d3b2bc/src/wDom.ts#L45)

```html
<div><p>Hello {name}!</p></div>
<!-- 생성 코드 → h('div', null, h('p', null, 'Hello ', name, '!')) -->
```

우선 첫 단계는 문자열에서 태그와 본문의 경계를 찾아야 한다. 그런 다음 `p`가 `div` 안에 있다는 관계를 트리로 표현하고, 필요하면 트리를 다듬은 뒤 자바스크립트 코드로 다시 써야 한다. `compile()`은 이 일을 네 단계에 나눠 맡긴다. [compile() 소스](https://github.com/superlucky84/lithent/blob/72222f3f7128d648b71b47f46f2865a7c9d3b2bc/packages/lithentTemplateParser/src/compiler.ts#L9)

1. **렉서**는 문자열을 앞에서부터 읽어 태그 이름이나 본문 같은 조각을 토큰으로 만든다. `tokenize()`가 이 토큰화 작업을 시작하는 함수다.
2. **파서**는 `parse()`에서 토큰을 문법에 따라 묶어, 어떤 요소가 어디에 중첩됐는지 담은 트리(AST)를 만든다.
3. **트랜스포머**는 `transform()`에서 이어지는 조건 분기를 묶고 들여쓰기 공백을 정리해, 트리를 코드 생성에 필요한 형태로 다듬는다.
4. **코드 생성기**는 `generate()`에서 변환된 트리를 순회하며 `h()` 호출과 그 인수를 자바스크립트 코드 문자열로 조립한다.

### 렉서가 문자를 토큰으로 묶는 법

렉서(lexer)는 문자열을 앞에서부터 읽고, 뒤에서 문법을 해석할 때 쓸 조각을 만든다. 단어를 토큰으로 삼는 간단한 문법을 생각해 보자. `"ab c de"`에서 0번 위치부터 읽다가 2번 위치의 공백을 만나면, `slice(0, 2)`로 `ab`를 꺼낼 수 있다. 같은 방식으로 `c`, `de`를 얻는다. Lithent의 렉서는 문맥에 따라 `<`를 태그 시작으로, `div`를 태그 이름에 쓰이는 식별자로, `Hello `를 텍스트로 기록한다. 어떤 조각인지 구분하는 이름이 토큰의 타입이다.

여기서 **본다**와 **소비한다**를 나누는 게 중요하다. `peek()`는 커서를 그대로 두고 현재 문자를 본다. `peek(1)`로 다음 문자도 볼 수 있다. 이렇게 소비하지 않고 먼저 살펴보는 동작을 **룩어헤드(lookahead)**라고 부른다. 현재 문자가 `<`이고 다음 문자가 `/`이면 닫는 태그를 읽는 함수로 들어가고, 그 함수 안에서 `advance()`로 두 문자를 소비한다. 소비할 때마다 커서가 앞으로 움직이고 줄과 열도 갱신된다. [Lexer 소스](https://github.com/superlucky84/lithent/blob/72222f3f7128d648b71b47f46f2865a7c9d3b2bc/packages/lithentTemplateParser/src/parser/lexer.ts#L47)

예제 첫 줄의 토큰을 `타입(값)` 형태로 줄여 쓰면 이렇다. `Hello `의 마지막 공백도 토큰 값의 일부다.

```text
TAG_OPEN_START("<") IDENTIFIER("div") TAG_OPEN_END(">")
TAG_OPEN_START("<") IDENTIFIER("p")   TAG_OPEN_END(">")
TEXT("Hello ") EXPRESSION_START("{") EXPRESSION_CONTENT("name") EXPRESSION_END("}") TEXT("!")
TAG_CLOSE_START("</") IDENTIFIER("p")   TAG_OPEN_END(">")
TAG_CLOSE_START("</") IDENTIFIER("div") TAG_OPEN_END(">")
EOF
```

### 파서가 토큰에서 부모와 자식을 찾는 법

파서에도 `peek()`와 `advance()`가 있다. 이번에 커서가 가리키는 건 토큰 배열이다. `parseElement()`는 여는 태그의 이름을 읽고, 닫는 태그가 나올 때까지 자식 노드를 하나씩 읽는다. 자식을 읽다가 또 여는 태그를 만나면 `parseElement()`를 다시 호출한다.

예제에서는 `div`를 읽는 도중에 `p`를 읽으러 들어간다. `p`를 읽는 호출은 `</p>`까지 확인한 뒤 자기 노드를 반환하고, 기다리고 있던 `div` 쪽에서 그 노드를 자식으로 담는다. 각 함수 호출이 자신이 열었던 태그 이름을 기억하니 `<div><p></div>`처럼 닫는 순서가 꼬이면 `p`를 읽던 자리에서 에러를 낼 수 있다. 이런 식으로 문법 규칙마다 함수를 두고 안쪽 구조가 나오면 호출을 내려가는 방식이 **재귀 하강 파싱**이다. [parseElement() 소스](https://github.com/superlucky84/lithent/blob/72222f3f7128d648b71b47f46f2865a7c9d3b2bc/packages/lithentTemplateParser/src/parser/parser.ts#L120)

```text
Root
└─ Element("div")
   └─ Element("p")
      ├─ Text("Hello ")
      ├─ Interpolation("name")
      └─ Text("!")
```

이 트리가 **AST(Abstract Syntax Tree, 추상 구문 트리)**다. 토큰에 따로 있던 여는 태그와 닫는 태그는 요소 하나의 구조로 묶였고, 본문의 `{name}`은 자바스크립트 표현식 `name`을 담은 보간 노드가 됐다. 이때 `name`은 아직 문자열이다. 실제 값은 생성된 코드를 실행할 때 결정된다.

### 트랜스폼에서 조건 분기를 한 덩어리로 만들기

AST가 생기면 이제 문자 위치를 다시 훑지 않고도 부모와 자식, 형제 관계를 따라갈 수 있다. 그 덕을 보는 게 `l-if`와 `l-else`다.

<!-- prettier-ignore -->
```html
<section>
  <p l-if={ready}>준비 완료</p>
  <!-- 상태가 바뀌면 아래 분기로 -->
  <p l-else>대기 중</p>
</section>
```

파싱 직후에는 `p` 두 개가 각각 조건 디렉티브를 가진 형제 노드다. 트랜스폼은 `l-if`가 붙은 노드를 찾으면 같은 부모의 자식 목록을 이어서 본다. 공백만 있는 텍스트와 주석을 건너, 이어지는 `l-else-if`와 `l-else`를 첫 요소의 `__conditionalGroup`에 묶는다. 앞뒤 형제를 함께 볼 수 있으니 짝 없이 나타난 `l-else`도 이 단계에서 잡는다. [조건 분기를 묶는 코드](https://github.com/superlucky84/lithent/blob/72222f3f7128d648b71b47f46f2865a7c9d3b2bc/packages/lithentTemplateParser/src/transform/directives.ts#L36)

### 코드 생성기에서 `h()` 호출 만들기

코드 생성기는 트리를 다시 내려가면서 요소를 `h(태그, props, ...자식)` 형태로 조립한다. 텍스트는 문자열 리터럴로 출력하고, 보간에 들어 있던 `name`은 자바스크립트 식으로 넣는다. 그래서 처음의 한 줄은 아래 코드가 된다. [요소 코드 생성](https://github.com/superlucky84/lithent/blob/72222f3f7128d648b71b47f46f2865a7c9d3b2bc/packages/lithentTemplateParser/src/codegen/createElement.ts#L110)

<!-- prettier-ignore -->
```js
h('div', null, h('p', null, 'Hello ', name, '!'))
```

두 요소 모두 속성이 없어서 두 번째 인수는 `null`이다. `class="greeting"` 같은 정적 속성을 붙이면 props에 문자열 값이 들어가고, `onClick={handleClick}` 같은 동적 속성을 붙이면 `handleClick`을 참조하는 코드가 들어간다. [props를 조립하는 코드](https://github.com/superlucky84/lithent/blob/72222f3f7128d648b71b47f46f2865a7c9d3b2bc/packages/lithentTemplateParser/src/codegen/createElement.ts#L159)

앞서 묶은 조건 그룹은 삼항 연산자로 출력된다. 코드 생성기는 이미 연결된 두 분기에서 `ready`가 참일 때와 거짓일 때의 코드를 꺼내 붙이면 된다. [조건 코드 생성](https://github.com/superlucky84/lithent/blob/72222f3f7128d648b71b47f46f2865a7c9d3b2bc/packages/lithentTemplateParser/src/codegen/createElement.ts#L252)

<!-- prettier-ignore -->
```js
h('section', null, (ready) ? h('p', null, '준비 완료') : h('p', null, '대기 중'))
```

반복도 결국 자바스크립트 코드로 바뀐다. 예를 들어 `<li l-for={item in items} l-if={item.done}>{item.label}</li>`를 컴파일하면 `(items).map(item => (item.done) ? h('li', null, (item.label)) : null)`이 나온다. 같은 요소에 반복과 조건이 붙으면 반복이 바깥을 감싼다. 덕분에 조건이 실행될 때 콜백의 `item`을 읽을 수 있다. 템플릿의 실행 순서가 출력된 코드에 그대로 드러나는 부분이다. [반복 코드 생성과 조건 처리 순서](https://github.com/superlucky84/lithent/blob/72222f3f7128d648b71b47f46f2865a7c9d3b2bc/packages/lithentTemplateParser/src/codegen/createElement.ts#L213)

## 구현하다 만나는 경계들

### 어느 중괄호가 표현식을 닫는가

```html
<p>{format({ mark: '}' })}</p>
```

처음 보이는 `}`에서 읽기를 멈추면 문자열 값인 `'}'`에서 잘못 끊긴다. 객체를 닫는 그다음 `}`에서 멈춰도 바깥 표현식의 끝을 놓친다. 구현에서는 바깥 `{`를 읽고 깊이 1에서 시작한다. 안쪽 객체의 `{`에서 2가 되고, 따옴표 문자열은 통째로 건너뛴다. 객체가 닫히면 1, 마지막 `}`에 이르러야 0이다. 백틱 문자열 안에서 `${...}`를 만나면 그 안에 대해서는 같은 표현식 스캔 함수를 다시 부른다. 주석과 정규식 리터럴도 그 안의 중괄호를 세지 않도록 건너뛴다. [중괄호 경계 스캔](https://github.com/superlucky84/lithent/blob/72222f3f7128d648b71b47f46f2865a7c9d3b2bc/packages/lithentTemplateParser/src/docPipe/scan.ts#L175)

여기까지 찾으면 렉서는 `format({ mark: '}' })`를 표현식 토큰 하나로 넘길 수 있다. 자바스크립트 문법 검사는 이후 그 코드를 읽는 도구에 맡긴다. 예를 들어 `{value +}`는 닫는 중괄호를 찾을 수 있어 템플릿 컴파일 단계는 지나가지만, 생성 코드를 자바스크립트로 읽는 단계에서 문법 에러가 난다.

### 꺾쇠가 태그의 일부인지 알아보기

```html
<p title="a > b">{a < b}</p>
```

`title` 속성의 `>`는 따옴표 안에 있고, `{a < b}`의 `<`는 비교 연산자다. 실제 여는 태그를 끝내는 문자는 닫는 따옴표 뒤의 `>`다. `{items.map(item => <Card item={item} />)}`에는 화살표 뒤에 템플릿이 들어 있다. 화살표 뒤는 새 표현식이 시작할 수 있는 자리라 스캐너가 `<Card ... />`를 템플릿 후보로 본다. 코드 생성 중 이 내부 템플릿을 찾아 같은 컴파일 과정을 한 번 더 거치면 `items.map(item => h(Card, { item: item }))`이 된다. [표현식 안의 템플릿 변환](https://github.com/superlucky84/lithent/blob/72222f3f7128d648b71b47f46f2865a7c9d3b2bc/packages/lithentTemplateParser/src/codegen/createElement.ts#L328)

파일 전체를 변환할 때도 이 구분이 필요하다. `transformDocument()`는 자바스크립트 쪽에서 출발해 템플릿이 시작할 수 있는 위치를 찾는다. 예를 들어 `const label = '<p>예시</p>'`의 태그 모양은 문자열 리터럴의 일부라 건너뛴다. `const View = name => <p>Hello {name}!</p>`에서는 화살표 뒤의 템플릿 범위를 찾아 그 부분만 `compile()` 결과로 치환한다. `.ltsx`를 처리하는 Vite 플러그인도 이 경로를 쓴다. [문서 변환 진입점](https://github.com/superlucky84/lithent/blob/72222f3f7128d648b71b47f46f2865a7c9d3b2bc/packages/lithentTemplateParser/src/docPipe/index.ts#L42) · [Vite 플러그인의 호출](https://github.com/superlucky84/lithent/blob/72222f3f7128d648b71b47f46f2865a7c9d3b2bc/packages/lithentTemplateVite/src/plugin.ts#L209)

### 태그 사이의 `<`를 본문으로 남기기

본문에 `<`가 섞여 있으면 어디서 텍스트 읽기를 끝내야 할까?

```text
<p>1 < 2 그리고 3 < 4</p>
```

Vue 2의 HTML 파서는 `indexOf('<')`로 다음 `<`를 찾고, 그 위치에서 여는 태그나 닫는 태그, 주석 패턴이 시작하는지 확인한다. 어느 패턴에도 맞지 않으면 그 `<`를 본문에 포함한다. 후보 위치에서 잘라낸 문자열에 `indexOf('<', 1)`을 호출하면 방금 확인한 `<` 바로 뒤부터 다음 후보를 찾을 수 있다. 이때 **본문의 시작 위치는 그대로 두고 끝 후보만 뒤로 옮긴다.** [Vue 2의 텍스트 스캔 루프](https://github.com/vuejs/vue/blob/v2.6.14/src/compiler/parser/html-parser.js#L108-L133)

1. `< 2`의 `<`는 태그나 주석 패턴에 맞지 않으므로 본문에 들어간다.
2. `< 4`의 `<`도 같은 이유로 본문에 들어간다.
3. `</p>`가 닫는 태그 패턴에 맞으면 그 직전까지를 `1 < 2 그리고 3 < 4`라는 텍스트 한 덩어리로 잘라낸다. `</p>`는 다음 차례에서 태그로 처리한다.

중간에 `<em>`이 있었다면 거기서 먼저 텍스트를 끊고 여는 태그를 읽었을 것이다. `indexOf()`로 판단이 필요한 자리만 찾아가면 되고, 태그끼리 어떻게 중첩됐는지는 그다음 단계에서 처리한다.

내가 예전에 비슷한 코드를 보고 손바닥을 딱 쳤던 건 그 순서가 익숙해서였다. **먼저 끝을 찾아보고, 범위가 정해지면 그 앞까지 한 번에 소비한다.** 처음 `search()`를 만들 때 혼자 궁리했던 방식이, 태그 시작 패턴을 확인하는 룩어헤드와 함께 실제 파서에서도 쓰인다는 게 신기했다.

현재 Lithent의 `readText()`는 `<`에서 본문 읽기를 멈춘다. 같은 문장을 Lithent 템플릿에 쓰려면 `<p>{'1 < 2 그리고 3 < 4'}</p>`처럼 문자열 표현식에 넣을 수 있다. [Lithent의 readText()](https://github.com/superlucky84/lithent/blob/72222f3f7128d648b71b47f46f2865a7c9d3b2bc/packages/lithentTemplateParser/src/parser/lexer.ts#L438)

### 공백 한 칸을 남겨야 할 때

`<p><b>Hello</b> <i>world</i></p>`에서 두 요소 사이의 공백을 버리면 화면에는 `Helloworld`가 이어서 나온다. 처음 예제의 `Hello {name}!`에서도 `Hello` 뒤의 한 칸이 의미가 있다. 그래서 컴파일할 때 파서는 우선 공백을 텍스트 노드로 보존한다. 그다음 트랜스폼에서 인접한 텍스트를 합치고, 개행이 포함된 공백 전용 노드를 제거하고, 자식 목록 양끝에 있는 텍스트의 바깥쪽을 다듬는다.

`pre`와 `textarea` 안에서는 들여쓰기나 앞뒤 여백 자체가 내용이 될 수 있다. 두 태그에는 공백 제거와 양끝 다듬기를 끈 옵션을 내려보낸다. 그래서 아래 예제의 보간 앞 들여쓰기와 마지막 줄바꿈은 생성 코드에 남는다. [텍스트와 공백 최적화](https://github.com/superlucky84/lithent/blob/72222f3f7128d648b71b47f46f2865a7c9d3b2bc/packages/lithentTemplateParser/src/transform/optimize.ts#L41)

<!-- prettier-ignore -->
```html
<pre>
  Hello {name}
</pre>
```

<!-- prettier-ignore -->
```js
h('pre', null, '\n  Hello ', name, '\n')
```

## 다시 읽고 남은 것

AI와 이 코드를 만들 때 구현을 옆에서 살펴보고 예외 케이스도 검토했다. 시간이 지나 다시 열어 보니, 그때 이해했다고 생각한 세부 구현은 생각보다 많이 잊어버렸다. 그래도 어디에서 다시 시작할지는 알 수 있었다. `}`를 엉뚱한 곳에서 찾으면 스캐너를, `l-else`가 엉뚱한 형제에 붙으면 트리 변환을, 만들어진 호출의 인수가 틀리면 코드 생성기를 보면 된다.

나는 여전히 문자열을 다룰 때 정규식부터 떠올린다. 이 파서 안에서도 `l-for`가 `item in items`나 `(item, index) in items` 형태인지 확인하는 데 정규식을 쓴다. 태그의 중첩이나 따옴표 바깥의 닫는 괄호처럼 지금 어디를 읽는지가 중요해지면, 이제는 커서와 상태를 놓고 직접 읽는 방법도 떠올릴 수 있다. JSX가 어떻게 가능한지 궁금해서 시작했지만, 내게 오래 남은 건 다음에 비슷한 문자열을 만났을 때 덜 겁먹고 풀어볼 수 있다는 감각이었다. [l-for를 파싱하는 코드](https://github.com/superlucky84/lithent/blob/72222f3f7128d648b71b47f46f2865a7c9d3b2bc/packages/lithentTemplateParser/src/parser/parser.ts#L373)
