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
        home: '집안일',
        work: '회사일',
        other: '기타'
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
            placeholder: '할 일을 입력하세요... (예: 빨래하기, 보고서 작성)',
            value: taskText.value,
            onInput: (e) => taskText.value = e.target.value,
            onKeyPress: (e) => e.key === 'Enter' && addTodo()
          }),
          select(
            {
              value: category.value,
              onChange: (e) => category.value = e.target.value
            },
            option({ value: 'home' }, '🏠 집안일'),
            option({ value: 'work' }, '💼 회사일'),
            option({ value: 'other' }, '📌 기타')
          ),
          button(
            {
              className: 'btn-add',
              onClick: addTodo
            },
            '+ 추가'
          )
        ),

        // Summary Cards
        div(
          { className: 'summary' },
          div(
            { className: 'summary-card total' },
            div({ className: 'summary-label' }, '📋 전체'),
            div({ className: 'summary-amount' }, totalCount.value)
          ),
          div(
            { className: 'summary-card completed' },
            div({ className: 'summary-label' }, '✅ 완료'),
            div({ className: 'summary-amount' }, completedCount.value)
          ),
          div(
            { className: 'summary-card pending' },
            div({ className: 'summary-label' }, '⏳ 진행중'),
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
            \`전체 (\${todos.value.length})\`
          ),
          button(
            {
              className: \`filter-btn \${filter.value === 'completed' ? 'active' : ''}\`,
              onClick: () => filter.value = 'completed'
            },
            \`완료 (\${completedCount.value})\`
          ),
          button(
            {
              className: \`filter-btn \${filter.value === 'pending' ? 'active' : ''}\`,
              onClick: () => filter.value = 'pending'
            },
            \`진행중 (\${pendingCount.value})\`
          ),
          button(
            {
              className: \`filter-btn \${filter.value === 'home' ? 'active' : ''}\`,
              onClick: () => filter.value = 'home'
            },
            \`🏠 집안일 (\${todos.value.filter(t => t.category === 'home').length})\`
          ),
          button(
            {
              className: \`filter-btn \${filter.value === 'work' ? 'active' : ''}\`,
              onClick: () => filter.value = 'work'
            },
            \`💼 회사일 (\${todos.value.filter(t => t.category === 'work').length})\`
          ),
          button(
            {
              className: \`filter-btn \${filter.value === 'other' ? 'active' : ''}\`,
              onClick: () => filter.value = 'other'
            },
            \`📌 기타 (\${todos.value.filter(t => t.category === 'other').length})\`
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
                  ? '아직 할 일이 없습니다'
                  : filter.value === 'completed'
                  ? '완료된 할 일이 없습니다'
                  : filter.value === 'pending'
                  ? '진행중인 할 일이 없습니다'
                  : \`\${categoryLabel[filter.value]} 할 일이 없습니다\`
              ),
              p(
                { style: { fontSize: '14px', marginTop: '10px' } },
                '위에서 새로운 할 일을 추가해보세요!'
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

export const Example19Ko = mount(() => {
  return () => (
    <div class="w-full max-w-5xl mx-auto">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          ✅ Smart Todo List with FTags
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          빌드 도구 없이 CDN만으로 작동하는 완전한 예제 - 복사해서 HTML 파일로
          저장하고 브라우저에서 바로 실행하세요!
        </p>
      </div>

      <div class="my-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
        <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 사용 방법
        </h3>
        <ol class="text-sm text-blue-800 dark:text-blue-200 space-y-2 ml-4">
          <li>1. 아래 코드를 전체 선택하여 복사합니다</li>
          <li>
            2.{' '}
            <code class="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded">
              smart-todo.html
            </code>{' '}
            파일을 생성합니다
          </li>
          <li>3. 복사한 코드를 붙여넣고 저장합니다</li>
          <li>4. 브라우저에서 파일을 열면 바로 작동합니다!</li>
        </ol>
      </div>

      <div class="my-8 p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded">
        <h3 class="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
          🎯 예제 특징
        </h3>
        <ul class="text-sm text-purple-800 dark:text-purple-200 space-y-2">
          <li>
            <strong>제로 설정:</strong> NPM, Webpack, Babel 등 빌드 도구 불필요
          </li>
          <li>
            <strong>CDN 로딩:</strong> Lithent, FTags, Helper를 CDN에서 직접
            로드
          </li>
          <li>
            <strong>반응형 상태:</strong> lstate와 computed를 활용한 자동
            업데이트
          </li>
          <li>
            <strong>카테고리 관리:</strong> 집안일, 회사일, 기타로 할 일 분류
          </li>
          <li>
            <strong>다중 필터:</strong> 전체, 완료, 진행중, 카테고리별 필터링
          </li>
          <li>
            <strong>체크박스 완료:</strong> 클릭으로 완료/미완료 토글
          </li>
          <li>
            <strong>아름다운 UI:</strong> 그라데이션과 애니메이션이 포함된 모던
            디자인
          </li>
        </ul>
      </div>

      <div class="my-8">
        <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          📋 완전한 HTML 파일
        </h4>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          아래 코드를 복사해서 .html 파일로 저장하고 브라우저에서 열어보세요!
        </p>
        <CodeBlock code={htmlCode} language="html" />
      </div>

      <div class="my-8 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
        <h3 class="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
          ✨ 주요 학습 포인트
        </h3>
        <div class="text-sm text-green-800 dark:text-green-200 space-y-3">
          <div>
            <strong>1. flMount 사용:</strong>
            <br />
            <code class="px-2 py-1 bg-green-200 dark:bg-green-800 rounded">
              flMount
            </code>
            로 컴포넌트를 생성하고 JSX 없이 함수 호출로 UI 구성
          </div>
          <div>
            <strong>2. lstate 반응성:</strong>
            <br />
            <code class="px-2 py-1 bg-green-200 dark:bg-green-800 rounded">
              lstate
            </code>
            로 상태를 관리하면 자동으로 UI가 업데이트됨
          </div>
          <div>
            <strong>3. computed 값:</strong>
            <br />
            <code class="px-2 py-1 bg-green-200 dark:bg-green-800 rounded">
              computed
            </code>
            로 파생 상태(전체/완료/진행중 개수)를 자동 계산
          </div>
          <div>
            <strong>4. Props 생략:</strong>
            <br />
            fTags는 Props 객체를 생략하고 바로 children을 전달 가능
          </div>
          <div>
            <strong>5. 조건부 렌더링:</strong>
            <br />
            삼항 연산자로 빈 상태와 리스트를 조건부로 렌더링
          </div>
        </div>
      </div>

      <div class="my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
        <h3 class="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          🔧 커스터마이징 아이디어
        </h3>
        <ul class="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
          <li>
            • <strong>LocalStorage 추가:</strong> 브라우저를 닫아도 할 일이
            유지되도록 개선
          </li>
          <li>
            • <strong>우선순위 기능:</strong> 높음/중간/낮음 우선순위 추가
          </li>
          <li>
            • <strong>마감일 설정:</strong> 각 할 일에 마감일을 추가하고 정렬
          </li>
          <li>
            • <strong>서브태스크:</strong> 큰 작업을 작은 단계로 나누기
          </li>
          <li>
            • <strong>검색 기능:</strong> 할 일 제목으로 검색
          </li>
        </ul>
      </div>

      <div class="mt-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          📚 더 알아보기
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
            → FTags 가이드: 전체 API 문서와 더 많은 예제
          </a>
          <a
            href="/guide/lstate"
            class="block text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/lstate');
            }}
          >
            → Lstate 가이드: 반응형 상태 관리 자세히 알아보기
          </a>
          <a
            href="/guide/computed"
            class="block text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              navigateTo('/guide/computed');
            }}
          >
            → Computed 가이드: 파생 상태 활용법
          </a>
        </div>
      </div>
    </div>
  );
});
