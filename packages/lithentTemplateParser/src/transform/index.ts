import { RootNode } from '../parser/ast';
import { transformDirectives } from './directives';
import { optimize, OptimizeOptions } from './optimize';

/**
 * Apply all transformations to the AST
 */
export function transform(
  ast: RootNode,
  options?: TransformOptions
): RootNode {
  let result = ast;

  // Transform directives (group conditionals)
  result = transformDirectives(result);

  // Optimize AST
  if (options?.optimize !== false) {
    result = optimize(result, options?.optimizeOptions);
  }

  return result;
}

export interface TransformOptions {
  optimize?: boolean;
  optimizeOptions?: OptimizeOptions;
}

export { transformDirectives, optimize };
export * from './directives';
export * from './optimize';
