import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const InnerHTML = () => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      innerHTML
    </h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      Lithent supports the native{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        innerHTML
      </code>{' '}
      DOM property on elements. When you pass a string to the{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        innerHTML
      </code>{' '}
      prop, Lithent will set <code>element.innerHTML</code> directly.
    </p>

    <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-blue-800 dark:text-blue-200 leading-relaxed">
        Use <code>innerHTML</code> when you already have trusted HTML—such as
        server-rendered fragments, Markdown you control, or snippets generated
        from a safe parser.
      </p>
    </div>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Basic usage
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
      The <code>&lt;div innerHTML=&#123;html&#125; /&gt;</code> node does not
      use the usual child diffing—Lithent treats the string as opaque HTML and
      hands it off to the browser.
    </p>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Markdown preview example
    </h2>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      A common pattern is to convert Markdown into HTML and render the result
      with <code>innerHTML</code>. The{' '}
      <a
        href="/examples/7"
        onClick={(e: Event) => {
          e.preventDefault();
          navigateTo('/examples/7');
        }}
        class="text-[#42b883] hover:underline"
      >
        Markdown Editor example
      </a>{' '}
      does exactly this: it parses Markdown into a styled HTML string, then
      injects it into a preview panel.
    </p>

    <CodeBlock
      language="tsx"
      code={`<div class="preview">
  <div innerHTML={compiledMarkdown} />
</div>`}
    />

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Security considerations
    </h2>

    <div class="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-6 rounded-r">
      <p class="text-sm md:text-base text-red-800 dark:text-red-200 leading-relaxed">
        <span class="font-semibold">⚠️ Important:</span> Lithent does{' '}
        <strong>not</strong> sanitize HTML strings for you. If the content comes
        from user input or any untrusted source, you must sanitize it yourself
        before passing it to <code>innerHTML</code> to avoid XSS.
      </p>
    </div>

    <ul class="list-disc list-inside space-y-2 mb-6 ml-4 text-sm md:text-base text-gray-700 dark:text-gray-300">
      <li>Only use innerHTML with content you fully trust.</li>
      <li>
        Prefer a Markdown / HTML parser that strips or escapes dangerous tags.
      </li>
      <li>
        For rich UI that needs interactivity, consider normal JSX instead of raw
        HTML.
      </li>
    </ul>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      When to use it
    </h2>

    <ul class="list-disc list-inside space-y-2 mb-6 ml-4 text-sm md:text-base text-gray-700 dark:text-gray-300">
      <li>Rendering documentation or blog content generated elsewhere</li>
      <li>Embedding small widgets from a CMS or static site generator</li>
      <li>Prototyping quickly with preformatted HTML snippets you control</li>
    </ul>

    <hr class="border-t border-gray-200 dark:border-gray-700 my-10" />

    <h2 class="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
      Next steps
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
          Timing: nextTick →
        </h3>
        <p class="text-sm md:text-base text-gray-700 dark:text-gray-300">
          DOM 업데이트가 끝난 뒤 한 틱 뒤에 코드를 실행하는 nextTick 유틸리티를
          사용해, 측정·포커스·스크롤 제어 패턴을 알아봅니다.
        </p>
      </a>
    </div>
  </div>
);
