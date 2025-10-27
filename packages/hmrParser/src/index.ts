import { transformWithMarker } from './markerParse';
import { transformWithoutMarker } from './noMarkerParse';
import { analyzeMarker, analyzeNoMarker, shouldSkipTransform } from './shared';
import { wrapMdxModule, MDX_WRAP_SENTINEL } from './transform/mdx';
import type { MdxWrapResult } from './transform/mdx';
import type {
  MarkerTransformOptions,
  BaseTransformOptions,
  HmrTransformResult,
} from './types';

export const transformWithHmr = (
  options: MarkerTransformOptions
): HmrTransformResult => {
  const markerResult = transformWithMarker(options);
  if (markerResult.transformed) {
    return markerResult;
  }

  const baseOptions: BaseTransformOptions = {
    code: options.code,
    boundaryImportSpecifier: options.boundaryImportSpecifier,
    tagFunctionImportSpecifier: options.tagFunctionImportSpecifier,
  };

  return transformWithoutMarker(baseOptions);
};

export { analyzeMarker, analyzeNoMarker, shouldSkipTransform };
export { transformWithMarker, transformWithoutMarker };
export { wrapMdxModule, MDX_WRAP_SENTINEL };
export type { MdxWrapResult };
export type {
  MarkerTransformOptions,
  BaseTransformOptions,
  HmrTransformResult,
} from './types';
