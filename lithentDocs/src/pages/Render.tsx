import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const Render = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Render
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      render() 함수란?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      render() 함수는{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        컴포넌트를 실제 DOM에 마운트
      </strong>
      하는 함수입니다. Virtual DOM을 실제 DOM으로 변환하여 지정한 컨테이너
      요소에 렌더링합니다.
      <br />
      <br />
      render() 함수는{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        destroy 함수를 반환
      </strong>
      하여, 나중에 컴포넌트를 언마운트할 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { render, mount } from 'lithent';

const App = mount((renew) => {
  let count = 0;

  const increase = () => {
    count += 1;
    renew();
  };

  return () => (
    <div>
      <p>Count: {count}</p>
      <button onClick={increase}>Increase</button>
    </div>
  );
});

// 컴포넌트를 #root 요소에 렌더링
const destroy = render(<App />, document.getElementById('root'));

// 나중에 언마운트
// destroy();`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      render() 함수의 첫 번째 인자는 렌더링할 Virtual DOM이고, 두 번째 인자는
      컨테이너 요소입니다. 컨테이너를 지정하지 않으면 기본적으로 document.body에
      렌더링됩니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      render() 함수의 시그니처
    </h2>

    <CodeBlock
      language="tsx"
      code={`render(
  wDom: VirtualDOM,           // 렌더링할 Virtual DOM
  wrapElement?: HTMLElement,  // 컨테이너 요소 (기본값: document.body)
  afterElement?: HTMLElement  // insertBefore 참조 요소 (선택적)
): () => void                 // destroy 함수 반환`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      render() 함수는 3개의 매개변수를 받습니다:
      <br />
      <br />•{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">wDom</strong>
      : 렌더링할 Virtual DOM (필수)
      <br />•{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        wrapElement
      </strong>
      : 컨테이너 요소 (선택적, 기본값: document.body)
      <br />•{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        afterElement
      </strong>
      : 특정 요소 앞에 삽입할 때 사용하는 참조 요소 (선택적)
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      기본 사용법
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      가장 일반적인 사용법은 컴포넌트를 특정 DOM 요소에 렌더링하는 것입니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { render, mount } from 'lithent';

const Greeting = mount(() => {
  return () => <h1>Hello, Lithent!</h1>;
});

// HTML의 #app 요소에 렌더링
render(<Greeting />, document.getElementById('app'));

// 또는 document.querySelector 사용
render(<Greeting />, document.querySelector('.container'));

// 컨테이너를 지정하지 않으면 body에 렌더링
render(<Greeting />);`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      언마운트하기
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      render() 함수가 반환하는 destroy 함수를 호출하면 컴포넌트를 DOM에서
      제거하고, 등록된 이벤트 리스너를 정리하며, 등록된 cleanup 콜백을
      실행합니다.
      <br />
      <br />
      컴포넌트가 언마운트될 때 정리 작업(타이머 해제, 이벤트 리스너 제거 등)이
      필요하다면{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        mountCallback 훅
      </strong>
      을 사용합니다. mountCallback에서 cleanup 함수를 반환하면, 컴포넌트가
      언마운트될 때 자동으로 실행됩니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { render, mount, mountCallback } from 'lithent';

const Timer = mount((renew) => {
  let count = 0;

  // mountCallback으로 마운트 시 작업 등록
  mountCallback(() => {
    // 마운트 시 타이머 시작
    const intervalId = setInterval(() => {
      count += 1;
      renew();
    }, 1000);

    // cleanup 함수 반환 - 언마운트 시 자동 실행
    return () => {
      clearInterval(intervalId);
    };
  });

  return () => <div>Elapsed: {count} seconds</div>;
});

const destroy = render(<Timer />, document.getElementById('root'));

// 5초 후 타이머 컴포넌트 제거
setTimeout(() => {
  destroy(); // 컴포넌트 언마운트 및 cleanup 함수 실행
}, 5000);`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      destroy() 함수를 호출하면:
      <br />
      <br />
      1. mountCallback이 반환한 cleanup 함수 실행
      <br />
      2. 모든 이벤트 리스너 제거
      <br />
      3. DOM에서 요소 제거
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      insertBefore로 특정 위치에 삽입하기
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      세 번째 매개변수인 afterElement를 사용하면 특정 요소 앞에 컴포넌트를
      삽입할 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { render, mount } from 'lithent';

const NewItem = mount(() => {
  return () => <li>New Item</li>;
});

// HTML 구조:
// <ul id="list">
//   <li>Item 1</li>
//   <li id="item2">Item 2</li>
//   <li>Item 3</li>
// </ul>

const container = document.getElementById('list');
const referenceElement = document.getElementById('item2');

// Item 2 앞에 New Item 삽입
render(<NewItem />, container, referenceElement);

// 결과:
// <ul id="list">
//   <li>Item 1</li>
//   <li>New Item</li>      ← 여기에 삽입됨
//   <li id="item2">Item 2</li>
//   <li>Item 3</li>
// </ul>`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      이 기능은 동적으로 특정 위치에 컴포넌트를 삽입해야 할 때 유용합니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      여러 컴포넌트 렌더링하기
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      여러 개의 독립적인 컴포넌트를 각각 다른 위치에 렌더링할 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { render, mount } from 'lithent';

const Header = mount(() => {
  return () => <header>Header</header>;
});

const Sidebar = mount(() => {
  return () => <aside>Sidebar</aside>;
});

const Content = mount(() => {
  return () => <main>Content</main>;
});

// 각 컴포넌트를 독립적으로 렌더링
const destroyHeader = render(<Header />, document.getElementById('header'));
const destroySidebar = render(<Sidebar />, document.getElementById('sidebar'));
const destroyContent = render(<Content />, document.getElementById('content'));

// 필요시 개별적으로 언마운트 가능
// destroyHeader();
// destroySidebar();
// destroyContent();`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 참고:
        </span>{' '}
        대부분의 경우 하나의 루트 컴포넌트만 렌더링하는 것이 권장됩니다. 여러
        컴포넌트를 렌더링해야 한다면, 하나의 부모 컴포넌트 안에 자식 컴포넌트로
        구성하는 것이 상태 관리와 데이터 흐름 측면에서 유리합니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      render()의 동작 원리
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      render() 함수가 호출되면 다음과 같은 과정이 진행됩니다:
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ol class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            1.
          </span>
          <span>Virtual DOM을 실제 DOM 요소로 변환 (wDomToDom)</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            2.
          </span>
          <span>컨테이너에 요소 추가 (appendChild 또는 insertBefore)</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            3.
          </span>
          <span>mountCallback 훅 실행 (등록된 경우)</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            4.
          </span>
          <span>mountReadyCallback 훅 실행 (등록된 경우)</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            5.
          </span>
          <span>destroy 함수 반환</span>
        </li>
      </ol>
    </div>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      이 과정을 통해 Virtual DOM이 실제 브라우저 화면에 표시되고, 라이프사이클
      훅이 적절한 순서로 실행됩니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/portal"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/portal');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          기본 기능: Portal →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          컴포넌트를 부모 DOM 계층 외부로 렌더링하는 Portal 기능을 알아보세요.
          <br />
          모달, 툴팁 등을 구현할 때 유용한 Portal의 사용법을 배워봅시다.
        </p>
      </a>
    </div>
  </div>
);
