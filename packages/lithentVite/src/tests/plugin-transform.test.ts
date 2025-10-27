import './polyfills';

import { vi } from 'vitest';
import type { Plugin, PluginOption, ResolvedConfig } from 'vite';
import { lithentVitePlugin, type LithentVitePluginOptions } from '../plugin';

type TransformResult = { code: string; map?: unknown } | null;

const isPlugin = (value: unknown): value is Plugin =>
  !!value &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  'name' in value;

const flattenPluginOption = async (
  option: PluginOption | Promise<PluginOption>
): Promise<Plugin[]> => {
  const resolved = await Promise.resolve(option);
  if (!resolved) return [];
  if (Array.isArray(resolved)) {
    const nested = await Promise.all(resolved.map(flattenPluginOption));
    return nested.flat();
  }
  return isPlugin(resolved) ? [resolved] : [];
};

const runTransform = async (
  source: string,
  id = '/src/App.tsx',
  options?: LithentVitePluginOptions
): Promise<{ result: TransformResult; warnings: ReturnType<typeof vi.fn> }> => {
  const plugins = await flattenPluginOption(lithentVitePlugin(options));
  const plugin = plugins.find(entry => entry.transform);

  if (!plugin) {
    throw new Error('lithentVitePlugin did not provide a transform hook');
  }

  const dispatchConfigResolved = (target: Plugin | undefined) => {
    if (!target) return;
    const hook = target.configResolved;
    const handler =
      typeof hook === 'function' ? hook : ((hook as any)?.handler ?? null);
    if (handler) {
      handler({
        isProduction: false,
      } as ResolvedConfig);
    }
  };

  // Call configResolved for every plugin (ordering matters for future arrays)
  plugins.forEach(dispatchConfigResolved);

  // Call config hook on first plugin with config method (mimic partial behaviour)
  const configHook = plugin.config;
  if (configHook) {
    const handler =
      typeof configHook === 'function'
        ? configHook
        : (configHook as any).handler;
    handler?.call(plugin);
  }

  const warn = vi.fn();
  type TransformHook = (
    this: { warn: ReturnType<typeof vi.fn> },
    code: string,
    id: string
  ) => Promise<unknown> | unknown;
  const hook = plugin.transform as
    | TransformHook
    | { handler: TransformHook }
    | undefined;
  const transformFn = typeof hook === 'function' ? hook : hook?.handler;

  if (!transformFn) {
    throw new Error('lithentVitePlugin transform hook is undefined');
  }

  const rawResult = (await transformFn.call({ warn }, source, id)) as
    | string
    | null
    | undefined
    | { code: string; map?: unknown };
  const result =
    typeof rawResult === 'string'
      ? { code: rawResult }
      : rawResult && typeof rawResult === 'object' && 'code' in rawResult
        ? {
            code: (rawResult as { code: string }).code,
            map: (rawResult as { map?: unknown }).map,
          }
        : null;

  return { result, warnings: warn };
};

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe('lithentVitePlugin transform', () => {
    it('주석 마커를 Lithent HMR 부트스트랩 코드로 치환하고 import 를 추가한다', async () => {
      const source = `
'use client';
import { render, mount } from 'lithent';

/* lithent:hmr-boundary default */

const App = mount((renew, props) => {
  return () => <div>{props.title}</div>;
});

const root = document.getElementById('root');
if (root) {
  render(<App title="hello" />, root);
}

export default App;
`;

      const { result } = await runTransform(source);

      expect(result).not.toBeNull();
      if (!result) return;

      const transformed = result.code;
      const normalized = transformed.trimStart();

      expect(normalized).toMatch(/"use client";\s*import/);
      expect(normalized).toMatch(
        /import\s*\{\s*createBoundary\s*}\s*from\s*['"]lithent\/devHelper['"];/
      );
      expect(normalized).not.toMatch(
        /import\s*type\s*\{\s*TagFunction\s*}\s*from\s*['"]lithent['"];/
      );
      expect(normalized).toContain('import.meta.hot');
      expect(normalized.indexOf('createBoundary')).toBeGreaterThan(0);
      expect(normalized).toContain(
        'const __lithentModuleId = new URL(import.meta.url).pathname;'
      );
      expect(normalized).toContain('__lithentSetupHmrHooks();');
      expect(normalized).toContain('const __lithentHmrTargets = ["App"];');
      expect(normalized).toMatch(/const\s+knownNames\s*=.*new Set\(/);
      expect(normalized).toContain('const __lithentHotComponent_App = App');
      expect(normalized).toContain(
        '__lithentModuleHotStore["App"] = __lithentHotComponent_App;'
      );
      expect(normalized).toContain('const __lithentRenderOnce =');
      expect(/__lithentRenderOnce\(\(\) =>\s*render\(/.test(normalized)).toBe(
        true
      );
      expect(normalized).not.toContain('/* lithent:hmr-boundary');
      expect(normalized.indexOf('__lithentModuleId')).toBeGreaterThan(0);
    });

    it('이미 필요한 import 가 존재할 때 중복 삽입하지 않는다', async () => {
      const source = `
"use client";
import type { TagFunction } from 'lithent';
import { createBoundary } from 'lithent/devHelper';
import { render, mount } from 'lithent';

/* lithent:hmr-boundary Counter */

export const Counter = mount((renew, props) => {
  return ({ value }: { value: number }) => <span>{value}</span>;
});
`;

      const { result } = await runTransform(source, '/src/Counter.tsx');

      expect(result).not.toBeNull();
      if (!result) return;

      const transformed = result.code;
      const normalized = transformed.trimStart();
      const boundaryImports =
        transformed.match(
          /import\s*\{\s*createBoundary\s*}\s*from\s*['"]lithent\/devHelper['"];/g
        ) ?? [];
      const tagImports =
        transformed.match(/import type { TagFunction } from 'lithent';/g) ?? [];
      const registerMatches =
        transformed.match(/counterBoundary\.register\(compKey\)/g) ?? [];
      const unregisterMatches =
        transformed.match(/mountCallback\(\(\) => \(\) => unregister\(\)\)/g) ??
        [];

      expect(boundaryImports.length).toBe(1);
      expect(tagImports.length).toBe(0);
      expect(registerMatches.length).toBe(1);
      expect(unregisterMatches.length).toBe(1);
      expect(normalized).toMatch(/const __lithentHmrTargets = \["Counter"\];/);
      expect(normalized).toMatch(/const\s+knownNames\s*=.*new Set\(/);
      expect(normalized).toContain('import.meta.hot');
      expect(normalized).toContain(
        'const __lithentHotComponent_Counter = Counter'
      );
      expect(normalized).toContain(
        '__lithentModuleHotStore["Counter"] = __lithentHotComponent_Counter;'
      );
    });

    it('MDX 소스에 wrapMdx 옵션을 적용해 mount 경계와 HMR 부트스트랩을 삽입한다', async () => {
      const mdxOutput = `
import { jsx as _jsx } from 'lithent/jsx-runtime';
import { Fragment as _Fragment } from 'lithent/jsx-runtime';

export default function MDXContent(props = {}) {
  const { components = {} } = props;
  return _jsx(_Fragment, { children: _jsx('h1', { children: 'hello' }) });
}
`;

      const { result } = await runTransform(mdxOutput, '/src/pages/hello.mdx', {
        wrapMdx: true,
      });

      expect(result).not.toBeNull();
      if (!result) return;

      const transformed = result.code;
      expect(transformed).toMatch(
        /import\s*\{\s*mount\s*}\s*from\s*['"]lithent['"];/
      );
      expect(transformed).toMatch(
        /const __LithentMdxComponent_MDXContent = mount\(\(_renew, props\) =>/
      );
      expect(transformed).toContain('return () => MDXContent(props ?? {});');
      expect(transformed).toContain('counterBoundary.register(compKey)');
      expect(transformed).toContain(
        'const __lithentHmrTargets = ["__LithentMdxComponent_MDXContent"];'
      );
      expect(transformed).toContain('__lithentSetupHmrHooks();');
    });

    it('마커 없이도 Lithent 엔트리를 감지해 HMR 부트스트랩을 삽입한다', async () => {
      const source = `
'use client';
import { render, mount } from 'lithent';

const App = mount((renew, props) => {
  return () => <div>{props.title}</div>;
});

const root = document.getElementById('root');
if (root) {
  render(<App title="auto" />, root);
}

export default App;
`;

      const { result } = await runTransform(source, '/src/App.tsx');

      expect(result).not.toBeNull();
      if (!result) return;

      const transformed = result.code;
      const normalized = transformed.trimStart();
      expect(normalized).toMatch(/"use client";\s*import/);
      expect(normalized).toMatch(
        /import\s*\{\s*createBoundary\s*}\s*from\s*['"]lithent\/devHelper['"];/
      );
      expect(normalized).not.toMatch(
        /import\s*type\s*\{\s*TagFunction\s*}\s*from\s*['"]lithent['"];/
      );
      expect(normalized).toContain('import.meta.hot');
      expect(normalized).toContain('const __lithentHmrTargets = ["App"];');
      expect(normalized).toMatch(/const\s+knownNames\s*=.*new Set\(/);
      expect(normalized).toContain('const __lithentHotComponent_App = App');
      expect(normalized).toContain(
        '__lithentModuleHotStore["App"] = __lithentHotComponent_App;'
      );
      expect(normalized).toContain('const __lithentRenderOnce =');
      expect(/__lithentRenderOnce\(\(\) =>\s*render\(/.test(normalized)).toBe(
        true
      );
      expect(normalized.indexOf('createBoundary')).toBeGreaterThan(0);
      expect(normalized.indexOf('__lithentModuleId')).toBeGreaterThan(0);
    });
  });
}
