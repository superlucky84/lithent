import { CodeBlock } from '@/components/CodeBlock';
import { Example3Ko } from '@/components/examples/example3_ko';
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

export const Example3PageKo = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Render Props (Mouse tracker)
    </h1>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      마우스 위치를 추적하는 로직을 <strong>render prop</strong>으로 노출해
      원하는 뷰를 그릴 수 있는 예제입니다. 기본 데모는 컬러풀 배경이며, 이모지
      팔로워·좌표 표시 뷰로 전환할 수도 있습니다.
    </p>

    <CodeBlock language="typescript" code={example3Code} />

    <div class="not-prose mt-6">
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Live demo
        </h3>
        <Example3Ko />
      </div>
    </div>

    <div class="mt-10">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        관련 문서
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
            Children 가이드
          </a>{' '}
          - render prop처럼 함수 형태의 children을 다루는 패턴과 차이를
          정리합니다.
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
            State 가이드
          </a>{' '}
          - 마우스 위치를 추적하는 state 업데이트 흐름을 다시 한 번 살펴볼 수
          있습니다.
        </li>
      </ul>
    </div>
  </div>
);
