import { lmount, mountCallback, ref } from 'lithent';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import xml from 'highlight.js/lib/languages/xml';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';

// Register languages
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('tsx', typescript); // TSX uses TypeScript highlighting
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml); // HTML uses XML highlighting
hljs.registerLanguage('jsx', typescript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('json', json);

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock = lmount<CodeBlockProps>(() => {
  const codeRef = ref<HTMLElement | null>(null);

  mountCallback(() => {
    if (codeRef.value) {
      hljs.highlightElement(codeRef.value);

      // For bash, highlight the $ prompt
      const lang = codeRef.value.className.match(/language-(\w+)/)?.[1];
      if (lang === 'bash' && codeRef.value.innerHTML) {
        // Replace $ at the start of lines with colored span
        codeRef.value.innerHTML = codeRef.value.innerHTML.replace(
          /^(\s*)\$(\s)/gm,
          '$1<span class="bash-prompt">$</span>$2'
        );
      }
    }
  });

  return ({ code, language }) => (
    <pre class="code-block bg-gray-100 dark:bg-[#1e1e1e] p-6 rounded-lg overflow-x-auto mb-6 text-xs md:text-sm border border-gray-200 dark:border-gray-800">
      <code ref={codeRef} class={`language-${language || 'typescript'}`}>
        {code}
      </code>
    </pre>
  );
});
