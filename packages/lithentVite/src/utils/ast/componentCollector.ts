import type {
  File,
  Node,
  CallExpression,
  Identifier,
  ObjectPattern,
  ArrayPattern,
} from '@babel/types';

type MountInfo = {
  insertPos: number;
  propsExpression: string;
};

const isMountCall = (node: Node): node is CallExpression =>
  node.type === 'CallExpression' &&
  node.callee.type === 'Identifier' &&
  node.callee.name === 'mount';

const sliceWithoutType = (code: string, node: Node & { typeAnnotation?: Node | null }): string => {
  const start = node.start ?? 0;
  const end = node.typeAnnotation?.start ?? node.end ?? 0;
  return code.slice(start, end);
};

const extractPropsExpression = (
  propsParam: Identifier | ObjectPattern | ArrayPattern | undefined,
  code: string
): string => {
  if (!propsParam) {
    return 'props';
  }

  switch (propsParam.type) {
    case 'Identifier':
      return propsParam.name;
    case 'ObjectPattern':
    case 'ArrayPattern':
      return sliceWithoutType(code, propsParam);
    default:
      return 'props';
  }
};

export const collectComponentMounts = (ast: File, code: string): MountInfo[] => {
  const results: MountInfo[] = [];

  const inspectDeclaration = (node: any) => {
    if (node.type === 'VariableDeclaration' && node.declarations.length === 1) {
      const declaration = node.declarations[0];
      if (
        declaration.init &&
        isMountCall(declaration.init) &&
        declaration.init.arguments.length > 0
      ) {
        const firstArg = declaration.init.arguments[0];
        if (
          firstArg.type === 'ArrowFunctionExpression' &&
          firstArg.body.type === 'BlockStatement'
        ) {
          const block = firstArg.body;
          const propsParam = firstArg.params[1] as
            | Identifier
            | ObjectPattern
            | ArrayPattern
            | undefined;
          const propsExpression = extractPropsExpression(propsParam, code);
          const insertPos =
            block.body.length > 0
              ? block.body[0].start ?? block.start ?? 0
              : block.start ?? 0;

          results.push({ insertPos, propsExpression });
        }
      }
    }
  };

  for (const statement of ast.program.body) {
    if (statement.type === 'VariableDeclaration') {
      inspectDeclaration(statement);
      continue;
    }

    if (
      statement.type === 'ExportNamedDeclaration' &&
      statement.declaration &&
      statement.declaration.type === 'VariableDeclaration'
    ) {
      inspectDeclaration(statement.declaration);
    }
  }

  return results;
};
