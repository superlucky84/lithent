/**
 * Token types for Lithent template lexer
 */
export enum TokenType {
  // Tag tokens
  TAG_OPEN_START = 'TAG_OPEN_START', // <
  TAG_OPEN_END = 'TAG_OPEN_END', // >
  TAG_CLOSE_START = 'TAG_CLOSE_START', // </
  TAG_SELF_CLOSE = 'TAG_SELF_CLOSE', // />

  // Identifiers and values
  IDENTIFIER = 'IDENTIFIER', // tag names, attribute names
  ATTRIBUTE_EQUALS = 'ATTRIBUTE_EQUALS', // =
  STRING_LITERAL = 'STRING_LITERAL', // "..." or '...'

  // Expressions
  EXPRESSION_START = 'EXPRESSION_START', // {
  EXPRESSION_END = 'EXPRESSION_END', // }
  EXPRESSION_CONTENT = 'EXPRESSION_CONTENT', // JavaScript code inside {}

  // Directives
  DIRECTIVE_IF = 'DIRECTIVE_IF', // l-if
  DIRECTIVE_ELSE_IF = 'DIRECTIVE_ELSE_IF', // l-else-if
  DIRECTIVE_ELSE = 'DIRECTIVE_ELSE', // l-else
  DIRECTIVE_FOR = 'DIRECTIVE_FOR', // l-for

  // Fragments
  FRAGMENT_OPEN = 'FRAGMENT_OPEN', // <>
  FRAGMENT_CLOSE = 'FRAGMENT_CLOSE', // </>

  KEYWORD_REF = 'KEYWORD_REF', // ref

  // Text and comments
  TEXT = 'TEXT', // text content
  COMMENT = 'COMMENT', // <!-- ... -->

  // Whitespace
  WHITESPACE = 'WHITESPACE',

  // End of file
  EOF = 'EOF',
}

/**
 * Position information for error reporting
 */
export interface Position {
  line: number;
  column: number;
  offset: number;
}

/**
 * Token interface
 */
export interface Token {
  type: TokenType;
  value: string;
  start: Position;
  end: Position;
}

/**
 * Create a position object
 */
export function createPosition(
  line: number,
  column: number,
  offset: number
): Position {
  return { line, column, offset };
}

/**
 * Create a token
 */
export function createToken(
  type: TokenType,
  value: string,
  start: Position,
  end: Position
): Token {
  return { type, value, start, end };
}
