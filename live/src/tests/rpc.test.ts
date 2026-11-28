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
    const save = {
      name: 'save',
      description: 'Save a record',
      inputSchema: {
        type: 'object',
        properties: { record: { type: 'object' } },
        additionalProperties: false,
      },
    };
    const { handle, sandbox } = await ready({}, [save]);
    vi.mocked(sandbox.frame.contentWindow!.postMessage).mockImplementation(
      () => {
        throw new DOMException('could not be cloned', 'DataCloneError');
      }
    );
    await expect(
      handle.bridge.callTool('save', { record: { at: () => 1 } })
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
    // `why` is not declared: the approval sees the arguments that would run
    // (DC-11), as with a lithent/agent bridge.
    expect(handler).toHaveBeenCalledWith({
      name: 'reset',
      description: 'Reset the counter',
      args: {},
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

describe('resize (DC-8)', () => {
  it('fits the iframe to the reported height', async () => {
    const { sandbox } = await ready();
    sandbox.reply({ type: 'resize', height: 123.5 });
    expect(sandbox.frame.style.height).toBe('123.5px');
    // Nonsense heights are ignored.
    sandbox.reply({ type: 'resize', height: -1 });
    sandbox.reply({ type: 'resize', height: 'tall' });
    expect(sandbox.frame.style.height).toBe('123.5px');
  });

  it('leaves the height alone with autoResize: false', async () => {
    const { sandbox } = await ready({ autoResize: false });
    sandbox.reply({ type: 'resize', height: 300 });
    expect(sandbox.frame.style.height).toBe('');
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

/*
 * Phase 4–6 review: a start cut short, untrusted sandbox messages, the
 * argument check before approval, and a sandbox that cannot be set up.
 */

describe('a start cut short by reload or destroy', () => {
  it('a reload while another is starting closes the first sandbox', async () => {
    const { handle, container, errors } = await ready();
    const first = handle.reload('return 1');
    const a = sandboxOf(container.querySelector('iframe')!);
    const second = handle.reload('return 2');

    await expect(first).rejects.toMatchObject({ phase: 'mount' });
    expect(a.frame.isConnected).toBe(false);
    const b = sandboxOf(container.querySelector('iframe')!);
    b.reply({ type: 'ready', tools: [TOOLS[0]], state: { from: 'b' } });
    await second;

    expect(container.querySelectorAll('iframe')).toHaveLength(1);
    expect(handle.bridge.getState()).toEqual({ from: 'b' });
    // The caller cut it short: not a widget failure.
    expect(errors).toEqual([]);
  });

  it('destroy while a reload is starting removes it and leaves no timer', async () => {
    const { handle, container, errors } = await ready({ timeoutMs: 30 });
    const reloading = handle.reload('return 1');
    const a = sandboxOf(container.querySelector('iframe')!);
    const win = a.frame.contentWindow;
    handle.destroy();

    await expect(reloading).rejects.toMatchObject({ phase: 'mount' });
    expect(container.querySelector('iframe')).toBeNull();
    // Its late ready, and the timeout it had, change nothing.
    a.reply({ type: 'ready', tools: TOOLS, state: { late: true } }, win);
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(handle.bridge.listTools()).toEqual([]);
    expect(handle.bridge.getState()).toEqual({});
    expect(errors).toEqual([]);
  });
});

describe('untrusted sandbox messages (§3.3)', () => {
  it('keeps listTools and getState working when ready has the wrong shapes', async () => {
    const { sandbox, pending } = begin();
    sandbox!.reply({ type: 'ready', tools: null, state: undefined });
    const handle = await pending;
    expect(handle.bridge.listTools()).toEqual([]);
    expect(handle.bridge.getState()).toEqual({});
  });

  it('ignores malformed events and keeps the caches plain', async () => {
    const { handle, sandbox } = await ready();
    const events: AgentBridgeEvent[] = [];
    handle.bridge.subscribe(e => events.push(e));

    sandbox.reply({ type: 'event', event: null });
    sandbox.reply({ type: 'event', event: { type: 'other' } });
    sandbox.reply({
      type: 'event',
      event: { type: 'tools-changed', tools: [null, { name: 7 }, TOOLS[0]] },
    });
    sandbox.reply({
      type: 'event',
      event: { type: 'state-changed', name: 5, state: [1, 2] },
    });
    sandbox.reply({
      type: 'event',
      event: { type: 'state-changed', state: { big: 1n } },
    });

    expect(events).toEqual([
      { type: 'tools-changed', tools: [TOOLS[0]] },
      { type: 'state-changed', state: {} },
      { type: 'state-changed', state: {} },
    ]);
    expect(handle.bridge.listTools()).toEqual([TOOLS[0]]);
    expect(handle.bridge.getState()).toEqual({});
  });

  it('turns a malformed error into a LiveError', async () => {
    const { sandbox, errors } = await ready();
    sandbox.reply({ type: 'error', error: null });
    sandbox.reply({ type: 'error', error: 'boom' });
    expect(errors).toEqual([
      { phase: 'render', message: 'null' },
      { phase: 'render', message: 'boom' },
    ]);
  });

  it('ignores a height that is not a finite number', async () => {
    const { sandbox } = await ready();
    sandbox.reply({ type: 'resize', height: 80 });
    sandbox.reply({ type: 'resize', height: Infinity });
    sandbox.reply({ type: 'resize', height: '9000' });
    expect(sandbox.frame.style.height).toBe('80px');
  });
});

describe('arguments are checked before approval (DC-5, DC-11)', () => {
  it('returns INVALID_PARAMS without asking or posting', async () => {
    const { handle, sandbox } = await ready();
    const handler = vi.fn(() => true);
    handle.bridge.setConfirmHandler(handler);
    await expect(handle.bridge.callTool('add', {})).resolves.toEqual({
      ok: false,
      error: {
        code: 'INVALID_PARAMS',
        message: 'Invalid arguments for "add": by (required).',
        details: [{ param: 'by', issue: 'required' }],
      },
    });
    await expect(
      handle.bridge.callTool('add', [] as unknown as Record<string, unknown>)
    ).resolves.toMatchObject({ error: { code: 'INVALID_PARAMS' } });
    expect(handler).not.toHaveBeenCalled();
    expect(sandbox.sent).toEqual([]);
  });

  it('posts only the declared arguments', async () => {
    const { handle, sandbox } = await ready();
    handle.bridge.callTool('add', { by: 2, extra: 'x' });
    await flush();
    expect(sandbox.sent[0]).toMatchObject({ type: 'call', args: { by: 2 } });
    expect(sandbox.sent[0].args).toEqual({ by: 2 });
  });

  it('does not throw on a malformed input schema from the sandbox', async () => {
    const odd = [
      { name: 'a', inputSchema: null },
      { name: 'b', inputSchema: { properties: { x: null }, required: 5 } },
      { name: 'c', inputSchema: { properties: { x: { enum: 'yes' } } } },
    ];
    // Nobody answers the calls that pass: they end in TIMEOUT.
    const { handle } = await ready({ timeoutMs: 20 }, odd);
    for (const name of ['a', 'b', 'c']) {
      const call = handle.bridge.callTool(name, { x: 1 });
      await expect(call).resolves.toHaveProperty('ok');
    }
  });
});

describe('a sandbox that cannot be set up', () => {
  it('rejects with a LiveError for a runtimeUrl that is not a URL, with no late timeout', async () => {
    const { pending, errors, container } = begin({
      runtimeCode: undefined,
      runtimeUrl: 'http://[',
      timeoutMs: 30,
    });
    await expect(pending).rejects.toMatchObject({
      phase: 'mount',
      message: expect.stringContaining('could not be set up'),
    });
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(errors.map(e => e.phase)).toEqual(['mount']);
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('rejects with a LiveError for props that are not JSON', async () => {
    const props: Record<string, unknown> = {};
    props.self = props;
    const { pending } = begin({ props });
    await expect(pending).rejects.toMatchObject({ phase: 'mount' });
  });
});
