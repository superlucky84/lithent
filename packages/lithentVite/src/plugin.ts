import { parse } from '@babel/parser';
import type { File } from '@babel/types';
import MagicString from 'magic-string';
import type { PluginOption } from 'vite';

export interface LithentVitePluginOptions {
  /**
   * File matcher used to decide whether a module participates in Lithent HMR boundary transforms.
   * Defaults to JSX/TSX/JS/TS files.
   */
  include?: RegExp | RegExp[];
  /**
   * Marker comment that signals the plugin to wrap the module with a Lithent HMR boundary.
   */
  boundaryMarker?: string;
  /**
   * Module specifier used when injecting the createBoundary import. Defaults to
   * `lithent/devmodetest/createBoundary`.
   */
  createBoundaryImport?: string;
  /**
   * Module specifier that provides the TagFunction type. Defaults to `lithent`.
   */
  tagFunctionImport?: string;
}

export const DEFAULT_BOUNDARY_MARKER = '/* lithent:hmr-boundary */';

const toRegExpArray = (value: RegExp | RegExp[] | undefined): RegExp[] => {
  if (!value) {
    return [/\.([cm]?[tj]sx?)$/];
  }
  return Array.isArray(value) ? value : [value];
};

const isFileIncluded = (id: string, patterns: RegExp[]): boolean =>
  patterns.some(pattern => pattern.test(id));

const collectExportNames = (ast: File): string[] => {
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

const detectLithentUsage = (ast: File): boolean => {
  const watchedNames = new Set(['render', 'mount', 'createApp', 'createRoot']);

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
          return watchedNames.has(specifier.imported.name);
        }
        return false;
      });

      if (hasWatched) return true;
    }

    if (source.startsWith('lithent/')) {
      return true;
    }
  }

  return false;
};

const collectHeaderInsert = (
  ast: File,
  sourceCode: string,
  boundaryImportSpecifier: string,
  tagFunctionImportSpecifier: string
) => {
  const importsToPrepend: string[] = [];
  let hasBoundaryImport = false;
  let hasTagImport = false;
  let lastImportEnd = 0;
  let directiveEnd = 0;
  let firstImportStart: number | null = null;

  for (const node of ast.program.body) {
    if (node.type === 'ImportDeclaration') {
      lastImportEnd = node.end ?? lastImportEnd;
      if (firstImportStart == null) {
        firstImportStart = node.start ?? null;
      }

      if (node.source.value === boundaryImportSpecifier) {
        hasBoundaryImport = true;
      }

      if (node.source.value === tagFunctionImportSpecifier) {
        const hasTag = node.specifiers.some(specifier => {
          return (
            specifier.type === 'ImportSpecifier' &&
            specifier.imported.type === 'Identifier' &&
            specifier.imported.name === 'TagFunction'
          );
        });

        if (hasTag) {
          hasTagImport = true;
        }
      }

      continue;
    }

    if (
      node.type === 'ExpressionStatement' &&
      node.expression.type === 'StringLiteral' &&
      typeof node.directive === 'string'
    ) {
      directiveEnd = node.end ?? directiveEnd;
      continue;
    }

    break;
  }

  if (!hasBoundaryImport) {
    importsToPrepend.push(
      `import { createBoundary } from '${boundaryImportSpecifier}';`
    );
  }

  if (!hasTagImport) {
    importsToPrepend.push(
      `import type { TagFunction } from '${tagFunctionImportSpecifier}';`
    );
  }

  const importInsertionPos =
    firstImportStart ?? directiveEnd ?? 0;
  const blockInsertionPos = lastImportEnd || directiveEnd || 0;

  let snippet = '';
  if (importsToPrepend.length) {
    const precedingChar =
      importInsertionPos > 0 ? sourceCode[importInsertionPos - 1] : undefined;
    const needsLeadingNewline = importInsertionPos > 0 && precedingChar !== '\n';
    snippet += needsLeadingNewline ? '\n' : '';
    snippet += importsToPrepend.join('\n');
    snippet += '\n';
  }

  return { importInsertionPos, blockInsertionPos, snippet };
};

const shouldSkipTransform = (code: string): boolean =>
  code.includes('__lithentModuleId');

export const lithentVitePlugin = (
  options: LithentVitePluginOptions = {}
): PluginOption => {
  const includePatterns = toRegExpArray(options.include);
  const boundaryMarker = options.boundaryMarker ?? DEFAULT_BOUNDARY_MARKER;
  const boundaryImportSpecifier =
    options.createBoundaryImport ?? 'lithent/devmodetest/createBoundary';
  const tagFunctionImportSpecifier = options.tagFunctionImport ?? 'lithent';

  const escapeRegExp = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const markerPattern =
    boundaryMarker === DEFAULT_BOUNDARY_MARKER
      ? '/\\*\\s*lithent:hmr-boundary(?:\\s+([A-Za-z0-9_,\\s]+))?\\s*\\*/'
      : `${escapeRegExp(boundaryMarker)}(?:\\s+([A-Za-z0-9_,\\s]+))?`;

  const markerRegex = new RegExp(markerPattern);

  return {
    name: 'lithent:hmr-boundary',
    enforce: 'pre',
    transform(code, id) {
      if (!isFileIncluded(id, includePatterns)) {
        return null;
      }

      if (shouldSkipTransform(code)) {
        return null;
      }

      let ast: File;
      try {
        ast = parse(code, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx'],
          ranges: true,
        });
      } catch (error) {
        this.warn(
          `[@lithent/lithent-vite] ${id} 파싱 실패: ${(error as Error).message}`
        );
        return null;
      }

      const match = markerRegex.exec(code);
      const rawNames = match?.[1]
        ? match[1]
            .split(',')
            .map(token => token.trim())
            .filter(Boolean)
        : [];

      const inferredExports = collectExportNames(ast);
      const targetExports =
        rawNames.length > 0
          ? rawNames
          : inferredExports.length > 0
            ? inferredExports
            : ['default'];

      const shouldTransform = !!match || detectLithentUsage(ast);
      if (!shouldTransform) {
        return null;
      }

      const ms = new MagicString(code);
      const { importInsertionPos, blockInsertionPos, snippet } = collectHeaderInsert(
        ast,
        code,
        boundaryImportSpecifier,
        tagFunctionImportSpecifier
      );

      const transformBlock = `
const __lithentModuleId = new URL(import.meta.url).pathname;
const __lithentBoundaryStoreKey = \`__lithent_hmr_boundary__\${__lithentModuleId}\`;
const __lithentDisposeStoreKey = \`__lithent_hmr_dispose__\${__lithentModuleId}\`;
const __lithentGlobalStore =
  typeof globalThis === 'object'
    ? (globalThis as Record<string, unknown>)
    : undefined;

const __lithentEnsureHotData = (): Record<string, unknown> | undefined => {
  if (!import.meta.hot) return undefined;
  try {
    import.meta.hot.data = import.meta.hot.data || {};
    return import.meta.hot.data;
  } catch {
    return undefined;
  }
};

const __lithentHotData = __lithentEnsureHotData();
type __LithentBoundaryController = ReturnType<typeof createBoundary>;

const counterBoundary: __LithentBoundaryController =
  (__lithentHotData?.counterBoundary as __LithentBoundaryController | undefined) ||
  (__lithentGlobalStore?.[__lithentBoundaryStoreKey] as __LithentBoundaryController | undefined) ||
  createBoundary(__lithentModuleId);

if (__lithentHotData) {
  __lithentHotData.counterBoundary = counterBoundary;
}

if (__lithentGlobalStore) {
  __lithentGlobalStore[__lithentBoundaryStoreKey] = counterBoundary;
}

let disposeApp =
  (__lithentHotData?.disposeApp as (() => void) | undefined) ||
  (__lithentGlobalStore?.[__lithentDisposeStoreKey] as (() => void) | undefined);

const __lithentHmrTargets = ${JSON.stringify(targetExports)};

const __lithentSetupHmrHooks = () => {
  if (!import.meta.hot) {
    return;
  }

  import.meta.hot.accept(mod => {
    let applied = false;

    for (const name of __lithentHmrTargets) {
      const nextCtor =
        (name === 'default'
          ? (mod?.default as TagFunction | undefined)
          : (mod?.[name] as TagFunction | undefined));

      if (!nextCtor) {
        import.meta.hot?.invalidate?.();
        return;
      }

      if (counterBoundary.update(nextCtor)) {
        applied = true;
      }
    }

    if (!applied) {
      console.warn(
        '[Lithent HMR] 변경된 경계를 적용하지 못해 전체 리프레시합니다.'
      );
      import.meta.hot?.invalidate?.();
    }
  });

  import.meta.hot.dispose(data => {
    data.counterBoundary = counterBoundary;

    if (disposeApp) {
      data.disposeApp = disposeApp;
    }

    if (__lithentGlobalStore) {
      __lithentGlobalStore[__lithentBoundaryStoreKey] = counterBoundary;

      if (disposeApp) {
        __lithentGlobalStore[__lithentDisposeStoreKey] = disposeApp;
      }
    }
  });
};

__lithentSetupHmrHooks();
`;

      const trimmedBlock = transformBlock.trimStart();

      if (match) {
        if (snippet) {
          ms.appendLeft(importInsertionPos, snippet);
        }

        ms.overwrite(
          match.index,
          match.index + match[0].length,
          trimmedBlock
        );
      } else {
        const blockPrecedingChar =
          blockInsertionPos > 0 ? code[blockInsertionPos - 1] : undefined;
        const needsLeadingNewlineForBlock =
          blockInsertionPos > 0 && blockPrecedingChar !== '\n';
        const blockSnippet = `${needsLeadingNewlineForBlock ? '\n' : ''}${trimmedBlock}\n\n`;

        if (!snippet && !blockSnippet.trim().length) {
          return null;
        }

        if (snippet) {
          if (blockInsertionPos === importInsertionPos) {
            ms.appendLeft(importInsertionPos, `${snippet}${blockSnippet}`);
          } else {
            ms.appendLeft(importInsertionPos, snippet);
            ms.appendLeft(blockInsertionPos, blockSnippet);
          }
        } else {
          ms.appendLeft(blockInsertionPos, blockSnippet);
        }
      }

      // TODO(next): insert counterBoundary.register/mountCallback into detected component bodies
      return {
        code: ms.toString(),
        map: ms.generateMap({ hires: true }),
      };
    },
  };
};

export default lithentVitePlugin;
