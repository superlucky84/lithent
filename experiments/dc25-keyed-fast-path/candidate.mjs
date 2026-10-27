import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { guard, hash, inventory, write } from './common.mjs';

const out = fs.realpathSync(process.argv[2]);
guard(out);
const source = path.join(out, 'candidate/src');
assert(!fs.existsSync(path.join(out, 'candidate/build.json')));
const edit = (file, before, after) => {
  const target = path.join(source, file);
  const text = fs.readFileSync(target, 'utf8');
  assert(text.includes(before), file + ': missing source anchor');
  fs.writeFileSync(target, text.replace(before, after));
};
edit(
  'types/index.ts',
  '  oi?: number;',
  '  so?: object; // scoped same-order frame; sparse, list nodes only\n  sc?: WDom[]; // children owned by that single-use proof\n  oi?: number;'
);
fs.writeFileSync(
  path.join(source, 'utils/childOrder.ts'),
  `export type ChildOrderFrame = { ready: boolean; invalid: boolean };
// Frames hold no nodes/arrays. Unvisited list metadata cannot retain a root tree.
export const childOrderRef: { value?: ChildOrderFrame } = {};
`
);
edit(
  'wDom.ts',
  "import { createWDom } from '@/utils/createWDom';",
  "import { createWDom } from '@/utils/createWDom';\nimport { childOrderRef } from '@/utils/childOrder';"
);
const wdom = fs.readFileSync(path.join(source, 'wDom.ts'), 'utf8');
const start = wdom.indexOf(
  '  needDiffRef.value = true;',
  wdom.indexOf('export const replaceWDom =')
);
const end = wdom.indexOf('\n};', start);
assert(start > 0 && end > start);
const body = wdom
  .slice(start, end)
  .replace(
    '  wDomUpdate(newWDomTree);',
    '  frame.ready = true;\n  wDomUpdate(newWDomTree);'
  );
fs.writeFileSync(
  path.join(source, 'wDom.ts'),
  wdom.slice(0, start) +
    `  const previous = childOrderRef.value;
  if (previous) previous.invalid = true;
  const frame = { ready: false, invalid: false };
  childOrderRef.value = frame;
  try {
${body
  .split('\n')
  .map(line => '  ' + line)
  .join('\n')}
  } finally {
    frame.invalid = true;
    childOrderRef.value = previous;
  }` +
    wdom.slice(end)
);
edit(
  'diff.ts',
  "import { keys, isEnumerableProp } from '@/utils';",
  "import { keys, isEnumerableProp } from '@/utils';\nimport { childOrderRef } from '@/utils/childOrder';"
);
const diff = fs.readFileSync(path.join(source, 'diff.ts'), 'utf8');
const loop = diff.indexOf('const diffLoopChildren =');
assert(loop > 0 && diff.slice(loop).trim().endsWith('};'));
fs.writeFileSync(
  path.join(source, 'diff.ts'),
  diff.slice(0, loop) +
    `const diffLoopChildren = (newWDom: WDom, originalWDom: WDom) => {
  const origChildren = originalWDom.children || [];
  const frame = childOrderRef.value;
  const originalKeys: unknown[] = [];
  const unique = new Set<unknown>();
  let eligible = true;
  // Preserve the original key read order, before reading the new children.
  origChildren.forEach((item, index) => {
    const key = getKey(item);
    originalKeys[index] = key;
    if (!checkExisty(key) || unique.has(key)) eligible = false;
    unique.add(key);
  });
  const used: boolean[] = [];
  const getParent = makeParentGetter(newWDom);
  const children = newWDom.children || [];
  let positional = eligible && unique.size === origChildren.length && children.length === origChildren.length;
  const mapRemaining = (start: number) => {
    const map = new Map<unknown, number>();
    originalKeys.forEach((key, index) => {
      if (index >= start && checkExisty(key) && !map.has(key)) map.set(key, index);
    });
    return map;
  };
  let keyMap = positional ? undefined : mapRemaining(0);
  let sameOrder = children.length === origChildren.length;
  let matchedCount = 0;
  const remaked = children.map((item, index) => {
    // Earlier updaters may mutate this key: do not pre-read the new keys.
    const key = getKey(item);
    const oldKey = originalKeys[index];
    if (positional && !(key === oldKey || (key !== key && oldKey !== oldKey))) {
      positional = false;
      keyMap = mapRemaining(index);
    }
    const origIndex = positional ? index : checkExisty(key)
      ? keyMap!.get(key)
      : index < origChildren.length && !checkExistyKey(origChildren[index]) ? index : undefined;
    let original: WDom | undefined;
    if (origIndex !== undefined) {
      matchedCount++;
      if (keyMap) keyMap.delete(key);
      used[origIndex] = true;
      original = origChildren[origIndex];
    }
    const child = makeNewWDomTree(item, original);
    if (original) child.oi = origIndex;
    child.getParent = getParent;
    sameOrder = sameOrder && origIndex === index &&
      (child.nr === 'N' || child.nr === 'U' || child.nr === 'T') && child.tag !== 'portal';
    return child;
  });
  // Keep even the empty deletion call's parent lookup at its original point.
  typeDeleteUnused(positional && matchedCount === origChildren.length && origChildren.length === children.length ? [] :
    origChildren.filter((_item, index) => !used[index]), originalWDom);
  if (sameOrder && matchedCount === origChildren.length && frame && !frame.invalid) {
    newWDom.so = frame;
    newWDom.sc = remaked;
  }
  return remaked;
};
`
);
edit(
  'render.ts',
  "import { cloneWDom } from '@/wDom';",
  "import { cloneWDom } from '@/wDom';\nimport { childOrderRef, ChildOrderFrame } from '@/utils/childOrder';"
);
edit(
  'render.ts',
  '  if (newWDom.el) {\n    const { op: oldProps, props } = newWDom;',
  `  const frame = newWDom.type === 'l' ? newWDom.so as ChildOrderFrame | undefined : undefined;
  const proofChildren = frame ? newWDom.sc : undefined;
  if (frame) newWDom.so = newWDom.sc = undefined;

  if (newWDom.el) {
    const { op: oldProps, props } = newWDom;`
);
edit(
  'render.ts',
  '  updateChildren(newWDom);\n  runUpdatedQueueFromWDom',
  '  updateChildren(newWDom, frame, proofChildren);\n  runUpdatedQueueFromWDom'
);
edit(
  'render.ts',
  'const updateChildren = (newWDom: WDom) => {\n  const children = newWDom.children || [];',
  `const updateChildren = (newWDom: WDom, frame?: ChildOrderFrame, proofChildren?: WDom[]) => {
  const children = newWDom.children || [];
  if (frame && frame === childOrderRef.value && frame.ready && !frame.invalid && children === proofChildren) {
    children.forEach(wDomUpdate);
    children.forEach(clearDiffMeta);
    execMountedQueue();
    return;
  }`
);
write(path.join(out, 'candidate-preparation.json'), {
  at: new Date().toISOString(),
  sources: inventory(source),
  candidateScript: hash(fs.readFileSync(new URL(import.meta.url))),
  decisions: {
    matching:
      'one original key snapshot + uniqueness Set; lazy suffix Map on mismatch',
    proof:
      'sparse list so/sc with node-free root frame; consume before props, validate after props',
    earlyReturn:
      'Not included in this first combined candidate; comparison getter observations must remain intact',
    concurrent: 'Unchanged during isolated base experiment',
  },
});
guard(out);
console.log('Prepared isolated candidate; default runtime unchanged.');
