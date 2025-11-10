import MagicString from 'magic-string';
import type { MountInfo } from '../utils/ast/componentCollector';

export const stitchComponentRegistration = (
  ms: MagicString,
  mounts: MountInfo[],
  code: string,
  importInsertionPos: number
) => {
  if (!mounts.length) return;

  const importStatements = extractImportStatements(code);
  const needsMountCallback = !hasNamedImport(importStatements, 'mountCallback');
  const needsGetComponentKey = !hasNamedImport(
    importStatements,
    'getComponentKey'
  );

  if (needsMountCallback || needsGetComponentKey) {
    const pieces: string[] = [];
    if (needsMountCallback) {
      pieces.push('mountCallback');
    }
    if (needsGetComponentKey) {
      pieces.push('getComponentKey');
    }

    const joined = pieces.join(', ');
    ms.appendLeft(importInsertionPos, `import { ${joined} } from 'lithent';\n`);
  }

  for (const mount of mounts) {
    const { insertPos, componentName, declarationEnd } = mount;
    const unregisterBlock = `
    const compKey = getComponentKey();
    const unregister = compKey ? counterBoundary.register(compKey) : null;
    if (unregister) {
      mountCallback(() => () => unregister());
    }
`;
    ms.appendLeft(insertPos, unregisterBlock);

    if (componentName) {
      const hotStoreVar = `__lithentHotComponent_${componentName}`;
      const storeSnippet = `
const ${hotStoreVar} = ${componentName};
if (__lithentModuleHotStore) {
  __lithentModuleHotStore["${componentName}"] = ${hotStoreVar};
}
`;
      ms.appendRight(declarationEnd, storeSnippet);
    }
  }
};

type ScannerState =
  | 'code'
  | 'single'
  | 'double'
  | 'template'
  | 'lineComment'
  | 'blockComment';

const extractImportStatements = (source: string): string[] => {
  const imports: string[] = [];
  let i = 0;
  let state: ScannerState = 'code';
  let templateDepth = 0;

  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];

    switch (state) {
      case 'code':
        if (ch === '/' && next === '/') {
          state = 'lineComment';
          i += 2;
          continue;
        }
        if (ch === '/' && next === '*') {
          state = 'blockComment';
          i += 2;
          continue;
        }
        if (ch === "'") {
          state = 'single';
          i++;
          continue;
        }
        if (ch === '"') {
          state = 'double';
          i++;
          continue;
        }
        if (ch === '`') {
          state = 'template';
          templateDepth = 0;
          i++;
          continue;
        }
        if (
          ch === 'i' &&
          isImportKeyword(source, i) &&
          !isDynamicImport(source, i)
        ) {
          const end = findImportStatementEnd(source, i);
          imports.push(source.slice(i, end));
          i = end;
          continue;
        }
        i++;
        break;

      case 'single':
        if (ch === '\\') {
          i += 2;
          continue;
        }
        if (ch === "'") {
          state = 'code';
        }
        i++;
        break;

      case 'double':
        if (ch === '\\') {
          i += 2;
          continue;
        }
        if (ch === '"') {
          state = 'code';
        }
        i++;
        break;

      case 'template':
        if (ch === '\\') {
          i += 2;
          continue;
        }
        if (ch === '`') {
          if (templateDepth === 0) {
            state = 'code';
            i++;
            continue;
          }
          templateDepth--;
          i++;
          continue;
        }
        if (ch === '$' && next === '{') {
          templateDepth++;
          i += 2;
          continue;
        }
        if (ch === '}' && templateDepth > 0) {
          templateDepth--;
        }
        i++;
        break;

      case 'lineComment':
        if (ch === '\n') {
          state = 'code';
        }
        i++;
        break;

      case 'blockComment':
        if (ch === '*' && next === '/') {
          state = 'code';
          i += 2;
          continue;
        }
        i++;
        break;
    }
  }

  return imports;
};

const hasNamedImport = (imports: string[], name: string): boolean => {
  const pattern = new RegExp(`\\b${escapeRegExp(name)}\\b`);
  return imports.some(statement => {
    const [clause] = statement.split(/from\s+/i);
    return pattern.test(clause);
  });
};

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isImportKeyword = (source: string, index: number): boolean => {
  if (!source.startsWith('import', index)) {
    return false;
  }

  const prev = source[index - 1];
  if (prev && /\w/.test(prev)) {
    return false;
  }

  const next = source[index + 'import'.length];
  if (next && /\w/.test(next)) {
    return false;
  }

  return true;
};

const isDynamicImport = (source: string, index: number): boolean => {
  const nextChar = source[index + 'import'.length];
  return nextChar === '(' || nextChar === '.';
};

const findImportStatementEnd = (source: string, start: number): number => {
  let i = start;
  let state: ScannerState = 'code';

  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];

    switch (state) {
      case 'code':
        if (ch === ';') {
          return i + 1;
        }
        if (ch === '/' && next === '/') {
          state = 'lineComment';
          i += 2;
          continue;
        }
        if (ch === '/' && next === '*') {
          state = 'blockComment';
          i += 2;
          continue;
        }
        if (ch === "'") {
          state = 'single';
          i++;
          continue;
        }
        if (ch === '"') {
          state = 'double';
          i++;
          continue;
        }
        if (ch === '`') {
          state = 'template';
          i++;
          continue;
        }
        if (ch === '\n' && source[i + 1] === '\n') {
          return i + 1;
        }
        i++;
        break;

      case 'single':
        if (ch === '\\') {
          i += 2;
          continue;
        }
        if (ch === "'") {
          state = 'code';
        }
        i++;
        break;

      case 'double':
        if (ch === '\\') {
          i += 2;
          continue;
        }
        if (ch === '"') {
          state = 'code';
        }
        i++;
        break;

      case 'template':
        if (ch === '\\') {
          i += 2;
          continue;
        }
        if (ch === '`') {
          state = 'code';
        }
        i++;
        break;

      case 'lineComment':
        if (ch === '\n') {
          state = 'code';
        }
        i++;
        break;

      case 'blockComment':
        if (ch === '*' && next === '/') {
          state = 'code';
          i += 2;
          continue;
        }
        i++;
        break;
    }
  }

  return source.length;
};
