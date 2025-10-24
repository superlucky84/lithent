import { parse } from '@babel/parser';
import type { File } from '@babel/types';
import type {
  MarkerTransformOptions,
  BaseTransformOptions,
  MarkerAnalysisResult,
  BaseAnalysisResult,
} from './types';
import {
  collectExportNames,
  detectLithentUsage,
  collectHeaderInsert,
} from './helper/calculator';

const analyzeBase = (
  code: string,
  boundaryImportSpecifier: string,
  tagFunctionImportSpecifier: string
) => {
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
    ranges: true,
  }) as File;

  const inferredExports = collectExportNames(ast);
  const targetExports =
    inferredExports.length > 0 ? inferredExports : ['default'];
  const { importInsertionPos, blockInsertionPos, headerSnippet } =
    collectHeaderInsert(
      ast,
      code,
      boundaryImportSpecifier,
      tagFunctionImportSpecifier
    );

  return {
    ast,
    targetExports,
    importInsertionPos,
    blockInsertionPos,
    headerSnippet,
  } as const;
};

export const analyzeMarker = (
  options: MarkerTransformOptions
): MarkerAnalysisResult => {
  const {
    code,
    markerRegex,
    boundaryImportSpecifier,
    tagFunctionImportSpecifier,
  } = options;

  const {
    ast,
    targetExports,
    importInsertionPos,
    blockInsertionPos,
    headerSnippet,
  } = analyzeBase(code, boundaryImportSpecifier, tagFunctionImportSpecifier);

  const match = markerRegex.exec(code);
  const rawNames = match?.[1]
    ? match[1]
        .split(',')
        .map(token => token.trim())
        .filter(Boolean)
    : [];

  const finalTargets = rawNames.length ? rawNames : targetExports;

  return {
    targetExports: finalTargets,
    shouldTransform: !!match || detectLithentUsage(ast),
    importInsertionPos,
    blockInsertionPos,
    headerSnippet,
    ast,
    match: match ?? null,
  };
};

export const analyzeNoMarker = (
  options: BaseTransformOptions
): BaseAnalysisResult => {
  const { code, boundaryImportSpecifier, tagFunctionImportSpecifier } = options;

  const {
    ast,
    targetExports,
    importInsertionPos,
    blockInsertionPos,
    headerSnippet,
  } = analyzeBase(code, boundaryImportSpecifier, tagFunctionImportSpecifier);

  return {
    targetExports,
    shouldTransform: detectLithentUsage(ast),
    importInsertionPos,
    blockInsertionPos,
    headerSnippet,
    ast,
  };
};

export const shouldSkipTransform = (code: string): boolean =>
  code.includes('__lithentModuleId');
