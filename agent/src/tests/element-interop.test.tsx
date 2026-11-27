import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { h, mount } from 'lithent';
import { act, cleanup, render } from 'lithent/test';
import { defineElement } from 'lithent/element';
import {
  AgentScope,
  agentAction,
  agentState,
  createAgentBridge,
  defaultAgentBridge,
} from '@/index';
import type { AgentBridge, AgentBridgeEvent } from '@/index';

/**
 * Phase 2 — lithent/element interop (RQ-4). A Custom Element renders its
 * component in its own root: declarations inside it reach the default
 * bridge, or a bridge the page hands over as an Object prop. Moves keep the
 * registration; removal drops it after the element's unmount microtask.
 */

const flush = () => new Promise<void>(resolve => queueMicrotask(resolve));

beforeEach(async () => {
  document.body.innerHTML = '';
  await flush();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const names = (bridge: AgentBridge) => bridge.listTools().map(t => t.name);

/** A counter widget: one action, one state, rendered in a shadow root. */
const Counter = mount<{ host: HTMLElement; start?: number }>((renew, props) => {
  let count = props.start ?? 0;
  agentAction({
    name: 'el_increment',
    description: 'Increment the element counter',
    run: () => {
      count += 1;
      renew();
      return count;
    },
  });
  agentState('el_count', () => count);
  return () => <output>{count}</output>;
});
defineElement('agent-counter', Counter, { props: { start: Number } });

const shadowText = (el: Element) => el.shadowRoot!.textContent;

describe('a widget inside a Custom Element (RQ-4)', () => {
  it('registers on connect and is driven by callTool', async () => {
    const el = document.createElement('agent-counter');
    el.setAttribute('start', '5');
    document.body.appendChild(el);

    expect(names(defaultAgentBridge)).toContain('el_increment');
    expect(defaultAgentBridge.getState().el_count).toBe(5);

    expect(await defaultAgentBridge.callTool('el_increment')).toEqual({
      ok: true,
      value: 6,
    });
    await act();
    expect(shadowText(el)).toBe('6');

    el.remove();
    await flush();
  });

  it('keeps its registration across a move, without remove/add events', async () => {
    const el = document.createElement('agent-counter');
    const first = document.body.appendChild(document.createElement('div'));
    const second = document.body.appendChild(document.createElement('div'));
    first.appendChild(el);
    await defaultAgentBridge.callTool('el_increment');

    const events: AgentBridgeEvent[] = [];
    const stop = defaultAgentBridge.subscribe(e => events.push(e));
    second.appendChild(el);
    await flush();
    await act();

    expect(names(defaultAgentBridge)).toContain('el_increment');
    expect(events.filter(e => e.type === 'tools-changed')).toEqual([]);
    expect(defaultAgentBridge.getState().el_count).toBe(1);
    stop();

    el.remove();
    await flush();
  });

  it('unregisters after removal, and again registers when re-added', async () => {
    const el = document.createElement('agent-counter');
    document.body.appendChild(el);
    el.remove();
    expect(names(defaultAgentBridge)).toContain('el_increment');

    await flush();
    expect(names(defaultAgentBridge)).not.toContain('el_increment');
    expect(defaultAgentBridge.getState()).not.toHaveProperty('el_count');

    document.body.appendChild(el);
    expect(names(defaultAgentBridge)).toContain('el_increment');
    el.remove();
    await flush();
  });
});

/**
 * The page hands its bridge over as an Object prop; `widget-id` becomes the
 * scopeId so several instances can share one bridge (DC-3).
 */
const Panel = mount<{
  host: HTMLElement;
  // lithent/element types Object props as unknown.
  bridge?: unknown;
  widgetId?: string;
  label?: string;
}>((_renew, props) => {
  const Inner = mount(() => {
    agentAction({
      name: 'read_label',
      description: 'Read the panel label',
      scopeId: props.widgetId,
      run: () => props.label,
    });
    agentState('label', () => props.label ?? null, { scopeId: props.widgetId });
    return () => <span>{props.label}</span>;
  });
  return () => (
    <AgentScope bridge={props.bridge as AgentBridge}>
      <Inner />
    </AgentScope>
  );
});
defineElement('agent-panel', Panel, {
  props: { bridge: Object, widgetId: String, label: String },
});

const makePanel = (bridge: AgentBridge, id: string, label: string) => {
  const el = document.createElement('agent-panel') as HTMLElement & {
    bridge?: AgentBridge;
  };
  el.bridge = bridge;
  el.setAttribute('widget-id', id);
  el.setAttribute('label', label);
  return el;
};

describe('a page bridge handed to elements (RQ-4, DC-3)', () => {
  it('registers in the given bridge, one name per widget-id', async () => {
    const page = createAgentBridge();
    const left = document.body.appendChild(makePanel(page, 'left', 'L'));
    const right = document.body.appendChild(makePanel(page, 'right', 'R'));

    expect(names(page)).toEqual(['left__read_label', 'right__read_label']);
    expect(names(defaultAgentBridge)).not.toContain('left__read_label');
    expect(await page.callTool('right__read_label')).toEqual({
      ok: true,
      value: 'R',
    });

    left.remove();
    right.remove();
    await flush();
    expect(names(page)).toEqual([]);
  });

  it('reports a state change made through an attribute', async () => {
    const page = createAgentBridge();
    const el = document.body.appendChild(makePanel(page, 'solo', 'before'));
    const events: AgentBridgeEvent[] = [];
    page.subscribe(e => events.push(e));

    el.setAttribute('label', 'after');
    await act();

    expect(events.filter(e => e.type === 'state-changed').at(-1)).toEqual({
      type: 'state-changed',
      name: 'solo__label',
      state: { solo__label: 'after' },
    });
    expect(el.shadowRoot!.textContent).toBe('after');
    el.remove();
    await flush();
  });

  it('does not see an AgentScope outside the element (own render root)', async () => {
    const outer = createAgentBridge();
    const { container } = render(
      <AgentScope bridge={outer}>
        <div id="slot" />
      </AgentScope>
    );
    const el = document.createElement('agent-counter');
    container.querySelector('#slot')!.appendChild(el);

    expect(names(outer)).toEqual([]);
    expect(names(defaultAgentBridge)).toContain('el_increment');
    el.remove();
    await flush();
  });
});
