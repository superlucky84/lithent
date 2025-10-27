import type { Plugin, PluginOption, ResolvedConfig } from 'vite';
import { transformWithEsbuild } from 'vite';
import {
  transformWithHmr,
  shouldSkipTransform,
  wrapMdxModule,
  type MarkerTransformOptions,
} from '@lithent/hmr-parser';

export interface LithentVitePluginOptions {
  include?: RegExp | RegExp[];
  boundaryMarker?: string;
  createBoundaryImport?: string;
  tagFunctionImport?: string;
  devtoolsInProd?: boolean;
  jsxImportSource?: string;
  wrapMdx?: boolean;
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
  const wrapMdx = options.wrapMdx ?? false;
  const includePatterns = toRegExpArray(
    options.include ??
      (wrapMdx
        ? [/\.([cm]?[tj]sx?)$/i, /\.mdx(?:$|\?)/i]
        : [/\.([cm]?[tj]sx?)$/i])
  );
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

  const plugin: Plugin = {
    name: 'lithent:hmr-boundary',
    enforce: 'post',
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
    async transform(code, id) {
      const [filepath] = id.split('?', 1);
      const isMdxFile = wrapMdx && /\.mdx$/i.test(filepath);

      let workingCode = code;
      let modified = false;

      if (isMdxFile) {
        const wrapResult = wrapMdxModule(workingCode);
        workingCode = wrapResult.code;
        if (wrapResult.modified) {
          modified = true;
        }
      }

      // Skip transform in production unless devtoolsInProd is enabled
      if (!devToolsEnabled) {
        return modified ? { code: workingCode, map: null } : null;
      }

      if (!includePatterns.some(pattern => pattern.test(id))) {
        return modified ? { code: workingCode, map: null } : null;
      }

      if (shouldSkipTransform(workingCode)) {
        return modified ? { code: workingCode, map: null } : null;
      }

      let result;
      try {
        result = transformWithHmr({
          code: workingCode,
          markerRegex,
          boundaryImportSpecifier,
          tagFunctionImportSpecifier,
        } satisfies MarkerTransformOptions);
      } catch (error) {
        this.warn(
          `[@lithent/lithent-vite] ${id} 파싱 실패: ${(error as Error).message}`
        );
        return modified ? { code: workingCode, map: null } : null;
      }

      const shouldReturn = result.transformed || modified;
      if (!shouldReturn) {
        return null;
      }

      let outputCode = result.transformed ? result.code : workingCode;
      let outputMap = result.map ?? null;

      const isTsLike = /\.[cm]?tsx?$/i.test(filepath);
      const isMdxFileForEsbuild = /\.mdx$/i.test(filepath);
      if (isTsLike || isMdxFileForEsbuild) {
        const loader =
          filepath.endsWith('x') || isMdxFileForEsbuild ? 'tsx' : 'ts';
        const buildTarget = config?.build?.target;
        const normalizedTarget =
          typeof buildTarget === 'string' || Array.isArray(buildTarget)
            ? buildTarget
            : undefined;
        const esbuildResult = await transformWithEsbuild(outputCode, filepath, {
          loader,
          jsx: 'automatic',
          jsxImportSource,
          sourcemap: true,
          target: normalizedTarget ?? 'esnext',
        });
        outputCode = esbuildResult.code;
        outputMap = esbuildResult.map || outputMap;
      }

      return {
        code: outputCode,
        map: outputMap ?? undefined,
      };
    },
  };

  return plugin;
};

export default lithentVitePlugin;
