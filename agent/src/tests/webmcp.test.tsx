import { afterEach, describe, expect, it, vi } from 'vitest';
import { h, mount } from 'lithent';
import { act, cleanup, render } from 'lithent/test';
import {
  AgentScope,
  agentAction,
  connectWebMCP,
  createAgentBridge,
  defaultAgentBridge,
} from '@/index';
import type { AgentBridge, WebMCPModelContext, WebMCPTool } from '@/index';

/**
 * Phase 2 — connectWebMCP (RQ-5, DC-4). A mock model context stands in for
 * the browser: current drafts remove a tool when the registration signal
 * aborts; earlier drafts and polyfills call `unregisterTool`.
 */

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
  delete (document as { modelContext?: unknown }).modelContext;
  delete (navigator as { modelContext?: unknown }).modelContext;
  vi.restoreAllMocks();
});

/** A context that only knows AbortSignal removal (current draft). */
const signalContext = () => {
  const tools = new Map<string, WebMCPTool>();
  const log: string[] = [];
  const context: WebMCPModelContext = {
    registerTool: (tool, options) => {
      if (tools.has(tool.name)) throw new Error(`duplicate ${tool.name}`);
      tools.set(tool.name, tool);
      log.push(`+${tool.name}`);
      options?.signal?.addEventListener('abort', () => {
        tools.delete(tool.name);
        log.push(`-${tool.name}`);
      });
    },
  };
  return { context, tools, log };
};

/** A context with unregisterTool and no signal support (earlier drafts). */
const legacyContext = () => {
  const tools = new Map<string, WebMCPTool>();
  const context: WebMCPModelContext = {
    registerTool: tool => {
      tools.set(tool.name, tool);
    },
    unregisterTool: name => {
      tools.delete(name);
    },
  };
  return { context, tools };
};

const makeTool = (name: string, description = `${name} tool`) =>
  mount(() => {
    agentAction({
      name,
      description,
      params: { n: { type: Number, required: true } },
      run: ({ n }) => n * 2,
    });
    return () => <i />;
  });

/** Render `Child` in `bridge`'s scope under a host that can drop it. */
const toggleable = (bridge: AgentBridge, Child: ReturnType<typeof mount>) => {
  let show = true;
  let renewHost = () => false as boolean;
  const Host = mount(renew => {
    renewHost = renew;
    return () => <div>{show ? <Child /> : null}</div>;
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

describe('connectWebMCP — registration follows the bridge (RQ-5)', () => {
  it('registers current tools, then follows mounts and unmounts', async () => {
    const bridge = createAgentBridge();
    const { context, tools, log } = signalContext();
    const setShow = toggleable(bridge, makeTool('double'));

    const disconnect = connectWebMCP(bridge, { target: context });
    expect([...tools.keys()]).toEqual(['double']);
    expect(tools.get('double')).toMatchObject({
      name: 'double',
      description: 'double tool',
      inputSchema: {
        type: 'object',
        properties: { n: { type: 'number' } },
        required: ['n'],
      },
    });

    await setShow(false);
    expect([...tools.keys()]).toEqual([]);

    await setShow(true);
    expect([...tools.keys()]).toEqual(['double']);
    expect(log).toEqual(['+double', '-double', '+double']);

    disconnect();
  });

  it('runs execute through callTool and returns its result', async () => {
    const bridge = createAgentBridge();
    const { context, tools } = signalContext();
    toggleable(bridge, makeTool('double'));
    connectWebMCP(bridge, { target: context });

    const execute = tools.get('double')!.execute;
    expect(await execute({ n: 21 })).toEqual({ ok: true, value: 42 });
    // Browsers do not check arguments; callTool does, and returns the
    // failure as a value the agent can read.
    expect(await execute({ n: 'x' })).toMatchObject({
      ok: false,
      error: { code: 'INVALID_PARAMS' },
    });
  });

  it('the returned function removes its tools and stops following', async () => {
    const bridge = createAgentBridge();
    const { context, tools } = signalContext();
    toggleable(bridge, makeTool('first'));
    const disconnect = connectWebMCP(bridge, { target: context });

    disconnect();
    expect([...tools.keys()]).toEqual([]);

    toggleable(bridge, makeTool('second'));
    expect([...tools.keys()]).toEqual([]);
  });

  it('re-registers a name taken over by a newer instance (DC-3)', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const bridge = createAgentBridge();
    const { context, tools, log } = signalContext();
    toggleable(bridge, makeTool('shared', 'first version'));
    connectWebMCP(bridge, { target: context });

    toggleable(bridge, makeTool('shared', 'second version'));
    expect(tools.get('shared')!.description).toBe('second version');
    expect(log).toEqual(['+shared', '-shared', '+shared']);
  });

  it('calls unregisterTool when the context has it', async () => {
    const bridge = createAgentBridge();
    const { context, tools } = legacyContext();
    const setShow = toggleable(bridge, makeTool('legacy'));
    const disconnect = connectWebMCP(bridge, { target: context });
    expect([...tools.keys()]).toEqual(['legacy']);

    await setShow(false);
    expect([...tools.keys()]).toEqual([]);
    await setShow(true);
    disconnect();
    expect([...tools.keys()]).toEqual([]);
  });

  it('keeps going when one registration throws or rejects', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const bridge = createAgentBridge();
    const registered: string[] = [];
    const context: WebMCPModelContext = {
      registerTool: tool => {
        if (tool.name === 'bad_sync') throw new Error('invalid');
        if (tool.name === 'bad_async')
          return Promise.reject(new Error('later'));
        registered.push(tool.name);
        return Promise.resolve();
      },
    };
    const All = mount(() => {
      for (const name of ['bad_sync', 'bad_async', 'good']) {
        agentAction({ name, description: name, run: () => name });
      }
      return () => <i />;
    });
    render(
      <AgentScope bridge={bridge}>
        <All />
      </AgentScope>
    );

    connectWebMCP(bridge, { target: context });
    await act();

    expect(registered).toEqual(['good']);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('"bad_sync"'),
      expect.any(Error)
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('"bad_async"'),
      expect.any(Error)
    );
  });

  it('never unregisters a failed registration, and one failing unregister does not stop the rest', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const bridge = createAgentBridge();
    const unregistered: string[] = [];
    const context: WebMCPModelContext = {
      registerTool: tool => {
        if (tool.name === 'bad_sync') throw new Error('invalid');
        if (tool.name === 'bad_async')
          return Promise.reject(new Error('later'));
        return Promise.resolve();
      },
      unregisterTool: name => {
        unregistered.push(name);
        // Like a context whose abort already removed the tool.
        if (name === 'first') throw new Error('unknown tool');
      },
    };
    const All = mount(() => {
      for (const name of ['first', 'bad_sync', 'bad_async', 'last']) {
        agentAction({ name, description: name, run: () => name });
      }
      return () => <i />;
    });
    render(
      <AgentScope bridge={bridge}>
        <All />
      </AgentScope>
    );

    const disconnect = connectWebMCP(bridge, { target: context });
    await act();
    expect(() => disconnect()).not.toThrow();

    expect(unregistered).toEqual(['first', 'last']);
  });
});

describe('connectWebMCP — finding the context (DC-4)', () => {
  it('is a no-op without a context, and touches nothing on import', () => {
    expect('modelContext' in document).toBe(false);
    expect('modelContext' in navigator).toBe(false);
    const disconnect = connectWebMCP(createAgentBridge());
    expect(disconnect).toBeTypeOf('function');
    expect(() => disconnect()).not.toThrow();
  });

  it('uses document.modelContext, then navigator.modelContext', () => {
    const bridge = createAgentBridge();
    toggleable(bridge, makeTool('found'));

    const onNavigator = signalContext();
    (navigator as { modelContext?: unknown }).modelContext =
      onNavigator.context;
    const stopNavigator = connectWebMCP(bridge);
    expect([...onNavigator.tools.keys()]).toEqual(['found']);
    stopNavigator();

    const onDocument = signalContext();
    (document as { modelContext?: unknown }).modelContext = onDocument.context;
    const stopDocument = connectWebMCP(bridge);
    expect([...onDocument.tools.keys()]).toEqual(['found']);
    expect([...onNavigator.tools.keys()]).toEqual([]);
    stopDocument();
  });

  it('defaults to defaultAgentBridge', () => {
    const { context, tools } = signalContext();
    const Global = makeTool('global_tool');
    render(<Global />);
    const disconnect = connectWebMCP(undefined, { target: context });
    expect(defaultAgentBridge.listTools().map(t => t.name)).toContain(
      'global_tool'
    );
    expect([...tools.keys()]).toContain('global_tool');
    disconnect();
  });
});
