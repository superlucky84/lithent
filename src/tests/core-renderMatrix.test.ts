import { describe, it, expect } from 'vitest';
import * as core from '@/index';
import { nextTick } from '@/index';
import {
  createHarness,
  el,
  txt,
  nul,
  no,
  frag,
  list,
  comp,
  local,
  keyed,
  type Spec,
  type Store,
  type Harness,
} from './helpers/renderSpec';

// Base core only: lithentConcurrent's runner aliases `@/index` to its fork,
// which has not taken the fixes these suites guard.
const describeCore = describe.skipIf('deferRender' in core);

/**
 * Exhaustive render matrices for the base core. Every case renders one spec,
 * moves to another, and checks the DOM against the HTML that spec has to
 * produce (written without lithent), plus that exactly the expected
 * component instances are mounted.
 */

const check = (hn: Harness, label: string) => {
  expect(hn.html(), label).toBe(hn.expected());
  expect(hn.liveCounts(), `${label} (mounted components)`).toEqual(
    hn.expectedCounts()
  );
};

const permutations = <T>(items: T[]): T[][] =>
  items.length <= 1
    ? [items]
    : items.flatMap((item, i) =>
        permutations([...items.slice(0, i), ...items.slice(i + 1)]).map(
          rest => [item, ...rest]
        )
      );

/**
 * Every output shape a component (or a conditional slot) can switch between.
 */
const outputs: Record<string, Spec> = {
  null: nul,
  false: no,
  text: txt('t'),
  textOther: txt('u'),
  span: el('span', txt('s')),
  spanEmpty: el('span'),
  spanTwo: el('span', txt('s1'), txt('s2')),
  div: el('div', txt('d')),
  fragOne: frag(el('b', txt('f1'))),
  fragTwo: frag(el('b', txt('f1')), el('i', txt('f2'))),
  fragEmpty: frag(),
  fragOfNull: frag(nul, nul),
  fragNested: frag(frag(txt('n1')), frag(), frag(el('em', txt('n2')))),
  keyedList: list(
    true,
    keyed('a', el('li', txt('a'))),
    keyed('b', el('li', txt('b')))
  ),
  keyedListRev: list(
    true,
    keyed('b', el('li', txt('b'))),
    keyed('a', el('li', txt('a')))
  ),
  plainList: list(false, el('li', txt('p1')), txt('p2')),
  emptyList: list(false),
  compA: comp('A', el('p', txt('ca'))),
  compAFrag: comp('A', frag(txt('caf1'), el('p', txt('caf2')))),
  compANull: comp('A', nul),
  compB: comp('B', el('p', txt('cb'))),
  arrow: comp('Arrow', frag(el('p', txt('ar1')), txt('ar2'))),
  lmount: comp('L', el('p', txt('lm'))),
  slot: comp('Slot', frag(el('p', txt('sl1')), txt('sl2'))),
  chain: comp('A', comp('B', comp('A', frag(txt('ch1'), el('p', txt('ch2')))))),
  chainNull: comp('A', comp('B', nul)),
};
const outputNames = Object.keys(outputs);

/**
 * Siblings around the switching slot. Each one is a different node kind so
 * the next-sibling lookup has to walk through fragments and components.
 */
const surroundings: Record<string, (slot: Spec) => Spec> = {
  alone: slot => slot,
  inElement: slot => el('section', slot),
  betweenElements: slot => el('section', el('h1'), slot, el('h2')),
  betweenFragments: slot =>
    frag(frag(txt('L')), slot, frag(nul, el('h2', txt('R')))),
  betweenComponents: slot =>
    frag(comp('A', el('h1')), slot, comp('B', frag(nul, el('h2')))),
  beforeEmpty: slot => el('section', slot, nul, frag(), comp('A', nul)),
  afterEmpty: slot => el('section', frag(), comp('B', nul), slot),
  inComponentRoot: slot => comp('A', slot),
  inComponentFragment: slot => comp('A', frag(el('h1'), slot, el('h2'))),
  inUnkeyedList: slot => list(false, el('h1'), slot, el('h2')),
};

describeCore('conditional output matrix (parent redraw)', () => {
  Object.entries(surroundings).forEach(([where, wrap]) => {
    it(`switches every output to every other output: ${where}`, async () => {
      for (const withSiblings of [false, true]) {
        for (const from of outputNames) {
          const hn = createHarness(wrap(outputs[from]), {}, { withSiblings });
          check(hn, `${where}: initial ${from}`);

          for (const to of outputNames) {
            hn.setRoot(wrap(outputs[to]));
            await nextTick();
            check(hn, `${where}: ${from} -> ${to} (siblings ${withSiblings})`);

            hn.setRoot(wrap(outputs[from]));
            await nextTick();
            check(hn, `${where}: ${from} -> ${to} -> ${from}`);
          }
          hn.destroy();
        }
      }
    });
  });
});

describeCore('conditional output matrix (self redraw)', () => {
  // The switching component redraws on its own; its parent does not.
  Object.entries(surroundings).forEach(([where, wrap]) => {
    it(`a component switches its own output: ${where}`, async () => {
      for (const withSiblings of [false, true]) {
        for (const from of outputNames) {
          const hn = createHarness(
            wrap(local('me')),
            { me: outputs[from] },
            { withSiblings }
          );
          check(hn, `${where}: initial ${from}`);

          for (const to of outputNames) {
            hn.setLocal('me', outputs[to]);
            await nextTick();
            check(hn, `${where}: ${from} -> ${to} (siblings ${withSiblings})`);

            hn.setLocal('me', outputs[from]);
            await nextTick();
            check(hn, `${where}: ${from} -> ${to} -> ${from}`);
          }
          hn.destroy();
        }
      }
    });
  });

  it('a nested stateful component redraws inside a redrawn-by-self parent', async () => {
    const store: Store = {
      outer: frag(el('h1'), local('inner'), el('h2')),
      inner: outputs.fragTwo,
    };
    for (const withSiblings of [false, true]) {
      const hn = createHarness(
        frag(txt('L'), local('outer'), txt('R')),
        store,
        { withSiblings }
      );
      for (const a of outputNames) {
        hn.setLocal('inner', outputs[a]);
        await nextTick();
        check(hn, `inner -> ${a}`);

        hn.setLocal('outer', frag(el('h3'), local('inner')));
        await nextTick();
        check(hn, `outer reshaped around inner ${a}`);

        hn.setLocal('outer', store.outer);
        await nextTick();
        check(hn, `outer restored around inner ${a}`);
      }
      hn.destroy();
    }
  });
});

describeCore('sibling order of components, fragments and elements', () => {
  const kinds: Record<string, Spec> = {
    element: el('p', txt('E')),
    fragment: frag(txt('F1'), el('b', txt('F2'))),
    component: comp('A', el('p', txt('C'))),
    compFragment: comp('B', frag(el('i', txt('CF1')), txt('CF2'))),
    text: txt('T'),
    empty: nul,
  };
  const orders = permutations(Object.keys(kinds));

  const containers: Record<string, (children: Spec[]) => Spec> = {
    rootFragment: children => frag(...children),
    element: children => el('section', ...children),
    componentRoot: children => comp('A', frag(...children)),
    unkeyedList: children => list(false, ...children),
  };

  Object.entries(containers).forEach(([where, wrap]) => {
    it(`renders every order initially and after reordering: ${where}`, async () => {
      for (const withSiblings of [false, true]) {
        const hn = createHarness(
          wrap(orders[0].map(name => kinds[name])),
          {},
          { withSiblings }
        );
        check(hn, `${where}: ${orders[0].join(',')}`);
        // Walk through every permutation, then back to the first one.
        for (const order of [...orders.slice(1), orders[0]]) {
          hn.setRoot(wrap(order.map(name => kinds[name])));
          await nextTick();
          check(hn, `${where}: ${order.join(',')} (siblings ${withSiblings})`);
        }
        hn.destroy();

        // A fresh initial render of every order.
        for (const order of orders) {
          const fresh = createHarness(
            wrap(order.map(name => kinds[name])),
            {},
            { withSiblings }
          );
          check(fresh, `${where}: initial ${order.join(',')}`);
          fresh.destroy();
        }
      }
    });
  });

  it('keeps keyed component / element / stateful items in every order', async () => {
    const items: Record<string, Spec> = {
      a: keyed('a', el('li', txt('a'))),
      b: keyed('b', comp('A', frag(el('li', txt('b1')), el('li', txt('b2'))))),
      c: keyed('c', comp('B', el('li', txt('c')))),
      d: keyed('d', local('d')),
      e: keyed('e', comp('Slot', el('li', txt('e')))),
    };
    const store = { d: frag(el('li', txt('d1')), nul, el('li', txt('d2'))) };
    const names = Object.keys(items);
    const orders5 = permutations(names);

    for (const withSiblings of [false, true]) {
      for (const where of ['root', 'element', 'fragment'] as const) {
        const wrap = (spec: Spec) =>
          where === 'root'
            ? spec
            : where === 'element'
              ? el('ul', spec)
              : frag(el('h1'), spec, el('h2'));
        const toList = (order: string[]) =>
          wrap(list(true, ...order.map(n => items[n])));

        const hn = createHarness(toList(names), store, { withSiblings });
        for (const order of orders5) {
          hn.setRoot(toList(order));
          await nextTick();
          check(hn, `${where}: ${order.join(',')}`);
        }
        // Subsets: remove and re-insert items at every position.
        for (let i = 0; i < names.length; i++) {
          const without = names.filter((_n, j) => j !== i);
          hn.setRoot(toList(without));
          await nextTick();
          check(hn, `${where}: without ${names[i]}`);
          hn.setRoot(toList([...without].reverse()));
          await nextTick();
          check(hn, `${where}: reversed without ${names[i]}`);
          hn.setRoot(toList(names));
          await nextTick();
          check(hn, `${where}: back to all`);
        }
        hn.setRoot(toList([]));
        await nextTick();
        check(hn, `${where}: empty`);
        hn.setRoot(toList(names));
        await nextTick();
        check(hn, `${where}: refilled`);
        hn.destroy();
      }
    }
  });
});

describeCore('a component whose root is another component', () => {
  const leafs: Record<string, Spec> = {
    element: el('p', txt('leaf')),
    fragment: frag(el('b', txt('l1')), txt('l2')),
    null: nul,
    text: txt('leaf'),
    list: list(true, keyed('x', el('li', txt('x'))), keyed('y', el('li'))),
  };
  const kinds = ['A', 'B', 'Arrow', 'L', 'Slot'] as const;

  // Chains of up to three components, every kind at every level.
  const chains: (typeof kinds)[number][][] = [];
  kinds.forEach(a => {
    chains.push([a]);
    kinds.forEach(b => {
      chains.push([a, b]);
      kinds.forEach(c => chains.push([a, b, c]));
    });
  });
  const toChain = (chain: string[], leaf: Spec) =>
    chain.reduceRight(
      (child, kind) => comp(kind as (typeof kinds)[number], child),
      leaf
    );

  it('renders and updates every chain with every leaf', async () => {
    for (const chain of chains) {
      const wrap = (leaf: Spec) =>
        frag(el('h1'), toChain(chain, leaf), el('h2'));
      const leafNames = Object.keys(leafs);
      const hn = createHarness(
        wrap(leafs[leafNames[0]]),
        {},
        {
          withSiblings: true,
        }
      );
      check(hn, `${chain.join('>')}: initial`);
      for (const from of leafNames) {
        for (const to of leafNames) {
          hn.setRoot(wrap(leafs[from]));
          await nextTick();
          check(hn, `${chain.join('>')}: ${from}`);
          hn.setRoot(wrap(leafs[to]));
          await nextTick();
          check(hn, `${chain.join('>')}: ${from} -> ${to}`);
        }
      }
      hn.destroy();
    }
  });

  it('replaces a chain level by a different component kind', async () => {
    const leaf = frag(el('b', txt('l1')), txt('l2'));
    for (const from of chains) {
      const hn = createHarness(
        frag(el('h1'), toChain(from, leaf), el('h2')),
        {},
        { withSiblings: true }
      );
      for (const to of chains.filter(c => c.length === from.length)) {
        hn.setRoot(frag(el('h1'), toChain(to, leaf), el('h2')));
        await nextTick();
        check(hn, `${from.join('>')} -> ${to.join('>')}`);
      }
      hn.destroy();
    }
  });

  it('redraws the innermost stateful component of a chain', async () => {
    for (const chain of chains) {
      const hn = createHarness(
        frag(el('h1'), toChain(chain, local('leaf')), el('h2')),
        { leaf: leafs.element },
        { withSiblings: true }
      );
      for (const to of Object.keys(leafs)) {
        hn.setLocal('leaf', leafs[to]);
        await nextTick();
        check(hn, `${chain.join('>')}: leaf -> ${to}`);
        // A parent redraw afterwards must agree with the self redraw.
        hn.setRoot(frag(el('h1'), toChain(chain, local('leaf')), el('h2')));
        await nextTick();
        check(hn, `${chain.join('>')}: parent redraw after leaf -> ${to}`);
      }
      hn.destroy();
    }
  });

  it('a stateful component whose root is a chain redraws itself', async () => {
    for (const chain of chains) {
      const hn = createHarness(
        el('main', txt('L'), local('top'), txt('R')),
        { top: toChain(chain, leafs.fragment) },
        { withSiblings: true }
      );
      for (const to of Object.keys(leafs)) {
        hn.setLocal('top', toChain(chain, leafs[to]));
        await nextTick();
        check(hn, `${chain.join('>')}: top -> ${to}`);
        hn.setLocal('top', leafs[to]);
        await nextTick();
        check(hn, `${chain.join('>')}: top unwrapped ${to}`);
        hn.setLocal('top', toChain([...chain].reverse(), leafs[to]));
        await nextTick();
        check(hn, `${chain.join('>')}: top rewrapped ${to}`);
      }
      hn.destroy();
    }
  });
});

describeCore('unmount and destroy', () => {
  it('destroy() removes every node and unmounts every component', () => {
    const specs = Object.values(outputs);
    for (const withSiblings of [false, true]) {
      for (const spec of specs) {
        for (const wrap of Object.values(surroundings)) {
          const hn = createHarness(wrap(spec), {}, { withSiblings });
          hn.destroy();
          expect(hn.html()).toBe(withSiblings ? '<i>head</i><i>tail</i>' : '');
          expect(hn.liveCounts()).toEqual({});
        }
      }
    }
  });
});
