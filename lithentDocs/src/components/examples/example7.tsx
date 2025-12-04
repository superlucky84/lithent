import { mount } from 'lithent';
import { state } from 'lithent/helper';

// Simple markdown to HTML converter
const markdownToHtml = (markdown: string): string => {
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

  // Unordered lists (처리 순서를 앞으로 이동)
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

  // Italic (공백이 아닌 문자로 시작하는 경우만 매칭)
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

const templates = {
  welcome: `# Welcome to Markdown Editor 👋

This is a **live markdown editor** powered by Lithent's \`innerHTML\` feature!

## Features
* Real-time preview
* Simple and fast
* Syntax highlighting

Try editing this text or click a template below!`,

  article: `# How to Build a Virtual DOM

## Introduction
Virtual DOM is a **programming concept** where a virtual representation of the UI is kept in memory.

## Key Benefits
1. Efficient updates
2. Better performance
3. Declarative code

> "The best code is no code at all." - Someone wise

---

Learn more at [Lithent Docs](https://lithent.com)`,

  todo: `# My Todo List 📝

## Today's Tasks
* Review pull requests
* Write documentation
* Fix **critical** bugs
* Deploy to \`production\`

## Tomorrow
1. Team meeting at 10am
2. Code review session
3. Plan next sprint

> Don't forget to take breaks! ☕`,

  code: `# Code Example

You can use inline code like \`const x = 10\` or reference functions like \`useState()\`.

## Best Practices
* Write **clean code**
* Add proper *comments*
* Use meaningful variable names

### Links
Check out [MDN Web Docs](https://developer.mozilla.org) for reference.`,
};

export const Example7 = mount(r => {
  const markdown = state(templates.welcome, r);

  const loadTemplate = (template: keyof typeof templates) => {
    markdown.v = templates[template];
  };

  const handleInput = (e: Event) => {
    markdown.v = (e.target as HTMLTextAreaElement).value;
  };

  return () => {
    const html = markdownToHtml(markdown.v);
    const wordCount = markdown.v.trim().split(/\s+/).length;
    const charCount = markdown.v.length;

    return (
      <div class="w-full max-w-5xl mx-auto">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            📝 Markdown Editor
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Edit markdown on the left, see live HTML preview on the right
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
              placeholder="Type your markdown here..."
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
            💡 Supported Markdown Syntax
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
