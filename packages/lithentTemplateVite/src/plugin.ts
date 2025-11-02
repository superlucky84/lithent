import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Plugin, PluginOption, ResolvedConfig, UserConfig } from 'vite';
import { normalizePath, transformWithEsbuild } from 'vite';
import { transformDocument } from '@lithent/lithent-template-parser';

type LoaderValue = 'js' | 'jsx' | 'ts' | 'tsx' | 'json' | 'css';
type LoaderMap = Record<string, LoaderValue>;

export interface LithentTemplateViteOptions {
  include?: RegExp | RegExp[];
  extensions?: string[];
  extensionLoaders?: Record<string, LoaderValue>;
}

const DEFAULT_EXTENSIONS = ['.ljsx', '.ltsx'] as const;

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeExtension = (ext: string): string =>
  ext.startsWith('.') ? ext : `.${ext}`;

const resolveExtensions = (extensions?: string[]): string[] => {
  const base =
    extensions && extensions.length > 0
      ? extensions
      : Array.from(DEFAULT_EXTENSIONS);
  const normalized = base.map(normalizeExtension);
  return Array.from(new Set(normalized));
};

const inferLoader = (ext: string): LoaderValue => {
  if (ext.endsWith('tsx') || ext.endsWith('ts')) {
    return 'ts';
  }
  if (ext.endsWith('jsx')) {
    return 'js';
  }
  return 'js';
};

const toRegExpArray = (
  value: RegExp | RegExp[] | undefined,
  fallback: RegExp[]
): RegExp[] => {
  if (!value) {
    return fallback;
  }
  return Array.isArray(value) ? value : [value];
};

const shouldProcess = (patterns: RegExp[], filePath: string): boolean => {
  return patterns.some(pattern => pattern.test(filePath));
};

const extractOriginalPath = (
  id: string,
  extensions: string[]
): string | null => {
  const [filepath, query] = id.split('?', 2);
  if (query) {
    const params = new URLSearchParams(query);
    const original = params.get(VIRTUAL_QUERY);
    if (original) {
      return normalizePath(original);
    }
  }
  if (filepath && matchExtension(filepath, extensions)) {
    return normalizePath(filepath);
  }
  return null;
};

const matchExtension = (
  filePath: string,
  extensions: string[]
): string | null => {
  return extensions.find(ext => filePath.endsWith(ext)) ?? null;
};

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

const mergeLoaderMap = (
  original: LoaderMap | undefined,
  additions: LoaderMap
): LoaderMap => {
  return {
    ...(original ?? {}),
    ...additions,
  };
};

const VIRTUAL_QUERY = 'lithent:original';

export function lithentTemplateVite(
  options: LithentTemplateViteOptions = {}
): PluginOption {
  const extensions = resolveExtensions(options.extensions);
  const extensionLoaders: LoaderMap = extensions.reduce((acc, ext) => {
    const loader = options.extensionLoaders?.[ext] ?? inferLoader(ext);
    acc[ext] = loader;
    return acc;
  }, {} as LoaderMap);
  const defaultInclude = extensions.map(
    ext => new RegExp(`${escapeRegExp(ext)}$`)
  );
  const includePatterns = toRegExpArray(options.include, defaultInclude);
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
            extensions
          ),
        },
        optimizeDeps: {
          extensions: mergeExtensions(
            userConfig.optimizeDeps?.extensions,
            extensions
          ),
          esbuildOptions: {
            ...(userConfig.optimizeDeps?.esbuildOptions ?? {}),
            loader: mergeLoaderMap(
              typeof userConfig.optimizeDeps?.esbuildOptions?.loader ===
                'object'
                ? (userConfig.optimizeDeps?.esbuildOptions?.loader as LoaderMap)
                : undefined,
              extensionLoaders
            ),
          },
        },
      };
    },
    configResolved(resolved) {
      config = resolved;
    },
    async resolveId(source, importer, options) {
      const ext = matchExtension(source, extensions);
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
      const originalPath = extractOriginalPath(id, extensions);
      if (!originalPath) {
        return null;
      }

      const ext = matchExtension(originalPath, extensions);
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

      const loader = extensionLoaders[ext] ?? inferLoader(ext);
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
