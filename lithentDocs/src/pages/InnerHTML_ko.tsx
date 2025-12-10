import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const InnerHTMLKo = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      innerHTML
    </h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent에서는 요소에{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        innerHTML
      </code>{' '}
      속성을 그대로 사용할 수 있습니다. 문자열을{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        innerHTML
      </code>
      로 전달하면, 해당 요소의 <code>element.innerHTML</code>이 직접 설정됩니다.
    </p>

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        이미 신뢰할 수 있는 HTML(서버에서 렌더된 문서, 직접 관리하는 Markdown
        변환 결과 등)을 렌더링할 때{' '}
        <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
          innerHTML
        </code>
        을 사용하는 것이 좋습니다.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      기본 사용법
    </h2>

    <CodeBlock
      language="tsx"
      code={`import { mount } from 'lithent';

const HtmlBlock = mount((_renew) => {
  const html = '<strong>Hello</strong> <em>world</em>';

  return () => (
    <div class="prose">
      <div innerHTML={html} />
    </div>
  );
});`}
    />

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6 mt-6">
      <code>&lt;div innerHTML=&#123;html&#125; /&gt;</code> 노드는 일반적인 자식
      JSX 트리와 다르게, 문자열 전체를 그대로 브라우저에 위임합니다. Lithent는
      내부 HTML 구조를 따로 diff하지 않습니다.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Markdown 프리뷰 예제
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      대표적인 패턴은 Markdown을 HTML로 변환한 뒤{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        innerHTML
      </code>
      로 렌더링하는 것입니다.{' '}
      <a
        href="/examples/7"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/examples/7');
        }}
        class="text-[#42b883] hover:underline"
      >
        예제 7 - Markdown Editor
      </a>{' '}
      는 바로 이 패턴을 사용합니다.
    </p>

    <CodeBlock
      language="tsx"
      code={`<div class="preview">
  <div innerHTML={compiledMarkdown} />
</div>`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      보안 주의사항
    </h2>

    <div class="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed">
        <span class="font-semibold">⚠️ 중요:</span> Lithent는{' '}
        <strong>innerHTML 문자열을 자동으로 sanitize 하지 않습니다.</strong>{' '}
        사용자 입력처럼 신뢰할 수 없는 데이터라면,{' '}
        <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
          innerHTML
        </code>
        에 넘기기 전에 반드시 직접 XSS 필터링을 수행해야 합니다.
      </p>
    </div>

    <ul class="list-disc list-inside space-y-2 mb-6 ml-4 text-sm md:text-base text-gray-700 dark:text-gray-300">
      <li>직접 제어하지 않는 HTML에는 innerHTML을 사용하지 않습니다.</li>
      <li>
        Markdown/HTML 파서를 사용할 때는 위험한 태그를 제거하거나 escape합니다.
      </li>
      <li>인터랙션이 필요한 복잡한 UI는 가급적 JSX 트리로 구성합니다.</li>
    </ul>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      언제 innerHTML을 쓰면 좋을까?
    </h2>

    <ul class="list-disc list-inside space-y-2 mb-6 ml-4 text-sm md:text-base text-gray-700 dark:text-gray-300">
      <li>문서/블로그처럼 외부에서 생성된 HTML 조각을 표시할 때</li>
      <li>CMS에서 넘어오는 작은 위젯/콘텐츠 블록을 렌더링할 때</li>
      <li>
        프로토타이핑 단계에서 이미 준비된 HTML 스니펫을 빠르게 붙이고 싶을 때
      </li>
    </ul>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      다음단계
    </h2>

    <div class="grid gap-6 mt-6">
      <a
        href="/guide/next-tick"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/guide/next-tick');
        }}
        class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#42b883] dark:hover:border-[#42b883] transition-colors cursor-pointer"
      >
        <h3 class="text-lg md:text-xl font-medium text-[#42b883] mb-2">
          타이밍 제어: nextTick →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          DOM 업데이트가 완료된 직후 한 틱 뒤에 코드를 실행하는 nextTick
          유틸리티를 사용해, 측정·포커스·스크롤 제어 패턴을 살펴봅니다.
        </p>
      </a>
    </div>
  </div>
);
