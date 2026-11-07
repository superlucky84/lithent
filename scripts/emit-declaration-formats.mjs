import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import ts from 'typescript';

/**
 * Emit a CommonJS declaration graph beside the ESM graph. Copying only the
 * entry declaration would leave its dependencies interpreted as ESM. Explicit
 * relative paths also let Node16/NodeNext check the ESM graph without relying
 * on a bundler's extension and directory resolution.
 */
export function emitDeclarationFormats(
  directory,
  { esmTypeImports = [] } = {}
) {
  const walk = dir =>
    readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
      const file = join(dir, entry.name);
      return entry.isDirectory()
        ? walk(file)
        : file.endsWith('.d.ts')
          ? [resolve(file)]
          : [];
    });
  const files = walk(directory);
  const declarations = new Set(files);

  const modulePath = (file, specifier, extension) => {
    if (!specifier.startsWith('.') || specifier.endsWith('.json'))
      return specifier;
    const stem = resolve(
      dirname(file),
      specifier.replace(/(?:\.d\.ts|\.[cm]?js)$/, '')
    );
    const target = [stem + '.d.ts', join(stem, 'index.d.ts')].find(path =>
      declarations.has(path)
    );
    if (!target)
      throw new Error(`Unresolved declaration import: ${file}: ${specifier}`);
    const path = relative(dirname(file), target)
      .split(sep)
      .join('/')
      .replace(/\.d\.ts$/, extension);
    return path.startsWith('.') ? path : './' + path;
  };

  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    const source = ts.createSourceFile(
      file,
      content,
      ts.ScriptTarget.Latest,
      true
    );
    const specifiers = [];
    const visit = node => {
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        specifiers.push(node.moduleSpecifier);
      } else if (
        ts.isImportTypeNode(node) &&
        ts.isLiteralTypeNode(node.argument) &&
        ts.isStringLiteral(node.argument.literal)
      ) {
        specifiers.push(node.argument.literal);
      } else if (
        ts.isExternalModuleReference(node) &&
        node.expression &&
        ts.isStringLiteral(node.expression)
      ) {
        specifiers.push(node.expression);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    const rewrite = extension => {
      let result = content;
      const edits = [];
      if (extension === '.cjs') {
        for (const statement of source.statements) {
          if (
            ts.isImportDeclaration(statement) &&
            statement.importClause?.isTypeOnly &&
            esmTypeImports.includes(statement.moduleSpecifier.text) &&
            !statement.attributes
          ) {
            // Vite exposes its types through the ESM condition, even to CJS
            // plugins. This is a type-only resolution choice, not a runtime import.
            edits.push({
              start: statement.moduleSpecifier.end,
              end: statement.moduleSpecifier.end,
              text: ' with { "resolution-mode": "import" }',
            });
          }
        }
      }
      // Work backwards so replacements preserve the remaining source offsets.
      for (const node of specifiers) {
        edits.push({
          start: node.getStart(source) + 1,
          end: node.end - 1,
          text: modulePath(file, node.text, extension),
        });
      }
      for (const edit of edits.sort((a, b) => b.start - a.start)) {
        result =
          result.slice(0, edit.start) + edit.text + result.slice(edit.end);
      }
      return result;
    };
    writeFileSync(file, rewrite('.js'));
    writeFileSync(file.replace(/\.d\.ts$/, '.d.cts'), rewrite('.cjs'));
  }
  console.log(`[types] emitted ${files.length} ESM/CommonJS declaration pairs`);
}
