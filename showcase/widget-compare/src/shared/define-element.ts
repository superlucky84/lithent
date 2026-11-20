/**
 * The Custom Element wrapper of the React and Preact versions. It does what
 * lithent/element does for the lithent version and no more
 * (docs/widget-compare/DESIGN.md DC-3), and its bytes count in both bundles
 * as lithent/element's count in lithent's:
 *
 * - each declared prop is a kebab-case attribute, converted by its
 *   constructor (String, Number, Boolean, Object as JSON), and a camelCase
 *   property that takes any value;
 * - a value assigned before the element was defined is taken over;
 * - an open shadow root with the styles as one shared constructed sheet
 *   (a <style> where constructed sheets are missing);
 * - changes in one task render once;
 * - a move keeps the instance: it is unmounted only if still detached a
 *   microtask after `disconnectedCallback`.
 */

type PropSpec = Record<
  string,
  StringConstructor | NumberConstructor | BooleanConstructor | ObjectConstructor
>;

/** How a framework puts the component into the shadow root and takes it out. */
export type Renderer = {
  render(root: ShadowRoot, props: Record<string, unknown>): void;
  unmount(root: ShadowRoot): void;
};

type State = {
  p: Record<string, unknown>;
  root?: ShadowRoot;
  mounted?: boolean;
  queued?: boolean;
};

/** Dispatch a DOM event from the element, with lithent/element's defaults. */
export const emit = (host: Element, name: string, detail?: unknown) =>
  host.dispatchEvent(
    new CustomEvent(name, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail,
    })
  );

const convert = (type: PropSpec[string], value: string | null): unknown => {
  if (type === Boolean) return value !== null;
  if (value === null) return undefined;
  if (type === Number) return isNaN(+value) ? undefined : +value;
  if (type === Object) {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }
  return value;
};

export const defineElement = (
  name: string,
  spec: PropSpec,
  styles: string,
  renderer: Renderer
) => {
  if (customElements.get(name)) return;

  const states = new WeakMap<HTMLElement, State>();
  const stateOf = (el: HTMLElement) => states.get(el)!;
  const keyOf: Record<string, string> = {};
  const attrOf: Record<string, string> = {};
  for (const key in spec)
    keyOf[(attrOf[key] = key.replace(/[A-Z]/g, c => '-' + c.toLowerCase()))] =
      key;
  let sheet: CSSStyleSheet | undefined;

  const flush = (el: HTMLElement) => {
    const state = stateOf(el);
    state.queued = false;
    if (state.mounted) renderer.render(state.root!, { ...state.p, host: el });
  };

  const update = (el: HTMLElement, key: string, value: unknown) => {
    const state = stateOf(el);
    state.p[key] = value;
    if (state.mounted && !state.queued) {
      state.queued = true;
      queueMicrotask(() => flush(el));
    }
  };

  class WidgetElement extends HTMLElement {
    static get observedAttributes() {
      return Object.keys(keyOf);
    }

    constructor() {
      super();
      const state: State = { p: {} };
      states.set(this, state);
      for (const key in spec) if (spec[key] === Boolean) state.p[key] = false;
    }

    connectedCallback() {
      const state = stateOf(this);
      if (state.mounted) return;

      for (const key in spec) {
        if (Object.hasOwn(this, key)) {
          const self = this as unknown as Record<string, unknown>;
          const value = self[key];
          delete self[key];
          self[key] = value;
        }
      }

      let root = state.root;
      if (!root) {
        root = state.root = this.attachShadow({ mode: 'open' });
        // undefined on browsers without constructed sheets (Safari < 16.4).
        if (root.adoptedStyleSheets) {
          if (!sheet) {
            sheet = new CSSStyleSheet();
            sheet.replaceSync(styles);
          }
          root.adoptedStyleSheets = [sheet];
        } else {
          const style = document.createElement('style');
          style.textContent = styles;
          root.appendChild(style);
        }
      }
      state.mounted = true;
      flush(this);
    }

    disconnectedCallback() {
      const state = stateOf(this);
      queueMicrotask(() => {
        if (!this.isConnected && state.mounted) {
          state.mounted = false;
          renderer.unmount(state.root!);
        }
      });
    }

    attributeChangedCallback(
      attr: string,
      _old: string | null,
      value: string | null
    ) {
      const key = keyOf[attr];
      update(this, key, convert(spec[key], value));
    }
  }

  for (const key in spec) {
    Object.defineProperty(WidgetElement.prototype, key, {
      get(this: HTMLElement) {
        return stateOf(this).p[key];
      },
      set(this: HTMLElement, value: unknown) {
        update(
          this,
          key,
          value === undefined
            ? convert(spec[key], this.getAttribute(attrOf[key]))
            : value
        );
      },
    });
  }

  customElements.define(name, WidgetElement);
};
