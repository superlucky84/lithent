# Lithent

필자가 만든 경량 가상돔 라이브러리의 [Lithent](https://github.com/superlucky84/lithent)의 전체 기능 설명을 문서로 남깁니다.

* 저장소 - [Link](https://superlucky84.github.io/lithent/)
* 가이드페이지 - [Link](https://superlucky84.github.io/lithent/)

## 소개

Lithent는 JSX를 기반으로 만들어진 경량(zip 3kb) 가상돔 UI 라이브러리입니다.

별도의 빌드 툴 없이도 스크립트로드 만으로 가볍게 사용할 수 있으며, 이미 그려진 html문서에 동적으로 빈번한 변경이 많은 DOM 영역을 가상돔과 연결하여 쉽게 업데이트하거나 제거할 수 있도록 고안되었습니다. 물론 빌드툴과 함께 사용해도 좋으며 SPA 페이지를 만드는 데 사용해도 좋습니다.

빌드툴과 함께 사용할 경우 JSX를 직접 사용할 수 있으며, 빌드 툴 없이 사용할 경우 라이브러리가 제공하는 [Tagged templates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates)를 사용하여 JSX와 매우 유사한 방식으로 사용할 수 있습니다.

컴포넌트를 정의할 때 고차함수 및 클로저의 특성을 이용하여 정의하고 재활용하는 방식을 기본 아이디어로 채택하여 개발했습니다.

* 목차
    * 기본 기능
        * 마운터
        * 업데이터
        * 리뉴어
        * 랜더
        * 마운트 콜백
        * 업데이트 콜백
    * 확장 기능
        * state 헬퍼
        * store 헬퍼
        * cacheUpdate 헬퍼
        * effect 헬퍼
        * computed 헬퍼
        * nextTick 헬퍼
    * lTag (Tagged templates 지원)

## 기본 기능

### 마운터

사용자는 Lithent가 제공하는 `mount`함수를 실행하여 컴포넌트를 만듭니다. **마운터**는 컴포넌트의 상태와 기능을 정의하며. 컴포넌트가 처음으로 가상돔으로 만들어질때 실행됩니다.

조금 더 자세하게 설명하자면, 사용자는 컴포넌트의 상태와 기능을 정의하는 함수를 만듭니다. 그리고 그 함수를 인자로 갖는 `mount` 함수가 실행되면 `mount`함수는 컴포넌트를 리턴해줍니다.

이 과정에서 사용자가 정의한 **'컴포넌트의 상태와 기능을 정의하는 함수'** 를 곧 **마운터** 라고 합니다.

**마운터**는 자신의 스코핑 내에 변수와 함수를 정의합니다. 여기서 정의한 변수와 함수가 곧 컴포넌트의 상태와 기능이 됩니다. **마운터**는 **업데이터**를 리턴합니다. 업데이트는 JSX를 리턴하는 함수인데 다음 항목에서 자세히 설명하겠습니다.

**마운터**를 정의할때 마운터의 첫번째 인자로 **리뉴어(renew함수)** 가 제공됩니다. **리뉴어** 는 컴포넌트를 업데이트 시킵니다. 그리고 두번째 인자로 props를 제공합니다. props는 컴포넌트의 애트리뷰터로 부터 정의되어 넘어온 값입니다.

아래는 마운터를 정의하고 컴포넌트를 만드는 실제 코드 예입니다. 컴포넌트는 count라는 상태와 increase라는 기능을 갖습니다. 그리고 JSX 템플릿을 만드는 함수를 리턴합니다. 타입스크립트를 사용할 경우 mount 함수는 제네릭으로 props의 타입을 정의할 수 있습니다.

```tsx
import { h, mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const Component = mount<{ increaseCount: number }>((renew, props) => {
  let count = 0;
  const increase = () => {
    count += props.increaseCount;
    renew();
  };

  return () => <button onClick={increase}>count: {count}</button>;
});

render(<Component increaseCount={1} />, document.getElementById('root'));
```


### 업데이터

업데이터는 마운터내에 정의되는 마운터가 리턴하는 함수입니다. 그리고 업데이터는 JSX를 리턴합니다. 업데이터가 실행되면 실제로 가상돔 객체가 만들어집니다. 왜 이름을 업데이터라고 지었냐면 실제로 이 함수는 컴포넌트가 업데이트 될때마다 실행되기 때문입니다.

마운터를 설명할때 예로 보여드렸던 컴포넌트를 다시 보겠습니다.

```tsx
const Component = mount((renew, props) => {
  let count = 0;
  const increase = () => {
    count += props.increaseCount;
    renew();
  };

  return (props) => <button onClick={increase}>count: {count.value}, increaseCount: {props.increaseCount}</button>;
});

render(<Component increaseCount={1} />, document.getElementById('root'));
```

주의깊게 봐야할 부분은 업데이터가 함수라는 것입니다.

업데이터는 컴포넌트의 상태를 돔에 반영하려고 할때마다 실행되는데, 마운터 내에 정의된 함수이기 때문에 클로저를 이용해 마운터의 변수 및 함수에 접근하여 사용할 수 있습니다.

업데이터는 첫번째 인자로 props를 제공받습니다. 물론 클로저를 이용하여 마운터에 있는 props를 참조할수도 있습니다. 아래 예제코드를 보십시오.

```
import { h, Fragment, render, mount } from 'lithent';

const Child = mount<{ count: number }>((_r, props) => {
  const { count: countFromMounter } = props;

  return ({ count: countFromUpdater }) => (
    <>
      <div>count: {props.count}</div>
      <div>count: {countFromMounter} ("call by value" not working)</div>
      <div>count: {countFromUpdater}</div>
    </>
  );
});

const Parent = mount(renew => {
  let count = 0;

  const change = () => {
    count += 1;
    renew();
  };

  return () => (
    <>
      <Child count={count} />
      <button onClick={change}>Increase</button>
    </>
  );
```

Child 컴포넌트의 업데이터는 3가지 방식으로 props에 들어있는 값을 참조하는 걸 볼수 있습니다. 여기서 마운터 props로 부터 미리 꺼내두고 참조하는 값(countFromMounter)은 값이 이미 새로운 메모리 번지로 할당되었기 때문에, 업데이터가 새로 실행되도 부모 props로 부터 변경된 값을 반영하지 못합니다. 클로저가 어떻게 작동하는지 정확히 알고있는 Javascript에 능숙한 개발자라면 그리 헷갈리는 상황은 아닙니다. 

### 리뉴어

  리뉴어는 마운터 함수의 첫번째 인자로 제공되는 `renew`함수입니다. `renew`가 실행되면 컴포넌트의 새로운 상태가 반영되어 그려집니다. 사용자는 마운터 내에 정의되는 이벤트 핸들러 함수에서 직접 사용할 수 있습니다. 어떻게 사용하는지는 앞선 예제들에서 많이 보여드렸으니 여기서는 예제코드를 생략하겠습니다.

리뉴어는 `state 헬퍼`나 `store 헬퍼`를 위해 사용될 수도 있는데, 자세한 내용은 뒤에서 자세히 설명하겠습니다.

### 랜더

Lithent는 render 함수를 제공합니다. render 함수는 가상돔과 가상돔이 그려질 실제 리얼돔 영역을 연결해줍니다.

많이 설명할 필요없이 아래 예제를 보면 바로 이해할수 있습니다.

```
/* index.html
<div>
  <span>1</span>
  <span>3</span>
  <span>5</span>
</div>
*/

import { h, render, mount } from 'lithent';

const Component = mount<{ value: number }>(() => ({ value }) => <span>{value}<span>);

render(<Component value={2} />, element, element.querySelector('span:nth-of-type(2)'));
render(<Component value={4} />, element, element.querySelector('span:nth-of-type(3)'));
```

SSR을 통해 주석처리된 index.html과 같은 DOM이 그려져 있을때, render를 이용해 비어있는 2와 4에 해당하는 가상돔을 있어야할 순서의 위치에 그려주고 있습니다.

render의 두번째 인자는 가상돔이 어떤 부모 밑에 그려져야 되는지 지정할수 있으며, 세번째 인자로 어떤 엘리먼트 앞에 그려져야 되는지 정할 수 있습니다. DOM API(insertBefore) 처럼 생각하면 됩니다. 만약 세번째 인자를 생략하면 appendChild가 됩니다.

### 마운트 콜백

컴포넌트로 부터 DOM객체가 생성되어 브라우저에 나타나는걸 마운트라고 합니다. 반대되는 개념인 언마운트는 컴포넌트가 브라우저에서 제거되는걸 의미합니다.

컴포넌트가 마운트되거나 언마운트 될때, 사용자가 지정해놓은 특정 함수가 실행되도록 할 수 있습니다. Lithent가 제공하는 `mountCallback` 함수로 등록할수 있습니다.

아래 예제를 보면 알 수 있듯이 마운트되고 나면 실행되는 함수를 등록할수 있고, 마운트콜백 함수가 리턴하는 함수는 언마운트 콜백으로 등록됩니다. 리턴은 생략하면 언마운트 콜백도 생략됩니다.

```tsx
import { h, mount, mountCallback } from 'lithent';

const Children = mount(
  (_r, props) => {
    mountCallback(() => {
      console.log('mounted');

      return () => {
        console.log('unmount');
      };
    });

    return () => <span>Children</span>;
  }
);
```

### 업데이트 콜백

컴포넌트의 상태가 변경되고 renew가 실행되면 컴포넌트가 업데이트 됩니다. 컴포넌트가 업데이트를 시작하기 전에 업데이트 콜백이 실행됩니다. 업데이트가 끝나 DOM객체에 반영된 후에는 업데이티드 콜백이 실행됩니다.

업데이트콜백은 Lithent가 제공하는 updateCallback을 통해 등록할수 있으며, 업데이트콜백이 리턴하는 함수는 업데이티드 콜백으로 등록됩니다. 리턴을 생략하면 업데이티드 콜백도 생략됩니다.

```
const Children = mount<{ count: number }>((_r, props) => {
  updateCallback(
    () => {
      console.log('clean up');

      return () => console.log('updated');
    },
    () => [props.count]
  );
  return ({ count }) => <span>child updated count: {count}</span>;
});
```

위 예제 코드를 보면 mountCallbackr과는 다르게 updateCallback 에는 두번째 인자가 있습니다. 컴포넌트내에 특정 상태가 변경될때만 콜백을 실행하기 위함입니다. 배열을 리턴하는 함수로 정의하며, 변경을 감지하고 싶은 값을 배열에 넣어주면 됩니다.

콜백이나 디팬던시에 props를 사용할때는 `props.` 프리픽스를 전부 다 붙여서 사용해야 정확히 비교됩니다. 왜냐하면 마운터는 컴포넌트가 마운트 될 때 한번만 실행되고 그 안에서 정의된 콜백함수들이나 def체크 함수는 컴포넌트가 업데이트 될 때마다 클로저를 이용해 props값에 접근하기 때문입니다. 앞서 업데이터 설명한 이슈와 같습니다.

## 확장 기능

lithent는 기본 기능만으로도 충분히 좋지만 기본 기능을 활용하여 조합하면 더욱 편리하게 사용할 수 있습니다.

사용자가 유용하게 사용할만한 기능들을 미리 코드로 작성해놨습니다. 사용자는 이 코드를 직접 import 하여 사용해도 좋고, 참고하여 새로운 형태의 확장코드를 만들어도 됩니다.

헬퍼 코드의 모든 구현은 [저장소](https://github.com/superlucky84/lithent/blob/master/helper/src/hook)에서 확인하세요.

### state 헬퍼

컴포넌트의 상태가 변경될 때마다 확인하여 `renew` 함수를 실행시키는 방식은 사용자가 직접 컴포넌트가 갱신되는 시기를 결정할 수 있으므로 그냥 그대로 사용해도 충분히 유용합니다. 하지만 너무 정밀하게 컴포넌트 갱신시점을 결정할 필요가 없고 그냥 값이 변경될 때 마다 컴포넌트를 업데이트하게 하고 싶다면 state 헬퍼를 사용하면 됩니다.

아래 코드를 보면 쉽게 사용법을 알수 있습니다.

> **state 사용법**

```tsx
import { h, Fragment, render, mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const Component = mount(renew => {
  const count = state<number>(1, renew);
  const increase = () => {
    count.value += 1;
  };

  return () => (
    <>
      <button type="text" onClick={increase}>
        increase
      </button>
      <span>count: {count.value}</span>
    </>
  );
});
```

state 헬퍼는 `renew` 함수를 특정 상태와 묶어주는 역할을 합니다.
아래 코드는 state 헬퍼 구현 코드입니다. 구현 원리는 간단 합니다. state는 초기값과 renew 함수를 받고 getter, setter를 가진 객체를 반환합니다. 이 객체는 값을 확인할 수 있고 값을 변경할 경우에는 renew를 실행시켜 줍니다.


> **state 구현**
```ts
export const state = <T>(
  value: T,
  renew: () => boolean
): {
  value: T;
  v: T;
} => {
  let result = value;

  return {
    get value() {
      return result;
    },
    set value(newValue: T) {
      result = newValue;
      renew();
    },
  };
};
```

### store 헬퍼

store 헬퍼는 모든 컴포넌트 전역에서 사용할수 있는 객체를 공유합니다. 이 store 객체를 공유받은 컴포넌트는 값을 공유받는 동시에 자신의 renew 권한을 store헬퍼에 공유할 수 있습니다.

store 헬퍼는 객체의 형태로 사용자가 원하는 데이터 구조를 정의합니다. 아래 예제에서는 문자열 타입으로 text 속성을 넘버 타입의 count 속성을 정의 하였습니다. store 헬퍼가 실행되면 공유할 데이터를 컴포넌트에 할당해주는 `할당자`를 리턴합니다. 아래 예제 코드에서는 `assignShardStore`가 할당자 입니다.

할당자는 컴포넌트 마운터 내에서 사용되며 첫번째 인자로 컴포넌트의 `리뉴어(renew)`를 할당받고 실행됩니다. 할당자는 공유데이터를 프록시 객체를 통해 컴포넌트에게 제공합니다.

공유된 프록시 객체에 공유되고 있는 특정 속성이 변경되면, 그 값을 공유하고 있는 모든 컴포넌트가 업데이트 됩니다.

할당자 함수의 두번째 인자를 통해 공유되는 스토어 객체에 특정 속성에 대해서만 감지하고 사용하도록 할 수 있습니다. 두번째 인자는 함수의 형태이며 아래 예제처럼 사용하고 싶은 값만 정의하여 배열로 나열하여 리턴해 주면 됩니다. 속성 전체를 전부 사용하고 싶다면 두번째 인자를 생략하면 됩니다.

> **store 사용법**
```tsx
import { h, Fragment, render, mount } from 'lithent';
import { store } from 'lithent/helper';

/*
<div>
  <span>1</span>
  <span>2</span>
  <span>3</span>
</div>
*/

const assignShardStore = store<{ text: string; count: number }>({ text: 'sharedText', count: 3 });

const Component = mount(r => {
  // The value of "shardStore.count" is null.
  // To get the value, you must include it in the second argument, the function return array.
  // If you omit the second argument, then all values in the store are fetched.
  const shardStore = assignShardStore(r, (store) => [store.text]);
  const changeInput = (event) => {
    shardStore.text = event.target.value;
  };
  return () => <textarea type="text" onInput={changeInput} value={shardStore.text} />;
});

render(<Component />, element, element.querySelector('span:nth-of-type(2)'));
render(<Component />, element, element.querySelector('span:nth-of-type(3)'));
```

store 헬퍼의 구현 방법은 state 헬퍼의 구현방법과 유사합니다. 다만 store 헬퍼는 state 헬퍼와는 다르게 여러 컴포넌트의 `renew`를 가지고 있을 수 있으므로, unmount되어 사라진 컴포넌트의 리뉴어를 항상 확인하여 제거 해줘야 합니다. 이미 제거된 리뉴어를 실행하면 리턴 값으로 false를 반환하는 특성을 이용하여 이를 구현합니다..

store의 구현 코드는 모든 헬퍼 코드 중 가장 복잡하지만 그래봤자 100줄도 안되므로 어렵지 않게 파악 가능합니다. 코드는 [(저장소)](https://github.com/superlucky84/lithent/blob/master/helper/src/hook/store.ts)에서 확인 가능합니다.


### cacheUpdate 헬퍼

업데이터에 cacheUpdate 함수를 사용하여 감싸주면, 불필요한 상태에서는 리렌더링이 발생하지 않도록 설정할 수 있습니다..

컴포넌트의 prop이나 state 또는 다른 어떠한 형태의 상태라도 리렌더링을 시도하는 시점에 이전 상태와 변경된 상태의 값을 비교하여, 값이 같다면 더이상 업데이트를 시도하지 않도록 합니다.

예제를 보면 사용법을 쉽게 알 수 있습니다. 아래의 예는 count1의 값만 컴포넌트의 이전 상태와 확인하여 캐시해주고 있습니다. 오직 count1의 값만 확인하며 count2의 값이 변경되어도 컴포넌트는 업데이트 되지 않습니다.


```tsx
import { h, Fragment, render, mount } from 'lithent';
import { cacheUpdate } from 'lithent/helper';

const Component = mount(renew => {
  const count1 = state<number>(0, renew);
  const count2 = state<number>(0, renew);

  const insCount1 = () => {
    count1.value += 1;
  };
  const insCount2 = () => {
    count2.value += 1;
  };

  return cacheUpdate(
    () => [count1.value],
    () => (
      <Fragment>
        depth1: {count1} - {count2}
        <button onClick={insCount1}>insCount1</button>
        <button onClick={insCount2}>insCount2</button>
      </Fragment>
    )
  );
});

render(<Component />, document.getElementById('root'));
```

### effect 헬퍼

effect 헬퍼는 `mountCallback`과 `updateCallback`을 혼합하여 react의 useEffect와 같은 효과를 내도록 만든 코드입니다.

첫번째 인수는 마운트 또는 업데이트 후에 실행된다. 두번째 인수는 컴포넌트가 언마운트되거나 업데이트하기 전에 실행됩니다. 세 번째 인수는 특정 값이 변경될 때만 업데이트를 감지하도록 종속성을 넣을 수 있으며 생략할 경우 모든 업데이트시 항상 업데이트 콜백이 실행됩니다.

  주의해야할 점은 세 번째 인수는 배열을 반환하는 것 "함수"여야 합니다. 그리고 effect 헬퍼도 다른 기능들과 마찬가지로 마운터의 모든 값에 클로저를 이용해 접근하므로, 사용 하려는 값의 call by value, call by reference 상태를 잘 확인하고 사용해야 합니다.

```ts
import { h, Fragment, render, mount } from 'lithent';
import { state, effect } from 'lithent/helper';

const Children = mount((r, props) => {
  const count = state<number>(0, r);
  const change = () => {
    count.v += 1;
  };

  effect(
    () => console.log('INJECT'),
    () => console.log('CLEAN UP'),
    () => [count.v]
  );

  return () => (
    <>
      <button onClick={change} type="button">
        increase
      </button>
      <span>count: {count.v}</span>
    </>
  );
});
```

### computed 헬퍼

computed 헬퍼는 복잡한 계산식을 JSX 표현식 내에서 중복으로 사용할 경우 템플릿이 다소 복잡해 보일 수 있으므로, 미리 값을 계산하여 쉽게 사용할 수 있게 해주는 코드 입니다.

아래는 computed 헬퍼를 사용하는 간단한 예 입니다.

```tsx
import { h, Fragment, render, mount } from 'lithent';
import { computed } from 'lithent/helper';

const Component = mount(renew => {
  let count = 0;
  const increase = () => {
    count += 1;
    renew();
  };

  const computed = computed<number>(() => {
    return [1, 3, 5, 7, 9].reduce((accumulator, current) => accumulator + current * count, 0);
  });

  return () => (
    <Fragment>
      <button type="text" onClick={increase}>
        increase
      </button>
      <span>computed: {computed.value}</span>
    </Fragment>
  );
});

render(<Component />, document.getElementById('root'));
```

### nextTick 헬퍼


넥스트틱 헬퍼는 다음 DOM 업데이트 플러시를 기다리는 유틸리티입니다. 사용자는 컴포넌트의 변경 요청 후, 가상돔이 실제 DOM에 완벽하게 적용된 시점을 보장받은 후 이후 작업을 진행하기 위해 넥스트틱 헬퍼를 사용할 수 있습니다. 예를 들면 특정 이벤트 후 변경되는 컴포넌트의 상태를 테스트 하기위해 사용할 수 있습니다.

Lithent는 동시에 여러번 컴포넌트의 업데이트 요청이 일어나거나 동시에 복수의 컴포넌트의 업데이트가 필요할 경우 불필요한 내부 동작을 줄이기 위해 [queueMicrotask](https://developer.mozilla.org/en-US/docs/Web/API/queueMicrotask)를 사용하여 리랜더링 요청들을 하나로 모아 적절한 시점에 한번에 실행시켜줍니다.

넥스트틱 헬퍼는 브라우저의 마이크로테스크큐에 쌓인 리랜더 요청이 모두 끝난 후 실행 되어야 하는 콜백을 마이크로테스크큐의 맨 마지막에 추가로 넣어줍니다.

```js
nextTick().then(() => {
  expect(testWrap.outerHTML).toBe(
    '<div><button>insCount1</button><button>insCount2</button><span>depth1: 0 - 0</span> </div>'
  );
});
```

## lTag (Tagged templates 지원)

lTag를 사용하면 JSX와 유사한 사용법으로 별도의 트랜스파일러 없이 일반 Javascript 구문을 사용하여 개발할 수 있습니다.

lTag는 [HTM](https://github.com/developit/htm)을 Lithent의 `h(createElement)`와 미리 바인딩 해 놓은 [Tagged templates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates)입니다

아래의 예 처럼 사용할수 있습니다.

```ts
<script src="https://cdn.jsdelivr.net/npm/lithent@1.7.0/dist/lithent.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lithent@1.7.0/helper/dist/lithentHelper.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lithent@1.7.0/tag/dist/lithentTag.umd.js"></script>

<script>
const { h, Fragment, render, mount } = lithent;
const { state } = lithentHelper;
const { lTag } = lithentTag;

const Component = mount((renew, props) => {
  const count = state(0, renew);

  const change = () => {
    count.value += props.propValue;
  };

  // Updater
  return () => lTag`
    <${Fragment}>
      <li>count: ${count.value}</li>
      <button onClick=${change}>increase</button>
    <//>
  `;
});

// appendChild or insertBefore
// The third argument is an optional value for insertBefore.
const destroy = render(lTag`<${Component} propValue=${1} />`, document.getElementById('root'), document.getElementById('#insert-before-this-element'));

</script>
```


