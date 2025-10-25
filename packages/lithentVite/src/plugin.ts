import type { PluginOption, ResolvedConfig } from 'vite';
import {
  transformWithHmr,
  shouldSkipTransform,
  type MarkerTransformOptions,
} from './parser';

export interface LithentVitePluginOptions {
  include?: RegExp | RegExp[];
  boundaryMarker?: string;
  createBoundaryImport?: string;
  tagFunctionImport?: string;
  devtoolsInProd?: boolean;
  jsxImportSource?: string;
}

export const DEFAULT_BOUNDARY_MARKER = '/* lithent:hmr-boundary */';

const toRegExpArray = (value: RegExp | RegExp[] | undefined): RegExp[] => {
  if (!value) {
    return [/\.([cm]?[tj]sx?)$/];
  }
  return Array.isArray(value) ? value : [value];
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const lithentVitePlugin = (
  options: LithentVitePluginOptions = {}
): PluginOption => {
  const includePatterns = toRegExpArray(options.include);
  const boundaryMarker = options.boundaryMarker ?? DEFAULT_BOUNDARY_MARKER;
  const boundaryImportSpecifier =
    options.createBoundaryImport ?? 'lithent/devHelper';
  const tagFunctionImportSpecifier = options.tagFunctionImport ?? 'lithent';
  const jsxImportSource = options.jsxImportSource ?? 'lithent';

  const markerPattern =
    boundaryMarker === DEFAULT_BOUNDARY_MARKER
      ? '/\\*\\s*lithent:hmr-boundary(?:\\s+([A-Za-z0-9_,\\s]+))?\\s*\\*/'
      : `${escapeRegExp(boundaryMarker)}(?:\\s+([A-Za-z0-9_,\\s]+))?`;

  const markerRegex = new RegExp(markerPattern);

  let config: ResolvedConfig;
  let devToolsEnabled: boolean | undefined = options.devtoolsInProd;

  return {
    name: 'lithent:hmr-boundary',
    enforce: 'pre',
    config() {
      return {
        build: {
          rollupOptions: {
            onwarn(warning, warn) {
              // Silence Rollup's module-level directive warnings re:"use client".
              // They're likely to come from `node_modules` and won't be actionable.
              if (
                warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
                warning.message.includes('use client')
              ) {
                return;
              }
              // ESBuild seemingly doesn't include mappings for directives, causing
              // Rollup to emit warnings about missing source locations. This too is
              // likely to come from `node_modules` and won't be actionable.
              // evanw/esbuild#3548
              if (
                warning.code === 'SOURCEMAP_ERROR' &&
                warning.message.includes('resolve original location') &&
                warning.pos === 0
              ) {
                return;
              }
              warn(warning);
            },
          },
        },
        esbuild: {
          jsx: 'automatic',
          jsxImportSource,
        },
        optimizeDeps: {
          include: [
            'lithent',
            'lithent/jsx-runtime',
            'lithent/jsx-dev-runtime',
          ],
        },
      };
    },
    configResolved(resolvedConfig) {
      config = resolvedConfig;
      devToolsEnabled =
        devToolsEnabled ?? (!config.isProduction || options.devtoolsInProd);
    },
    transform(code, id) {
      // Skip transform in production unless devtoolsInProd is enabled
      if (!devToolsEnabled) {
        return null;
      }

      if (!includePatterns.some(pattern => pattern.test(id))) {
        return null;
      }

      if (shouldSkipTransform(code)) {
        return null;
      }

      let result;
      try {
        result = transformWithHmr({
          code,
          markerRegex,
          boundaryImportSpecifier,
          tagFunctionImportSpecifier,
        } satisfies MarkerTransformOptions);
      } catch (error) {
        this.warn(
          `[@lithent/lithent-vite] ${id} 파싱 실패: ${(error as Error).message}`
        );
        return null;
      }

      if (!result.transformed) {
        return null;
      }

      return {
        code: result.code,
        map: result.map ?? undefined,
      };
    },
  };
};

export default lithentVitePlugin;
