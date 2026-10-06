import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as core from 'lithent';
import { h, mount, mountCallback, render } from 'lithent';
import { defineElement } from '@/index';

/**
 * Phase 8 — hardening: the paths the per-feature suites do not walk.
 * Invalid JSON for Object props is covered in element-attributes.test.ts.
 */

const concurrent = process.env.LITHENT_CORE === 'concurrent';

const log: string[] = [];
const reported: string[] = [];
const onError = (e: ErrorEvent) => {
  reported.push(e.error?.message);
  e.preventDefault();
};

beforeEach(async () => {
  document.body.innerHTML = '';
  await new Promise<void>(resolve => queueMicrotask(resolve));
  log.length = 0;
  reported.length = 0;
  window.addEventListener('error', onError);
});
afterEach(() => window.removeEventListener('error', onError));

const nextTask = () => new Promise<void>(resolve => setTimeout(resolve, 0));
const microtask = () => new Promise<void>(resolve => queueMicrotask(resolve));

const tracked = (name: string, body: () => ReturnType<typeof h>) =>
  mount(() => {
    mountCallback(() => {
      log.push(`mount ${name}`);
      return () => log.push(`unmount ${name}`);
    });
    return body;
  });

describe('a component that throws on mount', () => {
  it('reports the error, stays unmounted, ignores updates, and mounts on retry', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    let fail = true;
    const Boom = mount(() => {
      if (fail) throw new Error('setup boom');
      return () => h('p', {}, 'ok');
    });
    defineElement('hd-boom', Boom, { props: { label: String } });
    const el = document.createElement('hd-boom');

    // Custom element reactions report exceptions instead of throwing.
    expect(() => document.body.appendChild(el)).not.toThrow();
    expect(reported).toEqual(['setup boom']);
    expect(el.shadowRoot!.innerHTML).toBe('');

    el.setAttribute('label', 'x');
    await nextTask();
    expect(el.shadowRoot!.innerHTML).toBe('');
    expect(reported).toEqual(['setup boom']);

    fail = false;
    el.remove();
    await nextTask();
    document.body.appendChild(el);
    expect(el.shadowRoot!.innerHTML).toBe('<p>ok</p>');
    consoleError.mockRestore();
  });
});

describe('repeated connect and disconnect', () => {
  const Item = tracked('item', () => h('b', {}, 'x'));
  defineElement('hd-cycle', Item, { styles: ['b{}'] });

  it('balances 100 mounts and unmounts without piling up DOM or styles', async () => {
    const el = document.createElement('hd-cycle');
    for (let i = 0; i < 100; i++) {
      document.body.appendChild(el);
      el.remove();
      await microtask();
    }
    expect(log.filter(e => e === 'mount item').length).toBe(100);
    expect(log.filter(e => e === 'unmount item').length).toBe(100);

    document.body.appendChild(el);
    const root = el.shadowRoot!;
    expect(root.querySelectorAll('b').length).toBe(1);
    expect(root.querySelectorAll('style').length).toBe(1);
  });

  it('keeps one instance through 100 moves in one task', async () => {
    document.body.innerHTML = '<div id="a"></div><div id="b"></div>';
    const a = document.getElementById('a')!;
    const b = document.getElementById('b')!;
    const el = document.createElement('hd-cycle');
    a.appendChild(el);
    for (let i = 0; i < 100; i++) {
      (i % 2 ? a : b).appendChild(el);
      el.remove();
      (i % 2 ? b : a).appendChild(el);
    }
    await nextTask();
    expect(log).toEqual(['mount item']);
    expect(el.shadowRoot!.querySelectorAll('b').length).toBe(1);
  });
});

describe('elements inside elements', () => {
  type InnerProps = { options?: unknown; label?: string; host: HTMLElement };
  const seen: unknown[] = [];
  const Inner = mount<InnerProps>((_r, props) => {
    mountCallback(() => {
      log.push('mount inner');
      return () => log.push('unmount inner');
    });
    return () => {
      seen.push(props.options);
      return h('span', {}, props.label ?? '-');
    };
  });
  defineElement('hd-inner', Inner, {
    props: { options: Object, label: String },
  });

  const options = { deep: [1, 2] };
  const Outer = tracked('outer', () =>
    h('div', {}, h('hd-inner', { options, label: 'from outer' }))
  );
  defineElement('hd-outer', Outer);

  it('passes objects to an inner element by reference through lithent props', () => {
    seen.length = 0;
    document.body.innerHTML = '<hd-outer></hd-outer>';
    const inner = document
      .querySelector('hd-outer')!
      .shadowRoot!.querySelector('hd-inner')!;

    expect(inner.shadowRoot!.textContent).toBe('from outer');
    // lithent assigns a prop through the element's accessor when one exists,
    // so the object arrives as is instead of as "[object Object]".
    expect(seen[seen.length - 1]).toBe(options);
  });

  it('unmounts the inner element when the outer one is removed', async () => {
    document.body.innerHTML = '<hd-outer></hd-outer>';
    expect(log.sort()).toEqual(['mount inner', 'mount outer']);

    document.querySelector('hd-outer')!.remove();
    await nextTask();
    expect(log.filter(e => e.startsWith('unmount')).sort()).toEqual([
      'unmount inner',
      'unmount outer',
    ]);
  });
});

/**
 * R-4: low-priority renders (`deferRender`) on the concurrent core run as
 * tasks, after the microtask that destroys a removed element.
 */
describe.runIf(concurrent)('concurrent core: deferred renders (R-4)', () => {
  const { deferRender, whenIdle } = core as unknown as {
    deferRender: (scope: () => void) => void;
    whenIdle: () => Promise<void>;
  };
  const control: { bump: () => void } = { bump: () => {} };
  const Heavy = mount(renew => {
    let n = 0;
    control.bump = () =>
      deferRender(() => {
        n++;
        renew();
      });
    mountCallback(() => {
      log.push('mount heavy');
      return () => log.push('unmount heavy');
    });
    return () =>
      h(
        'ul',
        {},
        Array.from({ length: 300 }, (_, i) => h('li', { key: i }, `${n}:${i}`))
      );
  });
  defineElement('hd-heavy', Heavy);

  it('drops a deferred render when the element is removed before it runs', async () => {
    const el = document.createElement('hd-heavy');
    document.body.appendChild(el);
    control.bump();
    el.remove();
    await whenIdle();
    await nextTask();

    expect(log).toEqual(['mount heavy', 'unmount heavy']);
    expect(el.shadowRoot!.childNodes.length).toBe(0);
    expect(reported).toEqual([]);
  });

  it('drops a deferred render already started when the element is removed', async () => {
    const el = document.createElement('hd-heavy');
    document.body.appendChild(el);
    control.bump();
    await nextTask();
    el.remove();
    await whenIdle();
    await nextTask();

    expect(log).toEqual(['mount heavy', 'unmount heavy']);
    expect(el.shadowRoot!.childNodes.length).toBe(0);
    expect(reported).toEqual([]);
  });

  it('commits a deferred render in the new place after a move', async () => {
    document.body.innerHTML = '<div id="a"></div><div id="b"></div>';
    const el = document.createElement('hd-heavy');
    document.getElementById('a')!.appendChild(el);
    control.bump();
    el.remove();
    document.getElementById('b')!.appendChild(el);
    await whenIdle();

    expect(log).toEqual(['mount heavy']);
    expect(el.shadowRoot!.querySelector('li')!.textContent).toBe('1:0');
    expect(el.parentElement!.id).toBe('b');
  });
});

describe('a lithent host that renders the tag before the widget is defined', () => {
  it('passes objects and false as properties after the definition (B-2)', async () => {
    type LateProps = { options?: unknown; open: boolean; host: HTMLElement };
    const seen: { options?: unknown; open: boolean }[] = [];
    const Widget = mount<LateProps>((_r, props) => () => {
      seen.push({ options: props.options, open: props.open });
      return h('i', {}, '');
    });

    const control: { set: (o: unknown, open: boolean) => void } = {
      set: () => {},
    };
    const Host = mount(renew => {
      let options: unknown = { first: true };
      let open = true;
      control.set = (o, next) => {
        options = o;
        open = next;
        renew();
      };
      return () => h('hd-late', { options, open });
    });
    const wrap = document.createElement('div');
    document.body.appendChild(wrap);
    render(h(Host, {}), wrap);

    // The widget script arrives later.
    defineElement('hd-late', Widget, {
      props: { options: Object, open: Boolean },
    });
    const next = { second: true };
    control.set(next, false);
    await nextTask();

    expect(seen[seen.length - 1]).toEqual({ options: next, open: false });
    expect(seen[seen.length - 1].options).toBe(next);
  });
});
