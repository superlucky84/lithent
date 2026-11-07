import { VISITOR_KEYS } from '@babel/types';
import type { File, Node } from '@babel/types';

export type MountInfo = {
  componentName: string;
  declarationEnd: number;
  start: number;
  end: number;
  declaration: boolean;
};

// Only recognize runtime calls imported from Lithent, not similarly named helpers.
export const collectComponentMounts = (
  ast: File,
  _code: string,
  importSpecifier = 'lithent'
): MountInfo[] => {
  const factories = new Set<string>();
  const renderers = new Set<string>();
  const namespaces = new Map<string, string>();
  const defaultNames = new Set<string>();
  for (const statement of ast.program.body) {
    if (statement.type === 'ExportDefaultDeclaration') {
      const declaration = statement.declaration;
      if (declaration.type === 'Identifier') defaultNames.add(declaration.name);
      if (declaration.type === 'FunctionDeclaration' && declaration.id)
        defaultNames.add(declaration.id.name);
    }
    if (
      statement.type !== 'ImportDeclaration' ||
      statement.importKind === 'type'
    )
      continue;
    for (const specifier of statement.specifiers) {
      if (specifier.type === 'ImportNamespaceSpecifier') {
        namespaces.set(specifier.local.name, statement.source.value);
        continue;
      }
      if (
        specifier.type !== 'ImportSpecifier' ||
        specifier.importKind === 'type'
      )
        continue;
      const imported =
        specifier.imported.type === 'Identifier'
          ? specifier.imported.name
          : specifier.imported.value;
      if (statement.source.value === importSpecifier) {
        if (imported === 'mount' || imported === 'lmount')
          factories.add(specifier.local.name);
        if (imported === 'h') renderers.add(specifier.local.name);
      }
      if (
        [
          `${importSpecifier}/jsx-runtime`,
          `${importSpecifier}/jsx-dev-runtime`,
        ].includes(statement.source.value) &&
        ['jsx', 'jsxs', 'jsxDEV'].includes(imported)
      )
        renderers.add(specifier.local.name);
    }
  }

  const unwrap = (node: Node): Node => {
    if (
      node.type === 'TSAsExpression' ||
      node.type === 'TSSatisfiesExpression' ||
      node.type === 'TSNonNullExpression'
    )
      return unwrap(node.expression);
    return node;
  };
  const isRuntimeCall = (node: Node, factory: boolean): boolean => {
    if (node.type !== 'CallExpression') return false;
    const callee = node.callee;
    if (callee.type === 'Identifier')
      return (factory ? factories : renderers).has(callee.name);
    if (
      callee.type !== 'MemberExpression' ||
      callee.object.type !== 'Identifier'
    )
      return false;
    const source = namespaces.get(callee.object.name);
    const name =
      !callee.computed && callee.property.type === 'Identifier'
        ? callee.property.name
        : callee.property.type === 'StringLiteral'
          ? callee.property.value
          : '';
    return factory
      ? source === importSpecifier && ['mount', 'lmount'].includes(name)
      : (source === importSpecifier && name === 'h') ||
          ([
            `${importSpecifier}/jsx-runtime`,
            `${importSpecifier}/jsx-dev-runtime`,
          ].includes(source || '') &&
            ['jsx', 'jsxs', 'jsxDEV'].includes(name));
  };
  const visitChildren = (node: Node, visit: (node: Node) => boolean): boolean =>
    (VISITOR_KEYS[node.type] ?? []).some(key => {
      const value = (node as any)[key];
      return Array.isArray(value)
        ? value.some(child => child?.type && visit(child))
        : value?.type && visit(value);
    });
  const isFunction = (node: Node) =>
    node.type === 'ArrowFunctionExpression' ||
    node.type === 'FunctionExpression' ||
    node.type === 'FunctionDeclaration';

  // Follow returned values, not JSX used only for side effects or in unrelated
  // nested functions. Render callbacks in a returned list are part of its output.
  const returnsRender = (node: Node): boolean => {
    if (!isFunction(node)) return false;
    const fn = node as import('@babel/types').Function;
    if (fn.async || fn.generator) return false;
    const locals = new Map<string, Node>();
    const returns: Node[] = [];
    const scan = (child: Node): boolean => {
      if (isFunction(child)) return false;
      if (
        child.type === 'VariableDeclarator' &&
        child.id.type === 'Identifier' &&
        child.init
      )
        locals.set(child.id.name, child.init);
      if (child.type === 'ReturnStatement' && child.argument)
        returns.push(child.argument);
      visitChildren(child, scan);
      return false;
    };
    if (fn.body.type === 'BlockStatement') scan(fn.body);
    else returns.push(fn.body);
    const visiting = new Set<string>();
    const output = (raw: Node): boolean => {
      const child = unwrap(raw);
      if (
        child.type === 'JSXElement' ||
        child.type === 'JSXFragment' ||
        child.type === 'NullLiteral' ||
        (child.type === 'BooleanLiteral' && !child.value)
      )
        return true;
      if (isRuntimeCall(child, false)) return true;
      if (child.type === 'Identifier') {
        if (child.name === 'undefined') return true;
        if (
          fn.params[1]?.type === 'Identifier' &&
          child.name === fn.params[1].name
        )
          return true;
        const local = locals.get(child.name);
        if (!local || visiting.has(child.name)) return false;
        visiting.add(child.name);
        const result = output(local);
        visiting.delete(child.name);
        return result;
      }
      if (isFunction(child)) return false;
      if (child.type === 'CallExpression') {
        return child.arguments.some(
          argument => isFunction(argument) && returnsRender(argument)
        );
      }
      if (child.type === 'ConditionalExpression')
        return output(child.consequent) || output(child.alternate);
      if (child.type === 'LogicalExpression')
        return output(child.left) || output(child.right);
      if (child.type === 'ArrayExpression')
        return (
          !child.elements.length ||
          child.elements.some(item => item && output(item))
        );
      return false;
    };
    return returns.some(output);
  };

  const isComponent = (raw: Node, name: string): boolean => {
    const node = unwrap(raw);
    if (isRuntimeCall(node, true)) return true;
    if (!/^[A-Z]/.test(name) && name !== 'default' && !defaultNames.has(name))
      return false;
    return returnsRender(node);
  };

  const results: MountInfo[] = [];
  const add = (node: Node, name: string, end: number, declaration = false) => {
    if (!isComponent(node, name)) return;
    results.push({
      componentName: name,
      declarationEnd: end,
      start: node.start!,
      end: node.end!,
      declaration,
    });
  };
  for (const statement of ast.program.body) {
    const node =
      statement.type === 'ExportNamedDeclaration' ||
      statement.type === 'ExportDefaultDeclaration'
        ? statement.declaration
        : statement;
    if (!node) continue;
    if (node.type === 'VariableDeclaration') {
      for (const declaration of node.declarations) {
        if (declaration.id.type === 'Identifier' && declaration.init) {
          add(declaration.init, declaration.id.name, statement.end!);
        }
      }
    } else if (node.type === 'FunctionDeclaration' && node.id) {
      add(node, node.id.name, statement.end!, true);
    } else if (statement.type === 'ExportDefaultDeclaration') {
      add(node, 'default', statement.end!);
    }
  }
  return results;
};
