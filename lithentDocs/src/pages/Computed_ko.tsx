import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const ComputedKo = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Computed Helper
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Computed란?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      computed는{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        다른 값으로부터 파생된 값을 계산하는 읽기 전용 헬퍼
      </strong>
      입니다.
      <br />
      <br />
      computed는 함수를 인자로 받아, 해당 함수가 반환하는 값을 읽기 전용으로
      제공합니다. 값에 접근할 때마다 함수가 다시 실행되므로, 항상 최신 상태를
      반영하는 파생 값을 얻을 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const PriceCalculator = mount(renew => {
  const price = state(100, renew);
  const quantity = state(1, renew);

  // 총 가격을 계산하는 computed
  const total = computed(() => price.value * quantity.value);

  return () => (
    <div>
      <p>가격: {price.value}원</p>
      <p>수량: {quantity.value}개</p>
      <p>총액: {total.value}원</p>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      핵심 특징
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      computed의 핵심은{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        읽기 전용이며, 접근할 때마다 함수를 실행
      </strong>
      한다는 점입니다.
      <br />
      <br />• <strong>읽기 전용</strong>: computed 값을 직접 변경하려고 하면
      에러가 발생합니다.
      <br />• <strong>즉시 평가 (Lazy Evaluation)</strong>: 값에 접근할 때마다
      함수가 실행됩니다.
      <br />• <strong>항상 최신 값</strong>: 의존하는 상태가 변경되면 다음 접근
      시 새로운 값을 반환합니다.
      <br />• <strong>mount와 lmount 모두 사용 가능</strong>: renew를 필요로
      하지 않기 때문에 mount, lmount 어디서든 자유롭게 사용할 수 있습니다.
    </p>

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 참고:
        </span>{' '}
        computed는 의존성을 자동으로 추적하지 않습니다. Vue나 React의 computed
        속성과 달리, 단순히 함수를 래핑하여 접근할 때마다 실행하는 편리한
        헬퍼입니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      기본 사용법
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      단순 계산
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const Counter = mount(renew => {
  const count = state(0, renew);

  // 두 배 값을 계산
  const doubled = computed(() => count.value * 2);

  return () => (
    <div>
      <p>Count: {count.value}</p>
      <p>Doubled: {doubled.value}</p>
      <button onClick={() => (count.value += 1)}>Increment</button>
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      여러 값 조합
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const UserProfile = mount(renew => {
  const firstName = state('John', renew);
  const lastName = state('Doe', renew);

  // 여러 값을 조합하여 계산
  const fullName = computed(() => \`\${firstName.value} \${lastName.value}\`);

  return () => (
    <div>
      <input
        value={firstName.value}
        onInput={(e) => (firstName.value = e.target.value)}
        placeholder="First Name"
      />
      <input
        value={lastName.value}
        onInput={(e) => (lastName.value = e.target.value)}
        placeholder="Last Name"
      />
      <p>Full Name: {fullName.value}</p>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      실용적인 예제
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      장바구니 계산
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const ShoppingCart = mount(renew => {
  const items = state([
    { name: 'Apple', price: 1000, quantity: 2 },
    { name: 'Banana', price: 500, quantity: 3 },
  ], renew);

  // 총 가격 계산
  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  // 총 수량 계산
  const totalQuantity = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  );

  const addItem = () => {
    items.value = [
      ...items.value,
      { name: 'Orange', price: 800, quantity: 1 },
    ];
  };

  return () => (
    <div>
      <h3>장바구니</h3>
      {items.value.map((item, i) => (
        <div key={i}>
          {item.name} - {item.price}원 x {item.quantity}개
        </div>
      ))}
      <hr />
      <p>총 상품 수: {totalQuantity.value}개</p>
      <p>총 가격: {totalPrice.value}원</p>
      <button onClick={addItem}>상품 추가</button>
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      필터링 및 정렬
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const TodoList = mount(renew => {
  const todos = state([
    { id: 1, text: 'Learn Lithent', completed: false },
    { id: 2, text: 'Build App', completed: false },
    { id: 3, text: 'Deploy', completed: false },
  ], renew);

  const filter = state<'all' | 'active' | 'completed'>('all', renew);

  // 필터링된 할 일 목록
  const filteredTodos = computed(() => {
    switch (filter.value) {
      case 'active':
        return todos.value.filter(t => !t.completed);
      case 'completed':
        return todos.value.filter(t => t.completed);
      default:
        return todos.value;
    }
  });

  // 완료된 할 일 개수
  const completedCount = computed(() =>
    todos.value.filter(t => t.completed).length
  );

  const toggleTodo = (id: number) => {
    todos.value = todos.value.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
  };

  return () => (
    <div>
      <h3>할 일 목록</h3>

      {/* 필터 버튼 */}
      <div>
        <button onClick={() => (filter.value = 'all')}>전체</button>
        <button onClick={() => (filter.value = 'active')}>진행중</button>
        <button onClick={() => (filter.value = 'completed')}>완료</button>
      </div>

      {/* 필터링된 목록 */}
      {filteredTodos.value.map(todo => (
        <div key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleTodo(todo.id)}
          />
          <span style={{
            textDecoration: todo.completed ? 'line-through' : 'none'
          }}>
            {todo.text}
          </span>
        </div>
      ))}

      <p>완료: {completedCount.value} / {todos.value.length}</p>
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      동적 클래스명 생성
    </h3>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const ThemeButton = mount(renew => {
  const theme = state<'light' | 'dark'>('light', renew);
  const isActive = state(false, renew);

  // 여러 조건에 따른 클래스명 생성
  const buttonClass = computed(() => {
    const classes = ['btn'];

    if (theme.value === 'dark') {
      classes.push('btn-dark');
    } else {
      classes.push('btn-light');
    }

    if (isActive.value) {
      classes.push('active');
    }

    return classes.join(' ');
  });

  return () => (
    <div>
      <button
        class={buttonClass.value}
        onClick={() => (isActive.value = !isActive.value)}
      >
        Click Me
      </button>
      <button onClick={() => {
        theme.value = theme.value === 'light' ? 'dark' : 'light';
      }}>
        Toggle Theme
      </button>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      읽기 전용 특성
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      computed는 읽기 전용입니다. 값을 직접 변경하려고 하면 에러가 발생합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`const doubled = computed(() => count.value * 2);

// ❌ 에러 발생!
doubled.value = 10;  // Error: You can't change 'computed'

// ✅ 올바른 방법: 원본 값을 변경
count.value = 5;  // doubled는 자동으로 10이 됨`}
    />

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ 읽기 전용:</span> computed 값은 파생
        값이므로 직접 변경할 수 없습니다. 원본 상태를 변경하면 computed 값도
        자동으로 업데이트됩니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      mount와 lmount 모두 사용 가능
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      computed는{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        renew 함수를 필요로 하지 않는 읽기 전용 헬퍼
      </strong>
      이므로, mount와 lmount 어디서든 자유롭게 사용할 수 있습니다.
      <br />
      <br />
      이것이 state/lstate와의 차이점입니다. state는 renew를 명시적으로 전달받고,
      lstate는 useRenew로 자동 처리하지만, computed는 renew 자체가 필요 없으므로
      lcomputed라는 별도 버전이 존재하지 않습니다.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          mount에서 사용
        </h4>
        <CodeBlock
          language="tsx"
          code={`import { mount } from 'lithent';
import { state, computed } from 'lithent/helper';

const App = mount(renew => {
  const count = state(0, renew);
  const doubled = computed(
    () => count.value * 2
  );

  return () => (
    <div>{doubled.value}</div>
  );
});`}
        />
      </div>
      <div>
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          lmount에서 사용
        </h4>
        <CodeBlock
          language="tsx"
          code={`import { lmount } from 'lithent';
import { lstate, computed } from 'lithent/helper';

const App = lmount(() => {
  const count = lstate(0);
  const doubled = computed(
    () => count.value * 2
  );

  return () => (
    <div>{doubled.value}</div>
  );
});`}
        />
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      주의사항
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ 즉시 평가:</span> computed는 값에 접근할
        때마다 함수를 실행합니다. 계산 비용이 큰 작업의 경우 주의가 필요합니다.
        <br />
        <br />
        <span class="font-medium">⚠️ 의존성 추적 없음:</span> Vue나 React와 달리
        의존성을 자동으로 추적하지 않습니다. 단순히 함수를 래핑한 헬퍼입니다.
        <br />
        <br />
        <span class="font-medium">⚠️ 부수 효과 금지:</span> computed 함수 내에서
        상태를 변경하거나 부수 효과를 일으키지 마세요. 순수 함수여야 합니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음 단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/examples/1"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/examples/1');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          예제: 바나나 스무디 칼로리 →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          computed로 파생된 칼로리 값을 계산하고,
          <br />
          상태 변경에 따라 자동으로 업데이트되는 간단한 예제를 실행해 보세요.
        </p>
      </a>

      <a
        href="/guide/effect"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/effect');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Helper: Effect →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          파생 값 계산을 마스터했습니다!
          <br />
          이제 부수 효과를 관리하는 Effect 헬퍼를 알아봅시다.
        </p>
      </a>
    </div>
  </div>
);
