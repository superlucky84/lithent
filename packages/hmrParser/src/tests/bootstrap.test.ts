// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { transformWithEsbuild } from 'vite';
import { transformWithoutMarker } from '../noMarkerParse';

const compile = async (source: string) => {
  const transformed = transformWithoutMarker({
    code: source,
    boundaryImportSpecifier: 'lithent/devHelper',
    tagFunctionImportSpecifier: 'lithent',
  });
  return (
    await transformWithEsbuild(
      transformed.code.replaceAll('import.meta', '__meta'),
      'Component.tsx',
      { format: 'cjs', jsx: 'automatic', jsxImportSource: 'lithent' }
    )
  ).code;
};

const runtime = () => {
  const data: Record<string, any> = {};
  const boundaries = new Map<string, any>();
  const hot = {
    data,
    accept: vi.fn(),
    dispose: vi.fn(),
    prune: vi.fn(),
    invalidate: vi.fn(),
  };
  const createBoundary = vi.fn(
    (id: string, failure: (reason: string) => void, applied: () => void) => {
      const boundary = {
        register: vi.fn(() => vi.fn()),
        update: vi.fn(() => true),
        dispose: vi.fn(),
        failure,
        applied,
      };
      boundaries.set(id, boundary);
      return boundary;
    }
  );
  const libraries: Record<string, any> = {
    lithent: {
      getComponentKey: () => null,
      mountCallback: vi.fn(),
      componentMap: new WeakMap(),
      render: vi.fn(() => vi.fn()),
    },
    'lithent/devHelper': { createBoundary },
    'lithent/jsx-runtime': {
      jsx: (tag: string, props: any) => ({ tag, ...props }),
    },
  };
  const load = async (
    source: string,
    url = 'http://localhost/Component.tsx',
    hmr = true
  ) => {
    const exports = {};
    const module = { exports };
    new Function(
      'require',
      'module',
      'exports',
      '__meta',
      await compile(source)
    )((name: string) => libraries[name], module, exports, {
      url,
      hot: hmr ? hot : undefined,
    });
    return module.exports as Record<string, any>;
  };
  return { hot, load, boundaries, createBoundary, libraries };
};

const badge = (label: string) =>
  `export const Badge = () => <span>${label}</span>;`;

describe('HMR component proxies and invalidation budget', () => {
  it('refreshes existing imports and keeps per-component identities', async () => {
    const r = runtime();
    const first = await r.load(
      badge('first') + '\nexport const Card = () => <div/>;'
    );
    const accept = r.hot.accept.mock.calls[0][0];
    r.hot.dispose.mock.calls[0][0](r.hot.data);
    const next = await r.load(
      badge('next') + '\nexport const Card = () => <article/>;',
      'http://localhost/Component.tsx?t=1'
    );
    accept(next);
    expect(next.Badge).toBe(first.Badge);
    expect(next.Card).toBe(first.Card);
    expect(first.Badge({}, [])).toEqual({ tag: 'span', children: 'next' });
    expect(first.Card({}, [])).toEqual({ tag: 'article' });
    expect(r.createBoundary).toHaveBeenCalledTimes(2);
    expect(
      r.boundaries.get('/Component.tsx#Badge').update
    ).toHaveBeenCalledTimes(1);
    expect(
      r.boundaries.get('/Component.tsx#Card').update
    ).toHaveBeenCalledTimes(1);
    expect(r.hot.invalidate).not.toHaveBeenCalled();
  });

  it('does not reset failed replacement counts on dispose or sibling success', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const r = runtime();
    const url = 'http://localhost/failure-budget.tsx';
    let exports = await r.load(
      badge('first') + '\nexport const Card = () => <div/>;',
      url
    );
    const boundary = r.boundaries.get('/failure-budget.tsx#Badge');
    for (let i = 0; i < 6; i++) {
      const accept = r.hot.accept.mock.lastCall![0];
      r.hot.dispose.mock.lastCall![0](r.hot.data);
      exports = await r.load(
        badge('next') + '\nexport const Card = () => <div/>;',
        url + '?t=' + i
      );
      accept(exports);
      r.boundaries.get('/failure-budget.tsx#Card').applied();
      boundary.failure('failed DOM');
    }
    expect(r.hot.invalidate).toHaveBeenCalledTimes(2);
    boundary.applied();
    boundary.failure('after recovery');
    expect(r.hot.invalidate).toHaveBeenCalledTimes(3);
    r.hot.prune.mock.lastCall![0]();
    warn.mockRestore();
  });

  it('invalidates removed components instead of accepting stale registrations', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const r = runtime();
    await r.load(badge('first'), 'http://localhost/removed.tsx');
    const accept = r.hot.accept.mock.lastCall![0];
    r.hot.dispose.mock.lastCall![0](r.hot.data);
    const next = await r.load(
      'export const value = 1;',
      'http://localhost/removed.tsx?t=1'
    );
    accept(next);
    expect(r.hot.invalidate).toHaveBeenCalledTimes(1);
    expect(
      r.boundaries.get('/removed.tsx#Badge').update
    ).not.toHaveBeenCalled();
    r.hot.prune.mock.lastCall![0]();
    warn.mockRestore();
  });

  it('keeps meaningful URL queries distinct while discarding HMR timestamps', async () => {
    const first = runtime();
    const second = runtime();
    await first.load(
      badge('first'),
      'http://localhost/Component.tsx?variant=one&t=1'
    );
    await second.load(
      badge('second'),
      'http://localhost/Component.tsx?variant=two&t=2'
    );
    expect([...first.boundaries.keys()]).toEqual([
      '/Component.tsx?variant=one#Badge',
    ]);
    expect([...second.boundaries.keys()]).toEqual([
      '/Component.tsx?variant=two#Badge',
    ]);
  });

  it('propagates changed non-component exports and export aliases', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    for (const nextSource of [
      badge('next') + '\nexport const value = 2;',
      badge('next') + '\nexport const value = 1; export {Badge as NewName};',
      badge('next') + '\nexport const value = 1;',
    ]) {
      const r = runtime();
      await r.load(
        badge('first') + '\nexport const value = 1; export {Badge as OldName};'
      );
      const accept = r.hot.accept.mock.lastCall![0];
      r.hot.dispose.mock.lastCall![0](r.hot.data);
      accept(await r.load(nextSource));
      expect(r.hot.invalidate).toHaveBeenCalledTimes(1);
      expect(
        r.boundaries.get('/Component.tsx#Badge').update
      ).not.toHaveBeenCalled();
      r.hot.prune.mock.lastCall![0]();
    }
    warn.mockRestore();
  });

  it('accepts component edits with unchanged primitive exports', async () => {
    const r = runtime();
    await r.load(badge('first') + '\nexport const value = 1;');
    const accept = r.hot.accept.mock.lastCall![0];
    r.hot.dispose.mock.lastCall![0](r.hot.data);
    accept(await r.load(badge('next') + '\nexport const value = 1;'));
    expect(r.hot.invalidate).not.toHaveBeenCalled();
    expect(
      r.boundaries.get('/Component.tsx#Badge').update
    ).toHaveBeenCalledTimes(1);
  });

  it('keeps propagating intentional export changes beyond the failure retry limit', async () => {
    const r = runtime();
    await r.load(badge('first') + '\nexport const value = 0;');
    for (let value = 1; value <= 5; value++) {
      const accept = r.hot.accept.mock.lastCall![0];
      r.hot.dispose.mock.lastCall![0](r.hot.data);
      accept(await r.load(badge('next') + `\nexport const value = ${value};`));
    }
    expect(r.hot.invalidate).toHaveBeenCalledTimes(5);
    r.hot.prune.mock.lastCall![0]();
  });

  it('wraps hoisted functions before their first top-level use', async () => {
    const r = runtime();
    const first = await r.load(`
export const reference = Badge;
export function Badge() {return <span>first</span>;}
`);
    const accept = r.hot.accept.mock.lastCall![0];
    r.hot.dispose.mock.lastCall![0](r.hot.data);
    const next = await r.load(`
export const reference = Badge;
export function Badge() {return <span>next</span>;}
`);
    accept(next);
    expect(first.reference).toBe(first.Badge);
    expect(first.reference({}, []).children).toBe('next');
  });

  it('keeps every top-level app mount, guards aliases, and leaves function mounts repeatable', async () => {
    const r = runtime();
    const source = `
import {render as attach} from 'lithent';
export const Badge = () => <span/>;
attach(Badge, 'first');
attach(Badge, 'second');
export function attachMore(target) {return attach(Badge, target);}
`;
    const first = await r.load(source);
    const renderer = r.libraries.lithent.render;
    expect(renderer).toHaveBeenCalledTimes(2);
    const firstDispose = renderer.mock.results[0].value;
    const secondDispose = renderer.mock.results[1].value;
    first.attachMore('third');
    first.attachMore('fourth');
    expect(renderer).toHaveBeenCalledTimes(4);
    r.hot.dispose.mock.lastCall![0](r.hot.data);
    await r.load(source);
    expect(renderer).toHaveBeenCalledTimes(4);
    r.hot.prune.mock.lastCall![0]();
    expect(firstDispose).toHaveBeenCalledTimes(1);
    expect(secondDispose).toHaveBeenCalledTimes(1);
    expect(firstDispose.mock.invocationCallOrder[0]).toBeLessThan(
      r.boundaries.get('/Component.tsx#Badge').dispose.mock
        .invocationCallOrder[0]
    );
  });

  it('preserves ordinary render helpers, local boundary helpers and SSR mounts', async () => {
    const r = runtime();
    const source = `
import {render as attach} from 'lithent';
const createBoundary = () => 'local';
function render(value) {return value;}
export const Badge = () => <span/>;
export const result = render(createBoundary());
attach(Badge, 'first');
attach(Badge, 'second');
`;
    const first = await r.load(source, undefined, false);
    expect(first.result).toBe('local');
    expect(r.libraries.lithent.render).toHaveBeenCalledTimes(2);
    expect(r.hot.accept).not.toHaveBeenCalled();
    expect(r.createBoundary).not.toHaveBeenCalled();
  });

  it('registers direct calls to rerender their caller and rendered tags to replace themselves', async () => {
    const r = runtime();
    const exports = await r.load(`
export const Badge = ({label}) => <span>{label}</span>;
export const Parent = props => <div>{Badge(props)}</div>;
`);
    const parentKey = { label: 'direct' };
    let key = parentKey;
    r.libraries.lithent.getComponentKey = () => key;
    r.libraries.lithent.componentMap.set(key, { ctor: exports.Parent });
    expect(exports.Parent(key, []).children.children).toBe('direct');
    expect(
      r.boundaries.get('/Component.tsx#Parent').register
    ).toHaveBeenCalledTimes(1);
    expect(
      r.boundaries.get('/Component.tsx#Badge').register
    ).toHaveBeenCalledWith(parentKey, exports.Parent);
    key = { label: 'rendered' };
    r.libraries.lithent.componentMap.set(key, { ctor: exports.Badge });
    expect(exports.Badge(key, []).children).toBe('rendered');
    expect(
      r.boundaries.get('/Component.tsx#Badge').register
    ).toHaveBeenCalledTimes(2);
    expect(
      r.boundaries.get('/Component.tsx#Badge').register
    ).toHaveBeenLastCalledWith(key, undefined);
  });
});
