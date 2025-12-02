import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const Lstore = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Lstore Helper
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      lstore란?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      lstore는{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        전역 상태를 관리하는 헬퍼
      </strong>
      로, store의 lmount 전용 버전입니다.
      <br />
      <br />
      lstore의 핵심은{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        useStore() 메서드가 내부적으로 useRenew()를 자동 호출
      </strong>
      하여, 수동으로 renew를 전달할 필요가 없다는 점입니다.
      <br />
      <br />
      여러 컴포넌트에서 동일한 상태를 공유할 수 있으며, 상태가 변경되면 구독한
      모든 컴포넌트가 자동으로 업데이트됩니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstore } from 'lithent/helper';

// 1. lstore 생성 (전역)
const userStore = lstore({
  name: 'John',
  age: 25,
});

// 2. lmount 컴포넌트에서 사용
const UserProfile = lmount(() => {
  const user = userStore.useStore();  // 자동으로 useRenew() 호출

  return () => (
    <div>
      <p>Name: {user.name}</p>
      <p>Age: {user.age}</p>
    </div>
  );
});

// 3. 다른 컴포넌트에서 공유
const UserEditor = lmount(() => {
  const user = userStore.useStore();  // 동일한 store 공유

  const updateAge = () => {
    user.age += 1;  // 변경 시 모든 구독 컴포넌트 업데이트
  };

  return () => (
    <div>
      <button onClick={updateAge}>Increase Age</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      useStore() vs watch()
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      lstore는 두 가지 메서드를 제공합니다:
    </p>

    <div class="grid gap-6 mb-6">
      <div class="border-l-4 border-[#42b883] bg-gray-50 dark:bg-gray-800/50 p-4 rounded-r">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          useStore() - lmount 전용
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
          내부적으로 useRenew()를 호출하여 자동으로 구독합니다. renew를 수동으로
          전달할 필요가 없습니다.
        </p>
      </div>

      <div class="border-l-4 border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-r">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          watch() - mount 호환
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
          수동으로 renew를 전달합니다. store의 일반 호출 방식과 동일하게
          동작합니다.
        </p>
      </div>
    </div>

    <CodeBlock
      language="tsx"
      code={`import { lmount, mount } from 'lithent';
import { lstore } from 'lithent/helper';

const counterStore = lstore({ count: 0 });

// ✅ lmount에서 useStore() 사용
const LmountCounter = lmount(() => {
  const state = counterStore.useStore();  // 자동 renew

  return () => <div>Count: {state.count}</div>;
});

// ✅ mount에서 watch() 사용
const MountCounter = mount(renew => {
  const state = counterStore.watch(renew);  // 수동 renew

  return () => <div>Count: {state.count}</div>;
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      선택적 구독 (Observer)
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      makeObserver를 사용하면 특정 필드의 변경에만 반응할 수 있습니다. 성능
      최적화에 유용합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstore } from 'lithent/helper';

const appStore = lstore({
  user: { name: 'John', age: 25 },
  theme: 'light',
  count: 0,
});

// user만 구독
const UserDisplay = lmount(() => {
  const app = appStore.useStore(
    store => [store.user]  // user 필드만 관찰
  );

  // count가 변경되어도 이 컴포넌트는 리렌더링 안 됨
  return () => (
    <div>
      <p>User: {app.user.name}</p>
    </div>
  );
});

// theme만 구독
const ThemeToggle = lmount(() => {
  const app = appStore.useStore(
    store => [store.theme]  // theme 필드만 관찰
  );

  const toggleTheme = () => {
    app.theme = app.theme === 'light' ? 'dark' : 'light';
  };

  return () => (
    <button onClick={toggleTheme}>
      Current: {app.theme}
    </button>
  );
});

// 여러 필드 구독
const MultiFieldWatch = lmount(() => {
  const app = appStore.useStore(
    store => [store.user, store.theme]  // 두 필드 관찰
  );

  // count 변경 시에는 리렌더링 안 됨
  return () => (
    <div>
      <p>{app.user.name}</p>
      <p>Theme: {app.theme}</p>
    </div>
  );
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 참고:
        </span>{' '}
        makeObserver를 생략하면 store의 모든 필드 변경에 반응합니다. 큰
        store에서는 성능 저하가 발생할 수 있으므로, 필요한 필드만 선택적으로
        구독하는 것이 좋습니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      중첩 객체 반응성 (중요!)
    </h2>

    <div class="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed">
        <span class="font-medium">⚠️ 주의:</span> lstore는 store와 동일하게{' '}
        <strong>1depth(루트 레벨)의 속성에 대해서만 반응성을 제공</strong>
        합니다.
        <br />
        <br />
        중첩된 객체의 속성을 직접 변경하면 반응성이 동작하지 않습니다.
      </p>
    </div>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstore } from 'lithent/helper';

const appStore = lstore({
  user: {
    profile: {
      name: 'John',
      email: 'john@example.com',
    },
  },
  count: 0,
});

const App = lmount(() => {
  const app = appStore.useStore();

  const tryUpdateName = () => {
    // ❌ 2depth 변경 - 반응성 동작 안 함!
    app.user.profile.name = 'Jane';
    // 값은 변경되지만 리렌더링이 발생하지 않음
  };

  const correctUpdateName = () => {
    // ✅ 1depth 객체를 교체 - 반응성 동작함!
    app.user = {
      ...app.user,
      profile: {
        ...app.user.profile,
        name: 'Jane',
      },
    };
    // 새로운 객체로 교체되므로 리렌더링 발생
  };

  return () => (
    <div>
      <p>Name: {app.user.profile.name}</p>
      <button onClick={tryUpdateName}>직접 변경 (동작 안 함)</button>
      <button onClick={correctUpdateName}>객체 교체 (동작함)</button>
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      중첩 객체 다루기 패턴
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      중첩 객체를 업데이트할 때는 항상{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        1depth 속성을 새로운 객체로 교체
      </strong>
      해야 합니다. 스프레드 연산자를 활용하면 편리합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstore } from 'lithent/helper';

const dataStore = lstore({
  settings: {
    display: {
      theme: 'light',
      fontSize: 14,
    },
    privacy: {
      public: true,
    },
  },
});

const Settings = lmount(() => {
  const data = dataStore.useStore();

  const changeTheme = () => {
    // ✅ 올바른 방법: spread로 새 객체 생성
    data.settings = {
      ...data.settings,
      display: {
        ...data.settings.display,
        theme: 'dark',
      },
    };
  };

  const changeFontSize = () => {
    // ✅ 헬퍼 함수를 만들어 사용하면 더 깔끔
    updateNestedProperty(
      data,
      ['settings', 'display', 'fontSize'],
      16
    );
  };

  return () => (
    <div>
      <p>Theme: {data.settings.display.theme}</p>
      <p>Font Size: {data.settings.display.fontSize}</p>
      <button onClick={changeTheme}>Change Theme</button>
      <button onClick={changeFontSize}>Change Font Size</button>
    </div>
  );
});

// 중첩 속성 업데이트 헬퍼 함수
function updateNestedProperty(store: any, path: string[], value: any) {
  const [first, ...rest] = path;

  if (rest.length === 0) {
    store[first] = value;
  } else {
    store[first] = { ...store[first] };
    let current = store[first];

    for (let i = 0; i < rest.length - 1; i++) {
      current[rest[i]] = { ...current[rest[i]] };
      current = current[rest[i]];
    }

    current[rest[rest.length - 1]] = value;
  }
}`}
    />

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💎 Deep Reactivity:</span> 중첩 객체에 대한
        세밀한 반응성이 필요하다면{' '}
        <a
          href="/guide/state-ref"
          onClick={(e: Event) => {
            e.preventDefault();
            navigateTo('/guide/state-ref');
          }}
          class="underline hover:no-underline font-medium"
        >
          state-ref
        </a>{' '}
        라이브러리를 사용하는 것을 권장합니다. 자세한 내용은 state-ref 페이지를
        참고하세요.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Primitive 값 저장
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      lstore는 객체뿐만 아니라 primitive 값(number, string, boolean)도 저장할 수
      있습니다. primitive 값을 저장하면 자동으로{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        {`{ value: ... }`}
      </code>{' '}
      형태로 래핑됩니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstore } from 'lithent/helper';

// primitive 값으로 저장
const countStore = lstore(0);

const Counter = lmount(() => {
  const count = countStore.useStore();

  const increment = () => {
    count.value += 1;  // .value를 통해 접근
  };

  return () => (
    <div>
      <p>Count: {count.value}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 참고:
        </span>{' '}
        대부분의 경우 객체 형태로 store를 정의하는 것이 좋습니다. 여러 관련된
        상태를 하나의 store에 그룹화할 수 있고, 타입 추론도 더 명확합니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      lstore vs store 비교
    </h2>

    <div class="overflow-x-auto mb-6">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              특성
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              lstore
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              store
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              대상 컴포넌트
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              lmount (useStore)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              mount
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              renew 전달
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              자동 (useRenew 호출)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              수동 (인자로 전달)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              사용 방식
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              store.useStore()
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              store(renew)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              반응성 depth
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              1depth (얕은 반응성)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              1depth (얕은 반응성)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              선택적 구독
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              지원 (makeObserver)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              지원 (makeObserver)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              mount 호환성
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              watch() 메서드로 가능
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              기본 방식
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <CodeBlock
      language="tsx"
      code={`import { mount, lmount } from 'lithent';
import { store, lstore } from 'lithent/helper';

// store - mount에서 사용
const userStore = store({ name: 'John' });

const MountComponent = mount(renew => {
  const user = userStore(renew);  // renew 수동 전달
  return () => <div>{user.name}</div>;
});

// lstore - lmount에서 사용
const userLstore = lstore({ name: 'John' });

const LmountComponent = lmount(() => {
  const user = userLstore.useStore();  // 자동 renew
  return () => <div>{user.name}</div>;
});

// lstore의 watch() - mount에서도 사용 가능
const MountWithLstore = mount(renew => {
  const user = userLstore.watch(renew);  // 수동 renew
  return () => <div>{user.name}</div>;
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Cache 옵션
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      lstore는 기본적으로 컴포넌트별로 store 접근을 캐싱합니다. 캐시를
      비활성화하려면{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        {`{ cache: false }`}
      </code>{' '}
      옵션을 전달하세요.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { lmount } from 'lithent';
import { lstore } from 'lithent/helper';

const appStore = lstore({ count: 0 });

const Component = lmount(() => {
  // 캐시 비활성화
  const app = appStore.useStore(null, { cache: false });

  return () => <div>Count: {app.count}</div>;
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 참고:
        </span>{' '}
        일반적으로 캐시를 활성화(기본값)하는 것이 좋습니다. 캐시를 비활성화하면
        동일한 컴포넌트 인스턴스에서 useStore()를 여러 번 호출할 때마다 새로운
        구독이 생성됩니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음 단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/context"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/context');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Helper: Context →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          컴포넌트 트리에서 데이터를 공유하는 Context API에 대해 알아보세요.
          <br />
          props drilling 없이 깊은 컴포넌트 계층에 데이터를 전달하는 방법을
          배워봅시다.
        </p>
      </a>
    </div>
  </div>
);
