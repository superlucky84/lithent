import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const CacheUpdateKo = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      CacheUpdate Helper
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      CacheUpdate란?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      CacheUpdate는{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        컴포넌트의 렌더링 결과를 캐싱
      </strong>
      하는 헬퍼입니다.
      <br />
      <br />
      의존성 배열이 변경되지 않으면 이전에 생성한 Virtual DOM을 재사용하여{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        불필요한 리렌더링을 방지
      </strong>
      합니다. React의{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        useMemo
      </code>
      나{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        React.memo
      </code>
      와 유사한 개념입니다.
    </p>

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 성능 최적화:</span> cacheUpdate는 렌더링
        최적화를 위한 도구입니다. 모든 컴포넌트에 사용할 필요는 없으며, 성능
        병목이 발생하는 컴포넌트에만 선택적으로 적용하세요.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      기본 사용법
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      cacheUpdate는 두 개의 인자를 받습니다:
      <br />
      <br />
      1.{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        checkFunction
      </code>
      : 의존성 배열을 반환하는 함수
      <br />
      2.{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        updater
      </code>
      : Virtual DOM을 반환하는 렌더 함수
      <br />
      <br />
      <strong class="font-semibold text-gray-900 dark:text-white">
        중요:
      </strong>{' '}
      checkFunction은 배열을 직접 전달하는 것이 아니라{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        배열을 반환하는 함수
      </strong>
      입니다. 이는 Lithent의 클로저 기반 상태 관리 방식 때문에 매 렌더링마다
      최신 값을 읽기 위함입니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { cacheUpdate } from 'lithent/helper';

const Counter = mount(renew => {
  let count = 0;
  let otherValue = 0;

  const increment = () => {
    count += 1;
    renew();
  };

  const changeOther = () => {
    otherValue += 1;
    renew();
  };

  // cacheUpdate로 렌더링 결과 캐싱
  return cacheUpdate(
    // 1. checkFunction: 의존성 배열 반환
    () => [count],

    // 2. updater: 렌더 함수
    (props) => (
      <div>
        <p>Count: {count}</p>
        <p>Other: {otherValue}</p>
        <button onClick={increment}>Increment Count</button>
        <button onClick={changeOther}>Change Other</button>
      </div>
    )
  );
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 동작 방식:
        </span>{' '}
        위 예제에서{' '}
        <code class="px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded text-sm">
          changeOther
        </code>
        를 클릭해도{' '}
        <code class="px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded text-sm">
          count
        </code>
        가 변경되지 않았으므로 렌더링이 발생하지 않습니다. 화면에 표시된{' '}
        <code class="px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded text-sm">
          otherValue
        </code>
        는 업데이트되지 않습니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      의존성 배열
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      checkFunction은 배열을 반환해야 하며, 이 배열의 각 요소는{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        참조 비교(===)
      </strong>
      로 이전 값과 비교됩니다. 모든 요소가 같으면 캐시된 렌더링 결과를
      재사용합니다.
    </p>

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 왜 함수로 설계되었나요?</span>
        <br />
        <br />
        Lithent는 <strong class="font-semibold">클로저 기반 상태 관리</strong>를
        사용합니다. 컴포넌트의 상태(count, name 등)는 클로저 변수로 존재하며, 매
        렌더링 시점마다 변경 여부를 확인하려면{' '}
        <strong class="font-semibold">그 시점의 최신 값</strong>을 읽어야
        합니다.
        <br />
        <br />
        <code class="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm">
          () =&gt; [count, name]
        </code>
        처럼 함수로 설계하면, 의존성을 확인할 때마다 이 함수를 호출하여{' '}
        <strong class="font-semibold">항상 최신 클로저 값</strong>을 가져올 수
        있습니다. 함수 호출 시점에 count와 name의 현재 값을 읽어 배열로
        반환하므로, 이전 값과 비교하여 변경 여부를 정확히 감지할 수 있습니다.
      </p>
    </div>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { cacheUpdate } from 'lithent/helper';

const UserProfile = mount<{ userId: number }>(renew => {
  // 클로저 변수로 상태 관리
  let userName = 'John';
  let userAge = 25;
  let settings = { theme: 'light' };

  return cacheUpdate(
    () => [userName, userAge],
    // ☝️ 렌더링 시점마다 함수를 호출하여 최신 값으로 배열 생성
    //    이전 값과 비교하여 변경 여부 감지

    (props) => (
      <div>
        <h1>User: {userName}</h1>
        <p>Age: {userAge}</p>
        <p>Theme: {settings.theme}</p>
        <p>User ID: {props.userId}</p>
      </div>
    )
  );
});

// userName이나 userAge가 변경되면 리렌더링
// settings.theme이 변경되어도 리렌더링 안 됨 (의존성이 아님)
// props.userId가 변경되면? updater 함수가 props를 받으므로 자동으로 반영됨`}
    />

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ 참조 비교:</span> 의존성 배열은 참조 비교를
        사용합니다. 객체나 배열을 의존성으로 사용할 때는 주의하세요. 내용이
        같아도 참조가 다르면 다른 값으로 인식됩니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      실제 사용 예시
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      1. 리스트 아이템 최적화
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      리스트의 각 아이템을 최적화하여, 다른 아이템이 변경되어도 영향을 받지
      않도록 할 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { cacheUpdate } from 'lithent/helper';

type TodoItem = {
  id: number;
  text: string;
  done: boolean;
};

const TodoListItem = mount<TodoItem>(renew => {
  return cacheUpdate(
    // props의 모든 값을 의존성으로 지정
    (props) => [props.id, props.text, props.done],

    (props) => (
      <li>
        <input
          type="checkbox"
          checked={props.done}
          onChange={() => {
            // 부모 컴포넌트에서 처리
          }}
        />
        <span style={{ textDecoration: props.done ? 'line-through' : 'none' }}>
          {props.text}
        </span>
      </li>
    )
  );
});

const TodoList = mount(renew => {
  let todos: TodoItem[] = [
    { id: 1, text: 'Learn Lithent', done: false },
    { id: 2, text: 'Build App', done: false },
  ];

  return () => (
    <ul>
      {todos.map(todo => (
        <TodoListItem key={todo.id} {...todo} />
      ))}
    </ul>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      2. 복잡한 계산 결과 캐싱
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      비용이 큰 계산의 결과를 캐싱하여 불필요한 재계산을 방지할 수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { cacheUpdate } from 'lithent/helper';

const ExpensiveComponent = mount(renew => {
  let searchQuery = '';
  let filterOption = 'all';
  let sortOption = 'name';

  const updateSearch = (query: string) => {
    searchQuery = query;
    renew();
  };

  return cacheUpdate(
    // searchQuery만 의존성으로 지정
    // filterOption, sortOption 변경 시에는 리렌더링 안 함
    () => [searchQuery],

    () => {
      // 비용이 큰 계산
      const filteredResults = performExpensiveSearch(searchQuery);

      return (
        <div>
          <input
            type="text"
            value={searchQuery}
            onInput={(e: Event) => {
              updateSearch((e.target as HTMLInputElement).value);
            }}
          />
          <div>Results: {filteredResults.length}</div>
        </div>
      );
    }
  );
});

function performExpensiveSearch(query: string) {
  // 비용이 큰 검색 로직
  console.log('Performing expensive search...');
  return [];
}`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      3. 부분 업데이트 최적화
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      컴포넌트의 일부만 의존성으로 지정하여, 나머지 상태 변경 시 렌더링을 건너뛸
      수 있습니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';
import { cacheUpdate } from 'lithent/helper';

const Dashboard = mount(renew => {
  let importantData = 'Critical Info';
  let lessImportantData = 'Extra Info';
  let debugInfo = 'Debug Data';

  const updateImportant = () => {
    importantData = 'Updated Critical Info';
    renew();
  };

  const updateDebug = () => {
    debugInfo = \`Debug \${Date.now()}\`;
    renew(); // renew 호출해도 리렌더링 안 됨!
  };

  return cacheUpdate(
    // importantData만 의존성으로 지정
    () => [importantData],

    () => (
      <div>
        <h1>Dashboard</h1>
        <p>Important: {importantData}</p>
        <p>Less Important: {lessImportantData}</p>
        <p>Debug: {debugInfo}</p>
        <button onClick={updateImportant}>Update Important</button>
        <button onClick={updateDebug}>Update Debug (no render)</button>
      </div>
    )
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      cacheUpdate vs Computed 비교
    </h2>

    <div class="overflow-x-auto mb-6">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              특성
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              cacheUpdate
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              computed
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              목적
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              렌더링 결과 캐싱
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              계산 결과 캐싱
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              반환값
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Virtual DOM (렌더 함수)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              계산된 값
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              사용 위치
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              mount의 return 문
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              mounter 함수 내부
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              의존성 지정
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              명시적 (checkFunction)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              자동 추적 (state 접근)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              renew 필요
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              필요 (수동)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              자동
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              적용 대상
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              mount, lmount
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              mount (state와 함께)
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      주의사항
    </h2>

    <div class="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed">
        <span class="font-medium">⚠️ 참조 비교:</span> 의존성 배열의 각 요소는{' '}
        <code class="px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm">
          ===
        </code>
        로 비교됩니다. 객체나 배열을 의존성으로 사용하면, 내용이 같아도 참조가
        다르면 매번 리렌더링됩니다.
        <br />
        <br />
        <span class="font-medium">⚠️ 의존성 누락:</span> updater 함수에서
        사용하는 모든 변수를 의존성 배열에 포함해야 합니다. 누락하면 화면이 최신
        상태를 반영하지 못합니다.
        <br />
        <br />
        <span class="font-medium">⚠️ 과도한 사용 주의:</span> 모든 컴포넌트에
        cacheUpdate를 사용할 필요는 없습니다. 실제로 성능 문제가 있는 부분에만
        적용하세요. 불필요하게 사용하면 오히려 코드가 복잡해집니다.
        <br />
        <br />
        <span class="font-medium">⚠️ renew 호출:</span> 의존성이 변경되지 않으면
        renew를 호출해도 리렌더링이 발생하지 않습니다. 이는 의도된 동작이지만,
        예상과 다를 수 있으니 주의하세요.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      언제 사용해야 할까?
    </h2>

    <div class="grid gap-6 mb-6">
      <div class="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r">
        <h3 class="text-lg font-medium text-green-900 dark:text-green-100 mb-2">
          ✅ cacheUpdate 사용 권장
        </h3>
        <ul class="text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2">
          <li>• 렌더링 비용이 큰 컴포넌트 (복잡한 리스트, 차트 등)</li>
          <li>• 일부 상태만 화면에 영향을 주는 경우</li>
          <li>• 리스트의 각 아이템을 독립적으로 최적화하고 싶을 때</li>
          <li>• Props가 자주 변경되지만 특정 props만 렌더링에 영향을 줄 때</li>
        </ul>
      </div>

      <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-r">
        <h3 class="text-lg font-medium text-yellow-900 dark:text-yellow-100 mb-2">
          ⚠️ cacheUpdate 사용 불필요
        </h3>
        <ul class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed space-y-2">
          <li>• 단순한 컴포넌트 (렌더링 비용이 작음)</li>
          <li>• 모든 상태 변경이 화면에 반영되어야 하는 경우</li>
          <li>• 성능 문제가 실제로 발생하지 않는 경우</li>
          <li>• 코드 복잡도를 낮추는 것이 더 중요한 경우</li>
        </ul>
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음 단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/examples/18"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/examples/18');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          예제: cacheUpdate로 리스트 최적화 →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          cacheUpdate로 리스트 렌더링 횟수를 줄이고,
          <br />
          루트 렌더와 부분 렌더 카운트를 눈으로 확인하는 예제를 실행해 보세요.
        </p>
      </a>

      <a
        href="/guide/state-ref"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/state-ref');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Helper: State-Ref →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          깊은 중첩 객체에 대한 반응성을 제공하는 외부 라이브러리인 state-ref를
          알아보세요.
          <br />
          복잡한 데이터 구조를 다룰 때 매우 유용합니다.
        </p>
      </a>
    </div>
  </div>
);
