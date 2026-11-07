# Applies the three measured source-level size edits to a copy of a source
# tree (<base>/src -> <out>/src). E1: shared hook-queue push, E2: one
# Object.prototype alias, E3: shared child-count check in predicators.
# All three raised base UMD Brotli (+6..+12B); none is adopted.
#
#   python3 experiments/bundle-size-recheck/source-edits.py <base> <out> E1,E2,E3
import sys, pathlib, shutil
base = pathlib.Path(sys.argv[1]); out = pathlib.Path(sys.argv[2]); edits = sys.argv[3].split(',')
if out.exists(): shutil.rmtree(out)
shutil.copytree(base, out)
def sub(rel, old, new):
    p = out / 'src' / rel; t = p.read_text()
    assert t.count(old) == 1, (rel, old[:60], t.count(old)); p.write_text(t.replace(old, new))
if 'E1' in edits:
    sub('utils/universalRef.ts', "export const getCurrentComponent = () =>\n  componentMap.get(compKeyRef.value as CompKey);\n",
        "export const getCurrentComponent = () =>\n  componentMap.get(compKeyRef.value as CompKey);\n\n// Registers a hook callback on the current component's queue.\nexport const pushHook =\n  <T>(queue: 'umts' | 'mts' | 'wdCB') =>\n  (effectAction: T) => {\n    const comp = getCurrentComponent();\n    comp && (comp[queue] as T[]).push(effectAction);\n  };\n")
    sub('hook/internal/unmount.ts', "export const unmount = (effectAction: () => void) => {\n  const comp = getCurrentComponent();\n  comp && comp.umts.push(effectAction);\n};",
        "export const unmount = pushHook<() => void>('umts');")
    sub('hook/internal/unmount.ts', "  getCurrentComponent,\n", "  pushHook,\n")
    sub('hook/mountCallback.ts', "export const mountCallback = (effectAction: () => void) => {\n  const comp = getCurrentComponent();\n  comp && comp.mts.push(effectAction);\n};",
        "export const mountCallback = pushHook<() => void>('mts');")
    sub('hook/mountCallback.ts', "  getCurrentComponent,\n", "  pushHook,\n")
    sub('hook/mountReadyCallback.ts', "export const mountReadyCallback = (effectAction: () => void | (() => void)) => {\n  const comp = getCurrentComponent();\n  comp && comp.wdCB.push(effectAction);\n};",
        "export const mountReadyCallback = pushHook<() => void | (() => void)>('wdCB');")
    sub('hook/mountReadyCallback.ts', "  getCurrentComponent,\n", "  pushHook,\n")
if 'E2' in edits:
    sub('utils/index.ts', "export const isEnumerableProp = (props: Props, key: string) =>\n  Object.prototype.propertyIsEnumerable.call(props, key);",
        "const objectProto = Object.prototype;\n\nexport const isEnumerableProp = (props: Props, key: string) =>\n  objectProto.propertyIsEnumerable.call(props, key);")
    sub('utils/index.ts', "!Object.prototype.hasOwnProperty.call(props, key)", "!objectProto.hasOwnProperty.call(props, key)")
if 'E3' in edits:
    p = 'utils/predicator.ts'
    sub(p, "// The checks below are reached", "const sameChildCount = (newWDom: WDom, originalWDom: WDom) =>\n  !!originalWDom.children &&\n  originalWDom.children.length ===\n    (newWDom.children && newWDom.children.length);\n\n// The checks below are reached")
    t = (out/'src'/p).read_text()
    old = "  !!originalWDom.children &&\n  originalWDom.children.length ===\n    (newWDom.children && newWDom.children.length);"
    assert t.count(old) == 3, t.count(old)  # helper + fragment + tag element
    first = t.index(old); rest = t[first+len(old):].replace(old, "  sameChildCount(newWDom, originalWDom);")
    t = t[:first+len(old)] + rest
    old2 = "    (!!originalWDom.children &&\n      originalWDom.children.length ===\n        (newWDom.children && newWDom.children.length)));"
    assert t.count(old2) == 1; t = t.replace(old2, "    sameChildCount(newWDom, originalWDom));")
    (out/'src'/p).write_text(t)
print('ok', edits)
