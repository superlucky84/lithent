// Re-minifies an unmangled UMD (built with terserJSON
// '{"compress":false,"mangle":false}') under each Terser compress flag alone
// and under named combinations. Reports size deltas against the rename-only
// equivalent and the number of function nodes: a different count means
// functions were inlined or moved, which changes closure scopes.
//
//   node experiments/bundle-size-recheck/terser-flags.mjs <unmangledUmd>
import { readFileSync } from 'fs';
import { brotliCompressSync, gzipSync } from 'zlib';
import { minify } from 'terser';
import { parseAst } from 'vite';

const code = readFileSync(process.argv[2], 'utf8').replace(
  /\n?\/\/# sourceMappingURL=[^\n]*\n?$/,
  ''
);
const tail = '\n//# sourceMappingURL=lithent.umd.js.map';
const measure = s => {
  const b = Buffer.from(s + tail);
  return [
    b.length,
    gzipSync(b, { level: 9 }).length,
    brotliCompressSync(b).length,
  ];
};
// "functions" counts every function node; "named" counts functions bound to
// their own variable. Moving a single-use function into its caller keeps the
// first count but lowers the second.
const countFunctions = s => {
  let all = 0;
  let named = 0;
  const walk = node => {
    if (!node || typeof node !== 'object') return;
    if (/Function/.test(node.type)) all++;
    if (
      node.type === 'VariableDeclarator' &&
      node.init &&
      /Function/.test(node.init.type)
    )
      named++;
    for (const key in node) walk(node[key]);
  };
  walk(parseAst(s));
  return `${all}/${named}`;
};
const run = async compress => {
  const { code: out } = await minify(code, { compress, mangle: true });
  return [...measure(out), countFunctions(out)];
};

const [r0, g0, b0, f0] = await run(false);
console.log(`rename-only ${r0}/${g0}/${b0} functions/named ${f0}`);

const flags = [
  'arrows',
  'booleans',
  'collapse_vars',
  'comparisons',
  'computed_props',
  'conditionals',
  'dead_code',
  'directives',
  'drop_debugger',
  'evaluate',
  'hoist_funs',
  'hoist_props',
  'hoist_vars',
  'if_return',
  'inline',
  'join_vars',
  'keep_fargs',
  'lhs_constants',
  'loops',
  'negate_iife',
  'properties',
  'reduce_funcs',
  'reduce_vars',
  'sequences',
  'side_effects',
  'switches',
  'toplevel',
  'typeofs',
  'unused',
];
for (const flag of flags) {
  const [r, g, b, f] = await run({ defaults: false, [flag]: true });
  console.log(
    `${flag.padEnd(16)} Δraw ${r - r0} Δgzip ${g - g0} Δbr ${b - b0} functions ${f}`
  );
}

const scopeOff = {
  inline: 0,
  reduce_vars: false,
  reduce_funcs: false,
  collapse_vars: false,
  hoist_props: false,
  hoist_funs: false,
  hoist_vars: false,
};
const combos = {
  syntax4: {
    defaults: false,
    booleans: true,
    lhs_constants: true,
    if_return: true,
    join_vars: true,
  },
  dc24: {
    defaults: false,
    booleans: true,
    comparisons: true,
    conditionals: true,
    evaluate: true,
    properties: true,
    typeofs: true,
    if_return: true,
  },
  defaultsWithoutScopeChanges: scopeOff,
  fullDefaults: {},
};
for (const [name, compress] of Object.entries(combos)) {
  const [r, g, b, f] = await run(compress);
  console.log(`${name.padEnd(28)} ${r}/${g}/${b} Δbr ${b - b0} functions ${f}`);
}
