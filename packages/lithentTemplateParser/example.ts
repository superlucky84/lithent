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
<div w-if={isLoading}>Loading...</div>
<div w-else-if={hasError}>Error: {error}</div>
<div w-else>Content loaded!</div>
`.trim();
const result3 = compile(template3);
console.log('Template:', template3);
console.log('Generated:', result3.code);
console.log();

// Example 4: List rendering
console.log('=== Example 4: List Rendering ===');
const template4 = `
<ul>
  <li w-for={item in items}>{item.name}</li>
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
  <div w-for={(todo, index) in todos} class="todo-item">
    <input type="checkbox" checked={todo.done} />
    <span>{index + 1}. {todo.text}</span>
  </div>
  <p w-if={todos.length === 0}>No todos yet!</p>
</div>
`.trim();
const result5 = compile(template5);
console.log('Template:', template5);
console.log('Generated:', result5.code);
console.log();

// Example 6: Component with slots
console.log('=== Example 6: Component with Slots ===');
const template6 = `
<Card title={cardTitle}>
  <template slot="header">
    <h3>{headerTitle}</h3>
  </template>
  <p>{content}</p>
</Card>
`.trim();
const result6 = compile(template6);
console.log('Template:', template6);
console.log('Generated:', result6.code);
console.log();
