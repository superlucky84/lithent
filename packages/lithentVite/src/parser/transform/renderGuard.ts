import MagicString from 'magic-string';
import type { File, Node, CallExpression } from '@babel/types';
import { VISITOR_KEYS } from '@babel/types';

const collectRenderCalls = (ast: Node, calls: CallExpression[]): void => {
  const visit = (node: Node | null | undefined) => {
    if (!node) return;

    if (
      node.type === 'CallExpression' &&
      node.callee.type === 'Identifier' &&
      node.callee.name === 'render'
    ) {
      calls.push(node as CallExpression);
    }

    const keys = VISITOR_KEYS[node.type] ?? [];
    for (const key of keys) {
      const value = (node as any)[key];
      if (Array.isArray(value)) {
        for (const child of value) {
          if (child && typeof child.type === 'string') {
            visit(child as Node);
          }
        }
      } else if (value && typeof value.type === 'string') {
        visit(value as Node);
      }
    }
  };

  visit(ast);
};

export const wrapRenderCalls = (
  ms: MagicString,
  ast: File,
  code: string
): boolean => {
  const calls: CallExpression[] = [];
  collectRenderCalls(ast, calls);

  if (!calls.length) return false;

  const sorted = calls
    .map(node => ({
      start: node.start ?? 0,
      end: node.end ?? 0,
    }))
    .filter(({ start, end }) => start >= 0 && end > start)
    .sort((a, b) => b.start - a.start);

  for (const { start, end } of sorted) {
    const original = code.slice(start, end);
    ms.overwrite(start, end, `__lithentRenderOnce(() => ${original})`);
  }

  return true;
};
