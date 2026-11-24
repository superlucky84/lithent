import { CodeBlock } from '@/components/CodeBlock';

const en = {
  title: 'Testing (lithent/test)',
  intro:
    'lithent/test renders a component into the test document, waits until lithent has drawn the result of an action, and takes everything down after the test. It ships inside the lithent package and has no dependencies. Lithent renders real DOM, so finding elements and firing events is left to @testing-library/dom, which is optional.',
  setup: 'Setup',
  setupText:
    'Run the tests in a DOM environment such as jsdom or happy-dom. Vitest exposes afterEach as a global only with globals: true; lithent/test then cleans up after each test by itself. Otherwise add the afterEach line below.',
  setupNote:
    'Vitest 5 needs @types/node 22 or later. If npm reports a conflict over @types/node (projects created with earlier create-lithent templates have version 20), update it with npm install --save-dev @types/node@22.',
  example: 'A first test',
  exampleText:
    'renew() draws in a microtask, so right after the click the DOM has not changed yet. Run the action inside act, or call await act() after it, and assert once it resolves.',
  act: 'What act waits for',
  actItems: [
    'Renders started by renew(), by lithent/helper stores and by mountCallbacks, however many microtasks deep.',
    'With the concurrent core (lithent aliased to lithent-concurrent), also deferRender work, which the scheduler splits across tasks.',
    'It resolves with the callback’s return value and passes its errors on.',
    'It keeps working under fake timers (vi.useFakeTimers()).',
  ],
  actText:
    'It does not wait for your own timers or requests. Use findBy* or waitFor from @testing-library/dom for those, or fake timers.',
  userEvent: 'Typing and other user input',
  userEventText:
    '@testing-library/user-event drives inputs the way a user does. Each call returns a promise; wrap it in act as well.',
  props: 'Changing props',
  propsText:
    'Calling render again appends a second tree; it does not update the first. To test a prop change, render a parent that owns the value and change it inside act.',
  api: 'API',
  apiHead: ['API', 'Contract'],
  apiRows: [
    [
      'render(ui, options?)',
      'Renders ui into a new <div> appended to document.body (or options.baseElement), or into options.container. Returns { container, baseElement, unmount }. The first render and its mountCallbacks finish before it returns.',
    ],
    [
      'act(fn?)',
      'Runs fn, then waits until lithent has drawn everything it caused. Resolves with fn’s result. Without fn it only waits.',
    ],
    [
      'cleanup()',
      'Takes down every tree render created: unmount callbacks run and the containers it made are removed. Registered with afterEach automatically when afterEach is a global; set LITHENT_TEST_SKIP_AUTO_CLEANUP=1 to turn that off.',
    ],
  ],
};

const copy = {
  en,
  ko: {
    title: '테스트 (lithent/test)',
    intro:
      'lithent/test는 컴포넌트를 테스트 문서에 렌더링하고, 동작의 결과를 lithent가 화면에 다 반영할 때까지 기다리고, 테스트가 끝나면 모두 정리합니다. lithent 패키지에 들어 있고 의존성이 없습니다. lithent는 실제 DOM을 그리므로 요소 찾기와 이벤트 발생은 @testing-library/dom에 맡깁니다(선택).',
    setup: '설정',
    setupText:
      'jsdom이나 happy-dom 같은 DOM 환경에서 테스트를 실행하세요. Vitest는 globals: true일 때만 afterEach를 전역으로 내주고, 그러면 lithent/test가 테스트마다 알아서 정리합니다. 아니면 아래의 afterEach 줄을 넣으세요.',
    setupNote:
      'Vitest 5는 @types/node 22 이상이 필요합니다. npm이 @types/node 충돌을 알리면(예전 create-lithent 템플릿으로 만든 프로젝트는 20입니다) npm install --save-dev @types/node@22로 올리세요.',
    example: '첫 테스트',
    exampleText:
      'renew()는 마이크로태스크에서 그리므로 클릭 직후에는 DOM이 아직 바뀌지 않았습니다. 동작을 act 안에서 실행하거나 동작 뒤에 await act()를 부르고, 그다음에 확인하세요.',
    act: 'act가 기다리는 것',
    actItems: [
      'renew(), lithent/helper store, mountCallback이 시작한 렌더. 마이크로태스크가 몇 단계로 이어져도 기다립니다.',
      'concurrent 코어(lithent를 lithent-concurrent로 alias)에서는 스케줄러가 여러 태스크로 나눠 처리하는 deferRender 작업까지 기다립니다.',
      '콜백의 반환값으로 풀리고, 콜백의 오류는 그대로 전달합니다.',
      '가짜 타이머(vi.useFakeTimers())에서도 멈추지 않습니다.',
    ],
    actText:
      '직접 만든 타이머나 요청은 기다리지 않습니다. 그런 경우는 @testing-library/dom의 findBy*나 waitFor, 또는 가짜 타이머를 쓰세요.',
    userEvent: '입력 같은 사용자 동작',
    userEventText:
      '@testing-library/user-event는 사용자처럼 입력을 다룹니다. 호출마다 promise를 돌려주므로 이것도 act로 감싸세요.',
    props: 'props 바꾸기',
    propsText:
      'render를 다시 부르면 두 번째 트리가 덧붙고, 첫 트리는 갱신되지 않습니다. props 변경을 시험하려면 값을 가진 부모를 렌더링하고 act 안에서 그 값을 바꾸세요.',
    api: 'API',
    apiHead: ['API', '동작'],
    apiRows: [
      [
        'render(ui, options?)',
        'ui를 document.body(또는 options.baseElement)에 붙인 새 <div>, 또는 options.container에 렌더링합니다. { container, baseElement, unmount }를 반환합니다. 첫 렌더와 그 mountCallback은 반환 전에 끝납니다.',
      ],
      [
        'act(fn?)',
        'fn을 실행하고, 그 결과를 lithent가 다 그릴 때까지 기다립니다. fn의 결과로 풀립니다. fn 없이 부르면 기다리기만 합니다.',
      ],
      [
        'cleanup()',
        'render가 만든 트리를 모두 해제합니다. 언마운트 콜백이 실행되고 만든 컨테이너는 제거됩니다. afterEach가 전역이면 자동으로 등록되며, LITHENT_TEST_SKIP_AUTO_CLEANUP=1로 끌 수 있습니다.',
      ],
    ],
  },
};

// Scrolls on its own on narrow screens: a cell holds unbreakable names such
// as LITHENT_TEST_SKIP_AUTO_CLEANUP=1.
const table = (head: string[], rows: string[][]) => (
  <div class="overflow-x-auto">
    <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
      <thead>
        <tr>
          {head.map(cell => (
            <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr>
            {row.map(cell => (
              <td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const TestingGuide = ({ language }: { language: 'en' | 'ko' }) => {
  const t = copy[language];
  return (
    <div class="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:mt-10 [&_a]:text-[#42b883] [&_ul]:list-disc [&_ul]:pl-6">
      <h1>{t.title}</h1>
      <p>{t.intro}</p>
      <CodeBlock
        language="typescript"
        code={`import { render, act, cleanup } from 'lithent/test';`}
      />

      <h2>{t.setup}</h2>
      <p>{t.setupText}</p>
      <CodeBlock
        language="bash"
        code={`npm install --save-dev vitest jsdom @testing-library/dom`}
      />
      <p>{t.setupNote}</p>
      <CodeBlock
        language="typescript"
        code={`// vite.config.ts (or vitest.config.ts)
export default {
  test: { environment: 'jsdom' },
};

// Each test file, or a setup file, when globals is off:
import { afterEach } from 'vitest';
import { cleanup } from 'lithent/test';

afterEach(() => cleanup());`}
      />

      <h2>{t.example}</h2>
      <p>{t.exampleText}</p>
      <CodeBlock
        language="tsx"
        code={`// Counter.tsx
import { mount } from 'lithent';

export const Counter = mount(renew => {
  let count = 0;
  return () => (
    <div>
      <p>count: {count}</p>
      <button
        onClick={() => {
          count += 1;
          renew();
        }}
      >
        +1
      </button>
    </div>
  );
});`}
      />
      <CodeBlock
        language="tsx"
        code={`// Counter.test.tsx
import { expect, it } from 'vitest';
import { screen, fireEvent } from '@testing-library/dom';
import { render, act } from 'lithent/test';
import { Counter } from './Counter';

it('counts clicks', async () => {
  render(<Counter />);
  await act(() => fireEvent.click(screen.getByRole('button', { name: '+1' })));
  expect(screen.getByText('count: 1')).toBeTruthy();
});`}
      />

      <h2>{t.act}</h2>
      <ul>
        {t.actItems.map(item => (
          <li>{item}</li>
        ))}
      </ul>
      <p>{t.actText}</p>

      <h2>{t.userEvent}</h2>
      <p>{t.userEventText}</p>
      <CodeBlock
        language="tsx"
        code={`import userEvent from '@testing-library/user-event';

const user = userEvent.setup();
render(<Greeting />);
await act(() => user.type(screen.getByLabelText('Name'), 'Ada'));
expect(screen.getByRole('status').textContent).toBe('Hello, Ada!');`}
      />

      <h2>{t.props}</h2>
      <p>{t.propsText}</p>
      <CodeBlock
        language="tsx"
        code={`let setLabel = (_label: string) => {};
const Host = mount(renew => {
  let label = 'first';
  setLabel = next => {
    label = next;
    renew();
  };
  return () => <Badge label={label} />;
});

render(<Host />);
await act(() => setLabel('second'));
expect(screen.getByText('second')).toBeTruthy();`}
      />

      <h2>{t.api}</h2>
      {table(t.apiHead, t.apiRows)}
    </div>
  );
};

export const Testing = () => <TestingGuide language="en" />;
