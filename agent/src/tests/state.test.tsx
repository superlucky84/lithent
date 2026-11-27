import { afterEach, describe, expect, it, vi } from 'vitest';
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
 * Phase 1 — agentState (RQ-2, DC-12): snapshots, change notification after
 * plain UI input and actions, removal on unmount, failing getters.
 */

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const inScope = (bridge: AgentBridge, child: WDom) =>
  render(<AgentScope bridge={bridge}>{child}</AgentScope>);

const record = (bridge: AgentBridge) => {
  const events: AgentBridgeEvent[] = [];
  bridge.subscribe(event => events.push(event));
  return events;
};

const stateEvents = (events: AgentBridgeEvent[]) =>
  events.filter(e => e.type === 'state-changed');

/** lmount: one lstate changed by a plain button and by an action. */
const Slider = lmount(() => {
  const value = lstate(10);
  const setValue = agentAction({
    name: 'set_value',
    description: 'Set the slider',
    params: { value: { type: Number, required: true } },
    run: ({ value: next }) => {
      value.value = next;
    },
  });
  agentState('slider', () => ({ value: value.value }));
  return () => (
    <div>
      <button id="plain" onClick={() => (value.value += 1)}>
        {value.value}
      </button>
      <button id="action" onClick={() => setValue({ value: 50 })} />
    </div>
  );
});

/** mount: closure state redrawn with renew(), no action involved. */
const Toggle = mount(renew => {
  let on = false;
  agentState('toggle', () => on);
  return () => (
    <button
      onClick={() => {
        on = !on;
        renew();
      }}
    >
      {String(on)}
    </button>
  );
});

const click = (container: HTMLElement, selector = 'button') =>
  (container.querySelector(selector) as HTMLButtonElement).click();

describe('getState — snapshots (RQ-2)', () => {
  it('returns every registered state as JSON-safe values', () => {
    const bridge = createAgentBridge();
    inScope(
      bridge,
      <div>
        <Slider />
        <Toggle />
      </div>
    );
    expect(bridge.getState()).toEqual({
      slider: { value: 10 },
      toggle: false,
    });
  });

  it('returns copies, not the component objects', () => {
    const bridge = createAgentBridge();
    const items = [{ id: 1 }];
    const List = mount(() => {
      agentState('items', () => items);
      return () => <i />;
    });
    inScope(bridge, <List />);

    const snapshot = bridge.getState().items as { id: number }[];
    expect(snapshot).toEqual(items);
    expect(snapshot).not.toBe(items);
    snapshot[0].id = 99;
    expect(items[0].id).toBe(1);
  });
});

describe('subscribe — state changes (RQ-2, §2.3)', () => {
  it('reports a direct call that changes state and then throws', async () => {
    const bridge = createAgentBridge();
    let step: () => unknown = () => undefined;
    const Failing = mount(() => {
      let count = 0;
      step = agentAction({
        name: 'step_then_fail',
        description: 'Step, then fail',
        run: () => {
          count += 1;
          throw new Error('after the change');
        },
      });
      agentState('steps', () => count);
      return () => <i />;
    });
    inScope(bridge, <Failing />);
    const events = record(bridge);

    expect(() => step()).toThrow('after the change');
    await act();

    expect(stateEvents(events)).toEqual([
      { type: 'state-changed', name: 'steps', state: { steps: 1 } },
    ]);
  });

  it('lmount: hears about a plain UI change made without an action', async () => {
    const bridge = createAgentBridge();
    const { container } = inScope(bridge, <Slider />);
    const events = record(bridge);

    click(container, '#plain');
    await act();

    expect(stateEvents(events)).toEqual([
      {
        type: 'state-changed',
        name: 'slider',
        state: { slider: { value: 11 } },
      },
    ]);
  });

  it('mount: hears about a renew() after a plain click', async () => {
    const bridge = createAgentBridge();
    const { container } = inScope(bridge, <Toggle />);
    const events = record(bridge);

    click(container);
    await act();

    expect(stateEvents(events)).toEqual([
      { type: 'state-changed', name: 'toggle', state: { toggle: true } },
    ]);
  });

  it('reports an action once, whether a person or an agent called it', async () => {
    const bridge = createAgentBridge();
    const { container } = inScope(bridge, <Slider />);
    const events = record(bridge);

    click(container, '#action');
    await act();
    expect(stateEvents(events)).toEqual([
      {
        type: 'state-changed',
        name: 'slider',
        state: { slider: { value: 50 } },
      },
    ]);

    events.length = 0;
    await bridge.callTool('set_value', { value: 70 });
    await act();
    expect(stateEvents(events)).toEqual([
      {
        type: 'state-changed',
        name: 'slider',
        state: { slider: { value: 70 } },
      },
    ]);
  });

  it('stays quiet when an update leaves the snapshot unchanged', async () => {
    const bridge = createAgentBridge();
    let renewIt = () => false as boolean;
    const Same = mount(renew => {
      renewIt = renew;
      agentState('same', () => 'constant');
      return () => <i />;
    });
    inScope(bridge, <Same />);
    const events = record(bridge);

    renewIt();
    await act();
    expect(events).toEqual([]);
  });

  it('merges changes in one microtask into one event without a name', async () => {
    const bridge = createAgentBridge();
    let setA: (args: { v: number }) => unknown = () => undefined;
    let setB: (args: { v: number }) => unknown = () => undefined;
    const Pair = mount(() => {
      let a = 0;
      let b = 0;
      const params = { v: { type: Number, required: true } } as const;
      setA = agentAction({
        name: 'set_a',
        description: 'Set a',
        params,
        run: ({ v }) => (a = v),
      });
      setB = agentAction({
        name: 'set_b',
        description: 'Set b',
        params,
        run: ({ v }) => (b = v),
      });
      agentState('a', () => a);
      agentState('b', () => b);
      return () => <i />;
    });
    inScope(bridge, <Pair />);
    const events = record(bridge);

    setA({ v: 1 });
    setB({ v: 2 });
    setA({ v: 3 });
    await act();

    expect(stateEvents(events)).toEqual([
      { type: 'state-changed', name: undefined, state: { a: 3, b: 2 } },
    ]);
  });

  it('notifyStateChange reports at once, with the given name', () => {
    const bridge = createAgentBridge();
    let count = 0;
    const Manual = mount(() => {
      agentState('manual', () => count);
      return () => <i />;
    });
    inScope(bridge, <Manual />);
    const events = record(bridge);

    count = 5;
    bridge.notifyStateChange('manual');
    expect(events).toEqual([
      { type: 'state-changed', name: 'manual', state: { manual: 5 } },
    ]);
  });
});

describe('lifecycle of a state (RQ-2, RQ-3)', () => {
  it('appears on mount and disappears on unmount, with an event each time', async () => {
    const bridge = createAgentBridge();
    const events = record(bridge);
    let show = true;
    let renewHost = () => false as boolean;
    const Host = mount(renew => {
      renewHost = renew;
      return () => <div>{show ? <Toggle /> : null}</div>;
    });
    inScope(bridge, <Host />);

    expect(bridge.getState()).toEqual({ toggle: false });
    expect(stateEvents(events)).toEqual([
      { type: 'state-changed', name: 'toggle', state: { toggle: false } },
    ]);

    show = false;
    renewHost();
    await act();

    expect(bridge.getState()).toEqual({});
    expect(stateEvents(events).at(-1)).toEqual({
      type: 'state-changed',
      name: 'toggle',
      state: {},
    });
  });
});

describe('failing and unusual getters (DC-12)', () => {
  it('isolates a throwing getter and warns once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const bridge = createAgentBridge();
    const Bad = mount(() => {
      agentState('bad', () => {
        throw new Error('getter broke');
      });
      agentState('good', () => 1);
      return () => <i />;
    });
    inScope(bridge, <Bad />);

    expect(bridge.getState()).toEqual({
      bad: { __agentStateError: 'getter broke' },
      good: 1,
    });
    bridge.getState();
    expect(
      warn.mock.calls.filter(c => String(c[0]).includes('"bad"'))
    ).toHaveLength(1);
  });

  it('isolates a circular value', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const bridge = createAgentBridge();
    const loop: Record<string, unknown> = {};
    loop.self = loop;
    const Circular = mount(() => {
      agentState('loop', () => loop);
      return () => <i />;
    });
    inScope(bridge, <Circular />);

    const state = bridge.getState().loop as { __agentStateError: string };
    expect(typeof state.__agentStateError).toBe('string');
  });

  it('turns BigInt into a string and drops what JSON cannot hold', () => {
    const bridge = createAgentBridge();
    const Odd = mount(() => {
      agentState('odd', () => ({
        big: 10n,
        fn: () => 1,
        missing: undefined,
        list: [undefined, 1],
      }));
      agentState('nothing', () => undefined);
      return () => <i />;
    });
    inScope(bridge, <Odd />);

    expect(bridge.getState()).toEqual({
      odd: { big: '10', list: [null, 1] },
      nothing: null,
    });
  });
});
