import { mountLive } from '@/mountLive';
import type { AgentBridge } from 'lithent/agent';
import type { LiveHandle, MountLiveOptions } from '@/types';

/**
 * `<lithent-live>` (docs/agent-ui/DESIGN.md §3.1): a generated widget from
 * one tag, for React, Vue or plain pages. A plain Custom Element around
 * `mountLive`, so a page that only shows sandboxed widgets needs no lithent
 * core.
 *
 * Attributes: `code`, `mode`, `runtime-url`, `allow-network`. Properties:
 * the same plus `props`, `styles`, `theme`, `runtimeCode`, `autoResize`,
 * `timeoutMs`, and the read-only `bridge`. Events (bubbling, composed):
 * `live-ready` (`detail.bridge`) and `live-error` (`detail` is the
 * LiveError).
 */

type Options = Partial<Omit<MountLiveOptions, 'container' | 'onError'>>;

/** 'props' < 'code' < 'mount': what a batch of changes needs. */
type Change = 'props' | 'code' | 'mount';

type State = {
  o: Options;
  h?: LiveHandle;
  /** Operations run one after another. */
  q: Promise<unknown>;
  /** The pending change, flushed in a microtask. */
  c?: Change;
};

const PROPERTIES = [
  'code',
  'mode',
  'props',
  'styles',
  'theme',
  'runtimeCode',
  'runtimeUrl',
  'allowNetwork',
  'autoResize',
  'timeoutMs',
] as const;

const ATTRIBUTES: Record<string, (typeof PROPERTIES)[number]> = {
  code: 'code',
  mode: 'mode',
  'runtime-url': 'runtimeUrl',
  'allow-network': 'allowNetwork',
};

const RANK: Record<Change, number> = { props: 0, code: 1, mount: 2 };

export type LithentLiveElement = HTMLElement &
  Options & { readonly bridge: AgentBridge | undefined };

/**
 * Register `<lithent-live>` (or `name`). Returns the constructor, the one
 * already registered under that name, or undefined without Custom Elements
 * (SSR). Nothing is registered on import.
 */
export const defineLiveElement = (
  name = 'lithent-live'
): (new () => LithentLiveElement) | undefined => {
  if (typeof customElements == 'undefined') return undefined;
  const existing = customElements.get(name);
  if (existing) return existing as new () => LithentLiveElement;

  const states = new WeakMap<HTMLElement, State>();
  const stateOf = (el: HTMLElement) => states.get(el)!;

  const fire = (el: HTMLElement, type: string, detail: unknown) =>
    el.dispatchEvent(
      new CustomEvent(type, { detail, bubbles: true, composed: true })
    );

  const run = (el: HTMLElement, task: (s: State) => Promise<unknown>) => {
    const s = stateOf(el);
    // Errors already reached live-error through onError.
    s.q = s.q.then(() => task(s)).catch(() => {});
  };

  const flush = (el: HTMLElement) =>
    run(el, async s => {
      const change = s.c;
      s.c = undefined;
      if (!el.isConnected || !change) return;
      if (s.h && change == 'props') {
        await s.h.updateProps(s.o.props || {});
      } else if (s.h && change == 'code' && s.o.code) {
        await s.h.reload(s.o.code);
        fire(el, 'live-ready', { bridge: s.h.bridge });
      } else {
        if (s.h) s.h.destroy();
        s.h = undefined;
        if (!s.o.code) return;
        // The widget is isolated already (sandbox iframe, or the direct
        // mode's own shadow root): it goes straight into the element.
        if (!el.style.display) el.style.display = 'block';
        const handle = await mountLive({
          ...s.o,
          code: s.o.code,
          container: el,
          onError: error => fire(el, 'live-error', error),
        });
        // Removed while starting: do not leave it running.
        if (!el.isConnected) return handle.destroy();
        s.h = handle;
        fire(el, 'live-ready', { bridge: handle.bridge });
      }
    });

  /** Note a change; changes made in one task are applied once. */
  const change = (el: HTMLElement, kind: Change) => {
    const s = stateOf(el);
    if (s.c) {
      if (RANK[kind] > RANK[s.c]) s.c = kind;
      return;
    }
    s.c = kind;
    queueMicrotask(() => flush(el));
  };

  class LithentLive extends HTMLElement {
    static get observedAttributes() {
      return Object.keys(ATTRIBUTES);
    }

    constructor() {
      super();
      states.set(this, { o: {}, q: Promise.resolve() });
    }

    get bridge() {
      const h = stateOf(this).h;
      return h && h.bridge;
    }

    connectedCallback() {
      // Still running: the reconnect half of a move.
      if (!stateOf(this).h) change(this, 'mount');
    }

    disconnectedCallback() {
      // A move (remove and insert in one task) keeps the widget.
      queueMicrotask(() => {
        if (!this.isConnected) {
          run(this, async s => {
            if (s.h) s.h.destroy();
            s.h = undefined;
          });
        }
      });
    }

    attributeChangedCallback(
      attribute: string,
      _old: string | null,
      value: string | null
    ) {
      const key = ATTRIBUTES[attribute];
      (this as unknown as Record<string, unknown>)[key] =
        key == 'allowNetwork' ? value != null : (value ?? undefined);
    }
  }

  for (const key of PROPERTIES) {
    Object.defineProperty(LithentLive.prototype, key, {
      get(this: HTMLElement) {
        return stateOf(this).o[key];
      },
      set(this: HTMLElement, value: unknown) {
        const s = stateOf(this);
        if (s.o[key] === value) return;
        (s.o as Record<string, unknown>)[key] = value;
        change(
          this,
          key == 'props' ? 'props' : key == 'code' ? 'code' : 'mount'
        );
      },
    });
  }

  customElements.define(name, LithentLive);
  return LithentLive as unknown as new () => LithentLiveElement;
};
