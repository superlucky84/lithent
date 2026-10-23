import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const out = path.resolve(process.argv[2]);
const candidateKind =
  JSON.parse(fs.readFileSync(path.join(out, 'build.json'), 'utf8'))
    .candidateKind || 'range';
const helpers = {};
for (const variant of ['baseline', 'candidate']) {
  const source = fs.readFileSync(
    path.join(out, variant, 'source/src/render.ts'),
    'utf8'
  );
  const section = source.slice(
    source.indexOf('const moving ='),
    source.indexOf('const typeReplace =')
  );
  const compiled = ts.transpileModule(
    `${section}\nglobalThis.search = findChildFragmentNextElement; globalThis.movingNodes = moving;`,
    { compilerOptions: { target: ts.ScriptTarget.ES2022 } }
  ).outputText;
  const context = vm.createContext({
    checkVirtualType: type => type === 'f' || type === 'l',
  });
  vm.runInContext(compiled, context);
  helpers[variant] = context;
}
const element = id => ({ type: 'e', el: { nodeType: 1, id } });
const cases = {};
for (const variant of ['baseline', 'candidate']) {
  const { search, movingNodes } = helpers[variant];
  const find = (items, start = 0, end = items.length) =>
    variant === 'baseline' || candidateKind === 'snapshot-loop'
      ? search(items.slice(start, end))
      : search(items, start, end);
  const sparse = new Array(5);
  sparse[2] = { type: 'f', children: [] };
  sparse[3] = element('first');
  sparse[4] = element('last');
  assert.equal(find(sparse, 1).id, 'first');
  movingNodes.add(sparse[3]);
  assert.equal(find(sparse, 1).id, 'last');
  movingNodes.clear();
  assert.equal(find(sparse, 0, 3), undefined);
  const items = [null, element('old')];
  items[0] = {
    type: 'f',
    get children() {
      items[1] = element('new');
      return [];
    },
  };
  const mutationResult = find(items).id;
  let getterReads = 0;
  const indexed = [element('first')];
  Object.defineProperty(indexed, '1', {
    get() {
      getterReads++;
      return element('last');
    },
    enumerable: true,
  });
  assert.equal(find(indexed).id, 'first');
  let directReads = 0;
  const direct = [element('first')];
  Object.defineProperty(direct, '1', {
    get() {
      directReads++;
      return element('last');
    },
    enumerable: true,
  });
  assert.equal(search(direct).id, 'first');
  const throwing = [element('first')];
  Object.defineProperty(throwing, '1', {
    get() {
      throw Error('later-index');
    },
    enumerable: true,
  });
  let laterError;
  try {
    search(throwing);
  } catch (error) {
    laterError = error.message;
  }
  const growing = [
    {
      type: 'f',
      get children() {
        growing.push(element('new'));
        return [];
      },
    },
  ];
  const lengthResult = search(growing);
  assert.equal(lengthResult, undefined);
  cases[variant] = {
    sparseAndMoving: 'pass',
    mutationResult,
    unusedIndexedGetterReads: getterReads,
    directIndexedGetterReads: directReads,
    laterError: laterError || null,
    lengthSnapshot: 'pass',
  };
}
assert.equal(cases.baseline.mutationResult, 'old');
assert.equal(cases.baseline.unusedIndexedGetterReads, 1);
assert.equal(cases.baseline.directIndexedGetterReads, 1);
assert.equal(cases.baseline.laterError, 'later-index');
const equivalent =
  JSON.stringify(cases.baseline) === JSON.stringify(cases.candidate);
if (candidateKind === 'snapshot-loop') assert.equal(equivalent, true);
else {
  assert.equal(cases.candidate.mutationResult, 'new');
  assert.equal(cases.candidate.unusedIndexedGetterReads, 0);
  assert.equal(equivalent, false);
}
const result = {
  scope:
    'Exact extracted source helper; stub DOM nodeType, not a full-browser contract',
  cases,
  candidateKind,
  observationallyEquivalent: equivalent,
  implication: equivalent
    ? 'The tested snapshot/index getter/hole/length/throw observations match; not a universal equivalence proof.'
    : 'Keep as experimental; slice snapshot/read-order differs for accessor/mutating inputs. No automatic adoption or new immutable contract.',
};
fs.writeFileSync(
  path.join(out, 'snapshot-boundary.json'),
  JSON.stringify(result, null, 2)
);
console.log(JSON.stringify(result, null, 2));
