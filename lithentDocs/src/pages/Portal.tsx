import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const Portal = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Portal
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Portal이란?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Portal은{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        컴포넌트를 부모 DOM 계층 외부로 렌더링
      </strong>
      하는 기능입니다.
      <br />
      <br />
      일반적으로 컴포넌트는 부모의 DOM 트리 안에 렌더링됩니다. 하지만{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        모달(Modal)
      </strong>
      이나{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        툴팁(Tooltip)
      </strong>
      처럼 화면 위에 떠 있어야 하는 UI는 부모의{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        overflow: hidden
      </code>{' '}
      이나{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        z-index
      </code>{' '}
      때문에 가려지거나 잘릴 수 있습니다.
      <br />
      <br />
      Portal을 사용하면 이런 문제를 해결할 수 있습니다. 컴포넌트의 상태와
      생명주기는 부모와 함께 유지하면서도, DOM 상에서는 완전히 다른 위치에
      렌더링됩니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      가장 간단한 Portal 사용법
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Portal을 사용하는 가장 일반적인 방법은{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        document.body
      </code>
      에 렌더링하는 것입니다. 모달을 예로 들어보겠습니다:
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, portal } from 'lithent';

const Modal = mount<{ onClose: () => void }>(() => {
  return ({ onClose }) => (
    <div class="modal-overlay" onClick={onClose}>
      <div class="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Modal Title</h2>
        <p>This modal is rendered outside the parent DOM!</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
});

const App = mount((renew) => {
  let showModal = false;

  const openModal = () => {
    showModal = true;
    renew();
  };

  const closeModal = () => {
    showModal = false;
    renew();
  };

  return () => (
    <div class="app-container" style="overflow: hidden; position: relative;">
      {/* 부모 컨테이너에 overflow: hidden이 있어도 */}
      <h1>My App</h1>
      <button onClick={openModal}>Open Modal</button>

      {/* 모달은 document.body에 렌더링되어 정상 표시됨 */}
      {showModal && portal(
        <Modal onClose={closeModal} />,
        document.body
      )}
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      위 예제에서 App 컴포넌트의 컨테이너에{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        overflow: hidden
      </code>
      이 적용되어 있지만, Modal은 document.body에 렌더링되므로 아무 문제없이
      화면 전체를 덮을 수 있습니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Portal API
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      portal() 함수는 두 개의 인자를 받습니다:
    </p>

    <CodeBlock
      language="tsx"
      code={`import { portal } from 'lithent';

portal(
  wDom,           // 렌더링할 Virtual DOM
  targetElement   // 대상 HTMLElement (예: document.body)
)`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      •{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">wDom</strong>
      : 렌더링할 컴포넌트나 JSX 요소
      <br />•{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        targetElement
      </strong>
      : Portal이 렌더링될 실제 DOM 요소
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      HTML에 미리 정의된 컨테이너 사용하기
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      대규모 앱에서는 HTML에 Portal 전용 컨테이너를 미리 만들어두는 것이
      좋습니다. 이렇게 하면 모달, 툴팁 등을 계층적으로 관리할 수 있습니다:
    </p>

    <CodeBlock
      language="html"
      code={`<!-- index.html -->
<!DOCTYPE html>
<html>
<body>
  <div id="root"></div>
  <!-- Portal 전용 컨테이너들 -->
  <div id="modal-root"></div>
  <div id="tooltip-root"></div>
</body>
</html>`}
    />

    <CodeBlock
      language="tsx"
      code={`import { mount, portal } from 'lithent';

const Toast = mount<{ message: string; type: 'success' | 'error' }>(() => {
  return ({ message, type }) => (
    <div class={\`toast toast-\${type}\`}>
      {message}
    </div>
  );
});

const App = mount((renew) => {
  let toastMessage = null;

  const showSuccess = () => {
    toastMessage = { message: 'Success!', type: 'success' };
    renew();

    // 3초 후 자동으로 사라짐
    setTimeout(() => {
      toastMessage = null;
      renew();
    }, 3000);
  };

  return () => (
    <div>
      <button onClick={showSuccess}>Show Toast</button>

      {/* modal-root 컨테이너에 렌더링 */}
      {toastMessage && portal(
        <Toast {...toastMessage} />,
        document.getElementById('modal-root')!
      )}
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      이 방식의 장점:
      <br />
      <br />
      • 모달, 툴팁 등을 용도별로 분리하여 z-index 관리가 쉬움
      <br />
      • CSS 스타일링이 명확해짐
      <br />• 디버깅 시 DOM 구조 파악이 쉬움
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      중첩된 컴포넌트에서 Portal 사용하기
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Portal은 깊게 중첩된 컴포넌트에서도 작동합니다. 컴포넌트의 상태와
      생명주기는 부모와 함께 유지됩니다:
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount, portal } from 'lithent';

// 중첩된 자식 컴포넌트
const ConfirmDialog = mount<{ message: string; onConfirm: () => void }>(() => {
  return ({ message, onConfirm }) => (
    <div class="dialog">
      <p>{message}</p>
      <button onClick={onConfirm}>Confirm</button>
    </div>
  );
});

// 중간 컴포넌트
const UserCard = mount<{ name: string }>((renew) => {
  let showDialog = false;

  const deleteUser = () => {
    showDialog = true;
    renew();
  };

  const confirmDelete = () => {
    console.log('User deleted!');
    showDialog = false;
    renew();
  };

  return ({ name }) => (
    <div class="card">
      <h3>{name}</h3>
      <button onClick={deleteUser}>Delete</button>

      {/* 중첩된 컴포넌트에서도 Portal 사용 가능 */}
      {showDialog && portal(
        <ConfirmDialog
          message={\`Delete \${name}?\`}
          onConfirm={confirmDelete}
        />,
        document.body
      )}
    </div>
  );
});

// 부모 컴포넌트
const App = mount(() => {
  return () => (
    <div class="app" style="overflow: hidden;">
      <UserCard name="Alice" />
      <UserCard name="Bob" />
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      이 예제에서 UserCard 컴포넌트는 App의 자식이고, ConfirmDialog는 UserCard의
      자식입니다. 하지만 Dialog는 document.body에 렌더링되므로 App의{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        overflow: hidden
      </code>
      에 영향받지 않습니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Portal의 동작 원리
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Portal은 내부적으로 다음과 같이 동작합니다:
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <ol class="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            1.
          </span>
          <span>
            <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
              portal(wDom, element)
            </code>{' '}
            호출 시 'portal' 타입의 특수한 Virtual DOM 노드 생성
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            2.
          </span>
          <span>
            렌더링 시 Portal 노드는 부모 DOM 트리에 추가되지 않고, 지정된
            HTMLElement를 컨테이너로 사용
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            3.
          </span>
          <span>
            Portal 내부의 컴포넌트는 부모 컴포넌트와 동일한 상태와 생명주기 공유
          </span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            4.
          </span>
          <span>부모가 renew()를 호출하면 Portal 내부도 함께 업데이트됨</span>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">
            5.
          </span>
          <span>부모가 언마운트되면 Portal 내부도 함께 정리됨</span>
        </li>
      </ol>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      주의사항
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ 이벤트 버블링:</span> Portal로 렌더링된
        요소에서 발생한 이벤트는 <strong>컴포넌트 트리를 따라 버블링</strong>
        됩니다. DOM 트리와는 무관합니다. 예를 들어, Modal 내부의 클릭 이벤트가
        부모 컴포넌트로 전파될 수 있으므로{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          e.stopPropagation()
        </code>
        을 사용해야 할 수 있습니다.
        <br />
        <br />
        <span class="font-medium">⚠️ CSS 스타일:</span> Portal로 렌더링된 요소는
        대상 위치의 CSS를 상속받습니다. 부모 컴포넌트의 스타일은 상속되지
        않으므로, Portal 컴포넌트는 독립적인 스타일을 가져야 합니다.
        <br />
        <br />
        <span class="font-medium">⚠️ 서버 사이드 렌더링:</span> Portal은
        브라우저 환경에서만 동작합니다. SSR 환경에서는{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          typeof window !== 'undefined'
        </code>{' '}
        체크가 필요할 수 있습니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음 단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/mount-hooks"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/mount-hooks');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          기본 기능: Mount Hooks →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          컴포넌트의 마운트 시점에 실행되는 mountCallback과 mountReadyCallback
          훅에 대해 알아보세요.
          <br />
          컴포넌트 생명주기를 제어하는 방법을 배워봅시다.
        </p>
      </a>

      <a
        href="/examples/20"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/examples/20');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          예제: 이미지 갤러리 라이트박스 →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          overflow:hidden 갤러리 밖으로 Portal을 사용해 전체 화면 라이트박스를
          띄우는 예제를 직접 실행해 보세요.
        </p>
      </a>
    </div>
  </div>
);
