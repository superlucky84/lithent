import { CodeBlock } from '@/components/CodeBlock';
import { Example2 } from '@/components/examples/example2';
import type { Introduction } from '@/pages/Introduction';
import { navigateTo } from '@/store';

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
      Store helper – sharing state across components
    </h1>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        store
      </code>{' '}
      helper lets multiple components share the same state. This example shows
      how two <code>Writer</code> components stay in sync via a shared store.
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

    <div class="mt-10">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Related docs
      </h2>
      <ul class="list-disc list-inside text-sm md:text-base text-gray-700 dark:text-gray-300 space-y-2">
        <li>
          <a
            href="/guide/store"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/store');
            }}
          >
            Store guide
          </a>{' '}
          - Covers the core concepts and API for sharing global state via{' '}
          <code>store</code>.
        </li>
        <li>
          <a
            href="/guide/state"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/state');
            }}
          >
            State guide
          </a>{' '}
          - Refreshes how the <code>state</code> helper works, which is used to
          track textarea changes.
        </li>
      </ul>
    </div>
  </div>
);
