import MagicString from 'magic-string';
import { createHmrBootstrapBlock } from './strings';
import type { MarkerTransformOptions, HmrTransformResult } from './types';
import { analyzeMarker } from './shared';

export const transformWithMarker = (
  options: MarkerTransformOptions
): HmrTransformResult => {
  const analysis = analyzeMarker(options);
  const {
    match,
    targetExports,
    shouldTransform,
    importInsertionPos,
    headerSnippet,
  } = analysis;

  if (!shouldTransform || !match) {
    return { transformed: false, code: options.code, map: null };
  }

  const ms = new MagicString(options.code);
  const transformBlock = createHmrBootstrapBlock(targetExports).trimStart();

  if (headerSnippet) {
    ms.appendLeft(importInsertionPos, headerSnippet);
  }

  ms.overwrite(match.index, match.index + match[0].length, transformBlock);

  return {
    transformed: true,
    code: ms.toString(),
    map: ms.generateMap({ hires: true }),
  };
};
