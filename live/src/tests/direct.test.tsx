import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AgentBridgeEvent } from 'lithent/agent';
import { mountLive } from '@/index';
import type { LiveError, MountLiveOptions } from '@/index';

/**
 * Phase 5 — mode 'direct' (RQ-7, §3.2, §3.3): the runtime in this page, in a
 * shadow root, with the page's lithent, behind the same LiveHandle. jsdom
 * runs it for real here (no iframe).
 */

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

const COUNTER = `
return lmount(props => {
  const count = lstate(props.start || 0);
  agentAction({
    name: 'add',
    description: 'Add',
    params: { by: { type: Number, required: true } },
    run: ({ by }) => { count.value += by; return count.value; },
  });
  agentAction({ name: 'wipe', description: 'Wipe', confirm: true, run: () => { count.value = 0; return 0; } });
  agentState('counter', () => ({ count: count.value, label: props.label }));
  return () => fTags.p({ class: 'out' }, props.label + ':' + count.value);
});`;

const direct = async (options: Partial<MountLiveOptions> = {}) => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  const container = document.body.appendChild(document.createElement('div'));
  const errors: LiveError[] = [];
  const handle = await mountLive({
    code: COUNTER,
    container,
    mode: 'direct',
    props: { start: 2, label: 'n' },
    onError: error => errors.push(error),
    ...options,
  });
  const host = () => container.firstElementChild as HTMLElement;
  const text = () => host().shadowRoot!.textContent;
  return { container, handle, errors, host, text };
};

describe("mode 'direct' (§3.2)", () => {
  it('warns once that the code runs in this page', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const container = document.body.appendChild(document.createElement('div'));
    await mountLive({ code: COUNTER, container, mode: 'direct' });
    await mountLive({ code: COUNTER, container, mode: 'direct' });
    const direct = warn.mock.calls.filter(c =>
      String(c[0]).includes("mode 'direct'")
    );
    expect(direct).toHaveLength(1);
  });

  it('needs no sandbox runtime and draws in a shadow root (§3.3)', async () => {
    const { container, host, text, handle } = await direct();
    expect(container.querySelector('iframe')).toBeNull();
    expect(host().shadowRoot).not.toBeNull();
    expect(text()).toBe('n:2');
    // The widget's nodes are not in the page's light DOM.
    expect(container.querySelector('.out')).toBeNull();
    expect(host().shadowRoot!.querySelector('.out')).not.toBeNull();
    expect(handle.bridge.getState()).toEqual({
      counter: { count: 2, label: 'n' },
    });
  });

  it('puts styles and theme tokens in the shadow root', async () => {
    const { host } = await direct({
      styles: ['.out { color: var(--brand) }'],
      theme: { '--brand': '#0064ff', bad: 'x', '--evil': 'red}body{' },
    });
    const css = Array.from(
      host().shadowRoot!.querySelectorAll('style'),
      s => s.textContent
    );
    expect(css).toEqual([
      ':host{--brand:#0064ff}',
      '.out { color: var(--brand) }',
    ]);
  });

  it('drives the same LiveHandle: callTool, state, approval', async () => {
    const { handle, text } = await direct();
    expect(await handle.bridge.callTool('add', { by: 3 })).toEqual({
      ok: true,
      value: 5,
    });
    expect(handle.bridge.getState()).toEqual({
      counter: { count: 5, label: 'n' },
    });
    expect(text()).toBe('n:5');

    expect(await handle.bridge.callTool('add', { by: 'x' })).toMatchObject({
      ok: false,
      error: { code: 'INVALID_PARAMS' },
    });
    expect(await handle.bridge.callTool('wipe')).toMatchObject({
      ok: false,
      error: { code: 'REJECTED' },
    });
    handle.bridge.setConfirmHandler(() => true);
    expect(await handle.bridge.callTool('wipe')).toEqual({
      ok: true,
      value: 0,
    });
  });

  it('keeps closure state across updateProps', async () => {
    const { handle, text } = await direct();
    await handle.bridge.callTool('add', { by: 1 });
    await handle.updateProps({ start: 2, label: 'm' });
    expect(text()).toBe('m:3');
    expect(handle.bridge.getState()).toEqual({
      counter: { count: 3, label: 'm' },
    });
  });

  it('reload replaces the widget and its shadow root', async () => {
    const { handle, container, host, text } = await direct();
    const events: AgentBridgeEvent[] = [];
    handle.bridge.subscribe(e => events.push(e));
    const before = host();
    await handle.reload('return lmount(() => () => fTags.b({}, "fresh"))');
    expect(before.isConnected).toBe(false);
    expect(container.children).toHaveLength(1);
    expect(text()).toBe('fresh');
    expect(handle.bridge.listTools()).toEqual([]);
    expect(events[0]).toEqual({ type: 'tools-changed', tools: [] });
  });

  it('destroy unmounts and removes the shadow host', async () => {
    const { handle, container } = await direct();
    handle.destroy();
    expect(container.children).toHaveLength(0);
    await expect(
      handle.bridge.callTool('add', { by: 1 })
    ).resolves.toMatchObject({
      error: { code: 'NOT_FOUND' },
    });
  });

  it('rejects a widget that fails to start and leaves nothing behind', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const container = document.body.appendChild(document.createElement('div'));
    await expect(
      mountLive({
        code: 'return lmount(() => { throw new Error("in mounter"); })',
        container,
        mode: 'direct',
      })
    ).rejects.toMatchObject({ phase: 'mount', message: 'in mounter' });
    expect(container.children).toHaveLength(0);
  });
});
