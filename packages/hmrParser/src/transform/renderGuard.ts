import MagicString from 'magic-string';
import type { File, Node, CallExpression } from '@babel/types';
import { VISITOR_KEYS, isFunction } from '@babel/types';

export const wrapRenderCalls = (
  ms: MagicString,
  ast: File,
  _code: string,
  importSpecifier = 'lithent'
): boolean => {
  const renderers = new Set<string>();
  const namespaces = new Set<string>();
  for (const node of ast.program.body) {
    if (
      node.type !== 'ImportDeclaration' ||
      node.importKind === 'type' ||
      node.source.value !== importSpecifier
    )
      continue;
    for (const specifier of node.specifiers) {
      if (specifier.type === 'ImportNamespaceSpecifier')
        namespaces.add(specifier.local.name);
      if (
        specifier.type === 'ImportSpecifier' &&
        specifier.importKind !== 'type' &&
        specifier.imported.type === 'Identifier' &&
        specifier.imported.name === 'render'
      )
        renderers.add(specifier.local.name);
    }
  }
  const calls: CallExpression[] = [];
  const visit = (node: Node): void => {
    // A render inside a function can mount several independent applications.
    // Guard only module-level mounts that run again when Vite evaluates it.
    if (isFunction(node)) return;
    if (node.type === 'CallExpression') {
      const callee = node.callee;
      if (
        (callee.type === 'Identifier' && renderers.has(callee.name)) ||
        (callee.type === 'MemberExpression' &&
          !callee.computed &&
          callee.object.type === 'Identifier' &&
          namespaces.has(callee.object.name) &&
          callee.property.type === 'Identifier' &&
          callee.property.name === 'render')
      ) {
        calls.push(node);
        return;
      }
    }
    for (const key of VISITOR_KEYS[node.type] ?? []) {
      const value = (node as any)[key];
      if (Array.isArray(value))
        value.forEach(child => {
          if (child?.type) visit(child);
        });
      else if (value?.type) visit(value);
    }
  };
  visit(ast);
  calls
    .sort((a, b) => a.start! - b.start!)
    .forEach((node, id) => {
      ms.appendLeft(node.start!, `__lithentRenderOnce(${id}, () => `);
      ms.appendRight(node.end!, ')');
    });
  return Boolean(calls.length);
};
