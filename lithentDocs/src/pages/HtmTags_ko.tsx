import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const HtmTagsKo = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      HTM Tags
    </h1>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      HTM이란?
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <a
        href="https://github.com/developit/htm"
        target="_blank"
        rel="noopener noreferrer"
        class="text-[#42b883] hover:underline font-medium"
      >
        HTM (Hyperscript Tagged Markup)
      </a>
      은{' '}
      <strong class="font-semibold text-[#42b883] bg-[#42b883] bg-opacity-10 px-2 py-1 rounded">
        JSX-like 문법을 순수 JavaScript로 사용
      </strong>
      할 수 있게 해주는 라이브러리입니다.
      <br />
      <br />
      트랜스파일러 없이 브라우저에서 직접 JSX와 유사한 문법을 사용할 수 있으며,
      매우 작은 크기(약 600 bytes)를 자랑합니다.
      <br />
      <br />
      Lithent는{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        lithent/tag
      </code>{' '}
      패키지를 통해 HTM을 Lithent의{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        h
      </code>{' '}
      함수에 바인딩하여 제공합니다.
    </p>

    <div class="border-l-4 border-[#42b883] bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
        <span class="font-medium">✨ 주요 특징:</span>
        <br />
        <br />
        • 트랜스파일러 불필요 - 순수 JavaScript
        <br />
        • 매우 작은 크기 - 약 600 bytes
        <br />
        • JSX와 유사한 문법
        <br />
        • ES6 Tagged Templates 사용
        <br />• 모든 모던 브라우저 지원
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      설치 및 기본 사용법
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      설치
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent를 설치하면{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        lithent/tag
      </code>
      를 바로 사용할 수 있습니다. 별도의 설치가 필요하지 않습니다.
    </p>

    <CodeBlock language="bash" code={`npm install lithent`} />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      CDN 사용
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      빌드 툴 없이 브라우저에서 직접 사용하고 싶다면 CDN을 통해 import할 수
      있습니다. ES modules를 사용하여 HTM과 Lithent를 함께 사용할 수 있습니다.
    </p>

    <CodeBlock
      language="html"
      code={`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lithent + HTM CDN Example</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 600px;
      margin: 40px auto;
      padding: 20px;
    }
    .counter {
      text-align: center;
    }
    button {
      font-size: 18px;
      padding: 10px 20px;
      margin: 5px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <!-- CDN에서 Lithent와 lithentTag 로드 -->
  <script src="https://cdn.jsdelivr.net/npm/lithent/dist/lithent.umd.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lithent/tag/dist/lithentTag.umd.js"></script>

  <script>
    // 전역 변수에서 필요한 것들 가져오기
    const { h, Fragment, mount, render } = lithent;
    const { lTag } = lithentTag;

    // 카운터 컴포넌트
    const Counter = mount(renew => {
      let count = 0;

      const increment = () => {
        count += 1;
        renew();
      };

      const decrement = () => {
        count -= 1;
        renew();
      };

      return () => lTag\`
        <div class="counter">
          <h1>Counter: \${count}</h1>
          <button onClick=\${increment}>+1</button>
          <button onClick=\${decrement}>-1</button>
        </div>
      \`;
    });

    // 렌더링
    render(lTag\`<\${Counter} />\`, document.getElementById('root'));
  </script>
</body>
</html>`}
    />

    <div class="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed">
        <span class="font-medium">✨ CDN 장점:</span> 위 HTML 파일을 그대로
        저장하고 브라우저에서 열면 바로 동작합니다. 빌드 설정이나 번들러가 전혀
        필요하지 않습니다!
        <br />
        <br />
        <span class="font-medium">📦 추가 패키지:</span> Helper 기능도
        사용하려면{' '}
        <code class="px-2 py-1 bg-green-200 dark:bg-green-800 rounded text-sm">
          lithent@2/helper/dist/lithentHelper.umd.js
        </code>
        를 추가로 로드하세요.
        <br />
        <br />
        <span class="font-medium">🔖 버전 지정:</span> 특정 버전을 사용하려면{' '}
        <code class="px-2 py-1 bg-green-200 dark:bg-green-800 rounded text-sm">
          lithent@1.20.2
        </code>{' '}
        처럼 버전을 명시할 수 있습니다.
      </p>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      기본 사용 (npm)
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        lithent/tag
      </code>
      에서{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        lTag
      </code>
      를 import하면 바로 사용할 수 있습니다.
    </p>

    <CodeBlock
      language="javascript"
      code={`import { mount, render } from 'lithent';
import { lTag } from 'lithent/tag';

const App = mount(renew => {
  let count = 0;

  const increment = () => {
    count += 1;
    renew();
  };

  return () => lTag\`
    <div>
      <h1>Counter: \${count}</h1>
      <button onClick=\${increment}>Increment</button>
    </div>
  \`;
});

render(lTag\`<\${App} />\`, document.getElementById('root'));`}
    />

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        <span class="font-medium">💡 Tagged Templates:</span> HTM은 ES6 Tagged
        Templates를 사용합니다.{' '}
        <code class="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-sm">
          lTag`...`
        </code>{' '}
        형태로 사용하며, 백틱(`) 안에 HTML-like 마크업을 작성합니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      JSX와의 차이점
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      HTM은 JSX와 매우 유사하지만 몇 가지 차이점이 있습니다:
    </p>

    <div class="overflow-x-auto mb-6">
      <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              특성
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              JSX
            </th>
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              HTM
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              트랜스파일러
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              필요 (Babel 등)
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              불필요 (순수 JS)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              컴포넌트
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              {`<Foo />`}
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              {`<\${Foo} />`}
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Spread Props
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              {`<div {...props}>`}
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              {`<div ...\${props}>`}
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              종료 태그
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              {`</Foo>`}
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              {`<//>`} (간단 종료)
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              HTML 따옴표
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              필수
            </td>
            <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              선택 (class=foo)
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      예제 비교
    </h3>

    <CodeBlock
      language="javascript"
      code={`// JSX
<MyComponent name="John" age={25} />

// HTM
lTag\`<\${MyComponent} name="John" age=\${25} />\`

// JSX - Spread props
<div {...props}>content</div>

// HTM - Spread props
lTag\`<div ...\${props}>content</div>\`

// JSX - 종료 태그
<MyComponent>
  <h1>Title</h1>
</MyComponent>

// HTM - 간단 종료
lTag\`<\${MyComponent}>
  <h1>Title</h1>
<//>\``}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      실전 예제
    </h2>

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      카운터 애플리케이션
    </h3>

    <CodeBlock
      language="javascript"
      code={`import { mount, render } from 'lithent';
import { lTag } from 'lithent/tag';

const Counter = mount(renew => {
  let count = 0;

  const increment = () => {
    count += 1;
    renew();
  };

  const decrement = () => {
    count -= 1;
    renew();
  };

  return () => lTag\`
    <div class="counter">
      <h1>Count: \${count}</h1>
      <button onClick=\${increment}>+</button>
      <button onClick=\${decrement}>-</button>
    </div>
  \`;
});

render(lTag\`<\${Counter} />\`, document.getElementById('root'));`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Todo 리스트
    </h3>

    <CodeBlock
      language="javascript"
      code={`import { mount, render } from 'lithent';
import { lTag } from 'lithent/tag';

const TodoApp = mount(renew => {
  let todos = ['Learn Lithent', 'Build App'];
  let input = '';

  const addTodo = () => {
    if (input.trim()) {
      todos = [...todos, input];
      input = '';
      renew();
    }
  };

  const removeTodo = (index) => {
    todos = todos.filter((_, i) => i !== index);
    renew();
  };

  return () => lTag\`
    <div class="todo-app">
      <h1>Todo List</h1>

      <div class="input-section">
        <input
          type="text"
          value=\${input}
          onInput=\${(e) => { input = e.target.value; }}
          placeholder="Add new todo..."
        />
        <button onClick=\${addTodo}>Add</button>
      </div>

      <ul class="todo-list">
        \${todos.map((todo, index) => lTag\`
          <li key=\${index}>
            <span>\${todo}</span>
            <button onClick=\${() => removeTodo(index)}>Delete</button>
          </li>
        \`)}
      </ul>
    </div>
  \`;
});

render(lTag\`<\${TodoApp} />\`, document.getElementById('root'));`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      컴포넌트 구성
    </h3>

    <CodeBlock
      language="javascript"
      code={`import { mount, render } from 'lithent';
import { lTag } from 'lithent/tag';

// Header 컴포넌트
const Header = mount((renew, props) => {
  return () => lTag\`
    <header>
      <h1>\${props.title}</h1>
      <p>\${props.subtitle}</p>
    </header>
  \`;
});

// Footer 컴포넌트
const Footer = mount((renew, props) => {
  return () => lTag\`
    <footer ...\${props}>
      <p>© 2024 My App</p>
    </footer>
  \`;
});

// Main 컴포넌트
const Main = mount(renew => {
  return () => lTag\`
    <main>
      <p>Main content here</p>
    </main>
  \`;
});

// App 컴포넌트
const App = mount(renew => {
  return () => lTag\`
    <div class="app">
      <\${Header}
        title="My Application"
        subtitle="Built with Lithent & HTM"
      />
      <\${Main} />
      <\${Footer} class="footer" />
    </div>
  \`;
});

render(lTag\`<\${App} />\`, document.getElementById('root'));`}
    />

    <h3 class="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-6">
      Fragment 사용
    </h3>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      HTM은 자동으로 여러 루트 요소를 Fragment로 처리합니다. JSX처럼{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        {`<></>`}
      </code>
      를 명시할 필요가 없습니다.
    </p>

    <CodeBlock
      language="javascript"
      code={`import { mount, render, Fragment } from 'lithent';
import { lTag } from 'lithent/tag';

const MultipleElements = mount(renew => {
  return () => lTag\`
    <h1>First Element</h1>
    <p>Second Element</p>
    <div>Third Element</div>
  \`;
});

// Fragment를 명시적으로 사용할 수도 있습니다
const ExplicitFragment = mount(renew => {
  return () => lTag\`
    <\${Fragment}>
      <h1>First Element</h1>
      <p>Second Element</p>
    <//>
  \`;
});

// 조건부 렌더링에서 Fragment 유용
const ConditionalContent = mount(renew => {
  let showDetails = true;

  const toggleDetails = () => {
    showDetails = !showDetails;
    renew();
  };

  return () => lTag\`
    <div>
      <h1>Title</h1>
      \${showDetails && lTag\`
        <\${Fragment}>
          <p>Detail 1</p>
          <p>Detail 2</p>
          <p>Detail 3</p>
        <//>
      \`}
      <button onClick=\${toggleDetails}>
        \${showDetails ? 'Hide' : 'Show'} Details
      </button>
    </div>
  \`;
});

render(lTag\`<\${ConditionalContent} />\`, document.getElementById('root'));`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 Fragment:
        </span>{' '}
        HTM은 자동으로 여러 루트 요소를 배열로 반환하므로, 대부분의 경우
        Fragment를 명시하지 않아도 됩니다. 하지만 조건부 렌더링이나 의미를
        명확히 하고 싶을 때는 Fragment를 명시적으로 사용할 수 있습니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      직접 바인딩하기
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        lithent/tag
      </code>
      를 사용하지 않고 직접 HTM을 바인딩할 수도 있습니다.
    </p>

    <CodeBlock
      language="javascript"
      code={`import { h, mount, render } from 'lithent';
import htm from 'htm';

// Lithent의 h 함수에 직접 바인딩
const html = htm.bind(h);

const App = mount(renew => {
  let count = 0;

  const increment = () => {
    count += 1;
    renew();
  };

  return () => html\`
    <div>
      <h1>Count: \${count}</h1>
      <button onClick=\${increment}>+</button>
    </div>
  \`;
});

render(html\`<\${App} />\`, document.getElementById('root'));`}
    />

    <div class="border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
        <span class="font-medium text-gray-700 dark:text-gray-300">
          💡 참고:
        </span>{' '}
        <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
          lithent/tag
        </code>
        의 lTag는 내부적으로{' '}
        <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
          htm.bind(h)
        </code>
        를 수행한 것입니다. 직접 바인딩하는 것과 동일하게 동작합니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      HTM vs JSX 선택하기
    </h2>

    <div class="grid gap-6 mb-6">
      <div class="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r">
        <h3 class="text-lg font-medium text-green-900 dark:text-green-100 mb-2">
          ✅ HTM을 사용하면 좋은 경우
        </h3>
        <ul class="text-sm md:text-base text-green-800 dark:text-green-200 leading-relaxed space-y-2">
          <li>• 빌드 툴 없이 브라우저에서 직접 개발하고 싶을 때</li>
          <li>• 프로토타입이나 간단한 프로젝트</li>
          <li>• CDN에서 직접 import하여 사용하고 싶을 때</li>
          <li>• 빌드 설정이 복잡한 환경을 피하고 싶을 때</li>
          <li>• 번들 크기를 최소화하고 싶을 때</li>
        </ul>
      </div>

      <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r">
        <h3 class="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
          ✅ JSX를 사용하면 좋은 경우
        </h3>
        <ul class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed space-y-2">
          <li>• 대규모 프로젝트</li>
          <li>• TypeScript를 사용하고 완전한 타입 체킹을 원할 때</li>
          <li>• IDE의 자동완성과 문법 검사를 최대한 활용하고 싶을 때</li>
          <li>• 빌드 시간에 최적화를 원할 때</li>
          <li>• 팀에서 JSX에 익숙한 경우</li>
        </ul>
      </div>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      주의사항
    </h2>

    <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
        <span class="font-medium">⚠️ 컴포넌트 참조:</span> HTM에서 컴포넌트를
        사용할 때는{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          {`<\${Component} />`}
        </code>{' '}
        형태로 달러 기호와 중괄호를 사용해야 합니다. JSX처럼{' '}
        <code class="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded text-sm">
          {`<Component />`}
        </code>
        를 사용하면 동작하지 않습니다.
        <br />
        <br />
        <span class="font-medium">⚠️ 백틱 사용:</span> HTM은 ES6 Tagged
        Templates를 사용하므로 반드시 백틱(`)을 사용해야 합니다. 일반 따옴표나
        큰따옴표는 사용할 수 없습니다.
        <br />
        <br />
        <span class="font-medium">⚠️ 런타임 파싱:</span> HTM은 런타임에 템플릿을
        파싱합니다. JSX는 빌드 타임에 컴파일되므로 런타임 성능은 JSX가 더
        우수합니다. 하지만 HTM도 충분히 빠르며, 템플릿 캐싱을 통해 성능을
        최적화합니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      더 알아보기
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="https://github.com/developit/htm"
        target="_blank"
        rel="noopener noreferrer"
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          HTM GitHub Repository →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          HTM의 공식 문서와 더 많은 예제를 확인하세요.
        </p>
      </a>

      <a
        href="/guide/template-strings"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/template-strings');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          Template Strings →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          강력한 지시자(l-if, l-for)를 제공하는 Lithent의 템플릿 시스템을
          알아보세요.
          <br />
          JSX와 유사하면서도 더 선언적인 문법을 제공합니다.
        </p>
      </a>
    </div>
  </div>
);
