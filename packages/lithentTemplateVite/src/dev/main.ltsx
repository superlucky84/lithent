import { TemplateDemo } from './App';
import { compile } from '@lithent/lithent-template-parser';
import { render, h } from 'lithent';

const source = `
<section class="todo-demo">
  <h2>Todos ({todos.length})</h2>
  <ul>
    <li l-for={(todo, index) in todos} class="todo-item">
      <span class="todo-index">{index + 1}.</span>
      <span class="todo-text">{todo.text}</span>
      <strong l-if={todo.done} class="todo-status done">Done</strong>
      <strong l-else class="todo-status pending">Pending</strong>
    </li>
  </ul>
  <div class="summary">
    {todos.map(todo => (
      <span class="summary-item">{todo.text.toUpperCase()}</span>
    ))}
  </div>
</section>
`;

const compileResult = compile(source);
console.log('[template-parser] code:', compileResult.code);

const Demo = TemplateDemo;

console.log('[template-parser] AST:', compileResult.ast);

if ('document' in globalThis) {
  const doc = (globalThis as any).document as any;
  const codeBlock = doc.getElementById('code-output');
  const astBlock = doc.getElementById('ast-output');
  const app = doc.getElementById('preview');

  if (codeBlock) {
    codeBlock.textContent = compileResult.code ?? '// no code';
  }

  if (astBlock) {
    console.log(compileResult.ast);
  }

  if (app) {
    render(<Demo />, app);
  }
}
