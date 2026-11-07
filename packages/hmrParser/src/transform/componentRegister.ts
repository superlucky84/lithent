import MagicString from 'magic-string';
import type { MountInfo } from '../utils/ast/componentCollector';

export const stitchComponentRegistration = (
  ms: MagicString,
  mounts: MountInfo[],
  _code: string,
  _importInsertionPos: number
) => {
  const hoisted: string[] = [];
  for (const component of mounts) {
    const name = JSON.stringify(component.componentName);
    if (component.declaration) {
      hoisted.push(
        `${component.componentName} = __lithentWrapComponent(${name}, ${component.componentName});`
      );
    } else {
      ms.appendLeft(component.start, `__lithentWrapComponent(${name}, `);
      ms.appendRight(component.end, ')');
    }
  }
  return hoisted.join('\n');
};
