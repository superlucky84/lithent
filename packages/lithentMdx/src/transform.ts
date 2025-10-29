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
  const hasMountImport =
    /import\s+{[^}]*\bmount\b[^}]*}\s+from\s+['"]lithent['"]/.test(updated);

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
  const importRegex = /^(import[\s\S]*?from\s+['"][^'"]+['"]\s*;[ \t]*\n?)/gm;
  let lastMatch: RegExpExecArray | null = null;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(source))) {
    lastMatch = match;
  }

  if (lastMatch) {
    const insertPos = lastMatch.index + lastMatch[0].length;
    return `${source.slice(0, insertPos)}${statement}${source.slice(insertPos)}`;
  }

  return `${statement}${source}`;
};
