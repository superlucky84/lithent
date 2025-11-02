import MagicString, { type SourceMap } from 'magic-string';
import { compile, type CompileError, type CompileOptions } from '../compiler';
import { scanTemplates, type TemplateMatch } from './scan';

export interface DocumentTransformOptions {
  /**
   * Include original source name in generated source map.
   */
  source?: string;
  /**
   * Emit a source map when true.
   */
  generateSourceMap?: boolean;
  /**
   * Forwarded compile options for each template block.
   */
  compileOptions?: CompileOptions;
}

export interface DocumentTransformError {
  match: TemplateMatch;
  error: CompileError;
}

export interface DocumentTransformResult {
  code: string;
  map: SourceMap | null;
  /**
   * `true` when at least one replacement succeeded.
   */
  transformed: boolean;
  /**
   * Errors produced while compiling templates.
   */
  errors: DocumentTransformError[];
  /**
   * All template matches discovered in the source.
   */
  matches: TemplateMatch[];
}

export const transformDocument = (
  source: string,
  options: DocumentTransformOptions = {}
): DocumentTransformResult => {
  const matches = scanTemplates(source);
  if (matches.length === 0) {
    return {
      code: source,
      map: null,
      transformed: false,
      errors: [],
      matches: [],
    };
  }

  const ms = new MagicString(source);
  const errors: DocumentTransformError[] = [];
  let transformed = false;

  for (const match of matches) {
    const result = compile(match.snippet, options.compileOptions);
    if (result.errors.length > 0 || !result.code) {
      for (const error of result.errors) {
        errors.push({ match, error });
      }
      continue;
    }

    ms.overwrite(match.start, match.end, result.code);
    transformed = true;
  }

  if (!transformed) {
    return {
      code: source,
      map: null,
      transformed: false,
      errors,
      matches,
    };
  }

  const code = ms.toString();
  let map: SourceMap | null = null;

  if (options.generateSourceMap) {
    const mapConfig = options.source
      ? { source: options.source, hires: true }
      : { hires: true };
    map = ms.generateMap(mapConfig);
  }

  return {
    code,
    map,
    transformed: true,
    errors,
    matches,
  };
};

export { scanTemplates };
export type { TemplateMatch };
