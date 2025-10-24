import type { PluginOption } from 'vite';
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

  const markerPattern =
    boundaryMarker === DEFAULT_BOUNDARY_MARKER
      ? '/\\*\\s*lithent:hmr-boundary(?:\\s+([A-Za-z0-9_,\\s]+))?\\s*\\*/'
      : `${escapeRegExp(boundaryMarker)}(?:\\s+([A-Za-z0-9_,\\s]+))?`;

  const markerRegex = new RegExp(markerPattern);

  return {
    name: 'lithent:hmr-boundary',
    enforce: 'pre',
    transform(code, id) {
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
