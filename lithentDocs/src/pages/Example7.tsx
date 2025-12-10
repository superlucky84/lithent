import { CodeBlock } from '@/components/CodeBlock';
import { Example7 } from '@/components/examples/example7';
import type { Introduction } from '@/pages/Introduction';

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

export const Example7Page = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      innerHTML Property (Markdown Editor)
    </h1>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      This example shows a live Markdown editor that uses the{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        innerHTML
      </code>{' '}
      prop to inject an HTML string directly into the DOM.
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      It is designed to{' '}
      <strong>
        test how Lithent renders dynamically generated HTML strings efficiently
        via innerHTML
      </strong>
      .
    </p>

    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      As you type Markdown, it is converted to HTML in real time and shown in
      the preview panel. Try clicking the template buttons or writing your own
      Markdown!
    </p>

    <CodeBlock language="typescript" code={example7Code} />

    <div class="not-prose mt-6">
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Live demo
        </h3>
        <Example7 />
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        When to use innerHTML
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>Embedding external HTML</strong>: render HTML content received
          from an API or CMS.
        </li>
        <li>
          <strong>Markdown conversion</strong>: display Markdown converted to
          HTML.
        </li>
        <li>
          <strong>Syntax highlighting</strong>: render the output of a code
          highlighting library.
        </li>
        <li>
          <strong>Rich text</strong>: show HTML generated from a WYSIWYG editor.
        </li>
        <li>
          <strong>SVG/Charts</strong>: insert string-generated SVG or chart
          markup.
        </li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Key features
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>Live conversion</strong>: converts to HTML on every keystroke
          and keeps the preview in sync.
        </li>
        <li>
          <strong>Multiple syntaxes</strong>: headings, bold, italic, code,
          links, lists, blockquotes, and more.
        </li>
        <li>
          <strong>Template system</strong>: four sample templates to get started
          quickly.
        </li>
        <li>
          <strong>Statistics</strong>: live word and character counts.
        </li>
        <li>
          <strong>Two-pane editor</strong>: side-by-side input and preview for a
          clear editing experience.
        </li>
      </ul>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
      <h3 class="text-base font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
        ⚠️ Things to watch out for with innerHTML
      </h3>
      <ul class="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
        <li>
          <strong>XSS risk</strong>: inserting raw user input into innerHTML is
          dangerous. Always validate or sanitize input first.
        </li>
        <li>
          <strong>Event listeners</strong>: elements inserted via innerHTML do
          not automatically get event handlers.
        </li>
        <li>
          <strong>Performance</strong>: frequently updating large HTML strings
          can impact performance.
        </li>
      </ul>
    </div>

    <div class="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
      <h3 class="text-base font-semibold text-green-800 dark:text-green-200 mb-2">
        ✅ Safer usage patterns
      </h3>
      <p class="text-sm text-green-700 dark:text-green-300 mb-2">
        Only use HTML generated from trusted sources (like a local Markdown
        parser), or sanitize it first with a library such as DOMPurify. Never
        dump untrusted HTML directly into innerHTML.
      </p>
      <p class="text-xs text-green-600 dark:text-green-400 italic">
        💡 Note: this Markdown parser is intentionally simple and may have regex
        bugs—it&apos;s just for the demo. For production, use a battle-tested
        library like{' '}
        <code class="px-1 py-0.5 bg-green-100 dark:bg-green-900 rounded text-xs">
          marked
        </code>{' '}
        or{' '}
        <code class="px-1 py-0.5 bg-green-100 dark:bg-green-900 rounded text-xs">
          markdown-it
        </code>
        . Regular expressions will betray you eventually.
      </p>
    </div>

    <div class="mt-10">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Related docs
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <a
            href="/guide/props"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/props');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Props guide
          </a>{' '}
          - Covers the basic rules and caveats of treating DOM attributes as
          props, including innerHTML.
        </li>
        <li>
          <a
            href="/guide/htm-tags"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/htm-tags');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            HTM Tags guide
          </a>{' '}
          - Shows an alternative way to build markup using template tags instead
          of innerHTML.
        </li>
      </ul>
    </div>
  </div>
);
