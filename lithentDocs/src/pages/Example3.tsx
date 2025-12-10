import { CodeBlock } from '@/components/CodeBlock';
import { Example3 } from '@/components/examples/example3';
import type { Introduction } from '@/pages/Introduction';

const example3Code = `import { mount, ref } from 'lithent';
import { state } from 'lithent/helper';

const MouseTracker = mount((renew) => {
  const pos = state({ x: 0, y: 0 }, renew);
  const refEl = ref<HTMLDivElement | null>(null);
  const onMove = (e: MouseEvent) => {
    if (refEl.value) {
      pos.v = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  };
  return ({ render }) => (
    <div ref={refEl} onMouseMove={onMove} class="tracker">
      {render(pos.v)}
    </div>
  );
});

// render prop에 맞춰 원하는 뷰를 렌더링
<MouseTracker
  render={pos => (
    <div style={{ left: pos.x, top: pos.y }}>🎨</div>
  )}
/>;
`;

export const Example3Page = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Render Props (Mouse tracker)
    </h1>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      This example uses a <strong>render prop</strong> to expose the mouse
      tracking logic so you can render any view you like. The default demo shows
      a colorful background, and you can switch to an emoji follower or a simple
      coordinate display.
    </p>

    <CodeBlock language="typescript" code={example3Code} />

    <div class="not-prose mt-6">
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Live demo
        </h3>
        <Example3 />
      </div>
    </div>

    <div class="mt-10">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Related docs
      </h2>
      <ul class="list-disc list-inside text-sm md:text-base text-gray-700 dark:text-gray-300 space-y-2">
        <li>
          <a
            href="/guide/children"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/children');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Children guide
          </a>{' '}
          - Explains how function-as-children patterns relate to render props.
        </li>
        <li>
          <a
            href="/guide/state"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/state');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            State guide
          </a>{' '}
          - Reviews the state update flow used to track the mouse position.
        </li>
      </ul>
    </div>
  </div>
);
