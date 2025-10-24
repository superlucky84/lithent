import { vi } from 'vitest';
import type { Plugin, PluginOption } from 'vite';
import { lithentVitePlugin } from '../plugin';

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
  id = '/src/App.tsx'
): Promise<{ result: TransformResult; warnings: ReturnType<typeof vi.fn> }> => {
  const plugins = await flattenPluginOption(lithentVitePlugin());
  const plugin = plugins.find(entry => entry.transform) ?? null;
  if (!plugin) {
    throw new Error('lithentVitePlugin did not provide a transform hook');
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

      expect(
        normalized.startsWith(`'use client';\nimport { createBoundary }`)
      ).toBe(true);
      expect(normalized).toContain(
        "import { createBoundary } from 'lithent/devHelper';"
      );
      expect(normalized).toContain(
        "import type { TagFunction } from 'lithent';"
      );
      expect(normalized.indexOf('createBoundary')).toBeLessThan(
        normalized.indexOf("import { render, mount } from 'lithent';")
      );
      expect(normalized).toContain(
        'const __lithentModuleId = new URL(import.meta.url).pathname;'
      );
      expect(normalized).toContain('__lithentSetupHmrHooks();');
      expect(normalized).toContain('const __lithentHmrTargets = ["default"];');
      expect(normalized).not.toContain('/* lithent:hmr-boundary');
      expect(normalized.indexOf('__lithentModuleId')).toBeGreaterThan(
        normalized.indexOf("import { render, mount } from 'lithent';")
      );
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
          /import { createBoundary } from 'lithent\/devHelper';/g
        ) ?? [];
      const tagImports =
        transformed.match(/import type { TagFunction } from 'lithent';/g) ?? [];
      const registerMatches =
        transformed.match(/counterBoundary\.register\(compKey\)/g) ?? [];
      const unregisterMatches =
        transformed.match(/mountCallback\(\(\) => \(\) => unregister\(\)\)/g) ??
        [];

      expect(boundaryImports.length).toBe(1);
      expect(tagImports.length).toBe(1);
      expect(registerMatches.length).toBe(1);
      expect(unregisterMatches.length).toBe(1);
      expect(normalized).toContain('const __lithentHmrTargets = ["Counter"];');
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
      expect(
        normalized.startsWith(`'use client';\nimport { createBoundary }`)
      ).toBe(true);
      expect(normalized).toContain(
        "import { createBoundary } from 'lithent/devHelper';"
      );
      expect(normalized).toContain(
        "import type { TagFunction } from 'lithent';"
      );
      expect(normalized).toContain('const __lithentHmrTargets = ["default"];');
      expect(normalized.indexOf('createBoundary')).toBeLessThan(
        normalized.indexOf("import { render, mount } from 'lithent';")
      );
      expect(normalized.indexOf('__lithentModuleId')).toBeGreaterThan(
        normalized.indexOf("import { render, mount } from 'lithent';")
      );
    });
  });
}
