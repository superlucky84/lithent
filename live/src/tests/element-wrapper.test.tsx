import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineLiveElement } from '@/index';
import type { LithentLiveElement, LiveError } from '@/index';
import { flush, sandboxOf, SILENT_RUNTIME, TOOLS } from '@/tests/harness';
import type { AgentBridge } from 'lithent/agent';

/**
 * Phase 5 — `<lithent-live>` (§3.1): one tag for a generated widget on any
 * page. Attribute and property changes, el.bridge, events, moves and
 * removal. The sandbox is played by the test (jsdom does not run srcdoc).
 */

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

defineLiveElement();

const make = (code = 'return lmount(() => () => fTags.p({}, "hi"))') => {
  const el = document.createElement('lithent-live') as LithentLiveElement;
  el.runtimeCode = SILENT_RUNTIME;
  el.setAttribute('code', code);
  const events: { type: string; detail: unknown }[] = [];
  for (const type of ['live-ready', 'live-error']) {
    el.addEventListener(type, e =>
      events.push({ type, detail: (e as CustomEvent).detail })
    );
  }
  return { el, events };
};

const frameOf = (el: HTMLElement) => el.querySelector('iframe');

/** Wait for the element to open a sandbox and answer `ready`. */
const readyUp = async (el: HTMLElement, tools: unknown[] = TOOLS) => {
  await flush();
  const sandbox = sandboxOf(frameOf(el)!);
  sandbox.reply({ type: 'ready', tools, state: { counter: 0 } });
  await flush();
  return sandbox;
};

describe('defineLiveElement (§3.1)', () => {
  it('registers once and returns the constructor', () => {
    const ctor = customElements.get('lithent-live');
    expect(ctor).toBeTypeOf('function');
    expect(defineLiveElement()).toBe(ctor);
    expect(defineLiveElement('my-live')).toBe(customElements.get('my-live'));
  });

  it('returns undefined without Custom Elements (SSR)', () => {
    vi.stubGlobal('customElements', undefined);
    expect(defineLiveElement('ssr-live')).toBeUndefined();
    vi.unstubAllGlobals();
  });
});

describe('<lithent-live> lifecycle', () => {
  it('mounts on connect, fires live-ready and exposes el.bridge', async () => {
    const { el, events } = make();
    document.body.appendChild(el);
    const sandbox = await readyUp(el);

    expect(events).toEqual([
      { type: 'live-ready', detail: { bridge: expect.any(Object) } },
    ]);
    const bridge = el.bridge as AgentBridge;
    expect(bridge).toBe((events[0].detail as { bridge: AgentBridge }).bridge);
    expect(bridge.listTools().map(t => t.name)).toEqual(['add', 'reset']);

    const call = bridge.callTool('add', { by: 1 });
    await flush();
    const posted = sandbox.sent.find(m => m.type == 'call')!;
    sandbox.reply({
      type: 'result',
      id: posted.id,
      result: { ok: true, value: 1 },
    });
    await expect(call).resolves.toEqual({ ok: true, value: 1 });
  });

  it('applies changes made in one task together: one sandbox', async () => {
    const el = document.createElement('lithent-live') as LithentLiveElement;
    document.body.appendChild(el);
    el.setAttribute('code', 'return 1');
    el.runtimeCode = SILENT_RUNTIME;
    el.setAttribute('allow-network', '');
    await flush();
    expect(el.querySelectorAll('iframe')).toHaveLength(1);
    expect(el.allowNetwork).toBe(true);
    expect(frameOf(el)!.srcdoc).not.toContain('Content-Security-Policy');
  });

  it('reloads on a new code attribute and fires live-ready again', async () => {
    const { el, events } = make();
    document.body.appendChild(el);
    const first = await readyUp(el);

    el.setAttribute('code', 'return lmount(() => () => fTags.b({}, "v2"))');
    await flush();
    expect(first.frame.isConnected).toBe(false);
    const second = sandboxOf(frameOf(el)!);
    expect(second.ch).not.toBe(first.ch);
    second.reply({ type: 'ready', tools: [], state: {} });
    await flush();
    expect(events.map(e => e.type)).toEqual(['live-ready', 'live-ready']);
    expect(el.bridge!.listTools()).toEqual([]);
  });

  it('sends new props without restarting', async () => {
    const { el } = make();
    document.body.appendChild(el);
    const sandbox = await readyUp(el);
    el.props = { label: 'b' };
    await flush();
    expect(sandbox.frame.isConnected).toBe(true);
    expect(sandbox.sent).toEqual([
      expect.objectContaining({ type: 'props', props: { label: 'b' } }),
    ]);
  });

  it('restarts when the mode or the runtime changes', async () => {
    const { el } = make();
    document.body.appendChild(el);
    const first = await readyUp(el);
    el.setAttribute('runtime-url', 'https://cdn.test/sandboxRuntime.umd.js');
    el.runtimeCode = undefined;
    await flush();
    expect(first.frame.isConnected).toBe(false);
    expect(frameOf(el)!.srcdoc).toContain(
      'src="https://cdn.test/sandboxRuntime.umd.js"'
    );
  });

  it('fires live-error when the widget fails to start', async () => {
    const { el, events } = make();
    document.body.appendChild(el);
    await flush();
    sandboxOf(frameOf(el)!).reply({
      type: 'error',
      error: { phase: 'compile', message: "Unexpected token '<'" },
    });
    await flush();
    expect(events).toEqual([
      {
        type: 'live-error',
        detail: expect.objectContaining({
          phase: 'compile',
          hint: expect.stringMatching(/JSX/),
        }),
      },
    ]);
    expect(el.bridge).toBeUndefined();
    expect(frameOf(el)).toBeNull();
  });

  it('keeps the widget across a move', async () => {
    const { el } = make();
    const a = document.body.appendChild(document.createElement('div'));
    const b = document.body.appendChild(document.createElement('div'));
    a.appendChild(el);
    const sandbox = await readyUp(el);
    b.appendChild(el);
    await flush();
    expect(sandbox.frame.isConnected).toBe(true);
    expect(el.bridge!.listTools()).toHaveLength(2);
  });

  it('destroys the widget after removal', async () => {
    const { el } = make();
    document.body.appendChild(el);
    const sandbox = await readyUp(el);
    const bridge = el.bridge!;
    el.remove();
    await flush();
    expect(sandbox.frame.isConnected).toBe(false);
    expect(el.bridge).toBeUndefined();
    expect(bridge.listTools()).toEqual([]);
  });

  it("runs trusted code in mode 'direct'", async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errors: LiveError[] = [];
    const el = document.createElement('lithent-live') as LithentLiveElement;
    el.setAttribute('mode', 'direct');
    el.setAttribute(
      'code',
      'return lmount(props => { agentState("label", () => props.label); return () => fTags.p({}, props.label); })'
    );
    el.props = { label: 'direct!' };
    el.addEventListener('live-error', e =>
      errors.push((e as CustomEvent).detail)
    );
    const ready = new Promise(resolve =>
      el.addEventListener('live-ready', resolve)
    );
    document.body.appendChild(el);
    await ready;
    expect(errors).toEqual([]);
    // The direct mode's own shadow root, inside the element.
    expect(el.firstElementChild!.shadowRoot!.textContent).toContain('direct!');
    expect(el.style.display).toBe('block');
    expect(el.bridge!.getState()).toEqual({ label: 'direct!' });
  });
});
