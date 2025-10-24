import MagicString from 'magic-string';
import { createHmrBootstrapBlock } from './strings';
import type { BaseTransformOptions, HmrTransformResult } from './types';
import { analyzeNoMarker } from './shared';
import { stitchComponentRegistration } from './transform/componentRegister';

export const transformWithoutMarker = (
  options: BaseTransformOptions
): HmrTransformResult => {
  const analysis = analyzeNoMarker(options);
  const {
    targetExports,
    shouldTransform,
    importInsertionPos,
    blockInsertionPos,
    headerSnippet,
    ast,
  } = analysis;

  if (!shouldTransform) {
    return { transformed: false, code: options.code, map: null };
  }

  const ms = new MagicString(options.code);
  const transformBlock = createHmrBootstrapBlock(targetExports).trimStart();

  const blockPrecedingChar =
    blockInsertionPos > 0 ? options.code[blockInsertionPos - 1] : undefined;
  const needsLeadingNewlineForBlock =
    blockInsertionPos > 0 && blockPrecedingChar !== '\n';
  const blockSnippet = `${needsLeadingNewlineForBlock ? '\n' : ''}${transformBlock}\n\n`;

  if (!headerSnippet && !blockSnippet.trim().length) {
    return { transformed: false, code: options.code, map: null };
  }

  if (headerSnippet) {
    if (blockInsertionPos === importInsertionPos) {
      ms.appendLeft(importInsertionPos, `${headerSnippet}${blockSnippet}`);
    } else {
      ms.appendLeft(importInsertionPos, headerSnippet);
      ms.appendLeft(blockInsertionPos, blockSnippet);
    }
  } else {
    ms.appendLeft(blockInsertionPos, blockSnippet);
  }

  stitchComponentRegistration(ms, ast, options.code, importInsertionPos);

  return {
    transformed: true,
    code: ms.toString(),
    map: ms.generateMap({ hires: true }),
  };
};
