import MagicString from 'magic-string';
import { createHmrBootstrapBlock } from './strings';
import type { MarkerTransformOptions, HmrTransformResult } from './types';
import { analyzeMarker } from './shared';
import { stitchComponentRegistration } from './transform/componentRegister';
import { wrapRenderCalls } from './transform/renderGuard';
import { collectComponentMounts } from './utils/ast/componentCollector';
import { createExportSnapshot } from './transform/exportSnapshot';

export const transformWithMarker = (
  options: MarkerTransformOptions
): HmrTransformResult => {
  const analysis = analyzeMarker(options);
  const {
    match,
    targetExports,
    shouldTransform,
    importInsertionPos,
    blockInsertionPos,
    headerSnippet,
  } = analysis;

  if (!shouldTransform || !match) {
    return { transformed: false, code: options.code, map: null };
  }

  const mounts = collectComponentMounts(
    analysis.ast,
    options.code,
    options.tagFunctionImportSpecifier
  );
  const componentNames = Array.from(
    new Set(
      mounts
        .map(mount => mount.componentName)
        .filter((name): name is string => !!name)
    )
  );

  const ms = new MagicString(options.code);
  if (mounts.length)
    wrapRenderCalls(
      ms,
      analysis.ast,
      options.code,
      options.tagFunctionImportSpecifier
    );
  const hoisted = stitchComponentRegistration(
    ms,
    mounts,
    options.code,
    importInsertionPos
  );
  const transformBlock = createHmrBootstrapBlock(
    targetExports,
    componentNames
  ).trimStart();

  const precedingChar =
    blockInsertionPos > 0 ? options.code[blockInsertionPos - 1] : undefined;
  const needsLeadingNewline = blockInsertionPos > 0 && precedingChar !== '\n';
  const blockSnippet = `${needsLeadingNewline ? '\n' : ''}${transformBlock}\n${hoisted}\n\n`;
  if (blockInsertionPos === importInsertionPos) {
    ms.appendLeft(importInsertionPos, `${headerSnippet}${blockSnippet}`);
  } else {
    ms.appendLeft(importInsertionPos, headerSnippet);
    ms.appendLeft(blockInsertionPos, blockSnippet);
  }
  ms.overwrite(match.index, match.index + match[0].length, '');
  ms.append(createExportSnapshot(analysis.ast, mounts));

  return {
    transformed: true,
    code: ms.toString(),
    map: ms.generateMap({ hires: true }),
  };
};
