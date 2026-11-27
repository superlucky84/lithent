// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

/**
 * Phase 1 — SSR / Node safety (REQUIREMENTS §1.3 item 5). No window,
 * document or navigator: importing and using a bridge must not throw.
 */

describe('lithent/agent without a DOM', () => {
  it('runs in an environment with no window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('imports and creates bridges without throwing', async () => {
    const agent = await import('@/index');
    const bridge = agent.createAgentBridge();

    expect(bridge.listTools()).toEqual([]);
    expect(bridge.getState()).toEqual({});
    expect(agent.defaultAgentBridge.listTools()).toEqual([]);
    expect(await bridge.callTool('none')).toMatchObject({
      ok: false,
      error: { code: 'NOT_FOUND' },
    });

    const stop = bridge.subscribe(() => {});
    bridge.notifyStateChange();
    stop();
    bridge.dispose();
  });

  it('lets a declaration outside a component warn instead of throwing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { agentAction, agentState } = await import('@/index');

    const run = agentAction({ name: 'ssr', description: 'SSR', run: () => 1 });
    agentState('ssr_state', () => 1);

    expect(run()).toBe(1);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
