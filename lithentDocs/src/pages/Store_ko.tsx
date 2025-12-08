import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const StoreKo = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Store Helper
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      store란?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      store는{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        전역 상태를 관리하는 헬퍼
      </strong>
      입니다.
      <br />
      <br />
      store의 핵심은{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        renew 함수를 명시적으로 인자를 통해 위임
      </strong>
      한다는 점입니다. 이것이 lstore와의 근본적인 차이이며, mount와 함께
      사용하는 것이 자연스럽고 올바른 방식입니다.
      <br />
      <br />
      여러 컴포넌트에서 동일한 상태를 공유할 수 있으며, 상태가 변경되면 구독한
      모든 컴포넌트가 자동으로 업데이트됩니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

// 1. store 생성 (전역)
const userStore = store({
  name: 'John',
  age: 25,
});

// 2. 컴포넌트에서 사용
const UserProfile = mount(renew => {
  const user = userStore(renew);  // renew 명시적 전달

  return () => (
    <div>
      <p>Name: {user.name}</p>
      <p>Age: {user.age}</p>
      <button onClick={() => user.age++}>Increase Age</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      기본 사용법
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      store는 2단계로 사용합니다:
      <br />
      <br />
      <strong>1단계: store 생성</strong> - 초기값으로 store 생성 함수를
      만듭니다.
      <br />
      <strong>2단계: 구독</strong> - 컴포넌트에서 renew를 전달하여 구독합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

// 1단계: store 생성 (컴포넌트 외부)
const counterStore = store({ count: 0 });

// 2단계: 컴포넌트에서 구독
const Counter = mount(renew => {
  const counter = counterStore(renew);

  return () => (
    <div>
      <p>Count: {counter.count}</p>
      <button onClick={() => counter.count++}>+</button>
    </div>
  );
});

// 다른 컴포넌트에서도 동일한 store 공유
const CounterDisplay = mount(renew => {
  const counter = counterStore(renew);

  return () => <div>Current: {counter.count}</div>;
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      핵심 특징
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <strong class="font-semibold text-gray-900 dark:text-white">
        1. mount와 함께 사용
      </strong>
      <br />
      store는 renew를 명시적으로 인자로 받으므로, mount 컴포넌트에서 사용하는
      것이 자연스럽습니다.
      <br />
      <br />
      <strong class="font-semibold text-gray-900 dark:text-white">
        2. 전역 상태 공유
      </strong>
      <br />
      컴포넌트 외부에서 store를 생성하면 여러 컴포넌트가 동일한 상태를 공유할 수
      있습니다.
      <br />
      <br />
      <strong class="font-semibold text-gray-900 dark:text-white">
        3. 반응형 Proxy
      </strong>
      <br />
      store는 JavaScript Proxy를 사용하여 반응성을 구현합니다. 속성을 직접
      변경하면 자동으로 구독자들이 업데이트됩니다.
      <br />
      <br />
      <strong class="font-semibold text-gray-900 dark:text-white">
        4. 선택적 구독 (watch)
      </strong>
      <br />두 번째 인자로 observer 함수를 전달하면 특정 속성만 감시할 수
      있습니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      원시값 vs 객체
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      객체 저장 (권장)
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

// 객체로 저장 - 속성에 직접 접근
const userStore = store({
  name: 'John',
  age: 25,
});

const UserComponent = mount(renew => {
  const user = userStore(renew);

  console.log(user.name);  // 'John'
  user.age = 26;  // 직접 변경

  return () => <div>{user.name}, {user.age}</div>;
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      원시값 저장
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

// 원시값은 .value로 래핑됨
const countStore = store(0);

const Counter = mount(renew => {
  const count = countStore(renew);

  console.log(count.value);  // 0
  count.value = 1;  // .value를 통해 접근

  return () => <div>{count.value}</div>;
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 권장:
        </span>{' '}
        원시값보다는 객체 형태로 저장하는 것이 더 직관적입니다. 여러 관련된
        상태를 하나의 객체로 묶으면 관리가 편리합니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      선택적 구독 (watch)
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      두 번째 인자로 observer 함수를 전달하면 특정 속성만 감시할 수 있습니다.
      observer 함수 내에서 접근한 속성만 감시 대상이 됩니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

const appStore = store({
  user: 'John',
  count: 0,
  theme: 'light',
});

const UserDisplay = mount(renew => {
  // user만 감시 (count, theme 변경 시 리렌더링 안 됨)
  const app = appStore(
    renew,
    (store) => [store.user]  // observer: user만 접근
  );

  return () => (
    <div>
      <p>User: {app.user}</p>
      <p>Count: {app.count}</p>  {/* count 변경해도 리렌더링 안 됨 */}
    </div>
  );
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 성능 최적화:
        </span>{' '}
        observer를 사용하면 불필요한 리렌더링을 방지할 수 있습니다. 큰 store를
        사용할 때 특정 속성만 감시하면 성능이 향상됩니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      실용적인 예제
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      사용자 인증 상태
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

// 전역 인증 store
const authStore = store<{
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
}>({
  isAuthenticated: false,
  user: null,
});

// 로그인 함수
export const login = (name: string, email: string) => {
  const auth = authStore();  // renew 없이 접근 (구독 안 함)
  auth.isAuthenticated = true;
  auth.user = { name, email };
};

// 로그아웃 함수
export const logout = () => {
  const auth = authStore();
  auth.isAuthenticated = false;
  auth.user = null;
};

// 헤더 컴포넌트
const Header = mount(renew => {
  const auth = authStore(renew);

  return () => (
    <header>
      {auth.isAuthenticated ? (
        <div>
          <span>Welcome, {auth.user?.name}!</span>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => login('John', 'john@example.com')}>
          Login
        </button>
      )}
    </header>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      쇼핑 카트
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

// 카트 store
const cartStore = store<{
  items: CartItem[];
  total: number;
}>({
  items: [],
  total: 0,
});

// 카트 액션
export const addToCart = (item: CartItem) => {
  const cart = cartStore();
  cart.items = [...cart.items, item];
  cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
};

export const removeFromCart = (id: number) => {
  const cart = cartStore();
  cart.items = cart.items.filter(item => item.id !== id);
  cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
};

// 카트 디스플레이
const CartDisplay = mount(renew => {
  const cart = cartStore(renew);

  return () => (
    <div class="cart">
      <h2>Shopping Cart</h2>
      {cart.items.map(item => (
        <div key={item.id}>
          <span>{item.name}</span>
          <span>{item.price}원 x {item.quantity}</span>
          <button onClick={() => removeFromCart(item.id)}>Remove</button>
        </div>
      ))}
      <div class="total">Total: {cart.total}원</div>
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      테마 관리
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

const themeStore = store<{
  mode: 'light' | 'dark';
  primaryColor: string;
}>({
  mode: 'light',
  primaryColor: '#42b883',
});

export const toggleTheme = () => {
  const theme = themeStore();
  theme.mode = theme.mode === 'light' ? 'dark' : 'light';
  document.documentElement.classList.toggle('dark');
};

export const setPrimaryColor = (color: string) => {
  const theme = themeStore();
  theme.primaryColor = color;
  document.documentElement.style.setProperty('--primary-color', color);
};

const ThemeToggle = mount(renew => {
  const theme = themeStore(renew);

  return () => (
    <div>
      <button onClick={toggleTheme}>
        Current: {theme.mode}
      </button>
      <input
        type="color"
        value={theme.primaryColor}
        onInput={(e: Event) => {
          setPrimaryColor((e.target as HTMLInputElement).value);
        }}
      />
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      구독 없이 사용하기
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      renew를 전달하지 않으면 구독 없이 store에 접근할 수 있습니다. 주로
      유틸리티 함수나 이벤트 핸들러에서 사용합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

const counterStore = store({ count: 0 });

// 컴포넌트 외부: 구독 없이 접근 (리렌더링 트리거 안 됨)
const increment = () => {
  const counter = counterStore();  // renew 없음
  counter.count++;
};

// 컴포넌트 내부: 구독하여 리렌더링 받기
const Counter = mount(renew => {
  const counter = counterStore(renew);  // renew 전달로 구독

  return () => (
    <div>
      <p>{counter.count}</p>
      <button onClick={increment}>+</button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      캐싱
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      store는 기본적으로 동일한 renew 함수에 대해 동일한 proxy 객체를
      반환합니다(캐싱). 이를 비활성화하려면 세 번째 인자에{' '}
      <code>cache: false</code>를 전달하세요.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

const counterStore = store({ count: 0 });

const Counter = mount(renew => {
  // 기본 동작: 캐싱됨 (동일한 renew에 대해 같은 인스턴스 반환)
  const counter1 = counterStore(renew);
  const counter2 = counterStore(renew);
  console.log(counter1 === counter2);  // true

  // 캐싱 비활성화 (매번 새로운 인스턴스 반환)
  const counter3 = counterStore(renew, null, { cache: false });
  console.log(counter1 === counter3);  // false

  return () => <div>{counter1.count}</div>;
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      중첩 객체 반응성 (중요!)
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <strong class="font-semibold text-gray-900 dark:text-white">
        store는 1depth까지만 반응성을 제공합니다.
      </strong>{' '}
      중첩된 객체의 속성을 변경해도 반응성이 동작하지 않습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

const appStore = store({
  user: {
    name: 'John',
    age: 25,
  },
  settings: {
    theme: 'light',
  },
});

const App = mount(renew => {
  const app = appStore(renew);

  // ✅ 1depth 변경 - 반응성 동작함
  app.user = { name: 'Jane', age: 30 };

  // ❌ 2depth 변경 - 반응성 동작 안 함!
  app.user.name = 'Jane';  // 변경되지만 리렌더링 안 됨
  app.settings.theme = 'dark';  // 변경되지만 리렌더링 안 됨

  // ✅ 해결방법: 객체 전체를 교체
  app.user = { ...app.user, name: 'Jane' };
  app.settings = { ...app.settings, theme: 'dark' };

  return () => <div>{app.user.name}</div>;
});`}
    />

    <div class="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed">
        <span class="font-medium">🚨 중요:</span> store는 shallow reactivity만
        제공합니다. 중첩 객체의 속성을 직접 변경하면 UI가 업데이트되지 않습니다.
        항상 1depth 속성 전체를 새로운 객체로 교체하세요.
      </p>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      중첩 객체 다루기 패턴
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

const appStore = store({
  user: {
    profile: {
      name: 'John',
      email: 'john@example.com',
    },
    preferences: {
      theme: 'light',
      language: 'en',
    },
  },
});

const App = mount(renew => {
  const app = appStore(renew);

  const updateName = (newName: string) => {
    // ❌ 잘못된 방법 - 반응성 동작 안 함
    // app.user.profile.name = newName;

    // ✅ 올바른 방법 1: spread operator 사용
    app.user = {
      ...app.user,
      profile: {
        ...app.user.profile,
        name: newName,
      },
    };
  };

  const updateTheme = (newTheme: string) => {
    // ✅ 올바른 방법 2: 새 객체 생성
    app.user = {
      ...app.user,
      preferences: {
        ...app.user.preferences,
        theme: newTheme,
      },
    };
  };

  return () => (
    <div>
      <p>Name: {app.user.profile.name}</p>
      <p>Theme: {app.user.preferences.theme}</p>
      <button onClick={() => updateName('Jane')}>Change Name</button>
      <button onClick={() => updateTheme('dark')}>Change Theme</button>
    </div>
  );
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 권장 구조:
        </span>{' '}
        중첩 객체 사용을 최소화하고, 가능하면 flat한 구조로 store를 설계하는
        것이 좋습니다. 깊은 중첩이 필요하다면 각 depth마다 별도의 속성으로
        분리하세요.
      </p>
    </div>

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
      Cache 옵션
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      store는 기본적으로 컴포넌트별로 store 접근을 캐싱합니다. 캐시를
      비활성화하려면{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        {`{ cache: false }`}
      </code>{' '}
      옵션을 전달하세요.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { store } from 'lithent/helper';

const appStore = store({ count: 0 });

const Component = mount(renew => {
  // 캐시 비활성화
  const app = appStore(renew, null, { cache: false });

  return () => <div>Count: {app.count}</div>;
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 참고:
        </span>{' '}
        일반적으로 캐시를 활성화(기본값)하는 것이 좋습니다. 캐시를 비활성화하면
        동일한 컴포넌트 인스턴스에서 store()를 여러 번 호출할 때마다 새로운
        구독이 생성됩니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      주의사항
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ mount와 함께 사용:</span> store는 renew를
        명시적으로 인자를 통해 위임하는 방식이므로, mount 컴포넌트에서 사용하는
        것이 자연스럽고 올바른 방식입니다. lmount에서는 lstore를 사용하세요.
        <br />
        <br />
        <span class="font-medium">⚠️ 컴포넌트 외부에서 생성:</span> store는
        컴포넌트 외부에서 생성하여 전역으로 공유해야 합니다. 컴포넌트 내부에서
        생성하면 매번 새로운 store가 만들어집니다.
        <br />
        <br />
        <span class="font-medium">⚠️ 1depth만 반응성:</span> store는 shallow
        reactivity만 제공합니다. 중첩 객체의 속성을 직접 변경하면 UI가
        업데이트되지 않습니다. 1depth 속성 전체를 교체하세요.
        <br />
        <br />
        <span class="font-medium">⚠️ 배열 변경:</span> 배열의 경우 push, pop
        등의 메서드를 사용하면 반응성이 동작하지 않습니다. 새로운 배열을
        할당하세요.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음 단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/examples/2"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/examples/2');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          예제: 공유 Store로 상태 나누기 →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          여러 컴포넌트에서 하나의 store를 공유하면서,
          <br />
          mount + store 패턴을 실제 예제로 확인해 보세요.
        </p>
      </a>

      <a
        href="/guide/lstore"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/lstore');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Helper: Lstore →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          lmount에서 사용하는 전역 상태 관리인 lstore에 대해 알아보세요.
          <br />
          store와 유사하지만 renew를 자동으로 처리하는 방법을 배워봅시다.
        </p>
      </a>
    </div>
  </div>
);
