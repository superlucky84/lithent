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
    it('wraps mounted and stateless components without a marker', async () => {
      const { result } = await runTransform(`
import {mount} from 'lithent';
export const App = mount(() => {return () => <Badge/>;});
export const Badge = ({label}) => <span>{label}</span>;
`);
      expect(result?.code).toContain('__lithentWrapComponent("App", mount(');
      expect(result?.code).toContain('__lithentWrapComponent("Badge",');
    });
    it('supports stateless-only files with an explicit marker', async () => {
      const { result, warnings } = await runTransform(`
/* lithent:hmr-boundary Card */
export function Card({title}, children) {return <article>{title}{children}</article>;}
`);
      expect(result?.code).toContain(
        'Card = __lithentWrapComponent("Card", Card)'
      );
      expect(result?.code).not.toContain('/* lithent:hmr-boundary');
      expect(warnings).not.toHaveBeenCalled();
    });
    it('does not reinject bootstrap code on a second transform', async () => {
      const first = await runTransform('export const Badge = () => <span/>;');
      const second = await runTransform(first.result!.code);
      expect(second.result).toBeNull();
    });
    it('skips unrelated files', async () => {
      expect((await runTransform('export const value = 1;')).result).toBeNull();
      expect(
        (
          await runTransform(
            'export const Badge = () => <span/>;',
            '/src/style.css'
          )
        ).result
      ).toBeNull();
    });
    it('keeps template compilation ahead of HMR', async () => {
      const plugins = await flattenPluginOption(
        lithentVitePlugin({ template: true })
      );
      expect(plugins.map(plugin => plugin.name)).toEqual([
        'lithent:template-vite',
        'lithent:hmr-boundary',
      ]);
    });
  });
}
