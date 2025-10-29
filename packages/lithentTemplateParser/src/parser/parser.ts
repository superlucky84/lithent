import { Token, TokenType } from './tokens';
import {
  RootNode,
  TemplateNode,
  AttributeNode,
  DirectiveNode,
  createRootNode,
  createElementNode,
  createTextNode,
  createInterpolationNode,
  createCommentNode,
  createAttributeNode,
  createDirectiveIfNode,
  createDirectiveElseIfNode,
  createDirectiveElseNode,
  createDirectiveForNode,
  createFragmentNode,
} from './ast';

/**
 * Parser for Lithent templates
 * Converts token stream into AST
 */
export class Parser {
  private tokens: Token[];
  private position: number = 0;

  constructor(tokens: Token[]) {
    // Filter out whitespace tokens for easier parsing
    this.tokens = tokens.filter(t => t.type !== TokenType.WHITESPACE);
  }

  /**
   * Parse tokens into AST
   */
  public parse(): RootNode {
    const children: TemplateNode[] = [];

    while (!this.isEOF()) {
      const node = this.parseTemplateNode();
      if (node) {
        children.push(node);
      }
    }

    const start =
      children.length > 0
        ? children[0].start
        : { line: 1, column: 1, offset: 0 };
    const end =
      children.length > 0
        ? children[children.length - 1].end
        : { line: 1, column: 1, offset: 0 };

    return createRootNode(children, start, end);
  }

  /**
   * Parse a single template node
   */
  private parseTemplateNode(): TemplateNode | null {
    const token = this.peek();

    switch (token.type) {
      case TokenType.TAG_OPEN_START:
        return this.parseElement();
      case TokenType.FRAGMENT_OPEN:
        return this.parseFragment();
      case TokenType.TEXT:
        return this.parseText();
      case TokenType.EXPRESSION_START:
        return this.parseInterpolation();
      case TokenType.COMMENT:
        return this.parseComment();
      case TokenType.TAG_CLOSE_START:
        // Unexpected closing tag - skip it
        this.advance();
        return null;
      case TokenType.FRAGMENT_CLOSE:
        this.advance();
        return null;
      case TokenType.EOF:
        return null;
      default:
        this.advance();
        return null;
    }
  }

  /**
   * Parse fragment node
   */
  private parseFragment(): TemplateNode | null {
    const start = this.peek().start;
    this.expect(TokenType.FRAGMENT_OPEN);

    const children: TemplateNode[] = [];

    while (!this.isEOF() && !this.check(TokenType.FRAGMENT_CLOSE)) {
      const child = this.parseTemplateNode();
      if (child) {
        children.push(child);
      }
    }

    if (this.check(TokenType.FRAGMENT_CLOSE)) {
      const closeToken = this.expect(TokenType.FRAGMENT_CLOSE);
      return createFragmentNode(children, start, closeToken.end);
    }

    throw new Error(
      `Unclosed fragment starting at line ${start.line}, column ${start.column}`
    );
  }

  /**
   * Parse element
   */
  private parseElement(): TemplateNode | null {
    const start = this.peek().start;

    // Consume <
    this.expect(TokenType.TAG_OPEN_START);

    // Get tag name
    const tagToken = this.peek();
    if (tagToken.type !== TokenType.IDENTIFIER) {
      throw new Error(
        `Expected tag name at line ${tagToken.start.line}, column ${tagToken.start.column}`
      );
    }

    const tag = tagToken.value;
    this.advance();

    // Parse attributes and directives
    const { attributes, directives } = this.parseAttributesAndDirectives();

    // Check for self-closing tag
    if (this.check(TokenType.TAG_SELF_CLOSE)) {
      const end = this.peek().end;
      this.advance(); // consume />
      return createElementNode(
        tag,
        attributes,
        directives,
        [],
        true,
        start,
        end
      );
    }

    // Consume >
    this.expect(TokenType.TAG_OPEN_END);

    // Parse children (if not self-closing)
    const children: TemplateNode[] = [];

    while (!this.isEOF() && !this.check(TokenType.TAG_CLOSE_START)) {
      const child = this.parseTemplateNode();
      if (child) {
        children.push(child);
      }
    }

    // Parse closing tag
    if (this.check(TokenType.TAG_CLOSE_START)) {
      this.advance(); // consume </

      const closeTagToken = this.peek();
      if (closeTagToken.type !== TokenType.IDENTIFIER) {
        throw new Error(
          `Expected closing tag name at line ${closeTagToken.start.line}, column ${closeTagToken.start.column}`
        );
      }

      const closeTag = closeTagToken.value;
      if (closeTag !== tag) {
        throw new Error(
          `Mismatched closing tag: expected </${tag}> but got </${closeTag}> at line ${closeTagToken.start.line}`
        );
      }

      this.advance(); // consume tag name

      const end = this.peek().end;
      this.expect(TokenType.TAG_OPEN_END); // consume >

      return createElementNode(
        tag,
        attributes,
        directives,
        children,
        false,
        start,
        end
      );
    }

    // No closing tag found
    const end = children.length > 0 ? children[children.length - 1].end : start;
    return createElementNode(
      tag,
      attributes,
      directives,
      children,
      false,
      start,
      end
    );
  }

  /**
   * Parse attributes and directives
   */
  private parseAttributesAndDirectives(): {
    attributes: AttributeNode[];
    directives: DirectiveNode[];
  } {
    const attributes: AttributeNode[] = [];
    const directives: DirectiveNode[] = [];

    while (
      !this.isEOF() &&
      !this.check(TokenType.TAG_OPEN_END) &&
      !this.check(TokenType.TAG_SELF_CLOSE)
    ) {
      const token = this.peek();

      // Check for directives
      if (
        token.type === TokenType.DIRECTIVE_IF ||
        token.type === TokenType.DIRECTIVE_ELSE_IF ||
        token.type === TokenType.DIRECTIVE_ELSE ||
        token.type === TokenType.DIRECTIVE_FOR
      ) {
        const directive = this.parseDirective();
        if (directive) {
          directives.push(directive);
        }
      } else if (
        token.type === TokenType.IDENTIFIER ||
        token.type === TokenType.KEYWORD_REF
      ) {
        const attribute = this.parseAttribute();
        if (attribute) {
          attributes.push(attribute);
        }
      } else {
        // Unexpected token, skip it
        this.advance();
      }
    }

    return { attributes, directives };
  }

  /**
   * Parse attribute
   */
  private parseAttribute(): AttributeNode | null {
    const start = this.peek().start;
    const nameToken = this.advance();
    const name = nameToken.value;

    // Check for = sign
    if (!this.check(TokenType.ATTRIBUTE_EQUALS)) {
      // Attribute without value (e.g., disabled, checked)
      return createAttributeNode(name, null, false, start, nameToken.end);
    }

    this.advance(); // consume =

    // Parse attribute value
    const valueToken = this.peek();
    let value: string | { expression: string };
    let isDynamic = false;
    let end = valueToken.end;

    if (valueToken.type === TokenType.STRING_LITERAL) {
      // Static string value
      value = valueToken.value.slice(1, -1); // Remove quotes
      this.advance();
    } else if (valueToken.type === TokenType.EXPRESSION_START) {
      // Dynamic expression value
      this.advance(); // consume {

      const exprToken = this.peek();
      if (exprToken.type === TokenType.EXPRESSION_CONTENT) {
        value = { expression: exprToken.value.trim() };
        isDynamic = true;
        this.advance();
      } else {
        value = { expression: '' };
        isDynamic = true;
      }

      if (this.check(TokenType.EXPRESSION_END)) {
        end = this.peek().end;
        this.advance(); // consume }
      }
    } else {
      // Unexpected token
      return createAttributeNode(name, null, false, start, nameToken.end);
    }

    return createAttributeNode(name, value, isDynamic, start, end);
  }

  /**
   * Parse directive
   */
  private parseDirective(): DirectiveNode | null {
    const start = this.peek().start;
    const directiveToken = this.advance();

    switch (directiveToken.type) {
      case TokenType.DIRECTIVE_IF:
      case TokenType.DIRECTIVE_ELSE_IF: {
        this.expect(TokenType.ATTRIBUTE_EQUALS);
        this.expect(TokenType.EXPRESSION_START);

        const exprToken = this.peek();
        let condition = '';

        if (exprToken.type === TokenType.EXPRESSION_CONTENT) {
          condition = exprToken.value.trim();
          this.advance();
        }

        const end = this.peek().end;
        this.expect(TokenType.EXPRESSION_END);

        return directiveToken.type === TokenType.DIRECTIVE_IF
          ? createDirectiveIfNode(condition, start, end)
          : createDirectiveElseIfNode(condition, start, end);
      }

      case TokenType.DIRECTIVE_ELSE: {
        const end = directiveToken.end;
        return createDirectiveElseNode(start, end);
      }

      case TokenType.DIRECTIVE_FOR: {
        this.expect(TokenType.ATTRIBUTE_EQUALS);
        this.expect(TokenType.EXPRESSION_START);

        const exprToken = this.peek();
        let expression = '';

        if (exprToken.type === TokenType.EXPRESSION_CONTENT) {
          expression = exprToken.value.trim();
          this.advance();
        }

        const end = this.peek().end;
        this.expect(TokenType.EXPRESSION_END);

        // Parse for expression: "item in list" or "(item, index) in list"
        const { item, index, list } = this.parseForExpression(expression);

        return createDirectiveForNode(item, list, index, start, end);
      }

      default:
        return null;
    }
  }

  /**
   * Parse l-for expression
   */
  private parseForExpression(expression: string): {
    item: string;
    index?: string;
    list: string;
  } {
    const identifier = '[A-Za-z_$][\\w$]*';
    const withParenRegex = new RegExp(
      `^\\s*\\(\\s*(${identifier})\\s*,\\s*(${identifier})\\s*\\)\\s+in\\s+([\\s\\S]+)$`
    );
    const simpleRegex = new RegExp(
      `^\\s*(${identifier})\\s+in\\s+([\\s\\S]+)$`
    );

    // Match pattern: "(item, index) in list" or "item in list"
    const withParenMatch = expression.match(withParenRegex);
    if (withParenMatch) {
      return {
        item: withParenMatch[1],
        index: withParenMatch[2],
        list: withParenMatch[3].trim(),
      };
    }

    const simpleMatch = expression.match(simpleRegex);
    if (simpleMatch) {
      return {
        item: simpleMatch[1],
        list: simpleMatch[2].trim(),
      };
    }

    // Fallback
    return {
      item: 'item',
      list: expression,
    };
  }

  /**
   * Parse text node
   */
  private parseText(): TemplateNode | null {
    const token = this.advance();
    return createTextNode(token.value, token.start, token.end);
  }

  /**
   * Parse interpolation node
   */
  private parseInterpolation(): TemplateNode | null {
    const start = this.peek().start;

    this.expect(TokenType.EXPRESSION_START);

    const exprToken = this.peek();
    let expression = '';

    if (exprToken.type === TokenType.EXPRESSION_CONTENT) {
      expression = exprToken.value.trim();
      this.advance();
    }

    const end = this.peek().end;
    this.expect(TokenType.EXPRESSION_END);

    return createInterpolationNode(expression, start, end);
  }

  /**
   * Parse comment node
   */
  private parseComment(): TemplateNode | null {
    const token = this.advance();
    // Extract content between <!-- and -->
    const content = token.value.replace(/^<!--\s*|\s*-->$/g, '');
    return createCommentNode(content, token.start, token.end);
  }

  /**
   * Peek at current token without consuming
   */
  private peek(): Token {
    return this.tokens[this.position];
  }

  /**
   * Advance to next token and return current
   */
  private advance(): Token {
    const token = this.tokens[this.position];
    this.position++;
    return token;
  }

  /**
   * Check if current token matches type
   */
  private check(type: TokenType): boolean {
    if (this.isEOF()) return false;
    return this.peek().type === type;
  }

  /**
   * Expect a token of specific type, throw error if not found
   */
  private expect(type: TokenType): Token {
    const token = this.peek();
    if (token.type !== type) {
      throw new Error(
        `Expected token ${type} but got ${token.type} at line ${token.start.line}, column ${token.start.column}`
      );
    }
    return this.advance();
  }

  /**
   * Check if we've reached EOF
   */
  private isEOF(): boolean {
    return (
      this.position >= this.tokens.length || this.peek().type === TokenType.EOF
    );
  }
}

/**
 * Parse template string into AST
 */
export function parse(tokens: Token[]): RootNode {
  const parser = new Parser(tokens);
  return parser.parse();
}
