import { mount } from 'lithent';
import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Todo List - Lithent FTags</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 650px;
      width: 100%;
      padding: 30px;
    }
    h1 { color: #667eea; margin-bottom: 10px; font-size: 28px; }
    .subtitle { color: #888; font-size: 14px; margin-bottom: 20px; }
    .input-group {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 10px;
      margin-bottom: 20px;
    }
    input[type="text"] {
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s;
    }
    input[type="text"]:focus {
      outline: none;
      border-color: #667eea;
    }
    select {
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      background: white;
      cursor: pointer;
    }
    button {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 14px;
    }
    .btn-add {
      background: #667eea;
      color: white;
    }
    .btn-add:hover { background: #5568d3; transform: translateY(-2px); }
    .btn-delete {
      background: #ff6b6b;
      color: white;
      padding: 6px 12px;
      font-size: 12px;
    }
    .btn-delete:hover { background: #ee5a52; }
    .filters {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .filter-btn {
      padding: 8px 16px;
      background: #f0f0f0;
      color: #666;
      font-size: 13px;
    }
    .filter-btn.active {
      background: #667eea;
      color: white;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    .summary-card {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 15px;
      border-radius: 12px;
      text-align: center;
    }
    .summary-card.total { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }
    .summary-card.completed { background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%); }
    .summary-card.pending { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); }
    .summary-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 5px;
    }
    .summary-amount {
      font-size: 24px;
      font-weight: 700;
      color: #333;
    }
    .todo-list {
      list-style: none;
      max-height: 450px;
      overflow-y: auto;
    }
    .todo-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 15px;
      border-radius: 10px;
      margin-bottom: 10px;
      transition: all 0.3s;
      background: white;
      border: 2px solid #e0e0e0;
    }
    .todo-item:hover {
      transform: translateX(5px);
      border-color: #667eea;
    }
    .todo-item.completed {
      background: linear-gradient(to right, #d4fc79 0%, #96e6a1 100%);
      border-color: #4caf50;
    }
    .todo-item.completed .todo-text {
      text-decoration: line-through;
      opacity: 0.6;
    }
    .todo-checkbox {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }
    .todo-content {
      flex: 1;
      min-width: 0;
    }
    .todo-text {
      font-weight: 600;
      color: #333;
      margin-bottom: 3px;
      word-wrap: break-word;
    }
    .todo-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .category-badge {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: capitalize;
    }
    .category-badge.home {
      background: #e3f2fd;
      color: #1976d2;
    }
    .category-badge.work {
      background: #fce4ec;
      color: #c2185b;
    }
    .category-badge.other {
      background: #f3e5f5;
      color: #7b1fa2;
    }
    .todo-date {
      font-size: 11px;
      color: #999;
    }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }
    .empty-icon {
      font-size: 60px;
      margin-bottom: 15px;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <script src="https://cdn.jsdelivr.net/npm/lithent/dist/lithent.umd.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lithent/ftags/dist/lithentFTags.umd.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lithent/helper/dist/lithentHelper.umd.js"></script>

  <script>
    const { render } = lithent;
    const { flMount, fTags } = lithentFTags;
    const { lstate, computed } = lithentHelper;

    const { div, h1, p, input, button, select, option, ul, li, span, label } = fTags;

    // Smart Todo List App
    const TodoList = flMount(() => {
      const todos = lstate([]);
      const taskText = lstate('');
      const category = lstate('home');
      const filter = lstate('all');

      const addTodo = () => {
        const text = taskText.value.trim();
        if (text) {
          todos.value = [
            ...todos.value,
            {
              id: Date.now(),
              text: text,
              category: category.value,
              completed: false,
              createdAt: new Date().toLocaleDateString()
            }
          ];
          taskText.value = '';
        }
      };

      const toggleTodo = (id) => {
        todos.value = todos.value.map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
      };

      const deleteTodo = (id) => {
        todos.value = todos.value.filter(t => t.id !== id);
      };

      const filteredTodos = computed(() => {
        if (filter.value === 'all') return todos.value;
        if (filter.value === 'completed') return todos.value.filter(t => t.completed);
        if (filter.value === 'pending') return todos.value.filter(t => !t.completed);
        return todos.value.filter(t => t.category === filter.value);
      });

      const totalCount = computed(() => todos.value.length);
      const completedCount = computed(() => todos.value.filter(t => t.completed).length);
      const pendingCount = computed(() => todos.value.filter(t => !t.completed).length);

      const categoryIcon = {
        home: '🏠',
        work: '💼',
        other: '📌'
      };

      const categoryLabel = {
        home: 'Home',
        work: 'Work',
        other: 'Other'
      };

      return () => div(
        { className: 'container' },

        // Header
        h1('✅ Smart Todo List'),
        p({ className: 'subtitle' }, 'Built with Lithent FTags - No build tools required!'),

        // Input Form
        div(
          { className: 'input-group' },
          input({
            type: 'text',
            placeholder: 'Enter a task... (e.g., Do laundry, Write report)',
            value: taskText.value,
            onInput: (e) => taskText.value = e.target.value,
            onKeyPress: (e) => e.key === 'Enter' && addTodo()
          }),
          select(
            {
              value: category.value,
              onChange: (e) => category.value = e.target.value
            },
            option({ value: 'home' }, '🏠 Home'),
            option({ value: 'work' }, '💼 Work'),
            option({ value: 'other' }, '📌 Other')
          ),
          button(
            {
              className: 'btn-add',
              onClick: addTodo
            },
            '+ Add'
          )
        ),

        // Summary Cards
        div(
          { className: 'summary' },
          div(
            { className: 'summary-card total' },
            div({ className: 'summary-label' }, '📋 Total'),
            div({ className: 'summary-amount' }, totalCount.value)
          ),
          div(
            { className: 'summary-card completed' },
            div({ className: 'summary-label' }, '✅ Completed'),
            div({ className: 'summary-amount' }, completedCount.value)
          ),
          div(
            { className: 'summary-card pending' },
            div({ className: 'summary-label' }, '⏳ Pending'),
            div({ className: 'summary-amount' }, pendingCount.value)
          )
        ),

        // Filters
        div(
          { className: 'filters' },
          button(
            {
              className: \`filter-btn \${filter.value === 'all' ? 'active' : ''}\`,
              onClick: () => filter.value = 'all'
            },
            \`All (\${todos.value.length})\`
          ),
          button(
            {
              className: \`filter-btn \${filter.value === 'completed' ? 'active' : ''}\`,
              onClick: () => filter.value = 'completed'
            },
            \`Completed (\${completedCount.value})\`
          ),
          button(
            {
              className: \`filter-btn \${filter.value === 'pending' ? 'active' : ''}\`,
              onClick: () => filter.value = 'pending'
            },
            \`Pending (\${pendingCount.value})\`
          ),
          button(
            {
              className: \`filter-btn \${filter.value === 'home' ? 'active' : ''}\`,
              onClick: () => filter.value = 'home'
            },
            \`🏠 Home (\${todos.value.filter(t => t.category === 'home').length})\`
          ),
          button(
            {
              className: \`filter-btn \${filter.value === 'work' ? 'active' : ''}\`,
              onClick: () => filter.value = 'work'
            },
            \`💼 Work (\${todos.value.filter(t => t.category === 'work').length})\`
          ),
          button(
            {
              className: \`filter-btn \${filter.value === 'other' ? 'active' : ''}\`,
              onClick: () => filter.value = 'other'
            },
            \`📌 Other (\${todos.value.filter(t => t.category === 'other').length})\`
          )
        ),

        // Todo List
        filteredTodos.value.length === 0
          ? div(
              { className: 'empty-state' },
              div({ className: 'empty-icon' }, '📝'),
              p(
                { style: { fontSize: '16px', fontWeight: '600' } },
                filter.value === 'all'
                  ? 'No tasks yet'
                  : filter.value === 'completed'
                  ? 'No completed tasks'
                  : filter.value === 'pending'
                  ? 'No pending tasks'
                  : \`No \${categoryLabel[filter.value]} tasks\`
              ),
              p(
                { style: { fontSize: '14px', marginTop: '10px' } },
                'Add a new task above!'
              )
            )
          : ul(
              { className: 'todo-list' },
              ...filteredTodos.value.map(todo =>
                li(
                  {
                    key: todo.id,
                    className: \`todo-item \${todo.completed ? 'completed' : ''}\`
                  },
                  input({
                    type: 'checkbox',
                    className: 'todo-checkbox',
                    checked: todo.completed,
                    onChange: () => toggleTodo(todo.id)
                  }),
                  div(
                    { className: 'todo-content' },
                    div({ className: 'todo-text' }, todo.text),
                    div(
                      { className: 'todo-meta' },
                      span(
                        { className: \`category-badge \${todo.category}\` },
                        \`\${categoryIcon[todo.category]} \${categoryLabel[todo.category]}\`
                      ),
                      span({ className: 'todo-date' }, todo.createdAt)
                    )
                  ),
                  button(
                    {
                      className: 'btn-delete',
                      onClick: () => deleteTodo(todo.id)
                    },
                    '🗑️'
                  )
                )
              )
            )
      );
    });

    // Render the app
    render(TodoList(), document.getElementById('root'));
  </script>
</body>
</html>`;

export const Example19 = mount(() => {
  return () => (
    <div class="w-full max-w-5xl mx-auto">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          ✅ Smart Todo List with FTags
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          A complete example that works with CDN only, no build tools - Copy and
          save as an HTML file and run it directly in your browser!
        </p>
      </div>

      <div class="my-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
        <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 How to Use
        </h3>
        <ol class="text-sm text-blue-800 dark:text-blue-200 space-y-2 ml-4">
          <li>1. Select and copy the entire code below</li>
          <li>
            2. Create a{' '}
            <code class="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded">
              smart-todo.html
            </code>{' '}
            file
          </li>
          <li>3. Paste the copied code and save</li>
          <li>4. Open the file in your browser and it works immediately!</li>
        </ol>
      </div>

      <div class="my-8 p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded">
        <h3 class="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
          🎯 Example Features
        </h3>
        <ul class="text-sm text-purple-800 dark:text-purple-200 space-y-2">
          <li>
            <strong>Zero Configuration:</strong> No build tools required like
            NPM, Webpack, Babel, etc.
          </li>
          <li>
            <strong>CDN Loading:</strong> Load Lithent, FTags, and Helper
            directly from CDN
          </li>
          <li>
            <strong>Reactive State:</strong> Automatic updates using lstate and
            computed
          </li>
          <li>
            <strong>Category Management:</strong> Categorize tasks into Home,
            Work, and Other
          </li>
          <li>
            <strong>Multiple Filters:</strong> Filter by All, Completed,
            Pending, and category
          </li>
          <li>
            <strong>Checkbox Completion:</strong> Toggle complete/incomplete
            with clicks
          </li>
          <li>
            <strong>Beautiful UI:</strong> Modern design with gradients and
            animations
          </li>
        </ul>
      </div>

      <div class="my-8">
        <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          📋 Complete HTML File
        </h4>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Copy the code below, save it as an .html file, and open it in your
          browser!
        </p>
        <CodeBlock code={htmlCode} language="html" />
      </div>

      <div class="my-8 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
        <h3 class="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
          ✨ Key Learning Points
        </h3>
        <div class="text-sm text-green-800 dark:text-green-200 space-y-3">
          <div>
            <strong>1. Using flMount:</strong>
            <br />
            Create components with{' '}
            <code class="px-2 py-1 bg-green-200 dark:bg-green-800 rounded">
              flMount
            </code>{' '}
            and compose UI with function calls without JSX
          </div>
          <div>
            <strong>2. lstate Reactivity:</strong>
            <br />
            Managing state with{' '}
            <code class="px-2 py-1 bg-green-200 dark:bg-green-800 rounded">
              lstate
            </code>{' '}
            automatically updates the UI
          </div>
          <div>
            <strong>3. computed Values:</strong>
            <br />
            Use{' '}
            <code class="px-2 py-1 bg-green-200 dark:bg-green-800 rounded">
              computed
            </code>{' '}
            to automatically calculate derived state (total/completed/pending
            counts)
          </div>
          <div>
            <strong>4. Omitting Props:</strong>
            <br />
            fTags allows omitting the Props object and passing children directly
          </div>
          <div>
            <strong>5. Conditional Rendering:</strong>
            <br />
            Use ternary operators to conditionally render empty state and lists
          </div>
        </div>
      </div>

      <div class="my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
        <h3 class="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          🔧 Customization Ideas
        </h3>
        <ul class="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
          <li>
            • <strong>Add LocalStorage:</strong> Persist tasks even after
            closing the browser
          </li>
          <li>
            • <strong>Priority Feature:</strong> Add High/Medium/Low priority
            levels
          </li>
          <li>
            • <strong>Due Date Settings:</strong> Add due dates to each task and
            sort accordingly
          </li>
          <li>
            • <strong>Subtasks:</strong> Break down large tasks into smaller
            steps
          </li>
          <li>
            • <strong>Search Feature:</strong> Search tasks by title
          </li>
        </ul>
      </div>

      <div class="mt-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          📚 Learn More
        </h4>
        <div class="space-y-2 text-sm">
          <a
            href="/guide/ftags"
            class="block text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/ftags');
            }}
          >
            → FTags Guide: Complete API documentation and more examples
          </a>
          <a
            href="/guide/lstate"
            class="block text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/lstate');
            }}
          >
            → Lstate Guide: Learn more about reactive state management
          </a>
          <a
            href="/guide/computed"
            class="block text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/computed');
            }}
          >
            → Computed Guide: How to use derived state
          </a>
        </div>
      </div>
    </div>
  );
});
