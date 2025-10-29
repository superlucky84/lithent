import {
  Token,
  TokenType,
  Position,
  createPosition,
  createToken,
} from './tokens';

/**
 * Lexer for Lithent templates
 * Converts template string into a stream of tokens
 */
export class Lexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  private tokens: Token[] = [];

  constructor(input: string) {
    this.input = input;
  }

  /**
   * Tokenize the entire input
   */
  public tokenize(): Token[] {
    while (this.position < this.input.length) {
      this.readToken();
    }

    // Add EOF token
    const pos = this.getCurrentPosition();
    this.tokens.push(createToken(TokenType.EOF, '', pos, pos));

    return this.tokens;
  }

  /**
   * Get current position
   */
  private getCurrentPosition(): Position {
    return createPosition(this.line, this.column, this.position);
  }

  /**
   * Peek at character without consuming
   */
  private peek(offset: number = 0): string {
    return this.input[this.position + offset] || '';
  }

  /**
   * Consume and return current character
   */
  private advance(): string {
    const char = this.input[this.position];
    this.position++;

    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }

    return char;
  }

  /**
   * Check if we've reached the end
   */
  private isEOF(): boolean {
    return this.position >= this.input.length;
  }

  /**
   * Read next token
   */
  private readToken(): void {
    const char = this.peek();

    // Check for comments first
    if (char === '<' && this.peek(1) === '!' && this.peek(2) === '-' && this.peek(3) === '-') {
      this.readComment();
      return;
    }

    // Check for tags
    if (char === '<') {
      if (this.peek(1) === '/') {
        this.readCloseTag();
      } else {
        this.readOpenTag();
      }
      return;
    }

    // Check for expressions
    if (char === '{') {
      this.readExpression();
      return;
    }

    // Check for whitespace
    if (this.isWhitespace(char)) {
      this.readWhitespace();
      return;
    }

    // Otherwise it's text content
    this.readText();
  }

  /**
   * Read HTML comment
   */
  private readComment(): void {
    const start = this.getCurrentPosition();
    let value = '';

    // Consume <!--
    value += this.advance() + this.advance() + this.advance() + this.advance();

    // Read until -->
    while (!this.isEOF()) {
      if (this.peek() === '-' && this.peek(1) === '-' && this.peek(2) === '>') {
        value += this.advance() + this.advance() + this.advance();
        break;
      }
      value += this.advance();
    }

    const end = this.getCurrentPosition();
    this.tokens.push(createToken(TokenType.COMMENT, value, start, end));
  }

  /**
   * Read opening tag <
   */
  private readOpenTag(): void {
    const start = this.getCurrentPosition();
    this.advance(); // consume <
    const end = this.getCurrentPosition();
    this.tokens.push(createToken(TokenType.TAG_OPEN_START, '<', start, end));

    // Now read attributes until we hit > or />
    this.readTagContent();
  }

  /**
   * Read closing tag </
   */
  private readCloseTag(): void {
    const start = this.getCurrentPosition();
    this.advance(); // consume <
    this.advance(); // consume /
    const end = this.getCurrentPosition();
    this.tokens.push(createToken(TokenType.TAG_CLOSE_START, '</', start, end));

    // Read tag name
    this.skipWhitespace();
    this.readIdentifier();

    // Read closing >
    this.skipWhitespace();
    if (this.peek() === '>') {
      const start = this.getCurrentPosition();
      this.advance();
      const end = this.getCurrentPosition();
      this.tokens.push(createToken(TokenType.TAG_OPEN_END, '>', start, end));
    }
  }

  /**
   * Read tag content (tag name and attributes)
   */
  private readTagContent(): void {
    this.skipWhitespace();

    // Read tag name
    this.readIdentifier();

    // Read attributes
    while (!this.isEOF()) {
      this.skipWhitespace();

      const char = this.peek();

      // Self-closing tag
      if (char === '/' && this.peek(1) === '>') {
        const start = this.getCurrentPosition();
        this.advance();
        this.advance();
        const end = this.getCurrentPosition();
        this.tokens.push(createToken(TokenType.TAG_SELF_CLOSE, '/>', start, end));
        return;
      }

      // End of opening tag
      if (char === '>') {
        const start = this.getCurrentPosition();
        this.advance();
        const end = this.getCurrentPosition();
        this.tokens.push(createToken(TokenType.TAG_OPEN_END, '>', start, end));
        return;
      }

      // Read attribute
      this.readAttribute();
    }
  }

  /**
   * Read an attribute (name and optional value)
   */
  private readAttribute(): void {
    const identifier = this.readIdentifier();
    if (!identifier) return;

    this.skipWhitespace();

    // Check for = sign
    if (this.peek() === '=') {
      const start = this.getCurrentPosition();
      this.advance();
      const end = this.getCurrentPosition();
      this.tokens.push(createToken(TokenType.ATTRIBUTE_EQUALS, '=', start, end));

      this.skipWhitespace();

      // Read attribute value
      const char = this.peek();
      if (char === '"' || char === "'") {
        this.readStringLiteral();
      } else if (char === '{') {
        this.readExpression();
      }
    }
  }

  /**
   * Read identifier (tag name or attribute name)
   */
  private readIdentifier(): string {
    const start = this.getCurrentPosition();
    let value = '';

    // First character must be letter, underscore, or $ (or : for namespaced attributes)
    const first = this.peek();
    if (this.isIdentifierStart(first)) {
      value += this.advance();
    } else {
      return '';
    }

    // Read rest of identifier
    while (!this.isEOF() && this.isIdentifierPart(this.peek())) {
      value += this.advance();
    }

    const end = this.getCurrentPosition();

    // Check if this is a directive or special keyword
    const tokenType = this.getIdentifierTokenType(value);
    this.tokens.push(createToken(tokenType, value, start, end));

    return value;
  }

  /**
   * Determine token type for identifier
   */
  private getIdentifierTokenType(value: string): TokenType {
    switch (value) {
      case 'w-if':
        return TokenType.DIRECTIVE_IF;
      case 'w-else-if':
        return TokenType.DIRECTIVE_ELSE_IF;
      case 'w-else':
        return TokenType.DIRECTIVE_ELSE;
      case 'w-for':
        return TokenType.DIRECTIVE_FOR;
      case 'slot':
        return TokenType.KEYWORD_SLOT;
      case 'ref':
        return TokenType.KEYWORD_REF;
      default:
        return TokenType.IDENTIFIER;
    }
  }

  /**
   * Read string literal
   */
  private readStringLiteral(): void {
    const start = this.getCurrentPosition();
    const quote = this.advance(); // " or '
    let value = quote;
    let escaped = false;

    while (!this.isEOF()) {
      const char = this.peek();

      if (escaped) {
        value += this.advance();
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        value += this.advance();
        continue;
      }

      if (char === quote) {
        value += this.advance();
        break;
      }

      value += this.advance();
    }

    const end = this.getCurrentPosition();
    this.tokens.push(createToken(TokenType.STRING_LITERAL, value, start, end));
  }

  /**
   * Read expression content inside {}
   */
  private readExpression(): void {
    const startPos = this.getCurrentPosition();
    this.advance(); // consume {
    const openEnd = this.getCurrentPosition();
    this.tokens.push(createToken(TokenType.EXPRESSION_START, '{', startPos, openEnd));

    let value = '';
    let depth = 1;
    let inString: string | null = null;
    let escaped = false;
    let contentStart: Position | null = null;
    let contentEnd: Position = openEnd;

    const consumeChar = (): string => {
      const charStart = this.getCurrentPosition();
      const char = this.advance();
      const charEnd = this.getCurrentPosition();

      value += char;
      if (!contentStart) {
        contentStart = charStart;
      }
      contentEnd = charEnd;

      return char;
    };

    while (!this.isEOF() && depth > 0) {
      const char = this.peek();

      // Handle string literals inside expressions
      if (inString) {
        if (escaped) {
          consumeChar();
          escaped = false;
          continue;
        }
        if (char === '\\') {
          escaped = true;
          consumeChar();
          continue;
        }
        if (char === inString) {
          consumeChar();
          inString = null;
          continue;
        }
        consumeChar();
        continue;
      }

      // Not in string
      if (char === '"' || char === "'" || char === '`') {
        inString = char;
        consumeChar();
        continue;
      }

      if (char === '{') {
        depth++;
        consumeChar();
        continue;
      }

      if (char === '}') {
        depth--;
        if (depth === 0) {
          // End of expression
          if (value.trim()) {
            const start = contentStart ?? openEnd;
            const end = contentEnd;
            this.tokens.push(
              createToken(TokenType.EXPRESSION_CONTENT, value, start, end)
            );
          }

          const closeStart = this.getCurrentPosition();
          this.advance(); // consume }
          const closeEnd = this.getCurrentPosition();
          this.tokens.push(createToken(TokenType.EXPRESSION_END, '}', closeStart, closeEnd));
          return;
        }
        consumeChar();
        continue;
      }

      consumeChar();
    }

    // If we get here, expression wasn't closed properly
    // Still add the content we have
    if (value.trim()) {
      const start = contentStart ?? openEnd;
      const end = contentStart ? contentEnd : this.getCurrentPosition();
      this.tokens.push(
        createToken(TokenType.EXPRESSION_CONTENT, value, start, end)
      );
    }
  }

  /**
   * Read text content
   */
  private readText(): void {
    const start = this.getCurrentPosition();
    let value = '';

    while (!this.isEOF()) {
      const char = this.peek();

      // Stop at tag or expression start
      if (char === '<' || char === '{') {
        break;
      }

      value += this.advance();
    }

    if (value) {
      const end = this.getCurrentPosition();
      this.tokens.push(createToken(TokenType.TEXT, value, start, end));
    }
  }

  /**
   * Read whitespace
   */
  private readWhitespace(): void {
    const start = this.getCurrentPosition();
    let value = '';

    while (!this.isEOF() && this.isWhitespace(this.peek())) {
      value += this.advance();
    }

    const end = this.getCurrentPosition();
    this.tokens.push(createToken(TokenType.WHITESPACE, value, start, end));
  }

  /**
   * Skip whitespace without creating tokens
   */
  private skipWhitespace(): void {
    while (!this.isEOF() && this.isWhitespace(this.peek())) {
      this.advance();
    }
  }

  /**
   * Check if character is whitespace
   */
  private isWhitespace(char: string): boolean {
    return /\s/.test(char);
  }

  /**
   * Check if character can start an identifier
   */
  private isIdentifierStart(char: string): boolean {
    return /[a-zA-Z_$:]/.test(char);
  }

  /**
   * Check if character can be part of an identifier
   */
  private isIdentifierPart(char: string): boolean {
    return /[a-zA-Z0-9_$:-]/.test(char);
  }
}

/**
 * Tokenize a template string
 */
export function tokenize(input: string): Token[] {
  const lexer = new Lexer(input);
  return lexer.tokenize();
}
