import { compile } from './src/compiler';

// Example 1: Simple element
console.log('=== Example 1: Simple Element ===');
const template1 = '<div class="container">Hello World</div>';
const result1 = compile(template1);
console.log('Template:', template1);
console.log('Generated:', result1.code);
console.log();

// Example 2: Interpolation
console.log('=== Example 2: Interpolation ===');
const template2 = '<div>Hello {name}, you have {count} messages</div>';
const result2 = compile(template2);
console.log('Template:', template2);
console.log('Generated:', result2.code);
console.log();

// Example 3: Conditional rendering
console.log('=== Example 3: Conditional Rendering ===');
const template3 = `
<div l-if={isLoading}>Loading...</div>
<div l-else-if={hasError}>Error: {error}</div>
<div l-else>Content loaded!</div>
`.trim();
const result3 = compile(template3);
console.log('Template:', template3);
console.log('Generated:', result3.code);
console.log();

// Example 4: List rendering
console.log('=== Example 4: List Rendering ===');
const template4 = `
<ul>
  <li l-for={item in items}>{item.name}</li>
</ul>
`.trim();
const result4 = compile(template4);
console.log('Template:', template4);
console.log('Generated:', result4.code);
console.log();

// Example 5: Todo list (real-world example)
console.log('=== Example 5: Todo List ===');
const template5 = `
<div class="todo-list">
  <h2>Todos ({todos.length})</h2>
  <div l-for={(todo, index) in todos} class="todo-item">
    <input type="checkbox" checked={todo.done} />
    <span>{index + 1}. {todo.text}</span>
  </div>
  <p l-if={todos.length === 0}>No todos yet!</p>
</div>
`.trim();
const result5 = compile(template5);
console.log('Template:', template5);
console.log('Generated:', result5.code);
console.log();

// Example 6: Component with nested content
console.log('=== Example 6: Component with Nested Content ===');
const template6 = `
<Card title={cardTitle}>
  <div class="card-header">
    <h3>{headerTitle}</h3>
  </div>
  <p>{content}</p>
</Card>
`.trim();
const result6 = compile(template6);
console.log('Template:', template6);
console.log('Generated:', result6.code);
console.log();
