import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

export function overlay(target) {
  fs.mkdirSync(target, { recursive: true });
  const files = {};
  for (const file of fs
    .readdirSync('src', { recursive: true })
    .filter(n => n.endsWith('.ts') && !n.startsWith('tests/'))) {
    const source = path.join('src', file),
      dest = path.join(target, file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(source, dest);
    files[source] = createHash('sha256')
      .update(fs.readFileSync(source))
      .digest('hex');
  }
  for (const name of ['block.ts', 'metrics.ts'])
    fs.copyFileSync(
      'experiments/static-dynamic/' + name,
      path.join(target, name)
    );
  const replace = (file, from, to) => {
    const dest = path.join(target, file),
      source = fs.readFileSync(dest, 'utf8');
    assert(source.includes(from), file + ': patch anchor missing');
    assert.equal(source.split(from).length, 2, file + ': ambiguous anchor');
    fs.writeFileSync(dest, source.replace(from, to));
  };
  replace(
    'diff.ts',
    'import { WDom',
    "import { reconcileBlock, materializeBlock } from './block';\nimport { metrics as sdMetrics } from './metrics';\ndeclare const __STATIC_DIAGNOSTIC__: boolean;\nimport { WDom"
  );
  replace(
    'diff.ts',
    '  // Already drawn',
    '  if (__STATIC_DIAGNOSTIC__) sdMetrics.diffVisits++;\n  // Already drawn'
  );
  replace(
    'diff.ts',
    '  return remakeNewWDom(',
    '  if (newWDom !== originalWDom) {\n    const block = reconcileBlock(newWDom as WDom, originalWDom);\n    if (block) return block;\n    materializeBlock(newWDom as WDom);\n  }\n  return remakeNewWDom('
  );
  replace(
    'wDom.ts',
    'import {\n  WDom,',
    "import { cloneBlock } from './block';\nimport {\n  WDom,"
  );
  replace(
    'wDom.ts',
    'export const cloneWDom = (wDom: WDom): WDom | TagFunctionResolver =>\n  wDom.ctor',
    'export const cloneWDom = (wDom: WDom): WDom | TagFunctionResolver =>\n  cloneBlock(wDom) || (wDom.ctor'
  );
  replace(
    'wDom.ts',
    '        wDom.getParent\n      );',
    '        wDom.getParent\n      ));'
  );
  replace(
    'render.ts',
    'import { WDom, Props }',
    "import { materializeBlock, commitBlock } from './block';\nimport { metrics as sdMetrics } from './metrics';\ndeclare const __STATIC_DIAGNOSTIC__: boolean;\nimport { WDom, Props }"
  );
  replace(
    'render.ts',
    'const typeUpdate = (newWDom: WDom) => {',
    'const typeUpdate = (newWDom: WDom) => {\n  if (__STATIC_DIAGNOSTIC__) sdMetrics.updateVisits++;\n  if (commitBlock(newWDom, updateProps, updateText)) return;'
  );
  replace(
    'render.ts',
    '  let element;\n  const { type,',
    '  materializeBlock(wDom);\n  if (__STATIC_DIAGNOSTIC__) sdMetrics.domCreates++;\n  let element;\n  const { type,'
  );
  replace(
    'render.ts',
    '    newWDom.el.nodeValue =',
    '    if (__STATIC_DIAGNOSTIC__) sdMetrics.textWrites++;\n    newWDom.el.nodeValue ='
  );
  replace(
    'render.ts',
    '  const originalProps = oldProps || {};',
    '  if (__STATIC_DIAGNOSTIC__) sdMetrics.propPasses++;\n  const originalProps = oldProps || {};'
  );
  replace(
    'render.ts',
    'const setAttr = (k: string, el: HTMLElement, v: string) =>\n  xmlnsRef.value',
    'const setAttr = (k: string, el: HTMLElement, v: string) =>\n  (__STATIC_DIAGNOSTIC__ && sdMetrics.attrWrites++, xmlnsRef.value'
  );
  replace(
    'render.ts',
    '    : el.setAttribute(k, v);',
    '    : el.setAttribute(k, v));'
  );
  replace(
    'render.ts',
    '      element.removeEventListener(eventName, oldEventHandler);',
    '      if (__STATIC_DIAGNOSTIC__) sdMetrics.eventRemoves++;\n      element.removeEventListener(eventName, oldEventHandler);'
  );
  replace(
    'render.ts',
    '      element.addEventListener(eventName, newEventHandler);',
    '      if (__STATIC_DIAGNOSTIC__) sdMetrics.eventAdds++;\n      element.addEventListener(eventName, newEventHandler);'
  );
  replace(
    'utils/createWDom.ts',
    'import type { WDom }',
    "import { metrics as sdMetrics } from '../metrics';\ndeclare const __STATIC_DIAGNOSTIC__: boolean;\nimport type { WDom }"
  );
  replace(
    'utils/createWDom.ts',
    '): WDom => ({',
    '): WDom => (__STATIC_DIAGNOSTIC__ && sdMetrics.wdCreated++, ({'
  );
  replace(
    'utils/createWDom.ts',
    '  [wdomSymbol]: true,\n});',
    '  [wdomSymbol]: true,\n}));'
  );
  return files;
}
