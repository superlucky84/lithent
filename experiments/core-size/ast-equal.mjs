// Whether JavaScript files have the same syntax tree as the first one:
// positions and parentheses are ignored, everything else must match.
//
//   node experiments/core-size/ast-equal.mjs <reference.js> <other.js> [...]
import { readFileSync } from 'fs';
import { parseAst } from 'vite';

const strip = node => {
  if (Array.isArray(node)) return node.map(strip);
  if (!node || typeof node !== 'object') return node;
  if (node.type === 'ParenthesizedExpression') return strip(node.expression);

  const copy = {};
  for (const key in node) {
    if (key !== 'start' && key !== 'end' && key !== 'raw' && key !== 'loc') {
      copy[key] = strip(node[key]);
    }
  }
  return copy;
};

const tree = file =>
  JSON.stringify(strip(parseAst(readFileSync(file, 'utf8')).body));
const functions = file =>
  (readFileSync(file, 'utf8').match(/=>|\bfunction\b/g) || []).length;

const [reference, ...others] = process.argv.slice(2);

if (!reference || !others.length) {
  console.error('usage: ast-equal.mjs <reference.js> <other.js> [...]');
  process.exit(1);
}

const expected = tree(reference);
let same = true;

console.log(`${reference}: ${functions(reference)} functions`);
for (const file of others) {
  const equal = tree(file) === expected;
  same &&= equal;
  console.log(
    `${file}: ${functions(file)} functions, ${equal ? 'same tree' : 'DIFFERENT tree'}`
  );
}

process.exit(same ? 0 : 1);
