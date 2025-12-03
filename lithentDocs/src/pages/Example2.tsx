import { CodeBlock } from '@/components/CodeBlock';
import { Example2 } from '@/components/examples/example2';
import type { Introduction } from '@/pages/Introduction';

const example2Code = `import { mount, render } from 'lithent';
import { store } from 'lithent/helper';

const assignSharedStore = store<{ text: string; count: number }>({
  text: 'sharedText',
  count: 3,
});

const Writer = mount(renew => {
  const shared = assignSharedStore(renew, s => [s.text]);
  const onInput = (e: InputEvent) => {
    shared.text = (e.target as HTMLTextAreaElement).value;
  };
  return () => <textarea onInput={onInput} value={shared.text} />;
});

render(<Writer />, document.getElementById('slot-1'));
render(<Writer />, document.getElementById('slot-2'));
`;

export const Example2Page = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Example 2 - Helper (store)
    </h1>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">store</code>
      훅으로 여러 컴포넌트가 값을 공유하는 방법을 보여주는 예제입니다. 아래에서 코드와 라이브 데모를 함께 확인하세요.
    </p>

    <CodeBlock language="typescript" code={example2Code} />

    <div class="not-prose mt-6">
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Live demo
        </h3>
        <Example2 />
      </div>
    </div>
  </div>
);
