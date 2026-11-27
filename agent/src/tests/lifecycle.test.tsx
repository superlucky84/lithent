import { afterEach, describe, expect, it, vi } from 'vitest';
import { h, mount, lmount, mountCallback } from 'lithent';
import type { WDom } from 'lithent';
import { act, cleanup, render } from 'lithent/test';
import {
  AgentScope,
  agentAction,
  agentState,
  createAgentBridge,
  defaultAgentBridge,
  useAgentBridge,
} from '@/index';
import type { AgentBridge, AgentBridgeEvent } from '@/index';

/**
 * Phase 1 — lifecycle (RQ-3), bridges and scopes (RQ-4), name conflicts
 * (DC-3) and declarations made in the wrong place (§2.3).
 */

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

const names = (bridge: AgentBridge) => bridge.listTools().map(t => t.name);

/** A component declaring one action and one state under `name`. */
const makeWidget = (name: string, scopeId?: string) =>
  mount<{ tag?: string }>((_renew, props) => {
    agentAction({
      name,
      description: `${name} action`,
      scopeId,
      run: () => props.tag ?? name,
    });
    agentState(name, () => props.tag ?? name, { scopeId });
    return () => <i>{props.tag ?? name}</i>;
  });

/** Render `child` under a host whose `show` flag can drop it. */
const toggleable = (bridge: AgentBridge, child: () => WDom) => {
  let show = true;
  let renewHost = () => false as boolean;
  const Host = mount(renew => {
    renewHost = renew;
    return () => <div>{show ? child() : null}</div>;
  });
  render(
    <AgentScope bridge={bridge}>
      <Host />
    </AgentScope>
  );
  return async (next: boolean) => {
    show = next;
    renewHost();
    await act();
  };
};

describe('mount and unmount (RQ-3)', () => {
  it.each([
    ['mount', mount],
    ['lmount', lmount],
  ] as const)(
    '%s: registers on mount and unregisters on unmount',
    async (_label, define) => {
      const bridge = createAgentBridge();
      const events: AgentBridgeEvent[] = [];
      bridge.subscribe(e => events.push(e));
      const Widget = (define as typeof mount)(() => {
        agentAction({ name: 'ping', description: 'Ping', run: () => 'pong' });
        agentState('ping_state', () => 1);
        return () => <i />;
      });
      const setShow = toggleable(bridge, () => <Widget />);

      expect(names(bridge)).toEqual(['ping']);
      expect(bridge.getState()).toEqual({ ping_state: 1 });
      expect(events.filter(e => e.type === 'tools-changed')).toHaveLength(1);

      await setShow(false);
      expect(names(bridge)).toEqual([]);
      expect(bridge.getState()).toEqual({});
      expect(events.filter(e => e.type === 'tools-changed').at(-1)).toEqual({
        type: 'tools-changed',
        tools: [],
      });
      expect((await bridge.callTool('ping')).ok).toBe(false);

      await setShow(true);
      expect(names(bridge)).toEqual(['ping']);
      expect(await bridge.callTool('ping')).toEqual({
        ok: true,
        value: 'pong',
      });
    }
  );

  it('an in-flight call still resolves after its component unmounts', async () => {
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
    const setShow = toggleable(bridge, () => <Slow />);

    const pending = bridge.callTool('slow');
    await setShow(false);
    finish();
    expect(await pending).toEqual({ ok: true, value: 'done' });
    expect((await bridge.callTool('slow')).ok).toBe(false);
  });
});

describe('which bridge a declaration uses (RQ-4, §2.4)', () => {
  it('uses defaultAgentBridge without a scope', async () => {
    const Widget = makeWidget('default_only');
    const { unmount } = render(<Widget />);
    expect(names(defaultAgentBridge)).toContain('default_only');
    unmount();
    await act();
    expect(names(defaultAgentBridge)).not.toContain('default_only');
  });

  it('keeps two scopes apart, even with the same names', async () => {
    const left = createAgentBridge();
    const right = createAgentBridge();
    const Widget = makeWidget('shared_name');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <div>
        <AgentScope bridge={left}>
          <Widget tag="left" />
        </AgentScope>
        <AgentScope bridge={right}>
          <Widget tag="right" />
        </AgentScope>
      </div>
    );

    expect(warn).not.toHaveBeenCalled();
    expect(await left.callTool('shared_name')).toEqual({
      ok: true,
      value: 'left',
    });
    expect(await right.callTool('shared_name')).toEqual({
      ok: true,
      value: 'right',
    });
    expect(left.getState()).toEqual({ shared_name: 'left' });
    expect(names(defaultAgentBridge)).not.toContain('shared_name');
  });

  it('uses the nearest scope, through components in between', () => {
    const outer = createAgentBridge();
    const inner = createAgentBridge();
    const Widget = makeWidget('nested');
    const Middle = lmount((_props, children) => () => (
      <section>{children}</section>
    ));
    render(
      <AgentScope bridge={outer}>
        <Middle>
          <AgentScope bridge={inner}>
            <Middle>
              <Widget />
            </Middle>
          </AgentScope>
        </Middle>
      </AgentScope>
    );
    expect(names(inner)).toEqual(['nested']);
    expect(names(outer)).toEqual([]);
  });

  it('prefers options.bridge over the scope', () => {
    const scoped = createAgentBridge();
    const explicit = createAgentBridge();
    const Pinned = mount(() => {
      agentAction({
        name: 'pinned',
        description: 'Pinned',
        bridge: explicit,
        run: () => 1,
      });
      agentState('pinned', () => 1, { bridge: explicit });
      return () => <i />;
    });
    render(
      <AgentScope bridge={scoped}>
        <Pinned />
      </AgentScope>
    );
    expect(names(explicit)).toEqual(['pinned']);
    expect(explicit.getState()).toEqual({ pinned: 1 });
    expect(names(scoped)).toEqual([]);
  });

  it('skips a bridge that createAgentBridge did not make, with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // String keys only: a spread would also copy the symbol-keyed registry.
    const fake = Object.fromEntries(
      Object.entries(createAgentBridge())
    ) as AgentBridge;
    const Foreign = mount(() => {
      const run = agentAction({
        name: 'foreign',
        description: 'Foreign',
        bridge: fake,
        run: () => 2,
      });
      return () => <button onClick={run} />;
    });
    const { container } = render(<Foreign />);
    expect(fake.listTools()).toEqual([]);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('createAgentBridge')
    );
    (container.querySelector('button') as HTMLButtonElement).click();
  });
});

describe('useAgentBridge (RQ-4)', () => {
  it('reaches the scope bridge once mounted', async () => {
    const bridge = createAgentBridge();
    const Widget = makeWidget('seen_by_panel');
    let seen: string[] = [];
    let call: () => Promise<unknown> = async () => undefined;
    const Panel = mount(() => {
      const agent = useAgentBridge();
      mountCallback(() => {
        seen = agent.listTools().map(t => t.name);
      });
      call = () => agent.callTool('seen_by_panel');
      return () => <i />;
    });
    render(
      <AgentScope bridge={bridge}>
        <Widget />
        <Panel />
      </AgentScope>
    );
    expect(seen).toEqual(['seen_by_panel']);
    expect(await call()).toEqual({ ok: true, value: 'seen_by_panel' });
  });

  it('can be passed on as options.bridge', () => {
    const bridge = createAgentBridge();
    const Forwarding = mount(() => {
      const agent = useAgentBridge();
      agentAction({
        name: 'forwarded',
        description: 'Forwarded',
        bridge: agent,
        run: () => 1,
      });
      return () => <i />;
    });
    render(
      <AgentScope bridge={bridge}>
        <Forwarding />
      </AgentScope>
    );
    expect(names(bridge)).toEqual(['forwarded']);
  });
});

describe('name conflicts (DC-3)', () => {
  it('prefixes names with scopeId', () => {
    const bridge = createAgentBridge();
    const First = makeWidget('save', 'cart');
    const Second = makeWidget('save', 'profile');
    render(
      <AgentScope bridge={bridge}>
        <First />
        <Second />
      </AgentScope>
    );
    expect(names(bridge)).toEqual(['cart.save', 'profile.save']);
    expect(Object.keys(bridge.getState())).toEqual([
      'cart.save',
      'profile.save',
    ]);
  });

  it('warns and lets the latest instance win; the older one cannot remove it', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const bridge = createAgentBridge();
    const Widget = makeWidget('dup');
    let showFirst = true;
    let showSecond = true;
    let renewHost = () => false as boolean;
    const Host = mount(renew => {
      renewHost = renew;
      return () => (
        <div>
          {showFirst ? <Widget tag="first" /> : null}
          {showSecond ? <Widget tag="second" /> : null}
        </div>
      );
    });
    render(
      <AgentScope bridge={bridge}>
        <Host />
      </AgentScope>
    );

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('"dup" is already registered')
    );
    expect(await bridge.callTool('dup')).toEqual({ ok: true, value: 'second' });

    showFirst = false;
    renewHost();
    await act();
    expect(await bridge.callTool('dup')).toEqual({ ok: true, value: 'second' });
    expect(bridge.getState()).toEqual({ dup: 'second' });

    showSecond = false;
    renewHost();
    await act();
    expect(names(bridge)).toEqual([]);
    expect(bridge.getState()).toEqual({});
  });

  it("throws with onConflict: 'error'", () => {
    const bridge = createAgentBridge({ onConflict: 'error' });
    const Widget = makeWidget('strict');
    render(
      <AgentScope bridge={bridge}>
        <Widget />
      </AgentScope>
    );
    expect(() =>
      render(
        <AgentScope bridge={bridge}>
          <Widget />
        </AgentScope>
      )
    ).toThrow('"strict" is already registered');
    expect(names(bridge)).toEqual(['strict']);
  });
});

describe('declarations outside the mounter (§2.3)', () => {
  it('warns once and registers once when declared in the updater', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const bridge = createAgentBridge();
    let renewIt = () => false as boolean;
    const Misplaced = mount(renew => {
      renewIt = renew;
      return () => {
        agentAction({
          name: 'misplaced',
          description: 'Misplaced',
          run: () => 1,
        });
        return <i />;
      };
    });
    render(
      <AgentScope bridge={bridge}>
        <Misplaced />
      </AgentScope>
    );

    renewIt();
    await act();
    renewIt();
    await act();

    expect(names(bridge)).toEqual(['misplaced']);
    const misplaced = warn.mock.calls.filter(c =>
      String(c[0]).includes(
        '"misplaced" must be declared in a component mounter'
      )
    );
    expect(misplaced).toHaveLength(1);
  });

  it('outside any component: warns, registers nothing, still runs', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const loose = agentAction({
      name: 'loose',
      description: 'Loose',
      run: () => 'ran',
    });
    agentState('loose_state', () => 1);
    expect(loose()).toBe('ran');
    expect(names(defaultAgentBridge)).not.toContain('loose');
    expect(defaultAgentBridge.getState()).not.toHaveProperty('loose_state');
    expect(warn).toHaveBeenCalledTimes(2);
  });
});

describe('subscribe and dispose (RQ-4)', () => {
  it('unsubscribes, and one failing listener does not stop the others', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const bridge = createAgentBridge();
    const heard: string[] = [];
    bridge.subscribe(() => {
      throw new Error('listener broke');
    });
    const stop = bridge.subscribe(e => heard.push(e.type));

    bridge.notifyStateChange();
    stop();
    bridge.notifyStateChange();

    expect(heard).toEqual(['state-changed']);
    expect(error).toHaveBeenCalledTimes(2);
  });

  it('dispose clears tools and states, says so, and drops listeners', async () => {
    const bridge = createAgentBridge();
    const Widget = makeWidget('disposable');
    const setShow = toggleable(bridge, () => <Widget />);
    const events: AgentBridgeEvent[] = [];
    bridge.subscribe(e => events.push(e));

    bridge.dispose();
    expect(events).toEqual([{ type: 'tools-changed', tools: [] }]);
    expect(names(bridge)).toEqual([]);
    expect(bridge.getState()).toEqual({});

    // The component's later unmount must not fail or notify anyone.
    await setShow(false);
    expect(events).toHaveLength(1);
  });
});
