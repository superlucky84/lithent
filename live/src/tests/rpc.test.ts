import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AgentBridgeEvent } from 'lithent/agent';
import {
  answerLastCall,
  begin,
  flush,
  ready,
  sandboxOf,
  TOOLS,
} from '@/tests/harness';

/**
 * Phase 4 — the host ↔ sandbox RPC (RQ-8, DC-8, DC-14): readiness, source
 * and channel checks, call/result matching, timeouts, host-side approval,
 * events, props, reload and destroy.
 */

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

const settledYet = async (promise: Promise<unknown>) => {
  let settled = false;
  promise.then(
    () => (settled = true),
    () => (settled = true)
  );
  await flush();
  return settled;
};

describe('ready (§3.4)', () => {
  it('resolves with the tools and state the sandbox reports', async () => {
    const { handle } = await ready({}, TOOLS, { counter: 3 });
    expect(handle.bridge.listTools()).toEqual(TOOLS);
    expect(handle.bridge.getState()).toEqual({ counter: 3 });
  });

  it('ignores messages from another source or channel (§3.3)', async () => {
    const { pending, sandbox } = begin();
    // Another window on the right channel.
    sandbox!.reply({ type: 'ready', tools: [], state: {} }, window);
    // The right window on another channel.
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { ch: 'forged', type: 'ready', tools: [], state: {} },
        source: sandbox!.frame.contentWindow,
      })
    );
    // Not an object at all.
    window.dispatchEvent(
      new MessageEvent('message', {
        data: null,
        source: sandbox!.frame.contentWindow,
      })
    );
    expect(await settledYet(pending)).toBe(false);

    sandbox!.reply({ type: 'ready', tools: [], state: {} });
    await expect(pending).resolves.toBeDefined();
  });
});

describe('callTool (RQ-8)', () => {
  it('posts a call on the channel and resolves with the matching result', async () => {
    const { handle, sandbox } = await ready();
    const call = handle.bridge.callTool('add', { by: 2 });
    await flush();

    expect(sandbox.sent).toEqual([
      {
        type: 'call',
        ch: sandbox.ch,
        id: expect.any(Number),
        name: 'add',
        args: { by: 2 },
      },
    ]);
    expect(
      vi.mocked(sandbox.frame.contentWindow!.postMessage).mock.calls[0][1]
    ).toBe('*');

    answerLastCall(sandbox, { ok: true, value: 2 });
    await expect(call).resolves.toEqual({ ok: true, value: 2 });
  });

  it('matches concurrent calls by id, whatever the answer order', async () => {
    const { handle, sandbox } = await ready();
    const first = handle.bridge.callTool('add', { by: 1 });
    const second = handle.bridge.callTool('add', { by: 2 });
    await flush();
    const [a, b] = sandbox.sent;
    sandbox.reply({
      type: 'result',
      id: b.id,
      result: { ok: true, value: 'second' },
    });
    sandbox.reply({
      type: 'result',
      id: a.id,
      result: { ok: true, value: 'first' },
    });
    await expect(first).resolves.toEqual({ ok: true, value: 'first' });
    await expect(second).resolves.toEqual({ ok: true, value: 'second' });
  });

  it('ignores a result from a forged source', async () => {
    const { handle, sandbox } = await ready();
    const call = handle.bridge.callTool('add', { by: 1 });
    await flush();
    const { id } = sandbox.sent[0];
    sandbox.reply(
      { type: 'result', id, result: { ok: true, value: 'forged' } },
      window
    );
    expect(await settledYet(call)).toBe(false);
    sandbox.reply({ type: 'result', id, result: { ok: true, value: 'real' } });
    await expect(call).resolves.toEqual({ ok: true, value: 'real' });
  });

  it('returns NOT_FOUND for an unknown tool without asking the sandbox', async () => {
    const { handle, sandbox } = await ready();
    await expect(handle.bridge.callTool('missing')).resolves.toMatchObject({
      ok: false,
      error: { code: 'NOT_FOUND' },
    });
    expect(sandbox.sent).toEqual([]);
  });

  it('returns TIMEOUT when the sandbox does not answer, and reports it', async () => {
    const { handle, errors } = await ready({ timeoutMs: 40 });
    await expect(
      handle.bridge.callTool('add', { by: 1 })
    ).resolves.toMatchObject({
      ok: false,
      error: { code: 'TIMEOUT' },
    });
    expect(errors.map(e => e.phase)).toEqual(['timeout']);
  });

  it('turns an invalid result into EXECUTION_ERROR', async () => {
    const { handle, sandbox } = await ready();
    const call = handle.bridge.callTool('add', { by: 1 });
    await flush();
    answerLastCall(sandbox, 'not a result');
    await expect(call).resolves.toMatchObject({
      ok: false,
      error: { code: 'EXECUTION_ERROR' },
    });
  });

  it('returns INVALID_PARAMS when the arguments cannot be posted', async () => {
    const { handle, sandbox } = await ready();
    vi.mocked(sandbox.frame.contentWindow!.postMessage).mockImplementation(
      () => {
        throw new DOMException('could not be cloned', 'DataCloneError');
      }
    );
    await expect(
      handle.bridge.callTool('add', { by: (() => 1) as unknown as number })
    ).resolves.toMatchObject({
      ok: false,
      error: {
        code: 'INVALID_PARAMS',
        message: expect.stringContaining('could not be cloned'),
      },
    });
  });
});

describe('host-side approval (DC-14)', () => {
  it('rejects without a handler and never posts the call', async () => {
    const { handle, sandbox } = await ready();
    await expect(handle.bridge.callTool('reset')).resolves.toMatchObject({
      ok: false,
      error: { code: 'REJECTED' },
    });
    expect(sandbox.sent).toEqual([]);
  });

  it('rejects when the handler refuses, and never posts the call', async () => {
    const { handle, sandbox } = await ready();
    const handler = vi.fn(() => false);
    handle.bridge.setConfirmHandler(handler);
    await expect(
      handle.bridge.callTool('reset', { why: 'x' })
    ).resolves.toMatchObject({
      ok: false,
      error: { code: 'REJECTED' },
    });
    expect(handler).toHaveBeenCalledWith({
      name: 'reset',
      description: 'Reset the counter',
      args: { why: 'x' },
    });
    expect(sandbox.sent).toEqual([]);
  });

  it('posts the call after an async approval', async () => {
    const { handle, sandbox } = await ready();
    handle.bridge.setConfirmHandler(async () => true);
    const call = handle.bridge.callTool('reset');
    await flush();
    expect(sandbox.sent.map(m => m.name)).toEqual(['reset']);
    answerLastCall(sandbox, { ok: true, value: 0 });
    await expect(call).resolves.toEqual({ ok: true, value: 0 });
  });

  it('does not ask for tools without requiresConfirm', async () => {
    const { handle, sandbox } = await ready();
    const handler = vi.fn(() => false);
    handle.bridge.setConfirmHandler(handler);
    handle.bridge.callTool('add', { by: 1 });
    await flush();
    expect(handler).not.toHaveBeenCalled();
    expect(sandbox.sent).toHaveLength(1);
  });
});

describe('events and errors after ready', () => {
  it('forwards tool and state events and keeps the caches current', async () => {
    const { handle, sandbox } = await ready();
    const events: AgentBridgeEvent[] = [];
    handle.bridge.subscribe(e => events.push(e));

    sandbox.reply({
      type: 'event',
      event: { type: 'state-changed', name: 'counter', state: { counter: 7 } },
    });
    sandbox.reply({
      type: 'event',
      event: { type: 'tools-changed', tools: [TOOLS[0]] },
    });

    expect(events).toEqual([
      { type: 'state-changed', name: 'counter', state: { counter: 7 } },
      { type: 'tools-changed', tools: [TOOLS[0]] },
    ]);
    expect(handle.bridge.getState()).toEqual({ counter: 7 });
    expect(handle.bridge.listTools()).toEqual([TOOLS[0]]);
  });

  it('reports a later sandbox error without tearing the widget down', async () => {
    const { handle, sandbox, errors } = await ready();
    sandbox.reply({
      type: 'error',
      error: { phase: 'render', message: 'oops' },
    });
    expect(errors).toEqual([{ phase: 'render', message: 'oops' }]);
    expect(sandbox.frame.isConnected).toBe(true);
    expect(handle.bridge.listTools()).toHaveLength(2);
  });
});

describe('updateProps (§3.2)', () => {
  it('posts the props and resolves on the ack', async () => {
    const { handle, sandbox } = await ready();
    const update = handle.updateProps({ label: 'b' });
    await flush();
    const message = sandbox.sent[0];
    expect(message).toEqual({
      type: 'props',
      ch: sandbox.ch,
      id: expect.any(Number),
      props: { label: 'b' },
    });
    expect(await settledYet(update)).toBe(false);
    sandbox.reply({ type: 'ack', id: message.id });
    await expect(update).resolves.toBeUndefined();
  });

  it('rejects with a timeout error when there is no ack', async () => {
    const { handle } = await ready({ timeoutMs: 40 });
    await expect(handle.updateProps({ label: 'b' })).rejects.toMatchObject({
      phase: 'timeout',
    });
  });
});

describe('reload and destroy (§3.2)', () => {
  it('reload replaces the sandbox and keeps the subscribers', async () => {
    const { handle, sandbox, container } = await ready();
    const events: AgentBridgeEvent[] = [];
    handle.bridge.subscribe(e => events.push(e));
    const pendingCall = handle.bridge.callTool('add', { by: 1 });
    await flush();

    const reloading = handle.reload('return lmount(() => () => null)');
    expect(sandbox.frame.isConnected).toBe(false);
    await expect(pendingCall).resolves.toMatchObject({
      error: { code: 'NOT_FOUND' },
    });

    const next = sandboxOf(container.querySelector('iframe')!);
    expect(next.ch).not.toBe(sandbox.ch);
    // The old channel is dead.
    sandbox.reply(
      { type: 'ready', tools: [], state: {} },
      next.frame.contentWindow
    );
    next.reply({ type: 'ready', tools: [TOOLS[0]], state: { counter: 0 } });
    await reloading;

    expect(events).toEqual([
      { type: 'tools-changed', tools: [] },
      { type: 'tools-changed', tools: [TOOLS[0]] },
      { type: 'state-changed', state: { counter: 0 } },
    ]);
    expect(container.querySelectorAll('iframe')).toHaveLength(1);
  });

  it('reload rejects with the new code error and leaves no sandbox', async () => {
    const { handle, container, errors } = await ready();
    const reloading = handle.reload('return 1');
    const next = sandboxOf(container.querySelector('iframe')!);
    next.reply({
      type: 'error',
      error: { phase: 'compile', message: 'not a component' },
    });
    await expect(reloading).rejects.toMatchObject({ phase: 'compile' });
    expect(container.querySelector('iframe')).toBeNull();
    expect(handle.bridge.listTools()).toEqual([]);
    expect(errors.map(e => e.phase)).toEqual(['compile']);
  });

  it('destroy removes the sandbox, answers pending calls and stops listening', async () => {
    const { handle, sandbox, container } = await ready();
    const events: AgentBridgeEvent[] = [];
    handle.bridge.subscribe(e => events.push(e));
    const pendingCall = handle.bridge.callTool('add', { by: 1 });
    await flush();

    handle.destroy();
    expect(container.querySelector('iframe')).toBeNull();
    await expect(pendingCall).resolves.toMatchObject({
      error: { code: 'NOT_FOUND' },
    });
    expect(events).toEqual([{ type: 'tools-changed', tools: [] }]);

    // Later messages and calls go nowhere.
    sandbox.reply({
      type: 'event',
      event: { type: 'state-changed', state: { counter: 9 } },
    });
    expect(handle.bridge.getState()).toEqual({});
    await expect(
      handle.bridge.callTool('add', { by: 1 })
    ).resolves.toMatchObject({
      error: { code: 'NOT_FOUND' },
    });
    await expect(handle.reload('return 1')).rejects.toMatchObject({
      phase: 'mount',
    });
    expect(events).toHaveLength(1);
  });
});
