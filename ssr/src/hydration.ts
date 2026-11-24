import { render } from 'lithent';
import type { WDom } from 'lithent';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Above this many unit × node pairs in the part of a child list that differs,
 * siblings are paired in order instead of by the best alignment, so a large
 * mismatched list stays linear.
 */
const ALIGN_LIMIT = 250_000;

/**
 * One position in a child list as the server HTML shows it: an element, or a
 * run of texts, which the HTML parser joins into one text node.
 */
type Unit = {
  w: WDom[];
  tag?: string;
  text?: string;
  real?: ChildNode;
};

/**
 * hydration
 *
 * Attach a component tree to the DOM the server rendered from it (see
 * renderToString) instead of building that DOM again. Every element and text
 * of the tree gets the server node it stands for as `el`, then the core's
 * hydration pass attaches props and events to those nodes.
 *
 * Server nodes the tree has no place for, such as a loader script or a node a
 * browser extension added, are left alone. Parts of the tree the server HTML
 * lacks, because the server and the browser rendered different markup, are
 * created here, put in place and reported with console.warn, so the page
 * still works.
 */
export function hydration(wDom: WDom, wrapElement: HTMLElement) {
  const list = flatFragmentFromList([wDom]);

  if (wrapElement.tagName === 'HTML') {
    hydrateChildren(list, [wrapElement], wrapElement.parentNode as Node);
  } else {
    hydrateChildren(list, Array.from(wrapElement.childNodes), wrapElement);
  }

  return render(wDom, wrapElement, null, true);
}

/**
 * Pair one child list of the tree with the child nodes of its server element,
 * then do the same for every paired element.
 */
function hydrateChildren(list: WDom[], realList: ChildNode[], parent: Node) {
  const units = toUnits(list);
  const reals = realList.filter(
    node => node.nodeType === 1 || node.nodeType === 3
  );
  const nextReal: (ChildNode | null)[] = [];
  let last: Node | null = null;

  align(units, reals);

  // For each unit, the server node of the next paired unit: what a created
  // node goes before.
  for (let index = units.length - 1, next = null; index >= 0; index -= 1) {
    nextReal[index] = next;
    next = units[index].real || next;
  }

  for (let index = 0; index < units.length; index += 1) {
    const unit = units[index];
    const { w, real } = unit;

    if (real && unit.tag) {
      w[0].el = real as HTMLElement;
      hydrateChildren(
        flatFragmentFromList(w[0].children || []),
        Array.from(real.childNodes),
        real
      );
      last = real;
    } else if (real) {
      last = placeTexts(w, parent, null, real as Text);
    } else {
      const before: Node | null =
        nextReal[index] || (last ? last.nextSibling : null);

      if (unit.tag) {
        warnMissing(`<${w[0].tag}>`, parent);
        last = build(w[0], parent, before) || last;
      } else {
        // A run of empty texts is in no HTML at all, so it is not a mismatch.
        if (unit.text) warnMissing(`text "${unit.text}"`, parent);
        last = placeTexts(w, parent, before) || last;
      }
    }
  }
}

/**
 * Elements one by one, and consecutive texts as one run. Empty nodes (null,
 * false) render nothing, so a run of texts goes on across them.
 */
function toUnits(list: WDom[]) {
  const units: Unit[] = [];
  let run: Unit | undefined;

  list.forEach(item => {
    if (item.type === 't') {
      if (!run) units.push((run = { w: [], text: '' }));
      run.w.push(item);
      run.text += String(item.text);
    } else if (item.type === 'e') {
      run = undefined;
      units.push({ w: [item], tag: String(item.tag).toLowerCase() });
    }
  });

  return units;
}

function matches(unit: Unit, node: ChildNode) {
  return unit.tag
    ? node.nodeType === 1 &&
        (node as Element).tagName.toLowerCase() === unit.tag
    : node.nodeType === 3 && !!unit.text;
}

/**
 * Pair units with server nodes in order, pairing as many as possible: a unit
 * left without a node is missing from the server HTML, and a node left
 * without a unit is something else on the page.
 */
function align(units: Unit[], reals: ChildNode[]) {
  let start = 0;
  let unitEnd = units.length;
  let realEnd = reals.length;

  // Matching ends are always part of a best alignment, so only the part in
  // between needs a search (usually nothing, when the markup matches).
  while (
    start < unitEnd &&
    start < realEnd &&
    matches(units[start], reals[start])
  ) {
    units[start].real = reals[start];
    start += 1;
  }

  while (
    unitEnd > start &&
    realEnd > start &&
    matches(units[unitEnd - 1], reals[realEnd - 1])
  ) {
    unitEnd -= 1;
    realEnd -= 1;
    units[unitEnd].real = reals[realEnd];
  }

  const u = units.slice(start, unitEnd);
  const r = reals.slice(start, realEnd);
  const width = r.length + 1;

  if (!u.length || !r.length) return;

  if (u.length * r.length > ALIGN_LIMIT) {
    let next = 0;
    r.forEach(node => {
      if (next < u.length && matches(u[next], node)) {
        u[next].real = node;
        next += 1;
      }
    });
    return;
  }

  // best[i * width + j]: how many of u[i..] and r[j..] can be paired.
  const best = new Int32Array((u.length + 1) * width);
  for (let i = u.length - 1; i >= 0; i -= 1) {
    for (let j = r.length - 1; j >= 0; j -= 1) {
      best[i * width + j] = matches(u[i], r[j])
        ? best[(i + 1) * width + j + 1] + 1
        : Math.max(best[(i + 1) * width + j], best[i * width + j + 1]);
    }
  }

  for (let i = 0, j = 0; i < u.length && j < r.length; ) {
    if (matches(u[i], r[j])) {
      u[i].real = r[j];
      i += 1;
      j += 1;
    } else if (best[i * width + j + 1] >= best[(i + 1) * width + j]) {
      j += 1;
    } else {
      i += 1;
    }
  }
}

/**
 * Give each text of a run its own text node, reusing the server's node for
 * the first one. The texts the browser renders win over the server's.
 */
function placeTexts(
  items: WDom[],
  parent: Node,
  before: Node | null,
  reuse?: Text
) {
  let last: Node | null = null;
  const at = reuse ? reuse.nextSibling : before;

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const text = String(item.text);
    let node: Text;

    if (reuse && index === 0) {
      node = reuse;
      if (node.data !== text) node.data = text;
    } else {
      node = document.createTextNode(text);
      parent.insertBefore(node, at);
    }

    item.el = node as unknown as HTMLElement;
    last = node;
  }

  return last;
}

/**
 * Create an element the server HTML lacks, with its whole subtree, and put it
 * before `before`. Props and events are left to the core's hydration pass.
 * Returns the node put into `parent` (none for a portal, which renders into
 * its target).
 */
function build(item: WDom, parent: Node, before: Node | null): Node | null {
  const tag = String(item.tag);
  const portal = tag === 'portal' && (item.props?.portal as Node | undefined);

  if (parent.nodeType === 9) {
    throw new Error(
      '[lithent/ssr] Hydrating document.documentElement needs a component that renders <html>.'
    );
  }

  let element: Node;
  if (portal) {
    element = portal;
  } else {
    const svgParent =
      (parent as Element).namespaceURI === SVG_NS &&
      (parent as Element).localName !== 'foreignObject';

    element =
      tag === 'svg' || svgParent
        ? document.createElementNS(SVG_NS, tag)
        : document.createElement(tag);
    parent.insertBefore(element, before);
  }

  item.el = element as HTMLElement;

  flatFragmentFromList(item.children || []).forEach(child => {
    if (child.type === 'e') {
      build(child, element, null);
    } else if (child.type === 't') {
      placeTexts([child], element, null);
    }
  });

  return portal ? null : element;
}

function warnMissing(what: string, parent: Node) {
  const name = (parent as Element).tagName
    ? `<${(parent as Element).tagName.toLowerCase()}>`
    : 'the document';

  console.warn(
    `[lithent/ssr] Hydration mismatch: ${what} inside ${name} is not in the server HTML, so it was created in the browser. Render the same component with the same props on the server and in the browser.`
  );
}

/**
 * Flattens nested fragment types.
 */
function flatFragmentFromList(wDomlist: WDom[]) {
  return wDomlist.reduce((acc: WDom[], item: WDom) => {
    if (item.type && ['f', 'l'].includes(item.type)) {
      item.el = new DocumentFragment();
      acc.push(...flatFragmentFromList(item?.children || []));
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
}
