import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const TemplateStringsKo = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Template Strings
    </h1>

    <div class="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed">
        <span class="font-medium text-red-900 dark:text-red-100">
          ⚠️ 실험적 기능 (Experimental)
        </span>
        <br />
        <br />
        Lithent Template Strings는 현재{' '}
        <strong>실험적(Experimental) 단계</strong>입니다:
        <br />
        <br />• <strong>프로덕션 테스트 미완료:</strong> 실제 운영 환경에서
        충분히 검증되지 않았습니다
        <br />• <strong>API 변경 가능:</strong> 향후 문법이나 동작이 변경될 수
        있습니다
        <br />• <strong>에디터 지원 부족:</strong> VSCode 등 에디터에서 문법
        하이라이팅, 자동완성, 린트 플러그인이 아직 제공되지 않습니다
        <br />
        <br />
        프로덕션 프로젝트에서는{' '}
        <a
          href="/guide/jsx-manual"
          onClick={(e: Event) => {
            e.preventDefault();
            navigateTo('/guide/jsx-manual');
          }}
          class="text-red-900 dark:text-red-100 underline hover:text-red-700 dark:hover:text-red-300"
        >
          JSX
        </a>
        ,{' '}
        <a
          href="/guide/ftags"
          onClick={(e: Event) => {
            e.preventDefault();
            navigateTo('/guide/ftags');
          }}
          class="text-red-900 dark:text-red-100 underline hover:text-red-700 dark:hover:text-red-300"
        >
          FTags
        </a>
        , 또는{' '}
        <a
          href="/guide/htm-tags"
          onClick={(e: Event) => {
            e.preventDefault();
            navigateTo('/guide/htm-tags');
          }}
          class="text-red-900 dark:text-red-100 underline hover:text-red-700 dark:hover:text-red-300"
        >
          HTM Tags
        </a>
        를 권장합니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      개요
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent Template Strings는{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        JSX-like 문법을 순수 JavaScript h() 호출로 변환
      </strong>
      하는 템플릿 시스템입니다.
      <br />
      <br />
      JSX와 유사한 직관적인 문법을 제공하면서도 JSX transform에 의존하지 않으며,
      강력한 지시자(directives)를 통해 조건부 렌더링과 리스트 렌더링을
      선언적으로 작성할 수 있습니다.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      왜 Template Strings인가?
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      JSX는 강력하지만, 태그와 태그 사이에서 조건문이나 반복문을 처리할 때
      JavaScript 문법이 난발되어 가독성이 떨어지는 문제가 있습니다:
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          ❌ JSX의 가독성 문제
        </h4>
        <CodeBlock
          language="tsx"
          code={`// 조건문과 반복문이 중첩되면 복잡해짐
<div>
  {isLoading ? (
    <Spinner />
  ) : error ? (
    <Error message={error} />
  ) : (
    <div>
      {items.length > 0 ? (
        items.map(item => (
          <div key={item.id}>
            {item.active && (
              <Badge>Active</Badge>
            )}
            <span>{item.name}</span>
          </div>
        ))
      ) : (
        <Empty />
      )}
    </div>
  )}
</div>`}
        />
      </div>

      <div>
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          ✅ Template의 명확한 의도
        </h4>
        <CodeBlock
          language="typescript"
          code={`// 지시자로 의도가 명확함
<div>
  <Spinner l-if={isLoading} />
  <Error l-else-if={error} message={error} />
  <div l-else>
    <div l-for={item in items}>
      <Badge l-if={item.active}>Active</Badge>
      <span>{item.name}</span>
    </div>
    <Empty l-if={items.length === 0} />
  </div>
</div>`}
        />
      </div>
    </div>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
        <span class="font-medium text-gray-900 dark:text-white">
          💡 핵심 개선:
        </span>
        <br />
        <br />
        Template Strings는{' '}
        <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
          l-if
        </code>
        ,{' '}
        <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
          l-for
        </code>{' '}
        같은 지시자를 통해 조건부 렌더링과 리스트 렌더링을{' '}
        <strong>선언적이고 가독성 높게</strong> 작성할 수 있습니다. 중첩된
        JavaScript 표현식과 삼항 연산자 대신, HTML 속성처럼 자연스럽게 의도를
        표현할 수 있습니다.
      </p>
    </div>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        주요 특징
      </h3>
      <ul class="space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              JSX-like 문법:
            </strong>{' '}
            HTML과 유사한 직관적인 마크업
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              강력한 지시자:
            </strong>{' '}
            l-if, l-for 등 선언적 제어 구조
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              소스맵 지원:
            </strong>{' '}
            디버깅 시 원본 템플릿 위치 추적
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              Vite 통합:
            </strong>{' '}
            HMR 지원 및 빠른 개발 환경
          </div>
        </li>
      </ul>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      설치 및 설정
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      lithentVite 플러그인 설치
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Template Strings 기능은{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        @lithent/lithent-vite
      </code>{' '}
      플러그인의 template 옵션을 통해 사용합니다:
    </p>

    <CodeBlock
      language="bash"
      code={`npm install -D @lithent/lithent-vite
# or
pnpm add -D @lithent/lithent-vite`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Vite 설정
    </h3>

    <CodeBlock
      language="typescript"
      code={`// vite.config.ts
import { defineConfig } from 'vite';
import lithentVitePlugin from '@lithent/lithent-vite';

export default defineConfig({
  plugins: [
    lithentVitePlugin({
      // template 옵션으로 템플릿 기능 활성화
      template: {
        // 기본값: ['.ljsx', '.ltsx']
        extensions: ['.ltsx', '.ljsx'],
      },
    }),
  ],
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6 mt-4">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        template
      </code>{' '}
      옵션을 설정하면{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        .ltsx
      </code>{' '}
      및{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        .ljsx
      </code>{' '}
      파일이 자동으로 변환되며, HMR(Hot Module Replacement) 기능도 함께
      활성화됩니다.
    </p>

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 간편한 설정:</span>
        <br />
        <br />
        템플릿 기능만 필요하고 기본 설정을 사용한다면{' '}
        <code class="px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm">
          template: true
        </code>
        로 간단히 활성화할 수 있습니다:
        <br />
        <br />
        <code class="px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm">
          lithentVitePlugin(&#123; template: true &#125;)
        </code>
      </p>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      HMR 없이 템플릿만 사용 (권장하지 않음)
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      특별한 이유로{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        @lithent/lithent-template-vite
      </code>
      를 직접 사용해야 한다면:
    </p>

    <CodeBlock
      language="typescript"
      code={`// vite.config.ts
import { defineConfig } from 'vite';
import lithentTemplateVite from '@lithent/lithent-template-vite';

export default defineConfig({
  plugins: [
    lithentTemplateVite({
      extensions: ['.ltsx', '.ljsx'],
    }),
  ],
});`}
    />

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ 권장:</span> 대부분의 경우{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          @lithent/lithent-vite
        </code>
        의 template 옵션을 사용하는 것이 더 편리합니다. HMR 기능도 함께
        제공되며, 설정도 더 간단합니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      템플릿 문법
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      기본 요소
    </h3>

    <CodeBlock
      language="typescript"
      code={`// src/App.ltsx
import { render } from 'lithent';

const App = () => (
  <div class="container">
    <h1>Hello Lithent</h1>
    <p>This is a template string</p>
  </div>
);

render(<App />, document.getElementById('root'));`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      텍스트 보간
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      중괄호{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">{`{}`}</code>
      를 사용하여 JavaScript 표현식을 삽입할 수 있습니다:
    </p>

    <CodeBlock
      language="typescript"
      code={`const Greeting = () => {
  const name = 'John';
  const count = 5;

  return (
    <div>
      <p>Hello {name}!</p>
      <p>You have {count} notifications</p>
      <p>Total: {count + 10}</p>
    </div>
  );
};`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      동적 속성
    </h3>

    <CodeBlock
      language="typescript"
      code={`const DynamicProps = () => {
  const className = 'active';
  const isDisabled = false;
  const handleClick = () => console.log('Clicked');

  return (
    <div>
      <div class={className}>Dynamic class</div>
      <button disabled={isDisabled} onClick={handleClick}>
        Click Me
      </button>
      <input type="text" value={inputValue} />
    </div>
  );
};`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      Fragment
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      여러 요소를 wrapper 없이 그룹화할 수 있습니다:
    </p>

    <CodeBlock
      language="typescript"
      code={`const MultipleElements = () => (
  <>
    <h1>Title</h1>
    <p>Description</p>
    <div>Content</div>
  </>
);`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      지시자 (Directives)
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent 템플릿은{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        l-
      </code>{' '}
      접두사를 사용하는 강력한 지시자를 제공합니다.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      l-if / l-else-if / l-else
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      조건부 렌더링을 선언적으로 작성할 수 있습니다:
    </p>

    <CodeBlock
      language="typescript"
      code={`const ConditionalRendering = () => {
  const status = 'loading'; // 'loading' | 'error' | 'success'

  return (
    <div>
      <div l-if={status === 'loading'}>
        Loading...
      </div>
      <div l-else-if={status === 'error'}>
        Error occurred!
      </div>
      <div l-else>
        Content loaded successfully!
      </div>
    </div>
  );
};`}
    />

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ 규칙:</span>
        <br />
        <br />•{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          l-else-if
        </code>
        와{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          l-else
        </code>
        는 반드시{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          l-if
        </code>
        나{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          l-else-if
        </code>{' '}
        바로 다음에 와야 합니다
        <br />• 표현식은 항상{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          {`{}`}
        </code>{' '}
        안에 작성합니다
      </p>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      l-for
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      리스트를 반복 렌더링합니다:
    </p>

    <CodeBlock
      language="typescript"
      code={`const TodoList = () => {
  const todos = [
    { id: 1, text: 'Learn Lithent' },
    { id: 2, text: 'Build App' },
    { id: 3, text: 'Deploy' },
  ];

  return (
    <ul class="todo-list">
      {/* 기본 형태: item in list */}
      <li l-for={todo in todos}>
        {todo.text}
      </li>
    </ul>
  );
};`}
    />

    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6">
      인덱스 사용
    </h4>

    <CodeBlock
      language="typescript"
      code={`const NumberedList = () => {
  const items = ['Apple', 'Banana', 'Cherry'];

  return (
    <ul>
      {/* (item, index) in list */}
      <li l-for={(item, index) in items}>
        {index + 1}. {item}
      </li>
    </ul>
  );
};`}
    />

    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6">
      복잡한 예제
    </h4>

    <CodeBlock
      language="typescript"
      code={`const TodoApp = () => {
  const todos = [
    { id: 1, text: 'Task 1', done: false },
    { id: 2, text: 'Task 2', done: true },
  ];

  return (
    <div class="todo-app">
      <h2>Todos ({todos.length})</h2>

      <div l-for={(todo, index) in todos} class="todo-item">
        <input type="checkbox" checked={todo.done} />
        <span>{index + 1}. {todo.text}</span>
        <span l-if={todo.done} class="badge">Done</span>
      </div>

      <p l-if={todos.length === 0}>No todos yet!</p>
    </div>
  );
};`}
    />

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 l-for 문법:</span>
        <br />
        <br />•{' '}
        <code class="px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm">
          {`l-for={item in list}`}
        </code>{' '}
        - 각 요소만
        <br />•{' '}
        <code class="px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm">
          {`l-for={(item, index) in list}`}
        </code>{' '}
        - 요소와 인덱스
        <br />• list는 배열, 객체 등 반복 가능한 모든 값
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      컴포넌트 사용
    </h2>

    <CodeBlock
      language="typescript"
      code={`// Button.ltsx
import { mount } from 'lithent';

interface ButtonProps {
  text: string;
  onClick: () => void;
}

export const Button = mount<ButtonProps>((renew, props) => {
  return () => (
    <button class="btn" onClick={props.onClick}>
      {props.text}
    </button>
  );
});

// App.ltsx
import { Button } from './Button.ltsx';

const App = () => {
  const handleClick = () => {
    console.log('Clicked!');
  };

  return (
    <div class="app">
      <h1>My App</h1>
      <Button text="Click Me" onClick={handleClick} />
    </div>
  );
};`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      실전 예제
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      완전한 Todo 앱
    </h3>

    <CodeBlock
      language="typescript"
      code={`// TodoApp.ltsx
import { mount } from 'lithent';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export const TodoApp = mount(renew => {
  let todos: Todo[] = [];
  let input = '';
  let nextId = 1;

  const addTodo = () => {
    if (input.trim()) {
      todos = [...todos, { id: nextId++, text: input, completed: false }];
      input = '';
      renew();
    }
  };

  const toggleTodo = (id: number) => {
    todos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    renew();
  };

  const removeTodo = (id: number) => {
    todos = todos.filter(todo => todo.id !== id);
    renew();
  };

  return () => (
    <div class="todo-app">
      <h1>My Todos</h1>

      <div class="input-section">
        <input
          type="text"
          value={input}
          onInput={(e) => {
            input = (e.target as HTMLInputElement).value;
            renew();
          }}
          placeholder="Add new todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <div l-if={todos.length > 0} class="todo-list">
        <div l-for={(todo, index) in todos} class="todo-item">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleTodo(todo.id)}
          />
          <span class={todo.completed ? 'completed' : ''}>
            {index + 1}. {todo.text}
          </span>
          <button onClick={() => removeTodo(todo.id)}>Delete</button>
        </div>
      </div>

      <p l-else class="empty-message">
        No todos yet. Add one above!
      </p>

      <div class="stats">
        Total: {todos.length} |
        Completed: {todos.filter(t => t.completed).length}
      </div>
    </div>
  );
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      사용자 프로필 카드
    </h3>

    <CodeBlock
      language="typescript"
      code={`// ProfileCard.ltsx
import { mount } from 'lithent';

interface User {
  name: string;
  avatar?: string;
  bio?: string;
  isOnline: boolean;
}

interface ProfileCardProps {
  user: User;
}

export const ProfileCard = mount<ProfileCardProps>((renew, props) => {
  return () => (
    <div class="profile-card">
      <div l-if={props.user.avatar} class="avatar">
        <img src={props.user.avatar} alt={props.user.name} />
        <span l-if={props.user.isOnline} class="online-badge">●</span>
      </div>
      <div l-else class="avatar-placeholder">
        {props.user.name[0]}
      </div>

      <h3>{props.user.name}</h3>

      <p l-if={props.user.bio} class="bio">
        {props.user.bio}
      </p>

      <div class="status">
        <span l-if={props.user.isOnline}>Online</span>
        <span l-else>Offline</span>
      </div>
    </div>
  );
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      컴파일 결과
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      템플릿이 어떻게 변환되는지 확인해보세요:
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          템플릿 (입력)
        </h3>
        <CodeBlock
          language="typescript"
          code={`<div class="todo-list">
  <h2>Todos ({todos.length})</h2>
  <ul>
    <li l-for={(todo, index) in todos}>
      <span>{index + 1}.</span>
      <span>{todo.text}</span>
    </li>
  </ul>
</div>`}
        />
      </div>

      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          JavaScript (출력)
        </h3>
        <CodeBlock
          language="javascript"
          code={`h('div', { class: 'todo-list' },
  h('h2', null, 'Todos (', todos.length, ')'),
  h('ul', null,
    (todos).map((todo, index) =>
      h('li', null,
        h('span', null, index + 1, '.'),
        h('span', null, todo.text)
      )
    )
  )
)`}
        />
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      템플릿 vs JSX vs 기타
    </h2>

    <div class="overflow-x-auto mb-6">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              특징
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              Template Strings
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              JSX
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              HTM Tags
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
              문법
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              JSX-like
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              JSX
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Tagged Template
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
              지시자
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300">
              l-if, l-for 지원
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              JavaScript 표현식
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              JavaScript 표현식
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
              빌드 설정
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Vite 플러그인
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Babel/TypeScript
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300">
              설정 불필요
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
              파일 확장자
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              .ltsx, .ljsx
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              .tsx, .jsx
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              .ts, .js
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
              소스맵
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300">
              완벽 지원
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300">
              완벽 지원
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              N/A (런타임)
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      언제 템플릿을 사용할까?
    </h2>

    <div class="grid gap-6 mb-6">
      <div class="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r">
        <h3 class="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
          ✅ 템플릿이 적합한 경우
        </h3>
        <ul class="space-y-2 text-sm md:text-base text-green-800 dark:text-green-200">
          <li>• 선언적 조건부 렌더링이 많은 경우 (l-if)</li>
          <li>• 복잡한 리스트 렌더링 (l-for)</li>
          <li>• HTML-like 문법을 선호하는 경우</li>
          <li>• JSX transform 없이 JSX 스타일을 원할 때</li>
          <li>• 소스맵 지원이 중요한 프로젝트</li>
        </ul>
      </div>

      <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r">
        <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          ℹ️ JSX가 더 나은 경우
        </h3>
        <ul class="space-y-2 text-sm md:text-base text-blue-800 dark:text-blue-200">
          <li>• 이미 JSX 환경이 구축된 프로젝트</li>
          <li>• React에서 마이그레이션하는 경우</li>
          <li>• 팀이 JSX에 익숙한 경우</li>
          <li>• 복잡한 JavaScript 로직이 많은 경우</li>
        </ul>
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      고급 옵션
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      커스텀 확장자
    </h3>

    <CodeBlock
      language="typescript"
      code={`// vite.config.ts
import { defineConfig } from 'vite';
import lithentTemplateVite from '@lithent/lithent-template-vite';

export default defineConfig({
  plugins: [
    lithentTemplateVite({
      // 커스텀 확장자 추가
      extensions: ['.ltsx', '.ljsx', '.custom'],

      // 확장자별 로더 지정
      extensionLoaders: {
        '.custom': 'ts',
      },
    }),
  ],
});`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      필터 패턴
    </h3>

    <CodeBlock
      language="typescript"
      code={`// vite.config.ts
import { defineConfig } from 'vite';
import lithentTemplateVite from '@lithent/lithent-template-vite';

export default defineConfig({
  plugins: [
    lithentTemplateVite({
      // 특정 파일만 처리
      include: [/\\.ltsx$/, /src\\/templates\\/.*\\.ts$/],
    }),
  ],
});`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음단계
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
          실전 예제 보기 →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          20개 이상의 실용적인 예제를 통해 Lithent의 다양한 기능을 경험해보세요.
          <br />
          computed, store, portal 등의 실제 활용 방법을 배울 수 있습니다.
        </p>
      </a>

      <a
        href="/"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          ← 홈으로 돌아가기
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Lithent의 전체 문서 구조를 확인하고 원하는 주제를 찾아보세요.
        </p>
      </a>
    </div>
  </div>
);
