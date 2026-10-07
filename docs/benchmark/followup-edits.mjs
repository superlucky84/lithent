function replace(code, before, after) {
  if (!code.includes(before))
    throw Error(`Missing transformation target: ${before.slice(0, 100)}`);
  return code.replace(before, after);
}
export const edits = {
  walk(code, id) {
    if (id.endsWith('/src/hook/internal/unmount.ts')) {
      code = replace(
        code,
        '  recursiveRunUnmount(newWDom);\n};\n\nconst recursiveRunUnmount = (wDom: WDom) => {\n  (wDom.children || []).forEach(item => {\n    const childComKey = item.compKey;\n    if (childComKey) {\n      runUnmountQueueFromWDom(item);\n    } else {\n      recursiveRunUnmount(item);\n    }\n  });\n};',
        `  const children = newWDom.children;
  if (children) {
    for (let i = 0, length = children.length; i < length; i++) {
      runUnmountQueueFromWDom(children[i]);
    }
  }
};`
      );
    }
    if (id.endsWith('/src/render.ts')) {
      code = replace(
        code,
        `  (originalWDom.children || []).forEach((childItem: WDom) => {
    recursiveRemoveEvent(childItem);
  });`,
        `  const children = originalWDom.children;
  if (children) {
    for (let i = 0, length = children.length; i < length; i++) {
      recursiveRemoveEvent(children[i]);
    }
  }`
      );
    }
    return code;
  },
  empty(code, id) {
    if (id.endsWith('/src/hook/internal/useUpdate.ts'))
      code = replace(
        code,
        'if (newWDom.ctor && queue) {',
        'if (newWDom.ctor && queue.length) {'
      );
    if (id.endsWith('/src/hook/mountCallback.ts'))
      code = replace(code, 'if (mountQueue) {', 'if (mountQueue.length) {');
    if (id.endsWith('/src/utils/universalRef.ts'))
      code = replace(
        code,
        'if (subInfo) {\n    subInfo.umts.forEach',
        'if (subInfo && subInfo.umts.length) {\n    subInfo.umts.forEach'
      );
    return code;
  },
  slots(code, id) {
    if (id.endsWith('/src/diff.ts'))
      code = replace(
        code,
        'children.splice(0, children.length);',
        'children.length = 0;'
      );
    return code;
  },
  propsGuard(code, id) {
    if (id.endsWith('/src/render.ts'))
      code = replace(
        code,
        '  const originalProps = oldProps || {};',
        '  if (!props && !oldProps) return;\n  const originalProps = oldProps || {};'
      );
    return code;
  },
  propsLoop(code, id) {
    if (id.endsWith('/src/diff.ts'))
      code = replace(
        code,
        '    keys(props).forEach(key => key in infoProps || delete props[key]);',
        '    for (const key in props) {\n      if (!(key in infoProps)) delete props[key];\n    }'
      );
    return code;
  },
  identity(code, id) {
    if (!id.endsWith('/src/diff.ts')) return code;
    return replace(
      code,
      `) =>
  remakeNewWDom(
    newWDom,
    checkSameWDomWithOriginal[getWDomType(newWDom)](newWDom, originalWDom),
    originalWDom
  );`,
      `) => {
  if (originalWDom?.type && newWDom === originalWDom) {
    originalWDom.nr = 'N';
    return originalWDom;
  }
  return remakeNewWDom(
    newWDom,
    checkSameWDomWithOriginal[getWDomType(newWDom)](newWDom, originalWDom),
    originalWDom
  );
};`
    );
  },
  leaf(code, id) {
    if (id.endsWith('/src/diff.ts'))
      code = replace(
        code,
        'const remakeChildrenForAdd = (newWDom: WDom) => {',
        'const remakeChildrenForAdd = (newWDom: WDom) => {\n  if (!newWDom.children?.length) return newWDom.children;'
      );
    if (id.endsWith('/src/wDom.ts'))
      code = replace(
        code,
        '): WDom[] => {\n  // Siblings share',
        '): WDom[] => {\n  if (!children.length) return children as WDom[];\n  // Siblings share'
      );
    return code;
  },
  keys(code, id) {
    if (!id.endsWith('/src/diff.ts')) return code;
    code = replace(
      code,
      `  const keyMap = new Map<unknown, number>();
  origChildren.forEach`,
      `  const incoming = newWDom.children || [];
  const sameOrder = incoming.length === origChildren.length && incoming.every((item, i) => getKey(item) === getKey(origChildren[i]));
  const keyMap = new Map<unknown, number>();
  if (!sameOrder) origChildren.forEach`
    );
    code = replace(
      code,
      `const remaked = (newWDom.children || []).map(item => {
    const key = getKey(item);
    const origIndex = keyMap.get(key);`,
      `const remaked = incoming.map((item, index) => {
    const key = sameOrder ? undefined : getKey(item);
    const origIndex = sameOrder ? index : keyMap.get(key);`
    );
    code = replace(
      code,
      `if (matched) {
      keyMap.delete(key);`,
      `if (matched && !sameOrder) {
      keyMap.delete(key);`
    );
    return code;
  },
};
export const variants = {
  base: [],
  walk: ['walk'],
  empty: ['empty'],
  slots: ['slots'],
  leaf: ['leaf'],
  keys: ['keys'],
  combined: ['walk', 'empty', 'slots', 'leaf', 'keys'],
  propsGuard: ['propsGuard'],
  small: ['empty', 'slots', 'propsGuard'],
  identity: ['identity'],
  targeted: ['identity', 'slots', 'empty'],
  propsLoop: ['propsLoop'],
  compact: ['propsLoop', 'slots', 'empty'],
  queues: ['slots', 'empty'],
};
