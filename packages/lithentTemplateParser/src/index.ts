/**
 * Lithent Template Parser
 * A Vue-like template parser for Lithent
 */

export { compile } from './compiler';
export type { CompileOptions, CompileResult, CompileError } from './compiler';

// Export all modules for advanced usage
export * from './parser/tokens';
export * from './parser/lexer';
export * from './parser/parser';
export * from './parser/ast';
export * from './transform';
export * from './codegen';
