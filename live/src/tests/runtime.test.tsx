import { afterEach, describe, expect, it, vi } from 'vitest';
import { boot } from '@/runtime/boot';
import { watchHeight } from '@/runtime/entry';
import { symbolNames } from '@/runtime/symbols';
import type { LiveRpcMessage } from '@/index';

/**
 * Phase 4 — the sandbox side (DC-6, DC-14, §3.4), run in-process with a fake
 * transport: compile, draw, ready, calls, props, errors. A real iframe run
 * is checked in the browser (Phase 8 E2E).
 */

afterEach(() => {
  document.body.innerHTML = '';
});

/**
 * Wait for the answer to request `id`. The runtime answers after a macrotask
 * (§3.4 "응답 순서"); a fixed delay was too short under a loaded test run.
 */
const answered = (posted: LiveRpcMessage[], type: string, id: number) =>
  vi.waitFor(() => {
    if (!posted.some(m => m.type == type && 'id' in m && m.id == id)) {
      throw new Error(`no ${type} for ${id} yet`);
    }
  });

/** A fake host: records posts (cloned like postMessage) and can send. */
const host = () => {
  const posted: LiveRpcMessage[] = [];
  let handler: (message: LiveRpcMessage) => void = () => {};
  let listening = true;
  return {
    posted,
    io: {
      post: (message: LiveRpcMessage) => {
        posted.push(structuredClone(message));
      },
      listen: (fn: (message: LiveRpcMessage) => void) => {
        handler = fn;
        return () => {
          listening = false;
        };
      },
    },
    send: (message: Record<string, unknown>) =>
      handler({ ch: 'ch1', ...message } as LiveRpcMessage),
    isListening: () => listening,
  };
};

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
  agentAction({ name: 'leak', description: 'Leak', run: () => () => 'a function' });
  agentState('counter', () => ({ count: count.value, label: props.label }));
  return () => fTags.p({ id: 'out' }, props.label + ':' + count.value);
});`;

const start = (code: string, props: Record<string, unknown> = {}) => {
  const root = document.body.appendChild(document.createElement('div'));
  const fake = host();
  const teardown = boot(
    { ch: 'ch1', code, props, origin: 'https://host.test' },
    root,
    fake.io
  );
  return { root, teardown, ...fake };
};

const ofType = (posted: LiveRpcMessage[], type: string) =>
  posted.filter(m => m.type == type);

describe('starting a widget (DC-6)', () => {
  it('compiles a function body that uses the injected symbols, draws it and reports ready', () => {
    const { root, posted } = start(COUNTER, { start: 2, label: 'n' });
    expect(root.textContent).toBe('n:2');
    expect(posted).toEqual([
      {
        ch: 'ch1',
        type: 'ready',
        tools: [
          expect.objectContaining({ name: 'add' }),
          expect.objectContaining({ name: 'wipe', requiresConfirm: true }),
          expect.objectContaining({ name: 'leak' }),
        ],
        state: { counter: { count: 2, label: 'n' } },
      },
    ]);
  });

  it('injects every DC-6 symbol by name', () => {
    expect(symbolNames).toEqual([
      'mount',
      'lmount',
      'h',
      'Fragment',
      'ref',
      'mountCallback',
      'updateCallback',
      'nextTick',
      'state',
      'lstate',
      'computed',
      'effect',
      'store',
      'lstore',
      'fTags',
      'fFragment',
      'fMount',
      'flMount',
      'lTag',
      'agentAction',
      'agentState',
    ]);
    const code = `
      const kinds = [${symbolNames.map(n => `typeof ${n}`).join(', ')}];
      return mount(() => () => h('i', {}, kinds.join(',')));`;
    const { root } = start(code);
    const kinds = root.textContent!.split(',');
    expect(kinds).toHaveLength(symbolNames.length);
    expect(kinds.every(kind => kind == 'function' || kind == 'object')).toBe(
      true
    );
  });

  it('accepts the tag template (lTag) form too', () => {
    const { root, posted } = start(
      'return mount(() => () => lTag`<b>tagged</b>`);'
    );
    expect(root.textContent).toBe('tagged');
    expect(posted[0].type).toBe('ready');
  });
});

describe('start errors (§3.4)', () => {
  it.each([
    ['a syntax error', 'return lmount(() => () => fTags.p({}, "x"', 'compile'],
    ['a top-level throw', 'throw new Error("top")', 'compile'],
    ['no component', 'return 42;', 'compile'],
    [
      'a mounter that throws',
      'return lmount(() => { throw new Error("in mounter"); })',
      'mount',
    ],
  ])('reports %s as a %s error and does not start', (_label, code, phase) => {
    const { posted, teardown } = start(code);
    expect(teardown).toBeUndefined();
    expect(posted).toEqual([
      {
        ch: 'ch1',
        type: 'error',
        error: expect.objectContaining({ phase, message: expect.any(String) }),
      },
    ]);
  });
});

describe('answering the host', () => {
  it('runs a call and reports the state change before the result', async () => {
    const { send, posted, root } = start(COUNTER, { start: 1, label: 'n' });
    send({ type: 'call', id: 7, name: 'add', args: { by: 4 } });
    await answered(posted, 'result', 7);

    const after = posted.slice(1);
    expect(after.map(m => m.type)).toEqual(['event', 'result']);
    expect(after[0]).toMatchObject({
      type: 'event',
      event: {
        type: 'state-changed',
        state: { counter: { count: 5, label: 'n' } },
      },
    });
    expect(after[1]).toEqual({
      ch: 'ch1',
      type: 'result',
      id: 7,
      result: { ok: true, value: 5 },
    });
    expect(root.textContent).toBe('n:5');
  });

  it('checks arguments inside the sandbox too', async () => {
    const { send, posted } = start(COUNTER);
    send({ type: 'call', id: 1, name: 'add', args: { by: 'x' } });
    await answered(posted, 'result', 1);
    expect(ofType(posted, 'result')[0]).toMatchObject({
      result: { ok: false, error: { code: 'INVALID_PARAMS' } },
    });
  });

  it('runs a confirm action without asking again: the host approved it (DC-14)', async () => {
    const { send, posted } = start(COUNTER, { start: 3 });
    send({ type: 'call', id: 2, name: 'wipe' });
    await answered(posted, 'result', 2);
    expect(ofType(posted, 'result')[0]).toMatchObject({
      result: { ok: true, value: 0 },
    });
  });

  it('answers with EXECUTION_ERROR when a result cannot be posted', async () => {
    const { send, posted } = start(COUNTER);
    send({ type: 'call', id: 3, name: 'leak' });
    await answered(posted, 'result', 3);
    expect(ofType(posted, 'result')[0]).toMatchObject({
      id: 3,
      result: {
        ok: false,
        error: {
          code: 'EXECUTION_ERROR',
          message: expect.stringContaining('cannot be sent'),
        },
      },
    });
  });

  it('takes new props, keeps the closure state and acks after the state event', async () => {
    const { send, posted, root } = start(COUNTER, { start: 1, label: 'a' });
    send({ type: 'call', id: 1, name: 'add', args: { by: 1 } });
    await answered(posted, 'result', 1);
    posted.length = 0;

    send({ type: 'props', id: 9, props: { start: 1, label: 'b' } });
    await answered(posted, 'ack', 9);

    expect(root.textContent).toBe('b:2');
    expect(posted.map(m => m.type)).toEqual(['event', 'ack']);
    expect(posted[1]).toEqual({ ch: 'ch1', type: 'ack', id: 9 });
  });

  it('forwards tool changes made inside the widget', async () => {
    const code = `
      return lmount(() => {
        const show = lstate(false);
        const Extra = lmount(() => { agentAction({ name: 'extra', description: 'Extra', run: () => 1 }); return () => fTags.i({}); });
        agentAction({ name: 'toggle', description: 'Toggle', run: () => { show.value = !show.value; } });
        return () => fTags.div({}, show.value ? h(Extra, {}) : null);
      });`;
    const { send, posted } = start(code);
    send({ type: 'call', id: 1, name: 'toggle' });
    await answered(posted, 'result', 1);
    const toolEvents = posted.filter(
      m => m.type == 'event' && m.event.type == 'tools-changed'
    ) as Extract<LiveRpcMessage, { type: 'event' }>[];
    expect(toolEvents.at(-1)!.event).toMatchObject({
      tools: [
        expect.objectContaining({ name: 'toggle' }),
        expect.objectContaining({ name: 'extra' }),
      ],
    });
  });

  it('teardown unmounts and stops listening', () => {
    const fake = start(COUNTER, { label: 'x' });
    expect(fake.root.textContent).toBe('x:0');
    fake.teardown!();
    expect(fake.root.textContent).toBe('');
    expect(fake.isListening()).toBe(false);
  });
});

describe('watchHeight (DC-8)', () => {
  it('reports each new content height and stops on request', () => {
    let notify = () => {};
    let disconnected = false;
    class FakeObserver {
      constructor(callback: () => void) {
        notify = callback;
      }
      observe() {}
      disconnect() {
        disconnected = true;
      }
    }
    vi.stubGlobal('ResizeObserver', FakeObserver);
    let height = 40.2;
    const target = { getBoundingClientRect: () => ({ height }) } as Element;
    const reported: number[] = [];
    const stop = watchHeight(target, h => reported.push(h));

    notify();
    notify(); // same height: not reported again
    height = 80;
    notify();
    stop();

    expect(reported).toEqual([41, 80]);
    expect(disconnected).toBe(true);
    vi.unstubAllGlobals();
  });

  it('does nothing without ResizeObserver', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    const stop = watchHeight(document.body, () => {
      throw new Error('should not report');
    });
    expect(() => stop()).not.toThrow();
    vi.unstubAllGlobals();
  });
});
