import { h, mount, render } from 'lithent';
import type { Props, TagFunction } from 'lithent';

/**
 * Prop declarations for `defineElement`. Each key is a camelCase prop name
 * observed as its kebab-case attribute; the constructor picks the attribute
 * conversion (DESIGN §4.1).
 */
export type PropSpec = Record<
  string,
  StringConstructor | NumberConstructor | BooleanConstructor | ObjectConstructor
>;

/** The prop type a constructor declares (DESIGN §8). */
type PropType<C> = C extends NumberConstructor
  ? number
  : C extends BooleanConstructor
    ? boolean
    : C extends StringConstructor
      ? string
      : unknown;

/**
 * Props a declaration produces. Every prop can be absent (no attribute, no
 * property yet) except Boolean ones, which start as `false` (DESIGN §4.1).
 */
export type PropsOf<S extends PropSpec> = {
  [K in keyof S as S[K] extends BooleanConstructor ? K : never]: boolean;
} & {
  [K in keyof S as S[K] extends BooleanConstructor ? never : K]?: PropType<
    S[K]
  >;
};

/** What the inner component receives: the declared props and `host`. */
export type ElementProps<S extends PropSpec> = PropsOf<S> & {
  host: HTMLElement;
};

/** The element `defineElement` registers, with a property per prop. */
export type LithentElementOf<S extends PropSpec> = HTMLElement & PropsOf<S>;

export type DefineElementOptions<S extends PropSpec = PropSpec> = {
  props?: S;
  shadow?: boolean | 'open' | 'closed';
  styles?: string[];
};

/**
 * Render roots by element. Kept outside the element because a closed shadow
 * root is not on `shadowRoot` and must not leak through a property. (A module
 * WeakMap instead of a `#private` field: the field compiles to helpers that
 * cost more bytes than this whole file — RC-3.)
 */
const roots = new WeakMap<HTMLElement, ShadowRoot | HTMLElement>();

/**
 * Attribute string -> prop value (DESIGN §4.1). `null` means the attribute is
 * absent. Invalid numbers and JSON become `undefined` without a warning: the
 * runtime packages have no dev-only build to keep warnings out of production.
 */
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

/**
 * Dispatch a DOM event from the element (DC-5). It is dispatched on the
 * element itself, so it bubbles to the host page; `composed` lets it also
 * leave an outer shadow root when the element is nested in another
 * component. It is cancelable: returns `false` when a listener called
 * `preventDefault()`.
 *
 * ```ts
 * const PayButton = mount<{ amount: number; host: HTMLElement }>(
 *   (_renew, props) => () =>
 *     h('button', { onClick: () => emit(props.host, 'pay', props.amount) }, 'Pay')
 * );
 * ```
 */
export const emit = (host: Element, name: string, detail?: unknown) =>
  host.dispatchEvent(
    new CustomEvent(name, {
      detail,
      bubbles: true,
      composed: true,
      cancelable: true,
    })
  );

/**
 * Register a lithent component as a Custom Element.
 *
 * The element owns the props and renders a small Host component that holds
 * `renew`; the user's component sits under it unchanged (DESIGN §2).
 * Returns `undefined` where Custom Elements do not exist (SSR, Node), and the
 * existing constructor when the name is already taken (DC-7).
 */
export const defineElement = <
  // `host` is reserved (DC-5): declaring it is a type error as well.
  S extends PropSpec & { host?: never } = Record<never, never>,
>(
  name: `${string}-${string}`,
  // `S` is inferred from `props` only: it sits in a mapped type here, which
  // TypeScript does not infer from (checked in Phase 7; no NoInfer needed).
  component: (props: ElementProps<S>, children?: never) => unknown,
  options: DefineElementOptions<S> = {}
): (new () => LithentElementOf<S>) | undefined => {
  if (typeof customElements === 'undefined') return undefined;

  const existing = customElements.get(name);
  if (existing) return existing as new () => LithentElementOf<S>;

  const { shadow = true, props: spec = {} as S, styles } = options;
  // DC-5: `host` is the prop that carries the element itself.
  if ('host' in spec) throw Error('"host" is reserved');
  // FR-6: styles apply only inside a shadow root (DESIGN §5); one sheet per
  // definition, shared by every instance and created on first use.
  const css = shadow && styles ? styles.join('\n') : '';
  let sheet: CSSStyleSheet | undefined;

  // FR-3: kebab-case attribute -> camelCase prop key.
  const keyOf: Record<string, string> = {};
  for (const key in spec) {
    keyOf[key.replace(/[A-Z]/g, c => '-' + c.toLowerCase())] = key;
  }
  const observed = Object.keys(keyOf);

  class LithentElement extends HTMLElement {
    // `declare` keeps these out of the emitted class-field helpers (RC-3).
    /** Current props, owned by the element. */
    declare p: Props;
    /** `destroy` returned by `render`, set while mounted. */
    declare d?: () => void;
    /** The Host component's `renew`, set while mounted. */
    declare r?: () => void;

    // A getter rather than a static field: static fields compile to helpers.
    static get observedAttributes() {
      return observed;
    }

    constructor() {
      super();
      // An absent Boolean attribute is `false`, before any attribute callback.
      this.p = {};
      for (const key in spec) {
        if (spec[key] === Boolean) this.p[key] = false;
        // FR-4: a value assigned before the element was defined is an own
        // property that hides the prototype accessor. Move it through the
        // accessor (DESIGN §4.2). Upgrades run this constructor on that object.
        const self = this as unknown as Props;
        if (Object.prototype.hasOwnProperty.call(self, key)) {
          const value = self[key];
          delete self[key];
          self[key] = value;
        }
      }
    }

    connectedCallback() {
      // Still mounted: this is the reconnect half of a move (DC-4).
      if (this.d) return;

      // DC-8: open shadow root by default; `shadow: false` renders into the
      // element itself. A shadow root survives disconnects, so reuse it.
      let root = roots.get(this);
      if (!root) {
        root = shadow
          ? this.attachShadow({ mode: shadow === 'closed' ? 'closed' : 'open' })
          : this;
        roots.set(this, root);
        // Styles go in once per root: the root, and a fallback <style> in it,
        // outlive disconnects (DESIGN §5, R-2).
        if (css) {
          if ('adoptedStyleSheets' in root) {
            if (!sheet) {
              sheet = new CSSStyleSheet();
              sheet.replaceSync(css);
            }
            (root as ShadowRoot).adoptedStyleSheets = [sheet];
          } else {
            const style = document.createElement('style');
            style.textContent = css;
            root.appendChild(style);
          }
        }
      }
      // DC-6: in light DOM the element owns its children; drop server
      // fallback content (or anything added while detached) before rendering.
      if (!shadow) this.textContent = '';

      const Host = mount(renew => {
        this.r = renew;
        return () =>
          h(component as unknown as TagFunction, { ...this.p, host: this });
      });

      // DC-9: `render` only appends into its wrapper, so a ShadowRoot works.
      this.d = render(h(Host, {}), root as unknown as HTMLElement);
    }

    disconnectedCallback() {
      // DC-4: keep the instance across a move. A single-call move
      // (appendChild, insertBefore) runs this after the element is back, so
      // isConnected is already true; a remove() then insert in the same task
      // is caught by waiting a microtask. connectedCallback sees `d` and
      // does nothing.
      queueMicrotask(() => {
        if (!this.isConnected && this.d) {
          this.d();
          this.d = this.r = undefined;
        }
      });
    }

    attributeChangedCallback(
      attr: string,
      _old: string | null,
      value: string | null
    ) {
      const key = keyOf[attr];
      this.p[key] = convert(spec[key], value);
      // Before the first connect there is no renew: the first render reads p.
      // renew is batched per microtask, so N changes in one task render once.
      if (this.r) this.r();
    }
  }

  // FR-4: every declared prop is also a property. Values pass through
  // unconverted (objects, arrays, functions) and are not reflected (DC-3).
  for (const key in spec) {
    Object.defineProperty(LithentElement.prototype, key, {
      get(this: LithentElement) {
        return this.p[key];
      },
      set(this: LithentElement, value: unknown) {
        this.p[key] = value;
        if (this.r) this.r();
      },
    });
  }

  customElements.define(name, LithentElement);
  return LithentElement as unknown as new () => LithentElementOf<S>;
};
