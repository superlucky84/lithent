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

  const defaultExportRegex = /export\s+default\s+function\s+([A-Za-z0-9_]+)/m;
  const defaultExportMatch = defaultExportRegex.exec(fixedExports);

  if (!defaultExportMatch || defaultExportMatch.index === undefined) {
    return { code: fixedExports, modified: exportsModified };
  }

  const fnName = defaultExportMatch[1];

  const start = defaultExportMatch.index;
  const end = start + defaultExportMatch[0].length;
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
