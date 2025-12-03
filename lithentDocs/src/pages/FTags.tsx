import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const FTags = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      FTags
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      개요
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        lithent/ftags
      </code>
      는{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        JSX 없이 순수 JavaScript/TypeScript 함수로 UI를 작성
      </strong>
      할 수 있는 함수형 API입니다.
      <br />
      <br />
      빌드 도구 설정 없이 즉시 사용 가능하며, TypeScript에서 완전한 타입
      안전성을 제공합니다.
    </p>

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        주요 장점
      </h3>
      <ul class="space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              제로 설정:
            </strong>{' '}
            Babel, TypeScript, Vite 설정 불필요
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              타입 안전:
            </strong>{' '}
            완전한 TypeScript 타입 추론
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              유연한 문법:
            </strong>{' '}
            Props 생략 가능한 직관적 API
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              CDN 친화적:
            </strong>{' '}
            빌드 도구 없이 브라우저에서 직접 사용 가능
          </div>
        </li>
      </ul>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      설치
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      NPM
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent를 설치하면{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        lithent/ftags
      </code>
      를 바로 사용할 수 있습니다. 별도의 설치가 필요하지 않습니다.
    </p>

    <CodeBlock
      language="bash"
      code={`npm install lithent
# or
pnpm add lithent`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      CDN (UMD)
    </h3>

    <CodeBlock
      language="html"
      code={`<script src="https://cdn.jsdelivr.net/npm/lithent/dist/lithent.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lithent/ftags/dist/lithentFTags.umd.js
"></script>

<script>
  const { render } = lithent;
  const { fTags, fMount, fFragment } = lithentFTags;

  // 사용 가능
</script>`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      fTags - HTML 요소 생성
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        fTags
      </code>
      는 Proxy 기반으로 모든 HTML 태그를 동적으로 생성합니다. 구조 분해 할당으로
      필요한 태그만 가져올 수 있습니다.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      기본 사용법
    </h3>

    <CodeBlock
      language="typescript"
      code={`import { render } from 'lithent';
import { fTags } from 'lithent/ftags';

// 필요한 태그만 구조 분해
const { div, p, span, button, input } = fTags;

// 텍스트만 포함
const element1 = div('Hello World');

// Props와 텍스트
const element2 = div({ className: 'container' }, 'Content');

// 중첩 요소
const element3 = div(
  { className: 'card' },
  p('Title'),
  p('Description')
);

render(element3, document.getElementById('root'));`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      Props 생략 가능
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      FTags의 핵심 기능 중 하나는{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        Props 자동 감지
      </strong>
      입니다. 첫 번째 인자가 일반 객체(props)인지 children인지 자동으로
      판단합니다.
    </p>

    <CodeBlock
      language="typescript"
      code={`const { div, span } = fTags;

// Props 없이 children만
div('텍스트만');
div(span('중첩 요소'));

// Props와 children
div({ id: 'app' }, '텍스트');
div({ className: 'box' }, span('중첩'));

// Props만 (children 없음)
input({ type: 'text', placeholder: '입력...' });

// 모두 없음
div();`}
    />

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 동작 원리:</span>
        <br />
        <br />
        FTags는 내부적으로{' '}
        <code class="px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm">
          isPropType()
        </code>{' '}
        함수를 사용하여 첫 번째 인자를 검사합니다:
        <br />
        <br />• 일반 객체(Plain Object)이고 Virtual DOM이 아니면 → Props로 처리
        <br />• 문자열, 숫자, Virtual DOM 등이면 → Children으로 처리
      </p>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      Props 속성
    </h3>

    <CodeBlock
      language="typescript"
      code={`const { div, button, input, a } = fTags;

// 클래스와 스타일
div(
  {
    className: 'container',
    style: { padding: '20px', backgroundColor: '#f0f0f0' }
  },
  'Styled Content'
);

// 이벤트 핸들러
button(
  {
    onClick: () => console.log('Clicked!'),
    disabled: false
  },
  'Click Me'
);

// HTML 속성
input({
  type: 'email',
  placeholder: 'your@email.com',
  required: true,
  value: ''
});

// 링크와 기타 속성
a({ href: 'https://example.com', target: '_blank' }, 'Visit Site');`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      복잡한 중첩 구조
    </h3>

    <CodeBlock
      language="typescript"
      code={`const { section, div, h1, p, ul, li, strong } = fTags;

const page = section(
  { className: 'page' },

  h1('Welcome to FTags'),

  p(
    'This is a ',
    strong({ style: { color: 'red' } }, 'powerful'),
    ' functional API for building UIs.'
  ),

  ul(
    li('Zero configuration'),
    li('Type safe'),
    li('Props optional')
  ),

  div(
    { className: 'footer' },
    p('© 2024 Lithent')
  )
);

render(page, document.getElementById('root'));`}
    />

    <div class="border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-emerald-800 dark:text-emerald-200 leading-relaxed">
        <span class="font-medium">💡 마운터 없이도 OK:</span> fTags로 만든
        결과는 바로 render에 넘겨 사용할 수 있습니다. 컴포넌트 추상화가 필요할
        때만 fMount/flMount를 쓰고, 단순 정적/동적 트리를 만들 때는 위 예시처럼
        바로 render를 호출하면 됩니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      fFragment - Fragment 생성
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        fFragment
      </code>
      는 여러 요소를 감싸는 wrapper 없이 그룹화합니다. JSX의{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        &lt;&gt;&lt;/&gt;
      </code>
      와 동일합니다.
    </p>

    <CodeBlock
      language="typescript"
      code={`import { fTags, fFragment } from 'lithent/ㅏftags';

const { div, p, span } = fTags;

// Fragment로 여러 요소 그룹화
const content = fFragment(
  p('First paragraph'),
  p('Second paragraph'),
  span('Inline text')
);

// 컴포넌트에서 Fragment 반환
const MultiElement = fMount(() => {
  return () => fFragment(
    div('Element 1'),
    div('Element 2'),
    div('Element 3')
  );
});`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 사용 사례:
        </span>
        <br />
        <br />• 컴포넌트에서 여러 최상위 요소 반환
        <br />• 테이블의 여러 행 그룹화 (tr 여러 개)
        <br />• 불필요한 div wrapper 제거
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      fMount - 컴포넌트 생성
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        fMount
      </code>
      는{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        mount
      </code>{' '}
      스타일의 컴포넌트 함수를 JSX 없이 바로 사용할 수 있게 합니다.{' '}
      <strong class="font-semibold text-gray-900 dark:text-white">
        mount나 lmount로 한 번 더 감싸지 말고
      </strong>
      , renew 인자를 받는 원본 컴포넌트를 그대로 전달하세요.
    </p>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      기본 컴포넌트
    </h3>

    <CodeBlock
      language="typescript"
      code={`import { render } from 'lithent';
import { fMount, fTags } from 'lithent/ftags';

const { div, button } = fTags;

// fMount로 컴포넌트 생성
const Counter = fMount((renew) => {
  let count = 0;

  const increment = () => {
    count++;
    renew();
  };

  return () => div(
    { className: 'counter' },
    div(\`Count: \${count}\`),
    button({ onClick: increment }, 'Increment')
  );
});

// 사용
render(Counter(), document.getElementById('root'));`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      Props가 있는 컴포넌트
    </h3>

    <CodeBlock
      language="typescript"
      code={`import { render } from 'lithent';
import { fMount, fTags } from 'lithent/ftags';

const { div, p } = fTags;

// Props 타입 정의
interface GreetingProps {
  name: string;
  age?: number;
}

// fMount로 바로 생성
const Greeting = fMount<GreetingProps>((_renew, props) => {
  return () =>
    div(
      { className: 'greeting' },
      p(\`Hello, \${props.name}!\`),
      props.age && p(\`Age: \${props.age}\`)
    );
});

// Props와 함께 사용
render(
  Greeting({ name: 'John', age: 30 }),
  document.getElementById('root')
);`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      Children이 있는 컴포넌트
    </h3>

    <CodeBlock
      language="typescript"
      code={`import { render } from 'lithent';
import { fMount, fTags } from 'lithent/ftags';

const { div, p } = fTags;

// Children을 받는 컴포넌트
const Card = fMount((_renew, _props, children) => {
  return () =>
    div(
      { className: 'card' },
      div({ className: 'card-content' }, ...children)
    );
});

// Children과 함께 사용
render(
  Card(
    p('This is card content'),
    p('Multiple children supported')
  ),
  document.getElementById('root')
);`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      Props와 Children 함께 사용
    </h3>

    <CodeBlock
      language="typescript"
      code={`import { render } from 'lithent';
import { fMount, fTags } from 'lithent/ftags';

const { div, h2, p } = fTags;

interface CardProps {
  title: string;
  bordered?: boolean;
}

const Card = fMount<CardProps>((_renew, props, children) => {
  return () =>
    div(
      {
        className: 'card',
        style: props.bordered ? { border: '1px solid #ccc' } : {}
      },
      h2(props.title),
      div({ className: 'card-body' }, ...children)
    );
});

// Props와 Children 모두 전달
render(
  Card(
    { title: 'My Card', bordered: true },
    p('Card content here'),
    p('More content')
  ),
  document.getElementById('root')
);`}
    />

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 Props 생략 가능:</span>
        <br />
        <br />
        FMount도 fTags처럼 Props를 생략할 수 있습니다:
        <br />
        <br />
        <code class="px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm">
          Card() // Props, Children 모두 없음
        </code>
        <br />
        <code class="px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm">
          Card(p('Text')) // Props 없이 Children만
        </code>
        <br />
        <code class="px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm">
          Card(&#123; title: 'Hi' &#125;) // Props만
        </code>
        <br />
        <code class="px-2 py-1 bg-blue-700 dark:bg-blue-600 rounded text-sm">
          Card(&#123; title: 'Hi' &#125;, p('Text')) // Props와 Children
        </code>
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      flMount - Light API 컴포넌트
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        flMount
      </code>
      는{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        lmount
      </code>
      (Light API) 스타일 컴포넌트를 JSX 없이 함수 형태로 사용할 수 있게 합니다.
      lmount로 한 번 더 감쌀 필요 없이, renew가 없는 Light API 컴포넌트를 바로
      전달하세요. 상태 갱신이 필요하면{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        useRenew
      </code>
      나{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        lstate
      </code>
      를 사용해 다시 그리면 됩니다.
    </p>

    <CodeBlock
      language="typescript"
      code={`import { render, useRenew } from 'lithent';
import { flMount, fTags } from 'lithent/ftags';

const { div, button } = fTags;

// renew 파라미터 없이 작성하는 Light API 컴포넌트
const Counter = flMount(() => {
  let count = 0;
  const renew = useRenew();

  const increment = () => {
    count++;
    renew();
  };

  return () =>
    div(
      div(\`Count: \${count}\`),
      button({ onClick: increment }, 'Increment')
    );
});

render(Counter(), document.getElementById('root'));`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      lstate와 함께 사용 (권장)
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        flMount
      </code>
      는{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        lstate
      </code>
      (lithent/helper)와 함께 사용하면 더욱 강력합니다. renew 없이 자동으로
      상태가 추적되고 업데이트됩니다.
    </p>

    <CodeBlock
      language="typescript"
      code={`import { render } from 'lithent';
import { lstate } from 'lithent/helper';
import { flMount, fTags } from 'lithent/ftags';

const { div, button } = fTags;

// 간단한 Counter
const Counter = flMount(() => {
  const count = lstate(0);

  return () =>
    div(
      { className: 'counter' },
      div(\`Count: \${count.value}\`),
      button(
        { onClick: () => count.value++ },
        'Increment'
      ),
      button(
        { onClick: () => count.value-- },
        'Decrement'
      )
    );
});

render(Counter(), document.getElementById('root'));`}
    />

    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2 mt-6">
      복잡한 예제: Todo 앱 (lstate 사용)
    </h4>

    <CodeBlock
      language="typescript"
      code={`import { render } from 'lithent';
import { lstate } from 'lithent/helper';
import { flMount, fTags } from 'lithent/ftags';

const { div, input, button, ul, li } = fTags;

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

const TodoApp = flMount(() => {
  const todos = lstate<TodoItem[]>([]);
  const inputValue = lstate('');
  const nextId = lstate(1);

  const addTodo = () => {
    if (inputValue.value.trim()) {
      todos.value = [
        ...todos.value,
        { id: nextId.value++, text: inputValue.value, completed: false }
      ];
      inputValue.value = '';
    }
  };

  const toggleTodo = (id: number) => {
    todos.value = todos.value.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  };

  const removeTodo = (id: number) => {
    todos.value = todos.value.filter(todo => todo.id !== id);
  };

  return () => div(
    { className: 'todo-app' },

    div(
      { className: 'input-group' },
      input({
        type: 'text',
        value: inputValue.value,
        onInput: (e: Event) => {
          inputValue.value = (e.target as HTMLInputElement).value;
        },
        placeholder: 'Enter todo...'
      }),
      button({ onClick: addTodo }, 'Add')
    ),

    ul(
      { className: 'todo-list' },
      ...todos.value.map(todo =>
        li(
          {
            key: todo.id,
            style: {
              textDecoration: todo.completed ? 'line-through' : 'none',
              opacity: todo.completed ? 0.6 : 1
            }
          },
          div(
            { style: { display: 'flex', gap: '10px', alignItems: 'center' } },
            input({
              type: 'checkbox',
              checked: todo.completed,
              onChange: () => toggleTodo(todo.id)
            }),
            div(todo.text),
            button(
              { onClick: () => removeTodo(todo.id) },
              'Delete'
            )
          )
        )
      )
    ),

    div(\`Total: \${todos.value.length} | Completed: \${todos.value.filter(t => t.completed).length}\`)
  );
});

render(TodoApp(), document.getElementById('root'));`}
    />

    <div class="border-l-4 border-[#42b883] bg-gradient-to-r from-[#42b883]/5 to-transparent dark:from-[#42b883]/10 dark:to-transparent p-6 mb-6 rounded-r">
      <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        💡 flMount + lstate의 장점
      </h4>
      <ul class="space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              renew 불필요:
            </strong>{' '}
            상태가 자동으로 추적되고 업데이트됨
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              간결한 코드:
            </strong>{' '}
            lstate가 상태 변경을 감지하여 자동 렌더링
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              함수형 스타일:
            </strong>{' '}
            JSX 없이도 깔끔한 함수형 컴포넌트 작성
          </div>
        </li>
        <li class="flex items-start">
          <span class="font-semibold text-[#42b883] mr-3 flex-shrink-0">✓</span>
          <div>
            <strong class="font-semibold text-gray-900 dark:text-white">
              빌드 도구 불필요:
            </strong>{' '}
            CDN으로도 즉시 사용 가능
          </div>
        </li>
      </ul>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      실전 예제
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4">
      Todo 앱
    </h3>

    <CodeBlock
      language="typescript"
      code={`import { render } from 'lithent';
import { fMount, fTags } from 'lithent/ftags';

const { div, input, button, ul, li } = fTags;

interface TodoItem {
  id: number;
  text: string;
}

const TodoApp = fMount((renew) => {
  let todos: TodoItem[] = [];
  let nextId = 1;
  let inputValue = '';

  const addTodo = () => {
    if (inputValue.trim()) {
      todos = [...todos, { id: nextId++, text: inputValue }];
      inputValue = '';
      renew();
    }
  };

  const removeTodo = (id: number) => {
    todos = todos.filter(todo => todo.id !== id);
    renew();
  };

  return () => div(
    { className: 'todo-app' },

    div(
      { className: 'input-group' },
      input({
        type: 'text',
        value: inputValue,
        onInput: (e: Event) => {
          inputValue = (e.target as HTMLInputElement).value;
          renew();
        },
        placeholder: 'Enter todo...'
      }),
      button({ onClick: addTodo }, 'Add')
    ),

    ul(
      { className: 'todo-list' },
      ...todos.map(todo =>
        li(
          { key: todo.id },
          todo.text,
          button(
            {
              onClick: () => removeTodo(todo.id),
              style: { marginLeft: '10px' }
            },
            'Delete'
          )
        )
      )
    )
  );
});

render(TodoApp(), document.getElementById('root'));`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-8">
      재사용 가능한 컴포넌트 조합
    </h3>

    <CodeBlock
      language="typescript"
      code={`import { render } from 'lithent';
import { fMount, fTags } from 'lithent/ftags';

const { div, button, p } = fTags;

// Button 컴포넌트
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

const CustomButton = fMount<ButtonProps>((_renew, props, children) => {
  const styles = {
    primary: { backgroundColor: '#007bff', color: 'white' },
    secondary: { backgroundColor: '#6c757d', color: 'white' }
  };

  return () =>
    button(
      {
        style: {
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          ...styles[props.variant || 'primary']
        },
        onClick: props.onClick
      },
      ...children
    );
});

// Card 컴포넌트
interface CardProps {
  title: string;
}

const Card = fMount<CardProps>((_renew, props, children) => {
  return () =>
    div(
      {
        style: {
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          margin: '10px 0'
        }
      },
      p({ style: { fontSize: '20px', fontWeight: 'bold' } }, props.title),
      div(...children)
    );
});

// App에서 조합
const App = fMount(() => {
  const handleClick = () => {
    console.log('Button clicked!');
  };

  return () =>
    div(
      Card(
        { title: 'Welcome' },
        p('This is a reusable card component.'),
        CustomButton(
          { variant: 'primary', onClick: handleClick },
          'Click Me'
        ),
        CustomButton(
          { variant: 'secondary', onClick: handleClick },
          'Secondary'
        )
      )
    );
});

render(App(), document.getElementById('root'));`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      JSX vs FTags 비교
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          JSX 방식
        </h3>
        <CodeBlock
          language="tsx"
          code={`import { mount } from 'lithent';

const App = mount((renew) => {
  let count = 0;

  return () => (
    <div className="app">
      <h1>Count: {count}</h1>
      <button
        onClick={() => {
          count++;
          renew();
        }}
      >
        Increment
      </button>
    </div>
  );
});`}
        />
      </div>

      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          FTags 방식
        </h3>
        <CodeBlock
          language="typescript"
          code={`import { mount } from 'lithent';
import { fMount, fTags } from 'lithent/ftags';

const { div, h1, button } = fTags;

const App = mount(renew => {
  let count = 0;

  return () =>
    div(
      { className: 'app' },
      h1(\`Count: \${count}\`),
      button(
        {
          onClick: () => {
            count++;
            renew();
          },
        },
        'Increment'
      )
    );
});
          `}
        />
      </div>
    </div>

    <div class="overflow-x-auto mb-6">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              특징
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              JSX
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              FTags
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
              빌드 설정
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Babel/TypeScript 설정 필요
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300">
              설정 불필요
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
              CDN 사용
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              불가능 (빌드 필요)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300">
              즉시 사용 가능
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
              가독성
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300">
              HTML과 유사 (직관적)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              함수 호출 형태
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
              타입 안전성
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300">
              완전 지원
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-green-700 dark:text-green-300">
              완전 지원
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
              학습 곡선
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              HTML 지식 활용
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              JavaScript 함수 호출
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      언제 FTags를 사용할까?
    </h2>

    <div class="grid gap-6 mb-6">
      <div class="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r">
        <h3 class="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
          ✓ FTags가 적합한 경우
        </h3>
        <ul class="space-y-2 text-sm md:text-base text-green-800 dark:text-green-200">
          <li>• 빌드 도구 설정을 피하고 싶을 때</li>
          <li>• CDN으로 즉시 프로토타입을 만들 때</li>
          <li>• 순수 JavaScript/TypeScript로 작업하고 싶을 때</li>
          <li>• 작은 위젯이나 라이브러리를 만들 때</li>
          <li>• JSX 설정이 어려운 환경 (일부 레거시 프로젝트)</li>
        </ul>
      </div>

      <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r">
        <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          ℹ️ JSX가 더 나은 경우
        </h3>
        <ul class="space-y-2 text-sm md:text-base text-blue-800 dark:text-blue-200">
          <li>• 대규모 애플리케이션 개발</li>
          <li>• 팀이 JSX에 익숙할 때</li>
          <li>• 복잡한 UI 구조 (JSX가 더 읽기 쉬움)</li>
          <li>• 이미 빌드 환경이 구축된 프로젝트</li>
        </ul>
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      TypeScript 타입 정의
    </h2>

    <CodeBlock
      language="typescript"
      code={`import type { Props, WDom, MiddleStateWDom } from 'lithent';

// fTags 타입
type FFunction = (...param: (Props | MiddleStateWDom)[]) => WDom;
type FTags = {
  [tagName: string]: FFunction;
};

// fFragment 타입
const fFragment: (...children: MiddleStateWDom[]) => WDom;

// fMount 타입
const fMount: <T>(
  component: Component<T>
) => (
  ...param: unknown extends T
    ? (Props | MiddleStateWDom)[]
    : [T, ...MiddleStateWDom[]]
) => WDom;

// flMount 타입
const flMount: <T>(
  component: LComponent<T>
) => (
  ...param: unknown extends T
    ? (Props | MiddleStateWDom)[]
    : [T, ...MiddleStateWDom[]]
) => WDom;`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음 단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/htm-tags"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/htm-tags');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          JSX & Templates: HTM Tags →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          Template literal 기반의 HTM(Hyperscript Tagged Markup)을 알아보세요.
          <br />
          HTML과 유사한 문법으로 빌드 도구 없이 사용 가능합니다.
        </p>
      </a>
    </div>
  </div>
);
