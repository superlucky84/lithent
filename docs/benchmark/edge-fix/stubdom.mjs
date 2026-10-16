// A minimal DOM: just what lithent's renderer touches, every operation O(1)
// and cheap, so a benchmark on it measures the framework's own JavaScript.
class Node {
  constructor(nodeType) {
    this.nodeType = nodeType;
    this.parentNode = null;
    this.firstChild = null;
    this.lastChild = null;
    this.previousSibling = null;
    this.nextSibling = null;
  }
  _detach() {
    const p = this.parentNode;
    if (!p) return;
    if (this.previousSibling)
      this.previousSibling.nextSibling = this.nextSibling;
    else p.firstChild = this.nextSibling;
    if (this.nextSibling)
      this.nextSibling.previousSibling = this.previousSibling;
    else p.lastChild = this.previousSibling;
    this.parentNode = this.previousSibling = this.nextSibling = null;
  }
  insertBefore(node, ref) {
    if (node.nodeType === 11) {
      while (node.firstChild) this.insertBefore(node.firstChild, ref);
      return node;
    }
    if (ref && ref.parentNode !== this) throw new Error('NotFoundError');
    node._detach();
    node.parentNode = this;
    if (ref) {
      node.nextSibling = ref;
      node.previousSibling = ref.previousSibling;
      if (ref.previousSibling) ref.previousSibling.nextSibling = node;
      else this.firstChild = node;
      ref.previousSibling = node;
    } else {
      node.previousSibling = this.lastChild;
      if (this.lastChild) this.lastChild.nextSibling = node;
      else this.firstChild = node;
      this.lastChild = node;
    }
    return node;
  }
  appendChild(node) {
    return this.insertBefore(node, null);
  }
  removeChild(node) {
    if (node.parentNode !== this) throw new Error('NotFoundError');
    node._detach();
    return node;
  }
  replaceChild(node, old) {
    this.insertBefore(node, old);
    this.removeChild(old);
    return old;
  }
  remove() {
    this._detach();
  }
  replaceWith(node) {
    this.parentNode.replaceChild(node, this);
  }
  set textContent(value) {
    while (this.firstChild) this.firstChild._detach();
    if (value) this.appendChild(new Text(value));
  }
  get textContent() {
    if (this.nodeType === 3) return this.nodeValue;
    let s = '';
    for (let n = this.firstChild; n; n = n.nextSibling) s += n.textContent;
    return s;
  }
}

class Text extends Node {
  constructor(value) {
    super(3);
    this.nodeValue = value;
  }
}

class DocumentFragment extends Node {
  constructor() {
    super(11);
  }
}

class HTMLElement extends Node {
  constructor(tag) {
    super(1);
    this.tagName = tag.toUpperCase();
    this.localName = tag;
    this.attributes = {};
    this.listeners = {};
    this.style = {};
  }
  setAttribute(k, v) {
    this.attributes[k] = String(v);
  }
  setAttributeNS(_ns, k, v) {
    this.attributes[k] = String(v);
  }
  removeAttribute(k) {
    delete this.attributes[k];
  }
  getAttribute(k) {
    return k in this.attributes ? this.attributes[k] : null;
  }
  addEventListener(name, fn) {
    this.listeners[name] = fn;
  }
  removeEventListener(name) {
    delete this.listeners[name];
  }
  set innerHTML(_value) {
    this.textContent = '';
  }
}
// Element classes per tag, like the real DOM (hasAccessorMethods reads the
// prototype of each element).
class HTMLTableRowElement extends HTMLElement {}
class HTMLTableCellElement extends HTMLElement {}
class HTMLAnchorElement extends HTMLElement {}
class HTMLSpanElement extends HTMLElement {}
class HTMLTableSectionElement extends HTMLElement {}
const classes = {
  tr: HTMLTableRowElement,
  td: HTMLTableCellElement,
  a: HTMLAnchorElement,
  span: HTMLSpanElement,
  tbody: HTMLTableSectionElement,
};

const document = {
  createElement: tag => new (classes[tag] || HTMLElement)(tag),
  createElementNS: (_ns, tag) => new HTMLElement(tag),
  createTextNode: value => new Text(value),
  body: new HTMLElement('body'),
};

Object.assign(globalThis, {
  document,
  DocumentFragment,
  HTMLElement,
  Text,
  Node,
});
