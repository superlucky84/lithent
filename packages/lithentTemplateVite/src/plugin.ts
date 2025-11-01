import type { PluginOption, ResolvedConfig } from 'vite';
import { transformDocument } from '@lithent/lithent-template-parser';

export interface LithentTemplateViteOptions {
  include?: RegExp | RegExp[];
}

const DEFAULT_INCLUDE = [/\.([tj]sx)$/];

const toRegExpArray = (value?: RegExp | RegExp[]): RegExp[] => {
  if (!value) {
    return DEFAULT_INCLUDE;
  }
  return Array.isArray(value) ? value : [value];
};

export function lithentTemplateVite(
  options: LithentTemplateViteOptions = {}
): PluginOption {
  const includePatterns = toRegExpArray(options.include);
  let config: ResolvedConfig | undefined;

  return {
    name: 'lithent:template-vite',
    enforce: 'pre',
    configResolved(resolved) {
      config = resolved;
    },
    transform(code, id) {
      const filePath = id.split('?')[0];
      if (
        filePath.includes('node_modules') ||
        !includePatterns.some(pattern => pattern.test(filePath))
      ) {
        return null;
      }

      const result = transformDocument(code, {
        source: id,
        generateSourceMap: config?.command === 'build',
      });
      const warn = this.warn ? this.warn.bind(this) : console.warn;
      if (result.errors.length > 0) {
        for (const { error } of result.errors) {
          const location =
            error.line || error.column
              ? ` (line ${error.line}, column ${error.column})`
              : '';
          warn(
            `[@lithent/lithent-template-vite] Failed to compile template in ${id}${location}: ${error.message}`
          );
        }
      }

      if (!result.transformed) {
        return null;
      }

      return {
        code: result.code,
        map: result.map,
      };
    },
  };
}

export default lithentTemplateVite;

