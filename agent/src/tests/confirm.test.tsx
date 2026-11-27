import { afterEach, describe, expect, it, vi } from 'vitest';
import { h, mount } from 'lithent';
import type { WDom } from 'lithent';
import { act, cleanup, render } from 'lithent/test';
import {
  AgentScope,
  agentAction,
  createAgentBridge,
  useAgentBridge,
} from '@/index';
import type {
  ActionConfirmContext,
  ActionConfirmHandler,
  AgentBridge,
  ToolCallResult,
} from '@/index';

/**
 * Phase 2 — the confirm hook (RQ-5, DC-5): only `callTool` asks; approval,
 * refusal, async approval, no handler, failing handler, per-action handler.
 */

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

const inScope = (bridge: AgentBridge, child: WDom) =>
  render(<AgentScope bridge={bridge}>{child}</AgentScope>);

const codeOf = (result: ToolCallResult) =>
  result.ok ? 'OK' : result.error.code;

/** An order list whose `delete_order` asks first; `rename` does not. */
const makeOrders = (confirm: boolean | ActionConfirmHandler = true) => {
  const orders = ['a', 'b'];
  const ran: unknown[] = [];
  let remove: (args: { id: string }) => unknown = () => undefined;
  const Orders = mount(renew => {
    remove = agentAction({
      name: 'delete_order',
      description: 'Delete an order',
      params: { id: { type: String, required: true } },
      confirm,
      run: ({ id }) => {
        ran.push(id);
        orders.splice(orders.indexOf(id), 1);
        renew();
        return orders.length;
      },
    });
    agentAction({
      name: 'rename',
      description: 'Rename',
      run: () => 'renamed',
    });
    return () => <p>{orders.join(',')}</p>;
  });
  return { Orders, orders, ran, direct: (id: string) => remove({ id }) };
};

describe('requiresConfirm in listTools (DC-5)', () => {
  it('marks only the actions declared with confirm', () => {
    const bridge = createAgentBridge();
    const { Orders } = makeOrders();
    inScope(bridge, <Orders />);
    const byName = Object.fromEntries(bridge.listTools().map(t => [t.name, t]));
    expect(byName.delete_order.requiresConfirm).toBe(true);
    expect('requiresConfirm' in byName.rename).toBe(false);
  });
});

describe('confirm: true uses the bridge handler (DC-5)', () => {
  it('runs after approval and passes the checked arguments', async () => {
    const bridge = createAgentBridge();
    const seen: ActionConfirmContext[] = [];
    bridge.setConfirmHandler(ctx => {
      seen.push(ctx);
      return true;
    });
    const { Orders, ran } = makeOrders();
    const { container } = inScope(bridge, <Orders />);

    const result = await bridge.callTool('delete_order', { id: 'a', extra: 1 });
    await act();

    expect(result).toEqual({ ok: true, value: 1 });
    expect(ran).toEqual(['a']);
    expect(container.textContent).toBe('b');
    expect(seen).toEqual([
      {
        name: 'delete_order',
        description: 'Delete an order',
        args: { id: 'a' },
      },
    ]);
  });

  it('returns REJECTED and does not run when refused', async () => {
    const bridge = createAgentBridge();
    bridge.setConfirmHandler(() => false);
    const { Orders, ran } = makeOrders();
    inScope(bridge, <Orders />);

    const result = await bridge.callTool('delete_order', { id: 'a' });
    expect(codeOf(result)).toBe('REJECTED');
    expect(ran).toEqual([]);
  });

  it('waits for an async approval', async () => {
    const bridge = createAgentBridge();
    let decide: (ok: boolean) => void = () => {};
    bridge.setConfirmHandler(
      () => new Promise<boolean>(resolve => (decide = resolve))
    );
    const { Orders, ran } = makeOrders();
    inScope(bridge, <Orders />);

    const pending = bridge.callTool('delete_order', { id: 'b' });
    await act();
    expect(ran).toEqual([]);
    decide(true);
    expect(await pending).toEqual({ ok: true, value: 1 });
    expect(ran).toEqual(['b']);
  });

  it('rejects when no handler is set, so a marked action never runs unasked', async () => {
    const bridge = createAgentBridge();
    const { Orders, ran } = makeOrders();
    inScope(bridge, <Orders />);

    const result = await bridge.callTool('delete_order', { id: 'a' });
    expect(result).toMatchObject({
      ok: false,
      error: {
        code: 'REJECTED',
        message: expect.stringContaining('no confirm handler'),
      },
    });
    expect(ran).toEqual([]);
  });

  it('rejects when the handler throws or rejects, with its message', async () => {
    const bridge = createAgentBridge();
    const { Orders, ran } = makeOrders();
    inScope(bridge, <Orders />);

    bridge.setConfirmHandler(() => {
      throw new Error('dialog failed');
    });
    expect(await bridge.callTool('delete_order', { id: 'a' })).toMatchObject({
      ok: false,
      error: { code: 'REJECTED', message: 'dialog failed' },
    });

    bridge.setConfirmHandler(() => Promise.reject(new Error('closed')));
    expect(await bridge.callTool('delete_order', { id: 'a' })).toMatchObject({
      ok: false,
      error: { code: 'REJECTED', message: 'closed' },
    });
    expect(ran).toEqual([]);
  });

  it('treats only true as approval', async () => {
    const bridge = createAgentBridge();
    bridge.setConfirmHandler((() => 'yes') as unknown as ActionConfirmHandler);
    const { Orders, ran } = makeOrders();
    inScope(bridge, <Orders />);

    expect(codeOf(await bridge.callTool('delete_order', { id: 'a' }))).toBe(
      'REJECTED'
    );
    expect(ran).toEqual([]);
  });

  it('setConfirmHandler(null) removes the handler', async () => {
    const bridge = createAgentBridge();
    bridge.setConfirmHandler(() => true);
    bridge.setConfirmHandler(null);
    const { Orders } = makeOrders();
    inScope(bridge, <Orders />);

    expect(codeOf(await bridge.callTool('delete_order', { id: 'a' }))).toBe(
      'REJECTED'
    );
  });

  it('does not ask for actions declared without confirm', async () => {
    const bridge = createAgentBridge();
    const handler = vi.fn(() => false);
    bridge.setConfirmHandler(handler);
    const { Orders } = makeOrders();
    inScope(bridge, <Orders />);

    expect(await bridge.callTool('rename')).toEqual({
      ok: true,
      value: 'renamed',
    });
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('order and scope of the check', () => {
  it('checks the arguments before asking', async () => {
    const bridge = createAgentBridge();
    const handler = vi.fn(() => true);
    bridge.setConfirmHandler(handler);
    const { Orders } = makeOrders();
    inScope(bridge, <Orders />);

    expect(codeOf(await bridge.callTool('delete_order', {}))).toBe(
      'INVALID_PARAMS'
    );
    expect(handler).not.toHaveBeenCalled();
  });

  it('returns NOT_FOUND when the action unmounts while the approval is open', async () => {
    const bridge = createAgentBridge();
    let decide: (ok: boolean) => void = () => {};
    bridge.setConfirmHandler(
      () => new Promise<boolean>(resolve => (decide = resolve))
    );
    const { Orders, ran } = makeOrders();
    const { unmount } = inScope(bridge, <Orders />);

    const pending = bridge.callTool('delete_order', { id: 'a' });
    await act();
    unmount();
    decide(true);

    expect(codeOf(await pending)).toBe('NOT_FOUND');
    expect(ran).toEqual([]);
  });

  it('uses the handler of the bridge the action is registered on', async () => {
    const scoped = createAgentBridge();
    const other = createAgentBridge();
    other.setConfirmHandler(() => true);
    scoped.setConfirmHandler(() => false);
    const { Orders } = makeOrders();
    inScope(scoped, <Orders />);

    expect(codeOf(await scoped.callTool('delete_order', { id: 'a' }))).toBe(
      'REJECTED'
    );
  });

  it('can be set through useAgentBridge', async () => {
    const bridge = createAgentBridge();
    const { Orders } = makeOrders();
    // Called after mount (here from a click): in the mounter the scope is not
    // known yet and the call would reach the default bridge (DESIGN §2.4).
    const Late = mount(() => {
      const agent = useAgentBridge();
      return () => (
        <button onClick={() => agent.setConfirmHandler(() => true)} />
      );
    });
    const { container } = inScope(
      bridge,
      <div>
        <Orders />
        <Late />
      </div>
    );
    (container.querySelector('button') as HTMLButtonElement).click();

    expect(await bridge.callTool('delete_order', { id: 'a' })).toEqual({
      ok: true,
      value: 1,
    });
  });
});

describe('a per-action handler (DC-5)', () => {
  it('decides instead of the bridge handler', async () => {
    const bridge = createAgentBridge();
    const bridgeHandler = vi.fn(() => false);
    bridge.setConfirmHandler(bridgeHandler);
    const own = vi.fn(({ args }: ActionConfirmContext) => args.id === 'b');
    const { Orders, ran } = makeOrders(own);
    inScope(bridge, <Orders />);

    expect(codeOf(await bridge.callTool('delete_order', { id: 'a' }))).toBe(
      'REJECTED'
    );
    expect(codeOf(await bridge.callTool('delete_order', { id: 'b' }))).toBe(
      'OK'
    );
    expect(ran).toEqual(['b']);
    expect(own).toHaveBeenCalledTimes(2);
    expect(bridgeHandler).not.toHaveBeenCalled();
  });
});

describe('people are not asked (DC-5)', () => {
  it('runs a direct call at once, whatever the handler says', async () => {
    const bridge = createAgentBridge();
    const handler = vi.fn(() => false);
    bridge.setConfirmHandler(handler);
    const { Orders, ran, direct } = makeOrders();
    const { container } = inScope(bridge, <Orders />);

    expect(direct('a')).toBe(1);
    await act();
    expect(ran).toEqual(['a']);
    expect(container.textContent).toBe('b');
    expect(handler).not.toHaveBeenCalled();
  });
});
