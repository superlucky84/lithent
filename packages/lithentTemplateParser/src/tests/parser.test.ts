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
