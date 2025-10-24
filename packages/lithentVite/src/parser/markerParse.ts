import MagicString from 'magic-string';
import { createHmrBootstrapBlock } from './strings';
import type { MarkerTransformOptions, HmrTransformResult } from './types';
import { analyzeMarker } from './shared';
import { stitchComponentRegistration } from './transform/componentRegister';
import { collectComponentMounts } from '../utils/ast/componentCollector';

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

  const mounts = collectComponentMounts(analysis.ast, options.code);
  const componentNames = Array.from(
    new Set(
      mounts
        .map(mount => mount.componentName)
        .filter((name): name is string => !!name)
    )
  );

  const ms = new MagicString(options.code);
  const transformBlock = createHmrBootstrapBlock(
    targetExports,
    componentNames
  ).trimStart();

  if (headerSnippet) {
    ms.appendLeft(importInsertionPos, headerSnippet);
  }

  const precedingChar =
    match.index > 0 ? options.code[match.index - 1] : undefined;
  const needsLeadingNewline = match.index > 0 && precedingChar !== '\n';
  const followingChar = options.code[match.index + match[0].length] ?? null;
  const trailingNewline = followingChar === '\n' ? '\n' : '\n\n';
  const blockSnippet = `${needsLeadingNewline ? '\n' : ''}${transformBlock}${trailingNewline}`;

  ms.overwrite(match.index, match.index + match[0].length, blockSnippet);

  stitchComponentRegistration(ms, mounts, options.code, importInsertionPos);

  return {
    transformed: true,
    code: ms.toString(),
    map: ms.generateMap({ hires: true }),
  };
};
