import './style.css';

import { compile, parse, tokenize } from '..';

declare global {
  interface Window {
    compile: typeof compile;
    parse: typeof parse;
    tokenize: typeof tokenize;
  }
}

const defaultTemplate = `<div class="todo-list">
  <h2>Todos ({todos.length})</h2>
  <div l-for={(todo, index) in todos} class="todo-item">
    <span l-if={todo.done}>✓</span>
    <span>{index + 1}. {todo.text}</span>
  </div>
  <p l-else>No todos yet!</p>
</div>`;

const app = document.getElementById('app');

if (!app) {
  throw new Error('Playground root element not found');
}

app.innerHTML = `
  <h1>Lithent Template Parser Playground</h1>
  <p class="info">
    템플릿을 수정하면서 토큰, AST, 생성된 코드를 실시간으로 확인하세요. 브라우저 개발자 도구에서 <code>compile</code>, <code>parse</code>, <code>tokenize</code>를 활용해 추가 디버깅도 가능합니다.
  </p>
  <div class="playground">
    <div class="panel">
      <div class="panel-header">
        <span>Template 입력</span>
        <span class="badge">입력</span>
      </div>
      <div class="panel-body">
        <textarea id="template-input" spellcheck="false"></textarea>
        <div class="error" id="template-error"></div>
      </div>
    </div>
    <div class="output-group">
      <div class="panel">
        <div class="panel-header">
          <span>생성된 코드</span>
          <div>
            <span class="badge">결과</span>
            <button class="copy" data-target="code-output">Copy</button>
          </div>
        </div>
        <div class="panel-body">
          <pre id="code-output">// 결과가 여기에 표시됩니다.</pre>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header">
          <span>토큰</span>
          <div>
            <span class="badge" id="token-count">0 tokens</span>
            <button class="copy" data-target="tokens-output">Copy</button>
          </div>
        </div>
        <div class="panel-body">
          <pre id="tokens-output">[]</pre>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header">
          <span>AST</span>
          <div>
            <span class="badge">Transformed</span>
            <button class="copy" data-target="ast-output">Copy</button>
          </div>
        </div>
        <div class="panel-body">
          <pre id="ast-output">{}</pre>
        </div>
      </div>
    </div>
  </div>
`;

const templateInput = document.getElementById(
  'template-input'
) as HTMLTextAreaElement | null;
const tokenBadge = document.getElementById('token-count');
const tokensOutput = document.getElementById('tokens-output');
const astOutput = document.getElementById('ast-output');
const codeOutput = document.getElementById('code-output');
const errorOutput = document.getElementById('template-error');

if (
  !templateInput ||
  !tokenBadge ||
  !tokensOutput ||
  !astOutput ||
  !codeOutput ||
  !errorOutput
) {
  throw new Error('Playground UI 초기화에 실패했습니다.');
}

templateInput.value = defaultTemplate.trim();

const circularReplacer = () => {
  const seen = new WeakSet();
  return (key: string, value: unknown) => {
    if (key === '__conditionalGroup') {
      return undefined;
    }
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value as object)) {
        return '[Circular]';
      }
      seen.add(value as object);
    }
    return value;
  };
};

const formatJSON = (value: unknown) =>
  JSON.stringify(value, circularReplacer(), 2);

const copyButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>('button.copy')
);
copyButtons.forEach(button => {
  button.addEventListener('click', async () => {
    const targetId = button.dataset.target;
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    try {
      await navigator.clipboard.writeText(target.textContent ?? '');
      const original = button.textContent;
      button.textContent = 'Copied!';
      setTimeout(() => {
        button.textContent = original ?? 'Copy';
      }, 1200);
    } catch {
      button.textContent = 'Failed';
      setTimeout(() => {
        button.textContent = 'Copy';
      }, 1200);
    }
  });
});

let debounceTimer: number | undefined;

const runCompilation = () => {
  const template = templateInput.value;
  errorOutput.textContent = '';

  try {
    const tokens = tokenize(template);
    tokenBadge.textContent = `${tokens.length} tokens`;
    tokensOutput.textContent = formatJSON(tokens);

    let ast;
    try {
      ast = parse(tokens);
    } catch (parseError) {
      astOutput.textContent = '{}';
      codeOutput.textContent = '// 파싱에 실패했습니다.';
      throw parseError;
    }

    const result = compile(template);

    if (result.errors.length > 0) {
      const [firstError] = result.errors;
      errorOutput.textContent = `⚠️ ${firstError.message}`;
    }

    codeOutput.textContent = result.code || '// 생성된 코드가 없습니다.';
    astOutput.textContent = formatJSON(result.ast ?? ast);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errorOutput.textContent = `⚠️ ${message}`;
  }
};

const scheduleCompilation = () => {
  if (debounceTimer !== undefined) {
    window.clearTimeout(debounceTimer);
  }
  debounceTimer = window.setTimeout(runCompilation, 160);
};

templateInput.addEventListener('input', scheduleCompilation);

// 초기 실행
runCompilation();

// 전역 디버깅을 위해 노출
Object.assign(window, { compile, parse, tokenize });
