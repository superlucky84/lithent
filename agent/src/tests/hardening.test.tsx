import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { h, mount, lmount } from 'lithent';
import type { WDom } from 'lithent';
import { lstate } from 'lithent/helper';
import { act, cleanup, render } from 'lithent/test';
import {
  AgentScope,
  agentAction,
  agentState,
  createAgentBridge,
} from '@/index';
import type { AgentBridge, AgentBridgeEvent } from '@/index';

/**
 * Phase 7 — hardening (docs/agent-ui IMPLEMENT.md): state values JSON
 * cannot hold (DC-12), hostile arguments (DC-11), calls that outlive their
 * component or re-enter the bridge, many registrations coming and going,
 * and the tool-name rule (DC-15). No test may leave an unhandled rejection.
 */

const rejections: unknown[] = [];
const onRejection = (reason: unknown) => rejections.push(reason);

beforeEach(() => {
  rejections.length = 0;
  process.on('unhandledRejection', onRejection);
});

afterEach(async () => {
  // Let late promise jobs settle before counting.
  await new Promise(resolve => setTimeout(resolve, 5));
  process.off('unhandledRejection', onRejection);
  cleanup();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  expect(rejections).toEqual([]);
});

const inScope = (bridge: AgentBridge, child: WDom) =>
  render(<AgentScope bridge={bridge}>{child}</AgentScope>);

/** Render `child()` under a host that can drop it. */
const toggleable = (bridge: AgentBridge, child: () => WDom) => {
  let show = true;
  let renewHost = () => false as boolean;
  const Host = mount(renew => {
    renewHost = renew;
    return () => <div>{show ? child() : null}</div>;
  });
  inScope(bridge, <Host />);
  return async (next: boolean) => {
    show = next;
    renewHost();
    await act();
  };
};

const events = (bridge: AgentBridge) => {
  const seen: AgentBridgeEvent[] = [];
  bridge.subscribe(event => seen.push(event));
  return seen;
};

describe('state values JSON cannot hold (DC-12)', () => {
  it('isolates a getter that throws something other than an Error', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const bridge = createAgentBridge();
    const Odd = mount(() => {
      agentState('text', () => {
        throw 'plain text';
      });
      agentState('empty', () => {
        throw null;
      });
      agentState('fine', () => 'ok');
      return () => <i />;
    });
    inScope(bridge, <Odd />);
    expect(bridge.getState()).toEqual({
      text: { __agentStateError: 'plain text' },
      empty: { __agentStateError: 'null' },
      fine: 'ok',
    });
  });

  it('isolates a value whose toJSON throws, keeping the other keys', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const bridge = createAgentBridge();
    const Odd = mount(() => {
      agentState('bad', () => ({
        toJSON: () => {
          throw new Error('no JSON for you');
        },
      }));
      agentState('good', () => [1, 2]);
      return () => <i />;
    });
    inScope(bridge, <Odd />);
    expect(bridge.getState()).toEqual({
      bad: { __agentStateError: 'no JSON for you' },
      good: [1, 2],
    });
  });

  it('follows JSON rules for nested BigInt, symbols, dates and non-finite numbers', () => {
    const bridge = createAgentBridge();
    const at = new Date(Date.UTC(2026, 10, 28));
    const Odd = mount(() => {
      agentState('mixed', () => ({
        ids: [1n, { deep: 2n }],
        tag: Symbol('x'),
        at,
        nan: NaN,
        inf: -Infinity,
        list: [() => 1, Symbol('y')],
      }));
      return () => <i />;
    });
    inScope(bridge, <Odd />);
    expect(bridge.getState()).toEqual({
      mixed: {
        ids: ['1', { deep: '2' }],
        at: at.toISOString(),
        nan: null,
        inf: null,
        list: [null, null],
      },
    });
  });

  it('does not report a getter that keeps failing the same way as a change', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const bridge = createAgentBridge();
    let renewIt = () => false as boolean;
    const Bad = mount(renew => {
      renewIt = renew;
      agentState('bad', () => {
        throw new Error('always');
      });
      return () => <i />;
    });
    inScope(bridge, <Bad />);
    const seen = events(bridge);
    for (let i = 0; i < 5; i++) {
      renewIt();
      await act();
    }
    expect(seen).toEqual([]);
  });

  it('shows the value again once a failing getter recovers, warning only once', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const bridge = createAgentBridge();
    let broken = true;
    const Flaky = mount(() => {
      agentState('flaky', () => {
        if (broken) throw new Error('not yet');
        return 'ready';
      });
      return () => <i />;
    });
    inScope(bridge, <Flaky />);
    expect(bridge.getState().flaky).toEqual({ __agentStateError: 'not yet' });
    broken = false;
    expect(bridge.getState().flaky).toBe('ready');
    broken = true;
    bridge.getState();
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

describe('hostile arguments (DC-11)', () => {
  const echo = () => {
    const bridge = createAgentBridge();
    const runs: Record<string, unknown>[] = [];
    const Echo = mount(() => {
      agentAction({
        name: 'echo',
        description: 'Echo',
        params: { by: { type: Number, required: true }, list: Array },
        run: args => {
          runs.push(args);
          return Object.keys(args);
        },
      });
      return () => <i />;
    });
    inScope(bridge, <Echo />);
    return { bridge, runs };
  };

  it('strips __proto__ and constructor keys and pollutes nothing', async () => {
    const { bridge, runs } = echo();
    const args = JSON.parse(
      '{"by": 1, "__proto__": {"polluted": true}, "constructor": {"x": 1}}'
    );
    expect(await bridge.callTool('echo', args)).toEqual({
      ok: true,
      value: ['by'],
    });
    expect(Object.getPrototypeOf(runs[0])).toBe(Object.prototype);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it('rejects NaN and Infinity, and accepts -0 and a large array', async () => {
    const { bridge } = echo();
    for (const by of [NaN, Infinity, -Infinity]) {
      expect(await bridge.callTool('echo', { by })).toMatchObject({
        ok: false,
        error: { code: 'INVALID_PARAMS' },
      });
    }
    const list = Array.from({ length: 10_000 }, (_, i) => i);
    expect(await bridge.callTool('echo', { by: -0, list })).toEqual({
      ok: true,
      value: ['by', 'list'],
    });
  });

  it('never throws: arguments whose reading throws come back as a failed result', async () => {
    const { bridge } = echo();
    const args = {
      get by() {
        throw new Error('getter trap');
      },
    };
    await expect(bridge.callTool('echo', args)).resolves.toEqual({
      ok: false,
      error: { code: 'INVALID_PARAMS', message: 'getter trap' },
    });
  });
});

describe('calls that outlive their component or re-enter the bridge', () => {
  it('a run that rejects after its component unmounted is an EXECUTION_ERROR, with no event', async () => {
    const bridge = createAgentBridge();
    let fail = (_error: Error) => {};
    const Slow = mount(() => {
      agentAction({
        name: 'slow',
        description: 'Slow',
        run: () =>
          new Promise((_resolve, reject) => {
            fail = reject;
          }),
      });
      agentState('slow', () => 1);
      return () => <i />;
    });
    const setShow = toggleable(bridge, () => <Slow />);
    const pending = bridge.callTool('slow');
    await setShow(false);
    const seen = events(bridge);
    fail(new Error('late failure'));
    expect(await pending).toEqual({
      ok: false,
      error: { code: 'EXECUTION_ERROR', message: 'late failure' },
    });
    await act();
    expect(seen).toEqual([]);
    expect(bridge.getState()).toEqual({});
  });

  it('an action can call another tool of the same bridge', async () => {
    const bridge = createAgentBridge();
    const Pair = lmount(() => {
      const count = lstate(0);
      agentAction({
        name: 'add',
        description: 'Add',
        params: { by: { type: Number, required: true } },
        run: ({ by }) => (count.value += by),
      });
      agentAction({
        name: 'add_twice',
        description: 'Add twice',
        params: { by: { type: Number, required: true } },
        run: async ({ by }) => {
          await bridge.callTool('add', { by });
          const second = await bridge.callTool('add', { by });
          return second.ok ? second.value : -1;
        },
      });
      agentState('count', () => count.value);
      return () => <i>{count.value}</i>;
    });
    inScope(bridge, <Pair />);
    const seen = events(bridge);
    expect(await bridge.callTool('add_twice', { by: 2 })).toEqual({
      ok: true,
      value: 4,
    });
    await act();
    expect(bridge.getState()).toEqual({ count: 4 });
    expect(seen.at(-1)).toEqual({
      type: 'state-changed',
      name: 'count',
      state: { count: 4 },
    });
  });

  it('a listener that calls a tool on every change settles instead of looping', async () => {
    const bridge = createAgentBridge();
    const Capped = lmount(() => {
      const count = lstate(0);
      agentAction({
        name: 'bump',
        description: 'Bump up to 3',
        run: () => (count.value = Math.min(count.value + 1, 3)),
      });
      agentState('count', () => count.value);
      return () => <i>{count.value}</i>;
    });
    inScope(bridge, <Capped />);
    let calls = 0;
    bridge.subscribe(event => {
      if (event.type == 'state-changed' && calls < 50) {
        calls++;
        bridge.callTool('bump');
      }
    });
    await bridge.callTool('bump');
    for (let i = 0; i < 10; i++) await act();
    expect(bridge.getState()).toEqual({ count: 3 });
    expect(calls).toBe(3);
  });

  it('a listener may unsubscribe itself while an event is delivered', async () => {
    const bridge = createAgentBridge();
    const order: string[] = [];
    const stop = bridge.subscribe(() => {
      order.push('once');
      stop();
    });
    bridge.subscribe(() => order.push('always'));
    bridge.notifyStateChange();
    bridge.notifyStateChange();
    expect(order).toEqual(['once', 'always', 'always']);
  });

  it('dispose during a call: the call resolves, nothing is left or reported', async () => {
    const bridge = createAgentBridge();
    let finish = () => {};
    const Slow = mount(() => {
      agentAction({
        name: 'slow',
        description: 'Slow',
        run: () =>
          new Promise<string>(resolve => {
            finish = () => resolve('done');
          }),
      });
      return () => <i />;
    });
    inScope(bridge, <Slow />);
    const listener = vi.fn();
    bridge.subscribe(listener);
    const pending = bridge.callTool('slow');
    bridge.dispose();
    listener.mockClear();
    finish();
    expect(await pending).toEqual({ ok: true, value: 'done' });
    await act();
    expect(listener).not.toHaveBeenCalled();
    expect(bridge.listTools()).toEqual([]);
    expect(await bridge.callTool('slow')).toMatchObject({
      error: { code: 'NOT_FOUND' },
    });
  });
});

describe('many registrations coming and going', () => {
  const Widget = mount<{ id: string }>((_renew, props) => {
    agentAction({
      name: 'read',
      description: 'Read',
      scopeId: props.id,
      run: () => props.id,
    });
    agentAction({
      name: 'write',
      description: 'Write',
      scopeId: props.id,
      confirm: true,
      run: () => props.id,
    });
    agentState('value', () => props.id, { scopeId: props.id });
    return () => <i>{props.id}</i>;
  });

  it('100 mount and unmount cycles leave no tool, state or stray event', async () => {
    const bridge = createAgentBridge();
    const setShow = toggleable(bridge, () => <Widget id="w" />);
    const seen = events(bridge);
    for (let i = 0; i < 100; i++) {
      await setShow(false);
      await setShow(true);
    }
    expect(bridge.listTools().map(t => t.name)).toEqual([
      'w__read',
      'w__write',
    ]);
    await setShow(false);
    expect(bridge.listTools()).toEqual([]);
    expect(bridge.getState()).toEqual({});
    seen.length = 0;
    bridge.notifyStateChange();
    expect(seen).toEqual([{ type: 'state-changed', state: {} }]);
  });

  it('100 instances at once, each in its own scope, and all of them gone after', async () => {
    const bridge = createAgentBridge();
    const ids = Array.from({ length: 100 }, (_, i) => `w${i}`);
    const setShow = toggleable(bridge, () => (
      <div>
        {ids.map(id => (
          <Widget id={id} />
        ))}
      </div>
    ));
    expect(bridge.listTools()).toHaveLength(200);
    expect(Object.keys(bridge.getState())).toHaveLength(100);
    expect((await bridge.callTool('w42__read')).ok).toBe(true);
    await setShow(false);
    expect(bridge.listTools()).toEqual([]);
    expect(bridge.getState()).toEqual({});
  });

  it('100 subscribe and unsubscribe pairs leave no listener', () => {
    const bridge = createAgentBridge();
    const listener = vi.fn();
    for (let i = 0; i < 100; i++) bridge.subscribe(listener)();
    bridge.notifyStateChange();
    expect(listener).not.toHaveBeenCalled();
  });

  it('100 changes in one task are reported as one event', async () => {
    const bridge = createAgentBridge();
    const Many = lmount(() => {
      const count = lstate(0);
      agentAction({
        name: 'bump',
        description: 'Bump',
        run: () => ++count.value,
      });
      agentState('count', () => count.value);
      return () => <i>{count.value}</i>;
    });
    inScope(bridge, <Many />);
    const seen = events(bridge);
    await Promise.all(
      Array.from({ length: 100 }, () => bridge.callTool('bump'))
    );
    await act();
    expect(seen.filter(e => e.type == 'state-changed')).toEqual([
      { type: 'state-changed', name: 'count', state: { count: 100 } },
    ]);
  });
});

describe('tool names (DC-15, DESIGN §2.5)', () => {
  it('scoped names keep the provider rule when the parts do', () => {
    const bridge = createAgentBridge();
    const scopes = ['cart', 'Cart-2', 'a_b', 'x9'];
    const Named = mount<{ scope: string }>((_renew, props) => {
      agentAction({
        name: 'add_item',
        description: 'Add',
        scopeId: props.scope,
        run: () => 1,
      });
      return () => <i />;
    });
    inScope(
      bridge,
      <div>
        {scopes.map(scope => (
          <Named scope={scope} />
        ))}
      </div>
    );
    const names = bridge.listTools().map(t => t.name);
    expect(names).toEqual(scopes.map(scope => `${scope}__add_item`));
    for (const name of names) expect(name).toMatch(/^[a-zA-Z0-9_-]+$/);
  });

  it('does not check names: one outside the rule is registered as given', () => {
    const bridge = createAgentBridge();
    const Dotted = mount(() => {
      agentAction({ name: 'cart.add', description: 'Add', run: () => 1 });
      return () => <i />;
    });
    inScope(bridge, <Dotted />);
    expect(bridge.listTools().map(t => t.name)).toEqual(['cart.add']);
  });
});
