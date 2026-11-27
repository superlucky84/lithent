import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { createAgentBridge } from 'lithent/agent';
import type { AgentBridge, AgentBridgeEvent } from 'lithent/agent';
import { ready, TOOLS } from '@/tests/harness';
import type { LiveHandle } from '@/index';

/**
 * Phase 4 — LiveHandle.bridge keeps the AgentBridge contract of
 * lithent/agent (RQ-8, §1 "one protocol"): a consumer written for a local
 * bridge works unchanged with a sandboxed widget.
 */

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

const methodsOf = (bridge: object) =>
  Object.keys(bridge)
    .filter(
      key => typeof (bridge as Record<string, unknown>)[key] == 'function'
    )
    .sort();

describe('LiveHandle.bridge and AgentBridge (RQ-8)', () => {
  it('has the same methods as a lithent/agent bridge', async () => {
    const { handle } = await ready();
    expect(methodsOf(handle.bridge)).toEqual(methodsOf(createAgentBridge()));
    expectTypeOf(handle.bridge).toEqualTypeOf<AgentBridge>();
    expectTypeOf<LiveHandle['bridge']>().toEqualTypeOf<AgentBridge>();
  });

  it('listTools and getState return copies of the cache', async () => {
    const { handle } = await ready({}, TOOLS, { counter: { n: 1 } });
    const tools = handle.bridge.listTools();
    tools.pop();
    const state = handle.bridge.getState() as { counter: { n: number } };
    state.counter.n = 99;
    expect(handle.bridge.listTools()).toHaveLength(2);
    expect(handle.bridge.getState()).toEqual({ counter: { n: 1 } });
  });

  it('subscribe returns an unsubscribe, and listener errors stay contained', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { handle } = await ready();
    const heard: AgentBridgeEvent['type'][] = [];
    handle.bridge.subscribe(() => {
      throw new Error('listener broke');
    });
    const stop = handle.bridge.subscribe(e => heard.push(e.type));
    handle.bridge.notifyStateChange('counter');
    stop();
    handle.bridge.notifyStateChange('counter');
    expect(heard).toEqual(['state-changed']);
    expect(error).toHaveBeenCalledTimes(2);
  });

  it('notifyStateChange reports the cached state with the given name', async () => {
    const { handle } = await ready({}, TOOLS, { counter: 4 });
    const events: AgentBridgeEvent[] = [];
    handle.bridge.subscribe(e => events.push(e));
    handle.bridge.notifyStateChange('counter');
    expect(events).toEqual([
      { type: 'state-changed', name: 'counter', state: { counter: 4 } },
    ]);
  });

  it('dispose destroys the widget', async () => {
    const { handle, container } = await ready();
    handle.bridge.dispose();
    expect(container.querySelector('iframe')).toBeNull();
    expect(handle.bridge.listTools()).toEqual([]);
  });

  it('serves a consumer written for lithent/agent bridges', async () => {
    // A tiny "agent loop" that only knows the AgentBridge contract.
    const describeTools = (bridge: AgentBridge) =>
      bridge.listTools().map(t => `${t.name}${t.requiresConfirm ? '!' : ''}`);
    const { handle } = await ready();
    expect(describeTools(handle.bridge)).toEqual(['add', 'reset!']);
    expect(describeTools(createAgentBridge())).toEqual([]);
  });
});
