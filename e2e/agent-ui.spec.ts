import { test as plain } from '@playwright/test';
import type { Page } from '@playwright/test';
import { test, expect, ready } from './test';

/*
 * docs/agent-ui Phase 8: the scenarios of MANUAL_TEST_CHECKLIST.md M-1 to
 * M-7 in a real browser, on the built packages. Base project: the page runs
 * on the base core. Concurrent project: on the concurrent core (the sandbox
 * runtime always brings its own copy of lithent).
 *
 * Tests that expect the browser to refuse something (CSP, opaque origin)
 * log those refusals on the console, so they use the plain test and check
 * exactly what was refused instead.
 */

declare global {
  interface Window {
    /** Set by fixtures/agent-ui/live-csp.js. */
    cspResult: {
      started: boolean;
      iframes: number;
      error?: { phase: string; message: string; hint?: string };
    };
  }
}

const LOCAL = '/e2e/fixtures/agent-ui/local.html';
const LIVE = '/e2e/fixtures/agent-ui/live.html';

const orders = (page: Page) => page.locator('.order');
const local = (page: Page) =>
  page.evaluate(() => {
    const { bridge } = window.agentUi;
    return {
      tools: bridge.listTools().map(t => t.name),
      state: bridge.getState(),
    };
  });

test.describe('M-1: a local component, driven by a person and by an agent', () => {
  test('both change the same orders; unmounting removes its tools and state', async ({
    page,
  }, info) => {
    await ready(page, LOCAL, info.project.name);
    await expect(orders(page)).toHaveCount(5);
    expect((await local(page)).tools).toEqual([
      'filter_orders',
      'cancel_delayed',
    ]);

    // (2) A person filters; the agent reads what the person left.
    await page.locator('button.delayed').click();
    await expect(orders(page)).toHaveText([
      '#1 delayed 50000',
      '#3 delayed 250000',
      '#5 delayed 300000',
    ]);
    expect((await local(page)).state).toEqual({
      orders: { status: 'delayed', minPrice: 0, visible: [1, 3, 5] },
    });

    // (3) The agent filters the same closure state; the DOM follows.
    const result = await page.evaluate(() =>
      window.agentUi.bridge.callTool('filter_orders', {
        status: 'delayed',
        minPrice: 100000,
      })
    );
    expect(result).toEqual({ ok: true, value: [3, 5] });
    await expect(orders(page)).toHaveText([
      '#3 delayed 250000',
      '#5 delayed 300000',
    ]);
    expect(
      await page.evaluate(() =>
        window.agentUi.events.some(
          e => e.type == 'state-changed' && e.name == 'orders'
        )
      )
    ).toBe(true);

    // (4) Unmounted: nothing is left on the bridge.
    await page.evaluate(() => window.agentUi.setShow(false));
    await expect(page.locator('.gone')).toBeVisible();
    expect(await local(page)).toEqual({ tools: [], state: {} });
    expect(
      await page.evaluate(() =>
        window.agentUi.bridge.callTool('filter_orders', { status: 'all' })
      )
    ).toMatchObject({ ok: false, error: { code: 'NOT_FOUND' } });

    // Mounted again: a fresh instance registers again.
    await page.evaluate(() => window.agentUi.setShow(true));
    await expect(orders(page)).toHaveCount(5);
    expect(await local(page)).toEqual({
      tools: ['filter_orders', 'cancel_delayed'],
      state: {
        orders: { status: 'all', minPrice: 0, visible: [1, 2, 3, 4, 5] },
      },
    });
  });
});

test.describe('M-2: WebMCP', () => {
  for (const where of ['document', 'navigator'] as const) {
    test(`${where}.modelContext: tools follow mounts, and running one updates the page`, async ({
      page,
    }, info) => {
      await ready(page, `${LOCAL}?webmcp=${where}`, info.project.name);
      const registered = () =>
        page.evaluate(() => [...window.agentUi.webmcp.tools.keys()]);
      expect(await registered()).toEqual(['filter_orders', 'cancel_delayed']);

      // The browser's agent runs a tool through the model context.
      const result = await page.evaluate(() =>
        window.agentUi.runTool('filter_orders', { status: 'done' })
      );
      expect(result).toEqual({ ok: true, value: [2, 4] });
      await expect(orders(page)).toHaveText([
        '#2 done 120000',
        '#4 done 80000',
      ]);
      // Checked like any callTool: the agent sees the problem.
      expect(
        await page.evaluate(() =>
          window.agentUi.runTool('filter_orders', { status: 'lost' })
        )
      ).toMatchObject({ ok: false, error: { code: 'INVALID_PARAMS' } });

      await page.evaluate(() => window.agentUi.setShow(false));
      await expect.poll(registered).toEqual([]);
      await page.evaluate(() => window.agentUi.setShow(true));
      await expect
        .poll(registered)
        .toEqual(['filter_orders', 'cancel_delayed']);

      await page.evaluate(() => window.agentUi.disconnect());
      expect(await registered()).toEqual([]);
      const log = await page.evaluate(() => window.agentUi.webmcp.log);
      expect(log.filter(line => line.startsWith('register'))).toHaveLength(4);
      expect(log).toContain('abort filter_orders');
      expect(log).toContain('unregister filter_orders');
    });
  }

  test('no model context: connectWebMCP does nothing, and nothing fails', async ({
    page,
  }, info) => {
    await ready(page, `${LOCAL}?webmcp=none`, info.project.name);
    expect(
      await page.evaluate(() => [
        'modelContext' in document,
        'modelContext' in navigator,
      ])
    ).toEqual([false, false]);
    await page.locator('button.done').click();
    await expect(orders(page)).toHaveCount(2);
    await page.evaluate(() => window.agentUi.disconnect());
    expect((await local(page)).tools).toHaveLength(2);
  });
});

/** Start a widget of live.ts and return what is plain data about it. */
const start = (
  page: Page,
  code: string,
  options: Record<string, unknown> = {}
) =>
  page.evaluate(
    async ([code, options]) => {
      const started = await window.liveUi.start(
        code as keyof typeof window.liveUi.codes,
        options
      );
      return {
        started: !!started.handle,
        failure: started.failure,
        errors: started.errors,
        ms: started.ms,
      };
    },
    [code, options] as const
  );

const liveState = (page: Page) =>
  page.evaluate(() => window.liveUi.current!.handle!.bridge.getState());

const call = (page: Page, name: string, args: Record<string, unknown> = {}) =>
  page.evaluate(
    ([name, args]) =>
      window.liveUi.current!.handle!.bridge.callTool(
        name as string,
        args as Record<string, unknown>
      ),
    [name, args] as const
  );

const press = async (
  target: ReturnType<Page['locator']>,
  key: string,
  times: number
) => {
  await target.focus();
  for (let i = 0; i < times; i++) await target.press(key);
};

test.describe('M-3: two-way generative UI', () => {
  for (const mode of ['sandbox', 'direct'] as const) {
    test(`${mode}: a person drags the sliders, the host reads them and adds a comparison without a rebuild`, async ({
      page,
    }, info) => {
      await ready(page, LIVE, info.project.name);
      const started = await start(page, 'LOAN', { mode });
      expect(started).toMatchObject({ started: true, errors: [] });
      // Checklist: under 100 ms locally. The gate allows for a loaded CI box.
      info.annotations.push({
        type: 'start time',
        description: `${Math.round(started.ms)} ms (${mode})`,
      });
      expect(started.ms).toBeLessThan(2000);

      const widget =
        mode == 'sandbox'
          ? page.frameLocator('#widget iframe')
          : page.locator('#widget > div');
      const height = () =>
        page
          .locator('#widget > *')
          .evaluate(el => el.getBoundingClientRect().height);
      const before = await height();

      // (2) A person moves both sliders with the keyboard: 1억 → 3억, 10 → 30년.
      await press(widget.locator('#amount'), 'ArrowRight', 20);
      await press(widget.locator('#years'), 'ArrowRight', 20);
      await expect(widget.locator('#amount')).toHaveValue('300000000');

      // (3) The host reads exactly what the person set.
      await expect
        .poll(() => liveState(page).then(s => s.loan))
        .toMatchObject({ amount: 300000000, years: 30, comparisons: [] });

      // (4) The agent adds a comparison. Same nodes, same inputs.
      await widget
        .locator('#amount')
        .evaluate(el => ((el as HTMLElement).dataset.mark = 'kept'));
      expect(
        await call(page, 'compare_rates', { rates: [3.5, 4, 4.5] })
      ).toEqual({ ok: true, value: 3 });
      await expect(widget.locator('.row')).toHaveCount(3);
      await expect(widget.locator('#amount[data-mark="kept"]')).toHaveValue(
        '300000000'
      );
      await expect(widget.locator('#years')).toHaveValue('30');
      const loan = (await liveState(page)).loan as {
        amount: number;
        years: number;
        monthly: number;
        comparisons: { rate: number; monthly: number }[];
      };
      expect(loan).toMatchObject({ amount: 300000000, years: 30 });
      expect(loan.comparisons.map(c => c.rate)).toEqual([3.5, 4, 4.5]);
      // 3억, 30년, 4.5%: about 1,520,056 a month.
      expect(loan.monthly).toBe(1520056);
      await expect(widget.locator('.row').nth(2)).toHaveText('4.5%: 1520056');

      // (5) The widget grew; the sandbox iframe followed (DC-8).
      await expect.poll(height).toBeGreaterThan(before);
      if (mode == 'sandbox') {
        const fits = await page
          .locator('#widget iframe')
          .evaluate(
            frame =>
              parseFloat((frame as HTMLIFrameElement).style.height) > 0 &&
              Number.isFinite(
                parseFloat((frame as HTMLIFrameElement).style.height)
              )
          );
        expect(fits).toBe(true);
      }
    });
  }

  test('the tag template form: a person clicks, the agent adds, both see one count', async ({
    page,
  }, info) => {
    await ready(page, LIVE, info.project.name);
    expect(await start(page, 'TAGGED')).toMatchObject({ started: true });
    const button = page.frameLocator('#widget iframe').locator('#tagged');
    await button.click();
    await button.click();
    await expect(button).toHaveText('count 2');
    await expect.poll(() => liveState(page)).toEqual({ count: 2 });
    expect(await call(page, 'add', { by: 5 })).toEqual({ ok: true, value: 7 });
    await expect(button).toHaveText('count 7');
  });
});

plain.describe('M-4: the sandbox keeps a malicious widget in', () => {
  const probe = async (page: Page, allowNetwork: boolean) => {
    const leaks: string[] = [];
    await page.route('https://leak.example.com/**', route => {
      leaks.push(route.request().url());
      return route.fulfill({
        status: 200,
        body: 'ok',
        headers: { 'access-control-allow-origin': '*' },
      });
    });
    const hostErrors: string[] = [];
    page.on('pageerror', error => hostErrors.push(error.message));
    await page.goto(LIVE);
    await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
    expect(await start(page, 'MALICIOUS', { allowNetwork })).toMatchObject({
      started: true,
    });
    await expect
      .poll(() => liveState(page).then(s => Object.keys(s.probe as object)))
      .toContain('fetch');
    const errors = () =>
      page.evaluate(() => window.liveUi.current!.errors.map(e => e.phase));
    await expect.poll(errors).toEqual(['render']);
    const host = await page.evaluate(() => ({
      secret: document.getElementById('host-secret')!.textContent,
      body: document.body.textContent!.includes('pwned'),
      cookie: document.cookie,
      token: localStorage.getItem('token'),
    }));
    return {
      probe: (await liveState(page)).probe as Record<string, string>,
      host,
      leaks,
      hostErrors,
    };
  };

  const blocked = {
    'parent DOM': 'blocked: SecurityError',
    'parent localStorage': 'blocked: SecurityError',
    localStorage: 'blocked: SecurityError',
    cookie: 'blocked: SecurityError',
    'top location': 'blocked: SecurityError',
  };
  const untouched = {
    secret: 'TOP_SECRET',
    body: false,
    cookie: 'secret=1',
    token: 'abc',
  };

  plain(
    'host DOM, cookies and storage are out of reach; the default CSP stops the fetch',
    async ({ page }) => {
      const result = await probe(page, false);
      expect(result.probe).toEqual({ ...blocked, fetch: 'blocked: TypeError' });
      expect(result.host).toEqual(untouched);
      expect(result.leaks).toEqual([]);
      // Playwright reports frame errors on the page too: the only one is the
      // widget's own uncaught attempt, refused inside the sandbox.
      expect(result.hostErrors).toEqual([
        expect.stringMatching(/Blocked a frame with origin "null"/),
      ]);
      // The uncaught attempt reached the host as a structured LiveError.
      const error = await page.evaluate(() => window.liveUi.current!.errors[0]);
      expect(error).toMatchObject({ phase: 'render' });
      expect(typeof error.message).toBe('string');
    }
  );

  plain(
    'control: allowNetwork: true lets the fetch out; everything else stays blocked',
    async ({ page }) => {
      const result = await probe(page, true);
      expect(result.probe).toEqual({ ...blocked, fetch: 'allowed: 200' });
      expect(result.host).toEqual(untouched);
      expect(result.leaks).toEqual([
        'https://leak.example.com/leak?d=TOP_SECRET',
      ]);
    }
  );

  plain(
    'a host page CSP that blocks inline scripts and eval stops the sandbox with a timeout that says so',
    async ({ page }) => {
      const hostErrors: string[] = [];
      page.on('pageerror', error => hostErrors.push(error.message));
      await page.goto('/e2e/fixtures/agent-ui/live-csp.html');
      await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
      const result = await page.evaluate(() => window.cspResult);
      expect(result).toMatchObject({
        started: false,
        iframes: 0,
        error: {
          phase: 'timeout',
          hint: expect.stringMatching(/Content-Security-Policy.*'unsafe-eval'/),
        },
      });
      expect(hostErrors).toEqual([]);
    }
  );
});

test('M-4: messages forged with a channel the widget learned leave the host intact', async ({
  page,
}, info) => {
  await ready(page, LIVE, info.project.name);
  expect(await start(page, 'FORGER')).toMatchObject({ started: true });
  // The call hands the widget the channel; it answers with forgeries too.
  expect(await call(page, 'ping')).toEqual({ ok: true, value: 'pong' });
  await expect
    .poll(() => page.evaluate(() => window.liveUi.current!.errors))
    .toEqual([{ phase: 'render', message: 'null' }]);
  const host = await page.evaluate(() => {
    const { handle } = window.liveUi.current!;
    return {
      tools: Array.isArray(handle!.bridge.listTools()),
      state: handle!.bridge.getState(),
      height: (document.querySelector('#widget iframe') as HTMLElement).style
        .height,
    };
  });
  expect(host.tools).toBe(true);
  expect(host.state).toEqual({});
  expect(host.height).not.toContain('Infinity');
});

test.describe('M-5: approval and the error → fix loop', () => {
  test('lithent/agent: an agent needs approval, a person does not (DC-5)', async ({
    page,
  }, info) => {
    await ready(page, LOCAL, info.project.name);
    const cancel = () =>
      page.evaluate(() => window.agentUi.bridge.callTool('cancel_delayed'));

    // (1) No handler, then a handler that refuses: nothing runs.
    expect(await cancel()).toMatchObject({
      ok: false,
      error: { code: 'REJECTED' },
    });
    await page.evaluate(() =>
      window.agentUi.bridge.setConfirmHandler(() => false)
    );
    expect(await cancel()).toMatchObject({
      ok: false,
      error: { code: 'REJECTED' },
    });
    await expect(orders(page)).toHaveCount(5);

    // (2) A person's click runs it at once; the handler is not asked.
    await page.evaluate(() => {
      const w = window as unknown as { asked: number };
      w.asked = 0;
      window.agentUi.bridge.setConfirmHandler(() => {
        w.asked++;
        return false;
      });
    });
    await page.locator('button.cancel').click();
    await expect(orders(page)).toHaveText(['#2 done 120000', '#4 done 80000']);
    expect(
      await page.evaluate(() => (window as unknown as { asked: number }).asked)
    ).toBe(0);

    // Approved: the agent's call runs.
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
    await page.evaluate(() =>
      window.agentUi.bridge.setConfirmHandler(() => true)
    );
    expect(await cancel()).toEqual({ ok: true, value: 2 });
    await expect(orders(page)).toHaveCount(2);
  });

  test('lithent/live: the host asks a person, and a refused call never reaches the widget (DC-14)', async ({
    page,
  }, info) => {
    await ready(page, LIVE, info.project.name);
    expect(await start(page, 'CONFIRM')).toMatchObject({ started: true });
    await page.evaluate(() =>
      window.liveUi.current!.handle!.bridge.setConfirmHandler(({ name }) =>
        window.confirm(`Let the agent run ${name}?`)
      )
    );
    const items = page.frameLocator('#widget iframe').locator('#items');
    const dialogs: string[] = [];

    page.once('dialog', dialog => {
      dialogs.push(dialog.message());
      return dialog.dismiss();
    });
    expect(await call(page, 'clear_items')).toMatchObject({
      ok: false,
      error: { code: 'REJECTED' },
    });
    await expect(items).toHaveText('a,b,c');

    page.once('dialog', dialog => {
      dialogs.push(dialog.message());
      return dialog.accept();
    });
    expect(await call(page, 'clear_items')).toEqual({ ok: true, value: 0 });
    await expect(items).toHaveText('empty');
    expect(dialogs).toEqual([
      'Let the agent run clear_items?',
      'Let the agent run clear_items?',
    ]);

    // A person's click inside the widget asks nobody.
    expect(await start(page, 'CONFIRM')).toMatchObject({ started: true });
    await page.frameLocator('#widget iframe').locator('#clear').click();
    await expect(items).toHaveText('empty');
    expect(dialogs).toHaveLength(2);
  });

  test('a mistake comes back with a hint; reload with the fix leaves nothing behind', async ({
    page,
  }, info) => {
    await ready(page, LIVE, info.project.name);
    const widgetFrames = () =>
      page.evaluate(() => document.querySelectorAll('#widget iframe').length);

    // mountLive with the mistake: rejected with a hint, nothing left.
    const first = await start(page, 'BROKEN');
    expect(first.started).toBe(false);
    expect(first.failure).toMatchObject({
      phase: 'mount',
      hint: expect.stringMatching(/render function, not the markup/),
    });
    expect(first.errors).toEqual([first.failure]);
    expect(await widgetFrames()).toBe(0);

    // A running widget reloaded with the mistake, then with the fix.
    expect(await start(page, 'CONFIRM')).toMatchObject({ started: true });
    const reload = (code: 'BROKEN' | 'FIXED') =>
      page.evaluate(
        code =>
          window.liveUi.current!.handle!.reload(window.liveUi.codes[code]).then(
            () => null,
            error => error
          ),
        code
      );
    expect(await reload('BROKEN')).toMatchObject({
      phase: 'mount',
      hint: expect.stringMatching(/render function/),
    });
    expect(await widgetFrames()).toBe(0);
    expect(await reload('FIXED')).toBeNull();
    expect(await widgetFrames()).toBe(1);
    await expect(
      page.frameLocator('#widget iframe').locator('#fixed')
    ).toHaveText('fixed');
    expect(
      await page.evaluate(() =>
        window.liveUi.current!.handle!.bridge.listTools()
      )
    ).toEqual([]);
  });
});

test('M-6: a React app drives <lithent-live> through el.bridge and hears its state', async ({
  page,
}, info) => {
  await ready(
    page,
    '/e2e/fixtures/agent-ui/live-react.html',
    info.project.name
  );
  const count = page.locator('#react-count');
  const inner = page.frameLocator('lithent-live iframe').locator('#inner');
  await expect(page.locator('#react-add')).toBeEnabled();
  await expect(count).toHaveText('5');
  await expect(inner).toHaveText('inner 5');

  // React → widget.
  await page.locator('#react-add').click();
  await expect(count).toHaveText('15');
  await expect(inner).toHaveText('inner 15');

  // Widget (a person's click inside it) → React.
  await inner.click();
  await expect(count).toHaveText('16');

  // Unmounted by React: no element and no iframe stay behind.
  await page.locator('#react-toggle').click();
  await expect(page.locator('lithent-live')).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => document.querySelectorAll('iframe').length))
    .toBe(0);

  // Mounted again: a fresh widget.
  await page.locator('#react-toggle').click();
  await expect(page.locator('#react-add')).toBeEnabled();
  await expect(count).toHaveText('5');
  await expect(page.locator('lithent-live iframe')).toHaveCount(1);
});

test('M-7: with UMD scripts only, a local component and two live widgets answer the agent', async ({
  page,
}, info) => {
  const core = info.project.name;
  await ready(page, `/e2e/fixtures/agent-ui/live-umd.html?core=${core}`, core);
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  expect(
    await page.evaluate(
      () => (window as unknown as { umd: { failure?: unknown } }).umd.failure
    )
  ).toBeUndefined();
  expect(
    await page.evaluate(
      () => (window as unknown as { umd: { core: string } }).umd.core
    )
  ).toBe(core);

  type Umd = {
    local: { callTool: (n: string, a?: object) => Promise<unknown> };
    sandboxed: { bridge: { callTool: (n: string) => Promise<unknown> } };
    direct: { bridge: { callTool: (n: string) => Promise<unknown> } };
  };
  expect(
    await page.evaluate(() =>
      (window as unknown as { umd: Umd }).umd.local.callTool('greet', {
        name: 'Ada',
      })
    )
  ).toEqual({ ok: true, value: 'hello Ada' });
  await expect(page.locator('#greeting')).toHaveText('hello Ada');

  expect(
    await page.evaluate(() =>
      (window as unknown as { umd: Umd }).umd.sandboxed.bridge.callTool('bump')
    )
  ).toEqual({ ok: true, value: 1 });
  await expect(page.frameLocator('#sandboxed iframe').locator('#n')).toHaveText(
    'n=1'
  );

  for (const value of [1, 2]) {
    expect(
      await page.evaluate(() =>
        (window as unknown as { umd: Umd }).umd.direct.bridge.callTool('bump')
      )
    ).toEqual({ ok: true, value });
  }
  await expect(page.locator('#direct #n')).toHaveText('n=2');
});
