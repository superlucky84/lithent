import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const PropsKo = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Props
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Props란?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Props는 부모 컴포넌트에서 자식 컴포넌트로 데이터를 전달하는 방법입니다.
      <br />
      <br />
      Props는{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        마운터의 두 번째 인자
      </strong>
      로 제공되며,{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        Updater의 첫 번째 인자
      </strong>
      로도 제공됩니다. 인스턴스 내부의 props는 생명주기 동안 동일한 참조를
      유지합니다. 처음 <code>h()</code>에 전달한 외부 객체와 같은 참조라는
      보장은 아닙니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, render } from 'lithent';

type Props = { name: string; age: number };

const UserCard = mount<Props>((renew, props) => {
  // props는 마운터의 두 번째 인자

  return (propsFromUpdater) => (
    // props는 Updater의 첫 번째 인자로도 제공됨
    <div>
      <h2>{props.name}</h2>
      <p>Age: {props.age}</p>
    </div>
  );
});

render(
  <UserCard name="Alice" age={25} />,
  document.getElementById('root')
);`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      TypeScript를 사용할 때는 mount 함수의 제네릭으로 Props 타입을 정의할 수
      있습니다. 이를 통해 타입 안정성을 확보할 수 있습니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Props 객체의 참조와 외부에서 갱신하기
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      1.25.2부터 diff 밖에서 생성한 컴포넌트는 props의 얕은 복사본을 받습니다.
      <code>render()</code> 전에 호출하는 최상위 <code>h(Comp, props)</code>도
      해당합니다. 같은 노드를 다른 위치에 그려도 각 인스턴스가 서로 영향을 주지
      않도록 하기 위한 동작입니다. 중첩된 객체나 배열은 참조를 공유하며, 깊은
      복사는 아닙니다. 외부 객체를 변경하는 것만으로 렌더가 예약되지는 않습니다.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      export된 <code>componentUpdate(compKey)</code>는 인스턴스를 조회하여 갱신
      함수를 반환하는 저수준 API입니다. 키는 인스턴스 자신의 props 객체이며,
      임의의 외부 데이터 객체가 아닙니다. 반환된 함수를 호출하면 갱신 액션을
      찾아 호출한 경우 <code>true</code>, 찾지 못하면 경고 없이{' '}
      <code>false</code>를 반환합니다. <code>true</code>는 DOM 반영이 이미
      완료되었다는 뜻은 아닙니다.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      애플리케이션에서는 <code>mount</code>가 제공하는 <code>renew</code>나{' '}
      <code>lmount</code>의 초기화 중 호출한 <code>useRenew()</code>를
      사용하세요. 원본 props를 수정하고{' '}
      <code>componentUpdate(originalProps)()</code>를 호출하던 방식은 위
      인스턴스를 찾지 못합니다. 호출만 <code>renew()</code>로 바꿔도 인스턴스의
      복사된 props에 외부 변경이 전달되지는 않습니다.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      외부 데이터와 연동할 때는 부모가 렌더마다 최신 데이터를 읽고 자식에게 새
      props를 전달하게 하세요. 부모의 <code>renew</code>를 보관해 외부에서
      갱신을 요청할 수 있습니다:
    </p>

    <CodeBlock
      language="ts"
      code={`import { h, mount, nextTick, render } from 'lithent';

const Label = mount<{ text: string }>((_renew, props) =>
  () => h('p', {}, props.text)
);
const data = { text: 'a' };
let refresh = () => false;

const Host = mount(renew => {
  refresh = renew;
  return () => h(Label, { ...data });
});

const root = document.getElementById('root')!;
const destroy = render(h(Host, {}), root);

data.text = 'b';
refresh();
await nextTick();
// root.innerHTML === '<p>b</p>'

// 연동을 제거할 때:
destroy();
refresh = () => false;`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      자식은 인스턴스를 유지하며 일반적인 부모 갱신 경로로 최신 props를
      받습니다. props 참조와 조회 키에 관한 규칙은 lithent-concurrent에도
      동일하게 적용됩니다. 미룬 렌더의 완료를 기다려야 한다면 해당 코어의
      스케줄링 API를 사용하세요.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Props 접근 방법과 주의사항
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Props는 컴포넌트의 생명주기 동안 동일한{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        참조(reference)
      </strong>
      를 유지합니다. 이는 매우 중요한 특성으로, Props에 접근하는 방식에 따라
      다른 결과를 얻을 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

type Props = { count: number };

const Counter = mount<Props>((renew, props) => {
  // ⚠️ 주의: 마운터에서 구조분해 할당
  const { count: countFromMounter } = props;

  return ({ count: countFromUpdater }) => (
    <>
      {/* ✅ 항상 최신 값 - props 객체를 직접 참조 */}
      <div>count: {props.count}</div>

      {/* ❌ 고정된 값 - 마운터에서 분해한 primitive 값 */}
      <div>count: {countFromMounter} (업데이트 안 됨)</div>

      {/* ✅ 항상 최신 값 - Updater에서 받은 props */}
      <div>count: {countFromUpdater}</div>
    </>
  );
});

const Parent = mount(renew => {
  let count = 0;

  const increase = () => {
    count += 1;
    renew();
  };

  return () => (
    <>
      <Counter count={count} />
      <button onClick={increase}>Increase</button>
    </>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      위 예제에서 버튼을 클릭하면:
      <br />
      <br />•{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        props.count
      </code>{' '}
      - ✅ 1, 2, 3... 정상적으로 증가
      <br />•{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        countFromMounter
      </code>{' '}
      - ❌ 0으로 고정 (primitive 값 복사)
      <br />•{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        countFromUpdater
      </code>{' '}
      - ✅ 1, 2, 3... 정상적으로 증가
    </p>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ 중요:</span> 마운터에서 props를 구조분해
        할당하면 그 시점의 값이 <strong>복사</strong>됩니다. Primitive
        타입(number, string, boolean)의 경우 "call by value"로 동작하므로, 이후
        props가 업데이트되어도 마운터에서 분해한 변수는 업데이트되지 않습니다.
        <br />
        <br />
        항상 최신 값을 얻으려면{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          props.속성명
        </code>
        으로 직접 접근하거나, Updater에서 받은 props를 사용하세요.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      함수를 Props로 전달하기
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Props를 통해 데이터뿐만 아니라 함수도 전달할 수 있습니다. 이를 통해 자식
      컴포넌트에서 부모 컴포넌트의 상태를 변경할 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

type ChildProps = {
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
};

const CounterDisplay = mount<ChildProps>((renew, props) => {
  return () => (
    <div>
      <h2>Count: {props.count}</h2>
      <button onClick={props.onIncrement}>+</button>
      <button onClick={props.onDecrement}>-</button>
    </div>
  );
});

const Parent = mount(renew => {
  let count = 0;

  const increment = () => {
    count += 1;
    renew();
  };

  const decrement = () => {
    count -= 1;
    renew();
  };

  return () => (
    <CounterDisplay
      count={count}
      onIncrement={increment}
      onDecrement={decrement}
    />
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      함수는 참조 타입이므로, props를 통해 전달된 함수는 항상 부모 컴포넌트의
      클로저를 유지합니다. 따라서 자식 컴포넌트에서 부모의 상태를 안전하게
      변경할 수 있습니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      객체와 배열 Props
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      객체나 배열을 props로 전달할 때는 참조가 전달되므로, 마운터에서 구조분해
      할당을 해도 객체/배열 내부의 속성은 최신 상태를 유지합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

type User = { name: string; age: number };
type Props = { user: User };

const UserCard = mount<Props>((renew, props) => {
  // 객체는 참조 타입이므로 구조분해 해도 OK
  const { user } = props;

  return () => (
    <div>
      <h2>{user.name}</h2>
      <p>Age: {user.age}</p>
      {/* props.user로 접근해도 동일한 결과 */}
      <p>Age: {props.user.age}</p>
    </div>
  );
});

const Parent = mount(renew => {
  const user = { name: 'Alice', age: 25 };

  const increaseAge = () => {
    user.age += 1;
    renew();
  };

  return () => (
    <>
      <UserCard user={user} />
      <button onClick={increaseAge}>Increase Age</button>
    </>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      객체나 배열은 참조 타입이므로, 마운터에서 구조분해 할당을 하더라도 그
      참조를 복사하는 것입니다. 따라서 객체/배열 내부의 값이 변경되면 정상적으로
      업데이트됩니다.
    </p>

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 참고:
        </span>{' '}
        객체나 배열을 props로 전달할 때는 불변성(immutability)을 유지하는 것이
        좋습니다. 객체의 속성을 직접 변경하는 대신, 새로운 객체를 생성하여
        전달하면 예측 가능한 상태 관리가 가능합니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      lmount에서의 Props
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      lmount를 사용할 때도 Props의 동작 방식은 동일합니다. renew가 없을 뿐,
      props 접근 방법과 주의사항은 mount와 같습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

type ChildProps = {
  title: string;
  onClose: () => void;
};

const Modal = lmount<ChildProps>((props) => {
  return () => (
    <div>
      <h2>{props.title}</h2>
      <button onClick={props.onClose}>Close</button>
    </div>
  );
});

const Parent = lmount(() => {
  const isOpen = lstate(false);

  const openModal = () => {
    isOpen.value = true;
  };

  const closeModal = () => {
    isOpen.value = false;
  };

  return () => (
    <>
      <button onClick={openModal}>Open Modal</button>
      {isOpen.value && (
        <Modal title="Hello Modal" onClose={closeModal} />
      )}
    </>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/children"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/children');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Core: Children →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          컴포넌트가 감싸는 자식 요소들인 Children에 대해 알아보세요.
          <br />
          Lithent에서 children이 props와 별도로 관리되는 방식을 배워봅시다.
        </p>
      </a>
    </div>
  </div>
);
