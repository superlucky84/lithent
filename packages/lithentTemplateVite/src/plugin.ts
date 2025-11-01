import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Plugin, PluginOption, ResolvedConfig, UserConfig } from 'vite';
import { normalizePath, transformWithEsbuild } from 'vite';
import { transformDocument } from '@lithent/lithent-template-parser';

export interface LithentTemplateViteOptions {
  include?: RegExp | RegExp[];
}

const DEFAULT_INCLUDE = [/\.ljsx$/, /\.ltsx$/];
const LITHENT_EXTENSIONS = ['.ljsx', '.ltsx'] as const;
type LithentExtension = (typeof LITHENT_EXTENSIONS)[number];

const toRegExpArray = (value?: RegExp | RegExp[]): RegExp[] => {
  if (!value) {
    return DEFAULT_INCLUDE;
  }
  return Array.isArray(value) ? value : [value];
};

const EXTENSION_LOADERS: Record<LithentExtension, 'js' | 'ts'> = {
  '.ljsx': 'js',
  '.ltsx': 'ts',
};

const VIRTUAL_QUERY = 'lithent:original';

const mergeExtensions = (
  original: string[] | undefined,
  additions: readonly string[]
): string[] => {
  const set = new Set(original ?? []);
  for (const ext of additions) {
    set.add(ext);
  }
  return Array.from(set);
};

type LoaderValue = 'js' | 'jsx' | 'ts' | 'tsx' | 'json' | 'css';
type LoaderMap = Record<string, LoaderValue>;

const mergeLoaderMap = (original?: LoaderMap): LoaderMap => {
  return {
    ...(original ?? {}),
    '.ljsx': 'js',
    '.ltsx': 'ts',
  };
};

const toLithentExtension = (filePath: string): LithentExtension | null => {
  return LITHENT_EXTENSIONS.find(ext => filePath.endsWith(ext)) ?? null;
};

const shouldProcess = (patterns: RegExp[], filePath: string): boolean => {
  return patterns.some(pattern => pattern.test(filePath));
};

const extractOriginalPath = (id: string): string | null => {
  const [filepath, query] = id.split('?', 2);
  if (query) {
    const params = new URLSearchParams(query);
    const original = params.get(VIRTUAL_QUERY);
    if (original) {
      return normalizePath(original);
    }
  }
  if (filepath && toLithentExtension(filepath)) {
    return normalizePath(filepath);
  }
  return null;
};

export function lithentTemplateVite(
  options: LithentTemplateViteOptions = {}
): PluginOption {
  const includePatterns = toRegExpArray(options.include);
  let config: ResolvedConfig | undefined;

  const createVirtualId = (originalPath: string): string => {
    const query = new URLSearchParams({
      [VIRTUAL_QUERY]: originalPath,
    });
    return `${originalPath}?${query.toString()}`;
  };

  const templatePlugin: Plugin = {
    name: 'lithent:template-vite',
    enforce: 'pre',
    config(userConfig: UserConfig) {
      return {
        resolve: {
          extensions: mergeExtensions(
            userConfig.resolve?.extensions,
            LITHENT_EXTENSIONS
          ),
        },
        optimizeDeps: {
          extensions: mergeExtensions(
            userConfig.optimizeDeps?.extensions,
            LITHENT_EXTENSIONS
          ),
          esbuildOptions: {
            ...(userConfig.optimizeDeps?.esbuildOptions ?? {}),
            loader: mergeLoaderMap(
              userConfig.optimizeDeps?.esbuildOptions?.loader
            ),
          },
        },
      };
    },
    configResolved(resolved) {
      config = resolved;
    },
    async resolveId(source, importer, options) {
      const ext = toLithentExtension(source);
      if (!ext) {
        return null;
      }

      const rootDir = config?.root ?? process.cwd();
      let resolvedPath: string | undefined;

      if (typeof this.resolve === 'function') {
        const resolved = await this.resolve(source, importer, {
          skipSelf: true,
          ...options,
        });
        if (resolved?.id) {
          resolvedPath = resolved.id;
        }
      }

      if (!resolvedPath) {
        if (path.isAbsolute(source)) {
          resolvedPath = source;
        } else if (source.startsWith('/')) {
          resolvedPath = path.join(rootDir, source.slice(1));
        } else if (
          importer &&
          (source.startsWith('./') || source.startsWith('../'))
        ) {
          resolvedPath = path.resolve(path.dirname(importer), source);
        } else {
          resolvedPath = path.resolve(rootDir, source);
        }
      }

      resolvedPath = normalizePath(resolvedPath);

      if (!shouldProcess(includePatterns, resolvedPath)) {
        return null;
      }

      return createVirtualId(resolvedPath);
    },
    async load(id) {
      const originalPath = extractOriginalPath(id);
      if (!originalPath) {
        return null;
      }

      const ext = toLithentExtension(originalPath);
      if (!ext) {
        return null;
      }

      this.addWatchFile(originalPath);

      const raw = await readFile(originalPath, 'utf-8');
      const result = transformDocument(raw, {
        source: originalPath,
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
            `[@lithent/lithent-template-vite] Failed to compile template in ${originalPath}${location}: ${error.message}`
          );
        }
      }

      const loader = EXTENSION_LOADERS[ext];
      const transformedCode = result.transformed ? result.code : raw;
      const esbuildResult = await transformWithEsbuild(
        transformedCode,
        originalPath,
        {
          loader,
          sourcemap: config?.command === 'build',
          sourcefile: originalPath,
        }
      );

      return {
        code: esbuildResult.code,
        map: esbuildResult.map ?? null,
      };
    },
  };

  return [templatePlugin];
}

export default lithentTemplateVite;
