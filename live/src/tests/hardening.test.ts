import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineLiveElement, mountLive } from '@/index';
import type { LithentLiveElement, LiveError, LiveHandle } from '@/index';
import { buildSrcdoc } from '@/srcdoc';
import { start } from '@/runtime/entry';
import {
  answerLastCall,
  begin,
  flush,
  ready,
  sandboxOf,
  SILENT_RUNTIME,
  TOOLS,
} from '@/tests/harness';

/**
 * Phase 7 — hardening (docs/agent-ui IMPLEMENT.md): what jsdom can show of
 * the security boundary (forged messages on both sides, the srcdoc against
 * injection, no request without a runtime), calls and starts cut short,
 * the error → fix loop, and many starts and stops. Every test counts the
 * window `message` listeners it leaves and fails on an unhandled rejection.
 * What only a browser enforces (opaque origin, CSP) is checked in Chromium
 * (IMPLEMENT.md Phase 7 record) and in the Phase 8 E2E.
 */

const rejections: unknown[] = [];
const onRejection = (reason: unknown) => rejections.push(reason);
let listening: () => number;

beforeEach(() => {
  rejections.length = 0;
  process.on('unhandledRejection', onRejection);
  const add = vi.spyOn(window, 'addEventListener');
  const remove = vi.spyOn(window, 'removeEventListener');
  const count = (spy: typeof add) =>
    spy.mock.calls.filter(call => call[0] == 'message').length;
  // Net `message` listeners added to the window since the test began.
  listening = () => count(add) - count(remove);
});

afterEach(async () => {
  await new Promise(resolve => setTimeout(resolve, 5));
  process.off('unhandledRejection', onRejection);
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  expect(rejections).toEqual([]);
});

const GOOD = 'return lmount(() => () => fTags.p({}, "ok"))';
const JSX = 'return lmount(() => () => <p>ok</p>)';

const iframes = (container: HTMLElement) =>
  container.querySelectorAll('iframe');

/** Answer `ready` in the iframe the container shows now. */
const answerReady = (container: HTMLElement, tools: unknown[] = TOOLS) => {
  const sandbox = sandboxOf(container.querySelector('iframe')!);
  sandbox.reply({ type: 'ready', tools, state: { counter: 0 } });
  return sandbox;
};

describe('forged messages (DC-7, §3.3)', () => {
  it('the host ignores the channel from any other source, and data of any other shape', async () => {
    const { handle, sandbox } = await ready();
    const other = document.body.appendChild(document.createElement('iframe'));
    const forged = {
      type: 'event',
      event: { type: 'tools-changed', tools: [] },
    };
    // This window, another iframe, no source.
    for (const source of [window, other.contentWindow, null]) {
      sandbox.reply(forged, source);
    }
    for (const data of ['text', 7, [sandbox.ch], { ch: sandbox.ch }]) {
      window.dispatchEvent(
        new MessageEvent('message', {
          data,
          source: sandbox.frame.contentWindow,
        })
      );
    }
    expect(handle.bridge.listTools()).toEqual(TOOLS);
  });

  it('the sandbox runtime answers only its parent, on its channel', async () => {
    document.body.innerHTML = '<div id="root"></div>';
    const posted = vi.spyOn(window, 'postMessage').mockImplementation(() => {});
    const code = `return lmount(() => {
      agentAction({ name: 'ping', description: 'Ping', run: () => 'pong' });
      return () => fTags.p({}, 'up');
    })`;
    start({ ch: 'mine', code, props: {}, origin: 'null' });
    const results = () =>
      posted.mock.calls.filter(
        call => (call[0] as { type: string }).type == 'result'
      );
    const other = document.body.appendChild(document.createElement('iframe'));
    const send = (data: object, source: unknown) =>
      window.dispatchEvent(
        new MessageEvent('message', { data, source: source as Window })
      );
    const call = { type: 'call', id: 1, name: 'ping', args: {} };
    send({ ...call, ch: 'mine' }, other.contentWindow);
    send({ ...call, ch: 'mine' }, null);
    send({ ...call, ch: 'other' }, window);
    await flush();
    expect(results()).toEqual([]);

    send({ ...call, ch: 'mine' }, window);
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(results()).toHaveLength(1);
    expect(results()[0][0]).toMatchObject({
      ch: 'mine',
      result: { ok: true, value: 'pong' },
    });
  });
});

describe('the srcdoc against injection (DC-7)', () => {
  const ATTACK = '</script><script>parent.hacked=1</script><!--';

  it('props, code and styles cannot add a script or close one early', () => {
    const config = {
      ch: 'c1',
      code: `return lmount(() => () => fTags.p({}, ${JSON.stringify(ATTACK)}))`,
      props: { label: ATTACK, nested: [{ deeper: ATTACK }] },
      origin: 'https://host.test',
    };
    const html = buildSrcdoc({
      config,
      runtimeCode: SILENT_RUNTIME + '//' + ATTACK,
      styles: [`p{color:red}${ATTACK}</style><script>parent.x=1</script>`],
      theme: { '--brand': `red;}</style><script>x()</script>` },
    });
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const scripts = doc.querySelectorAll('script');
    expect(scripts).toHaveLength(2);
    expect(doc.querySelectorAll('style')).toHaveLength(2);
    // The start script still carries the exact config.
    const json = /lithentLiveRuntime,(\{.*\})\)$/.exec(
      scripts[1].textContent!
    )![1];
    expect(JSON.parse(json)).toEqual(config);
    // The attack stays text: escaped in the runtime script, inert in <style>.
    expect(scripts[0].textContent).toContain('<\\/script>');
    expect(doc.querySelector('style:last-of-type')!.textContent).toContain(
      'parent.hacked=1'
    );
  });

  it('every sandbox option keeps sandbox="allow-scripts" and nothing more', async () => {
    const variants = [
      {},
      { allowNetwork: true },
      { runtimeCode: undefined, runtimeUrl: 'https://cdn.test/runtime.js' },
      {
        runtimeCode: undefined,
        runtimeUrl: 'https://cdn.test/runtime.js',
        allowNetwork: true,
      },
      { autoResize: false, theme: { '--x': '1' } },
    ];
    for (const options of variants) {
      const { sandbox } = begin(options);
      expect(sandbox!.frame.getAttribute('sandbox')).toBe('allow-scripts');
      const csp = /Content-Security-Policy" content="([^"]*)"/.exec(
        sandbox!.frame.srcdoc
      );
      if (options.allowNetwork) {
        expect(csp).toBeNull();
      } else {
        expect(csp![1]).toMatch(/^default-src 'none'; script-src /);
        expect(csp![1]).not.toMatch(/connect-src|img-src|frame-src|\*/);
      }
    }
  });

  it('without runtimeCode or runtimeUrl nothing is requested or created (DC-13)', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const before = document.querySelectorAll('script, iframe, link').length;
    const container = document.body.appendChild(document.createElement('div'));
    await expect(mountLive({ code: GOOD, container })).rejects.toMatchObject({
      phase: 'compile',
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(document.querySelectorAll('script, iframe, link')).toHaveLength(
      before
    );
    expect(listening()).toBe(0);
    vi.unstubAllGlobals();
  });
});

describe('calls and starts cut short', () => {
  it('a call approved for a widget that a reload replaced does not run on the new one', async () => {
    const { handle, container } = await ready();
    let approve = (_answer: boolean) => {};
    handle.bridge.setConfirmHandler(
      () => new Promise<boolean>(resolve => (approve = resolve))
    );
    const call = handle.bridge.callTool('reset', {});
    await flush();
    const reloading = handle.reload(GOOD);
    const next = answerReady(container);
    await reloading;
    approve(true);
    expect(await call).toMatchObject({ error: { code: 'NOT_FOUND' } });
    expect(next.sent).toEqual([]);
  });

  it('destroy from inside the approval: NOT_FOUND, nothing posted', async () => {
    const { handle, sandbox } = await ready();
    handle.bridge.setConfirmHandler(() => {
      handle.destroy();
      return true;
    });
    expect(await handle.bridge.callTool('reset', {})).toMatchObject({
      error: { code: 'NOT_FOUND' },
    });
    expect(sandbox.sent).toEqual([]);
  });

  it('pending calls and prop updates end on destroy, and their timers with them', async () => {
    const { handle, errors } = await ready({ timeoutMs: 20 });
    const call = handle.bridge.callTool('add', { by: 1 });
    const update = handle.updateProps({ label: 'x' });
    await flush();
    handle.destroy();
    expect(await call).toMatchObject({ error: { code: 'NOT_FOUND' } });
    await expect(update).resolves.toBeUndefined();
    await new Promise(resolve => setTimeout(resolve, 40));
    expect(errors).toEqual([]);
    expect(listening()).toBe(0);
  });

  it('a listener that throws while a reload clears the tools does not stop it', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { handle, container } = await ready();
    handle.bridge.subscribe(() => {
      throw new Error('listener broke');
    });
    const reloading = handle.reload(GOOD);
    answerReady(container);
    await expect(reloading).resolves.toBeUndefined();
    expect(handle.bridge.listTools()).toEqual(TOOLS);
  });

  it('destroy twice is harmless', async () => {
    const { handle } = await ready();
    handle.destroy();
    expect(() => handle.destroy()).not.toThrow();
    expect(listening()).toBe(0);
  });

  it("mode 'direct': destroy while the runtime chunk loads mounts nothing", async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const container = document.body.appendChild(document.createElement('div'));
    const handle = await mountLive({ code: GOOD, container, mode: 'direct' });
    const reloading = handle.reload(GOOD);
    handle.destroy();
    await expect(reloading).rejects.toMatchObject({ phase: 'mount' });
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(container.children).toHaveLength(0);
  });
});

describe("the widget's own state and calls, through the real runtime (mode 'direct')", () => {
  const directWith = async (code: string) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const container = document.body.appendChild(document.createElement('div'));
    return mountLive({ code, container, mode: 'direct' });
  };

  it('state JSON cannot hold reaches the host isolated and stringified (DC-12)', async () => {
    const handle = await directWith(`return lmount(() => {
      agentState('bad', () => { throw new Error('getter broke'); });
      agentState('big', () => ({ id: 12n, fn: () => 1 }));
      return () => fTags.p({}, 'x');
    })`);
    expect(handle.bridge.getState()).toEqual({
      bad: { __agentStateError: 'getter broke' },
      big: { id: '12' },
    });
    handle.destroy();
  });

  it('an action still running when the widget is destroyed ends as NOT_FOUND', async () => {
    const handle = await directWith(`return lmount(() => {
      agentAction({ name: 'slow', description: 'Slow', run: () => new Promise(() => {}) });
      return () => fTags.p({}, 'x');
    })`);
    const call = handle.bridge.callTool('slow');
    await flush();
    handle.destroy();
    expect(await call).toMatchObject({ error: { code: 'NOT_FOUND' } });
  });
});

describe('the error → fix loop (RQ-8)', () => {
  it('mountLive: a failed start leaves nothing, the fixed code starts', async () => {
    const container = document.body.appendChild(document.createElement('div'));
    const first = mountLive({
      code: JSX,
      container,
      runtimeCode: SILENT_RUNTIME,
    });
    sandboxOf(container.querySelector('iframe')!).reply({
      type: 'error',
      error: { phase: 'compile', message: "Unexpected token '<'" },
    });
    const error: LiveError = await first.catch(e => e);
    expect(error.hint).toMatch(/JSX/);
    expect(iframes(container)).toHaveLength(0);
    expect(listening()).toBe(0);

    const second = mountLive({
      code: GOOD,
      container,
      runtimeCode: SILENT_RUNTIME,
    });
    answerReady(container);
    const handle = await second;
    expect(handle.bridge.listTools()).toEqual(TOOLS);
    expect(listening()).toBe(1);
    handle.destroy();
    expect(listening()).toBe(0);
  });

  it('reload: 20 rounds of broken then fixed code keep one sandbox and one listener', async () => {
    const { handle, container } = await ready();
    for (let i = 0; i < 20; i++) {
      const broken = handle.reload(JSX);
      sandboxOf(container.querySelector('iframe')!).reply({
        type: 'error',
        error: { phase: 'compile', message: "Unexpected token '<'" },
      });
      await expect(broken).rejects.toMatchObject({
        hint: expect.stringMatching(/JSX/),
      });
      expect(iframes(container)).toHaveLength(0);
      expect(handle.bridge.listTools()).toEqual([]);

      const fixed = handle.reload(GOOD);
      answerReady(container);
      await fixed;
      expect(iframes(container)).toHaveLength(1);
    }
    expect(listening()).toBe(1);
    handle.destroy();
    expect(listening()).toBe(0);
  });
});

describe('many starts and stops', () => {
  it('100 reloads in a row: one sandbox, one listener; none after destroy', async () => {
    const { handle, container } = await ready();
    for (let i = 0; i < 100; i++) {
      const reloading = handle.reload(GOOD);
      answerReady(container);
      await reloading;
    }
    expect(iframes(container)).toHaveLength(1);
    expect(listening()).toBe(1);
    handle.destroy();
    expect(iframes(container)).toHaveLength(0);
    expect(listening()).toBe(0);
  });

  it('100 reloads without waiting: only the last one starts', async () => {
    const { handle, container } = await ready();
    const starts: Promise<void>[] = [];
    for (let i = 0; i < 100; i++) starts.push(handle.reload(GOOD));
    answerReady(container);
    const settled = await Promise.allSettled(starts);
    expect(settled.filter(s => s.status == 'rejected')).toHaveLength(99);
    expect(settled[99].status).toBe('fulfilled');
    expect(iframes(container)).toHaveLength(1);
    expect(listening()).toBe(1);
    handle.destroy();
    expect(listening()).toBe(0);
  });

  it('100 widgets started and destroyed leave no iframe or listener', async () => {
    const handles: LiveHandle[] = [];
    for (let i = 0; i < 100; i++) handles.push((await ready()).handle);
    expect(listening()).toBe(100);
    handles.forEach(handle => handle.destroy());
    expect(document.querySelectorAll('iframe')).toHaveLength(0);
    expect(listening()).toBe(0);
  });

  it('100 calls at once are matched to their answers, in any order', async () => {
    const { handle, sandbox } = await ready();
    const calls = Array.from({ length: 100 }, (_, by) =>
      handle.bridge.callTool('add', { by })
    );
    await flush();
    const posted = sandbox.sent.filter(m => m.type == 'call').reverse();
    for (const message of posted) {
      sandbox.reply({
        type: 'result',
        id: message.id,
        result: { ok: true, value: (message.args as { by: number }).by },
      });
    }
    const results = await Promise.all(calls);
    expect(results.map(r => (r.ok ? r.value : -1))).toEqual(
      Array.from({ length: 100 }, (_, by) => by)
    );
  });

  it("mode 'direct': 50 reloads keep one shadow host; none after destroy", async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const container = document.body.appendChild(document.createElement('div'));
    const handle = await mountLive({ code: GOOD, container, mode: 'direct' });
    for (let i = 0; i < 50; i++) await handle.reload(GOOD);
    expect(container.children).toHaveLength(1);
    expect(container.firstElementChild!.shadowRoot!.textContent).toBe('ok');
    handle.destroy();
    expect(container.children).toHaveLength(0);
  });

  it('<lithent-live>: 50 code changes in one task start one sandbox; 50 moves keep it', async () => {
    defineLiveElement();
    const el = document.createElement('lithent-live') as LithentLiveElement;
    el.runtimeCode = SILENT_RUNTIME;
    document.body.appendChild(el);
    for (let i = 0; i < 50; i++) el.code = `return ${i}`;
    await flush();
    expect(iframes(el)).toHaveLength(1);
    answerReady(el);
    await flush();
    const frame = el.querySelector('iframe');
    const box = document.body.appendChild(document.createElement('div'));
    for (let i = 0; i < 50; i++) (i % 2 ? document.body : box).appendChild(el);
    await flush();
    expect(el.querySelector('iframe')).toBe(frame);
    el.remove();
    await flush();
    await flush();
    expect(iframes(el)).toHaveLength(0);
    expect(listening()).toBe(0);
  });

  it('answers to calls that already ended are ignored', async () => {
    const { handle, sandbox } = await ready({ timeoutMs: 10 });
    const call = handle.bridge.callTool('add', { by: 1 });
    expect(await call).toMatchObject({ error: { code: 'TIMEOUT' } });
    // The late answer, then a second answer for the same id.
    answerLastCall(sandbox, { ok: true, value: 1 });
    answerLastCall(sandbox, { ok: true, value: 2 });
    expect(handle.bridge.listTools()).toEqual(TOOLS);
  });
});
