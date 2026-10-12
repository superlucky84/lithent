import { test, expect, ready } from './test';
import type { Page, TestInfo } from '@playwright/test';

const docsOrigin = (info: TestInfo) =>
  `http://127.0.0.1:${info.project.name === 'concurrent' ? 43135 : 43134}`;
const openExample = async (page: Page, info: TestInfo, language = '') => {
  const origin = docsOrigin(info);
  if (page.url().startsWith(`${origin}/lithent/`)) {
    await page.evaluate(hash => {
      location.hash = hash;
    }, `${language}/examples/22`);
  } else {
    await ready(
      page,
      `${origin}/lithent/#${language}/examples/22`,
      info.project.name
    );
  }
  await expect(page.locator('[data-lifecycle-editor]')).toBeVisible();
};

test('lifecycle docs: bilingual API, related navigation and runnable source', async ({
  page,
}, info) => {
  await ready(
    page,
    `${docsOrigin(info)}/lithent/#/guide/lifecycle`,
    info.project.name
  );
  const main = page.locator('main');
  await expect(main.getByRole('heading', { level: 1 })).toHaveText(
    'Lifecycle Helpers'
  );
  await expect(main.locator('tbody tr')).toHaveCount(9);
  await expect(main).toContainText('have not been published to npm yet');
  await expect(main).toContainText('freezeChildren defaults to false');
  await expect(main).toContainText(
    'Unsupported cores fail before initialization'
  );
  await main
    .getByRole('link', {
      name: 'Try the retained editor example →',
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/#\/examples\/22$/);
  await expect(main.locator('[data-draft]')).toBeVisible();
  await main.getByText('Show full source', { exact: true }).click();
  await expect(main.locator('code')).toContainText("from 'lithent/helper'");
  await expect(main.locator('code')).toContainText(
    "createScopedTask(scope, 'instance')"
  );
  await page.getByRole('button', { name: 'KO', exact: true }).click();
  await expect(page).toHaveURL(/#\/ko\/examples\/22$/);
  await expect(main.getByRole('heading', { level: 1 })).toHaveText(
    '보존 편집기와 작업 수명'
  );
  await main
    .getByRole('link', {
      name: '수명 관리 API와 Concurrent 지원 조건 →',
      exact: true,
    })
    .click();
  await expect(main.getByRole('heading', { level: 1 })).toHaveText(
    '수명 관리 헬퍼'
  );
  await expect(main.locator('tbody tr')).toHaveCount(9);
  await expect(main).toContainText('아직 npm에 배포하지 않았습니다');
  await expect(main).toContainText('freezeChildren의 기본값은 false');
  await main
    .getByRole('link', { name: 'Concurrent 설정과 스케줄링 →', exact: true })
    .click();
  await main
    .getByRole('link', { name: '수명 관리·보존·지원 조건 →', exact: true })
    .click();
  await expect(page).toHaveURL(/#\/ko\/guide\/lifecycle$/);
  await main
    .getByRole('link', { name: 'Custom Element 연결 →', exact: true })
    .click();
  await main
    .getByRole('link', { name: '보존 host와 수명 관리 가이드 →', exact: true })
    .click();
  await expect(page).toHaveURL(/#\/ko\/guide\/lifecycle$/);
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page).toHaveURL(/#\/guide\/lifecycle$/);
  await expect(
    page
      .locator('aside nav')
      .getByRole('link', { name: 'Lifecycle Helpers', exact: true })
  ).toBeVisible();
});

test('lifecycle docs: retain draft, expire activity work, save while hidden and dispose', async ({
  page,
}, info) => {
  await page.clock.install();
  for (const language of ['', '/ko']) {
    await openExample(page, info, language);
    const demo = page.locator('[data-lifecycle-demo]');
    const draft = demo.locator('[data-draft]');
    const original = await draft.elementHandle();
    await draft.fill('first');
    await draft.fill('second');
    await demo.locator('[data-search-a]').click();
    await demo.locator('[data-search-b]').click();
    await page.clock.fastForward(200);
    await expect(demo.locator('[data-result]')).toHaveText(/ B$/);
    await page.clock.fastForward(1200);
    await expect(demo.locator('[data-result]')).toHaveText(/ B$/);

    await demo.locator('[data-save]').click();
    await demo.locator('[data-toggle]').click();
    await expect(draft).toBeHidden();
    const ticks = await demo.locator('[data-ticks]').textContent();
    await page.clock.fastForward(2500);
    await expect(demo.locator('[data-ticks]')).toHaveText(ticks!);
    await demo.locator('[data-toggle]').click();
    await expect(demo.locator('[data-saved]')).toHaveText('second');
    expect(
      await draft.evaluate((node, previous) => node === previous, original)
    ).toBe(true);
    await demo.locator('[data-undo]').click();
    await expect(draft).toHaveValue('first');
    await page.clock.fastForward(1100);
    expect(
      Number(await demo.locator('[data-ticks]').textContent())
    ).toBeGreaterThan(Number(ticks));

    await demo.locator('[data-search-a]').click();
    await demo.locator('[data-toggle]').click();
    await demo.locator('[data-toggle]').click();
    await expect(demo.locator('[data-pending]')).toHaveText(
      language ? '검색 대기' : 'Search idle'
    );
    await page.clock.fastForward(1300);
    await expect(demo.locator('[data-result]')).toHaveText(/ B$/);
    await demo.locator('[data-search-a]').click();
    await demo.locator('[data-remove]').click();
    await page.clock.fastForward(1500);
    await expect(demo.locator('[data-lifecycle-editor]')).toHaveCount(0);
    await demo.locator('[data-remove]').click();
    await expect(draft).toHaveValue('');
    await expect(demo.locator('[data-instance]')).toHaveText('2');
  }
});

test('lifecycle docs: route and language changes clear owned timers', async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const timers = window as unknown as {
      setInterval(
        handler: TimerHandler,
        delay?: number,
        ...args: unknown[]
      ): number;
      setTimeout(
        handler: TimerHandler,
        delay?: number,
        ...args: unknown[]
      ): number;
      clearInterval(id?: number): void;
      clearTimeout(id?: number): void;
    };
    const intervals = new Set<number>();
    const timeouts = new Set<number>();
    const interval = timers.setInterval.bind(window);
    const timeout = timers.setTimeout.bind(window);
    const clearInterval = timers.clearInterval.bind(window);
    const clearTimeout = timers.clearTimeout.bind(window);
    timers.setInterval = (handler, delay, ...args) => {
      const id = interval(handler, delay, ...args);
      if (delay === 1000) intervals.add(id);
      return id;
    };
    timers.clearInterval = id => {
      if (id !== undefined) intervals.delete(id);
      clearInterval(id);
    };
    timers.setTimeout = (handler, delay, ...args) => {
      let id: number;
      const tracked = [150, 700, 1200].includes(delay ?? 0);
      const callback =
        typeof handler === 'function'
          ? () => {
              timeouts.delete(id);
              handler(...args);
            }
          : handler;
      id = timeout(callback, delay, ...args);
      if (tracked) timeouts.add(id);
      return id;
    };
    timers.clearTimeout = id => {
      if (id !== undefined) timeouts.delete(id);
      clearTimeout(id);
    };
    (
      window as unknown as { lifecycleTimerCounts: () => number[] }
    ).lifecycleTimerCounts = () => [intervals.size, timeouts.size];
  });
  const counts = () =>
    page.evaluate(() =>
      (
        window as unknown as { lifecycleTimerCounts: () => number[] }
      ).lifecycleTimerCounts()
    );
  await openExample(page, info);
  const demo = page.locator('[data-lifecycle-demo]');
  await expect.poll(counts).toEqual([1, 0]);
  await demo.locator('[data-draft]').fill('leave');
  await demo.locator('[data-search-a]').click();
  await demo.locator('[data-save]').click();
  await expect.poll(counts).toEqual([1, 2]);
  await page.getByRole('button', { name: 'KO', exact: true }).click();
  await expect(page).toHaveURL(/#\/ko\/examples\/22$/);
  await expect(demo.locator('[data-draft]')).toHaveValue('');
  await expect.poll(counts).toEqual([1, 0]);
  await demo.locator('[data-search-a]').click();
  await page
    .locator('main')
    .getByRole('link', {
      name: '수명 관리 API와 Concurrent 지원 조건 →',
      exact: true,
    })
    .click();
  await expect.poll(counts).toEqual([0, 0]);
  await page.waitForTimeout(1300);
  await expect(demo).toHaveCount(0);
});
