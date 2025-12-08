import { mount } from 'lithent';
import { state } from 'lithent/helper';

// Simple markdown to HTML converter
const markdownToHtmlKo = (markdown: string): string => {
  let html = markdown;

  // Headers (h1-h6)
  html = html.replace(
    /^### (.*$)/gim,
    '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-white">$1</h3>'
  );
  html = html.replace(
    /^## (.*$)/gim,
    '<h2 class="text-xl font-semibold mt-4 mb-2 text-gray-900 dark:text-white">$1</h2>'
  );
  html = html.replace(
    /^# (.*$)/gim,
    '<h1 class="text-2xl font-bold mt-4 mb-2 text-gray-900 dark:text-white">$1</h1>'
  );

  // Unordered lists
  html = html.replace(
    /^\* (.*$)/gim,
    '<li class="ml-4 text-gray-700 dark:text-gray-300">$1</li>'
  );
  html = html.replace(
    /(<li class="ml-4.*<\/li>)/s,
    '<ul class="list-disc list-inside mb-2">$1</ul>'
  );

  // Ordered lists
  html = html.replace(
    /^\d+\. (.*$)/gim,
    '<li class="ml-4 text-gray-700 dark:text-gray-300">$1</li>'
  );

  // Bold
  html = html.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>'
  );

  // Italic
  html = html.replace(
    /\*([^\s*][^*]*?)\*/g,
    '<em class="italic text-gray-700 dark:text-gray-300">$1</em>'
  );

  // Inline code
  html = html.replace(
    /`(.*?)`/g,
    '<code class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono text-pink-600 dark:text-pink-400">$1</code>'
  );

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank">$1</a>'
  );

  // Blockquotes
  html = html.replace(
    /^> (.*$)/gim,
    '<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 my-2">$1</blockquote>'
  );

  // Horizontal rule
  html = html.replace(
    /^---$/gim,
    '<hr class="my-4 border-gray-300 dark:border-gray-600" />'
  );

  // Line breaks
  html = html.replace(
    /\n\n/g,
    '</p><p class="mb-2 text-gray-700 dark:text-gray-300">'
  );
  html = html.replace(/\n/g, '<br/>');

  // Wrap in paragraph
  html = '<p class="mb-2 text-gray-700 dark:text-gray-300">' + html + '</p>';

  return html;
};

const templatesKo = {
  welcome: `# 환영합니다 👋

이것은 Lithent의 \`innerHTML\` 기능으로 만든 **실시간 마크다운 에디터**입니다!

## 기능
* 실시간 미리보기
* 간단하고 빠른 사용성
* 간단한 문법 하이라이팅

아래 템플릿 버튼을 클릭하거나 직접 텍스트를 수정해보세요!`,

  article: `# 가상 DOM 이해하기

## 소개
가상 DOM은 UI의 **가상 표현을 메모리에 유지**하는 프로그래밍 개념입니다.

## 핵심 장점
1. 효율적인 업데이트
2. 더 나은 성능
3. 선언적인 코드 작성

> "가장 좋은 코드는 없는 코드다." - 어느 현명한 개발자

---

자세한 내용은 [Lithent 문서](https://lithent.com)를 참고하세요.`,

  todo: `# 오늘의 할 일 📝

## 오늘 해야 할 것
* PR 리뷰하기
* 문서 작성하기
* **중요한** 버그 수정
* \`production\` 환경에 배포

## 내일
1. 오전 10시 팀 미팅
2. 코드 리뷰 세션
3. 다음 스프린트 계획 세우기

> 휴식도 잊지 마세요! ☕`,

  code: `# 코드 예제

인라인 코드 \`const x = 10\` 이나 \`useState()\` 같은 함수를 표현할 수 있습니다.

## 베스트 프랙티스
* **깨끗한 코드** 작성
* 적절한 *주석* 추가
* 의미 있는 변수 이름 사용

### 링크
참고용으로 [MDN Web Docs](https://developer.mozilla.org)를 확인해보세요.`,
};

export const Example7Ko = mount(r => {
  const markdown = state(templatesKo.welcome, r);

  const loadTemplate = (template: keyof typeof templatesKo) => {
    markdown.v = templatesKo[template];
  };

  const handleInput = (e: Event) => {
    markdown.v = (e.target as HTMLTextAreaElement).value;
  };

  return () => {
    const html = markdownToHtmlKo(markdown.v);
    const wordCount = markdown.v.trim().split(/\s+/).length;
    const charCount = markdown.v.length;

    return (
      <div class="w-full max-w-5xl mx-auto">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            📝 Markdown Editor
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            왼쪽에서 마크다운을 수정하면 오른쪽에서 실시간 HTML 미리보기를 볼 수
            있습니다.
          </p>
        </div>

        {/* Template Buttons */}
        <div class="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => loadTemplate('welcome')}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            👋 Welcome
          </button>
          <button
            onClick={() => loadTemplate('article')}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            📰 Article
          </button>
          <button
            onClick={() => loadTemplate('todo')}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            ✅ Todo
          </button>
          <button
            onClick={() => loadTemplate('code')}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 transition-colors"
          >
            💻 Code
          </button>
          <div class="flex-1"></div>
          <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} characters</span>
          </div>
        </div>

        {/* Editor Grid */}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Markdown Input */}
          <div class="flex flex-col">
            <div class="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
              Markdown Input
            </div>
            <textarea
              value={markdown.v}
              onInput={handleInput}
              class="flex-1 min-h-[400px] p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#42b883]"
              placeholder="마크다운을 입력해보세요..."
            />
          </div>

          {/* HTML Preview */}
          <div class="flex flex-col">
            <div class="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
              HTML Preview (using innerHTML)
            </div>
            <div class="flex-1 min-h-[400px] p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 overflow-auto">
              <div innerHTML={html} class="text-gray-700 dark:text-gray-300" />
            </div>
          </div>
        </div>

        {/* Supported Syntax */}
        <div class="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
            💡 지원하는 Markdown 문법
          </h4>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-blue-700 dark:text-blue-300">
            <div>
              <code class="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded">
                # Heading
              </code>
            </div>
            <div>
              <code class="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded">
                **bold**
              </code>
            </div>
            <div>
              <code class="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded">
                *italic*
              </code>
            </div>
            <div>
              <code class="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded">
                `code`
              </code>
            </div>
            <div>
              <code class="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded">
                [link](url)
              </code>
            </div>
            <div>
              <code class="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded">
                * list
              </code>
            </div>
            <div>
              <code class="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded">
                1. ordered
              </code>
            </div>
            <div>
              <code class="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded">
                &gt; quote
              </code>
            </div>
            <div>
              <code class="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded">
                ---
              </code>
            </div>
          </div>
        </div>
      </div>
    );
  };
});
