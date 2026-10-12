import { getBindingIdentifiers } from '@babel/types';
import type { File } from '@babel/types';
import type { MountInfo } from '../utils/ast/componentCollector';

// Export values must be compared before self-accepting. Importers can keep
// stable component proxies, but need reevaluation when other exports change.
export const createExportSnapshot = (
  ast: File,
  components: MountInfo[]
): string => {
  const bindings = new Map<string, string>();
  let complete = true;
  for (const node of ast.program.body) {
    if (node.type === 'ExportAllDeclaration' && node.exportKind !== 'type')
      complete = false;
    if (node.type === 'ExportDefaultDeclaration') {
      const declaration = node.declaration;
      if (declaration.type === 'Identifier')
        bindings.set('default', declaration.name);
      else if (
        (declaration.type === 'FunctionDeclaration' ||
          declaration.type === 'ClassDeclaration') &&
        declaration.id
      )
        bindings.set('default', declaration.id.name);
      else if (
        components.some(component => component.componentName === 'default')
      )
        bindings.set(
          'default',
          '__lithentCurrentComponents.default?.component'
        );
      else complete = false;
    }
    if (node.type !== 'ExportNamedDeclaration' || node.exportKind === 'type')
      continue;
    if (node.source) {
      complete = false;
      continue;
    }
    const declaration = node.declaration;
    if (declaration?.type === 'VariableDeclaration') {
      for (const declarator of declaration.declarations) {
        for (const name of Object.keys(getBindingIdentifiers(declarator.id)))
          bindings.set(name, name);
      }
    } else if (
      (declaration?.type === 'FunctionDeclaration' ||
        declaration?.type === 'ClassDeclaration') &&
      declaration.id
    ) {
      bindings.set(declaration.id.name, declaration.id.name);
    } else if (
      declaration &&
      declaration.type !== 'TSInterfaceDeclaration' &&
      declaration.type !== 'TSTypeAliasDeclaration'
    ) {
      complete = false;
    }
    for (const specifier of node.specifiers) {
      if (
        specifier.type === 'ExportSpecifier' &&
        specifier.exportKind !== 'type'
      ) {
        const name =
          specifier.exported.type === 'Identifier'
            ? specifier.exported.name
            : specifier.exported.value;
        bindings.set(name, specifier.local.name);
      }
    }
  }
  const snapshot = complete
    ? `{${Array.from(bindings, ([name, local]) => `[${JSON.stringify(name)}]: ${local}`).join(', ')}}`
    : 'null';
  return `\n__lithentExportSnapshot = ${snapshot};\n`;
};
