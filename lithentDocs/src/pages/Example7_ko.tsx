import { CodeBlock } from '@/components/CodeBlock';
import { Example7Ko } from '@/components/examples/example7_ko';
import type { Introduction } from '@/pages/Introduction';
import { navigateTo } from '@/store';

const example7Code = `import { mount } from 'lithent';
import { state } from 'lithent/helper';

const MarkdownEditor = mount(r => {
  const markdown = state('# Hello World\\n\\nThis is **bold** text.', r);

  const markdownToHtml = (md: string): string => {
    let html = md;
    // Convert markdown to HTML
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
    html = html.replace(/\\*(.*?)\\*/g, '<em>$1</em>');
    return html;
  };

  return () => {
    const html = markdownToHtml(markdown.v);

    return (
      <>
        <textarea
          value={markdown.v}
          onInput={(e) => {
            markdown.v = (e.target as HTMLTextAreaElement).value;
          }}
        />
        {/* Using innerHTML to render converted HTML */}
        <div innerHTML={html} />
      </>
    );
  };
});
`;

export const Example7PageKo = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      innerHTML Property (Markdown Editor)
    </h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        innerHTML
      </code>{' '}
      prop을 사용하여 HTML 문자열을 직접 DOM에 삽입하는 실시간 마크다운 에디터
      예제입니다.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      이 예제는{' '}
      <strong>
        Lithent가 innerHTML을 통해 동적으로 생성된 HTML 문자열을 효율적으로
        DOM에 렌더링하는지 테스트
      </strong>
      하기 위해 설계되었습니다.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      마크다운 문법으로 텍스트를 입력하면 실시간으로 HTML로 변환되어 미리보기에
      표시됩니다. 템플릿 버튼을 클릭하거나 직접 마크다운을 작성해보세요!
    </p>

    <CodeBlock language="typescript" code={example7Code} />

    <div class="not-prose mt-6">
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Live demo
        </h3>
        <Example7Ko />
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        innerHTML 사용 시나리오
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>외부 HTML 삽입</strong>: API나 CMS에서 받은 HTML 콘텐츠를
          렌더링
        </li>
        <li>
          <strong>마크다운 변환</strong>: 마크다운을 HTML로 변환하여 표시
        </li>
        <li>
          <strong>Syntax Highlighting</strong>: 코드 하이라이터 라이브러리
          결과물 렌더링
        </li>
        <li>
          <strong>Rich Text</strong>: WYSIWYG 에디터에서 생성된 HTML 표시
        </li>
        <li>
          <strong>SVG/Chart</strong>: 문자열로 생성된 SVG나 차트 삽입
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        주요 기능
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>실시간 변환</strong>: 타이핑할 때마다 즉시 HTML로 변환되어
          미리보기 갱신
        </li>
        <li>
          <strong>다양한 문법 지원</strong>: 헤딩, 볼드, 이탤릭, 코드, 링크,
          리스트, 인용문 등
        </li>
        <li>
          <strong>템플릿 시스템</strong>: 4가지 샘플 템플릿으로 빠른 시작
        </li>
        <li>
          <strong>통계 표시</strong>: 단어 수와 글자 수를 실시간으로 계산
        </li>
        <li>
          <strong>양방향 에디터</strong>: 입력과 미리보기를 나란히 배치하여
          직관적인 UX 제공
        </li>
      </ul>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
      <h3 class="text-base font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
        ⚠️ innerHTML 사용 시 주의사항
      </h3>
      <ul class="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
        <li>
          <strong>XSS 공격 위험</strong>: 사용자 입력을 그대로 innerHTML에
          넣으면 보안 위험이 있습니다. 반드시 입력을 검증하거나 sanitize 해야
          합니다.
        </li>
        <li>
          <strong>이벤트 리스너 손실</strong>: innerHTML로 삽입된 요소에는
          이벤트 리스너가 자동으로 연결되지 않습니다.
        </li>
        <li>
          <strong>성능 고려</strong>: 큰 HTML 문자열을 자주 업데이트하면 성능에
          영향을 줄 수 있습니다.
        </li>
      </ul>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
      <h3 class="text-base font-semibold text-green-800 dark:text-green-200 mb-2">
        ✅ 안전한 사용 방법
      </h3>
      <p class="text-sm text-green-700 dark:text-green-300 mb-2">
        이 예제처럼 신뢰할 수 있는 소스(자체 마크다운 파서)에서 생성된 HTML만
        사용하거나, DOMPurify 같은 라이브러리로 sanitize 한 후 사용하세요.
        외부에서 받은 HTML을 그대로 사용하는 것은 절대 피해야 합니다.
      </p>
      <p class="text-xs text-green-600 dark:text-green-400 italic">
        💡 참고: 이 예제의 마크다운 파서는 데모를 위해 급조한 것이라 정규식
        버그가 숨어있을 수 있습니다 😅 프로덕션에서는{' '}
        <code class="px-1 py-0.5 bg-green-100 dark:bg-green-900 rounded text-xs">
          marked
        </code>
        나{' '}
        <code class="px-1 py-0.5 bg-green-100 dark:bg-green-900 rounded text-xs">
          markdown-it
        </code>{' '}
        같은 검증된 라이브러리를 사용하세요. 정규식은 항상 우리를 배신합니다.
      </p>
    </div>

    <div class="mt-10">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        관련 문서
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <a
            href="/guide/props"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/props');
            }}
          >
            Props 가이드
          </a>{' '}
          - innerHTML처럼 DOM 속성을 props로 다루는 기본 규칙과 주의사항을
          정리합니다.
        </li>
        <li>
          <a
            href="/guide/htm-tags"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/htm-tags');
            }}
          >
            HTM Tags 가이드
          </a>{' '}
          - innerHTML 대신 템플릿 태그로 마크업을 구성하는 대안적인 방법을
          소개합니다.
        </li>
      </ul>
    </div>
  </div>
);
