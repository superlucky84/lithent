* 목차
  * 개요
  * 템플릿 문법을 위한 트랜스파일러 구현
    * jsx의 이해
    * 템플릿 문자열 파싱하기
    * 1단계 문자열 분석하여 태그 트리 만들기
    * 2단계 - 태그 트리 노드 하나의 문자열을 분석(태그 노드)
    * 2단계 - 태그 트리 노드 하나의 문자열을 분석(태그 내 텍스트 노드)
    * 3단계 - 완성된 태그트리를 바탕으로 함수호출 문자열 생성
    * vitejs에 연결하기
  * 가상돔 만들기
  * 가상돔으로 부터 실제 dom 만들기
  * 가상돔 업데이트 하기
    * 가상돔 업데이트는 데이터 변경 지점부터
    * diff 알고리즘
    * 생성 지연 시키기
    * 구 컴포넌트의 값 상속하기
    * 상속없이 클로저 활용하기
    * useState구현
  * 리얼 돔 업데이트하기
  * 결말

# 나만의 짝퉁 React 제작기

필자는 회사에서 자바스크립트 프레임웍인 React를 자주 사용한다. React를 사용하면 순수 자바스크립트로 많은 공을 들여 구현하던 코드를 훨씬 간단히 만들 수 있다. 마법처럼 느껴질 정도다.

마법 같은 React가 편리하지만 가끔 마음 한편에선 공포가 느껴지곤 했다. React가 마법처럼 느껴진다는 건 React가 동작하는 원리를 충분히 파악하고 있지 못하다는 것이고, 문제가 생겼을 때 스스로 해결하기 어렵다는 걸 알기 때문이다.

단편적인 궁금점을 기술 블로그나 여러 문서를 통해 공부해 보기도 했지만, 이런 노력에도 불구하고 리액트가 계속 마법(=공포)으로 느껴지는 이유는 프레임웍을 만족할 정도로 파악하지 못했기 때문이다.

React를 걱정 없이 사용할 정도로 이해하기 위해서 직접 리액트처럼 동작하는 코드를 구현해 보고 싶은 욕망이 들었고, 틈틈이 공부하며 만들다 보니 나만의 짝퉁 React를 만들게 되었다.

다 만들고 보니 기쁜 마음이 들었다. 공부한 내용을 공유하여 기쁨을 나눠 보고자 한다.

## 템플릿 문법을 위한 트랜스파일러 구현

필자는 jsx처럼 html태그 형식의 표현을 함수 호출 형태로 변경하는 트랜스파일러를 구현해보았다. react를 공부하기 위한 구현이므로 문법도 jsx와 유사하게 만들었다.

우선 jsx에 대해 알아보자.

### jsx의 이해 

jsx는 javascript를 확장한 문법이다. javascript와 html표현이 섞여있는 특수한 규칙을 갖는 문자열이다.

jsx를 실제로 사용하기 위해서는 태그 형태를 이해하는 javascript 파서를 만들어 babel이나 esbuild 같은 트랜스파일러를 연결해 브라우저에서 실행 가능한 형태로 변경해야 한다.

jsx의 html 태그 부분의 문자열들이 변경된 형태는 함수 호출 형태이다. 함수가 html 계층 구조에 따라 순서대로 실행되는 걸 이용해 가상돔을 만들 수 있다.

javascript 파서를 공부해서 jsx구문 분석을 위한 확장을 직접 만들어 보는 것도 도움이 됐겠지만, 우선순위가 높은 다른 공부 거리가 많기 때문에 이번에는 간단히 태그 형태의 문자열을 파싱 하여 함수 호출 형태의 문자열로 바꾸는 트랜스파일러를 만들어 보았다.

### 템플릿 문자열 파싱하기

우선 다른 템플릿 문법 파서들이 어떻게 구현되어 있는지 `vuejs`나 `svelte`같은 오픈소스의 코드를 찾아보았다(모방은 창조의 어머니다).

오픈소스 코드들 대부분 문자열 커서와 트리 자료구조를 활용하여 구문 분석을 구현한다는 걸 알아내었다. 깊게 코드를 파악하진 못했지만 대강의 구현원리를 알아낸 뒤, 스스로 충분히 구현 가능하겠다는 생각이 들었을 때 무작정 코드를 작성하기 시작했다.

목표는 태그 문자열을 분석하여 함수 형태의 형태로 변경하는 것이다. 생각했던 부분까지 단계적 목표를 세워가며 전부 구현하고 나니 4단계 처리를 통해 목표한 결과를 얻게 되었다.

jsx를 공부하기 위한 목적으로 시작했기 때문에 자연스럽게 jsx와 유사한 사용자 인터페이스를 갖도록 만들었다. 다만 jsx는 javascript문법을 확장하여 만들어졌기 때문에 if문이나 반복문 같은 문법은 javascript 문법을 그대로 사용할 수 있는 반면, 필자의 구현은 간단한 문자열 변환을 이용해 만들었기 때문에 if문이나 반복문은 태그 내에 특수한 속성(디렉티브)을 만들어 대체하였다.

아래는 필자의 템플릿 문자열 파싱을 위한 4단계 과정을 간략하게 정리한 내용이다.

### 1단계 - 문자열 분석하여 태그 트리 만들기

1단계 목표는 아래 예시처럼 html 형태의 원본 문자열로부터 태그의 부모 자식 관계를 알 수 있는 트리구조 객체로 변환하는 것이다. 

변환된 객체를 살펴보면 `s` 속성은 태그의 이름을 포함한 모든 애트리뷰트 문자열을 가지고 있고 `hasChildren`은 자식 태그를 갖고 있는지의 `boolean`값 `children`은 실제 하위 태그들의 정보이다.

```js
// 원본 문자열
`<div class="root">
  <button onClick={handle}>one{two}three</button>
  <button onClick={handle2}>onetwothree</button>
  <button onClick={handle3}>cc</button>
</div>`

// 결과 객체
{
  s: "div class=\"root\""
  hasChildren: true
  children: Array(3)
    0: {s: 'button onClick={handle}', hasChildren: true, children: Array(1) …}
    1: {s: 'button onClick={handle2}', hasChildren: true, children: Array(1),  …}
    2: {s: 'button onClick={handle3}', hasChildren: true, children: Array(1),  …}
}
```

### 2단계 - 태그 노드에서 태그네임과 속성을 파악

다음 단계는 트리의 노드 하나를 분석하여 태그 네임과 애트리뷰트 문자열을 분리하는 것이다.

단순히 1단계의 `s` 속성에서 `tagName`과 `props`를 분리한다.

```js
{
  tagName: "div"
  props: "{ lass: \"root\" }"
  hasChildren: true
  children: Array(3)
    0: {tagName: "button", props: "{ onClick: handle }", hasChildren: true, children: Array(1) …}
    1: {tagName: "button", props: "{ onClick: handle2 }",  hasChildren: true, children: Array(1),  …}
    2: {tagName: "button", props: "{ onClick: handle3 }", hasChildren: true, children: Array(1),  …}
}
```

### 3단계 - 텍스트 노드에서 단순 문자열과 표현식을 분리

애초부터 jsx를 흉내 낸 템플릿 문법을 생각했기 때문에 중괄호 내에 있는 문자열은 javascript의 표현식이다.

예시 코드의 text 속성을 보면 알 수 있듯이 텍스트 문자는 표현식과 일반 텍스트를 콤마로 분리하였다. 일반 문자열은 홑 따움표로 표기하였고 표현식은 홑 따움표가 없다.

```js
// 원본 문자열
`<div class="root">
  <button onClick={handle}>one{two}three</button>
  ...
</div>`

// 변환된 객체
{
  children: Array(3)
    0: {tagName: "button", props: "{ onClick: handle }", hasChildren: true, children: Array(1) …}
      children: Array(1)
        0: {texts: "'one', two, 'three'", children: Array(0)}
      ...
}
```


### 4단계 - 완성된 태그 트리를 바탕으로 함수 호출 문자열 생성

4단계는 3단계까지 변환된 객체를 바탕으로 트리를 순회하면서 함수 호출 형태의 문자열을 만들어 주는 것이다.

최종 완성된 모습은 아래와 같다.

```
h('div', { class: "root" }, 
   h('button', { onClick: handle }, 'one', two, 'three'),
   h('button', { onClick: handle2 }, 'onetwothree'),
   h('button', { onClick: handle3 }, 'cc')
);
```

실제 구현한 코드는 [저장소](https://github.com/superlucky84/wwact/blob/master/packages/compiler/src/compiler.js)에서 확인할 수 있다.

### vitejs에 연결하기

필자는 평소 웹팩이나 바벨 외에 다른 도구를 사용해 본 적이 없어서 아쉬움이 있었는데, 이번에는 공부하는 김에 **vitejs**를 사용해 보았다.

따라서 완성된 트랜스파일러는 **vitejs** 플러그인을 통해 연결했다. **vitejs** 의 기본 예제만 보고 변경시키는 함수 하나만 딸랑 넣어서 만들었다. 많이 부족하지만 일단 생각한 대로 동작은 한다 (실제 서비스에 사용할 정도로 만들기 위해서는 더 많은 부분이 고려되어야 한다.)

아래는 결과 코드인데, 보면 알 수 있듯이 `<template>` 태그 내에 문자열을 추출해 목적 문자열로 변경시킨 후 replace 시켰다.

```js
import { parse } from "@wwact/compiler";
const fileRegex = /\.(wwx)$/

export default function myPlugin() {
  return {
    name: 'vite:wwx',

    transform(src, id) {
      if (fileRegex.test(id)) {

        const code = src.replace(/<template>((.|[\/S\/s])*)<\/template>/ms, (_m, template) => {
          return parse(template);
        });

        return {
          code,
          map: null // provide source map if available
        }
      }
    }
  }
}
```

템플릿 문법을 대표하는 확장자명을 **.wwx**로 정했는데, 구현하고 보니 **.wwx** 확장자를 위한 문법 하이라이팅이나 필자가 좋아하는 도구인 **prettier**를 통한 autofix가 새로운 확장자에 대해 정상적으로 동작하지 않는 문제가 있다.

아쉬운대로 필자가 사용하는 에디터에서는 **.wwx**확장자를 **.js**처럼 취급하도록 설정하였고 **prettier**의 autofix는 **eslint**의 autofix로 대체하여 사용하면 된다.


## 가상돔 만들기

가상돔은 트리구조의 자바스크립트 객체다. **jsx**가 트랜스파일러에 의해 함수 호출의 형태로 변경된다. 사용자가 정의한 **jsx** 태그의 계층 구조에 따라 `h` 라는 함수를 실행해 준다. 따라서 프레임웍 구현자가 `h`함수를 적절히 구현하면 사용자가 정의한 태그에 계층 구조를 그대로 갖는 가상돔을 만들 수 있다.

아래의 예제 코드를 보면 알 수 있듯이 `h` 함수의 첫 번째 인자는 태그명, 두 번째 인자는 태그의 속성이며, 3번째 인자부터는 자식 노드에 해당하는 `h`함수가 순서대로 정의된다. 예를 어떤 태그가 3개의 하위 태그를 가지고 있다면 그 태그를 표현하는 함수의 인자는 5개가 될 것이다.


실제로 `h`함수를 구현하여 원하는 가상돔을 만들기 위해서는 `h`함수의 실행 순서를 파악할 필요가 있다. 아래의 예에서 `h`함수의 실행 순서는 `item1을 가진 li태그`, `item2를 가진 li`, `ul`, `div`, `section` 의 순서대로 함수가 실행될 것이다.

* jsx
```jsx
// jsx 정의
<section>
  <div class="wrap">
    <ul>
      <li>item1</li>
      <li>item2</li>
    </ul>
  </div>
</section>
```

* 트랜스파일된 h함수
```js
h('section', null, 
  h('div', { class: 'wrap' }, 
    h('ul', null, 
      h('li', null, 'item1'),
      h('li', null, 'item2'),
    )
  )
);
```


### 첫번째 인자

`h`함수의 첫 번째 인자에는 세 가지 타입이 올 수 있다. 위의 예제 코드처럼 html 형태의 표현일 경우는 문자열 형태로 정의되며, `Fragment` 또는 `Component`일 경우에는 함수의 형태로 정의된다.

`h`함수와 `Fragment`함수의 구현은 프레임웍 제작자의 몫이며, 컴포넌트 함수의 구현은 프레임웍 사용자의 몫이다.

아래의 코드는 필자가 구현한 `Fragment`함수이다. 리턴되는 객체의 `type` 속성은 `fragment`,  자식 태그의 노드들을 갖는 `children` 속성을 반환한다.

```js
function Fragment(_props: Props, ...children: WDom[]) {
  return { type: 'fragment', children };
}
```

아래 예제는 첫 번째 인자의 타입별 `h`함수로 변경된 예시이다. `Fragment`와 `Component`에 해당하는 `h`함수의 첫 번째 인자는 함수 자체임을 알 수 있다.

* jsx
```js
<Fragment>
  <Custom />
  <div>ss</div>
</Fragment>
```

* 트랜스파일된 h함수
```js
h(Fragment, null,
  h(CustomElement, null),
  h("div", null, "ss")
);
```

아래의 예에서 `Custom`이라는 컴포넌트가 실행되면 만들어지는 객체의 형태를 확인해보자. 

* Custom 컴포넌트

```js
export default function Custom() {
  const data = useState({ k: 1 });

  return (
    <Fragment>
      <button>{data.k}</button>
      <div>ss</div>
    </Fragment>
  );
}
```

* 완성된 가상돔 객체
```js
{
  "type":"fragment",
  "children":[
    {
      "type":"element",
      "tag":"button",
      "props":{},
      "children":[ { "type":"text", "text":1 } ],
    },
    {
      "type":"element",
      "tag":"div",
      "props":{ },
      "children":[ { "type":"text", "text":"ss" } ],
    }
  ],
}
```

## 가상돔으로 부터 실제 dom 만들기

`h`와 `Fragment`를 구현하여 원하는 형태의 가상돔을 완성했다. 하지만 가상돔만으로는 아무 쓸모가 없다. 가상돔을 실제 돔으로 변경할 수 있어야 한다.

아래 코드는 가상돔을 실제 돔으로 만드는 예제이다. `toDom`을 재귀 호출하여 가상돔 트리를 순회하면서 실제돔을 만든다.

코드는 단순하다 가상돔의 타입에 따라 `fragment`나 `element` 또는 `text`노드를 만든다. 자식 노드들도 전부 같은 방식으로 만들어 준다. 자식 노드들은 부모 노드에 `appendChild` 시킨다.

```js
function toDom(vDom) {
  let element;
  const { type, tag, text, props, children = [] } = vDom;
  const isFragment = type === 'fragment';

  if (isFragment) {
    element = new DocumentFragment();
  } else if (type === 'element' && tag) {
    element = document.createElement(tag);
  } else if (type === 'text' && isExisty(text)) {
    element = document.createTextNode(text);
  }

  const elementChildren = children.reduce(
    (acc, childItem) => {
      acc.appendChild(toDom(childItem));

      return acc;
    },
    new DocumentFragment()
  );

  element.appendChild(elementChildren);

  return element;
}
```

## 가상돔 업데이트하기

### 상태 변경 지점으로부터 새로운 가상돔 만들기

컴포넌트의 상태가 변경되면 변경된 컴포넌트를 루트로 하는 가상돔을 새로 만든다.

아래의 이미지를 살펴보자, 빨간 노드에서 변경이 시작되면 파란 부분에 해당하는 하위 노드들도 전부 데이터에 의존성을 갖으므로 다시 만들어 준다.

가상돔을 다시 만들어 주는 이유는 기존 가상돔과 비교하여 변경된 부분을 리얼돔에 어떻게 반영할지(엘리먼트 자체를 새로 만들어 교체할지 또는 속성만 변경할지 등등...)을 결정하기 위함이다.

| 오리지널 가상돔 | 새롭게 만들 가상돔 |
| -- | -- |
| ![diffa](https://user-images.githubusercontent.com/9898422/187079065-f8c226e4-db0c-46f0-9fef-220e3a283dfe.png) | ![diffb](https://user-images.githubusercontent.com/9898422/187079073-cc8b7ab3-2ed9-494f-a305-682be6a1cefe.png) |


파란 노드들에 해당하는 가상돔을 만들어주려면, 빨간 노드에 해당하는 컴포넌트 함수를 재실행시켜주면 된다.

새로운 노드를 만들 때 주의할 점은 기존 노드의 상태를 전달받아 상태가 반영된 노드를 만들어야 한다. 상태란 `useState`로 만들어준 값을 말한다.

 예를 들어 위 이미지의 빨간 노드에 해당하는 컴포넌트 생성 함수가 아래 예시 코드의 `CustomRoot`라고 가정해 보자. 

`CustomRoot` 의 `valueA`값이 변경되면 새롭게 만들어지는 가상돔의 루트 노드와 오리지널 가상돔의 루트 노드는 항상 같은 노드(교체가 아닌 업데이트를 해야 하는)라고 판단할 수 있다.

하지만 루트 노드의 첫 번째 자식 노드는 `valueA`가 홀수나 짝수 값인지 여부에 따라 `CustomA`가 될 수도 있고 `CustomB`가 될 수도 있으므로 새롭게 만들어지는 노드가 오리지널 노드와 항상 같은 노드라고 단정하기 어렵다. 이런 경우 오리지널 노드와 새로운 노드가 같은 노드인지 다른 노드인지 비교하여 판단할 수 있는 규칙(diff 알고리즘)이 필요하다.


```js
fucntion CustomRoot() {
  const [valueA] = useState(1);

  return () => (
    <div>
      { valueA % 2 === 0 ? <CustomA /> ?  <CustomB />}
      <span>node</span>
    </div>
  )
}
```

오리지널과 같은 노드라고 판단될 경우에만 값을 상속하여 업데이트해주고 틀린 노드라고 판단되는 경우, 데이터 상속 없이 새로운 가상돔을 만들어 준다.


## diff 알고리즘

필자는 diff 알고리즘을 [react문서](https://ko.reactjs.org/docs/reconciliation.html)를 참고하여 구현하였다.

중요한 요점을 파악하고 나니 diff 알고리즘 구현이 생각보다는 어렵지 않았다.

요점은 결정론적 관점으로 접근하는 것이다. 같은 컴포넌트 함수로부터 만들어지는 가상돔의 형태는 컴포넌트의 상태(state값)에 따라 미리 파악 가능한 몇 가지의 형태로 이미 결정되어 있다.

 예를 들어 아래의 코드를 보면 `Custom` 함수로부터 만들어지는 노드의 자식 노드 개수는 항상 2개이다. valueA 값에 따라 첫 번째 자식 노드는 `customA`가 될 수도 있고 `null`이 될 수도 있지만 null 자체도 type이 null인 가상돔으로 취급 한다면 `Custom`로 만들어지는 노드의  자식 노드 개수는 항상 2개다.

```js
fucntion Custom() {
  const [valueA] = useState(1);

  return () => (
    <div>
      { valueA % 2 === 0 ? <CustomA /> ?  null}
      <span>node</span>
    </div>
  )
}
```

그러므로 새로 만들어지는 가상돔은 기존 가상돔과 항상 유사한 형태를 가지며, 같은 깊이 같은 순서의 노드끼리 딱 한 번만 비교하는 것만으로 **diff알고리즘**을 구현할 수 있다.

같은 깊이 같은 순서의 노드끼리 비교하여 같은 노드라고 판단되면 컴포넌트 상태 값 변화로 인해 영향을 받는 속성 값만 업데이트해주고 하위 노드들도 같은 방법으로 비교해준다. 만약 틀린 노드라고 판단되면  하위 노드들도 전부 새로운 노드라고 판단할 수 있으므로 통째로 교체해 준다.

아래는 필자가 생각해본 **가상돔 비교 케이스**이다.

1. 하위 노드 통째로 교체해 버려야 되는 경우
    1. 태그 이름 또는 컴포넌트 함수가 다를 때
    2. Fragment일 경우 자식 노드의 개수가 틀릴 때
2. 1번에 해당하지 않을 경우 노드의 오리지널에서 state 상속,  props 교체 후 childrene도 같은 방법으로 비교
    1. props와 state가 오리지널 가상돔과 얕은 비교를 통해 완전히 같다면 children을 교체하지 않고 끝냄
    2. props와 state가 오리지널 가상동과 얕은 비교를 통해 틀리다면 children을 루프톨면서 배교해줌
3. loop 타입의 자식 노드들은 key값을 비교하여 동일 여부를 판단한다.


### 생성 지연시키기

새로운 가상돔 만들 때, 한 번에 모든 트리를 전부 다시 만들면 하위 트리를 제대로 비교할 수 없다. 왜냐하면 컴포넌트 함수가 실행될 때 컴포넌트가 어떤 상태를 갖고 있느냐에 따라 가상돔 트리의 형태가 달라질 수 있기 때문이다.

아래의 예를 보자.

`props`으로 넘겨받은 `valueA`의 값이 짝수냐 홀수냐에 따라 하위 트리의 형태가 바뀌게 된다.

또한 중간에 custom2와 같이 컴포넌트 함수를 갖는 노드를 만나면 `Custom2`로부터 만들어지는 하위 트리들은 컴포넌트의 `props`나 `state`값에 의해 전혀 다른 형태의 트리를 만들 수 있다.

따라서 새로운 트리를 만들기 위해 계층구조를 순회하는 도중에 컴포넌트 함수를 갖는 노드를 만나면 함수 실행을 지연시켜야 한다. 왜냐하면 위에서 설명한 **가상돔 비교 케이스** 의 1번과 2번을 판단하기 전에 컴포넌트 함수가 실행되면 2번 케이스의 오리지널 노드로부터 `state`나 `props` 값을 전달받아 생성하는 일이 불가능하기 때문이다

```js
function Custom1(props){
  const { valueA, valueB } = props;

  return (
    <div>
      {
        valueA % 2 === 0 : (
          <ul>
            <li>{valueB}</li>
            <li>2</li>
          </ul>
        ) : (
          <Custom2 valueA={valueA + 1} />
        )
      }
    </div>
  );
}
```


### 구 컴포넌트의 값 상속하기

오리지널 가상돔 노드와 새로운 노드 사이의 상태 전달은  어떻게 구현할까?

구현 방법에는 여러 가지가 있을 수 있다. 필자는 특정 컴포넌트 노드와 state값을 Symbol값을 통해 연결해주는 방식을 사용하였다.

설명을 돕기위해 state값이 재활용되는 시나리오를 작성해 보았다.

1. 컴포넌트 함수가 실행되기 전에 고유한 `Symbol` 값을 정의한다.
2. 컴포넌트 함수가 실행되면, 컴포넌트 함수 내에 `useState` 함수도 실행된다.
3. `useState`함수가 어떤 컴포넌트 함수 내에서 실행되었는지 알 수 있으며, 컴포넌트 함수에 해당하는 `Symbol` 값도 알 수 있다.
4. `useState`를 통해 만들어진 state의 키값으로 컴포넌트 함수에 해당하는 `Symbol`값을 사용한다.
5. 리랜더를 위해 컴포넌트 함수가 재실행될 때 오리지널 노드의 Symbol값을 넘겨받은 후 연결되는 state를 찾아 재활용한다.

아래는 이해를 돕기 위한 `useState` 수도 코드이다. `value` 객체는 컴포넌들의 `state`값을 관리하는 객체다. 키값으로 컴포넌트 노드에 해당하는 `Symbol`을 갖고 있기 때문에 update를 위해 새로 실행되는 컴포넌트 함수에 오리지널 노드의 Symbol값을 전달하여 실행시킨다면 오리지널 노드와 새로운 노드 사이에 state 상태 값 전달을 구현할 수 있다.

```js
const value = {};
const useState = (initValue, vdomKey = Symbol()) => {
  if (!value[vdomKey]) {
    value[vdomKey] = initValue;
  }

  const setData = newValue => {
    value[vdomKey] = newValue;
  };

  return [value[vdomKey], setData];
};
```


### 상속 없이 클로저 활용하기

 필자는 위에 설명한 `Symbol`값을 사용한 `state` 상속 외에 다른 방법도 생각해보았다.

가상 돔을 업데이트할 때 기존 컴포넌트 함수 내에서 사용되는 `state`나 변수, 메서드들을 클로저로 유지하는 방법이다.

리랜더링을 위해 컴포넌트 함수를 직접 실행하는 대신, 아래의 코드처럼 태그 정의 부분을 함수로 만든 후 가상돔 리랜더링이 필요한 경우 컴포넌트 함수 대신 사용하면 오리지날 노드에서 사용하던 `state`나 변수들을 별 다른 추가 코드 없이 클로저를 이용해 재사용 가능하다.


```js
function Custom(props){
  const [ valueA, setValueA ] = useState(7);

  return () => (
    <Fragment>
      <button onClick={() => setValueA(valueA + 1)}>increase</button>
      <Custom2 valueA={valueA} />
    </Fragment>
  );
}
```

### useState 구현

 `useState`가 클로저를 이용해 구현되었다는 것을 어느 기술 블로그에서 본 적이 있다. 아래 코드는 알고 있던 사실을 바탕으로 무작정 `useState`를 구현한 코드다.

```js
let value;

const useState = initValue => {
  if (!value) {
    value = initValue;
  }

  const setData = newValue => {
    value = newValue;
  };

  return [value, setData];
};

export default function CustomElement(props, children) {
  const [v, setV] = useState(props.vava);
  ...
}
```

위 코드의 요점은 아래와 같다.

1. 마운트를 위해 컴포넌트 함수와 컴포넌트 함수 내에 `useState`가 실행되며 초기값 `initValue`가 `value`에 세팅된다
2. 컴포넌트 업데이트를 위해 컴포넌트 함수가 실행될 때 사용되는 `useState`에서는 클로저로 세팅된 `value`변수를 찾아온다.

무작정 작성해본 위 코드에 크게 두 가지 문제점이 있다는 걸 파악했다.

첫 번째는 하나의 컴포넌트에서 여러 개의 `useState`가 실행될 때 value가 하나이므로 하나의 값뿐이 처리할 수 없다.

두 번째는 하나의 컴포넌트 함수가 여러 개의 컴포넌트를 만들 때 위 코드는 모듈 내에 value가 하나이므로 여러 컴포넌트에 대해 처리할 수 없다.

### 첫번째 문제의 해결방법

아래의 코드는 하나의 컴포넌트에서 여러 개의 `useState`가 실행되는 경우를 해결한 코드이다.

`value`가 여러 개의 `state` 값을 기억할 수 있도록 배열로 변경하였다. 그리고 `useState`에 실행 순서를 담는 `stateCallSeq` 값을 키로 사용하여 `state`를 세팅하고 찾을 수 있도록 하였다.

```js
const value = [];
let stateCallSeq = 0;

const useState = (initValue, vdomKey) => {
  const currentSubSeq = stateCallSeq;

  if (!value[currentSubSeq]) {
    value[currentSubSeq] = initValue;
  }

  const setData = newValue => {
    value[currentSubSeq] = newValue;
  };

  stateCallSeq += 1;

  return [value[currentSubSeq], setData];
};

export default function CustomElement(props, children) {
  currentSubSeq = 0;
  const [v, setV] = useState(props.vava);
  const [k, setK] = useState(props.vava);
  ...
}

```

### 두 번째 문제의 해결방법

이어서 아래의 코드는 두 번째 문제를 해결한 코드이다. `state`를 관리하는 `value`가 여러 개의 컴포넌트에 대한 값을 감당할 수 있도록 객체로 변경하고 키값을 컴포넌트 키값에 의해 확장되도록 하였다.

```js
const value =  {}
const useState = (initValue, componentKey) => {
  if (!value[componentKey] || !value[componentKey][currentSubSeq]) {
    value[vdomKey] ??= [];
    value[vdomKey][currentSubSeq] = initValue;
  }

  const setData = newValue => {
    value[componentKey][currentSubSeq] = newValue;
  };

  stateCallSeq += 1;

  return [value[componentKey][currentSubSeq], setData];
};
```

이 밖에도 React의 `useState`와 같은 인터페이스로 동작하도록 하기 위해서는 여러 가지 추가 처리를 해줘야 한다. 필자가 프로토타이핑해본 코드는 [저장소](https://github.com/superlucky84/jwVDomPrototype/blob/master/src/hook/useState.js)에서 확인할 수 있다.


## 리얼 돔 업데이트하기

다음 단계는 업데이트된 가상돔을 바탕으로 리얼 돔에 반영하는 단계이다.

아래는 필자가 가상돔을 비교한 후 실제 돔에 업데이트해줘야 하는 상태를 일곱 가지 케이스로 정리했다.

#### 1. (REPLACE). 비교할 오리지널 노드가 있었지만 새로운 노드와 같은 타입이 아닌 경우 해당 위치의 엘리먼트 자체를 교체해준다.

가상돔 diff시 비교 대상인 원본 노드가 있지만 생성되는 태그 네임이 오리지널과 틀려 다른 노드라고 판단될 경우 오리지널 노드에 해당하는 원본 엘리먼트의 자리에 새로운 엘리먼트를 만들어서 교체해준다.

#### 2. (ADD). 비교할 오리지널 노드가 없으면 새로 추가되는 dom으로 판단한다.

위 1번 (REPLACE) 케이스의 하위 노드들은 전부 새로 추가해줘야 하는 노드로 판단하고 새로운 html 엘리먼트를 만들어서 추가한다.

#### 3. (UPDATE). 오리지널이 있고 같은 타입이면 dom의 속성만 변경해 주며, 텍스트 노드일 경우는 텍스트를 교체해준다.

오리지널 노드와 새롭게 만들어진 노다가 diff 알고리즘에 의해 같은 타입이라고 판단되는 경우 html엘리먼트에 애트리뷰트나 속성만 변경해준다. 

#### 4. (DELETE). 오리지널 노드가 있지만 새롭게 만들어진 노드의  타입이 null타입일 경우 dom을 삭제한다.

#### 5. (SORTED-REPLACE). loop의 경우 REPLACE라도 키값에 의해 순서가 변경될 수 있으므로 새로운 dom을 단순히 기존 위치에 교체하지 않고 새로 삼입 하여 정렬한다.

반복문에 의해 만들어진 loop 타입의 자식 노드들은 같은 순서상의 노드를 비교는 방식을 사용하지 않고 같은 depth에 있는 노드들의 키값을 전부 비교하여 같은 키 값을 찾는다.

앞서 설명한 REPLACE의 경우라도 오리지널 노드와 새로운 노드가 트리의 같은 순서에 있다고 보장할 수 없다. 따라서 루프타입의 자식 노드들은 같은 자리에 바로 교체하지 않고 실제 리얼돔 트리에서 한번 제거 후, 새로 dom을 만들어 다시 정확한 순서의 위치를 찾아서 넣어주는 방식으로 삽입 정렬을 해준다.

#### 6. (SORTED-UPDATE). loop의 경우 UPDATE라도 키값에 의해 순서가 변경될 수 있으므로 재 삽입하여 정렬한다.

앞서 5번 케이스(SORTED-REPLACE)에서 설명한 바와 같은 상황이지만 REPLACE 해줘야 하는 상황이 아닌 UPDATE 해줘야 하는 상황이다.

원래 있던 자리의 dom을 그대로 사용하지만 순서만 다시 정렬해주기 위해 한번 실제 리얼 dom 트리에서 제거 후 삽입한다.

#### 7. (NONE). text타입의 경우 text가 같다면 변경이 필요 없으므로 방치한다.

텍스트 타입의 경우 오리지널 노드의 텍스트와 새로운 노드의 텍스트가 일치한다면 그냥 놔둔다. 앞서 설명한 diff 알고리즘의 2-1번의 해당할 경우에도 NONE타입으로 처리하면 된다.

## 결말

위와 같은 과정을 거쳐 나만을 위한 커스텀 프레임워크를 완성하였다.

오직 학습과 실험의 과정에서 만들어졌기 때문에 완성도와 사용성은 많이 부족하다. 하지만 시작의 한 발을 내디뎠으니 계속 공부하다 보면 더 좋은걸 만들어 낼 수 있을 것이라는 희망을 품어 본다.

필자에게 React는 더 이상 마법이 아니다. 그냥 재미있는 자바스크립트다.

완성된 코드는 [깃헙 저장소](https://github.com/superlucky84/wwact)에서 확인할 수 있다.
