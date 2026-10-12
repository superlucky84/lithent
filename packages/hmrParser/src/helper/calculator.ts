import type {
  File,
  ImportDeclaration,
  ExpressionStatement,
} from '@babel/types';

export const collectExportNames = (ast: File): string[] => {
  const names = new Set<string>();

  for (const node of ast.program.body) {
    if (node.type === 'ExportDefaultDeclaration') {
      names.add('default');
    }

    if (node.type === 'ExportNamedDeclaration') {
      const { declaration, specifiers } = node;

      if (declaration) {
        if (declaration.type === 'FunctionDeclaration' && declaration.id) {
          names.add(declaration.id.name);
        } else if (
          declaration.type === 'VariableDeclaration' &&
          declaration.declarations.length
        ) {
          for (const declarator of declaration.declarations) {
            if (declarator.id.type === 'Identifier') {
              names.add(declarator.id.name);
            }
          }
        } else if (declaration.type === 'ClassDeclaration' && declaration.id) {
          names.add(declaration.id.name);
        }
      }

      if (specifiers?.length) {
        specifiers.forEach(specifier => {
          if (
            specifier.type === 'ExportSpecifier' &&
            specifier.exported.type === 'Identifier'
          ) {
            names.add(specifier.exported.name);
          }
        });
      }
    }
  }

  return Array.from(names);
};

export const detectLithentUsage = (ast: File): boolean => {
  const watchedNames = new Set([
    'render',
    'mount',
    'lmount',
    'createApp',
    'createRoot',
  ]);

  for (const node of ast.program.body) {
    if (node.type !== 'ImportDeclaration') continue;
    const source = node.source.value;
    if (typeof source !== 'string') continue;

    if (source === 'lithent') {
      const hasWatched = node.specifiers.some(specifier => {
        if (
          specifier.type === 'ImportSpecifier' &&
          specifier.imported.type === 'Identifier'
        ) {
          const importedName = specifier.imported.name;
          return watchedNames.has(importedName);
        }
        return false;
      });

      if (hasWatched) return true;
    }

    if (source.startsWith('lithent/')) {
      if ((node as ImportDeclaration).importKind === 'type') {
        continue;
      }
      return true;
    }
  }

  return false;
};

export const collectHeaderInsert = (
  ast: File,
  sourceCode: string,
  boundaryImportSpecifier: string,
  tagFunctionImportSpecifier: string
) => {
  const importsToPrepend: string[] = [
    `import { getComponentKey as __lithentGetComponentKey, mountCallback as __lithentMountCallback, componentMap as __lithentComponentMap } from '${tagFunctionImportSpecifier}';`,
  ];
  let hasBoundaryImport = false;
  let lastImportEnd = 0;
  let directiveEnd =
    ast.program.directives.at(-1)?.end ?? ast.program.interpreter?.end ?? 0;
  let firstImportStart: number | null = null;

  for (const node of ast.program.body) {
    if (node.type === 'ImportDeclaration') {
      lastImportEnd = node.end ?? lastImportEnd;
      if (firstImportStart == null) {
        firstImportStart = node.start ?? null;
      }

      if (
        node.source.value === boundaryImportSpecifier &&
        node.importKind !== 'type'
      ) {
        hasBoundaryImport =
          node.specifiers.some(
            specifier =>
              specifier.type === 'ImportSpecifier' &&
              specifier.importKind !== 'type' &&
              specifier.imported.type === 'Identifier' &&
              specifier.imported.name === 'createBoundary' &&
              specifier.local.name === '__lithentCreateBoundary'
          ) || hasBoundaryImport;
      }

      continue;
    }

    if (
      node.type === 'ExpressionStatement' &&
      node.expression.type === 'StringLiteral'
    ) {
      const expressionStatement = node as ExpressionStatement & {
        directive?: string;
      };
      if (typeof expressionStatement.directive === 'string') {
        directiveEnd = expressionStatement.end ?? directiveEnd;
        continue;
      }
    }

    break;
  }

  if (!hasBoundaryImport) {
    importsToPrepend.push(
      `import { createBoundary as __lithentCreateBoundary } from '${boundaryImportSpecifier}';`
    );
  }

  // Note: We don't add TagFunction import anymore since:
  // 1. In enforce:'post', esbuild already removed type imports
  // 2. The type is only used for TypeScript casting, not at runtime
  // 3. Adding "import type" in post-transform breaks browser execution

  const importInsertionPos = firstImportStart ?? directiveEnd ?? 0;
  const blockInsertionPos = lastImportEnd || directiveEnd || 0;

  let snippet = '';
  if (importsToPrepend.length) {
    const precedingChar =
      importInsertionPos > 0 ? sourceCode[importInsertionPos - 1] : undefined;
    const needsLeadingNewline =
      importInsertionPos > 0 && precedingChar !== '\n';
    snippet += needsLeadingNewline ? '\n' : '';
    snippet += importsToPrepend.join('\n');
    snippet += '\n';
  }

  return { importInsertionPos, blockInsertionPos, headerSnippet: snippet };
};
