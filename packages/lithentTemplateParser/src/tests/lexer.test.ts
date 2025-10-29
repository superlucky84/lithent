import { describe, it, expect } from 'vitest';
import { tokenize } from '../parser/lexer';
import { TokenType } from '../parser/tokens';

describe('Lexer', () => {
  describe('Basic tags', () => {
    it('should tokenize simple opening tag', () => {
      const tokens = tokenize('<div>');
      expect(tokens[0].type).toBe(TokenType.TAG_OPEN_START);
      expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[1].value).toBe('div');
      expect(tokens[2].type).toBe(TokenType.TAG_OPEN_END);
    });

    it('should tokenize self-closing tag', () => {
      const tokens = tokenize('<img />');
      const filtered = tokens.filter(t => t.type !== TokenType.WHITESPACE);

      expect(filtered[0].type).toBe(TokenType.TAG_OPEN_START);
      expect(filtered[1].type).toBe(TokenType.IDENTIFIER);
      expect(filtered[1].value).toBe('img');
      expect(filtered[2].type).toBe(TokenType.TAG_SELF_CLOSE);
    });

    it('should tokenize closing tag', () => {
      const tokens = tokenize('</div>');
      expect(tokens[0].type).toBe(TokenType.TAG_CLOSE_START);
      expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[1].value).toBe('div');
      expect(tokens[2].type).toBe(TokenType.TAG_OPEN_END);
    });

    it('should tokenize component (PascalCase)', () => {
      const tokens = tokenize('<MyComponent>');
      expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[1].value).toBe('MyComponent');
    });
  });

  describe('Attributes', () => {
    it('should tokenize static attribute', () => {
      const tokens = tokenize('<div class="container">');
      const filtered = tokens.filter(t => t.type !== TokenType.WHITESPACE);

      expect(filtered[2].type).toBe(TokenType.IDENTIFIER);
      expect(filtered[2].value).toBe('class');
      expect(filtered[3].type).toBe(TokenType.ATTRIBUTE_EQUALS);
      expect(filtered[4].type).toBe(TokenType.STRING_LITERAL);
      expect(filtered[4].value).toBe('"container"');
    });

    it('should tokenize dynamic attribute', () => {
      const tokens = tokenize('<div class={className}>');
      const filtered = tokens.filter(t => t.type !== TokenType.WHITESPACE);

      expect(filtered[2].type).toBe(TokenType.IDENTIFIER);
      expect(filtered[2].value).toBe('class');
      expect(filtered[3].type).toBe(TokenType.ATTRIBUTE_EQUALS);
      expect(filtered[4].type).toBe(TokenType.EXPRESSION_START);
      expect(filtered[5].type).toBe(TokenType.EXPRESSION_CONTENT);
      expect(filtered[5].value).toBe('className');
      expect(filtered[6].type).toBe(TokenType.EXPRESSION_END);
    });

    it('should tokenize ref attribute', () => {
      const tokens = tokenize('<div ref={myRef}>');
      const filtered = tokens.filter(t => t.type !== TokenType.WHITESPACE);

      expect(filtered[2].type).toBe(TokenType.KEYWORD_REF);
      expect(filtered[2].value).toBe('ref');
    });

    it('should tokenize template literal expressions', () => {
      const tokens = tokenize('<div class={`greet-${name}`} />');
      const filtered = tokens.filter(t => t.type !== TokenType.WHITESPACE);

      const exprContent = filtered.find(
        t => t.type === TokenType.EXPRESSION_CONTENT
      );
      expect(exprContent?.value).toContain('greet-${name}');
    });

    it('should tokenize nested template literal expressions', () => {
      const template =
        '<div data-text={`outer ${items.map(item => `inner ${item}`)} end`} />';
      const tokens = tokenize(template);
      const filtered = tokens.filter(t => t.type !== TokenType.WHITESPACE);

      const exprContent = filtered.find(
        t => t.type === TokenType.EXPRESSION_CONTENT
      );
      expect(exprContent?.value).toContain('items.map');
      expect(exprContent?.value).toContain('inner ${item}');
      expect(exprContent?.value.trim().endsWith('end`')).toBe(true);
    });
  });

  describe('Directives', () => {
    it('should tokenize w-if directive', () => {
      const tokens = tokenize('<div w-if={count > 0}>');
      const filtered = tokens.filter(t => t.type !== TokenType.WHITESPACE);

      expect(filtered[2].type).toBe(TokenType.DIRECTIVE_IF);
      expect(filtered[2].value).toBe('w-if');
      expect(filtered[4].type).toBe(TokenType.EXPRESSION_START);
      expect(filtered[5].value.trim()).toBe('count > 0');
    });

    it('should tokenize w-else-if directive', () => {
      const tokens = tokenize('<div w-else-if={count === 0}>');
      const filtered = tokens.filter(t => t.type !== TokenType.WHITESPACE);

      expect(filtered[2].type).toBe(TokenType.DIRECTIVE_ELSE_IF);
      expect(filtered[2].value).toBe('w-else-if');
    });

    it('should tokenize w-else directive', () => {
      const tokens = tokenize('<div w-else>');
      const filtered = tokens.filter(t => t.type !== TokenType.WHITESPACE);

      expect(filtered[2].type).toBe(TokenType.DIRECTIVE_ELSE);
      expect(filtered[2].value).toBe('w-else');
    });

    it('should tokenize w-for directive', () => {
      const tokens = tokenize('<div w-for={item in items}>');
      const filtered = tokens.filter(t => t.type !== TokenType.WHITESPACE);

      expect(filtered[2].type).toBe(TokenType.DIRECTIVE_FOR);
      expect(filtered[2].value).toBe('w-for');
      expect(filtered[5].value.trim()).toBe('item in items');
    });
  });

  describe('Text and interpolation', () => {
    it('should tokenize plain text', () => {
      const tokens = tokenize('Hello World');
      expect(tokens[0].type).toBe(TokenType.TEXT);
      expect(tokens[0].value).toBe('Hello World');
    });

    it('should tokenize interpolation', () => {
      const tokens = tokenize('{message}');
      expect(tokens[0].type).toBe(TokenType.EXPRESSION_START);
      expect(tokens[1].type).toBe(TokenType.EXPRESSION_CONTENT);
      expect(tokens[1].value).toBe('message');
      expect(tokens[2].type).toBe(TokenType.EXPRESSION_END);
    });

    it('should tokenize mixed text and interpolation', () => {
      const tokens = tokenize('Hello {name}!');
      expect(tokens[0].type).toBe(TokenType.TEXT);
      expect(tokens[0].value).toBe('Hello ');
      expect(tokens[1].type).toBe(TokenType.EXPRESSION_START);
      expect(tokens[2].type).toBe(TokenType.EXPRESSION_CONTENT);
      expect(tokens[2].value).toBe('name');
      expect(tokens[3].type).toBe(TokenType.EXPRESSION_END);
      expect(tokens[4].type).toBe(TokenType.TEXT);
      expect(tokens[4].value).toBe('!');
    });

    it('should handle nested braces in expressions', () => {
      const tokens = tokenize('{items.map(i => { return i.name })}');
      const filtered = tokens.filter(t => t.type !== TokenType.WHITESPACE);

      expect(filtered[0].type).toBe(TokenType.EXPRESSION_START);
      expect(filtered[1].type).toBe(TokenType.EXPRESSION_CONTENT);
      expect(filtered[1].value).toContain('items.map');
      expect(filtered[2].type).toBe(TokenType.EXPRESSION_END);
    });
  });

  describe('Comments', () => {
    it('should tokenize HTML comments', () => {
      const tokens = tokenize('<!-- This is a comment -->');
      expect(tokens[0].type).toBe(TokenType.COMMENT);
      expect(tokens[0].value).toBe('<!-- This is a comment -->');
    });
  });

  describe('Slot', () => {
    it('should tokenize slot tag', () => {
      const tokens = tokenize('<slot />');
      const filtered = tokens.filter(t => t.type !== TokenType.WHITESPACE);

      expect(filtered[0].type).toBe(TokenType.TAG_OPEN_START);
      expect(filtered[1].type).toBe(TokenType.KEYWORD_SLOT);
      expect(filtered[1].value).toBe('slot');
      expect(filtered[2].type).toBe(TokenType.TAG_SELF_CLOSE);
    });

    it('should tokenize named slot', () => {
      const tokens = tokenize('<slot name="header" />');
      const filtered = tokens.filter(t => t.type !== TokenType.WHITESPACE);

      expect(filtered[1].type).toBe(TokenType.KEYWORD_SLOT);
      expect(filtered[2].type).toBe(TokenType.IDENTIFIER);
      expect(filtered[2].value).toBe('name');
      expect(filtered[4].type).toBe(TokenType.STRING_LITERAL);
      expect(filtered[4].value).toBe('"header"');
    });
  });

  describe('Complex templates', () => {
    it('should tokenize complete component', () => {
      const template = `
<div class="container">
  <h1>{title}</h1>
  <ul>
    <li w-for={item in items}>
      {item.name}
    </li>
  </ul>
</div>
      `.trim();

      const tokens = tokenize(template);

      // Should have proper structure
      expect(tokens[0].type).toBe(TokenType.TAG_OPEN_START);
      expect(tokens.some(t => t.type === TokenType.DIRECTIVE_FOR)).toBe(true);
      expect(
        tokens.some(
          t =>
            t.type === TokenType.EXPRESSION_CONTENT && t.value.includes('title')
        )
      ).toBe(true);
      expect(tokens[tokens.length - 1].type).toBe(TokenType.EOF);
    });

    it('should handle conditional rendering', () => {
      const template = `
<div w-if={isLoading}>Loading...</div>
<div w-else-if={hasError}>Error</div>
<div w-else>Content</div>
      `.trim();

      const tokens = tokenize(template);
      const directives = tokens.filter(
        t =>
          t.type === TokenType.DIRECTIVE_IF ||
          t.type === TokenType.DIRECTIVE_ELSE_IF ||
          t.type === TokenType.DIRECTIVE_ELSE
      );

      expect(directives).toHaveLength(3);
      expect(directives[0].type).toBe(TokenType.DIRECTIVE_IF);
      expect(directives[1].type).toBe(TokenType.DIRECTIVE_ELSE_IF);
      expect(directives[2].type).toBe(TokenType.DIRECTIVE_ELSE);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty template', () => {
      const tokens = tokenize('');
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe(TokenType.EOF);
    });

    it('should handle whitespace only', () => {
      const tokens = tokenize('   \n  \t  ');
      expect(tokens.some(t => t.type === TokenType.WHITESPACE)).toBe(true);
    });

    it('should handle quoted strings with special characters', () => {
      const tokens = tokenize('<div title="Hello \\"World\\"">');
      const stringToken = tokens.find(t => t.type === TokenType.STRING_LITERAL);
      expect(stringToken?.value).toContain('Hello');
    });
  });
});
