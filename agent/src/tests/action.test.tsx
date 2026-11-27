import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { h, Fragment, mount, lmount } from 'lithent';
import type { WDom } from 'lithent';
import { lstate } from 'lithent/helper';
import { act, cleanup, render } from 'lithent/test';
import { AgentScope, agentAction, createAgentBridge } from '@/index';
import type { AgentBridge, ParamsOf, ToolCallResult } from '@/index';

/**
 * Phase 1 — agentAction (RQ-1, DC-2, DC-5, DC-11). Every test renders into
 * its own bridge through <AgentScope>, so tests do not share registrations.
 */

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const button = (container: HTMLElement) =>
  container.querySelector('button') as HTMLButtonElement;

const inScope = (bridge: AgentBridge, child: WDom) =>
  render(<AgentScope bridge={bridge}>{child}</AgentScope>);

/** mount mode: closure state redrawn with renew(). */
const Counter = mount(renew => {
  let count = 0;
  const increment = agentAction({
    name: 'increment',
    description: 'Add to the counter',
    params: { by: { type: Number, description: 'Amount to add' } },
    run: ({ by = 1 }) => {
      count += by;
      renew();
      return count;
    },
  });
  return () => <button onClick={() => increment({ by: 1 })}>{count}</button>;
});

/** lmount mode: the DESIGN §2.2 example. */
const OrderList = lmount(() => {
  const status = lstate<'all' | 'delayed' | 'done'>('all');
  const minPrice = lstate(0);
  const applyFilter = agentAction({
    name: 'filter_orders',
    description: 'Filter orders by delivery status and minimum price',
    params: {
      status: {
        type: String,
        enum: ['all', 'delayed', 'done'],
        required: true,
      },
      minPrice: { type: Number, description: 'Minimum price' },
    },
    run: ({ status: nextStatus, minPrice: nextMin = 0 }) => {
      status.value = nextStatus as 'all' | 'delayed' | 'done';
      minPrice.value = nextMin;
      return { status: status.value, minPrice: minPrice.value };
    },
  });
  return () => (
    <button onClick={() => applyFilter({ status: 'delayed', minPrice: 0 })}>
      {status.value}:{minPrice.value}
    </button>
  );
});

describe('agentAction — people and agents call the same function (RQ-1)', () => {
  it('mount: a click and callTool update the same closure', async () => {
    const bridge = createAgentBridge();
    const { container } = inScope(bridge, <Counter />);

    button(container).click();
    await act();
    expect(button(container).textContent).toBe('1');

    const result = await bridge.callTool('increment', { by: 2 });
    await act();
    expect(result).toEqual({ ok: true, value: 3 });
    expect(button(container).textContent).toBe('3');
  });

  it('lmount: a click and callTool update the same lstate', async () => {
    const bridge = createAgentBridge();
    const { container } = inScope(bridge, <OrderList />);

    button(container).click();
    await act();
    expect(button(container).textContent).toBe('delayed:0');

    const result = await bridge.callTool('filter_orders', {
      status: 'done',
      minPrice: 5000,
    });
    await act();
    expect(result).toEqual({
      ok: true,
      value: { status: 'done', minPrice: 5000 },
    });
    expect(button(container).textContent).toBe('done:5000');
  });

  it('awaits an async run and returns its value', async () => {
    const bridge = createAgentBridge();
    const Async = mount(() => {
      const load = agentAction({
        name: 'load',
        description: 'Load asynchronously',
        params: { id: { type: Number, required: true } },
        run: async ({ id }) => {
          await new Promise(resolve => setTimeout(resolve, 1));
          return { id, loaded: true };
        },
      });
      void load;
      return () => <i />;
    });
    inScope(bridge, <Async />);

    await expect(bridge.callTool('load', { id: 7 })).resolves.toEqual({
      ok: true,
      value: { id: 7, loaded: true },
    });
  });

  it('runs a parameterless action with or without arguments', async () => {
    const bridge = createAgentBridge();
    let calls = 0;
    const Reset = mount(() => {
      agentAction({
        name: 'reset',
        description: 'Reset',
        run: () => ++calls,
      });
      return () => <i />;
    });
    inScope(bridge, <Reset />);

    expect(await bridge.callTool('reset')).toEqual({ ok: true, value: 1 });
    expect(await bridge.callTool('reset', {})).toEqual({ ok: true, value: 2 });
    expect(bridge.listTools()[0].inputSchema).toEqual({
      type: 'object',
      properties: {},
      additionalProperties: false,
    });
  });
});

describe('listTools — JSON Schema (DC-2)', () => {
  it('converts the declaration to a JSON Schema tool', () => {
    const bridge = createAgentBridge();
    inScope(bridge, <OrderList />);

    expect(bridge.listTools()).toEqual([
      {
        name: 'filter_orders',
        description: 'Filter orders by delivery status and minimum price',
        inputSchema: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['all', 'delayed', 'done'] },
            minPrice: { type: 'number', description: 'Minimum price' },
          },
          required: ['status'],
          additionalProperties: false,
        },
      },
    ]);
  });

  it('maps every constructor, bare or in an object', () => {
    const bridge = createAgentBridge();
    const All = mount(() => {
      agentAction({
        name: 'all_types',
        description: 'All parameter types',
        params: {
          s: String,
          n: Number,
          b: Boolean,
          o: Object,
          a: { type: Array, required: true },
        },
        run: () => null,
      });
      return () => <i />;
    });
    inScope(bridge, <All />);

    expect(bridge.listTools()[0].inputSchema).toEqual({
      type: 'object',
      properties: {
        s: { type: 'string' },
        n: { type: 'number' },
        b: { type: 'boolean' },
        o: { type: 'object' },
        a: { type: 'array' },
      },
      required: ['a'],
      additionalProperties: false,
    });
  });
});

describe('callTool — argument checks (RQ-1, DC-2, DC-11)', () => {
  const received: unknown[] = [];
  const Typed = mount(() => {
    agentAction({
      name: 'typed',
      description: 'Typed parameters',
      params: {
        s: { type: String, required: true },
        n: Number,
        b: Boolean,
        o: Object,
        a: Array,
        e: { type: String, enum: ['x', 'y'] },
      },
      run: args => {
        received.push(args);
        return 'ran';
      },
    });
    return () => <i />;
  });

  const setup = () => {
    received.length = 0;
    const bridge = createAgentBridge();
    inScope(bridge, <Typed />);
    return bridge;
  };

  const errorOf = (result: ToolCallResult) => {
    if (result.ok) throw new Error('expected a failure');
    return result.error;
  };

  it('passes declared arguments of the right type', async () => {
    const bridge = setup();
    const args = { s: 'a', n: 1, b: false, o: { k: 1 }, a: [1], e: 'y' };
    expect(await bridge.callTool('typed', args)).toEqual({
      ok: true,
      value: 'ran',
    });
    expect(received).toEqual([args]);
  });

  it('reports a missing required argument', async () => {
    const bridge = setup();
    const error = errorOf(await bridge.callTool('typed', {}));
    expect(error.code).toBe('INVALID_PARAMS');
    expect(error.details).toEqual([{ param: 's', issue: 'required' }]);
    expect(error.message).toContain('s (required)');
    expect(received).toEqual([]);
  });

  it.each([
    ['n', 'one', 'number'],
    ['n', Number.NaN, 'number'],
    ['b', 'true', 'boolean'],
    ['o', [1], 'object'],
    ['o', null, 'object'],
    ['a', { 0: 1 }, 'array'],
    ['s', 1, 'string'],
  ])('rejects %s = %j as not a %s', async (param, value, expected) => {
    const bridge = setup();
    const error = errorOf(
      await bridge.callTool('typed', { s: 'ok', [param]: value })
    );
    expect(error.code).toBe('INVALID_PARAMS');
    expect(error.details).toEqual([{ param, issue: 'type', expected }]);
    expect(received).toEqual([]);
  });

  it('rejects a value outside the enum', async () => {
    const bridge = setup();
    const error = errorOf(await bridge.callTool('typed', { s: 'ok', e: 'z' }));
    expect(error.details).toEqual([
      { param: 'e', issue: 'enum', expected: ['x', 'y'] },
    ]);
  });

  it('lists every problem at once', async () => {
    const bridge = setup();
    const error = errorOf(await bridge.callTool('typed', { n: 'x', e: 'z' }));
    expect(error.details).toEqual([
      { param: 's', issue: 'required' },
      { param: 'n', issue: 'type', expected: 'number' },
      { param: 'e', issue: 'enum', expected: ['x', 'y'] },
    ]);
  });

  it('rejects arguments that are not an object', async () => {
    const bridge = setup();
    const call = bridge.callTool as (n: string, a: unknown) => Promise<unknown>;
    for (const args of [null, [1], 'x']) {
      const error = errorOf((await call('typed', args)) as ToolCallResult);
      expect(error.code).toBe('INVALID_PARAMS');
      expect(error.details).toEqual([
        { param: '', issue: 'type', expected: 'object' },
      ]);
    }
  });

  it('strips keys the declaration does not name (DC-11)', async () => {
    const bridge = setup();
    const result = await bridge.callTool('typed', {
      s: 'ok',
      extra: 1,
      __proto__hint: true,
    });
    expect(result.ok).toBe(true);
    expect(received).toEqual([{ s: 'ok' }]);
  });

  it('returns NOT_FOUND for an unknown tool', async () => {
    const bridge = setup();
    const error = errorOf(await bridge.callTool('missing', {}));
    expect(error.code).toBe('NOT_FOUND');
  });
});

describe('callTool — failures stay inside the result', () => {
  it('turns a throwing or rejecting run into EXECUTION_ERROR', async () => {
    const bridge = createAgentBridge();
    const Broken = mount(() => {
      agentAction({
        name: 'throws',
        description: 'Throws',
        run: () => {
          throw new Error('boom');
        },
      });
      agentAction({
        name: 'rejects',
        description: 'Rejects',
        run: () => Promise.reject('nope'),
      });
      return () => <i>alive</i>;
    });
    const { container } = inScope(bridge, <Broken />);

    expect(await bridge.callTool('throws')).toEqual({
      ok: false,
      error: { code: 'EXECUTION_ERROR', message: 'boom' },
    });
    expect(await bridge.callTool('rejects')).toEqual({
      ok: false,
      error: { code: 'EXECUTION_ERROR', message: 'nope' },
    });
    expect(container.textContent).toBe('alive');
  });
});

describe('direct calls skip agent checks (DC-5)', () => {
  it('runs the returned function without validating arguments', async () => {
    const bridge = createAgentBridge();
    const seen: unknown[] = [];
    let direct: (args: { n: number }) => unknown = () => undefined;
    const Direct = mount(() => {
      direct = agentAction({
        name: 'direct',
        description: 'Direct',
        params: { n: { type: Number, required: true } },
        run: args => {
          seen.push(args);
          return args.n;
        },
      });
      return () => <i />;
    });
    inScope(bridge, <Direct />);

    // An event handler passing the wrong shape still runs (no INVALID_PARAMS).
    expect(direct({ n: 'x' } as unknown as { n: number })).toBe('x');
    expect(seen).toEqual([{ n: 'x' }]);
    expect((await bridge.callTool('direct', { n: 'x' })).ok).toBe(false);
  });
});

describe('types (DC-2)', () => {
  it('derives run arguments from the declaration', () => {
    type Spec = {
      a: { type: StringConstructor; required: true };
      b: NumberConstructor;
      c: { type: ArrayConstructor };
      d: { type: ObjectConstructor; required: true };
      e: BooleanConstructor;
    };
    expectTypeOf<ParamsOf<Spec>>().toEqualTypeOf<
      { a: string; d: Record<string, unknown> } & {
        b?: number;
        c?: unknown[];
        e?: boolean;
      }
    >();
  });

  it('types the returned function from params', () => {
    const Typed = mount(() => {
      const withParams = agentAction({
        name: 'typed_fn',
        description: 'Typed',
        params: { id: { type: Number, required: true }, note: String },
        run: ({ id, note }) => `${id}${note ?? ''}`,
      });
      const noParams = agentAction({
        name: 'typed_none',
        description: 'No params',
        run: () => 1,
      });
      expectTypeOf(withParams)
        .parameter(0)
        .toEqualTypeOf<{ id: number } & { note?: string }>();
      expectTypeOf(noParams).parameters.toEqualTypeOf<[]>();
      // @ts-expect-error — `id` is required.
      void (() => withParams({ note: 'x' }));
      return () => <Fragment />;
    });
    void Typed;
  });
});
