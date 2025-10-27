import MagicString from 'magic-string';
import type { MountInfo } from '../utils/ast/componentCollector';

export const stitchComponentRegistration = (
  ms: MagicString,
  mounts: MountInfo[],
  code: string,
  importInsertionPos: number
) => {
  if (!mounts.length) return;

  const needsMountCallback = !/import\s+{[^}]*mountCallback/.test(code);
  const needsGetComponentKey = !/import\s+{[^}]*getComponentKey/.test(code);

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
