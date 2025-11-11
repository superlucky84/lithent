export interface MdxWrapResult {
  code: string;
  modified: boolean;
}

export const MDX_WRAP_SENTINEL = '/* __lithentMdxWrapped */';

export const wrapMdxModule = (code: string): MdxWrapResult => {
  const fixedExports = wrapMdxExports(code);
  const exportsModified = fixedExports !== code;

  if (fixedExports.includes(MDX_WRAP_SENTINEL)) {
    return { code: fixedExports, modified: exportsModified };
  }

  const defaultExportIndex = findDefaultMdxExportIndex(fixedExports);

  if (defaultExportIndex < 0) {
    return { code: fixedExports, modified: exportsModified };
  }

  const fnName = 'MDXContent';

  const start = defaultExportIndex;
  const end = start + 'export default function MDXContent'.length;
  let updated = `${fixedExports.slice(0, start)}function ${fnName}${fixedExports.slice(end)}`;

  // Ensure mount import exists
  const hasMountImport = hasNamedImportFrom(updated, 'lithent', 'mount');

  if (!hasMountImport) {
    updated = insertImportString(updated, `import { mount } from 'lithent';\n`);
  }

  const wrapperVar = `__LithentMdxComponent_${fnName}`;
  const wrapperSnippet = `
${MDX_WRAP_SENTINEL}
const ${wrapperVar} = mount((_renew, props) => {
  return () => ${fnName}(props ?? {});
});
export default ${wrapperVar};
`;

  updated = `${updated}${wrapperSnippet}`;

  return { code: updated, modified: true };
};

const findDefaultMdxExportIndex = (source: string): number => {
  const target = 'export default function MDXContent';
  const length = source.length;
  let i = 0;
  let state:
    | 'code'
    | 'single'
    | 'double'
    | 'template'
    | 'lineComment'
    | 'blockComment' = 'code';
  let templateDepth = 0;

  while (i < length) {
    const ch = source[i];
    const next = source[i + 1];

    switch (state) {
      case 'code':
        if (ch === '/') {
          if (next === '/') {
            state = 'lineComment';
            i += 2;
            continue;
          }
          if (next === '*') {
            state = 'blockComment';
            i += 2;
            continue;
          }
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
        if (source.startsWith(target, i)) {
          return i;
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
            break;
          }
          templateDepth--;
          i++;
          break;
        }
        if (ch === '$' && next === '{') {
          templateDepth++;
          i += 2;
          break;
        }
        if (ch === '}') {
          if (templateDepth > 0) {
            templateDepth--;
          }
          i++;
          break;
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
          break;
        }
        i++;
        break;
    }
  }

  return -1;
};

const wrapMdxExports = (code: string): string => {
  const ensureNamedExport = (source: string, fnName: string): string =>
    source.replace(
      new RegExp(`^(\\s*)(?:export\\s+)?function\\s+${fnName}`, 'gm'),
      (match, leading) => {
        if (match.trimStart().startsWith('export ')) {
          return match;
        }
        return `${leading}export function ${fnName}`;
      }
    );

  const ensureDefaultExport = (source: string, fnName: string): string =>
    source.replace(
      new RegExp(`^(\\s*)(?:export\\s+)?function\\s+${fnName}`, 'gm'),
      (match, leading) => {
        if (match.trimStart().startsWith('export default')) {
          return match;
        }
        return `${leading}export default function ${fnName}`;
      }
    );

  const withNamed = ensureNamedExport(code, '_createMdxContent');
  const withDefault = ensureDefaultExport(withNamed, 'MDXContent');
  return withDefault;
};

const insertImportString = (source: string, statement: string): string => {
  const insertPos = findImportInsertionIndex(source);

  if (insertPos >= 0) {
    const needsLeadingNewline =
      insertPos > 0 && source[insertPos - 1] !== '\n';
    const snippet = needsLeadingNewline ? `\n${statement}` : statement;
    return `${source.slice(0, insertPos)}${snippet}${source.slice(insertPos)}`;
  }

  return `${statement}${source}`;
};

type ScannerState =
  | 'code'
  | 'single'
  | 'double'
  | 'template'
  | 'lineComment'
  | 'blockComment';

interface ImportStatement {
  start: number;
  end: number;
  code: string;
}

const getImportStatements = (source: string): ImportStatement[] => {
  const statements: ImportStatement[] = [];
  let i = 0;
  let state: ScannerState = 'code';
  let templateDepth = 0;

  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];

    switch (state) {
      case 'code': {
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
        if (i === 0 && ch === '#' && next === '!') {
          state = 'lineComment';
          i += 2;
          continue;
        }
        if (
          ch === 'i' &&
          isImportKeyword(source, i) &&
          !isDynamicImport(source, i)
        ) {
          const end = findImportStatementEnd(source, i);
          statements.push({
            start: i,
            end,
            code: source.slice(i, end),
          });
          i = end;
          continue;
        }
        i++;
        break;
      }

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

  return statements;
};

const findImportInsertionIndex = (source: string): number => {
  const statements = getImportStatements(source);

  if (!statements.length) {
    return -1;
  }

  return statements[statements.length - 1].end;
};

const hasNamedImportFrom = (
  source: string,
  specifier: string,
  name: string
): boolean => {
  const statements = getImportStatements(source);
  const fromPattern = new RegExp(
    `from\\s+['"]${escapeRegExp(specifier)}['"]`
  );
  const namePattern = new RegExp(`\\b${escapeRegExp(name)}\\b`);

  return statements.some(statement => {
    if (!fromPattern.test(statement.code)) {
      return false;
    }

    const [clause] = statement.code.split(/from\s+/i);
    return namePattern.test(clause);
  });
};

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');


const isImportKeyword = (source: string, index: number): boolean => {
  if (!source.startsWith('import', index)) {
    return false;
  }

  const prev = source[index - 1];
  if (prev && isIdentifierChar(prev)) {
    return false;
  }

  const next = source[index + 'import'.length];
  if (next && isIdentifierChar(next)) {
    return false;
  }

  return true;
};

const isIdentifierChar = (ch: string): boolean => /[A-Za-z0-9_$]/.test(ch);

const isDynamicImport = (source: string, index: number): boolean => {
  const nextChar = source[index + 'import'.length];
  if (!nextChar) {
    return true;
  }
  if (nextChar === '(' || nextChar === '.') {
    return true;
  }
  return false;
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
