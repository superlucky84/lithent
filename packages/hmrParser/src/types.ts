import type MagicString from 'magic-string';
import type { File } from '@babel/types';

export interface BaseTransformOptions {
  code: string;
  boundaryImportSpecifier: string;
  tagFunctionImportSpecifier: string;
}

export interface MarkerTransformOptions extends BaseTransformOptions {
  markerRegex: RegExp;
}

export interface BaseAnalysisResult {
  targetExports: string[];
  shouldTransform: boolean;
  importInsertionPos: number;
  blockInsertionPos: number;
  headerSnippet: string;
  ast: File;
}

export interface MarkerAnalysisResult extends BaseAnalysisResult {
  match: RegExpExecArray | null;
}

export interface HmrTransformOptions extends MarkerTransformOptions {}

export interface HmrTransformResult {
  transformed: boolean;
  code: string;
  map: ReturnType<MagicString['generateMap']> | null;
}
