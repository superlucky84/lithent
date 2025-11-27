import { lmount, mountCallback, ref } from 'lithent';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/atom-one-dark.css';

// Register languages
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('tsx', typescript); // TSX uses TypeScript highlighting
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('jsx', typescript);

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock = lmount<CodeBlockProps>(() => {
  const codeRef = ref<HTMLElement | null>(null);

  mountCallback(() => {
    if (codeRef.value) {
      hljs.highlightElement(codeRef.value);
    }
  });

  return ({ code, language }) => (
    <pre class="bg-gray-900 dark:bg-gray-950 p-6 rounded-lg overflow-x-auto mb-6">
      <code ref={codeRef} class={`language-${language || 'typescript'}`}>
        {code}
      </code>
    </pre>
  );
});
