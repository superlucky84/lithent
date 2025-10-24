import MagicString from 'magic-string';
import type { File } from '@babel/types';
import MagicString from 'magic-string';
import type { File } from '@babel/types';
import { collectComponentMounts } from '../../utils/ast/componentCollector';

export const stitchComponentRegistration = (
  ms: MagicString,
  ast: File,
  code: string,
  importInsertionPos: number
) => {
  const mounts = collectComponentMounts(ast, code);

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
    ms.appendLeft(
      importInsertionPos,
      `import { ${joined} } from 'lithent';\n`
    );
  }

  for (const mount of mounts) {
    const { insertPos, propsExpression } = mount;
    const unregisterBlock = `
    const compKey = getComponentKey();
    const unregister = compKey ? counterBoundary.register(compKey) : null;
    if (unregister) {
      mountCallback(() => () => unregister());
    }
`;
    ms.appendLeft(insertPos, unregisterBlock);
  }
};
