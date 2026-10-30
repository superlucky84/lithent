#!/bin/bash
# DC-29 size probe for C4 product placement options.
# Usage: bash experiments/c4-product-size/measure.sh <scratch-worktree>
# The worktree is changed and restored; never pass the main checkout.
set -e
W=$1
SRC=$(cd "$(dirname "$0")" && pwd)
[ -n "$W" ] && [ -d "$W/src" ] || { echo "usage: measure.sh <scratch-worktree>"; exit 1; }
cd "$W"
br() { node -e 'const z=require("zlib"),f=require("fs");const b=f.readFileSync(process.argv[1]);process.stdout.write(String(z.brotliCompressSync(b).length))' "$1"; }
reset() { git checkout -q -- src/index.ts; rm -f src/listBoundary.ts src/listBridge.ts; }
# VITEST=1 only skips vite-plugin-checker; the output is the normal build.
build() { VITEST=1 npx vite build --logLevel error >/dev/null 2>&1; br dist/lithent.umd.js; }

reset
echo "baseline            $(build)"

# S1: product-trimmed P2 (diagnostics/metrics removed) inside the core.
cp "$SRC/listBoundary.core.ts" src/listBoundary.ts
echo "export { createListBoundary } from '@/listBoundary';" >> src/index.ts
echo "S1 core P2          $(build)"

# S1 with error messages replaced by short codes.
perl -0pi -e "my \$n=0; s/Error\('C4[^']*'\)/'Error(\"L'.(++\$n).'\")'/ge" src/listBoundary.ts
echo "S1 core P2 short    $(build)"
reset

# S1': P1 (set/invalidate only, no owner lifecycle) inside the core.
grep -v -E "__C4_DIAGNOSTIC__|const metrics|^\s*metrics,$" experiments/c4-list-boundary/boundary.ts > src/listBoundary.ts
echo "export { createListBoundary } from '@/listBoundary';" >> src/index.ts
echo "S1' core P1 minimal $(build)"
reset

# S2/S3 bridge, variant a: export the three internals one by one.
cat >> src/index.ts <<'EOF'
export { makeNewWDomTree } from '@/diff';
export { wDomUpdate } from '@/render';
export { needDiffRef } from '@/utils/universalRef';
EOF
echo "bridge internals    $(build)"
reset

# S2/S3 bridge, variant b: one function (diff -> place -> commit, diff mode held).
echo "export { patchWDom } from '@/listBridge';" >> src/index.ts
cat > src/listBridge.ts <<'EOF'
import { makeNewWDomTree } from '@/diff';
import { wDomUpdate } from '@/render';
import { needDiffRef } from '@/utils/universalRef';
import type { WDom } from '@/types';
export const patchWDom = (
  description: WDom,
  previous: WDom,
  place: (next: WDom) => void
) => {
  const prev = needDiffRef.value;
  needDiffRef.value = true;
  try {
    const next = makeNewWDomTree(description, previous);
    next.getParent = previous.getParent;
    place(next);
    wDomUpdate(next);
    return next;
  } finally {
    needDiffRef.value = prev;
  }
};
EOF
echo "bridge function     $(build)"
reset

# The list module outside the core (helper or subpath), lithent external.
mkdir -p probe
cp "$SRC/listBoundary.helper.ts" "$SRC/probe.config.mjs" probe/
npx vite build -c probe/probe.config.mjs >/dev/null 2>&1
echo "list module umd     $(br probe/out/probe.umd.js)"
echo "list module es      $(br probe/out/probe.es.js)"
rm -rf probe

VITEST=1 npx vite build --logLevel error >/dev/null 2>&1
echo "restored baseline   $(br dist/lithent.umd.js)"
