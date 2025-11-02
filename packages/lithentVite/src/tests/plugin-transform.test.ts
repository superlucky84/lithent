import { vi } from 'vitest';
import type { Plugin, PluginOption, ResolvedConfig } from 'vite';
vi.mock('@lithent/lithent-template-vite', () => {
  const templatePlugin: Plugin = {
    name: 'lithent:template-vite',
  };
  return {
    default: () => templatePlugin,
  };
});
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
  const plugin = plugins.find(
    entry => entry.name === 'lithent:hmr-boundary' && entry.transform
  );

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

  // Call config hook on every plugin in order to mimic Vite behaviour
  plugins.forEach(current => {
    const hook = current.config;
    const handler =
      typeof hook === 'function' ? hook : ((hook as any)?.handler ?? null);
    handler?.call(
      current,
      {},
      { command: 'serve', mode: 'development', isSsrBuild: false }
    );
  });

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

      // HMR code should be injected
      expect(normalized).toContain('createBoundary');
      expect(normalized).toContain('import.meta.hot');
      expect(normalized).toContain('const __lithentHmrTargets = ["App"];');
      expect(normalized).toContain('const __lithentHotComponent_App = App');
      expect(normalized).toContain(
        '__lithentModuleHotStore["App"] = __lithentHotComponent_App;'
      );
      expect(normalized).toContain('const __lithentRenderOnce =');
      expect(normalized).toContain('__lithentSetupHmrHooks();');
      expect(/__lithentRenderOnce\(\(\) =>\s*render\(/.test(normalized)).toBe(
        true
      );
      expect(normalized).not.toContain('/* lithent:hmr-boundary');
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
      // HMR boundary and registration code should be present
      expect(normalized).toContain('createBoundary');
      expect(normalized).toContain('counterBoundary.register(compKey)');
      expect(normalized).toContain('mountCallback(() => () => unregister())');
      expect(normalized).toContain('const __lithentHmrTargets = ["Counter"];');
      expect(normalized).toContain('import.meta.hot');
      expect(normalized).toContain(
        'const __lithentHotComponent_Counter = Counter'
      );
      expect(normalized).toContain(
        '__lithentModuleHotStore["Counter"] = __lithentHotComponent_Counter;'
      );
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
      // HMR code should be injected
      expect(normalized).toContain('createBoundary');
      expect(normalized).toContain('import.meta.hot');
      expect(normalized).toContain('const __lithentHmrTargets = ["App"];');
      expect(normalized).toContain('const __lithentHotComponent_App = App');
      expect(normalized).toContain(
        '__lithentModuleHotStore["App"] = __lithentHotComponent_App;'
      );
      expect(normalized).toContain('const __lithentRenderOnce =');
      expect(normalized).toContain('__lithentSetupHmrHooks();');
      expect(/__lithentRenderOnce\(\(\) =>\s*render\(/.test(normalized)).toBe(
        true
      );
    });

    it('템플릿 옵션을 활성화하면 템플릿 플러그인을 함께 리턴한다', async () => {
      const option = lithentVitePlugin({ template: true });
      const plugins = await flattenPluginOption(option);

      expect(
        plugins.some(plugin => plugin.name === 'lithent:template-vite')
      ).toBe(true);

      const hmrPlugin = plugins.find(
        plugin => plugin.name === 'lithent:hmr-boundary'
      );
      expect(hmrPlugin).toBeDefined();

      const configHook = hmrPlugin?.config;
      const configResult =
        typeof configHook === 'function'
          ? configHook.call(
              {} as any,
              {},
              { command: 'serve', mode: 'development', isSsrBuild: false }
            )
          : (configHook as any)?.handler?.call(
              {} as any,
              {},
              { command: 'serve', mode: 'development', isSsrBuild: false }
            );

      expect(configResult).toBeDefined();
      expect(
        configResult &&
          typeof configResult === 'object' &&
          'esbuild' in (configResult as Record<string, unknown>)
      ).toBe(false);
    });
  });
}
