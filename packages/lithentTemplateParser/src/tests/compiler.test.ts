import { describe, it, expect } from 'vitest';
import { compile } from '../compiler';

describe('Compiler', () => {
  describe('Basic compilation', () => {
    it('should compile simple element', () => {
      const template = '<div></div>';
      const result = compile(template);

      expect(result.errors).toHaveLength(0);
      expect(result.code).toContain("h('div', null)");
    });

    it('should compile element with text', () => {
      const template = '<div>Hello World</div>';
      const result = compile(template);

      expect(result.errors).toHaveLength(0);
      expect(result.code).toContain("'Hello World'");
    });

    it('should compile element with interpolation', () => {
      const template = '<div>{message}</div>';
      const result = compile(template);

      expect(result.errors).toHaveLength(0);
      expect(result.code).toContain('message');
    });

    it('should compile component', () => {
      const template = '<MyComponent />';
      const result = compile(template);

      expect(result.errors).toHaveLength(0);
      expect(result.code).toContain('h(MyComponent, null)');
    });

    it('should compile fragment', () => {
      const template = '<><div>Hello</div><span>World</span></>';
      const result = compile(template);

      expect(result.errors).toHaveLength(0);
      expect(result.code).toContain('h(Fragment, null');
    });

    it('should compile deeply nested structures', () => {
      const template = `
<>
  <Card l-for={(section, sectionIndex) in sections} key={section.id}>
    <Section.Header l-if={section.showHeader}>
      <Title>{section.title ?? 'Untitled'}</Title>
    </Section.Header>
    <Section.Header l-else-if={sectionIndex === 0}>
      <Title>First Section</Title>
    </Section.Header>
    <Section.Header l-else>
      <Title>Hidden</Title>
    </Section.Header>
    <Section.Content>
      <ul>
        <li l-for={(item, itemIndex) in section.items}>
          <span l-if={item.visible}>
            <>
              <Label>{itemIndex + 1}</Label>
              <Text>{item.label}</Text>
            </>
          </span>
          <span l-else>{item.fallback}</span>
        </li>
      </ul>
    </Section.Content>
  </Card>
</>
      `.trim();

      const result = compile(template);

      expect(result.errors).toHaveLength(0);
      expect(result.code).toContain(
        '(sections).map((section, sectionIndex) =>'
      );
      expect(result.code).toContain('(section.items).map((item, itemIndex) =>');
      expect(result.code).toContain('(section.showHeader) ?');
      expect(result.code).toContain('(item.visible) ?');
    });

    it('should compile compound component reference', () => {
      const template = '<a.Children />';
      const result = compile(template);

      expect(result.errors).toHaveLength(0);
      expect(result.code).toContain('h(a.Children, null)');
    });
  });

  describe('Attributes', () => {
    it('should compile static attributes', () => {
      const template = '<div class="container" id="app"></div>';
      const result = compile(template);

      expect(result.errors).toHaveLength(0);
      expect(result.code).toContain("class: 'container'");
      expect(result.code).toContain("id: 'app'");
    });

    it('should compile dynamic attributes', () => {
      const template = '<div class={className}></div>';
      const result = compile(template);

      expect(result.errors).toHaveLength(0);
      expect(result.code).toContain('class: className');
    });

    it('should compile boolean attributes', () => {
      const template = '<input disabled />';
      const result = compile(template);

      expect(result.errors).toHaveLength(0);
      expect(result.code).toContain('disabled: true');
    });
  });

  describe('Directives', () => {
    it('should compile l-if directive', () => {
      const template = '<div l-if={isActive}>Active</div>';
      const result = compile(template);

      expect(result.errors).toHaveLength(0);
      expect(result.code).toContain('(isActive) ?');
      expect(result.code).toContain("'Active'");
    });

    it('should compile l-if/l-else-if/l-else chain', () => {
      const template = `
        <div l-if={status === 'loading'}>Loading</div>
        <div l-else-if={status === 'error'}>Error</div>
        <div l-else>Success</div>
      `;
      const result = compile(template);

      expect(result.errors).toHaveLength(0);
      expect(result.code).toContain("status === 'loading'");
      expect(result.code).toContain("status === 'error'");
      expect(result.code).toContain("'Success'");
    });

    it('should compile l-for directive', () => {
      const template = '<li l-for={item in items}>{item}</li>';
      const result = compile(template);

      expect(result.errors).toHaveLength(0);
      expect(result.code).toContain('(items).map(item =>');
    });

    it('should compile l-for with index', () => {
      const template =
        '<li l-for={(item, index) in items}>{index}: {item}</li>';
      const result = compile(template);

      expect(result.errors).toHaveLength(0);
      expect(result.code).toContain('(items).map((item, index) =>');
    });

    it('should compile nested l-if blocks with inner loops', () => {
      const template = `
<div l-if={outer}><section l-if={middle}><span l-if={inner}>{value}</span><ul><li l-for={(item, index) in items}><span l-if={item.visible}>{item.label}</span><span l-else>{index}</span></li></ul></section></div>
<div l-else>Fallback</div>
      `.trim();

      const result = compile(template);

      expect(result.errors).toHaveLength(0);
      expect(result.code).toContain('(outer) ?');
      expect(result.code).toContain('(middle) ?');
      expect(result.code).toContain('(inner) ?');
      expect(result.code).toContain('(items).map((item, index) =>');
      expect(result.code).toContain('(item.visible) ?');
      expect(result.code).toContain("'Fallback'");
    });
  });

  describe('Complex templates', () => {
    it('should compile nested elements', () => {
      const template = `
        <div class="container">
          <h1>{title}</h1>
          <p>{content}</p>
        </div>
      `;
      const result = compile(template);

      expect(result.errors).toHaveLength(0);
      expect(result.code).toContain("h('div'");
      expect(result.code).toContain("h('h1'");
      expect(result.code).toContain("h('p'");
    });

    it('should compile list with conditionals', () => {
      const template = `
        <ul>
          <li l-for={item in items}>
            <span l-if={item.done}>✓</span>
            {item.text}
          </li>
        </ul>
      `;
      const result = compile(template);

      expect(result.errors).toHaveLength(0);
      expect(result.code).toContain('(items).map(item =>');
      expect(result.code).toContain('(item.done) ?');
    });

    it('should compile component with props and children', () => {
      const template = `
        <Card title={cardTitle} active={isActive}>
          <p>{cardContent}</p>
        </Card>
      `;
      const result = compile(template);

      expect(result.errors).toHaveLength(0);
      expect(result.code).toContain('h(Card');
      expect(result.code).toContain('title: cardTitle');
      expect(result.code).toContain('active: isActive');
      expect(result.code).toContain("h('p'");
    });
  });

  describe('Error handling', () => {
    it('should handle syntax errors gracefully', () => {
      const template = '<div></span>';
      const result = compile(template);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.code).toBe('');
    });

    it('should report line and column for syntax errors', () => {
      const template = '<div><span></div>';
      const result = compile(template);

      expect(result.errors.length).toBeGreaterThan(0);
      const error = result.errors[0];
      expect(error.line).toBeGreaterThan(0);
      expect(error.column).toBeGreaterThan(0);
    });
  });

  describe('Real-world examples', () => {
    it('should compile todo list', () => {
      const template = `
        <div class="todo-list">
          <h2>Todos ({todos.length})</h2>
          <div l-for={todo in todos} class="todo-item">
            <input type="checkbox" checked={todo.done} />
            <span>{todo.text}</span>
          </div>
          <p l-if={todos.length === 0}>No todos yet</p>
        </div>
      `;
      const result = compile(template);

      expect(result.errors).toHaveLength(0);
      expect(result.code).toContain('(todos).map(todo =>');
      expect(result.code).toContain('todos.length');
    });

    it('should compile user profile card', () => {
      const template = `
        <div class="profile-card">
          <img src={user.avatar} />
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <button l-if={canEdit} onClick={handleEdit}>Edit</button>
        </div>
      `;
      const result = compile(template);

      expect(result.errors).toHaveLength(0);
      expect(result.code).toContain('user.avatar');
      expect(result.code).toContain('user.name');
      expect(result.code).toContain('(canEdit) ?');
    });

    it('should compile dashboard with multiple sections', () => {
      const template = `
        <div class="dashboard">
          <header>
            <h1>{title}</h1>
          </header>
          <main>
            <div l-if={isLoading}>
              <Spinner />
            </div>
            <div l-else-if={hasError}>
              <ErrorMessage message={error} />
            </div>
            <div l-else>
              <DataGrid data={data} />
            </div>
          </main>
        </div>
      `;
      const result = compile(template);

      expect(result.errors).toHaveLength(0);
      expect(result.code).toContain('(isLoading) ?');
      expect(result.code).toContain('h(Spinner');
      expect(result.code).toContain('h(ErrorMessage');
      expect(result.code).toContain('h(DataGrid');
    });
  });

  describe('Compatibility fixtures', () => {
    const fixtures = [
      {
        name: 'todo section with conditionals and loops',
        template: `
<section class="todo">
  <header l-if={showHeader}>
    <h2>{title}</h2>
    <p l-if={description}>{description}</p>
    <p l-else>No description</p>
  </header>
  <main>
    <article l-for={(item, index) in items} key={item.id}>
      <header>
        <h3>{index + 1}. {item.name}</h3>
        <span l-if={item.done}>✓</span>
      </header>
      <ul>
        <li l-for={(tag, tagIndex) in item.tags}>
          <span>{tagIndex}</span>
          <span>{tag.label}</span>
        </li>
      </ul>
    </article>
  </main>
  <footer l-else-if={items.length === 0}>
    <p>No items</p>
  </footer>
</section>
        `.trim(),
      },
      {
        name: 'nested fragments with mixed content',
        template: `
<>
  <div class="layout">
    <aside l-if={sidebar}>
      <nav>
        <ul>
          <li l-for={link in sidebar.links}>
            <a href={link.href}>{link.label}</a>
          </li>
        </ul>
      </nav>
    </aside>
    <section>
      <>
        <header>
          <h1>{page.title}</h1>
          <p l-if={page.subtitle}>{page.subtitle}</p>
        </header>
        <article>
          <slot-content />
        </article>
      </>
    </section>
  </div>
  <footer l-else>
    <p>Sidebar disabled</p>
  </footer>
</>
        `.trim(),
      },
    ];

    for (const { name, template } of fixtures) {
      it(`should compile fixture: ${name}`, () => {
        const result = compile(template);

        expect(result.errors).toHaveLength(0);
        expect(result.code).toContain('h(');
      });
    }
  });

  describe('Options', () => {
    it('should respect generate options', () => {
      const template = '<div></div>';
      const result = compile(template, {
        generate: {
          templateFactory: 'createElement',
        },
      });

      expect(result.errors).toHaveLength(0);
      expect(result.code).toContain('createElement(');
      expect(result.code).not.toContain('import');
    });

    it('should apply optimizations', () => {
      const template = '<div>   Hello   World   </div>';
      const result = compile(template, {
        transform: {
          optimize: true,
          optimizeOptions: {
            trimText: true,
          },
        },
      });

      expect(result.errors).toHaveLength(0);
      // Text should be trimmed
      expect(result.code).toContain('Hello   World');
    });
  });
});
