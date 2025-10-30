import { describe, it, expect } from 'vitest';
import { tokenize } from '../parser/lexer';
import { parse } from '../parser/parser';
import { NodeType, DirectiveNode } from '../parser/ast';
import {
  expectElement,
  expectFragment,
  expectText,
  expectInterpolation,
  expectComment,
  expectDirective,
  isDirectiveFor,
  isDirectiveIf,
  isDirectiveElseIf,
  isDirectiveElse,
} from './helpers';

describe('Parser', () => {
  describe('Basic elements', () => {
    it('should parse simple element', () => {
      const tokens = tokenize('<div></div>');
      const ast = parse(tokens);

      expect(ast.type).toBe(NodeType.ROOT);
      expect(ast.children).toHaveLength(1);

      const element = expectElement(ast.children[0]);
      expect(element.type).toBe(NodeType.ELEMENT);
      expect(element.tag).toBe('div');
      expect(element.isSelfClosing).toBe(false);
    });

    it('should parse self-closing element', () => {
      const tokens = tokenize('<img />');
      const ast = parse(tokens);

      expect(ast.children).toHaveLength(1);
      const element = expectElement(ast.children[0]);
      expect(element.type).toBe(NodeType.ELEMENT);
      expect(element.tag).toBe('img');
      expect(element.isSelfClosing).toBe(true);
    });

    it('should parse fragment', () => {
      const tokens = tokenize('<><div></div><span /></>');
      const ast = parse(tokens);

      expect(ast.children).toHaveLength(1);
      const fragment = expectFragment(ast.children[0]);
      expect(fragment.type).toBe(NodeType.FRAGMENT);
      expect(fragment.children).toHaveLength(2);

      const firstChild = expectElement(fragment.children[0]);
      expect(firstChild.tag).toBe('div');
      const secondChild = expectElement(fragment.children[1]);
      expect(secondChild.tag).toBe('span');
    });

    it('should parse component (PascalCase)', () => {
      const tokens = tokenize('<MyComponent></MyComponent>');
      const ast = parse(tokens);

      const element = expectElement(ast.children[0]);
      expect(element.type).toBe(NodeType.ELEMENT);
      expect(element.tag).toBe('MyComponent');
      expect(element.isComponent).toBe(true);
    });

    it('should parse fragment', () => {
      const tokens = tokenize('<><div></div><span /></>');
      const ast = parse(tokens);

      expect(ast.children).toHaveLength(1);
      const fragment = expectFragment(ast.children[0]);
      expect(fragment.type).toBe(NodeType.FRAGMENT);
      expect(fragment.children).toHaveLength(2);

      const firstChild = expectElement(fragment.children[0]);
      expect(firstChild.tag).toBe('div');
      const secondChild = expectElement(fragment.children[1]);
      expect(secondChild.tag).toBe('span');
    });

    it('should parse compound component (namespaced)', () => {
      const tokens = tokenize('<Card.Header></Card.Header>');
      const ast = parse(tokens);

      const element = expectElement(ast.children[0]);
      expect(element.type).toBe(NodeType.ELEMENT);
      expect(element.tag).toBe('Card.Header');
      expect(element.isComponent).toBe(true);
    });

    it('should treat lowercase namespace member as component', () => {
      const tokens = tokenize('<a.Children></a.Children>');
      const ast = parse(tokens);

      const element = expectElement(ast.children[0]);
      expect(element.tag).toBe('a.Children');
      expect(element.isComponent).toBe(true);
    });

    it('should parse nested elements', () => {
      const tokens = tokenize('<div><span></span></div>');
      const ast = parse(tokens);

      const div = expectElement(ast.children[0]);
      expect(div.type).toBe(NodeType.ELEMENT);
      expect(div.tag).toBe('div');
      expect(div.children).toHaveLength(1);

      const span = expectElement(div.children[0]);
      expect(span.type).toBe(NodeType.ELEMENT);
      expect(span.tag).toBe('span');
    });
  });

  describe('Attributes', () => {
    it('should parse static attribute', () => {
      const tokens = tokenize('<div class="container"></div>');
      const ast = parse(tokens);

      const element = expectElement(ast.children[0]);
      expect(element.type).toBe(NodeType.ELEMENT);
      expect(element.attributes).toHaveLength(1);

      const attr = element.attributes[0];
      expect(attr.name).toBe('class');
      expect(attr.value).toBe('container');
      expect(attr.isDynamic).toBe(false);
    });

    it('should parse dynamic attribute', () => {
      const tokens = tokenize('<div class={className}></div>');
      const ast = parse(tokens);

      const element = expectElement(ast.children[0]);
      expect(element.attributes).toHaveLength(1);

      const attr = element.attributes[0];
      expect(attr.name).toBe('class');
      expect(attr.value).toEqual({ expression: 'className' });
      expect(attr.isDynamic).toBe(true);
    });

    it('should parse multiple attributes', () => {
      const tokens = tokenize(
        '<div id="app" class={className} disabled></div>'
      );
      const ast = parse(tokens);

      const element = expectElement(ast.children[0]);
      expect(element.attributes).toHaveLength(3);

      expect(element.attributes[0].name).toBe('id');
      expect(element.attributes[0].value).toBe('app');

      expect(element.attributes[1].name).toBe('class');
      expect(element.attributes[1].isDynamic).toBe(true);

      expect(element.attributes[2].name).toBe('disabled');
      expect(element.attributes[2].value).toBeNull();
    });

    it('should parse ref attribute', () => {
      const tokens = tokenize('<div ref={myRef}></div>');
      const ast = parse(tokens);

      const element = expectElement(ast.children[0]);
      expect(element.type).toBe(NodeType.ELEMENT);
      expect(element.ref).toBe('myRef');
    });
  });

  describe('Directives', () => {
    it('should parse l-if directive', () => {
      const tokens = tokenize('<div l-if={count > 0}></div>');
      const ast = parse(tokens);

      const element = expectElement(ast.children[0]);
      expect(element.type).toBe(NodeType.ELEMENT);
      expect(element.directives).toHaveLength(1);

      const directive = expectDirective(
        element.directives[0],
        isDirectiveIf,
        'DirectiveIf'
      );
      expect(directive.type).toBe(NodeType.DIRECTIVE_IF);
      expect(directive.condition).toBe('count > 0');
    });

    it('should parse l-else-if directive', () => {
      const tokens = tokenize('<div l-else-if={count === 0}></div>');
      const ast = parse(tokens);

      const element = expectElement(ast.children[0]);
      const directive = expectDirective(
        element.directives[0],
        isDirectiveElseIf,
        'DirectiveElseIf'
      );
      expect(directive.type).toBe(NodeType.DIRECTIVE_ELSE_IF);
      expect(directive.condition).toBe('count === 0');
    });

    it('should parse l-else directive', () => {
      const tokens = tokenize('<div l-else></div>');
      const ast = parse(tokens);

      const element = expectElement(ast.children[0]);
      const directive = expectDirective(
        element.directives[0],
        isDirectiveElse,
        'DirectiveElse'
      );
      expect(directive.type).toBe(NodeType.DIRECTIVE_ELSE);
    });

    it('should parse l-for directive (simple)', () => {
      const tokens = tokenize('<div l-for={item in items}></div>');
      const ast = parse(tokens);

      const element = expectElement(ast.children[0]);
      const directive = expectDirective(
        element.directives[0],
        isDirectiveFor,
        'DirectiveFor'
      );
      expect(directive.type).toBe(NodeType.DIRECTIVE_FOR);
      expect(directive.item).toBe('item');
      expect(directive.list).toBe('items');
      expect(directive.index).toBeUndefined();
    });

    it('should parse l-for directive (with index)', () => {
      const tokens = tokenize('<div l-for={(item, index) in items}></div>');
      const ast = parse(tokens);

      const element = expectElement(ast.children[0]);
      const directive = expectDirective(
        element.directives[0],
        isDirectiveFor,
        'DirectiveFor'
      );
      expect(directive.type).toBe(NodeType.DIRECTIVE_FOR);
      expect(directive.item).toBe('item');
      expect(directive.index).toBe('index');
      expect(directive.list).toBe('items');
    });

    it('should parse l-for directive with multiline expression', () => {
      const template = `<div l-for={(item, index) in
        itemsList}></div>`;
      const tokens = tokenize(template);
      const ast = parse(tokens);

      const element = expectElement(ast.children[0]);
      const directive = expectDirective(
        element.directives[0],
        isDirectiveFor,
        'DirectiveFor'
      );
      expect(directive.type).toBe(NodeType.DIRECTIVE_FOR);
      expect(directive.item).toBe('item');
      expect(directive.index).toBe('index');
      expect(directive.list).toBe('itemsList');
    });

    it('should parse l-for directive with complex identifier names', () => {
      const tokens = tokenize('<div l-for={($item, idx_1) in dataSets}></div>');
      const ast = parse(tokens);

      const element = expectElement(ast.children[0]);
      const directive = expectDirective(
        element.directives[0],
        isDirectiveFor,
        'DirectiveFor'
      );
      expect(directive.type).toBe(NodeType.DIRECTIVE_FOR);
      expect(directive.item).toBe('$item');
      expect(directive.index).toBe('idx_1');
      expect(directive.list).toBe('dataSets');
    });

    it('should parse l-for directive with ternary expression list', () => {
      const template =
        '<div l-for={(item, idx) in items.length ? items : []}></div>';
      const tokens = tokenize(template);
      const ast = parse(tokens);

      const element = expectElement(ast.children[0]);
      const directive = expectDirective(
        element.directives[0],
        isDirectiveFor,
        'DirectiveFor'
      );
      expect(directive.type).toBe(NodeType.DIRECTIVE_FOR);
      expect(directive.item).toBe('item');
      expect(directive.index).toBe('idx');
      expect(directive.list).toBe('items.length ? items : []');
    });

    it('should parse l-for directive with complex list expression', () => {
      const template = `<div l-for={(item, idx) in data?.map(value => \`inner \${value}\`).filter(Boolean)}></div>`;
      const tokens = tokenize(template);
      const ast = parse(tokens);

      const element = expectElement(ast.children[0]);
      const directive = expectDirective(
        element.directives[0],
        isDirectiveFor,
        'DirectiveFor'
      );
      expect(directive.type).toBe(NodeType.DIRECTIVE_FOR);
      expect(directive.item).toBe('item');
      expect(directive.index).toBe('idx');
      expect(directive.list).toBe(
        'data?.map(value => `inner ${value}`).filter(Boolean)'
      );
    });
  });

  describe('Text and interpolation', () => {
    it('should parse text node', () => {
      const tokens = tokenize('<div>Hello World</div>');
      const ast = parse(tokens);

      const element = expectElement(ast.children[0]);
      expect(element.children).toHaveLength(1);

      const textNode = expectText(element.children[0]);
      expect(textNode.type).toBe(NodeType.TEXT);
      expect(textNode.content).toBe('Hello World');
    });

    it('should parse interpolation', () => {
      const tokens = tokenize('<div>{message}</div>');
      const ast = parse(tokens);

      const element = expectElement(ast.children[0]);
      expect(element.children).toHaveLength(1);

      const interpolation = expectInterpolation(element.children[0]);
      expect(interpolation.type).toBe(NodeType.INTERPOLATION);
      expect(interpolation.expression).toBe('message');
    });

    it('should parse mixed text and interpolation', () => {
      const tokens = tokenize('<div>Hello {name}!</div>');
      const ast = parse(tokens);

      const element = expectElement(ast.children[0]);
      expect(element.children).toHaveLength(3);

      const firstChild = expectText(element.children[0]);
      expect(firstChild.content).toBe('Hello ');

      const secondChild = expectInterpolation(element.children[1]);
      expect(secondChild.expression).toBe('name');

      const thirdChild = expectText(element.children[2]);
      expect(thirdChild.content).toBe('!');
    });
  });

  describe('Comments', () => {
    it('should parse comments', () => {
      const tokens = tokenize('<!-- This is a comment -->');
      const ast = parse(tokens);

      expect(ast.children).toHaveLength(1);
      const comment = expectComment(ast.children[0]);
      expect(comment.type).toBe(NodeType.COMMENT);
      expect(comment.content).toBe('This is a comment');
    });
  });

  describe('Complex templates', () => {
    it('should parse complete component', () => {
      const template = `
<div class="container">
  <h1>{title}</h1>
  <ul>
    <li l-for={item in items}>
      {item.name}
    </li>
  </ul>
</div>
      `.trim();

      const tokens = tokenize(template);
      const ast = parse(tokens);

      expect(ast.type).toBe(NodeType.ROOT);
      expect(ast.children).toHaveLength(1);

      const div = expectElement(ast.children[0]);
      expect(div.type).toBe(NodeType.ELEMENT);
      expect(div.tag).toBe('div');
      expect(div.children.length).toBeGreaterThan(0);
    });

    it('should parse conditional rendering', () => {
      const template = `
<div l-if={isLoading}>Loading...</div>
<div l-else-if={hasError}>Error</div>
<div l-else>Content</div>
      `.trim();

      const tokens = tokenize(template);
      const ast = parse(tokens);

      expect(ast.children).toHaveLength(3);

      const first = expectElement(ast.children[0]);
      const second = expectElement(ast.children[1]);
      const third = expectElement(ast.children[2]);

      expect(first.directives[0].type).toBe(NodeType.DIRECTIVE_IF);
      expect(second.directives[0].type).toBe(NodeType.DIRECTIVE_ELSE_IF);
      expect(third.directives[0].type).toBe(NodeType.DIRECTIVE_ELSE);
    });

    it('should parse component with nested content', () => {
      const template = `
<Card title="User">
  <div class="header">{title}</div>
  <p>{content}</p>
</Card>
      `.trim();

      const tokens = tokenize(template);
      const ast = parse(tokens);

      const card = expectElement(ast.children[0]);
      expect(card.type).toBe(NodeType.ELEMENT);
      expect(card.tag).toBe('Card');
      expect(card.isComponent).toBe(true);

      // Should have template and p as children
      expect(card.children.length).toBeGreaterThan(0);
    });

    it('should parse deeply nested structures', () => {
      const template = `
<>
  <Card l-for={(section, sectionIndex) in sections} key={section.id}>
    <Section.Header l-if={section.showHeader}>
      <!-- header -->
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

      const tokens = tokenize(template);
      const ast = parse(tokens);

      expect(ast.children).toHaveLength(1);
      const fragment = expectFragment(ast.children[0]);
      expect(fragment.children).toHaveLength(1);

      const card = expectElement(fragment.children[0]);
      expect(card.tag).toBe('Card');
      const cardLoop = expectDirective(
        card.directives[0],
        isDirectiveFor,
        'DirectiveFor'
      );
      expect(cardLoop.item).toBe('section');
      expect(card.children).toHaveLength(4);

      const headerIf = expectElement(card.children[0]);
      expect(
        expectDirective(headerIf.directives[0], isDirectiveIf, 'DirectiveIf')
          .condition
      ).toContain('section.showHeader');

      const headerElseIf = expectElement(card.children[1]);
      expect(
        expectDirective(
          headerElseIf.directives[0],
          isDirectiveElseIf,
          'DirectiveElseIf'
        ).condition
      ).toContain('sectionIndex === 0');

      const headerElse = expectElement(card.children[2]);
      expect(
        expectDirective(
          headerElse.directives[0],
          isDirectiveElse,
          'DirectiveElse'
        )
      ).toBeDefined();

      const content = expectElement(card.children[3]);
      const list = expectElement(content.children[0]);
      const listItem = expectElement(list.children[0]);
      const itemLoop = expectDirective(
        listItem.directives[0],
        isDirectiveFor,
        'DirectiveFor'
      );
      expect(itemLoop.item).toBe('item');

      const spanIf = expectElement(listItem.children[0]);
      expect(
        expectDirective(spanIf.directives[0], isDirectiveIf, 'DirectiveIf')
          .condition
      ).toContain('item.visible');
      const spanFragment = expectFragment(spanIf.children[0]);
      expect(spanFragment.children).toHaveLength(2);
    });

    it('should parse nested conditionals and loops within l-if blocks', () => {
      const template = `
<div l-if={outer}><section l-if={middle}><span l-if={inner}>{value}</span><ul><li l-for={(item, index) in items}><span l-if={item.visible}>{item.label}</span><span l-else>{index}</span></li></ul></section></div>
<div l-else>Fallback</div>
      `.trim();

      const tokens = tokenize(template);
      const ast = parse(tokens);

      expect(ast.children).toHaveLength(2);

      const outerElement = expectElement(ast.children[0]);
      const outerDirective = expectDirective(
        outerElement.directives[0],
        isDirectiveIf,
        'DirectiveIf'
      );
      expect(outerDirective.condition).toBe('outer');

      const innerSection = expectElement(outerElement.children[0]);
      const sectionDirective = expectDirective(
        innerSection.directives[0],
        isDirectiveIf,
        'DirectiveIf'
      );
      expect(sectionDirective.condition).toBe('middle');

      const innerSpan = expectElement(innerSection.children[0]);
      const innerDirective = expectDirective(
        innerSpan.directives[0],
        isDirectiveIf,
        'DirectiveIf'
      );
      expect(innerDirective.condition).toBe('inner');

      const innerList = expectElement(innerSection.children[1]);
      const listItem = expectElement(innerList.children[0]);
      const loopDirective = expectDirective(
        listItem.directives[0],
        isDirectiveFor,
        'DirectiveFor'
      );
      expect(loopDirective.item).toBe('item');
      expect(loopDirective.index).toBe('index');
      expect(loopDirective.list).toBe('items');

      const loopIf = expectElement(listItem.children[0]);
      const loopIfDirective = expectDirective(
        loopIf.directives[0],
        isDirectiveIf,
        'DirectiveIf'
      );
      expect(loopIfDirective.condition).toBe('item.visible');

      const loopElse = expectElement(listItem.children[1]);
      expectDirective(loopElse.directives[0], isDirectiveElse, 'DirectiveElse');

      const fallback = expectElement(ast.children[1]);
      expectDirective(fallback.directives[0], isDirectiveElse, 'DirectiveElse');
      const fallbackText = expectText(fallback.children[0]);
      expect(fallbackText.content).toBe('Fallback');
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
      it(`should parse fixture: ${name}`, () => {
        const tokens = tokenize(template);
        const ast = parse(tokens);

        expect(ast.type).toBe(NodeType.ROOT);
        expect(ast.children.length).toBeGreaterThan(0);
      });
    }
  });

  describe('Error handling', () => {
    it('should throw on mismatched tags', () => {
      const tokens = tokenize('<div></span>');

      expect(() => parse(tokens)).toThrow();
    });

    it('should handle empty template', () => {
      const tokens = tokenize('');
      const ast = parse(tokens);

      expect(ast.type).toBe(NodeType.ROOT);
      expect(ast.children).toHaveLength(0);
    });
  });
});
