import { test, expect } from './test';

// lithent/element DESIGN §10 R-1: a widget bundle and a host app bundle on
// the same page. Base project: two copies of the base core. Concurrent
// project: base host + concurrent widget.
test('R-1: two lithent copies on one page render and update independently', async ({
  page,
}, info) => {
  await page.goto(
    `/e2e/fixtures/element-dual.html?second=${info.project.name}`
  );
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');

  const cores = await page.evaluate(() => {
    const w = window as unknown as Record<string, Record<string, unknown>>;
    return {
      distinct: w.hostCore !== w.widgetCore,
      widgetConcurrent: 'deferRender' in w.widgetCore,
    };
  });
  expect(cores.distinct).toBe(true);
  expect(cores.widgetConcurrent).toBe(info.project.name === 'concurrent');

  const hostItems = page.locator('#host > .app > ul > .item');
  const widgetItems = page.locator('#widget-slot .item');
  const hostButton = page.locator('#host > .app > .inc');
  const widgetButton = page.locator('#widget-slot .inc');

  await expect(hostItems).toHaveText(['host:1', 'host:2', 'host:3']);
  await expect(widgetItems).toHaveText(['widget:1', 'widget:2', 'widget:3']);

  // Tag a widget node so we can tell whether host re-renders replace it.
  await page
    .locator('#widget-slot .item')
    .first()
    .evaluate(el => {
      (el as HTMLElement).dataset.mark = 'kept';
    });

  await hostButton.click();
  await expect(hostButton).toHaveText('host 1');
  await expect(hostItems).toHaveText(['host:3', 'host:2', 'host:1', 'host:4']);
  await expect(widgetItems).toHaveText(['widget:1', 'widget:2', 'widget:3']);
  await expect(page.locator('#widget-slot [data-mark="kept"]')).toHaveCount(1);

  await widgetButton.click();
  await widgetButton.click();
  await expect(widgetButton).toHaveText('widget 2');
  await expect(widgetItems).toHaveText([
    'widget:4',
    'widget:1',
    'widget:2',
    'widget:3',
    'widget:5',
  ]);
  // Keyed moves keep the tagged node rather than recreating it.
  await expect(page.locator('#widget-slot [data-mark="kept"]')).toHaveText(
    'widget:1'
  );
  await expect(hostItems).toHaveText(['host:3', 'host:2', 'host:1', 'host:4']);

  await hostButton.click();
  await expect(hostButton).toHaveText('host 2');
  await expect(widgetButton).toHaveText('widget 2');
  await expect(page.locator('#widget-slot [data-mark="kept"]')).toHaveCount(1);
});

// lithent/element Phase 9: the built UMD in a plain page, in a real browser.
// Base project: base widget core. Concurrent project: concurrent widget core.
// The host app always runs on its own base copy.
const umdPage = (core: string) => `/e2e/fixtures/element-umd.html?core=${core}`;

test.describe('lithent/element UMD in a plain page', () => {
  test.beforeEach(async ({ page }, info) => {
    await page.goto(umdPage(info.project.name));
    await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  });

  test('MT-1/R-1: renders with no build step next to a host app on another lithent copy', async ({
    page,
  }, info) => {
    const cores = await page.evaluate(() => {
      const w = window as unknown as Record<string, Record<string, unknown>>;
      return {
        distinct: w.hostCore !== w.widgetCore,
        widgetConcurrent: 'deferRender' in w.widgetCore,
        api: Object.keys(w.lithentElement).sort(),
      };
    });
    expect(cores).toEqual({
      distinct: true,
      widgetConcurrent: info.project.name === 'concurrent',
      api: ['defineElement', 'emit'],
    });

    // #early was in the HTML before definition: upgraded, with the attribute
    // and the property assigned before definition.
    await expect(page.locator('#early .amount')).toHaveText('5');
    await expect(page.locator('#early .opts')).toHaveText('{"pre":"defined"}');
    // #in-app is rendered by the host app's lithent copy.
    await expect(page.locator('#in-app .amount')).toHaveText('7');
  });

  test('MT-2: CSS is isolated in both directions', async ({ page }) => {
    const color = (selector: string, prop: 'backgroundColor' | 'color') =>
      page.locator(selector).evaluate((el, p) => getComputedStyle(el)[p], prop);

    expect(await color('.host-inc', 'backgroundColor')).toBe('rgb(255, 0, 0)');
    expect(await color('.host-p', 'color')).toBe('rgb(1, 2, 3)');
    expect(await color('#early .inc', 'backgroundColor')).toBe(
      'rgb(0, 0, 255)'
    );
    expect(await color('#early p', 'color')).toBe('rgb(0, 128, 0)');
  });

  test('FR-6: styles use one adopted sheet shared by every instance', async ({
    page,
  }) => {
    const sheets = await page.evaluate(() => {
      const a = document.getElementById('early')!.shadowRoot!;
      const b = document.getElementById('in-app')!.shadowRoot!;
      return {
        a: a.adoptedStyleSheets.length,
        b: b.adoptedStyleSheets.length,
        shared: a.adoptedStyleSheets[0] === b.adoptedStyleSheets[0],
        styleElements: a.querySelectorAll('style').length,
      };
    });
    expect(sheets).toEqual({ a: 1, b: 1, shared: true, styleElements: 0 });
  });

  test('FR-3/4/5: attributes, properties and events', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.getElementById('early') as HTMLElement & {
        options: unknown;
      };
      el.setAttribute('amount', '12');
      el.options = { later: [1, 2] };
    });
    await expect(page.locator('#early .amount')).toHaveText('12');
    await expect(page.locator('#early .opts')).toHaveText('{"later":[1,2]}');

    await page.evaluate(() => {
      (window as unknown as { paid: unknown[] }).paid = [];
      document.addEventListener('pay', e =>
        (window as unknown as { paid: unknown[] }).paid.push(
          (e as CustomEvent).detail
        )
      );
    });
    await page.locator('#early .pay').click();
    await expect(page.locator('#early .result')).toHaveText('paid');
    expect(
      await page.evaluate(() => (window as unknown as { paid: unknown[] }).paid)
    ).toEqual([{ amount: 12 }]);

    // The page cancels the event: emit returns false.
    await page.evaluate(() =>
      document
        .getElementById('in-app')!
        .addEventListener('pay', e => e.preventDefault())
    );
    await page.locator('#in-app .pay').click();
    await expect(page.locator('#in-app .result')).toHaveText('blocked');
  });

  test('a host app re-render passes new props through the element property', async ({
    page,
  }) => {
    await page.locator('#in-app .inc').click();
    await expect(page.locator('#in-app .inc')).toHaveText('count 1');

    await page.locator('.host-inc').click();
    await expect(page.locator('.host-inc')).toHaveText('host 1');
    await expect(page.locator('#in-app .amount')).toHaveText('8');
    // Same widget instance: its own state survived the host re-render.
    await expect(page.locator('#in-app .inc')).toHaveText('count 1');
  });

  test('FR-7: named slot projection', async ({ page }) => {
    const assigned = await page.evaluate(() =>
      document
        .getElementById('early')!
        .shadowRoot!.querySelector('slot')!
        .assignedNodes()
        .map(n => n.textContent)
    );
    expect(assigned).toEqual(['projected note']);
  });

  test('DC-4/MT-5: moves keep state, removal unmounts, reattach starts fresh', async ({
    page,
  }) => {
    const inc = page.locator('#early .inc');
    await inc.click();
    await inc.click();
    await expect(inc).toHaveText('count 2');

    // Single-call move, then a two-call move in one task.
    await page.evaluate(() => {
      const el = document.getElementById('early')!;
      document.getElementById('spot-b')!.appendChild(el);
      el.remove();
      document.getElementById('spot-a')!.appendChild(el);
    });
    await expect(inc).toHaveText('count 2');

    const log = () =>
      page.evaluate(
        () => (window as unknown as { widgetLog: string[] }).widgetLog
      );
    expect((await log()).filter(e => e.endsWith('early'))).toEqual([
      'mount early',
    ]);

    await page.evaluate(() => {
      const w = window as unknown as { detached: HTMLElement };
      w.detached = document.getElementById('early')!;
      w.detached.remove();
    });
    await page.waitForFunction(() =>
      (window as unknown as { widgetLog: string[] }).widgetLog.includes(
        'unmount early'
      )
    );
    // Reattached in a later task: a fresh instance.
    await page.evaluate(() =>
      document
        .getElementById('spot-b')!
        .appendChild((window as unknown as { detached: HTMLElement }).detached)
    );
    await expect(inc).toHaveText('count 0');
    expect((await log()).filter(e => e.endsWith('early'))).toEqual([
      'mount early',
      'unmount early',
      'mount early',
    ]);
  });
});

// MT-4: a React 18 app hosts the widget (React UMD, development build).
test('MT-4: a React app renders, updates, listens to and unmounts the widget', async ({
  page,
}, info) => {
  await page.goto(`/e2e/fixtures/element-react.html?core=${info.project.name}`);
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');

  // Number through the attribute React sets; object through the ref property.
  await expect(page.locator('#w .amount')).toHaveText('100');
  await expect(page.locator('#w .opts')).toHaveText('{"fromReact":"ref"}');

  // Widget state survives React re-renders that change its props.
  await page.locator('#w .inc').click();
  await expect(page.locator('#w .inc')).toHaveText('count 1');
  await page.locator('#react-inc').click();
  // Only the attribute changed on this React render: the attribute path alone
  // has to re-render the widget.
  await expect(page.locator('#w .amount')).toHaveText('200');
  await expect(page.locator('#w .inc')).toHaveText('count 1');

  // An event from inside the widget updates React state.
  await page.locator('#w .pay').click();
  await expect(page.locator('#react-paid')).toHaveText('200');

  // React unmounting the element unmounts the lithent component.
  await page.locator('#react-toggle').click();
  await expect(page.locator('#w')).toHaveCount(0);
  await page.waitForFunction(() =>
    (window as unknown as { widgetLog: string[] }).widgetLog.includes('unmount')
  );
  await page.locator('#react-toggle').click();
  await expect(page.locator('#w .inc')).toHaveText('count 0');
  expect(
    await page.evaluate(
      () => (window as unknown as { widgetLog: string[] }).widgetLog
    )
  ).toEqual(['mount', 'unmount', 'mount']);
});

// Phase 10: the docs guide and its live demo, in both languages.
test('docs: the element guide renders and its demo widget works', async ({
  page,
}, info) => {
  const origin = `http://127.0.0.1:${info.project.name === 'concurrent' ? 43135 : 43134}`;
  for (const [route, title, last] of [
    ['/guide/element', 'Custom Elements', 'Last pay event:'],
    ['/ko/guide/element', '커스텀 엘리먼트', '마지막 pay 이벤트:'],
  ]) {
    await page.goto(`${origin}/lithent/#${route}`);
    const main = page.locator('main');
    await expect(main.getByRole('heading', { level: 1 })).toContainText(title);

    const widget = main.locator('docs-pay-button button');
    await expect(widget).toHaveText('Pay 1000 KRW · 0');
    await main.getByRole('button', { name: 'amount +1000' }).click();
    await expect(widget).toHaveText('Pay 2000 KRW · 0');
    await widget.click();
    await expect(widget).toHaveText('Pay 2000 KRW · 1');
    await expect(main.getByText(last)).toContainText(
      '{"amount":2000,"clicks":1}'
    );
  }
});
