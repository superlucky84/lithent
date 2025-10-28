import { tokenize } from './parser/lexer';
import { parse } from './parser/parser';
import { transform, TransformOptions } from './transform';
import { generate, GenerateOptions } from './codegen';

/**
 * Compile a Lithent template to JavaScript code
 */
export function compile(
  template: string,
  options?: CompileOptions
): CompileResult {
  try {
    // 1. Tokenize
    const tokens = tokenize(template);

    // 2. Parse
    const ast = parse(tokens);

    // 3. Transform
    const transformedAst = transform(ast, options?.transform);

    // 4. Generate
    const code = generate(transformedAst, options?.generate);

    return {
      code,
      ast: transformedAst,
      errors: [],
    };
  } catch (error) {
    return {
      code: '',
      ast: null,
      errors: [
        {
          message: error instanceof Error ? error.message : String(error),
          line: 0,
          column: 0,
        },
      ],
    };
  }
}

export interface CompileOptions {
  transform?: TransformOptions;
  generate?: GenerateOptions;
}

export interface CompileResult {
  code: string;
  ast: any;
  errors: CompileError[];
}

export interface CompileError {
  message: string;
  line: number;
  column: number;
}

// Re-export all modules
export * from './parser/tokens';
export * from './parser/lexer';
export * from './parser/parser';
export * from './parser/ast';
export * from './transform';
export * from './codegen';
